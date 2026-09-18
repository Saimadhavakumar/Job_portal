import os
import tempfile
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.resumes.models import Resume, ResumeVersion, ParsedResume
from apps.resumes.services import parse_resume_version
from apps.profiles.models import UserSkill
from apps.companies.models import Company
from apps.jobs.models import Job, JobSkill
from apps.recommendations.services import process_job_published_recommendations
from apps.notifications.models import Notification, EmailLog

class ResumeParsingAndMatchingTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'email': 'resume_candidate@example.com',
            'password': 'Password123!',
            'first_name': 'Candidate',
            'last_name': 'User',
            'role': 'STUDENT'
        }
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='AdminPassword123!',
            first_name='Admin',
            last_name='User'
        )

    def test_signup_with_resume_upload(self):
        # Create dummy PDF file content
        pdf_content = b"%PDF-1.4 Mock PDF content containing Python, Django, React, Docker, and PostgreSQL skills."
        resume_file = SimpleUploadedFile(
            "candidate_resume.pdf",
            pdf_content,
            content_type="application/pdf"
        )

        data = {**self.user_data, 'resume': resume_file}
        res = self.client.post('/api/v1/auth/register/', data, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])

        user = User.objects.get(email=self.user_data['email'])
        self.assertTrue(Resume.objects.filter(user=user).exists())
        
        resume = Resume.objects.get(user=user)
        self.assertEqual(resume.versions.count(), 1)
        rv = resume.versions.first()
        self.assertEqual(rv.file_name, "candidate_resume.pdf")

    def test_resume_parsing_extracts_skills_and_updates_user(self):
        user = User.objects.create_user(**self.user_data)
        resume = Resume.objects.create(user=user, title="Test Resume")
        
        pdf_file = SimpleUploadedFile(
            "test_resume.pdf",
            b"%PDF-1.4 Mock PDF with skills Python, Django, React, PostgreSQL, Docker",
            content_type="application/pdf"
        )

        rv = ResumeVersion.objects.create(
            resume=resume,
            file=pdf_file,
            file_name="test_resume.pdf",
            file_size=100,
            version_number=1,
            parsing_status='PENDING'
        )

        success = parse_resume_version(rv.id)
        self.assertTrue(success)

        rv.refresh_from_db()
        self.assertEqual(rv.parsing_status, 'COMPLETED')
        self.assertTrue(ParsedResume.objects.filter(resume_version=rv).exists())

        # Verify extracted skills are attached to user
        extracted_skill_names = set(UserSkill.objects.filter(user=user).values_list('skill__name', flat=True))
        self.assertIn('Python', extracted_skill_names)
        self.assertIn('Django', extracted_skill_names)
        self.assertIn('React', extracted_skill_names)

    def test_admin_job_post_triggers_match_and_email_notification(self):
        candidate = User.objects.create_user(
            email='matched_candidate@example.com',
            password='Password123!',
            first_name='Matched',
            last_name='Candidate',
            role='STUDENT',
            email_verified=True
        )
        
        # Pre-assign skills to candidate
        from apps.profiles.models import Skill
        py_skill, _ = Skill.objects.get_or_create(name='Python', normalized_name='python')
        dj_skill, _ = Skill.objects.get_or_create(name='Django', normalized_name='django')
        UserSkill.objects.create(user=candidate, skill=py_skill, source='RESUME')
        UserSkill.objects.create(user=candidate, skill=dj_skill, source='RESUME')

        # Admin posts a published job
        company = Company.objects.create(name='TechCorp', location='Remote')
        job = Job.objects.create(
            created_by=self.admin_user,
            company=company,
            title='Backend Django Developer',
            description='Looking for Python & Django developer',
            location='Remote',
            work_mode='REMOTE',
            employment_type='FULL_TIME',
            status='PUBLISHED'
        )
        JobSkill.objects.create(job=job, skill=py_skill, required=True)
        JobSkill.objects.create(job=job, skill=dj_skill, required=True)

        # Run process_job_published_recommendations synchronously
        process_job_published_recommendations(job.id)

        # Verify notification created
        self.assertTrue(Notification.objects.filter(user=candidate, job=job, type='NEW_JOB_MATCH').exists())
        
        # Verify email logged and sent to mail.outbox
        email_log = EmailLog.objects.filter(user=candidate, notification__job=job).first()
        self.assertIsNotNone(email_log)
        self.assertEqual(email_log.status, 'SENT')
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Backend Django Developer', mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, [candidate.email])
