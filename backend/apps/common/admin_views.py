from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.common.permissions import IsAdminUser
from apps.accounts.models import User
from apps.jobs.models import Job
from apps.companies.models import Company
from apps.applications.models import Application

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_students = User.objects.filter(role='STUDENT').count()
        total_companies = Company.objects.count()
        active_jobs = Job.objects.filter(status='PUBLISHED').count()
        draft_jobs = Job.objects.filter(status='DRAFT').count()
        total_applications = Application.objects.count()

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
                "total_applications": total_applications
            },
            "recent_applications": recent_apps_data
        })
