from django.conf import settings
from django.db import models

from apps.common.models import TimestampedUUIDModel


class PropertyType(models.TextChoices):
    HOSTEL = "hostel", "Hostel"
    APARTMENT = "apartment", "Apartment"
    CHAMBER_AND_HALL = "chamber_and_hall", "Chamber and hall"
    SINGLE_ROOM = "single_room", "Single room"
    OTHER = "other", "Other"


class GenderPolicy(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    MIXED = "mixed", "Mixed"
    UNKNOWN = "unknown", "Unknown"


class ListingStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    UNPUBLISHED = "unpublished", "Unpublished"
    ARCHIVED = "archived", "Archived"
    REMOVED = "removed", "Removed"


class AvailabilityStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    LIMITED = "limited", "Limited"
    FULL = "full", "Full"
    UNAVAILABLE = "unavailable", "Unavailable"
    UNKNOWN = "unknown", "Unknown"


class ModerationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    FLAGGED = "flagged", "Flagged"
    REJECTED = "rejected", "Rejected"


class PricePeriod(models.TextChoices):
    MONTH = "month", "Month"
    SEMESTER = "semester", "Semester"
    ACADEMIC_YEAR = "academic_year", "Academic year"
    YEAR = "year", "Year"


class RoomType(models.TextChoices):
    SINGLE = "single", "Single"
    SHARED = "shared", "Shared"
    TWO_IN_ROOM = "two_in_room", "Two in room"
    THREE_IN_ROOM = "three_in_room", "Three in room"
    FOUR_IN_ROOM = "four_in_room", "Four in room"
    DORMITORY = "dormitory", "Dormitory"
    APARTMENT = "apartment", "Apartment"
    STUDIO = "studio", "Studio"
    OTHER = "other", "Other"


class SourceType(models.TextChoices):
    MANAGER = "manager", "Manager"
    PORTER = "porter", "Porter"
    OWNER = "owner", "Owner"
    CARETAKER = "caretaker", "Caretaker"
    AGENT_VERIFIED = "agent_verified", "Agent verified"
    UNKNOWN = "unknown", "Unknown"


class Amenity(TimestampedUUIDModel):
    name = models.CharField(max_length=80, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Property(TimestampedUUIDModel):
    name = models.CharField(max_length=180)
    area = models.ForeignKey("locations.Area", on_delete=models.PROTECT, related_name="properties")
    address_text = models.CharField(max_length=255, blank=True)
    landmark = models.CharField(max_length=180, blank=True)
    property_type = models.CharField(max_length=32, choices=PropertyType.choices, default=PropertyType.HOSTEL)
    gender_policy = models.CharField(max_length=16, choices=GenderPolicy.choices, default=GenderPolicy.UNKNOWN)
    amenities = models.ManyToManyField(Amenity, related_name="properties", blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_properties",
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["area", "name"], name="unique_property_per_area"),
        ]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["property_type"]),
        ]

    def __str__(self) -> str:
        return self.name


class Listing(TimestampedUUIDModel):
    agent = models.ForeignKey("agents.AgentProfile", on_delete=models.PROTECT, related_name="listings")
    property = models.ForeignKey(Property, on_delete=models.PROTECT, related_name="listings")
    title = models.CharField(max_length=180)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=ListingStatus.choices, default=ListingStatus.DRAFT)
    availability_status = models.CharField(
        max_length=20,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.UNKNOWN,
    )
    moderation_status = models.CharField(
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.PENDING,
    )
    room_type = models.CharField(max_length=32, choices=RoomType.choices)
    gender_restriction = models.CharField(max_length=16, choices=GenderPolicy.choices, default=GenderPolicy.UNKNOWN)
    capacity = models.PositiveSmallIntegerField(default=1)
    available_slots = models.PositiveSmallIntegerField(default=0)
    price_amount = models.DecimalField(max_digits=10, decimal_places=2)
    price_period = models.CharField(max_length=20, choices=PricePeriod.choices, default=PricePeriod.ACADEMIC_YEAR)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    agent_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    negotiable = models.BooleanField(default=False)
    amenities = models.ManyToManyField(Amenity, related_name="listings", blank=True)
    source_type = models.CharField(max_length=24, choices=SourceType.choices, default=SourceType.UNKNOWN)
    source_name = models.CharField(max_length=120, blank=True)
    last_confirmed_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    inquiry_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["status", "moderation_status"]),
            models.Index(fields=["availability_status", "last_confirmed_at"]),
            models.Index(fields=["price_amount"]),
            models.Index(fields=["room_type"]),
            models.Index(fields=["created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(available_slots__lte=models.F("capacity")),
                name="available_slots_lte_capacity",
            ),
        ]

    def __str__(self) -> str:
        return self.title


class ListingRule(TimestampedUUIDModel):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="rules")
    text = models.CharField(max_length=180)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "text"]

    def __str__(self) -> str:
        return self.text


class ListingImage(TimestampedUUIDModel):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    image = models.FileField(upload_to="listings/images/")
    caption = models.CharField(max_length=160, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_cover = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="uploaded_listing_images")

    class Meta:
        ordering = ["sort_order", "created_at"]
        indexes = [
            models.Index(fields=["listing", "is_cover"]),
        ]

    def __str__(self) -> str:
        return f"{self.listing} image"


class SavedListing(TimestampedUUIDModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_listings")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="saved_by")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "listing"], name="unique_saved_listing_per_student"),
        ]
        indexes = [
            models.Index(fields=["student", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.student} saved {self.listing}"
