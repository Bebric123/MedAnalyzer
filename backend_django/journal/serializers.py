from rest_framework import serializers
from .models import JournalEntry, SYMPTOM_CHOICES

class JournalEntrySerializer(serializers.ModelSerializer):
    symptoms = serializers.ListField(
        child=serializers.CharField(max_length=255),
        allow_empty=True,
        required=False
    )

    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'well_being_score', 'description', 'symptoms']
        read_only_fields = ['id']

    def validate_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Нельзя выбрать будущую дату")
        return value

    def validate_well_being_score(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Оценка должна быть от 1 до 5")
        return value

    def validate_description(self, value):
        if len(value) > 1000:
            raise serializers.ValidationError("Описание не должно превышать 1000 символов")
        return value