from rest_framework import permissions
from django.conf import settings


def get_admin_email():
    return getattr(settings, 'ADMIN_EMAIL', '').strip().lower()


def check_is_admin(user):
    if not (user and user.is_authenticated and user.is_admin_user and user.role == 'admin'):
        return False
    admin_email = get_admin_email()
    if admin_email:
        return user.email.lower() == admin_email
    return True


class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return check_is_admin(request.user)


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return check_is_admin(request.user)


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if check_is_admin(request.user):
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False



