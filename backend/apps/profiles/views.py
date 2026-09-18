from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import (
    Profile, UserPreference, Skill, UserSkill,
    Project, ProjectSkill, Education, Experience, ExperienceSkill, Certification
)
from .serializers import (
    ProfileSerializer, UserPreferenceSerializer, UserSkillSerializer,
    ProjectSerializer, EducationSerializer, ExperienceSerializer,
    CertificationSerializer, FullCandidateProfileSerializer
)
from apps.applications.models import Application, SavedJob
from apps.recommendations.models import Recommendation
from apps.notifications.models import Notification

class CandidateProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        preference, _ = UserPreference.objects.get_or_create(user=user)
        skills = UserSkill.objects.filter(user=user).select_related('skill')
        projects = Project.objects.filter(user=user)
        education = Education.objects.filter(user=user)
        experience = Experience.objects.filter(user=user)
        certifications = Certification.objects.filter(user=user)

        data = {
            "profile": ProfileSerializer(profile, context={'request': request}).data,
            "preference": UserPreferenceSerializer(preference).data,
            "skills": UserSkillSerializer(skills, many=True).data,
            "projects": ProjectSerializer(projects, many=True).data,
            "education": EducationSerializer(education, many=True).data,
            "experience": ExperienceSerializer(experience, many=True).data,
            "certifications": CertificationSerializer(certifications, many=True).data,
        }
        return Response({"success": True, "data": data})

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Profile updated successfully.", "profile": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        preference, _ = UserPreference.objects.get_or_create(user=request.user)
        return Response({"success": True, "preference": UserPreferenceSerializer(preference).data})

    def put(self, request):
        preference, _ = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Preferences updated successfully.", "preference": serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserSkillManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        skills = UserSkill.objects.filter(user=request.user).select_related('skill')
        return Response({"success": True, "skills": UserSkillSerializer(skills, many=True).data})

    def post(self, request):
        serializer = UserSkillSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user_skill = serializer.save()
            return Response({"success": True, "skill": UserSkillSerializer(user_skill).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        skill_id = request.query_params.get('id')
        if not skill_id:
            return Response({"success": False, "error": {"code": "MISSING_PARAM", "message": "skill_id query parameter is required."}}, status=status.HTTP_400_BAD_REQUEST)
        deleted_count, _ = UserSkill.objects.filter(user=request.user, id=skill_id).delete()
        if deleted_count == 0:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Skill not found."}}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "message": "Skill removed successfully."})

class ProjectManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(user=request.user).order_by('-created_at')
        return Response({"success": True, "projects": ProjectSerializer(projects, many=True).data})

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(user=request.user)
            # Handle skill associations if provided
            self._sync_project_skills(project, request.data.get('skill_names', []))
            return Response({"success": True, "project": ProjectSerializer(project).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _sync_project_skills(self, project, skill_names):
        """Associate skills with the project."""
        if not skill_names:
            return
        ProjectSkill.objects.filter(project=project).delete()
        for s_name in skill_names:
            norm = Skill.normalize_skill_name(s_name)
            skill, _ = Skill.objects.get_or_create(
                normalized_name=norm,
                defaults={'name': s_name.strip()}
            )
            ProjectSkill.objects.get_or_create(project=project, skill=skill)

class ProjectDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, id):
        try:
            project = Project.objects.get(id=id, user=request.user)
        except Project.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Project not found."}}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            skill_names = request.data.get('skill_names')
            if skill_names is not None:
                ProjectSkill.objects.filter(project=updated).delete()
                for s_name in skill_names:
                    norm = Skill.normalize_skill_name(s_name)
                    skill, _ = Skill.objects.get_or_create(
                        normalized_name=norm,
                        defaults={'name': s_name.strip()}
                    )
                    ProjectSkill.objects.get_or_create(project=updated, skill=skill)
            return Response({"success": True, "message": "Project updated successfully.", "project": ProjectSerializer(updated).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        deleted_count, _ = Project.objects.filter(id=id, user=request.user).delete()
        if deleted_count == 0:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Project not found."}}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "message": "Project deleted successfully."})

class ExperienceManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        experiences = Experience.objects.filter(user=request.user).order_by('-start_date')
        return Response({"success": True, "experience": ExperienceSerializer(experiences, many=True).data})

    def post(self, request):
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            exp = serializer.save(user=request.user)
            self._sync_experience_skills(exp, request.data.get('skill_names', []))
            return Response({"success": True, "experience": ExperienceSerializer(exp).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _sync_experience_skills(self, experience, skill_names):
        """Associate skills with the experience entry."""
        if not skill_names:
            return
        ExperienceSkill.objects.filter(experience=experience).delete()
        for s_name in skill_names:
            norm = Skill.normalize_skill_name(s_name)
            skill, _ = Skill.objects.get_or_create(
                normalized_name=norm,
                defaults={'name': s_name.strip()}
            )
            ExperienceSkill.objects.get_or_create(experience=experience, skill=skill)

class ExperienceDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, id):
        try:
            exp = Experience.objects.get(id=id, user=request.user)
        except Experience.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Experience entry not found."}}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExperienceSerializer(exp, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            skill_names = request.data.get('skill_names')
            if skill_names is not None:
                ExperienceSkill.objects.filter(experience=updated).delete()
                for s_name in skill_names:
                    norm = Skill.normalize_skill_name(s_name)
                    skill, _ = Skill.objects.get_or_create(
                        normalized_name=norm,
                        defaults={'name': s_name.strip()}
                    )
                    ExperienceSkill.objects.get_or_create(experience=updated, skill=skill)
            return Response({"success": True, "message": "Experience updated successfully.", "experience": ExperienceSerializer(updated).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        deleted_count, _ = Experience.objects.filter(id=id, user=request.user).delete()
        if deleted_count == 0:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Experience entry not found."}}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "message": "Experience deleted successfully."})

class EducationManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        education = Education.objects.filter(user=request.user).order_by('-start_date')
        return Response({"success": True, "education": EducationSerializer(education, many=True).data})

    def post(self, request):
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            edu = serializer.save(user=request.user)
            return Response({"success": True, "education": EducationSerializer(edu).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EducationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, id):
        try:
            edu = Education.objects.get(id=id, user=request.user)
        except Education.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Education entry not found."}}, status=status.HTTP_404_NOT_FOUND)

        serializer = EducationSerializer(edu, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({"success": True, "message": "Education updated successfully.", "education": EducationSerializer(updated).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        deleted_count, _ = Education.objects.filter(id=id, user=request.user).delete()
        if deleted_count == 0:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Education entry not found."}}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "message": "Education deleted successfully."})

class CertificationManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        certs = Certification.objects.filter(user=request.user).order_by('-issue_date')
        return Response({"success": True, "certifications": CertificationSerializer(certs, many=True).data})

    def post(self, request):
        serializer = CertificationSerializer(data=request.data)
        if serializer.is_valid():
            cert = serializer.save(user=request.user)
            return Response({"success": True, "certification": CertificationSerializer(cert).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CertificationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, id):
        try:
            cert = Certification.objects.get(id=id, user=request.user)
        except Certification.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Certification not found."}}, status=status.HTTP_404_NOT_FOUND)

        serializer = CertificationSerializer(cert, data=request.data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response({"success": True, "message": "Certification updated successfully.", "certification": CertificationSerializer(updated).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        deleted_count, _ = Certification.objects.filter(id=id, user=request.user).delete()
        if deleted_count == 0:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Certification not found."}}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "message": "Certification deleted successfully."})

class StudentDashboardView(APIView):
    """Aggregated stats for the student dashboard."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Application stats
        total_applications = Application.objects.filter(user=user).count()
        active_applications = Application.objects.filter(user=user).exclude(status__in=['WITHDRAWN', 'REJECTED']).count()
        application_breakdown = {}
        for choice_val, choice_label in Application.STATUS_CHOICES:
            count = Application.objects.filter(user=user, status=choice_val).count()
            if count > 0:
                application_breakdown[choice_val] = count

        # Saved jobs count
        saved_jobs_count = SavedJob.objects.filter(user=user).count()

        # Unread notifications
        unread_notifications = Notification.objects.filter(user=user, is_read=False).count()

        # Profile completion percentage
        profile_completion = self._calculate_profile_completion(user)

        # Top 3 recommendations
        top_recs = Recommendation.objects.filter(
            user=user, job__status='PUBLISHED'
        ).select_related('job', 'job__company').order_by('-score')[:3]

        top_recommendations = [{
            "job_id": rec.job.id,
            "job_title": rec.job.title,
            "company_name": rec.job.company.name,
            "score": rec.score,
            "slug": rec.job.slug,
            "matching_skills": rec.matching_skills[:3],
        } for rec in top_recs]

        # Recent application updates (latest 5 status changes)
        from apps.applications.models import ApplicationStatusHistory
        recent_updates = ApplicationStatusHistory.objects.filter(
            application__user=user
        ).select_related('application__job', 'application__job__company').order_by('-created_at')[:5]

        recent_activity = [{
            "application_id": h.application.id,
            "job_title": h.application.job.title,
            "company_name": h.application.job.company.name,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "changed_at": h.created_at,
        } for h in recent_updates]

        return Response({
            "success": True,
            "dashboard": {
                "total_applications": total_applications,
                "active_applications": active_applications,
                "application_breakdown": application_breakdown,
                "saved_jobs_count": saved_jobs_count,
                "unread_notifications": unread_notifications,
                "profile_completion": profile_completion,
                "top_recommendations": top_recommendations,
                "recent_activity": recent_activity,
            }
        })

    def _calculate_profile_completion(self, user):
        """Calculate profile completion percentage based on key fields."""
        score = 0
        total = 8  # Total checkpoints

        # 1. Basic profile exists with headline
        try:
            profile = user.profile
            if profile.headline:
                score += 1
            if profile.bio:
                score += 1
            if profile.phone or profile.location:
                score += 1
        except Profile.DoesNotExist:
            pass

        # 2. Has at least one skill
        if UserSkill.objects.filter(user=user).exists():
            score += 1

        # 3. Has uploaded a resume
        from apps.resumes.models import Resume
        if Resume.objects.filter(user=user).exists():
            score += 1

        # 4. Has at least one education entry
        if Education.objects.filter(user=user).exists():
            score += 1

        # 5. Has at least one experience or project
        if Experience.objects.filter(user=user).exists() or Project.objects.filter(user=user).exists():
            score += 1

        # 6. Has set preferences
        try:
            pref = user.preference
            if pref.preferred_locations or pref.preferred_work_modes or pref.preferred_employment_types:
                score += 1
        except UserPreference.DoesNotExist:
            pass

        return round((score / total) * 100)
