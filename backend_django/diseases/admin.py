from django.contrib import admin
from .models import DiseaseRecord

@admin.register(DiseaseRecord)
class DiseaseRecordAdmin(admin.ModelAdmin):
    list_display = ('disease_name', 'disease_code', 'user_email', 'is_active', 'first_detected')
    list_filter = ('is_active', 'disease_code')
    search_fields = ('disease_name', 'disease_code', 'user__email')
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Пользователь'