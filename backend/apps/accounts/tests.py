from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, EmailVerificationCode

class AccountsAuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_email_verification_and_login_flow(self):
        # 1. Signup
        signup_data = {
            "email": "testuser@example.com",
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "Student",
            "role": "STUDENT"
        }
        res = self.client.post('/api/v1/auth/signup/', signup_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])

        user = User.objects.get(email="testuser@example.com")
        self.assertFalse(user.email_verified)

        # 2. Verify Email Code
        code_obj = EmailVerificationCode.objects.filter(user=user).latest('created_at')
        # Retrieve demo_code from response
        raw_code = res.data['demo_code']

        verify_res = self.client.post('/api/v1/auth/verify-email/', {
            "email": "testuser@example.com",
            "code": raw_code
        }, format='json')

        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_res.data['success'])
        user.refresh_from_db()
        self.assertTrue(user.email_verified)

        # 3. Login
        login_res = self.client.post('/api/v1/auth/login/', {
            "email": "testuser@example.com",
            "password": "Password123!"
        }, format='json')

        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', login_res.data)
        self.assertEqual(login_res.data['user']['role'], 'STUDENT')

    def test_role_based_permissions_student_cannot_post_job(self):
        student = User.objects.create_user(
            email="student_perm@example.com",
            password="Password123!",
            first_name="Perm",
            last_name="Test",
            role="STUDENT",
            email_verified=True
        )
        self.client.force_authenticate(user=student)

        # Attempt to post a job as student -> Should be 403 Forbidden
        job_data = {
            "company": 1,
            "title": "Unauthorized Job",
            "description": "Test",
            "employment_type": "FULL_TIME",
            "location": "Remote",
            "work_mode": "REMOTE",
            "application_url": "https://example.com"
        }
        res = self.client.post('/api/v1/jobs/admin/create/', job_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_forgot_password_and_reset_flow(self):
        # Create and verify a user first
        user = User.objects.create_user(
            email="forgot@example.com",
            password="OldPassword123!",
            first_name="Forgot",
            last_name="Test",
            role="STUDENT",
            email_verified=True
        )

        # 1. Request password reset
        res = self.client.post('/api/v1/auth/forgot-password/', {"email": "forgot@example.com"}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        reset_code = res.data['demo_code']

        # 2. Reset password with the code
        reset_res = self.client.post('/api/v1/auth/reset-password/', {
            "email": "forgot@example.com",
            "code": reset_code,
            "new_password": "NewPassword456!"
        }, format='json')
        self.assertEqual(reset_res.status_code, status.HTTP_200_OK)
        self.assertTrue(reset_res.data['success'])

        # 3. Old password should no longer work
        login_old = self.client.post('/api/v1/auth/login/', {
            "email": "forgot@example.com",
            "password": "OldPassword123!"
        }, format='json')
        self.assertEqual(login_old.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. New password should work
        login_new = self.client.post('/api/v1/auth/login/', {
            "email": "forgot@example.com",
            "password": "NewPassword456!"
        }, format='json')
        self.assertEqual(login_new.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', login_new.data)

    def test_me_endpoint_requires_auth(self):
        res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_returns_user_data(self):
        user = User.objects.create_user(
            email="metest@example.com",
            password="Password123!",
            first_name="Me",
            last_name="Test",
            role="STUDENT",
            email_verified=True
        )
        self.client.force_authenticate(user=user)
        res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['user']['email'], 'metest@example.com')

    def test_resend_verification_code(self):
        # Signup first
        self.client.post('/api/v1/auth/signup/', {
            "email": "resend@example.com",
            "password": "Password123!",
            "first_name": "Resend",
            "last_name": "Test",
            "role": "STUDENT"
        }, format='json')

        # Resend code
        res = self.client.post('/api/v1/auth/resend-code/', {"email": "resend@example.com"}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        self.assertIn('demo_code', res.data)

    def test_login_unverified_email_rejected(self):
        User.objects.create_user(
            email="unverified@example.com",
            password="Password123!",
            first_name="Unverified",
            last_name="User",
            role="STUDENT",
            email_verified=False
        )
        res = self.client.post('/api/v1/auth/login/', {
            "email": "unverified@example.com",
            "password": "Password123!"
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
