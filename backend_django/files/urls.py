from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('', views.FileListView.as_view(), name='file-list'),
    path('stats/', views.FileStatsView.as_view(), name='file-stats'),
    path('<uuid:id>/', views.FileDetailView.as_view(), name='file-detail'),
]