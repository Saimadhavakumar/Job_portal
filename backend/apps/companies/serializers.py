from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ('id', 'name', 'slug', 'description', 'website', 'logo_url', 'location', 'industry', 'company_size', 'jobs_count', 'created_at', 'updated_at')

    def get_jobs_count(self, obj):
        return obj.jobs.filter(status='PUBLISHED').count()
