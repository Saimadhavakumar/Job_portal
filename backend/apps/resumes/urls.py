from django.urls import path
from .views import ResumeUploadView, ResumeListView, ResumeVersionDetailView, ResumeVersionReParseView

urlpatterns = [
    path('', ResumeListView.as_view(), name='resume_list'),
    path('upload/', ResumeUploadView.as_view(), name='resume_upload'),
    path('<int:id>/', ResumeVersionDetailView.as_view(), name='resume_version_detail'),
    path('<int:id>/reparse/', ResumeVersionReParseView.as_view(), name='resume_reparse'),
]
