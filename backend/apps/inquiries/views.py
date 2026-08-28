from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdminRole, IsAgent, IsStudent
from apps.listings.models import Listing

from .models import Inquiry
from .serializers import InquirySerializer
from .services import create_listing_inquiry, transition_inquiry


class ListingInquiryCreateView(generics.CreateAPIView):
    serializer_class = InquirySerializer
    permission_classes = [IsStudent]

    def create(self, request, *args, **kwargs):
        listing = Listing.objects.select_related("agent", "agent__user").get(pk=kwargs["listing_pk"])
        inquiry = create_listing_inquiry(
            student=request.user,
            listing=listing,
            message=request.data["message"],
            student_phone=request.data["student_phone"],
            preferred_contact_method=request.data.get("preferred_contact_method", "whatsapp"),
        )
        return Response(self.get_serializer(inquiry).data, status=status.HTTP_201_CREATED)


class StudentInquiryListView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Inquiry.objects.filter(student=self.request.user).select_related("student", "agent", "agent__user", "listing")


class AgentInquiryListView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [IsAgent]

    def get_queryset(self):
        return Inquiry.objects.filter(agent=self.request.user.agent_profile).select_related("student", "agent", "agent__user", "listing")


class AgentInquiryDetailView(APIView):
    permission_classes = [IsAgent]

    def patch(self, request, pk):
        inquiry = Inquiry.objects.get(pk=pk, agent=request.user.agent_profile)
        if "status" in request.data:
            inquiry = transition_inquiry(
                inquiry=inquiry,
                to_status=request.data["status"],
                changed_by=request.user,
                note=request.data.get("agent_notes", ""),
            )
        if "agent_notes" in request.data:
            inquiry.agent_notes = request.data["agent_notes"]
            inquiry.save(update_fields=["agent_notes", "updated_at"])
        return Response(InquirySerializer(inquiry, context={"request": request}).data)


class AdminInquiryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Inquiry.objects.select_related(
        "student",
        "agent",
        "agent__user",
        "listing",
        "listing__property",
        "listing__property__area",
        "listing__property__area__campus",
    )
    serializer_class = InquirySerializer
    permission_classes = [IsAdminRole]
