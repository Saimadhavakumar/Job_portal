from django.db import models
from django.conf import settings

class Resume(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255, default='My Resume')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.email})"

class ResumeVersion(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    )
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to='resumes/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    mime_type = models.CharField(max_length=100, default='application/pdf')
    version_number = models.IntegerField()
    parsing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    parsed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"v{self.version_number} - {self.file_name} ({self.parsing_status})"

class ParsedResume(models.Model):
    resume_version = models.OneToOneField(ResumeVersion, on_delete=models.CASCADE, related_name='parsed_data')
    raw_text = models.TextField()
    structured_data = models.JSONField(default=dict)
    parser_version = models.CharField(max_length=20, default='v1')
    parsed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Parsed data for Resume Version {self.resume_version.id}"
