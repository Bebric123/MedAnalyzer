from django.db import models
import uuid
from users.models import User
from files.models import MedicalFile

class AnalysisSession(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('in_progress', 'В процессе'),
        ('completed', 'Завершено'),
        ('failed', 'Ошибка'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(MedicalFile, on_delete=models.CASCADE, related_name='analysis_sessions')
    model_ml_version = models.CharField(max_length=100)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"Session {self.id} - {self.status}"

class AnalysisResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(AnalysisSession, on_delete=models.CASCADE, related_name='result')
    confidence = models.FloatField(default=0.0)
    result_json = models.JSONField()
    recommendations = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    processing_time = models.FloatField(default=0.0, verbose_name='Время обработки (сек)')
    def __str__(self):
        return f"Result {self.id} - {self.confidence:.2f}"

class DetectedCondition(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    result = models.ForeignKey(AnalysisResult, on_delete=models.CASCADE, related_name='detected_conditions')
    condition_code = models.CharField(max_length=50, blank=True, default='UNKNOWN')
    condition_name = models.CharField(max_length=255)
    confidence = models.FloatField()
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Низкая'), 
        ('medium', 'Средняя'), 
        ('high', 'Высокая')
    ], null=True, blank=True)
    detected_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, verbose_name='Описание состояния')
    
    def __str__(self):
        return f"{self.condition_name} ({self.confidence:.2%})"

class AIPrompt(models.Model):
    FILE_TYPE_CHOICES = [
        ('all', 'Все типы'),
        ('image', 'Изображения'),
        ('pdf', 'PDF документы'),
        ('docx', 'DOCX документы'),
        ('text', 'Текстовые файлы'),
        ('dicom', 'DICOM файлы'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name='Название промта')
    prompt_text = models.TextField(verbose_name='Текст промта')
    description = models.TextField(blank=True, verbose_name='Описание')
    file_type = models.CharField(
        max_length=50,
        choices=FILE_TYPE_CHOICES,
        default='all',
        verbose_name='Тип файла'
    )
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Создатель')
    
    class Meta:
        verbose_name = 'Промт ИИ'
        verbose_name_plural = 'Промты ИИ'
        ordering = ['-is_active', '-updated_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_file_type_display()})"

class AIPromptVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prompt = models.ForeignKey(AIPrompt, on_delete=models.CASCADE, related_name='versions')
    prompt_text = models.TextField(verbose_name='Текст промта')
    version = models.IntegerField(default=1, verbose_name='Версия')
    change_reason = models.CharField(max_length=255, blank=True, verbose_name='Причина изменения')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Кем изменено')
    
    class Meta:
        verbose_name = 'Версия промта'
        verbose_name_plural = 'Версии промтов'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"v{self.version} - {self.prompt.name}"
    
    