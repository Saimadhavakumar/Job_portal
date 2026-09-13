from django.urls import path
from .views import ToggleSaveJobView, SavedJobListView, ApplyJobView, StudentApplicationListView, AdminApplicationManageView

urlpatterns = [
    path('', StudentApplicationListView.as_view(), name='application_list'),
    path('saved/', SavedJobListView.as_view(), name='saved_job_list'),
    path('save/<int:job_id>/', ToggleSaveJobView.as_view(), name='toggle_save_job'),
    path('apply/<int:job_id>/', ApplyJobView.as_view(), name='apply_job'),
    path('admin/', AdminApplicationManageView.as_view(), name='admin_applications'),
    path('admin/<int:application_id>/status/', AdminApplicationManageView.as_view(), name='admin_application_status'),
]
