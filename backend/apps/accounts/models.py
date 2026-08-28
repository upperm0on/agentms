import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import ActiveState

from .managers import UserManager


class UserRole(models.TextChoices):
    STUDENT = "student", "Student"
    AGENT = "agent", "Agent"
    ADMIN = "admin", "Admin"


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=32, blank=True)
    whatsapp_number = models.CharField(max_length=32, blank=True)
    primary_campus = models.ForeignKey(
        "locations.Campus",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="students",
    )
    role = models.CharField(max_length=16, choices=UserRole.choices, default=UserRole.STUDENT)
    is_email_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=16, choices=ActiveState.choices, default=ActiveState.ACTIVE)
    last_active_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        indexes = [
            models.Index(fields=["role", "status"]),
            models.Index(fields=["is_email_verified"]),
        ]

    def __str__(self) -> str:
        return self.email
