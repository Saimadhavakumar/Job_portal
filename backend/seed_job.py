import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from apps.companies.models import Company
from apps.jobs.models import Job, JobSkill, JobSource
from apps.profiles.models import Skill
from apps.accounts.models import User
from django.utils import timezone

def seed_trinet_job():
    print("Seeding TriNet Associate Data Scientist job...")

    # Get or create admin user for job authorship
    admin_user = User.objects.filter(role='ADMIN').first()
    if not admin_user:
        admin_user = User.objects.filter(is_staff=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser(
            email='admin@jobportal.com',
            first_name='Admin',
            last_name='User',
            password='adminpassword123'
        )

    # 1. Create or get Company
    company, created = Company.objects.get_or_create(
        name="TriNet",
        defaults={
            "website": "https://www.trinet.com",
            "industry": "Human Resources & Technology",
            "location": "Hyderabad, Telangana, India",
            "description": "TriNet is a leading provider of comprehensive human resources solutions for small to midsize businesses (SMBs). NYSE: TNET.",
            "company_size": "5000-10000"
        }
    )
    if created:
        print(f"Created Company: {company.name}")
    else:
        print(f"Found existing Company: {company.name}")

    # 2. Create Job Listing
    job_title = "Associate Data Scientist"
    job_slug = "associate-data-scientist-trinet-hyderabad"

    description_text = """TriNet is a leading provider of comprehensive human resources solutions for small to midsize businesses (SMBs). We enhance business productivity by enabling our clients to outsource their HR function to one strategic partner and allowing them to focus on operating and growing their core businesses. Our full-service HR solutions include features such as payroll processing, human capital consulting, employment law compliance and employee benefits, including health insurance, retirement plans and workers’ compensation insurance.

TriNet has a nationwide presence and an experienced executive team. Our stock is publicly traded on the NYSE under the ticker symbol TNET. If you’re passionate about innovation and making an impact on the large SMB market, come join us as we power our clients’ business success with extraordinary HR.

Responsibilities:
- Collaborate with cross-functional teams to build data-driven HR analytics solutions.
- Analyze large-scale HR, payroll, and benefits datasets to extract actionable insights.
- Develop predictive models and machine learning pipelines using Python and SQL.
- Create dashboard visualizations and communicate analytical findings to stakeholders.

Key Requirements:
- 0 to 1 year of experience in Data Science, Analytics, or Machine Learning.
- Bachelor's or Master's degree in Data Science, Computer Science, Statistics, Mathematics, or related quantitative field.
- Strong proficiency in Python (Pandas, NumPy, Scikit-Learn) and SQL.
- Understanding of statistical modeling, hypothesis testing, and machine learning fundamentals.
- Excellent problem-solving skills and communication abilities."""

    job, job_created = Job.objects.get_or_create(
        slug=job_slug,
        defaults={
            "company": company,
            "title": job_title,
            "work_mode": "HYBRID",
            "employment_type": "FULL_TIME",
            "experience_level": "Entry Level",
            "location": "Hyderabad, Telangana, India",
            "description": description_text,
            "application_url": "https://www.linkedin.com/jobs/view/4460341131/",
            "status": "PUBLISHED",
            "published_at": timezone.now(),
            "created_by": admin_user
        }
    )

    if job_created:
        print(f"Created Job: {job.title} at {company.name}")
    else:
        print(f"Job already exists: {job.title}")

    # 3. Add Job Skills
    skills_list = [
        {"name": "Python", "importance": "HIGH", "required": True},
        {"name": "Data Science", "importance": "HIGH", "required": True},
        {"name": "Machine Learning", "importance": "MEDIUM", "required": True},
        {"name": "SQL", "importance": "HIGH", "required": True},
        {"name": "Statistics", "importance": "MEDIUM", "required": False},
        {"name": "Data Analytics", "importance": "MEDIUM", "required": False},
    ]

    for sk_data in skills_list:
        norm = Skill.normalize_skill_name(sk_data["name"])
        skill_obj, _ = Skill.objects.get_or_create(
            normalized_name=norm,
            defaults={"name": sk_data["name"]}
        )
        JobSkill.objects.update_or_create(
            job=job,
            skill=skill_obj,
            defaults={
                "importance": sk_data["importance"],
                "required": sk_data["required"]
            }
        )

    # 4. Add Source
    JobSource.objects.get_or_create(
        job=job,
        source_type="WEBSITE",
        defaults={
            "source_url": "https://www.linkedin.com/jobs/view/4460341131/",
            "source_name": "LinkedIn"
        }
    )

    print("Successfully seeded skills and job source!")
    print(f"Job URL slug: /jobs/{job.slug}")

if __name__ == "__main__":
    seed_trinet_job()
