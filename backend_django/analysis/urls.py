from django.urls import path
from . import views


print("✅ ЗАГРУЖЕН analysis/urls.py")
urlpatterns = [
    path('file/<uuid:file_id>/', views.get_analysis_result, name='analysis-result'),
    path('session/<uuid:session_id>/', views.check_analysis_status, name='analysis-status'),
    path('retry/<uuid:file_id>/', views.retry_analysis, name='analysis-retry'),
    path('history/', views.analysis_history, name='analysis-history'),
    path('upload/', views.upload_file, name='upload_file'),
]