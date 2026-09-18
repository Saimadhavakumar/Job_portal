from django.urls import path
from apps.companies.views import CompanyListView, CompanyDetailView
from apps.jobs.views import AdminJobCreateView, AdminJobDetailView
from apps.applications.views import AdminApplicationManageView
from apps.common.admin_views import (
    AdminDashboardStatsView, AdminJobListView, AdminJobDeleteView,
    AdminUserListView, AdminCandidateDetailView
)

urlpatterns = [
    path('stats/', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('companies/', CompanyListView.as_view(), name='admin_company_create'),
    path('companies/<slug:slug>/', CompanyDetailView.as_view(), name='admin_company_detail'),
    path('jobs/', AdminJobListView.as_view(), name='admin_job_list'),
    path('jobs/create/', AdminJobCreateView.as_view(), name='admin_job_create'),
    path('jobs/<int:id>/', AdminJobDetailView.as_view(), name='admin_job_detail'),
    path('jobs/<int:id>/delete/', AdminJobDeleteView.as_view(), name='admin_job_delete'),
    path('applications/', AdminApplicationManageView.as_view(), name='admin_applications_list'),
    path('applications/<int:application_id>/status/', AdminApplicationManageView.as_view(), name='admin_application_status_update'),
    path('users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('users/<int:user_id>/', AdminCandidateDetailView.as_view(), name='admin_candidate_detail'),
]
