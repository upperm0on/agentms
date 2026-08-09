from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.listings.serializers import ListingSerializer

from .models import AuditLog, ListingReport, ModerationAction


class ListingReportSerializer(serializers.ModelSerializer):
    listing_detail = ListingSerializer(source="listing", read_only=True)
    reported_by_detail = UserSerializer(source="reported_by", read_only=True)

    class Meta:
        model = ListingReport
        fields = [
            "id",
            "listing",
            "listing_detail",
            "reported_by",
            "reported_by_detail",
            "reason",
            "details",
            "severity",
            "status",
            "reviewed_by",
            "reviewed_at",
            "resolution_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reported_by", "reviewed_by", "reviewed_at", "created_at", "updated_at"]


class ModerationActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModerationAction
        fields = ["id", "actor", "entity_type", "entity_id", "action", "note", "metadata", "created_at", "updated_at"]
        read_only_fields = ["id", "actor", "created_at", "updated_at"]


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ["id", "actor", "action", "entity_type", "entity_id", "metadata", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
