from django.contrib import admin
from .models import MedicalFile

@admin.register(MedicalFile)
class MedicalFileAdmin(admin.ModelAdmin):
    list_display = ('filename', 'user_email', 'filesize_mb', 'upload_date')
    list_filter = ('upload_date',)
    search_fields = ('filename', 'user__email')
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Пользователь'
    
    def filesize_mb(self, obj):
        return f"{obj.filesize / (1024*1024):.2f} MB"
    filesize_mb.short_description = 'Размер'