from rest_framework import serializers
from .models import Job, JobSkill, JobSource
from apps.companies.serializers import CompanySerializer
from apps.profiles.serializers import SkillSerializer

class JobSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = JobSkill
        fields = ('id', 'skill', 'skill_name', 'importance', 'required')

class JobSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSource
        fields = ('id', 'source_type', 'source_url', 'source_name')

class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    required_skills = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = (
            'id', 'company', 'company_id', 'title', 'slug', 'description',
            'employment_type', 'experience_level', 'location', 'work_mode',
            'application_url', 'application_deadline', 'status', 'published_at',
            'required_skills', 'is_saved', 'match_score', 'created_at'
        )

    def get_required_skills(self, obj):
        skills = JobSkill.objects.filter(job=obj).select_related('skill')
        return [
            {
                "id": js.skill.id,
                "name": js.skill.name,
                "importance": js.importance,
                "required": js.required
            } for js in skills
        ]

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.applications.models import SavedJob
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False

    def get_match_score(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'STUDENT':
            from apps.recommendations.models import Recommendation
            rec = Recommendation.objects.filter(user=request.user, job=obj).first()
            if rec:
                return {
                    "score": rec.score,
                    "matching_skills": rec.matching_skills,
                    "missing_skills": rec.missing_skills,
                    "reason": rec.reason
                }
        return None

class AdminJobCreateUpdateSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = Job
        fields = (
            'company', 'title', 'description', 'employment_type',
            'experience_level', 'location', 'work_mode', 'application_url',
            'application_deadline', 'status', 'skills'
        )

    def create(self, validated_data):
        validated_data.pop('skills', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('skills', None)
        return super().update(instance, validated_data)
