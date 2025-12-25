import requests
import json
import uuid
import os
import re
import time
import warnings
import urllib3
from django.conf import settings
from django.utils import timezone
import pytesseract
from PIL import Image

warnings.filterwarnings('ignore', category=urllib3.exceptions.InsecureRequestWarning)

import logging
logger = logging.getLogger(__name__)


class GigaChatService:
    def __init__(self):
        self.auth_url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
        self.api_url = "https://gigachat.devices.sberbank.ru/api/v1"
        self.authorization_key = settings.GIGACHAT_AUTHORIZATION_KEY
        self.access_token = None
        self.token_expiry = None

    def _get_access_token(self):
        logger.info("🔄 Запрашиваем новый токен GigaChat...")
        if not self.authorization_key:
            raise ValueError("GIGACHAT_AUTHORIZATION_KEY не установлен")

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'RqUID': str(uuid.uuid4()),
            'Authorization': f'Basic {self.authorization_key}'
        }

        try:
            session = requests.Session()
            session.verify = False
            response = session.post(
                self.auth_url,
                headers=headers,
                data={'scope': 'GIGACHAT_API_PERS'},
                timeout=30
            )

            if response.status_code != 200:
                raise Exception(f"GigaChat auth error: {response.status_code}")

            data = response.json()
            self.access_token = data.get('access_token')
            self.token_expiry = timezone.now() + timezone.timedelta(minutes=25)
            logger.info(f"✅ Токен получен")
            return self.access_token

        except Exception as e:
            logger.error(f"❌ Ошибка получения токена: {e}", exc_info=True)
            raise

    def ensure_valid_token(self):
        current_time = timezone.now()
        if not self.access_token or not self.token_expiry or self.token_expiry <= current_time:
            return self._get_access_token()
        return self.access_token

    def analyze_medical_data(self, text_data, file_type="text", file_name=None, timeout=30):
        logger.info(f"🔍 Начинаем анализ через GigaChat, таймаут: {timeout} сек")
        try:
            token = self.ensure_valid_token()
            if not token:
                return self._get_fallback_response("Ошибка аутентификации")

            prompt = f"""ТЫ — ВРАЧ-ЛАБОРАНТ. Проанализируй ЭТИ ЛАБОРАТОРНЫЕ ДАННЫЕ:

{text_data[:1200]}

ОПРЕДЕЛИ:
1. Есть ли отклонения от нормы?
2. Какие заболевания или состояния возможны (анемия, воспаление, дефицит витаминов и т.д.)?
3. Дай рекомендации.

❗️ЕСЛИ ДАННЫЕ — это текстовое описание (например, рентген, УЗИ, КТ), то определи возможные диагнозы на основе описания.
Либо ты увидел где-то слово "Заключение", значит это диагноз
ВЕРНИ ОТВЕТ ТОЛЬКО В ФОРМАТЕ JSON С ТАКИМИ ПОЛЯМИ:
1. summary: краткое резюме анализа
2. detected_conditions: список найденных медицинских состояний
3. recommendations: рекомендации для пациента
4. confidence: общая уверенность анализа от 0 до 1

ПРИМЕР ОТВЕТА:
{{"summary": "обнаружены признаки анемии", "detected_conditions": [{{"condition_name": "анемия", "code": "D64.9", "confidence": 0.8, "severity": "medium"}}], "recommendations": "консультация гематолога", "confidence": 0.8}}"""

            headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
            payload = {
                "model": "GigaChat",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 1000
            }

            session = requests.Session()
            session.verify = False
            start_time = time.time()

            response = session.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=(5, timeout)
            )
            elapsed_time = time.time() - start_time
            logger.info(f"📥 GigaChat ответил за {elapsed_time:.1f} секунд")

            if response.status_code != 200:
                return self._get_fallback_response(f"Ошибка API: {response.status_code}")

            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
            logger.info(f"📄 Сырой ответ GigaChat: {content[:200]}...")

            cleaned = content.strip()
            if cleaned.startswith('```'):
                lines = cleaned.split('\n')
                if len(lines) > 2:
                    cleaned = '\n'.join(lines[1:-1])
            if cleaned.lower().startswith('json'):
                cleaned = cleaned[4:].strip()

            try:
                analysis_result = json.loads(cleaned)
            except json.JSONDecodeError:
                match = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if match:
                    try:
                        analysis_result = json.loads(match.group())
                    except:
                        analysis_result = self._create_fallback_from_text(content, text_data)
                else:
                    analysis_result = self._create_fallback_from_text(content, text_data)

            if not isinstance(analysis_result, dict):
                analysis_result = {}

            analysis_result.setdefault('summary', 'Анализ выполнен')
            analysis_result.setdefault('detected_conditions', [])
            analysis_result.setdefault('recommendations', 'Рекомендуется консультация врача')
            analysis_result.setdefault('confidence', 0.5)

            if not analysis_result['detected_conditions'] and 'conditions' in analysis_result:
                analysis_result['detected_conditions'] = analysis_result.pop('conditions')

            valid_conditions = []
            for cond in analysis_result['detected_conditions']:
                if isinstance(cond, dict):
                    name = cond.get('condition_name') or cond.get('name')
                    if name:
                        valid_conditions.append({
                            'condition_name': name,
                            'code': cond.get('code', 'UNKNOWN'),
                            'confidence': float(cond.get('confidence', 0.5)),
                            'severity': cond.get('severity', 'medium')
                        })

            analysis_result['detected_conditions'] = valid_conditions
            logger.info(f"✅ Анализ готов. Состояний: {len(valid_conditions)}")
            return analysis_result

        except requests.exceptions.Timeout:
            return self._get_timeout_response(text_data)
        except Exception as e:
            logger.error(f"❌ Ошибка: {e}")
            return self._get_fallback_response(str(e))

    def _get_fallback_response(self, reason):
        return {
            "summary": f"Анализ не выполнен: {reason}",
            "detected_conditions": [],
            "recommendations": "Попробуйте загрузить файл снова",
            "confidence": 0.0,
            "error": reason
        }

    def _create_fallback_from_text(self, giga_response, original_text):
        return {
            'summary': giga_response[:200] if giga_response else "Анализ выполнен",
            'detected_conditions': [],
            'recommendations': 'Требуется консультация врача',
            'confidence': 0.3
        }
    
    def _extract_from_image(self, file_path):
        """Извлечение текста из изображения с помощью Tesseract OCR"""
        logger.info(f"🖼️ Распознавание текста на изображении: {file_path}")
        
        try:
            from PIL import Image
            import pytesseract
            
            img = Image.open(file_path)
            
            # Распознаём текст (русский + английский)
            text = pytesseract.image_to_string(img, lang='rus+eng')
            
            if text.strip():
                logger.info("✅ Текст успешно распознан")
                return text[:3000]
            else:
                logger.warning("⚠️ Текст на изображении не распознан")
                return "Изображение не содержит распознаваемого текста"
                
        except Exception as e:
            logger.error(f"❌ Ошибка OCR: {e}")
            return f"Ошибка распознавания изображения: {str(e)}"

    def _get_timeout_response(self, text_data):
        return {
            'summary': 'Анализ прерван по времени',
            'detected_conditions': [],
            'recommendations': 'Требуется повторный анализ',
            'confidence': 0.4,
            'error': 'timeout'
        }

    def extract_text_from_file(self, file_path, mime_type):
        logger.info(f"📖 Извлечение текста из файла: {file_path}, тип: {mime_type}")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Файл не найден: {file_path}")

        try:
            if mime_type == 'application/pdf':
                return self._extract_from_pdf(file_path)
            elif mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return self._extract_from_docx(file_path)
            elif mime_type in ['text/plain', 'text/html']:
                return self._extract_from_text(file_path)
            elif mime_type.startswith('image/'):
                return self._extract_from_image(file_path)
            else:
                ext = os.path.splitext(file_path)[1].lower()
                if ext == '.pdf':
                    return self._extract_from_pdf(file_path)
                elif ext in ['.docx', '.doc']:
                    return self._extract_from_docx(file_path)
                elif ext in ['.txt', '.html', '.htm']:
                    return self._extract_from_text(file_path)
                elif ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                    return self._extract_from_image(file_path)
                else:
                    return f"Файл формата {mime_type}. Не удалось извлечь текст."
        except Exception as e:
            logger.error(f"❌ Ошибка извлечения текста: {e}")
            return f"Ошибка обработки файла: {e}"

    def _extract_from_pdf(self, file_path):
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages[:10]:
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            for row in table:
                                if row and any(cell for cell in row if cell):
                                    text += " | ".join(str(cell) if cell else "" for cell in row) + "\n"
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text[:3000] or "PDF не содержит данных"
        except Exception as e:
            return f"Ошибка PDF (pdfplumber): {e}"

    def _extract_from_docx(self, file_path):
        try:
            import docx
            doc = docx.Document(file_path)
            text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
            return text[:3000] or "DOCX без текста"
        except Exception as e:
            return f"Ошибка DOCX: {e}"

    def _extract_from_text(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()[:3000]
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='cp1251') as f:
                    return f.read()[:3000]
            except:
                return "Текстовый файл не прочитан"
        except Exception as e:
            return f"Ошибка текста: {e}"