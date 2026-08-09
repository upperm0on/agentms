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
