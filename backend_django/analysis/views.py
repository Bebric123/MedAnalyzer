from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import os
import uuid
import logging
import json
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

from files.models import MedicalFile
from .models import AnalysisSession, AnalysisResult, DetectedCondition
from diseases.models import DiseaseRecord
from .validators import validate_file
from .services.gigachat_service import GigaChatService

logger = logging.getLogger(__name__)


def _analyze_with_gigachat(medical_file, session):
    logger.critical("🔥 _analyze_with_gigachat ВЫЗВАНА!")
    try:
        logger.info(f"Начинаем анализ файла: {medical_file.filename}")
        session.status = 'in_progress'
        session.save(update_fields=['status'])

        gigachat = GigaChatService()

        try:
            extracted_text = gigachat.extract_text_from_file(
                medical_file.storage_path,
                medical_file.mime_type
            )
            if not extracted_text or len(extracted_text.strip()) < 50:
                logger.warning("⚠️ Мало текста извлечено")
                extracted_text = f"Файл: {medical_file.filename}\nТип: {medical_file.mime_type}\nТекст не извлечён"
        except Exception as e:
            logger.error(f"❌ Ошибка извлечения текста: {e}")
            extracted_text = f"Ошибка извлечения: {str(e)[:200]}"

        analysis_result = gigachat.analyze_medical_data(
            extracted_text,
            medical_file.mime_type,
            medical_file.filename,
            timeout=20
        )

        logger.info("🟢 Начинаем сохранение результата в БД")

        raw_conditions = analysis_result.get('detected_conditions') or analysis_result.get('conditions') or []
        logger.info(f"📋 Найдено условий: {len(raw_conditions)}")

        overall_confidence = float(analysis_result.get('confidence', 0.0))
        if not overall_confidence and raw_conditions:
            confidences = [float(c.get('confidence', 0.0)) for c in raw_conditions]
            overall_confidence = max(confidences) if confidences else 0.0

        result_obj = AnalysisResult.objects.create(
            session=session,
            confidence=overall_confidence,
            result_json=analysis_result,
            recommendations=analysis_result.get('recommendations', 'Рекомендуется консультация врача.')
        )
        logger.info(f"✅ AnalysisResult сохранён: {result_obj.id}")

        saved_conditions = 0
        for cond in raw_conditions:
            confidence = float(cond.get('confidence', 0.0))
            if confidence <= 0.1:
                continue

            name = str(cond.get('condition_name') or cond.get('name') or 'Неизвестное состояние')[:255]
            code = str(cond.get('code', 'UNKNOWN') or 'UNKNOWN')[:50]
            severity = cond.get('severity', 'medium')
            if severity not in ['low', 'medium', 'high']:
                severity = 'medium'
            description = str(cond.get('description', ''))[:500]

            DetectedCondition.objects.create(
                result=result_obj,
                condition_code=code,
                condition_name=name,
                confidence=confidence,
                severity=severity,
                description=description
            )
            saved_conditions += 1
            logger.info(f"✅ Условие сохранено: {name}")

        session.status = 'completed'
        session.end_time = timezone.now()
        session.save(update_fields=['status', 'end_time'])
        logger.info(f"✅ Сессия завершена: end_time={session.end_time}")

        _update_disease_history(medical_file.user, analysis_result, str(session.id))

        logger.info("🎉 Анализ успешно сохранён в БД")
        return {
            'success': True,
            'session_id': str(session.id),
            'result_id': str(result_obj.id),
            'conditions_count': saved_conditions
        }

    except Exception as e:
        logger.error(f"💥 Ошибка в _analyze_with_gigachat: {e}", exc_info=True)
        session.status = 'failed'
        session.end_time = timezone.now()
        session.error_message = str(e)[:500]
        session.save(update_fields=['status', 'end_time', 'error_message'])
        return {'success': False, 'error': str(e), 'session_id': str(session.id)}


def _update_disease_history(user, analysis_result, session_id):
    conditions = analysis_result.get('detected_conditions') or []
    
    for condition in conditions:
        confidence = condition.get('confidence', 0.0)
        if confidence < 0.3:
            continue

        condition_name = condition.get('condition_name') or condition.get('name', 'Неизвестное состояние')
        condition_code = condition.get('code') or f"NAME_{condition_name.replace(' ', '_')}"
        condition_code = condition_code[:50] 

        DiseaseRecord.objects.update_or_create(
            user=user,
            disease_code=condition_code, 
            defaults={
                'disease_name': condition_name[:255],
                'last_analysis_id': session_id,
                'last_detected': timezone.now(),
                'is_active': True,
            }
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'Файл не загружен'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_file(file)
    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    ext = file.name.split('.')[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    user_upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', str(request.user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    full_path = os.path.join(user_upload_dir, filename)

    with open(full_path, 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    medical_file = MedicalFile.objects.create(
        user=request.user,
        filename=file.name,
        filesize=file.size,
        mime_type=file.content_type,
        storage_path=full_path,
        upload_date=timezone.now()
    )

    session = AnalysisSession.objects.create(
        file=medical_file,
        model_ml_version='GigaChat-v1.0',
        status='pending'
    )

    result = _analyze_with_gigachat(medical_file, session)

    if result['success']:
        return Response({
            'id': str(medical_file.id),
            'session_id': str(session.id),
            'message': 'Файл загружен и проанализирован',
            'model_type': 'GigaChat AI',
            'status': 'completed',
            'conditions_count': result['conditions_count']
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({
            'error': 'Ошибка анализа',
            'details': result['error']
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_analysis_result(request, file_id):
    try:
        session = AnalysisSession.objects.select_related(
            'file', 'result'
        ).prefetch_related(
            'result__detected_conditions'
        ).get(
            file_id=file_id,
            file__user=request.user
        )

        data = {
            'session_id': str(session.id),
            'status': session.status,
            'model_version': session.model_ml_version,
            'start_time': session.start_time,
            'end_time': session.end_time,
            'filename': session.file.filename,
            'analysis_date': session.end_time.strftime('%d.%m.%Y, %H:%M:%S') if session.end_time else None,
        }

        if session.status == 'completed' and hasattr(session, 'result'):
            result = session.result
            result_json = result.result_json or {}

            summary = result_json.get('summary') or 'Анализ выполнен'
            recommendations = result_json.get('recommendations') or result.recommendations or 'Рекомендуется консультация врача'
            confidence = result_json.get('confidence', result.confidence)

            detected_conditions = []
            json_conditions = result_json.get('detected_conditions') or result_json.get('conditions') or []
            if json_conditions:
                for cond in json_conditions:
                    detected_conditions.append({
                        'condition_name': cond.get('condition_name') or cond.get('name', 'Неизвестное состояние'),
                        'code': cond.get('code', 'UNKNOWN'),
                        'confidence': float(cond.get('confidence', 0.0)),
                        'severity': cond.get('severity', 'medium')
                    })
            else:
                for cond in result.detected_conditions.all():
                    detected_conditions.append({
                        'condition_name': cond.condition_name,
                        'code': cond.condition_code,
                        'confidence': cond.confidence,
                        'severity': cond.severity
                    })

            data.update({
                'result_id': str(result.id),
                'summary': summary,
                'detected_conditions': detected_conditions,
                'recommendations': recommendations,
                'confidence': confidence,
            })

        return Response(data)

    except AnalysisSession.DoesNotExist:
        return Response({'error': 'Анализ не найден'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Ошибка получения результата: {e}", exc_info=True)
        return Response({'error': 'Ошибка сервера'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_analysis_status(request, session_id):
    try:
        session = AnalysisSession.objects.get(id=session_id, file__user=request.user)
        return Response({
            'session_id': str(session.id),
            'status': session.status,
            'progress': {'pending': 10, 'in_progress': 50, 'completed': 100, 'failed': 0}.get(session.status, 0),
            'file_id': str(session.file_id),
            'filename': session.file.filename
        })
    except AnalysisSession.DoesNotExist:
        return Response({'error': 'Сессия не найдена'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_analysis(request, file_id):
    try:
        medical_file = MedicalFile.objects.get(id=file_id, user=request.user)
        session = AnalysisSession.objects.create(
            file=medical_file,
            model_ml_version='GigaChat-v1.0-retry',
            status='pending'
        )
        result = _analyze_with_gigachat(medical_file, session)
        if result['success']:
            return Response({'message': 'Повторный анализ завершён', 'new_session_id': str(session.id)})
        else:
            return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except MedicalFile.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analysis_history(request):
    from .serializers import AnalysisSessionSerializer
    sessions = AnalysisSession.objects.filter(file__user=request.user).order_by('-start_time')[:20]
    serializer = AnalysisSessionSerializer(sessions, many=True)
    return Response(serializer.data)