from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SavedJob, Application, ApplicationStatusHistory
from .serializers import SavedJobSerializer, ApplicationSerializer, AdminApplicationSerializer
from apps.jobs.models import Job
from apps.resumes.models import Resume, ResumeVersion
from apps.notifications.models import Notification

class ToggleSaveJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Job not found."}}, status=status.HTTP_404_NOT_FOUND)

        saved, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        if not created:
            saved.delete()
            return Response({"success": True, "saved": False, "message": "Job removed from saved list."})
        return Response({"success": True, "saved": True, "message": "Job saved successfully."})

class SavedJobListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        saved = SavedJob.objects.filter(user=request.user).select_related('job', 'job__company').order_by('-created_at')
        return Response({"success": True, "saved_jobs": SavedJobSerializer(saved, many=True, context={'request': request}).data})

class ApplyJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        user = request.user
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Job not found."}}, status=status.HTTP_404_NOT_FOUND)

        if job.status != 'PUBLISHED':
            return Response({"success": False, "error": {"code": "JOB_NOT_ACTIVE", "message": "This job is no longer accepting applications."}}, status=status.HTTP_400_BAD_REQUEST)

        # Check existing application
        if Application.objects.filter(user=user, job=job).exists():
            return Response({"success": False, "error": {"code": "ALREADY_APPLIED", "message": "You have already applied for this job."}}, status=status.HTTP_400_BAD_REQUEST)

        # Identify active resume version snapshot
        resume = Resume.objects.filter(user=user, is_active=True).first()
        if not resume:
            return Response({"success": False, "error": {"code": "NO_RESUME", "message": "Please upload a resume before applying."}}, status=status.HTTP_400_BAD_REQUEST)

        rv = resume.versions.order_by('-version_number').first()
        if not rv:
            return Response({"success": False, "error": {"code": "NO_RESUME_VERSION", "message": "No active resume version found."}}, status=status.HTTP_400_BAD_REQUEST)

        app = Application.objects.create(
            user=user,
            job=job,
            resume_version=rv,
            status='APPLIED'
        )

        ApplicationStatusHistory.objects.create(
            application=app,
            old_status='',
            new_status='APPLIED',
            changed_by=user,
            note='Application submitted by candidate.'
        )

        return Response({
            "success": True,
            "message": "Application submitted successfully!",
            "application": ApplicationSerializer(app, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

class StudentApplicationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(user=request.user).select_related('job', 'job__company', 'resume_version').prefetch_related('history').order_by('-applied_at')
        return Response({"success": True, "applications": ApplicationSerializer(applications, many=True, context={'request': request}).data})

class AdminApplicationManageView(APIView):
    def get(self, request):
        if not (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)):
            return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Forbidden."}}, status=status.HTTP_403_FORBIDDEN)
        
        apps_qs = Application.objects.select_related('user', 'job', 'job__company', 'resume_version').prefetch_related('history').order_by('-applied_at')
        job_id = request.query_params.get('job_id')
        if job_id:
            apps_qs = apps_qs.filter(job_id=job_id)
        
        status_param = request.query_params.get('status')
        if status_param:
            apps_qs = apps_qs.filter(status=status_param)

        return Response({"success": True, "applications": AdminApplicationSerializer(apps_qs, many=True, context={'request': request}).data})

    def post(self, request, application_id):
        if not (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)):
            return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Forbidden."}}, status=status.HTTP_403_FORBIDDEN)

        try:
            app = Application.objects.get(id=application_id)
            new_status = request.data.get('status')
            note = request.data.get('note', '')

            valid_statuses = [s[0] for s in Application.STATUS_CHOICES]
            if new_status not in valid_statuses:
                return Response({"success": False, "error": {"code": "INVALID_STATUS", "message": f"Status must be one of {valid_statuses}"}}, status=status.HTTP_400_BAD_REQUEST)

            old_status = app.status
            app.status = new_status
            app.save()

            ApplicationStatusHistory.objects.create(
                application=app,
                old_status=old_status,
                new_status=new_status,
                changed_by=request.user,
                note=note
            )

            # Create notification for student
            Notification.objects.create(
                user=app.user,
                type='APPLICATION_UPDATE',
                title=f"Application Update: {app.job.title}",
                message=f"Your application status for {app.job.title} at {app.job.company.name} has been updated to {new_status}.",
                job=app.job
            )

            return Response({
                "success": True,
                "message": f"Application status updated to {new_status}.",
                "application": AdminApplicationSerializer(app, context={'request': request}).data
            })
        except Application.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Application not found."}}, status=status.HTTP_404_NOT_FOUND)
