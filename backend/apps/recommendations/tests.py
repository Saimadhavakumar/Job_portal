from django.test import TestCase
from apps.accounts.models import User
from apps.companies.models import Company
from apps.jobs.models import Job, JobSkill
from apps.profiles.models import Skill, UserSkill, UserPreference
from apps.recommendations.services import calculate_match_score

class RecommendationEngineTestCase(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email="candidate@example.com",
            password="Password123!",
            first_name="Candidate",
            last_name="One",
            role="STUDENT",
            email_verified=True
        )
        UserPreference.objects.create(
            user=self.student,
            preferred_locations=["Remote"],
            preferred_work_modes=["REMOTE"],
            preferred_employment_types=["FULL_TIME"]
        )
        
        self.skill_react = Skill.objects.create(name="React", normalized_name="react")
        self.skill_django = Skill.objects.create(name="Django", normalized_name="django")
        self.skill_docker = Skill.objects.create(name="Docker", normalized_name="docker")

        # Candidate skills
        UserSkill.objects.create(user=self.student, skill=self.skill_react, source="RESUME")
        UserSkill.objects.create(user=self.student, skill=self.skill_django, source="RESUME")

        self.company = Company.objects.create(name="Match Corp")
        self.job = Job.objects.create(
            company=self.company,
            title="Full Stack Developer",
            description="React & Django dev",
            employment_type="FULL_TIME",
            location="Remote",
            work_mode="REMOTE",
            application_url="https://example.com",
            status="PUBLISHED"
        )
        JobSkill.objects.create(job=self.job, skill=self.skill_react, required=True)
        JobSkill.objects.create(job=self.job, skill=self.skill_django, required=True)
        JobSkill.objects.create(job=self.job, skill=self.skill_docker, required=True)

    def test_weighted_recommendation_score(self):
        match_res = calculate_match_score(self.student, self.job)
        self.assertIn("React", match_res['matching_skills'])
        self.assertIn("Django", match_res['matching_skills'])
        self.assertIn("Docker", match_res['missing_skills'])
        self.assertGreater(match_res['score'], 70.0)
