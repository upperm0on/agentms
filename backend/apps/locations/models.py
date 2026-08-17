from django.db import models

from apps.common.models import TimestampedUUIDModel


class Region(TimestampedUUIDModel):
    name = models.CharField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Campus(TimestampedUUIDModel):
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name="campuses")
    name = models.CharField(max_length=160)
    abbreviation = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["region", "name"], name="unique_campus_per_region"),
        ]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["abbreviation"]),
        ]

    def __str__(self) -> str:
        return self.abbreviation or self.name


class Area(TimestampedUUIDModel):
    campus = models.ForeignKey(Campus, on_delete=models.PROTECT, related_name="areas")
    name = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["campus__name", "name"]
        constraints = [
            models.UniqueConstraint(fields=["campus", "name"], name="unique_area_per_campus"),
        ]
        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} - {self.campus}"

