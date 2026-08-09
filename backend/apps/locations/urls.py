app_name = "locations"

from rest_framework.routers import DefaultRouter

from .views import AreaViewSet, CampusViewSet, RegionViewSet


router = DefaultRouter()
router.register("regions", RegionViewSet, basename="region")
router.register("campuses", CampusViewSet, basename="campus")
router.register("areas", AreaViewSet, basename="area")

urlpatterns = router.urls
