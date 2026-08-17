from decimal import InvalidOperation

from django.core.cache import cache
from django.db.models import DecimalField, Q
from django.utils import timezone
from rest_framework import decorators, permissions, response, viewsets

from apps.common.cache import bump_cache_version, cache_timeout, response_cache_key
from apps.common.permissions import IsAgent, IsAgentOwnerOrAdmin, IsStudent

from .models import Listing, ListingImage, ListingStatus, Property, SavedListing
from .serializers import ListingImageSerializer, ListingListSerializer, ListingSerializer, PropertySerializer, SavedListingSerializer


def is_decimal(value):
    try:
        DecimalField().to_python(value)
    except (InvalidOperation, TypeError, ValueError):
        return False
    return True


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.select_related("area", "area__campus", "area__campus__region").prefetch_related("amenities")
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAgent()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    public_cache_namespace = "public-listings"

    def get_serializer_class(self):
        if self.action == "list":
            return ListingListSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action in ["create"]:
            return [IsAgent()]
        return [IsAgentOwnerOrAdmin()]

    def get_queryset(self):
        queryset = (
            Listing.objects.select_related("agent", "agent__user", "property", "property__area", "property__area__campus", "property__area__campus__region")
            .prefetch_related("amenities", "rules", "images", "saved_by")
            .all()
        )
        user = self.request.user
        if self.action in ["list", "retrieve"]:
            if user.is_authenticated and user.role == "agent" and not user.is_staff:
                queryset = queryset.filter(agent=user.agent_profile)
            elif not user.is_authenticated or not (user.is_staff or user.role == "admin"):
                queryset = queryset.filter(status=ListingStatus.PUBLISHED, moderation_status="approved")
        elif user.is_authenticated and user.role == "agent" and not user.is_staff:
            queryset = queryset.filter(agent=user.agent_profile)
        query = self.request.query_params.get("q")
        campus = self.request.query_params.get("campus")
        availability = self.request.query_params.get("availability")
        room_type = self.request.query_params.get("room_type")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        ordering = self.request.query_params.get("ordering")
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(property__name__icontains=query)
                | Q(property__area__name__icontains=query)
                | Q(property__area__campus__name__icontains=query)
            )
        if campus:
            queryset = queryset.filter(property__area__campus__name__iexact=campus)
        if availability:
            queryset = queryset.filter(availability_status=availability.lower())
        if room_type:
            room_types = [value.strip().lower() for value in room_type.split(",") if value.strip()]
            queryset = queryset.filter(room_type__in=room_types)
        if min_price and is_decimal(min_price):
            queryset = queryset.filter(price_amount__gte=min_price)
        if max_price and is_decimal(max_price):
            queryset = queryset.filter(price_amount__lte=max_price)
        if ordering == "price":
            queryset = queryset.order_by("price_amount", "-last_confirmed_at", "-updated_at")
        elif ordering == "-price":
            queryset = queryset.order_by("-price_amount", "-last_confirmed_at", "-updated_at")
        elif ordering == "popular":
            queryset = queryset.order_by("-inquiry_count", "-view_count", "-last_confirmed_at", "-updated_at")
        else:
            queryset = queryset.order_by("-last_confirmed_at", "-updated_at")
        return queryset

    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return super().list(request, *args, **kwargs)

        cache_key = response_cache_key(self.public_cache_namespace, request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return response.Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            cache.set(cache_key, paginated_response.data, cache_timeout("PUBLIC_LISTING_CACHE_TTL", 120))
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, cache_timeout("PUBLIC_LISTING_CACHE_TTL", 120))
        return response.Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return super().retrieve(request, *args, **kwargs)

        cache_key = response_cache_key(self.public_cache_namespace, request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return response.Response(cached_data)

        instance = self.get_object()
        serializer = self.get_serializer(instance)
        cache.set(cache_key, serializer.data, cache_timeout("PUBLIC_LISTING_CACHE_TTL", 120))
        return response.Response(serializer.data)

    def perform_create(self, serializer):
        agent = self.request.user.agent_profile
        serializer.save(agent=agent)
        bump_cache_version(self.public_cache_namespace)

    def perform_update(self, serializer):
        serializer.save()
        bump_cache_version(self.public_cache_namespace)

    def perform_destroy(self, instance):
        instance.delete()
        bump_cache_version(self.public_cache_namespace)

    @decorators.action(detail=True, methods=["post"], permission_classes=[IsAgentOwnerOrAdmin])
    def publish(self, request, pk=None):
        listing = self.get_object()
        listing.status = ListingStatus.PUBLISHED
        listing.published_at = timezone.now()
        listing.save(update_fields=["status", "published_at", "updated_at"])
        bump_cache_version(self.public_cache_namespace)
        return response.Response(self.get_serializer(listing).data)

    @decorators.action(detail=True, methods=["post"], permission_classes=[IsAgentOwnerOrAdmin])
    def unpublish(self, request, pk=None):
        listing = self.get_object()
        listing.status = ListingStatus.UNPUBLISHED
        listing.save(update_fields=["status", "updated_at"])
        bump_cache_version(self.public_cache_namespace)
        return response.Response(self.get_serializer(listing).data)

    @decorators.action(detail=True, methods=["post"], url_path="refresh-availability", permission_classes=[IsAgentOwnerOrAdmin])
    def refresh_availability(self, request, pk=None):
        listing = self.get_object()
        listing.availability_status = request.data.get("availability_status", listing.availability_status)
        listing.available_slots = request.data.get("available_slots", listing.available_slots)
        listing.last_confirmed_at = timezone.now()
        listing.save(update_fields=["availability_status", "available_slots", "last_confirmed_at", "updated_at"])
        bump_cache_version(self.public_cache_namespace)
        return response.Response(self.get_serializer(listing).data)


class ListingImageViewSet(viewsets.ModelViewSet):
    serializer_class = ListingImageSerializer
    permission_classes = [IsAgentOwnerOrAdmin]

    def get_queryset(self):
        queryset = ListingImage.objects.filter(listing_id=self.kwargs["listing_pk"])
        user = self.request.user
        if user.is_authenticated and user.role == "agent" and not user.is_staff:
            queryset = queryset.filter(listing__agent=user.agent_profile)
        return queryset

    def perform_create(self, serializer):
        listing = Listing.objects.get(pk=self.kwargs["listing_pk"])
        self.check_object_permissions(self.request, listing)
        serializer.save(listing_id=self.kwargs["listing_pk"], uploaded_by=self.request.user)


class SavedListingViewSet(viewsets.ModelViewSet):
    serializer_class = SavedListingSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return SavedListing.objects.filter(student=self.request.user).select_related("listing")

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
