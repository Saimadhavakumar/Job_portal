from rest_framework import serializers
from .models import Recommendation
from apps.jobs.serializers import JobSerializer

class RecommendationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ('id', 'job', 'score', 'matching_skills', 'missing_skills', 'reason', 'algorithm_version', 'created_at')
