from rest_framework import serializers
from .models import AIPrompt, AIPromptVersion, AnalysisSession, AnalysisResult, DetectedCondition
from users.models import User

class AIPromptVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = AIPromptVersion
        fields = ['id', 'prompt_text', 'version', 'change_reason', 'created_at', 'created_by', 'created_by_name']
        read_only_fields = ['id', 'created_at']

class AIPromptSerializer(serializers.ModelSerializer):
    versions = AIPromptVersionSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    file_type_display = serializers.CharField(source='get_file_type_display', read_only=True)
    
    class Meta:
        model = AIPrompt
        fields = [
            'id', 'name', 'prompt_text', 'description', 'file_type', 
            'file_type_display', 'is_active', 'created_at', 'updated_at',
            'created_by', 'created_by_name', 'versions'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class DetectedConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectedCondition
        fields = ['id', 'condition_code', 'condition_name', 'confidence', 'severity', 'detected_at']

class AnalysisResultSerializer(serializers.ModelSerializer):
    detected_conditions = DetectedConditionSerializer(many=True, read_only=True)
    
    class Meta:
        model = AnalysisResult
        fields = ['id', 'confidence', 'result_json', 'recommendations', 'detected_conditions', 'created_at']

class AnalysisSessionSerializer(serializers.ModelSerializer):
    result = AnalysisResultSerializer(read_only=True)
    filename = serializers.CharField(source='file.filename', read_only=True)
    
    class Meta:
        model = AnalysisSession
        fields = ['id', 'filename', 'model_ml_version', 'start_time', 'end_time', 'status', 'result']
        read_only_fields = ['id', 'start_time', 'end_time', 'status']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'date_of_birth', 'created_at', 'is_active']
        read_only_fields = ['id', 'created_at']