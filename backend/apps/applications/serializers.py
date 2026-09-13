from rest_framework import serializers
from .models import SavedJob, Application, ApplicationStatusHistory
from apps.jobs.serializers import JobSerializer
from apps.resumes.serializers import ResumeVersionSerializer
from apps.accounts.serializers import UserSerializer

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ('id', 'job', 'created_at')

class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='System')

    class Meta:
        model = ApplicationStatusHistory
        fields = ('id', 'old_status', 'new_status', 'changed_by_name', 'note', 'created_at')

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    resume_version = ResumeVersionSerializer(read_only=True)
    history = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = ('id', 'job', 'resume_version', 'status', 'history', 'applied_at', 'updated_at')

class AdminApplicationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    resume_version = ResumeVersionSerializer(read_only=True)
    history = ApplicationStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Application
        fields = ('id', 'user', 'job', 'resume_version', 'status', 'history', 'applied_at', 'updated_at')
