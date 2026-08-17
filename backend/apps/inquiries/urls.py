app_name = "inquiries"

from django.urls import path

from .views import AgentInquiryDetailView, AgentInquiryListView, ListingInquiryCreateView, StudentInquiryListView


urlpatterns = [
    path("listings/<uuid:listing_pk>/", ListingInquiryCreateView.as_view(), name="listing-create"),
    path("student/", StudentInquiryListView.as_view(), name="student-list"),
    path("agent/", AgentInquiryListView.as_view(), name="agent-list"),
    path("agent/<uuid:pk>/", AgentInquiryDetailView.as_view(), name="agent-detail"),
]
