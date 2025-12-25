from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_entries, name='journal_list'),
    path('create/', views.create_entry, name='journal_create'),
    path('<uuid:entry_id>/', views.entry_detail, name='journal_detail'),
]