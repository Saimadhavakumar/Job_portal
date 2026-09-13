from django.urls import path
from .views import JobDiscoveryView, JobDetailView, AdminJobCreateView, AdminJobDetailView

urlpatterns = [
    path('', JobDiscoveryView.as_view(), name='job_discovery'),
    path('admin/create/', AdminJobCreateView.as_view(), name='admin_job_create'),
    path('admin/<int:id>/', AdminJobDetailView.as_view(), name='admin_job_detail'),
    path('<slug:slug>/', JobDetailView.as_view(), name='job_detail'),
]
