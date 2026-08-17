from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.agents.serializers import AgentProfileSerializer
from apps.listings.serializers import ListingSerializer

from .models import Inquiry, InquiryStatusEvent


class InquirySerializer(serializers.ModelSerializer):
    student_detail = UserSerializer(source="student", read_only=True)
    agent_detail = AgentProfileSerializer(source="agent", read_only=True)
    listing_detail = ListingSerializer(source="listing", read_only=True)

    class Meta:
        model = Inquiry
        fields = [
            "id",
            "student",
            "student_detail",
            "listing",
            "listing_detail",
            "agent",
            "agent_detail",
            "message",
            "student_phone",
            "preferred_contact_method",
            "status",
            "agent_notes",
            "next_follow_up_at",
            "closed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "student", "agent", "status", "closed_at", "created_at", "updated_at"]


class InquiryStatusEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = InquiryStatusEvent
        fields = ["id", "inquiry", "from_status", "to_status", "note", "changed_by", "created_at", "updated_at"]
        read_only_fields = ["id", "changed_by", "created_at", "updated_at"]
