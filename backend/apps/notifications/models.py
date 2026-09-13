from django.db import models
from django.conf import settings
from apps.jobs.models import Job

class Notification(models.Model):
    TYPE_CHOICES = (
        ('NEW_JOB_MATCH', 'New Job Match'),
        ('APPLICATION_UPDATE', 'Application Update'),
        ('DEADLINE_REMINDER', 'Deadline Reminder'),
        ('SYSTEM', 'System Notification'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    job = models.ForeignKey(Job, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} for {self.user.email}: {self.title}"

class EmailLog(models.Model):
    STATUS_CHOICES = (('QUEUED', 'Queued'), ('SENT', 'Sent'), ('FAILED', 'Failed'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notification = models.ForeignKey(Notification, on_delete=models.SET_NULL, null=True)
    email_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED')
    provider_message_id = models.CharField(max_length=255, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"EmailLog {self.id} ({self.email_type}) -> {self.status}"
