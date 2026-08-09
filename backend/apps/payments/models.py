from django.conf import settings
from django.db import models

from apps.common.models import TimestampedUUIDModel


class PaymentIntentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    SUCCEEDED = "succeeded", "Succeeded"
    FAILED = "failed", "Failed"
    CANCELLED = "cancelled", "Cancelled"


class PaymentProvider(models.TextChoices):
    MANUAL = "manual", "Manual"
    PAYSTACK = "paystack", "Paystack"


class PaymentIntent(TimestampedUUIDModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.PROTECT, related_name="payment_intents")
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="payment_intents",
    )
    guest_name = models.CharField(max_length=160)
    guest_email = models.EmailField()
    guest_phone = models.CharField(max_length=32)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="GHS")
    provider = models.CharField(max_length=16, choices=PaymentProvider.choices, default=PaymentProvider.MANUAL)
    provider_reference = models.CharField(max_length=120, unique=True)
    status = models.CharField(max_length=16, choices=PaymentIntentStatus.choices, default=PaymentIntentStatus.PENDING)
    wants_account_history = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["guest_email", "created_at"]),
            models.Index(fields=["student", "created_at"]),
            models.Index(fields=["listing", "status"]),
            models.Index(fields=["provider_reference"]),
        ]

    def __str__(self) -> str:
        return f"{self.provider_reference} - {self.status}"

