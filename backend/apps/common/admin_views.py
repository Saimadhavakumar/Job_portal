from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from apps.common.permissions import IsAdminUser
from apps.common.pagination import StandardPagination
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.jobs.models import Job
from apps.jobs.serializers import JobSerializer
from apps.companies.models import Company
from apps.applications.models import Application
from apps.profiles.models import (
    Profile, UserPreference, UserSkill, Project, Education, Experience, Certification
)
from apps.profiles.serializers import (
    ProfileSerializer, UserPreferenceSerializer, UserSkillSerializer,
    ProjectSerializer, EducationSerializer, ExperienceSerializer, CertificationSerializer
)

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_students = User.objects.filter(role='STUDENT').count()
        total_companies = Company.objects.count()
        active_jobs = Job.objects.filter(status='PUBLISHED').count()
        draft_jobs = Job.objects.filter(status='DRAFT').count()
        closed_jobs = Job.objects.filter(status__in=['CLOSED', 'EXPIRED', 'ARCHIVED']).count()
        total_applications = Application.objects.count()

        # Application status breakdown
        application_breakdown = {}
        for choice_val, choice_label in Application.STATUS_CHOICES:
            count = Application.objects.filter(status=choice_val).count()
            if count > 0:
                application_breakdown[choice_val] = count

        recent_applications = Application.objects.select_related('user', 'job', 'job__company').order_by('-applied_at')[:5]
        recent_apps_data = [
            {
                "id": a.id,
                "applicant": a.user.full_name,
                "email": a.user.email,
                "job_title": a.job.title,
                "company": a.job.company.name,
                "status": a.status,
                "applied_at": a.applied_at
            } for a in recent_applications
        ]

        return Response({
            "success": True,
            "stats": {
                "total_students": total_students,
                "total_companies": total_companies,
                "active_jobs": active_jobs,
                "draft_jobs": draft_jobs,
                "closed_jobs": closed_jobs,
                "total_applications": total_applications,
                "application_breakdown": application_breakdown,
            },
            "recent_applications": recent_apps_data
        })

class AdminJobListView(APIView):
    """List all jobs with filtering (for admin management panel)."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        jobs = Job.objects.select_related('company', 'created_by').order_by('-created_at')

        # Filters
        search = request.query_params.get('search')
        if search:
            jobs = jobs.filter(
                Q(title__icontains=search) |
                Q(company__name__icontains=search) |
                Q(location__icontains=search)
            )

        status_filter = request.query_params.get('status')
        if status_filter:
            jobs = jobs.filter(status=status_filter)

        company_id = request.query_params.get('company_id')
        if company_id:
            jobs = jobs.filter(company_id=company_id)

        employment_type = request.query_params.get('employment_type')
        if employment_type:
            jobs = jobs.filter(employment_type=employment_type)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(jobs, request)
        if page is not None:
            serializer = JobSerializer(page, many=True, context={'request': request})
            response = paginator.get_paginated_response(serializer.data)
            response.data['jobs'] = response.data.pop('results')
            return response

        return Response({"success": True, "jobs": JobSerializer(jobs, many=True, context={'request': request}).data})

class AdminJobDeleteView(APIView):
    """Archive or permanently delete a job listing."""
    permission_classes = [IsAdminUser]

    def post(self, request, id):
        """Archive a job (soft delete — sets status to ARCHIVED)."""
        try:
            job = Job.objects.get(id=id)
            job.status = 'ARCHIVED'
            job.save()
            return Response({"success": True, "message": f"Job '{job.title}' has been archived."})
        except Job.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Job not found."}}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, id):
        """Permanently delete a job (only if no applications exist)."""
        try:
            job = Job.objects.get(id=id)
            if Application.objects.filter(job=job).exists():
                return Response({
                    "success": False,
                    "error": {
                        "code": "HAS_APPLICATIONS",
                        "message": "Cannot delete a job that has applications. Archive it instead."
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            title = job.title
            job.delete()
            return Response({"success": True, "message": f"Job '{title}' has been permanently deleted."})
        except Job.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Job not found."}}, status=status.HTTP_404_NOT_FOUND)

class AdminUserListView(APIView):
    """List all users with search and role filter."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')

        search = request.query_params.get('search')
        if search:
            users = users.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        role = request.query_params.get('role')
        if role:
            users = users.filter(role=role)

        verified = request.query_params.get('verified')
        if verified is not None:
            users = users.filter(email_verified=verified.lower() in ('true', '1'))

        paginator = StandardPagination()
        page = paginator.paginate_queryset(users, request)
        if page is not None:
            serializer = UserSerializer(page, many=True)
            response = paginator.get_paginated_response(serializer.data)
            response.data['users'] = response.data.pop('results')
            return response

        return Response({"success": True, "users": UserSerializer(users, many=True).data})

class AdminCandidateDetailView(APIView):
    """View a candidate's full profile (for application review)."""
    permission_classes = [IsAdminUser]

    def get(self, request, user_id):
        try:
            candidate = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "User not found."}}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = Profile.objects.get_or_create(user=candidate)
        preference, _ = UserPreference.objects.get_or_create(user=candidate)
        skills = UserSkill.objects.filter(user=candidate).select_related('skill')
        projects = Project.objects.filter(user=candidate)
        education = Education.objects.filter(user=candidate)
        experience = Experience.objects.filter(user=candidate)
        certifications = Certification.objects.filter(user=candidate)

        # Application history for this candidate
        from apps.applications.serializers import ApplicationSerializer
        applications = Application.objects.filter(user=candidate).select_related('job', 'job__company', 'resume_version').prefetch_related('history').order_by('-applied_at')

        data = {
            "user": UserSerializer(candidate).data,
            "profile": ProfileSerializer(profile, context={'request': request}).data,
            "preference": UserPreferenceSerializer(preference).data,
            "skills": UserSkillSerializer(skills, many=True).data,
            "projects": ProjectSerializer(projects, many=True).data,
            "education": EducationSerializer(education, many=True).data,
            "experience": ExperienceSerializer(experience, many=True).data,
            "certifications": CertificationSerializer(certifications, many=True).data,
            "applications": ApplicationSerializer(applications, many=True, context={'request': request}).data,
        }

        return Response({"success": True, "candidate": data})
