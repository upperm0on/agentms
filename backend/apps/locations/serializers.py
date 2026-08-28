from django.db import transaction
from rest_framework import serializers

from .models import Area, Campus, Region


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name", "is_active", "created_at", "updated_at"]


class CampusSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)

    class Meta:
        model = Campus
        fields = ["id", "region", "region_name", "name", "abbreviation", "city", "is_active", "created_at", "updated_at"]


class AreaSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source="campus.name", read_only=True)
    campus_abbreviation = serializers.CharField(source="campus.abbreviation", read_only=True)
    city = serializers.CharField(source="campus.city", read_only=True)
    region_name = serializers.CharField(source="campus.region.name", read_only=True)

    class Meta:
        model = Area
        fields = [
            "id",
            "campus",
            "campus_name",
            "campus_abbreviation",
            "city",
            "region_name",
            "name",
            "is_active",
            "created_at",
            "updated_at",
        ]


class AdminLocationSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    campus = serializers.CharField(max_length=160)
    abbreviation = serializers.CharField(max_length=32, required=False, allow_blank=True)
    city = serializers.CharField(max_length=120)
    area = serializers.CharField(max_length=120)
    region = serializers.CharField(max_length=120)
    active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "campus": instance.campus.name,
            "abbreviation": instance.campus.abbreviation,
            "city": instance.campus.city,
            "area": instance.name,
            "region": instance.campus.region.name,
            "active": instance.is_active,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }

    def validate(self, attrs):
        for field in ("campus", "city", "area", "region"):
            attrs[field] = attrs[field].strip()
            if not attrs[field]:
                raise serializers.ValidationError({field: "This field cannot be blank."})
        attrs["abbreviation"] = attrs.get("abbreviation", "").strip()
        return attrs

    @staticmethod
    def _reference_records(data):
        region = Region.objects.filter(name__iexact=data["region"]).first()
        if region is None:
            region = Region.objects.create(name=data["region"], is_active=True)
        elif not region.is_active:
            region.is_active = True
            region.save(update_fields=["is_active", "updated_at"])

        campus = Campus.objects.filter(region=region, name__iexact=data["campus"]).first()
        if campus is None:
            campus = Campus.objects.create(
                region=region,
                name=data["campus"],
                abbreviation=data["abbreviation"],
                city=data["city"],
                is_active=True,
            )
        else:
            campus.abbreviation = data["abbreviation"]
            campus.city = data["city"]
            campus.is_active = True
            campus.save(update_fields=["abbreviation", "city", "is_active", "updated_at"])
        return campus

    @transaction.atomic
    def create(self, validated_data):
        campus = self._reference_records(validated_data)
        area = Area.objects.filter(campus=campus, name__iexact=validated_data["area"]).first()
        if area is not None:
            raise serializers.ValidationError({"area": "This area already exists for the selected campus."})
        return Area.objects.create(campus=campus, name=validated_data["area"], is_active=validated_data["active"])

    @transaction.atomic
    def update(self, instance, validated_data):
        data = {
            "campus": instance.campus.name,
            "abbreviation": instance.campus.abbreviation,
            "city": instance.campus.city,
            "area": instance.name,
            "region": instance.campus.region.name,
            "active": instance.is_active,
            **validated_data,
        }
        campus = self._reference_records(data)
        duplicate = Area.objects.filter(campus=campus, name__iexact=data["area"]).exclude(pk=instance.pk)
        if duplicate.exists():
            raise serializers.ValidationError({"area": "This area already exists for the selected campus."})
        instance.campus = campus
        instance.name = data["area"]
        instance.is_active = data["active"]
        instance.save(update_fields=["campus", "name", "is_active", "updated_at"])
        return instance
