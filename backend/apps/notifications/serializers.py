from rest_framework import serializers
from .models import Notification, EmailLog
from apps.jobs.serializers import JobSerializer

class NotificationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'type', 'title', 'message', 'job', 'is_read', 'created_at')

class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = ('id', 'user', 'email_type', 'status', 'provider_message_id', 'sent_at', 'failed_at', 'error_message', 'created_at')
