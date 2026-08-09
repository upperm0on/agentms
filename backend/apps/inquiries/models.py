from django.conf import settings
from django.db import models

from apps.common.models import TimestampedUUIDModel


class InquiryStatus(models.TextChoices):
    NEW = "new", "New"
    CONTACTED = "contacted", "Contacted"
    VIEWING_SCHEDULED = "viewing_scheduled", "Viewing scheduled"
    NEGOTIATING = "negotiating", "Negotiating"
    CLOSED_WON = "closed_won", "Closed won"
    CLOSED_LOST = "closed_lost", "Closed lost"
    SPAM = "spam", "Spam"


class ContactMethod(models.TextChoices):
    WHATSAPP = "whatsapp", "WhatsApp"
    PHONE = "phone", "Phone"
    EMAIL = "email", "Email"


class Inquiry(TimestampedUUIDModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="student_inquiries")
    listing = models.ForeignKey("listings.Listing", on_delete=models.PROTECT, related_name="inquiries")
    agent = models.ForeignKey("agents.AgentProfile", on_delete=models.PROTECT, related_name="inquiries")
    message = models.TextField()
    student_phone = models.CharField(max_length=32)
    preferred_contact_method = models.CharField(max_length=16, choices=ContactMethod.choices, default=ContactMethod.WHATSAPP)
    status = models.CharField(max_length=24, choices=InquiryStatus.choices, default=InquiryStatus.NEW)
    agent_notes = models.TextField(blank=True)
    next_follow_up_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["student", "status"]),
            models.Index(fields=["agent", "status"]),
            models.Index(fields=["listing", "created_at"]),
            models.Index(fields=["next_follow_up_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.student} -> {self.listing}"


class InquiryStatusEvent(TimestampedUUIDModel):
    inquiry = models.ForeignKey(Inquiry, on_delete=models.CASCADE, related_name="status_events")
    from_status = models.CharField(max_length=24, choices=InquiryStatus.choices, blank=True)
    to_status = models.CharField(max_length=24, choices=InquiryStatus.choices)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="inquiry_status_events")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.inquiry} -> {self.to_status}"

