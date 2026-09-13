from django.db import models
from django.conf import settings
from apps.jobs.models import Job

class Recommendation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recommendations')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='recommendations')
    score = models.FloatField(db_index=True)
    matching_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    reason = models.TextField()
    algorithm_version = models.CharField(max_length=20, default='v1')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'job')

    def __str__(self):
        return f"{self.user.email} -> {self.job.title} ({self.score}%)"
