import threading
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resume, ResumeVersion
from .serializers import ResumeSerializer, ResumeVersionSerializer
from .services import parse_resume_version

class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"success": False, "error": {"code": "FILE_REQUIRED", "message": "No file uploaded."}}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES['file']
        
        # Security validation: check extension & size
        ext = uploaded_file.name.split('.')[-1].lower()
        if ext != 'pdf':
            return Response({"success": False, "error": {"code": "INVALID_FILE_TYPE", "message": "Only PDF files are supported in V1."}}, status=status.HTTP_400_BAD_REQUEST)

        if uploaded_file.size > 10 * 1024 * 1024: # 10 MB limit
            return Response({"success": False, "error": {"code": "FILE_TOO_LARGE", "message": "File size cannot exceed 10MB."}}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        resume, _ = Resume.objects.get_or_create(user=user, defaults={'title': f"{user.first_name}'s Resume"})
        
        latest_version = resume.versions.order_by('-version_number').first()
        version_number = (latest_version.version_number + 1) if latest_version else 1

        rv = ResumeVersion.objects.create(
            resume=resume,
            file=uploaded_file,
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
            mime_type=uploaded_file.content_type or 'application/pdf',
            version_number=version_number,
            parsing_status='PENDING'
        )

        # Execute parsing asynchronously in background thread (or Celery task)
        threading.Thread(target=parse_resume_version, args=(rv.id,)).start()

        return Response({
            "success": True,
            "message": "Resume uploaded successfully. Processing started in the background.",
            "version": ResumeVersionSerializer(rv, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

class ResumeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        resumes = Resume.objects.filter(user=user).prefetch_related('versions')
        return Response({"success": True, "resumes": ResumeSerializer(resumes, many=True, context={'request': request}).data})

class ResumeVersionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        try:
            rv = ResumeVersion.objects.get(id=id, resume__user=request.user)
            return Response({"success": True, "version": ResumeVersionSerializer(rv, context={'request': request}).data})
        except ResumeVersion.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Resume version not found."}}, status=status.HTTP_404_NOT_FOUND)

class ResumeVersionReParseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        try:
            rv = ResumeVersion.objects.get(id=id, resume__user=request.user)
            threading.Thread(target=parse_resume_version, args=(rv.id,)).start()
            return Response({"success": True, "message": "Reparsing triggered in background."})
        except ResumeVersion.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Resume version not found."}}, status=status.HTTP_404_NOT_FOUND)
