app_name = "agents"

from django.urls import path

from .views import AgentMeView, AgentPublicDetailView, VerificationRequestCreateView


urlpatterns = [
    path("me/", AgentMeView.as_view(), name="me"),
    path("verification/", VerificationRequestCreateView.as_view(), name="verification"),
    path("<uuid:pk>/", AgentPublicDetailView.as_view(), name="detail"),
]
