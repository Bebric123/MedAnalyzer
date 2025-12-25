from django.db import models
import uuid
from users.models import User

SYMPTOM_CHOICES = [
    ('headache', 'Головная боль'),
    ('fever', 'Повышенная температура'),
    ('weakness', 'Слабость'),
    ('dizziness', 'Головокружение'),
    ('nausea', 'Тошнота'),
    ('cough', 'Кашель'),
    ('shortness_of_breath', 'Одышка'),
    ('chest_pain', 'Боль в груди'),
    ('fatigue', 'Усталость'),
    ('loss_of_appetite', 'Потеря аппетита'),
]

class JournalEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')
    date = models.DateField() 
    well_being_score = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    description = models.TextField(max_length=1000)
    symptoms = models.JSONField(default=list) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.email} — {self.date}"