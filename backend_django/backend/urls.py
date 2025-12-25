from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from analysis.admin_api import AIPromptViewSet, UserViewSet, AdminDashboardView

router = DefaultRouter()
router.register(r'admin/prompts', AIPromptViewSet, basename='admin-prompt')
router.register(r'admin/users', UserViewSet, basename='admin-user')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/auth/', include('users.urls')),
    path('api/files/', include('files.urls')),
    path('api/analysis/', include('analysis.urls')),
    path('api/diseases/', include('diseases.urls')),
    
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('api/admin/', include(router.urls)),
    
    path('api/journal/', include('journal.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)