from django.db.models import Q
from django.utils import timezone
from rest_framework import decorators, permissions, response, viewsets

from apps.common.permissions import IsAgent, IsAgentOwnerOrAdmin, IsStudent

from .models import Listing, ListingImage, ListingStatus, Property, SavedListing
from .serializers import ListingImageSerializer, ListingSerializer, PropertySerializer, SavedListingSerializer


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
            queryset = queryset.filter(availability_status=availability)
        return queryset

    def perform_create(self, serializer):
        agent = self.request.user.agent_profile
        serializer.save(agent=agent)

    @decorators.action(detail=True, methods=["post"], permission_classes=[IsAgentOwnerOrAdmin])
    def publish(self, request, pk=None):
        listing = self.get_object()
        listing.status = ListingStatus.PUBLISHED
        listing.published_at = timezone.now()
        listing.save(update_fields=["status", "published_at", "updated_at"])
        return response.Response(self.get_serializer(listing).data)

    @decorators.action(detail=True, methods=["post"], permission_classes=[IsAgentOwnerOrAdmin])
    def unpublish(self, request, pk=None):
        listing = self.get_object()
        listing.status = ListingStatus.UNPUBLISHED
        listing.save(update_fields=["status", "updated_at"])
        return response.Response(self.get_serializer(listing).data)

    @decorators.action(detail=True, methods=["post"], url_path="refresh-availability", permission_classes=[IsAgentOwnerOrAdmin])
    def refresh_availability(self, request, pk=None):
        listing = self.get_object()
        listing.availability_status = request.data.get("availability_status", listing.availability_status)
        listing.available_slots = request.data.get("available_slots", listing.available_slots)
        listing.last_confirmed_at = timezone.now()
        listing.save(update_fields=["availability_status", "available_slots", "last_confirmed_at", "updated_at"])
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
