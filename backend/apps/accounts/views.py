import logging
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, EmailVerificationCode
from .serializers import (
    RegisterSerializer, VerifyEmailSerializer, ResendCodeSerializer,
    LoginSerializer, UserSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
)
from apps.profiles.models import Profile, UserPreference

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            raw_code, _ = EmailVerificationCode.generate_code_for_user(user)
            # Log verification code for development / test verification
            logger.info(f"Verification code for {user.email}: {raw_code}")
            print(f"\n========================================\nVERIFICATION CODE FOR {user.email}: {raw_code}\n========================================\n")
            return Response({
                "success": True,
                "message": "User registered successfully. Please check your email for the verification code.",
                "email": user.email,
                "demo_code": raw_code  # Provided for easy local UI testing
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "error": {"code": "USER_NOT_FOUND", "message": "User not found."}}, status=status.HTTP_404_NOT_FOUND)

        latest_code = EmailVerificationCode.objects.filter(user=user, verified_at__isnull=True).order_by('-created_at').first()
        if not latest_code:
            return Response({"success": False, "error": {"code": "NO_CODE_FOUND", "message": "No active verification code found."}}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, msg = latest_code.verify(code)
        if not is_valid:
            return Response({"success": False, "error": {"code": "INVALID_CODE", "message": msg}}, status=status.HTTP_400_BAD_REQUEST)

        user.email_verified = True
        user.save()

        # Ensure Profile & UserPreference exist
        Profile.objects.get_or_create(user=user)
        UserPreference.objects.get_or_create(user=user)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "success": True,
            "message": "Email verified successfully.",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }
        }, status=status.HTTP_200_OK)

class ResendCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Secure response: don't leak user existence
            return Response({"success": True, "message": "If the account exists, a new code was sent."})

        raw_code, _ = EmailVerificationCode.generate_code_for_user(user)
        print(f"\n========================================\nRESENT CODE FOR {user.email}: {raw_code}\n========================================\n")
        return Response({
            "success": True,
            "message": "A new verification code has been sent to your email.",
            "demo_code": raw_code
        })

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response({
                "success": True,
                **serializer.validated_data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({"success": True, "user": serializer.data})

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            raw_code, _ = EmailVerificationCode.generate_code_for_user(user)
            print(f"\n========================================\nRESET CODE FOR {user.email}: {raw_code}\n========================================\n")
            return Response({"success": True, "message": "Password reset code sent to your email.", "demo_code": raw_code})
        except User.DoesNotExist:
            return Response({"success": True, "message": "If the account exists, a password reset code was sent."})

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "error": {"code": "USER_NOT_FOUND", "message": "User not found."}}, status=status.HTTP_404_NOT_FOUND)

        latest_code = EmailVerificationCode.objects.filter(user=user, verified_at__isnull=True).order_by('-created_at').first()
        if not latest_code:
            return Response({"success": False, "error": {"code": "INVALID_CODE", "message": "Invalid or expired reset code."}}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, msg = latest_code.verify(code)
        if not is_valid:
            return Response({"success": False, "error": {"code": "INVALID_CODE", "message": msg}}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"success": True, "message": "Password reset successfully. You can now log in with your new password."})
