from django.urls import path
from .views import (
    CandidateProfileDetailView, UserPreferenceView, UserSkillManageView,
    ProjectManageView, ProjectDetailView,
    ExperienceManageView, ExperienceDetailView,
    EducationManageView, EducationDetailView,
    CertificationManageView, CertificationDetailView,
    StudentDashboardView
)

urlpatterns = [
    path('', CandidateProfileDetailView.as_view(), name='profile_detail'),
    path('dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('preferences/', UserPreferenceView.as_view(), name='profile_preferences'),
    path('skills/', UserSkillManageView.as_view(), name='profile_skills'),
    path('projects/', ProjectManageView.as_view(), name='profile_projects'),
    path('projects/<int:id>/', ProjectDetailView.as_view(), name='profile_project_detail'),
    path('experience/', ExperienceManageView.as_view(), name='profile_experience'),
    path('experience/<int:id>/', ExperienceDetailView.as_view(), name='profile_experience_detail'),
    path('education/', EducationManageView.as_view(), name='profile_education'),
    path('education/<int:id>/', EducationDetailView.as_view(), name='profile_education_detail'),
    path('certifications/', CertificationManageView.as_view(), name='profile_certifications'),
    path('certifications/<int:id>/', CertificationDetailView.as_view(), name='profile_certification_detail'),
]
