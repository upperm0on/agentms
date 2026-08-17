from rest_framework import generics, permissions

from apps.common.permissions import IsAgent

from .models import AgentProfile
from .serializers import AgentProfileSerializer, VerificationRequestSerializer


class AgentMeView(generics.RetrieveUpdateAPIView):
    serializer_class = AgentProfileSerializer
    permission_classes = [IsAgent]

    def get_object(self):
        return self.request.user.agent_profile


class AgentPublicDetailView(generics.RetrieveAPIView):
    queryset = AgentProfile.objects.select_related("user").prefetch_related("operating_areas", "documents")
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.AllowAny]


class VerificationRequestCreateView(generics.CreateAPIView):
    serializer_class = VerificationRequestSerializer
    permission_classes = [IsAgent]

    def perform_create(self, serializer):
        serializer.save(agent=self.request.user.agent_profile)
