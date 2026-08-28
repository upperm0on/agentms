from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.common.models import ActiveState
from apps.locations.models import Campus
from apps.locations.serializers import CampusSerializer


User = get_user_model()


class AdminUserStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ActiveState.choices)


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    primary_campus = serializers.PrimaryKeyRelatedField(
        queryset=Campus.objects.filter(is_active=True, region__is_active=True),
        required=False,
        allow_null=True,
    )
    primary_campus_detail = CampusSerializer(source="primary_campus", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "name",
            "phone",
            "whatsapp_number",
            "primary_campus",
            "primary_campus_detail",
            "role",
            "is_email_verified",
            "status",
            "last_active_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "role",
            "is_email_verified",
            "status",
            "last_active_at",
            "created_at",
            "updated_at",
        ]

    def get_name(self, obj):
        return obj.get_full_name().strip() or obj.email

    def validate_primary_campus(self, campus):
        if campus is not None and self.instance and self.instance.role != "student":
            raise serializers.ValidationError("Only student accounts can set a primary campus.")
        return campus


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "password", "first_name", "last_name", "phone", "role"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=["student", "agent"], required=False, default="student")
