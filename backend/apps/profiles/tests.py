from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.profiles.models import Profile, UserPreference, Skill, UserSkill, Education, Experience, Project, Certification

class ProfileCRUDTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email="profile_test@example.com",
            password="Password123!",
            first_name="Profile",
            last_name="Test",
            role="STUDENT",
            email_verified=True
        )
        Profile.objects.create(user=self.student)
        UserPreference.objects.create(user=self.student)
        self.client.force_authenticate(user=self.student)

    def test_get_full_profile(self):
        res = self.client.get('/api/v1/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        self.assertIn('profile', res.data['data'])
        self.assertIn('skills', res.data['data'])
        self.assertIn('education', res.data['data'])
        self.assertIn('experience', res.data['data'])
        self.assertIn('certifications', res.data['data'])

    def test_update_profile(self):
        res = self.client.put('/api/v1/profile/', {
            "headline": "Full Stack Developer",
            "bio": "Passionate coder",
            "location": "Bangalore"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['profile']['headline'], "Full Stack Developer")

    def test_update_preferences(self):
        res = self.client.put('/api/v1/profile/preferences/', {
            "preferred_locations": ["Remote", "Hyderabad"],
            "preferred_work_modes": ["REMOTE"],
            "preferred_employment_types": ["FULL_TIME"]
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("Remote", res.data['preference']['preferred_locations'])

    def test_add_and_delete_skill(self):
        # Add
        res = self.client.post('/api/v1/profile/skills/', {"skill_name": "Python"}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        skill_id = res.data['skill']['id']

        # List
        list_res = self.client.get('/api/v1/profile/skills/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data['skills']), 1)

        # Delete
        del_res = self.client.delete(f'/api/v1/profile/skills/?id={skill_id}')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)

    def test_education_crud(self):
        # Create
        res = self.client.post('/api/v1/profile/education/', {
            "institution": "MIT",
            "degree": "B.Tech",
            "field_of_study": "Computer Science",
            "start_date": "2020-08-01"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        edu_id = res.data['education']['id']

        # Update
        update_res = self.client.put(f'/api/v1/profile/education/{edu_id}/', {
            "degree": "M.Tech"
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['education']['degree'], "M.Tech")

        # Delete
        del_res = self.client.delete(f'/api/v1/profile/education/{edu_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)

    def test_experience_crud(self):
        # Create
        res = self.client.post('/api/v1/profile/experience/', {
            "company": "Google",
            "job_title": "SDE Intern",
            "start_date": "2023-05-01",
            "end_date": "2023-08-01"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        exp_id = res.data['experience']['id']

        # Update
        update_res = self.client.put(f'/api/v1/profile/experience/{exp_id}/', {
            "job_title": "SDE 1"
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['experience']['job_title'], "SDE 1")

        # Delete
        del_res = self.client.delete(f'/api/v1/profile/experience/{exp_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)

    def test_project_crud(self):
        # Create
        res = self.client.post('/api/v1/profile/projects/', {
            "name": "Job Portal",
            "description": "A full-stack job platform",
            "url": "https://github.com/test/job-portal"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        proj_id = res.data['project']['id']

        # Update
        update_res = self.client.put(f'/api/v1/profile/projects/{proj_id}/', {
            "name": "Job Portal v2"
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['project']['name'], "Job Portal v2")

        # Delete
        del_res = self.client.delete(f'/api/v1/profile/projects/{proj_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)

    def test_certification_crud(self):
        # Create
        res = self.client.post('/api/v1/profile/certifications/', {
            "name": "AWS Solutions Architect",
            "issuing_organization": "Amazon Web Services",
            "issue_date": "2023-01-15"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        cert_id = res.data['certification']['id']

        # List
        list_res = self.client.get('/api/v1/profile/certifications/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data['certifications']), 1)

        # Update
        update_res = self.client.put(f'/api/v1/profile/certifications/{cert_id}/', {
            "name": "AWS Solutions Architect (Associate)"
        }, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)

        # Delete
        del_res = self.client.delete(f'/api/v1/profile/certifications/{cert_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)

    def test_dashboard_endpoint(self):
        res = self.client.get('/api/v1/profile/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        dashboard = res.data['dashboard']
        self.assertIn('total_applications', dashboard)
        self.assertIn('saved_jobs_count', dashboard)
        self.assertIn('profile_completion', dashboard)
        self.assertIn('top_recommendations', dashboard)
        self.assertIn('recent_activity', dashboard)
