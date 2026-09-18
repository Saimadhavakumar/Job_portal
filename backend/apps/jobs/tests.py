from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.companies.models import Company
from apps.jobs.models import Job, JobSkill
from apps.profiles.models import Skill

class JobsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email="admin_jobs@example.com",
            password="AdminPassword123!",
            first_name="Admin",
            last_name="User"
        )
        self.company = Company.objects.create(name="Tech Corp", location="Remote")
        self.skill_react = Skill.objects.create(name="React", normalized_name="react")
        self.skill_python = Skill.objects.create(name="Python", normalized_name="python")

    def test_admin_create_job_and_public_discovery(self):
        self.client.force_authenticate(user=self.admin)
        
        payload = {
            "company_id": self.company.id,
            "company": self.company.id,
            "title": "React Developer",
            "description": "Building UI interfaces",
            "employment_type": "FULL_TIME",
            "location": "Remote",
            "work_mode": "REMOTE",
            "application_url": "https://example.com/apply",
            "status": "PUBLISHED",
            "skills": [
                {"name": "React", "importance": "HIGH", "required": True},
                {"name": "Python", "importance": "MEDIUM", "required": False}
            ]
        }

        res = self.client.post('/api/v1/jobs/admin/create/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])

        job_id = res.data['job']['id']
        job = Job.objects.get(id=job_id)
        self.assertEqual(job.status, 'PUBLISHED')
        self.assertEqual(job.job_skills.count(), 2)

        # Public Discovery
        self.client.logout()
        disc_res = self.client.get('/api/v1/jobs/?search=React')
        self.assertEqual(disc_res.status_code, status.HTTP_200_OK)
        self.assertEqual(disc_res.data['count'], 1)
        self.assertEqual(len(disc_res.data['jobs']), 1)

