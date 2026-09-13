from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, VerifyEmailView, ResendCodeView,
    LoginView, MeView, ForgotPasswordView, ResetPasswordView
)

urlpatterns = [
    path('signup/', RegisterView.as_view(), name='auth_signup'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth_verify_email'),
    path('resend-code/', ResendCodeView.as_view(), name='auth_resend_code'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('me/', MeView.as_view(), name='auth_me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
]
