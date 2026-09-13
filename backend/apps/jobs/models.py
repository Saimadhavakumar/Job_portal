from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.companies.models import Company
from apps.profiles.models import Skill

class Job(models.Model):
    EMPLOYMENT_TYPES = (
        ('INTERNSHIP', 'Internship'),
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
    )
    WORK_MODES = (
        ('REMOTE', 'Remote'),
        ('HYBRID', 'Hybrid'),
        ('ONSITE', 'Onsite'),
    )
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PENDING', 'Pending'),
        ('PUBLISHED', 'Published'),
        ('CLOSED', 'Closed'),
        ('EXPIRED', 'Expired'),
        ('ARCHIVED', 'Archived'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField()
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES)
    experience_level = models.CharField(max_length=50, default='Entry Level')
    location = models.CharField(max_length=150)
    work_mode = models.CharField(max_length=20, choices=WORK_MODES)
    application_url = models.URLField()
    application_deadline = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT', db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_jobs')
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.company.name}-{self.title}")
            slug = base_slug
            count = 1
            while Job.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} at {self.company.name}"

class JobSkill(models.Model):
    IMPORTANCE_CHOICES = (('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'))
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='job_requirements')
    importance = models.CharField(max_length=10, choices=IMPORTANCE_CHOICES, default='MEDIUM')
    required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'skill')

    def __str__(self):
        return f"{self.job.title} - {self.skill.name} (Required: {self.required})"

class JobSource(models.Model):
    SOURCE_TYPES = (
        ('WHATSAPP', 'WhatsApp'),
        ('TELEGRAM', 'Telegram'),
        ('WEBSITE', 'Website'),
        ('ADMIN', 'Admin'),
        ('COMPANY', 'Company'),
        ('OTHER', 'Other'),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='sources')
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    source_url = models.URLField(blank=True)
    source_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Source for {self.job.title}: {self.source_type}"
