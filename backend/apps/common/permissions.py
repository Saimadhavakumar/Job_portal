from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """Allows access only to authenticated users with ADMIN role."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )

class IsStudentUser(BasePermission):
    """Allows access only to authenticated users with STUDENT role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STUDENT')
