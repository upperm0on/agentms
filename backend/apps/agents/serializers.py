from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.locations.serializers import AreaSerializer

from .models import AgentDocument, AgentProfile, VerificationRequest


class AgentDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentDocument
        fields = ["id", "agent", "title", "file", "uploaded_by", "created_at", "updated_at"]
        read_only_fields = ["id", "uploaded_by", "created_at", "updated_at"]


class AgentProfileSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source="user", read_only=True)
    operating_area_details = AreaSerializer(source="operating_areas", many=True, read_only=True)
    documents = AgentDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = AgentProfile
        fields = [
            "id",
            "user",
            "user_detail",
            "display_name",
            "business_name",
            "bio",
            "phone",
            "whatsapp_number",
            "profile_photo",
            "verification_status",
            "verification_notes",
            "operating_areas",
            "operating_area_details",
            "response_rate",
            "listing_freshness_score",
            "documents",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "verification_status",
            "verification_notes",
            "response_rate",
            "listing_freshness_score",
            "created_at",
            "updated_at",
        ]


class VerificationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRequest
        fields = [
            "id",
            "agent",
            "status",
            "submitted_notes",
            "reviewer_notes",
            "reviewed_by",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "reviewer_notes", "reviewed_by", "reviewed_at", "created_at", "updated_at"]
