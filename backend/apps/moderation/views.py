from rest_framework import generics, permissions, response, views, viewsets

from apps.agents.models import AgentProfile
from apps.common.cache import bump_cache_version
from apps.agents.serializers import AgentProfileSerializer
from apps.common.permissions import IsAdminRole, IsStudent
from apps.listings.models import Listing
from apps.listings.serializers import ListingSerializer

from .models import AuditLog, ListingReport, ModerationAction
from .serializers import (
    AdminAgentVerificationSerializer,
    AdminListingModerationSerializer,
    AdminReportUpdateSerializer,
    AuditLogSerializer,
    ListingReportSerializer,
    ModerationActionSerializer,
)
from .services import create_listing_report, moderate_listing, update_agent_verification, update_report_status


class ListingReportCreateView(generics.CreateAPIView):
    serializer_class = ListingReportSerializer
    permission_classes = [IsStudent]

    def create(self, request, *args, **kwargs):
        listing = Listing.objects.get(pk=kwargs["listing_pk"])
        report = create_listing_report(
            listing=listing,
            reported_by=request.user,
            reason=request.data["reason"],
            details=request.data.get("details", ""),
            severity=request.data.get("severity", "medium"),
        )
        return response.Response(self.get_serializer(report).data, status=201)


class AdminAgentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AgentProfile.objects.select_related("user").prefetch_related("operating_areas", "documents")
    serializer_class = AgentProfileSerializer
    permission_classes = [IsAdminRole]


class AdminListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Listing.objects.select_related("agent", "agent__user", "property", "property__area", "property__area__campus").prefetch_related("amenities", "rules", "images")
    serializer_class = ListingSerializer
    permission_classes = [IsAdminRole]


class AdminReportViewSet(viewsets.ModelViewSet):
    queryset = ListingReport.objects.select_related("listing", "reported_by", "reviewed_by")
    serializer_class = ListingReportSerializer
    permission_classes = [IsAdminRole]

    def partial_update(self, request, *args, **kwargs):
        report = self.get_object()
        update_serializer = AdminReportUpdateSerializer(
            data={
                "status": request.data.get("status", report.status),
                "resolution_notes": request.data.get("resolution_notes", report.resolution_notes),
            }
        )
        update_serializer.is_valid(raise_exception=True)
        report = update_report_status(
            report=report,
            actor=request.user,
            **update_serializer.validated_data,
        )
        return response.Response(self.get_serializer(report).data)


class AdminAgentVerificationView(views.APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        agent = AgentProfile.objects.get(pk=pk)
        serializer = AdminAgentVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        agent = update_agent_verification(
            agent=agent,
            actor=request.user,
            verification_status=serializer.validated_data["verification_status"],
            note=serializer.validated_data.get("verification_notes", ""),
        )
        return response.Response(AgentProfileSerializer(agent, context={"request": request}).data)


class AdminListingModerationView(views.APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        listing = Listing.objects.get(pk=pk)
        serializer = AdminListingModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        listing = moderate_listing(
            listing=listing,
            actor=request.user,
            moderation_status=serializer.validated_data["moderation_status"],
            listing_status=serializer.validated_data.get("listing_status"),
            note=serializer.validated_data.get("note", ""),
        )
        bump_cache_version("public-listings")
        return response.Response(ListingSerializer(listing, context={"request": request}).data)


class ModerationActionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ModerationAction.objects.select_related("actor")
    serializer_class = ModerationActionSerializer
    permission_classes = [IsAdminRole]


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("actor")
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminRole]
