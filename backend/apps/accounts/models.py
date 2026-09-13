import hashlib
import random
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('email_verified', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('ADMIN', 'Admin'),
    )
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

class EmailVerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code_hash = models.CharField(max_length=256)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)
    attempt_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_code_for_user(cls, user):
        # Invalidate older codes
        cls.objects.filter(user=user, verified_at__isnull=True).delete()
        raw_code = f"{random.randint(100000, 999999)}"
        code_hash = hashlib.sha256(raw_code.encode('utf-8')).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=15)
        obj = cls.objects.create(
            user=user,
            code_hash=code_hash,
            expires_at=expires_at
        )
        return raw_code, obj

    def verify(self, raw_code):
        if self.verified_at is not None:
            return False, "Code already used."
        if timezone.now() > self.expires_at:
            return False, "Code has expired."
        if self.attempt_count >= 5:
            return False, "Maximum verification attempts exceeded."
        
        self.attempt_count += 1
        input_hash = hashlib.sha256(raw_code.encode('utf-8')).hexdigest()
        if input_hash == self.code_hash:
            self.verified_at = timezone.now()
            self.save()
            return True, "Email verified successfully."
        else:
            self.save()
            return False, "Invalid verification code."
