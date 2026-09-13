from rest_framework import serializers
from .models import (
    Profile, UserPreference, Skill, UserSkill,
    Project, ProjectSkill, Education, Experience, ExperienceSkill, Certification
)

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name', 'normalized_name', 'category')

class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = UserSkill
        fields = ('id', 'skill', 'skill_name', 'source', 'confidence', 'proficiency', 'created_at')

    def create(self, validated_data):
        user = self.context['request'].user
        skill_name = validated_data.pop('skill_name', None)
        if skill_name:
            norm = Skill.normalize_skill_name(skill_name)
            skill, _ = Skill.objects.get_or_create(
                normalized_name=norm,
                defaults={'name': skill_name.strip()}
            )
            validated_data['skill'] = skill
        validated_data['user'] = user
        user_skill, _ = UserSkill.objects.update_or_create(
            user=user,
            skill=validated_data['skill'],
            defaults={'source': validated_data.get('source', 'MANUAL')}
        )
        return user_skill

class ProjectSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'url', 'start_date', 'end_date', 'source', 'skills', 'created_at')

    def get_skills(self, obj):
        ps = ProjectSkill.objects.filter(project=obj).select_related('skill')
        return [p.skill.name for p in ps]

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ('id', 'institution', 'degree', 'field_of_study', 'start_date', 'end_date', 'description', 'created_at')

class ExperienceSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = ('id', 'company', 'job_title', 'description', 'start_date', 'end_date', 'is_current', 'skills', 'created_at')

    def get_skills(self, obj):
        es = ExperienceSkill.objects.filter(experience=obj).select_related('skill')
        return [e.skill.name for e in es]

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ('id', 'name', 'issuing_organization', 'issue_date', 'expiration_date', 'credential_url', 'description', 'created_at')

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ('id', 'preferred_locations', 'preferred_work_modes', 'preferred_employment_types', 'minimum_experience', 'notify_new_matches', 'notify_application_updates', 'updated_at')

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'email', 'first_name', 'last_name', 'headline', 'bio', 'phone', 'location', 'github_url', 'linkedin_url', 'portfolio_url', 'profile_image', 'updated_at')

class FullCandidateProfileSerializer(serializers.Serializer):
    profile = ProfileSerializer()
    preference = UserPreferenceSerializer()
    skills = UserSkillSerializer(many=True)
    projects = ProjectSerializer(many=True)
    education = EducationSerializer(many=True)
    experience = ExperienceSerializer(many=True)
    certifications = CertificationSerializer(many=True)
