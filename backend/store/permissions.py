from rest_framework import permissions
from django.conf import settings


def get_admin_email():
    return getattr(settings, 'ADMIN_EMAIL', '').strip().lower()


def get_admin_mobile():
    return getattr(settings, 'ADMIN_MOBILE', '7050830610').strip()


def check_is_admin(user):
    """
    Strict server-side validation to ensure user has active administrator privileges.
    """
    if not (user and user.is_authenticated):
        return False
    return bool(user.is_staff or user.is_superuser or getattr(user, 'role', '') == 'admin')


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to public/safe methods (GET, HEAD, OPTIONS).
    Write/mutation methods (POST, PUT, PATCH, DELETE) require verified admin role.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return check_is_admin(request.user)


class IsAdminRole(permissions.BasePermission):
    """
    Requires verified administrator privileges for all request methods.
    """
    def has_permission(self, request, view):
        return check_is_admin(request.user)


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission allowing access to the object owner or an administrator.
    """
    def has_object_permission(self, request, view, obj):
        if check_is_admin(request.user):
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
