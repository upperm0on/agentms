app_name = "moderation"

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminAgentVerificationView,
    AdminAgentViewSet,
    AdminListingModerationView,
    AdminListingViewSet,
    AdminReportViewSet,
    AuditLogViewSet,
    ListingReportCreateView,
    ModerationActionViewSet,
)


router = DefaultRouter()
router.register("admin/agents", AdminAgentViewSet, basename="admin-agent")
router.register("admin/listings", AdminListingViewSet, basename="admin-listing")
router.register("admin/reports", AdminReportViewSet, basename="admin-report")
router.register("admin/actions", ModerationActionViewSet, basename="admin-action")
router.register("admin/audit-logs", AuditLogViewSet, basename="admin-audit-log")

urlpatterns = [
    path("listings/<uuid:listing_pk>/reports/", ListingReportCreateView.as_view(), name="listing-report-create"),
    path("admin/agents/<uuid:pk>/verification/", AdminAgentVerificationView.as_view(), name="admin-agent-verification"),
    path("admin/listings/<uuid:pk>/moderation/", AdminListingModerationView.as_view(), name="admin-listing-moderation"),
    *router.urls,
]
