from rest_framework import serializers
from .models import Resume, ResumeVersion, ParsedResume

class ParsedResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParsedResume
        fields = ('id', 'raw_text', 'structured_data', 'parser_version', 'parsed_at')

class ResumeVersionSerializer(serializers.ModelSerializer):
    parsed_data = ParsedResumeSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ResumeVersion
        fields = ('id', 'file_url', 'file_name', 'file_size', 'mime_type', 'version_number', 'parsing_status', 'uploaded_at', 'parsed_at', 'parsed_data')

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return ""

class ResumeSerializer(serializers.ModelSerializer):
    active_version = serializers.SerializerMethodField()
    versions_count = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ('id', 'title', 'is_active', 'active_version', 'versions_count', 'created_at', 'updated_at')

    def get_active_version(self, obj):
        v = obj.versions.order_by('-version_number').first()
        if v:
            return ResumeVersionSerializer(v, context=self.context).data
        return None

    def get_versions_count(self, obj):
        return obj.versions.count()
