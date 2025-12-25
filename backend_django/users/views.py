from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
import json

from .models import User
from .serializers import (
    UserSerializer, 
    UserRegisterSerializer, 
    LoginSerializer,
    PasswordResetSerializer,
    PasswordChangeSerializer
)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Регистрация успешно завершена',
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            }, status=status.HTTP_201_CREATED)
        
        errors = self.format_errors(serializer.errors)
        return Response({
            'success': False,
            'message': 'Ошибка регистрации',
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def format_errors(self, errors):
        formatted = {}
        for field, field_errors in errors.items():
            if isinstance(field_errors, list):
                formatted[field] = field_errors
            else:
                formatted[field] = [str(field_errors)]
        return formatted

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user.last_login = timezone.now()
            user.save()
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Вход выполнен успешно',
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            })
        
        errors = self.format_errors(serializer.errors)
        return Response({
            'success': False,
            'message': 'Ошибка входа',
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def format_errors(self, errors):
        formatted = {}
        for field, field_errors in errors.items():
            if isinstance(field_errors, list):
                formatted[field] = field_errors
            else:
                formatted[field] = [str(field_errors)]
        return formatted

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Выход выполнен успешно'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Ошибка при выходе',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                'success': True,
                'message': 'Профиль успешно обновлен',
                'data': serializer.data
            })
        
        errors = {}
        for field, field_errors in serializer.errors.items():
            errors[field] = field_errors if isinstance(field_errors, list) else [str(field_errors)]
        
        return Response({
            'success': False,
            'message': 'Ошибка обновления профиля',
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)

class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({
                    'success': False,
                    'message': 'Ошибка изменения пароля',
                    'errors': {
                        'old_password': ['Неверный текущий пароль']
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'success': True,
                'message': 'Пароль успешно изменен'
            })
        
        errors = {}
        for field, field_errors in serializer.errors.items():
            errors[field] = field_errors if isinstance(field_errors, list) else [str(field_errors)]
        
        return Response({
            'success': False,
            'message': 'Ошибка изменения пароля',
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                return Response({
                    'success': True,
                    'message': f'Инструкции по сбросу пароля отправлены на {email}'
                })
            except User.DoesNotExist:
                return Response({
                    'success': True,
                    'message': 'Если пользователь существует, инструкции отправлены на email'
                })
        
        errors = {}
        for field, field_errors in serializer.errors.items():
            errors[field] = field_errors if isinstance(field_errors, list) else [str(field_errors)]
        
        return Response({
            'success': False,
            'message': 'Ошибка сброса пароля',
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)