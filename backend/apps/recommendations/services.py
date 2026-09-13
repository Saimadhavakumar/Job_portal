import logging
from django.conf import settings
from .models import Recommendation
from apps.jobs.models import Job, JobSkill
from apps.profiles.models import UserSkill, UserPreference, ProjectSkill, ExperienceSkill
from apps.notifications.models import Notification, EmailLog
from apps.accounts.models import User

logger = logging.getLogger(__name__)

def calculate_match_score(user, job):
    # 1. Fetch Candidate Skills
    user_skill_ids = set(UserSkill.objects.filter(user=user).values_list('skill_id', flat=True))
    proj_skill_ids = set(ProjectSkill.objects.filter(project__user=user).values_list('skill_id', flat=True))
    exp_skill_ids = set(ExperienceSkill.objects.filter(experience__user=user).values_list('skill_id', flat=True))
    
    all_candidate_skill_ids = user_skill_ids.union(proj_skill_ids).union(exp_skill_ids)

    # 2. Fetch Job Required & Optional Skills
    job_req_skills = JobSkill.objects.filter(job=job).select_related('skill')
    required_skills = [js for js in job_req_skills if js.required]
    optional_skills = [js for js in job_req_skills if not js.required]

    matching_skill_names = []
    missing_skill_names = []

    if required_skills:
        matched_req_count = 0
        for js in required_skills:
            if js.skill_id in all_candidate_skill_ids:
                matched_req_count += 1
                matching_skill_names.append(js.skill.name)
            else:
                missing_skill_names.append(js.skill.name)
        
        skill_score = (matched_req_count / len(required_skills)) * 100.0
    else:
        skill_score = 80.0

    # Also record optional skills matched
    for js in optional_skills:
        if js.skill_id in all_candidate_skill_ids:
            if js.skill.name not in matching_skill_names:
                matching_skill_names.append(js.skill.name)
        else:
            if js.skill.name not in missing_skill_names:
                missing_skill_names.append(js.skill.name)

    # 3. Preferences (Location, Work Mode, Employment Type)
    pref = getattr(user, 'preference', None)

    # Work Mode Match
    work_mode_score = 50.0
    if pref and pref.preferred_work_modes:
        if job.work_mode in pref.preferred_work_modes or 'ANY' in pref.preferred_work_modes:
            work_mode_score = 100.0
        else:
            work_mode_score = 0.0

    # Employment Type Match
    type_score = 50.0
    if pref and pref.preferred_employment_types:
        if job.employment_type in pref.preferred_employment_types:
            type_score = 100.0
        else:
            type_score = 0.0

    # Location Match
    loc_score = 50.0
    if pref and pref.preferred_locations:
        job_loc_lower = job.location.lower()
        if any(p.lower() in job_loc_lower for p in pref.preferred_locations) or job.work_mode == 'REMOTE':
            loc_score = 100.0
        else:
            loc_score = 20.0

    # Experience Match
    exp_score = 80.0
    if pref:
        if pref.minimum_experience <= 1:
            exp_score = 100.0

    # Weighted Average Score
    weights = getattr(settings, 'MATCH_WEIGHTS', {
        'SKILL': 0.50,
        'EXPERIENCE': 0.20,
        'LOCATION': 0.10,
        'WORK_MODE': 0.10,
        'EMPLOYMENT_TYPE': 0.10,
    })

    final_score = (
        skill_score * weights['SKILL'] +
        exp_score * weights['EXPERIENCE'] +
        loc_score * weights['LOCATION'] +
        work_mode_score * weights['WORK_MODE'] +
        type_score * weights['EMPLOYMENT_TYPE']
    )

    final_score = round(min(max(final_score, 0.0), 100.0), 1)

    # Human-readable explanation reason
    reason_parts = []
    if matching_skill_names:
        reason_parts.append(f"Your profile matches {len(matching_skill_names)} key skill(s) ({', '.join(matching_skill_names[:3])}).")
    if missing_skill_names:
        reason_parts.append(f"Consider acquiring {', '.join(missing_skill_names[:2])} for a stronger fit.")
    if work_mode_score == 100.0:
        reason_parts.append(f"Aligns with your preferred {job.get_work_mode_display()} work mode.")

    reason = " ".join(reason_parts) if reason_parts else f"Matched based on job profile alignment ({final_score}% score)."

    return {
        "score": final_score,
        "matching_skills": matching_skill_names,
        "missing_skills": missing_skill_names,
        "reason": reason
    }

def recalculate_user_recommendations(user):
    if user.role != 'STUDENT':
        return
    published_jobs = Job.objects.filter(status='PUBLISHED')
    for job in published_jobs:
        match_res = calculate_match_score(user, job)
        Recommendation.objects.update_or_create(
            user=user,
            job=job,
            defaults={
                "score": match_res['score'],
                "matching_skills": match_res['matching_skills'],
                "missing_skills": match_res['missing_skills'],
                "reason": match_res['reason'],
                "algorithm_version": "v1"
            }
        )

def process_job_published_recommendations(job_id):
    from django.db import close_old_connections
    close_old_connections()
    try:
        job = Job.objects.get(id=job_id, status='PUBLISHED')
        students = User.objects.filter(role='STUDENT', is_active=True)

        for user in students:
            match_res = calculate_match_score(user, job)
            rec, _ = Recommendation.objects.update_or_create(
                user=user,
                job=job,
                defaults={
                    "score": match_res['score'],
                    "matching_skills": match_res['matching_skills'],
                    "missing_skills": match_res['missing_skills'],
                    "reason": match_res['reason'],
                    "algorithm_version": "v1"
                }
            )

            # Notification & Email Dispatch if score threshold reached (>= 70.0)
            threshold = getattr(settings, 'NOTIFICATION_THRESHOLD', 70.0)
            if match_res['score'] >= threshold:
                notif, created = Notification.objects.get_or_create(
                    user=user,
                    job=job,
                    type='NEW_JOB_MATCH',
                    defaults={
                        "title": f"New Match: {job.title} at {job.company.name}",
                        "message": f"We found a {match_res['score']}% profile match for {job.title}! {match_res['reason']}"
                    }
                )
                if created:
                    EmailLog.objects.create(
                        user=user,
                        notification=notif,
                        email_type='NEW_JOB_MATCH',
                        status='QUEUED'
                    )

    except Exception as e:
        logger.exception(f"Error processing recommendations for published Job {job_id}: {e}")
