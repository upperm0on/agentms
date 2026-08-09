app_name = "listings"

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ListingImageViewSet, ListingViewSet, PropertyViewSet, SavedListingViewSet


router = DefaultRouter()
router.register("properties", PropertyViewSet, basename="property")
router.register("saved", SavedListingViewSet, basename="saved-listing")
router.register("", ListingViewSet, basename="listing")

listing_images = ListingImageViewSet.as_view({"get": "list", "post": "create"})
listing_image_detail = ListingImageViewSet.as_view({"delete": "destroy"})

urlpatterns = [
    path("", include(router.urls)),
    path("<uuid:listing_pk>/images/", listing_images, name="listing-images"),
    path("<uuid:listing_pk>/images/<uuid:pk>/", listing_image_detail, name="listing-image-detail"),
]
