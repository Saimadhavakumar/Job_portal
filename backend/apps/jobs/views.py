import threading
from django.utils import timezone
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Job, JobSkill, JobSource
from .serializers import JobSerializer, AdminJobCreateUpdateSerializer
from apps.profiles.models import Skill
from apps.recommendations.services import process_job_published_recommendations

class JobDiscoveryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        jobs = Job.objects.filter(status='PUBLISHED').select_related('company').order_by('-published_at', '-created_at')

        search = request.query_params.get('search')
        if search:
            jobs = jobs.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(company__name__icontains=search) |
                Q(location__icontains=search)
            )

        employment_type = request.query_params.get('employment_type')
        if employment_type:
            jobs = jobs.filter(employment_type=employment_type)

        work_mode = request.query_params.get('work_mode')
        if work_mode:
            jobs = jobs.filter(work_mode=work_mode)

        location = request.query_params.get('location')
        if location:
            jobs = jobs.filter(location__icontains=location)

        skill_param = request.query_params.get('skill')
        if skill_param:
            jobs = jobs.filter(job_skills__skill__name__icontains=skill_param)

        serializer = JobSerializer(jobs.distinct(), many=True, context={'request': request})
        return Response({"success": True, "count": jobs.count(), "jobs": serializer.data})

class JobDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            job = Job.objects.select_related('company').get(slug=slug)
            serializer = JobSerializer(job, context={'request': request})
            return Response({"success": True, "job": serializer.data})
        except Job.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Job opportunity not found."}}, status=status.HTTP_404_NOT_FOUND)

class AdminJobCreateView(APIView):
    def post(self, request):
        if not (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)):
            return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Only administrators can publish jobs."}}, status=status.HTTP_403_FORBIDDEN)

        skills_data = request.data.get('skills', [])
        serializer = AdminJobCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            job_status = serializer.validated_data.get('status', 'DRAFT')
            published_at = timezone.now() if job_status == 'PUBLISHED' else None
            
            with transaction.atomic():
                job = serializer.save(created_by=request.user, published_at=published_at)

                # Process skill associations
                for sk_item in skills_data:
                    name = sk_item.get('name')
                    if name:
                        norm = Skill.normalize_skill_name(name)
                        skill_obj, _ = Skill.objects.get_or_create(
                            normalized_name=norm,
                            defaults={'name': name.strip()}
                        )
                        JobSkill.objects.update_or_create(
                            job=job,
                            skill=skill_obj,
                            defaults={
                                'importance': sk_item.get('importance', 'MEDIUM'),
                                'required': sk_item.get('required', True)
                            }
                        )

            if job.status == 'PUBLISHED':
                job_id = job.id
                transaction.on_commit(lambda: threading.Thread(target=process_job_published_recommendations, args=(job_id,)).start())

            return Response({
                "success": True,
                "message": "Job listing created successfully.",
                "job": JobSerializer(job, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminJobDetailView(APIView):
    def put(self, request, id):
        if not (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)):
            return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Only administrators can edit jobs."}}, status=status.HTTP_403_FORBIDDEN)

        try:
            job = Job.objects.get(id=id)
            skills_data = request.data.get('skills', None)
            old_status = job.status
            
            serializer = AdminJobCreateUpdateSerializer(job, data=request.data, partial=True)
            if serializer.is_valid():
                new_status = serializer.validated_data.get('status', job.status)
                if old_status != 'PUBLISHED' and new_status == 'PUBLISHED':
                    serializer.validated_data['published_at'] = timezone.now()
                
                with transaction.atomic():
                    updated_job = serializer.save()

                    if skills_data is not None:
                        JobSkill.objects.filter(job=updated_job).delete()
                        for sk_item in skills_data:
                            name = sk_item.get('name')
                            if name:
                                norm = Skill.normalize_skill_name(name)
                                skill_obj, _ = Skill.objects.get_or_create(
                                    normalized_name=norm,
                                    defaults={'name': name.strip()}
                                )
                                JobSkill.objects.create(
                                    job=updated_job,
                                    skill=skill_obj,
                                    importance=sk_item.get('importance', 'MEDIUM'),
                                    required=sk_item.get('required', True)
                                )

                if old_status != 'PUBLISHED' and updated_job.status == 'PUBLISHED':
                    job_id = updated_job.id
                    transaction.on_commit(lambda: threading.Thread(target=process_job_published_recommendations, args=(job_id,)).start())

                return Response({
                    "success": True,
                    "message": "Job listing updated successfully.",
                    "job": JobSerializer(updated_job, context={'request': request}).data
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Job.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Job not found."}}, status=status.HTTP_404_NOT_FOUND)

