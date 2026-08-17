from rest_framework import serializers

from apps.agents.serializers import AgentProfileSerializer
from apps.locations.serializers import AreaSerializer

from .models import Amenity, Listing, ListingImage, ListingRule, Property, SavedListing


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name", "is_active", "created_at", "updated_at"]


class PropertySerializer(serializers.ModelSerializer):
    area_detail = AreaSerializer(source="area", read_only=True)
    amenities_detail = AmenitySerializer(source="amenities", many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "name",
            "area",
            "area_detail",
            "address_text",
            "landmark",
            "property_type",
            "gender_policy",
            "amenities",
            "amenities_detail",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class ListingRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingRule
        fields = ["id", "listing", "text", "sort_order", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ["id", "listing", "image", "caption", "sort_order", "is_cover", "uploaded_by", "created_at", "updated_at"]
        read_only_fields = ["id", "uploaded_by", "created_at", "updated_at"]


class ListingSerializer(serializers.ModelSerializer):
    agent_detail = AgentProfileSerializer(source="agent", read_only=True)
    property_detail = PropertySerializer(source="property", read_only=True)
    amenities_detail = AmenitySerializer(source="amenities", many=True, read_only=True)
    rules = ListingRuleSerializer(many=True, read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)
    campus_name = serializers.CharField(source="property.area.campus.name", read_only=True)
    area_name = serializers.CharField(source="property.area.name", read_only=True)
    cover_image = serializers.SerializerMethodField()
    saved = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "agent",
            "agent_detail",
            "property",
            "property_detail",
            "title",
            "description",
            "status",
            "availability_status",
            "moderation_status",
            "room_type",
            "gender_restriction",
            "capacity",
            "available_slots",
            "price_amount",
            "price_period",
            "deposit_amount",
            "agent_fee_amount",
            "negotiable",
            "amenities",
            "amenities_detail",
            "source_type",
            "source_name",
            "last_confirmed_at",
            "published_at",
            "view_count",
            "inquiry_count",
            "campus_name",
            "area_name",
            "cover_image",
            "saved",
            "rules",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "view_count",
            "inquiry_count",
            "published_at",
            "created_at",
            "updated_at",
        ]

    def get_cover_image(self, obj):
        image = next((item for item in obj.images.all() if item.is_cover), None)
        if image is None:
            image = obj.images.first()
        return image.image.url if image and image.image else ""

    def get_saved(self, obj):
        user = self.context.get("request").user if self.context.get("request") else None
        if not user or not user.is_authenticated:
            return False
        return obj.saved_by.filter(student=user).exists()


class ListingListSerializer(serializers.ModelSerializer):
    agent_detail = serializers.SerializerMethodField()
    property_detail = serializers.SerializerMethodField()
    amenities_detail = serializers.SerializerMethodField()
    rules = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    campus_name = serializers.CharField(source="property.area.campus.name", read_only=True)
    area_name = serializers.CharField(source="property.area.name", read_only=True)
    cover_image = serializers.SerializerMethodField()
    saved = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "agent",
            "agent_detail",
            "property",
            "property_detail",
            "title",
            "description",
            "status",
            "availability_status",
            "moderation_status",
            "room_type",
            "gender_restriction",
            "capacity",
            "available_slots",
            "price_amount",
            "price_period",
            "amenities_detail",
            "last_confirmed_at",
            "published_at",
            "view_count",
            "inquiry_count",
            "campus_name",
            "area_name",
            "cover_image",
            "saved",
            "rules",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_agent_detail(self, obj):
        return {
            "id": str(obj.agent_id),
            "display_name": obj.agent.display_name,
            "business_name": obj.agent.business_name,
            "bio": obj.agent.bio,
            "phone": obj.agent.phone,
            "whatsapp_number": obj.agent.whatsapp_number,
            "verification_status": obj.agent.verification_status,
            "response_rate": str(obj.agent.response_rate),
            "listing_freshness_score": str(obj.agent.listing_freshness_score),
            "created_at": obj.agent.created_at.isoformat() if obj.agent.created_at else None,
        }

    def get_property_detail(self, obj):
        return {
            "id": str(obj.property_id),
            "name": obj.property.name,
            "area_detail": AreaSerializer(obj.property.area).data,
        }

    def get_amenities_detail(self, obj):
        return []

    def get_rules(self, obj):
        return []

    def get_images(self, obj):
        cover = self._cover_image(obj)
        return [{"image": cover, "caption": "", "sort_order": 0, "is_cover": True}] if cover else []

    def get_cover_image(self, obj):
        return self._cover_image(obj)

    def _cover_image(self, obj):
        image = next((item for item in obj.images.all() if item.is_cover), None)
        if image is None:
            image = obj.images.first()
        return image.image.url if image and image.image else ""

    def get_saved(self, obj):
        user = self.context.get("request").user if self.context.get("request") else None
        if not user or not user.is_authenticated:
            return False
        return obj.saved_by.filter(student=user).exists()


class SavedListingSerializer(serializers.ModelSerializer):
    listing_detail = ListingSerializer(source="listing", read_only=True)

    class Meta:
        model = SavedListing
        fields = ["id", "student", "listing", "listing_detail", "created_at", "updated_at"]
        read_only_fields = ["id", "student", "created_at", "updated_at"]
