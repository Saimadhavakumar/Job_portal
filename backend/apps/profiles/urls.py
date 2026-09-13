from django.urls import path
from .views import (
    CandidateProfileDetailView, UserPreferenceView, UserSkillManageView,
    ProjectManageView, ExperienceManageView, EducationManageView
)

urlpatterns = [
    path('', CandidateProfileDetailView.as_view(), name='profile_detail'),
    path('preferences/', UserPreferenceView.as_view(), name='profile_preferences'),
    path('skills/', UserSkillManageView.as_view(), name='profile_skills'),
    path('projects/', ProjectManageView.as_view(), name='profile_projects'),
    path('experience/', ExperienceManageView.as_view(), name='profile_experience'),
    path('education/', EducationManageView.as_view(), name='profile_education'),
]
