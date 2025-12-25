from django.db import models
import uuid
from users.models import User
from analysis.models import AnalysisSession

class DiseaseRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disease_records')
    
    last_analysis = models.ForeignKey(
        AnalysisSession, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='updated_diseases'
    )
    
    disease_code = models.CharField(max_length=50)
    disease_name = models.CharField(max_length=255)
    
    first_detected = models.DateTimeField(auto_now_add=True)
    last_detected = models.DateTimeField(auto_now=True)
    
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'disease_code')
        ordering = ['-last_detected']

    def __str__(self):
        return f"{self.disease_name} ({self.user.email})"