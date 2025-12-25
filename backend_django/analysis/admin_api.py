from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .models import AIPrompt, AIPromptVersion, AnalysisSession
from .serializers import AIPromptSerializer, AIPromptVersionSerializer, UserSerializer
from users.models import User
from files.models import MedicalFile

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class AIPromptViewSet(viewsets.ModelViewSet):
    queryset = AIPrompt.objects.all()
    serializer_class = AIPromptSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        file_type = self.request.query_params.get('file_type')
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-updated_at')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        prompt = self.get_object()
        prompt.is_active = not prompt.is_active
        prompt.save()
        
        action = 'активирован' if prompt.is_active else 'деактивирован'
        return Response({
            'message': f'Промт {action}',
            'is_active': prompt.is_active
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        stats = {
            'total': AIPrompt.objects.count(),
            'active': AIPrompt.objects.filter(is_active=True).count(),
            'by_type': list(AIPrompt.objects.values('file_type')
                           .annotate(count=Count('id'))
                           .order_by('-count')),
            'recent_updates': AIPrompt.objects.filter(
                updated_at__gte=timezone.now() - timedelta(days=7)
            ).count(),
        }
        return Response(stats)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        action = 'активирован' if user.is_active else 'деактивирован'
        return Response({
            'message': f'Пользователь {action}',
            'is_active': user.is_active
        })

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum
        
        user_stats = {
            'total': User.objects.count(),
            'patients': User.objects.filter(role='patient').count(),
            'doctors': User.objects.filter(role='doctor').count(),
            'admins': User.objects.filter(role='admin').count(),
            'new_today': User.objects.filter(
                created_at__date=timezone.now().date()
            ).count(),
        }
        
        file_stats = {
            'total': MedicalFile.objects.count(),
            'by_type': list(MedicalFile.objects.values('mime_type')
                           .annotate(count=Count('id'))
                           .order_by('-count')[:5]),
            'total_size_mb': round(
                MedicalFile.objects.aggregate(
                    total_size=Sum('filesize')
                )['total_size'] or 0 / (1024 * 1024), 2
            ),
        }
        
        analysis_stats = {
            'total': AnalysisSession.objects.count(),
            'completed': AnalysisSession.objects.filter(status='completed').count(),
            'failed': AnalysisSession.objects.filter(status='failed').count(),
            'pending': AnalysisSession.objects.filter(status='pending').count(),
            'today': AnalysisSession.objects.filter(
                start_time__date=timezone.now().date()
            ).count(),
        }
        
        from .serializers import AnalysisSessionSerializer
        
        recent_activities = {
            'recent_files': list(MedicalFile.objects.order_by('-upload_date')
                                .values('id', 'filename', 'upload_date')[:5]),
            'recent_analyses': AnalysisSessionSerializer(
                AnalysisSession.objects.select_related('file')
                .order_by('-start_time')[:5], many=True
            ).data,
            'recent_users': UserSerializer(
                User.objects.order_by('-created_at')[:5], many=True
            ).data,
        }
        
        return Response({
            'user_stats': user_stats,
            'file_stats': file_stats,
            'analysis_stats': analysis_stats,
            'recent_activities': recent_activities,
            'system_stats': {
                'prompts_count': AIPrompt.objects.count(),
                'active_prompts': AIPrompt.objects.filter(is_active=True).count(),
                'today_analyses': AnalysisSession.objects.filter(
                    start_time__date=timezone.now().date()
                ).count(),
            }
        })