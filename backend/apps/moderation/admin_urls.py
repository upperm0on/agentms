from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import AdminUserViewSet

from .views import (
    AdminAgentVerificationView,
    AdminAgentViewSet,
    AdminListingModerationView,
    AdminListingViewSet,
    AdminReportViewSet,
    AuditLogViewSet,
    ModerationActionViewSet,
)


router = DefaultRouter()
router.register("agents", AdminAgentViewSet, basename="admin-agent")
router.register("listings", AdminListingViewSet, basename="admin-listing")
router.register("reports", AdminReportViewSet, basename="admin-report")
router.register("users", AdminUserViewSet, basename="admin-user")
router.register("actions", ModerationActionViewSet, basename="admin-action")
router.register("audit-logs", AuditLogViewSet, basename="admin-audit-log")

urlpatterns = [
    path("agents/<uuid:pk>/verification/", AdminAgentVerificationView.as_view(), name="admin-agent-verification"),
    path("listings/<uuid:pk>/moderation/", AdminListingModerationView.as_view(), name="admin-listing-moderation"),
    *router.urls,
]
