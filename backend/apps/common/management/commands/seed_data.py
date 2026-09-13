from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.companies.models import Company
from apps.jobs.models import Job, JobSkill
from apps.profiles.models import Skill, Profile, UserPreference
from apps.recommendations.services import process_job_published_recommendations

class Command(BaseCommand):
    help = 'Seeds initial sample data for Job Community Platform'

    def handle(self, *args, **options):
        self.stdout.write('Seeding initial system data...')

        # 1. Create Admin User
        admin, created = User.objects.get_or_create(
            email='admin@jobcommunity.com',
            defaults={
                'first_name': 'Platform',
                'last_name': 'Admin',
                'role': 'ADMIN',
                'email_verified': True,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('Admin@12345')
            admin.save()
            Profile.objects.get_or_create(user=admin, defaults={'headline': 'Platform Administrator'})
            self.stdout.write('Created default Admin user: admin@jobcommunity.com / Admin@12345')

        # 2. Create Student User
        student, s_created = User.objects.get_or_create(
            email='student@example.com',
            defaults={
                'first_name': 'Alex',
                'last_name': 'Dev',
                'role': 'STUDENT',
                'email_verified': True
            }
        )
        if s_created:
            student.set_password('Student@12345')
            student.save()
            Profile.objects.get_or_create(user=student, defaults={'headline': 'Computer Science Undergraduate & Web Enthusiast', 'location': 'Bangalore'})
            UserPreference.objects.get_or_create(
                user=student,
                defaults={
                    'preferred_locations': ['Remote', 'Bangalore'],
                    'preferred_work_modes': ['REMOTE', 'HYBRID'],
                    'preferred_employment_types': ['INTERNSHIP', 'FULL_TIME']
                }
            )
            self.stdout.write('Created default Student user: student@example.com / Student@12345')

        # 3. Create Core Skills
        skills_list = [
            ('React', 'Frontend'),
            ('JavaScript', 'Frontend'),
            ('TypeScript', 'Frontend'),
            ('Python', 'Backend'),
            ('Django', 'Backend'),
            ('PostgreSQL', 'Database'),
            ('REST API', 'Backend'),
            ('Docker', 'DevOps'),
            ('Git', 'Tools'),
            ('Node.js', 'Backend'),
            ('Tailwind CSS', 'Frontend'),
            ('Machine Learning', 'AI/Data')
        ]

        skill_objs = {}
        for s_name, cat in skills_list:
            norm = Skill.normalize_skill_name(s_name)
            sk, _ = Skill.objects.get_or_create(
                normalized_name=norm,
                defaults={'name': s_name, 'category': cat}
            )
            skill_objs[s_name] = sk

        self.stdout.write(f'Seeded {len(skill_objs)} core technical skills.')

        # 4. Create Companies
        company_acme, _ = Company.objects.get_or_create(
            name='Acme Innovations',
            defaults={
                'description': 'Building next-generation SaaS product management platforms.',
                'website': 'https://acme-innovations.example.com',
                'location': 'Bangalore, India',
                'industry': 'SaaS & Enterprise Tech',
                'company_size': '50-200 employees'
            }
        )

        company_techcorp, _ = Company.objects.get_or_create(
            name='TechCorp Labs',
            defaults={
                'description': 'Pioneering artificial intelligence and cloud automation tools.',
                'website': 'https://techcorplabs.example.com',
                'location': 'Hyderabad, India',
                'industry': 'Artificial Intelligence',
                'company_size': '200-500 employees'
            }
        )

        company_nextgen, _ = Company.objects.get_or_create(
            name='NextGen Software',
            defaults={
                'description': 'High-growth web application engineering studio.',
                'website': 'https://nextgensoft.example.com',
                'location': 'Remote / San Francisco',
                'industry': 'Software Engineering',
                'company_size': '20-50 employees'
            }
        )

        # 5. Create Jobs
        job1, j1_created = Job.objects.get_or_create(
            title='Frontend Engineer Intern',
            company=company_acme,
            defaults={
                'description': 'Join our frontend core team to build sleek React dashboards and micro-interactions. You will work closely with product designers and backend engineers to craft responsive user interfaces.',
                'employment_type': 'INTERNSHIP',
                'experience_level': 'Entry Level',
                'location': 'Remote',
                'work_mode': 'REMOTE',
                'application_url': 'https://acme-innovations.example.com/careers/frontend-intern',
                'status': 'PUBLISHED',
                'created_by': admin,
                'published_at': timezone.now()
            }
        )
        if j1_created:
            JobSkill.objects.create(job=job1, skill=skill_objs['React'], importance='HIGH', required=True)
            JobSkill.objects.create(job=job1, skill=skill_objs['JavaScript'], importance='HIGH', required=True)
            JobSkill.objects.create(job=job1, skill=skill_objs['REST API'], importance='MEDIUM', required=True)
            JobSkill.objects.create(job=job1, skill=skill_objs['Git'], importance='MEDIUM', required=True)
            JobSkill.objects.create(job=job1, skill=skill_objs['Tailwind CSS'], importance='LOW', required=False)

        job2, j2_created = Job.objects.get_or_create(
            title='Backend Developer (Python / Django)',
            company=company_techcorp,
            defaults={
                'description': 'We are looking for a passionate Django developer to build robust REST APIs, design database schemas in PostgreSQL, and set up background Celery processing pipelines.',
                'employment_type': 'FULL_TIME',
                'experience_level': 'Junior (0-2 Yrs)',
                'location': 'Hyderabad',
                'work_mode': 'HYBRID',
                'application_url': 'https://techcorplabs.example.com/careers/backend-dev',
                'status': 'PUBLISHED',
                'created_by': admin,
                'published_at': timezone.now()
            }
        )
        if j2_created:
            JobSkill.objects.create(job=job2, skill=skill_objs['Python'], importance='HIGH', required=True)
            JobSkill.objects.create(job=job2, skill=skill_objs['Django'], importance='HIGH', required=True)
            JobSkill.objects.create(job=job2, skill=skill_objs['PostgreSQL'], importance='HIGH', required=True)
            JobSkill.objects.create(job=job2, skill=skill_objs['REST API'], importance='MEDIUM', required=True)
            JobSkill.objects.create(job=job2, skill=skill_objs['Docker'], importance='LOW', required=False)

        job3, j3_created = Job.objects.get_or_create(
            title='Full Stack Engineering Fellow',
            company=company_nextgen,
            defaults={
                'description': 'Opportunity for recent graduates and early-career developers to work across React, Node.js, and TypeScript. Build user-facing features from scratch.',
                'employment_type': 'FULL_TIME',
                'experience_level': 'Entry Level',
                'location': 'Remote',
                'work_mode': 'REMOTE',
                'application_url': 'https://nextgensoft.example.com/careers/fullstack-fellow',
                'status': 'PUBLISHED',
                'created_by': admin,
                'published_at': timezone.now()
            }
        )
        if j3_created:
            JobSkill.objects.create(job=job3, skill=skill_objs['React'], importance='HIGH', required=True)
            JobSkill.objects.create(job=job3, skill=skill_objs['Node.js'], importance='HIGH', required=True)
            JobSkill.objects.create(job=job3, skill=skill_objs['TypeScript'], importance='MEDIUM', required=True)
            JobSkill.objects.create(job=job3, skill=skill_objs['Git'], importance='MEDIUM', required=True)

        self.stdout.write('Seeded sample companies and published job listings.')
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
