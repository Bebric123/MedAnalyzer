from rest_framework import serializers
from .models import DiseaseRecord

class DiseaseRecordSerializer(serializers.ModelSerializer):
    duration_days = serializers.SerializerMethodField()
    
    class Meta:
        model = DiseaseRecord
        fields = ['id', 'disease_code', 'disease_name', 'first_detected', 
                 'last_detected', 'is_active', 'duration_days']
        read_only_fields = ['id', 'first_detected', 'last_detected']
    
    def get_duration_days(self, obj):
        from django.utils import timezone
        if obj.is_active:
            duration = timezone.now() - obj.first_detected
        else:
            duration = obj.last_detected - obj.first_detected
        return duration.days