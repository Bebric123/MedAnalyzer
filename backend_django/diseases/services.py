from .models import DiseaseRecord
from django.utils import timezone
from django.db import transaction

def update_disease_history(user_id, detected_conditions):
    with transaction.atomic():
        for cond in detected_conditions:
            if cond['confidence'] > 0.5:
                record, created = DiseaseRecord.objects.get_or_create(
                    user_id=user_id,
                    disease_code=cond['condition_code'],
                    defaults={
                        'disease_name': cond['condition_name'],
                        'first_detected': timezone.now(),
                        'last_detected': timezone.now(),
                        'is_active': True
                    }
                )
                if not created:
                    record.last_detected = timezone.now()
                    record.is_active = True
                    record.save()