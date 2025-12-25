# test_gigachat_fixed.py
import os
import django
import sys

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

try:
    django.setup()
except Exception as e:
    print(f"❌ Ошибка инициализации Django: {e}")
    sys.exit(1)

from analysis.services.gigachat_service import GigaChatService

def test_gigachat():
    """Тест подключения к GigaChat"""
    print("=" * 60)
    print("🧪 Тестируем подключение к GigaChat...")
    print("=" * 60)
    
    try:
        # 1. Создаем экземпляр сервиса
        print("\n1. Создаем экземпляр GigaChatService...")
        service = GigaChatService()
        print(f"   ✅ Сервис создан")
        print(f"   📌 Auth URL: {service.auth_url}")
        print(f"   📌 API URL: {service.api_url}")
        print(f"   📌 Ключ установлен: {'Да' if service.authorization_key else 'Нет'}")
        
        if not service.authorization_key:
            print("   ⚠️  ВНИМАНИЕ: GIGACHAT_AUTHORIZATION_KEY не установлен в settings.py")
            print("   ℹ️  Добавьте в settings.py:")
            print('   GIGACHAT_AUTHORIZATION_KEY = "ваш_ключ_здесь"')
            return False
        
        # 2. Тест получения токена
        print("\n2. Получение токена...")
        try:
            token = service.ensure_valid_token()
            if token:
                print(f"   ✅ Токен получен: {token[:30]}...")
            else:
                print("   ❌ Не удалось получить токен")
                return False
        except Exception as e:
            print(f"   ❌ Ошибка получения токена: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        # 3. Тест простого запроса
        print("\n3. Тестовый запрос к GigaChat...")
        try:
            result = service.analyze_medical_data(
                "Медицинские данные: Пациент, 30 лет. Жалобы на слабость. Гемоглобин 120 г/л (норма 130-160).",
                "text/plain",
                "test.txt",
                timeout=15
            )
            
            print(f"   ✅ Ответ получен")
            print(f"   📝 Summary: {result.get('summary', 'нет summary')}")
            print(f"   🔍 Найдено состояний: {len(result.get('detected_conditions', []))}")
            print(f"   📊 Уверенность: {result.get('confidence', 'не указана')}")
            
            if 'error' in result:
                print(f"   ⚠️  Есть ошибка: {result['error']}")
            
            # Показываем найденные состояния
            conditions = result.get('detected_conditions', [])
            if conditions:
                print(f"\n   📋 Найденные состояния:")
                for i, cond in enumerate(conditions[:3], 1):
                    print(f"      {i}. {cond.get('condition_name', 'Нет названия')} "
                          f"(код: {cond.get('code', 'нет')}, "
                          f"уверенность: {cond.get('confidence', 0):.2f})")
            
            return True
            
        except Exception as e:
            print(f"   ❌ Ошибка тестового запроса: {e}")
            import traceback
            traceback.print_exc()
            return False
        
    except Exception as e:
        print(f"\n❌ Общая ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_gigachat()
    print("\n" + "=" * 60)
    if success:
        print("🎉 Тест пройден успешно! GigaChat работает корректно.")
    else:
        print("❌ Тест не пройден. Проверьте настройки.")
    print("=" * 60)