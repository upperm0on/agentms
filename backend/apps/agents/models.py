from django.conf import settings
from django.db import models

from apps.common.models import TimestampedUUIDModel


class AgentVerificationStatus(models.TextChoices):
    UNSUBMITTED = "unsubmitted", "Unsubmitted"
    PENDING = "pending", "Pending"
    VERIFIED = "verified", "Verified"
    REJECTED = "rejected", "Rejected"
    SUSPENDED = "suspended", "Suspended"


class VerificationRequestStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class AgentProfile(TimestampedUUIDModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agent_profile")
    display_name = models.CharField(max_length=160)
    business_name = models.CharField(max_length=180)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=32)
    whatsapp_number = models.CharField(max_length=32, blank=True)
    profile_photo = models.FileField(upload_to="agents/profile_photos/", blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=AgentVerificationStatus.choices,
        default=AgentVerificationStatus.UNSUBMITTED,
    )
    verification_notes = models.TextField(blank=True)
    operating_areas = models.ManyToManyField("locations.Area", related_name="agents", blank=True)
    response_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    listing_freshness_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        indexes = [
            models.Index(fields=["verification_status"]),
            models.Index(fields=["business_name"]),
        ]

    def __str__(self) -> str:
        return self.business_name


class AgentDocument(TimestampedUUIDModel):
    agent = models.ForeignKey(AgentProfile, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=120)
    file = models.FileField(upload_to="agents/documents/")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="uploaded_agent_documents")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} - {self.agent}"


class VerificationRequest(TimestampedUUIDModel):
    agent = models.ForeignKey(AgentProfile, on_delete=models.CASCADE, related_name="verification_requests")
    status = models.CharField(
        max_length=16,
        choices=VerificationRequestStatus.choices,
        default=VerificationRequestStatus.PENDING,
    )
    submitted_notes = models.TextField(blank=True)
    reviewer_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="reviewed_verification_requests",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.agent} verification - {self.status}"
