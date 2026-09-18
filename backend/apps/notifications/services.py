import logging
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailLog

logger = logging.getLogger(__name__)

def send_job_match_email(user, job, score, reason, notification=None):
    """
    Sends an automated email notification to the user when a high-matching job is published.
    Updates or creates an EmailLog record to track delivery status.
    """
    subject = f"🎯 New Job Match ({score}% Fit): {job.title} at {job.company.name}"
    
    recipient_name = user.first_name if user.first_name else user.email.split('@')[0]
    
    plain_text_message = (
        f"Hello {recipient_name},\n\n"
        f"We found a new job opportunity that matches your candidate profile with a {score}% fit!\n\n"
        f"Job Title: {job.title}\n"
        f"Company: {job.company.name}\n"
        f"Location: {job.location}\n"
        f"Work Mode: {job.get_work_mode_display()}\n"
        f"Employment Type: {job.get_employment_type_display()}\n\n"
        f"Why you matched:\n{reason}\n\n"
        f"Log in to your portal to review and apply now.\n\n"
        f"Best regards,\n"
        f"The Job Portal Team"
    )

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; padding: 20px; }}
            .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }}
            .header {{ font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }}
            .badge {{ display: inline-block; background-color: #10b981; color: white; font-weight: 600; padding: 4px 12px; border-radius: 9999px; font-size: 14px; margin-bottom: 16px; }}
            .job-title {{ font-size: 22px; font-weight: 700; color: #2563eb; margin: 12px 0 4px; }}
            .company-name {{ font-size: 16px; color: #64748b; margin-bottom: 20px; }}
            .details-box {{ background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; }}
            .detail-item {{ margin-bottom: 8px; font-size: 14px; }}
            .detail-item strong {{ color: #334155; }}
            .reason-box {{ border-left: 4px solid #3b82f6; background-color: #eff6ff; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; color: #1e40af; }}
            .footer {{ margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">Hello {recipient_name},</div>
            <div class="badge">{score}% Match Score</div>
            <div class="job-title">{job.title}</div>
            <div class="company-name">{job.company.name} &bull; {job.location}</div>
            
            <div class="details-box">
                <div class="detail-item"><strong>Location:</strong> {job.location}</div>
                <div class="detail-item"><strong>Work Mode:</strong> {job.get_work_mode_display()}</div>
                <div class="detail-item"><strong>Employment Type:</strong> {job.get_employment_type_display()}</div>
            </div>

            <div class="reason-box">
                <strong>Match Fit Explanation:</strong><br/>
                {reason}
            </div>

            <p>Log in to your account dashboard to view the complete job description and submit your application!</p>

            <div class="footer">
                &copy; {timezone.now().year} Job Portal. Automated Match Notification.
            </div>
        </div>
    </body>
    </html>
    """

    email_log = None
    if notification:
        email_log = EmailLog.objects.filter(notification=notification, user=user).first()
    
    if not email_log:
        email_log = EmailLog.objects.create(
            user=user,
            notification=notification,
            email_type='NEW_JOB_MATCH',
            status='QUEUED'
        )

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jobportal.com')
        send_mail(
            subject=subject,
            message=plain_text_message,
            from_email=from_email,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        email_log.status = 'SENT'
        email_log.sent_at = timezone.now()
        email_log.save()
        logger.info(f"Successfully sent job match email to {user.email} for Job '{job.title}'")
        return True
    except Exception as e:
        logger.exception(f"Failed to send job match email to {user.email}: {e}")
        email_log.status = 'FAILED'
        email_log.failed_at = timezone.now()
        email_log.error_message = str(e)
        email_log.save()
        return False
