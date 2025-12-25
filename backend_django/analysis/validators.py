import os
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible

@deconstructible
class FileValidator:
    
    ALLOWED_EXTENSIONS = {
        'image': ['jpg', 'jpeg', 'png', 'dcm', 'bmp', 'tiff'],
        'document': ['pdf', 'docx', 'doc', 'txt']
    }
    
    MAX_FILE_SIZE = 50 * 1024 * 1024
    
    def __call__(self, file):
        self.validate_extension(file.name)
        self.validate_size(file.size)
        self.validate_content_type(file.content_type)
    
    def validate_extension(self, filename):
        ext = filename.split('.')[-1].lower()
        
        allowed_extensions = []
        allowed_extensions.extend(self.ALLOWED_EXTENSIONS['image'])
        allowed_extensions.extend(self.ALLOWED_EXTENSIONS['document'])
        
        if ext not in allowed_extensions:
            raise ValidationError(
                f'Неподдерживаемый формат файла. Разрешенные форматы: '
                f'{", ".join(allowed_extensions)}'
            )
    
    def validate_size(self, size):
        if size > self.MAX_FILE_SIZE:
            raise ValidationError(
                f'Размер файла превышает допустимый лимит {self.MAX_FILE_SIZE // (1024*1024)} МБ'
            )
    
    def validate_content_type(self, content_type):
        if not content_type:
            return
            
        allowed_mime_types = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/dicom', 'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword', 'text/plain'
        ]
        
        if not any(allowed in content_type for allowed in [
            'image/', 'application/pdf', 'application/msword',
            'application/vnd.openxmlformats', 'text/plain'
        ]):
            raise ValidationError('Недопустимый тип файла')

def validate_file(file):
    validator = FileValidator()
    validator(file)
    return file