from django.db import models
from users.models import User
import uuid
import os

class MedicalFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medical_files')
    filename = models.CharField(max_length=255)
    filesize = models.IntegerField()
    mime_type = models.CharField(max_length=100)
    storage_path = models.CharField(max_length=500)
    
    upload_date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    is_processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True, null=True)

    def get_file_extension(self):
        return os.path.splitext(self.filename)[1].lower()

    def is_image(self):
        return self.mime_type.startswith('image/')

    def is_document(self):
        return self.mime_type in ['application/pdf', 
                                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

    def __str__(self):
        return f"{self.filename} ({self.user.email})"