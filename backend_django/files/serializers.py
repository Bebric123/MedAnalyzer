from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.conf import settings
import os
from .models import MedicalFile

class MedicalFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalFile
        fields = ['id', 'filename', 'filesize', 'file_size_mb', 'mime_type', 
                 'upload_date', 'file_url', 'is_processed', 'description']
        read_only_fields = ['id', 'upload_date', 'file_url', 'is_processed', 'file_size_mb']
    
    def get_file_url(self, obj):
        """Получение URL файла"""
        request = self.context.get('request')
        if obj.storage_path and request:
            return f"/media/{obj.storage_path.split('media/')[-1]}" if 'media/' in obj.storage_path else obj.storage_path
        return None
    
    def get_file_size_mb(self, obj):
        if obj.filesize:
            return f"{obj.filesize / (1024 * 1024):.2f} MB"
        return "0 MB"

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(
        max_length=100, 
        allow_empty_file=False,
        help_text="Медицинский файл для анализа (PDF, DOCX, JPG, PNG, DICOM)"
    )
    description = serializers.CharField(
        required=False, 
        allow_blank=True, 
        max_length=500,
        help_text="Описание файла (опционально)"
    )
    
    def validate_file(self, value):
        max_size = settings.MAX_UPLOAD_SIZE
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Файл слишком большой. Максимальный размер: {max_size // (1024 * 1024)} МБ"
            )
        
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 
            'image/tiff', 'image/tif',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',  
            'application/dicom',
            'text/plain', 'text/html',
        ]
        
        if value.content_type not in allowed_types:
            ext = value.name.split('.')[-1].lower()
            allowed_extensions = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'bmp': 'image/bmp',
                'tiff': 'image/tiff',
                'tif': 'image/tiff',
                'gif': 'image/gif',
                'pdf': 'application/pdf',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'doc': 'application/msword',
                'dcm': 'application/dicom',
                'txt': 'text/plain',
                'html': 'text/html',
                'htm': 'text/html',
            }
            
            if ext not in allowed_extensions:
                raise serializers.ValidationError(
                    f"Неподдерживаемый тип файла: {value.content_type or ext}. "
                    f"Поддерживаемые форматы: PDF, DOCX, JPG, PNG, DICOM, TXT"
                )
        
        return value