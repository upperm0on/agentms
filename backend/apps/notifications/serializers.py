from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "audience",
            "title",
            "body",
            "tone",
            "is_read",
            "read_at",
            "link_url",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "recipient", "created_at", "updated_at"]
