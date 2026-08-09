from django.conf import settings
from django.db import models

from apps.common.models import TimestampedUUIDModel


class NotificationTone(models.TextChoices):
    SUCCESS = "success", "Success"
    WARNING = "warning", "Warning"
    DANGER = "danger", "Danger"
    INFO = "info", "Info"
    NEUTRAL = "neutral", "Neutral"


class NotificationAudience(models.TextChoices):
    STUDENT = "student", "Student"
    AGENT = "agent", "Agent"
    ADMIN = "admin", "Admin"


class Notification(TimestampedUUIDModel):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    audience = models.CharField(max_length=16, choices=NotificationAudience.choices)
    title = models.CharField(max_length=140)
    body = models.TextField()
    tone = models.CharField(max_length=16, choices=NotificationTone.choices, default=NotificationTone.NEUTRAL)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    link_url = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "is_read", "created_at"]),
            models.Index(fields=["audience", "created_at"]),
        ]

    def __str__(self) -> str:
        return self.title

