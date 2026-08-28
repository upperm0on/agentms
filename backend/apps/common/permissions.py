from rest_framework import permissions

from .models import ActiveState


def is_active_user(user) -> bool:
    return bool(user and user.is_authenticated and user.status == ActiveState.ACTIVE)


def has_role(user, role: str) -> bool:
    return bool(is_active_user(user) and user.role == role)


class IsActiveUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_active_user(request.user)


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "student")


class IsAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "agent") and hasattr(request.user, "agent_profile")


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(is_active_user(request.user) and (request.user.is_staff or request.user.role == "admin"))


class IsAgentOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not is_active_user(user):
            return False
        if user.is_staff or user.role == "admin":
            return True
        agent_profile = getattr(user, "agent_profile", None)
        if agent_profile is None:
            return False
        owner = getattr(obj, "agent", None)
        if owner is None and hasattr(obj, "listing"):
            owner = getattr(obj.listing, "agent", None)
        return owner == agent_profile


class IsSelfOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not is_active_user(user):
            return False
        if user.is_staff or user.role == "admin":
            return True
        return obj == user or getattr(obj, "user", None) == user


class IsReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS
