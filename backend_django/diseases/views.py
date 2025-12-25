from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import DiseaseRecord

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_disease_history(request):
    records = DiseaseRecord.objects.filter(user=request.user)
    data = [
        {
            'id': str(r.id),
            'disease_code': r.disease_code,
            'disease_name': r.disease_name,
            'first_detected': r.first_detected,
            'last_detected': r.last_detected,
            'is_active': r.is_active
        }
        for r in records
    ]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_disease(request, disease_id):
    try:
        disease = DiseaseRecord.objects.get(id=disease_id, user=request.user)
        disease.is_active = False
        disease.save(update_fields=['is_active'])
        return Response({'success': True, 'message': 'Заболевание отмечено как вылеченное'})
    except DiseaseRecord.DoesNotExist:
        return Response(
            {'error': 'Заболевание не найдено'}
        )