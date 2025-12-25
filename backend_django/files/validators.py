from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.conf import settings

def validate_file(file):
    max_size = settings.MAX_UPLOAD_SIZE
    if file.size > max_size:
        raise ValidationError(
            _('Файл слишком большой. Максимальный размер: %(max_size)s МБ'),
            params={'max_size': max_size // (1024 * 1024)},
            code='file_too_large'
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
    
    if file.content_type not in allowed_types:
        ext = file.name.split('.')[-1].lower()
        allowed_extensions = [
            'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'gif',
            'pdf', 'docx', 'doc',
            'dcm', 
            'txt', 'html', 'htm',
        ]
        
        if ext not in allowed_extensions:
            raise ValidationError(
                _('Неподдерживаемый тип файла: %(file_type)s'),
                params={'file_type': file.content_type or ext},
                code='invalid_file_type'
            )
    
    if len(file.name) > 255:
        raise ValidationError(
            _('Имя файла слишком длинное'),
            code='filename_too_long'
        )
    
    return file