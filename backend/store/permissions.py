from rest_framework import permissions
from django.conf import settings


def get_admin_email():
    return getattr(settings, 'ADMIN_EMAIL', 'upurbey753@gmail.com').strip().lower()


class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        admin_email = get_admin_email()
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin_user
            and request.user.role == 'admin'
            and request.user.email.lower() == admin_email
        )


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        admin_email = get_admin_email()
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin_user
            and request.user.role == 'admin'
            and request.user.email.lower() == admin_email
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        admin_email = get_admin_email()
        if request.user.is_admin_user and request.user.role == 'admin' and request.user.email.lower() == admin_email:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


