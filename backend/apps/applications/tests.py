from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.companies.models import Company
from apps.jobs.models import Job
from apps.resumes.models import Resume, ResumeVersion
from apps.applications.models import Application, SavedJob
from apps.profiles.models import Profile, UserPreference

class ApplicationFlowTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create student
        self.student = User.objects.create_user(
            email="applicant@example.com",
            password="Password123!",
            first_name="Test",
            last_name="Applicant",
            role="STUDENT",
            email_verified=True
        )
        Profile.objects.create(user=self.student)
        UserPreference.objects.create(user=self.student)

        # Create admin
        self.admin = User.objects.create_superuser(
            email="admin_app@example.com",
            password="Admin123!",
            first_name="Admin",
            last_name="Test"
        )

        # Create company and job
        self.company = Company.objects.create(name="TestCorp", location="Remote")
        self.job = Job.objects.create(
            company=self.company,
            title="Software Engineer",
            description="Build things",
            employment_type="FULL_TIME",
            location="Remote",
            work_mode="REMOTE",
            application_url="https://example.com",
            status="PUBLISHED",
            created_by=self.admin
        )

        # Create resume for student
        self.resume = Resume.objects.create(user=self.student, title="My Resume")
        self.rv = ResumeVersion.objects.create(
            resume=self.resume,
            file="resumes/test.pdf",
            file_name="test.pdf",
            file_size=1024,
            version_number=1,
            parsing_status="COMPLETED"
        )

    def test_apply_for_job(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post(f'/api/v1/applications/apply/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['application']['status'], 'APPLIED')

    def test_duplicate_application_prevented(self):
        self.client.force_authenticate(user=self.student)
        self.client.post(f'/api/v1/applications/apply/{self.job.id}/')
        # Second attempt should fail
        res = self.client.post(f'/api/v1/applications/apply/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['error']['code'], 'ALREADY_APPLIED')

    def test_apply_without_resume_rejected(self):
        # Create student with no resume
        student2 = User.objects.create_user(
            email="noresume@example.com",
            password="Password123!",
            first_name="No",
            last_name="Resume",
            role="STUDENT",
            email_verified=True
        )
        self.client.force_authenticate(user=student2)
        res = self.client.post(f'/api/v1/applications/apply/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['error']['code'], 'NO_RESUME')

    def test_withdraw_application(self):
        self.client.force_authenticate(user=self.student)
        apply_res = self.client.post(f'/api/v1/applications/apply/{self.job.id}/')
        app_id = apply_res.data['application']['id']

        # Withdraw
        res = self.client.post(f'/api/v1/applications/{app_id}/withdraw/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['application']['status'], 'WITHDRAWN')

    def test_cannot_withdraw_rejected_application(self):
        self.client.force_authenticate(user=self.student)
        apply_res = self.client.post(f'/api/v1/applications/apply/{self.job.id}/')
        app_id = apply_res.data['application']['id']

        # Admin rejects
        app = Application.objects.get(id=app_id)
        app.status = 'REJECTED'
        app.save()

        # Student tries to withdraw rejected
        res = self.client.post(f'/api/v1/applications/{app_id}/withdraw/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data['error']['code'], 'INVALID_STATUS_TRANSITION')

    def test_save_and_unsave_job(self):
        self.client.force_authenticate(user=self.student)

        # Save
        res = self.client.post(f'/api/v1/applications/save/{self.job.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['saved'])

        # List saved jobs
        list_res = self.client.get('/api/v1/applications/saved/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)

        # Unsave (toggle)
        res2 = self.client.post(f'/api/v1/applications/save/{self.job.id}/')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data['saved'])

    def test_student_application_list(self):
        self.client.force_authenticate(user=self.student)
        self.client.post(f'/api/v1/applications/apply/{self.job.id}/')

        res = self.client.get('/api/v1/applications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_admin_update_application_status(self):
        self.client.force_authenticate(user=self.student)
        apply_res = self.client.post(f'/api/v1/applications/apply/{self.job.id}/')
        app_id = apply_res.data['application']['id']

        # Switch to admin
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/v1/applications/admin/{app_id}/status/', {
            "status": "SCREENING",
            "note": "Moving to screening phase"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['application']['status'], 'SCREENING')

    def test_admin_application_list(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/v1/applications/admin/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_student_cannot_access_admin_applications(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.get('/api/v1/applications/admin/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
