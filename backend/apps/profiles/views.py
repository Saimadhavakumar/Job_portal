from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import (
    Profile, UserPreference, Skill, UserSkill,
    Project, Education, Experience, Certification
)
from .serializers import (
    ProfileSerializer, UserPreferenceSerializer, UserSkillSerializer,
    ProjectSerializer, EducationSerializer, ExperienceSerializer,
    CertificationSerializer, FullCandidateProfileSerializer
)

class CandidateProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
            "profile": ProfileSerializer(profile).data,
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
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
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
        UserSkill.objects.filter(user=request.user, id=skill_id).delete()
        return Response({"success": True, "message": "Skill removed successfully."})

class ProjectManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(user=request.user)
            return Response({"success": True, "project": ProjectSerializer(project).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExperienceManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            exp = serializer.save(user=request.user)
            return Response({"success": True, "experience": ExperienceSerializer(exp).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EducationManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            edu = serializer.save(user=request.user)
            return Response({"success": True, "education": EducationSerializer(edu).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
