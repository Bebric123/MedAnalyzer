from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.core.validators import validate_email
from .models import User
import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'date_of_birth', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=8, 
        style={'input_type': 'password'},
        error_messages={
            'min_length': 'Пароль должен содержать не менее 8 символов',
            'blank': 'Пароль не может быть пустым',
            'required': 'Пароль обязателен для заполнения'
        }
    )
    password2 = serializers.CharField(
        write_only=True, 
        min_length=8, 
        style={'input_type': 'password'},
        error_messages={
            'min_length': 'Подтверждение пароля должно содержать не менее 8 символов',
            'blank': 'Подтверждение пароля не может быть пустым',
            'required': 'Подтверждение пароля обязательно'
        }
    )
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'full_name', 'date_of_birth']
        extra_kwargs = {
            'email': {
                'required': True,
                'error_messages': {
                    'required': 'Email обязателен для заполнения',
                    'blank': 'Email не может быть пустым',
                    'invalid': 'Введите корректный email адрес'
                }
            },
            'full_name': {
                'required': True,
                'error_messages': {
                    'required': 'ФИО обязательно для заполнения',
                    'blank': 'ФИО не может быть пустым',
                    'max_length': 'ФИО не может превышать 255 символов'
                }
            },
            'date_of_birth': {
                'error_messages': {
                    'invalid': 'Введите дату в формате ДД.ММ.ГГГГ'
                }
            }
        }
    
    def validate_email(self, value):
        try:
            validate_email(value)
        except:
            raise serializers.ValidationError("Введите корректный email адрес")
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже зарегистрирован")
        
        return value.lower() 
    
    def validate_full_name(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("ФИО не может быть пустым")
        
        if len(value.strip()) < 2:
            raise serializers.ValidationError("ФИО должно содержать не менее 2 символов")
        
        if not re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', value):
            raise serializers.ValidationError("ФИО может содержать только буквы, пробелы и дефисы")
        
        return value.strip()
    
    def validate_password(self, value):
        errors = []
        
        if len(value) < 8:
            errors.append("Не менее 8 символов")
        
        if not re.search(r'\d', value):
            errors.append("Хотя бы одну цифру")
        
        if not re.search(r'[a-zA-Zа-яА-Я]', value):
            errors.append("Хотя бы одну букву")
        
        common_passwords = ['password', '12345678', 'qwerty', 'admin', 'password123']
        if value.lower() in common_passwords:
            errors.append("Пароль слишком простой")
        
        if errors:
            raise serializers.ValidationError(f"Пароль должен содержать: {', '.join(errors)}")
        
        return value
    
    def validate(self, data):
        errors = {}
        
        if data.get('password') != data.get('password2'):
            errors['password2'] = ["Пароли не совпадают"]
            if 'password' not in errors:
                errors['password'] = ["Пароли не совпадают"]
        
        date_of_birth = data.get('date_of_birth')
        if date_of_birth:
            from datetime import date
            if date_of_birth > date.today():
                errors['date_of_birth'] = ["Дата рождения не может быть в будущем"]
        
        if errors:
            raise serializers.ValidationError(errors)
        
        data.pop('password2')
        return data
    
    def create(self, validated_data):
        """Создание нового пользователя"""
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            date_of_birth=validated_data.get('date_of_birth'),
            role='patient'
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            'required': 'Email обязателен для заполнения',
            'blank': 'Email не может быть пустым',
            'invalid': 'Введите корректный email адрес'
        }
    )
    password = serializers.CharField(
        write_only=True, 
        style={'input_type': 'password'},
        error_messages={
            'required': 'Пароль обязателен для заполнения',
            'blank': 'Пароль не может быть пустым'
        }
    )
    
    def validate_email(self, value):
        if not User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Пользователь с таким email не найден")
        return value.lower()
    
    def validate(self, data):
        errors = {}
        
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            try:
                user = User.objects.get(email=email.lower())
                
                if not user.is_active:
                    errors['email'] = ["Аккаунт заблокирован. Обратитесь к администратору"]
                else:
                    if not user.check_password(password):
                        errors['password'] = ["Неверный пароль"]
                    
            except User.DoesNotExist:
                errors['email'] = ["Пользователь с таким email не найден"]
        else:
            if not email:
                errors['email'] = ["Email обязателен для заполнения"]
            if not password:
                errors['password'] = ["Пароль обязателен для заполнения"]
        
        if errors:
            raise serializers.ValidationError(errors)
        
        user = User.objects.get(email=email.lower())
        data['user'] = user
        return data

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            'required': 'Email обязателен для заполнения',
            'blank': 'Email не может быть пустым',
            'invalid': 'Введите корректный email адрес'
        }
    )
    
    def validate_email(self, value):
        if not User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Пользователь с таким email не найден")
        return value.lower()

class PasswordChangeSerializer(serializers.Serializer):
    """Сериализатор для изменения пароля"""
    old_password = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'Старый пароль обязателен',
            'blank': 'Старый пароль не может быть пустым'
        }
    )
    new_password = serializers.CharField(
        write_only=True, 
        min_length=8,
        error_messages={
            'min_length': 'Новый пароль должен содержать не менее 8 символов',
            'required': 'Новый пароль обязателен',
            'blank': 'Новый пароль не может быть пустым'
        }
    )
    confirm_password = serializers.CharField(
        write_only=True, 
        min_length=8,
        error_messages={
            'min_length': 'Подтверждение пароля должно содержать не менее 8 символов',
            'required': 'Подтверждение пароля обязательно',
            'blank': 'Подтверждение пароля не может быть пустым'
        }
    )
    
    def validate_new_password(self, value):
        """Проверка сложности нового пароля"""
        errors = []
        
        if len(value) < 8:
            errors.append("Не менее 8 символов")
        if not re.search(r'\d', value):
            errors.append("Хотя бы одну цифру")
        if not re.search(r'[a-zA-Zа-яА-Я]', value):
            errors.append("Хотя бы одну букву")
        
        common_passwords = ['password', '12345678', 'qwerty']
        if value.lower() in common_passwords:
            errors.append("Пароль слишком простой")
        
        if errors:
            raise serializers.ValidationError(f"Пароль должен содержать: {', '.join(errors)}")
        
        return value
    
    def validate(self, data):
        """Общая валидация"""
        errors = {}
        
        if data.get('new_password') != data.get('confirm_password'):
            errors['confirm_password'] = ["Новые пароли не совпадают"]
        
        if data.get('old_password') == data.get('new_password'):
            errors['new_password'] = ["Новый пароль должен отличаться от старого"]
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data