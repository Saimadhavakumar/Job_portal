import os
import re
import logging
from django.utils import timezone
from .models import ResumeVersion, ParsedResume
from apps.profiles.models import Skill, UserSkill

logger = logging.getLogger(__name__)

# Common skill keywords dictionary for extraction matching
COMMON_SKILL_PATTERNS = [
    'Python', 'Django', 'Flask', 'FastAPI', 'JavaScript', 'TypeScript', 'React', 'ReactJS',
    'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'HTML', 'HTML5', 'CSS', 'CSS3',
    'Tailwind CSS', 'Bootstrap', 'Sass', 'Redux', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
    'GraphQL', 'REST API', 'REST', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
    'Git', 'GitHub', 'GitLab', 'CI/CD', 'Linux', 'Java', 'Spring Boot', 'C++', 'C#', '.NET',
    'Go', 'Golang', 'Rust', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Swift', 'Kotlin', 'Flutter',
    'React Native', 'Machine Learning', 'Deep Learning', 'Data Analysis', 'Pandas', 'NumPy',
    'Scikit-Learn', 'TensorFlow', 'PyTorch', 'Kafka', 'Microservices', 'System Design', 'OOP',
    'Agile', 'Figma', 'UI/UX', 'Unit Testing', 'PyTest', 'Jest', 'Mocha', 'Cypress'
]

def extract_text_from_pdf(file_path):
    text = ""
    # Attempt extraction via pdfplumber
    try:
        import pdfplumber
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed: {e}. Falling back to pypdf.")

    if not text.strip():
        # Fallback to pypdf
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            logger.error(f"pypdf extraction failed: {e}")
            
    return text.strip()

def parse_resume_version(resume_version_id):
    from django.db import close_old_connections
    close_old_connections()
    try:
        rv = ResumeVersion.objects.get(id=resume_version_id)
        rv.parsing_status = 'PROCESSING'
        rv.save()

        file_path = None
        try:
            file_path = rv.file.path
        except Exception:
            file_path = str(rv.file)

        raw_text = ""
        if file_path and os.path.exists(file_path):
            raw_text = extract_text_from_pdf(file_path)

        if not raw_text:
            # Attempt reading file bytes directly if pdfplumber could not extract text (e.g. mock PDF stream)
            try:
                rv.file.open('rb')
                content_bytes = rv.file.read()
                rv.file.close()
                raw_text = content_bytes.decode('utf-8', errors='ignore')
            except Exception as read_err:
                logger.warning(f"Failed byte fallback read for ResumeVersion {resume_version_id}: {read_err}")

        if not raw_text.strip():
            rv.parsing_status = 'FAILED'
            rv.save()
            logger.error(f"Could not extract text from PDF for ResumeVersion {resume_version_id}")
            return False

        # Extract skills
        text_lower = raw_text.lower()
        extracted_skills = set()

        for skill_name in COMMON_SKILL_PATTERNS:
            # Word boundary regex search
            pattern = r'\b' + re.escape(skill_name.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_skills.add(skill_name)

        # Update User Skills database
        user = rv.resume.user
        for s_name in extracted_skills:
            norm = Skill.normalize_skill_name(s_name)
            skill, _ = Skill.objects.get_or_create(
                normalized_name=norm,
                defaults={'name': s_name, 'category': 'Extracted'}
            )
            UserSkill.objects.update_or_create(
                user=user,
                skill=skill,
                defaults={'source': 'RESUME', 'confidence': 0.95}
            )

        structured_data = {
            "skills": list(extracted_skills),
            "summary": raw_text[:500] if len(raw_text) > 500 else raw_text,
            "extracted_at": timezone.now().isoformat()
        }

        ParsedResume.objects.update_or_create(
            resume_version=rv,
            defaults={
                "raw_text": raw_text,
                "structured_data": structured_data,
                "parser_version": "v1",
                "parsed_at": timezone.now()
            }
        )

        rv.parsing_status = 'COMPLETED'
        rv.parsed_at = timezone.now()
        rv.save()

        # Trigger Recommendation calculation in background
        from apps.recommendations.services import recalculate_user_recommendations
        recalculate_user_recommendations(user)

        logger.info(f"ResumeVersion {resume_version_id} parsed successfully. Skills extracted: {len(extracted_skills)}")
        return True

    except Exception as e:
        if "database table is locked" not in str(e) and "no such table" not in str(e):
            logger.exception(f"Error parsing ResumeVersion {resume_version_id}: {e}")
        try:
            rv = ResumeVersion.objects.get(id=resume_version_id)
            rv.parsing_status = 'FAILED'
            rv.save()
        except Exception:
            pass
        return False
