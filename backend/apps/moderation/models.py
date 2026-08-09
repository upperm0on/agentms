from django.conf import settings
from django.db import models

from apps.common.models import TimestampedUUIDModel


class ReportReason(models.TextChoices):
    STALE = "stale", "Stale availability"
    FAKE = "fake", "Fake listing"
    WRONG_PRICE = "wrong_price", "Wrong price"
    WRONG_LOCATION = "wrong_location", "Wrong location"
    DUPLICATE = "duplicate", "Duplicate listing"
    ABUSIVE_AGENT = "abusive_agent", "Abusive agent"
    OTHER = "other", "Other"


class ReportSeverity(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"


class ReportStatus(models.TextChoices):
    OPEN = "open", "Open"
    REVIEWING = "reviewing", "Reviewing"
    RESOLVED = "resolved", "Resolved"
    DISMISSED = "dismissed", "Dismissed"


class ModerationEntityType(models.TextChoices):
    AGENT = "agent", "Agent"
    LISTING = "listing", "Listing"
    REPORT = "report", "Report"
    USER = "user", "User"


class ListingReport(TimestampedUUIDModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="reports")
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="listing_reports",
    )
    reason = models.CharField(max_length=32, choices=ReportReason.choices)
    details = models.TextField(blank=True)
    severity = models.CharField(max_length=16, choices=ReportSeverity.choices, default=ReportSeverity.MEDIUM)
    status = models.CharField(max_length=16, choices=ReportStatus.choices, default=ReportStatus.OPEN)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="reviewed_listing_reports",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "severity"]),
            models.Index(fields=["listing", "status"]),
        ]

    def __str__(self) -> str:
        return f"{self.listing} report - {self.reason}"


class ModerationAction(TimestampedUUIDModel):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="moderation_actions")
    entity_type = models.CharField(max_length=16, choices=ModerationEntityType.choices)
    entity_id = models.UUIDField()
    action = models.CharField(max_length=80)
    note = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["actor", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.action} on {self.entity_type}"


class AuditLog(TimestampedUUIDModel):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=60)
    entity_id = models.UUIDField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["action", "created_at"]),
        ]

    def __str__(self) -> str:
        return self.action

