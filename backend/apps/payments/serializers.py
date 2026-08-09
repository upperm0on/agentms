from rest_framework import serializers

from apps.listings.serializers import ListingSerializer

from .models import PaymentIntent


class PaymentIntentSerializer(serializers.ModelSerializer):
    listing_detail = ListingSerializer(source="listing", read_only=True)

    class Meta:
        model = PaymentIntent
        fields = [
            "id",
            "listing",
            "listing_detail",
            "student",
            "guest_name",
            "guest_email",
            "guest_phone",
            "amount",
            "currency",
            "provider",
            "provider_reference",
            "status",
            "wants_account_history",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "student",
            "amount",
            "currency",
            "provider",
            "provider_reference",
            "status",
            "metadata",
            "created_at",
            "updated_at",
        ]

