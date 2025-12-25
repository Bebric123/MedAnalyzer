from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_disease_history, name='disease_history'),
    path('<uuid:disease_id>/deactivate/', views.deactivate_disease, name='deactivate_disease'),
]