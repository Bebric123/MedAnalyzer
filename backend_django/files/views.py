from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os
import uuid

from .models import MedicalFile
from .serializers import MedicalFileSerializer, FileUploadSerializer


class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_obj = serializer.validated_data['file']
        description = serializer.validated_data.get('description', '')
        
        ext = os.path.splitext(file_obj.name)[1].lower()
        filename = f"{uuid.uuid4()}{ext}"
        
        user_upload_dir = os.path.join(
            settings.MEDIA_ROOT, 
            'uploads', 
            str(request.user.id)
        )
        os.makedirs(user_upload_dir, exist_ok=True)
        
        full_path = os.path.join(user_upload_dir, filename)
        
        try:
            with open(full_path, 'wb+') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)
        except Exception as e:
            return Response(
                {'error': f'Ошибка сохранения файла: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            medical_file = MedicalFile.objects.create(
                user=request.user,
                filename=file_obj.name,
                filesize=file_obj.size,
                mime_type=file_obj.content_type,
                storage_path=full_path,
                description=description
            )
        except Exception as e:
            if os.path.exists(full_path):
                os.remove(full_path)
            return Response(
                {'error': f'Ошибка создания записи: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'success': True, 
            'id': str(medical_file.id),
            'message': 'Файл успешно загружен',
            'file': MedicalFileSerializer(
                medical_file, 
                context={'request': request}
            ).data
        }, status=status.HTTP_201_CREATED)


class FileListView(generics.ListAPIView):
    serializer_class = MedicalFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MedicalFile.objects.filter(
            user=self.request.user
        ).order_by('-upload_date')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class FileDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = MedicalFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return MedicalFile.objects.filter(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_destroy(self, instance):
        try:
            if os.path.exists(instance.storage_path):
                os.remove(instance.storage_path)
            
            from analysis.models import AnalysisSession
            AnalysisSession.objects.filter(file=instance).delete()
            
            instance.delete()
            
        except Exception as e:
            print(f"Ошибка при удалении файла: {str(e)}")
            raise


class FileStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user_files = MedicalFile.objects.filter(user=request.user)
        file_types = {}
        total_size = 0
        for file in user_files:
            file_type = file.mime_type.split('/')[0]  
            file_types[file_type] = file_types.get(file_type, 0) + 1
            total_size += file.filesize
        
        def sizeof_fmt(num, suffix='B'):
            for unit in ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']:
                if abs(num) < 1024.0:
                    return f"{num:3.1f}{unit}{suffix}"
                num /= 1024.0
            return f"{num:.1f}Yi{suffix}"
        
        return Response({
            'total_files': user_files.count(),
            'total_size': sizeof_fmt(total_size),
            'file_types': file_types,
            'last_upload': user_files.first().upload_date if user_files.exists() else None
        })