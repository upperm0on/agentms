from rest_framework import permissions, viewsets

from .models import Area, Campus, Region
from .serializers import AreaSerializer, CampusSerializer, RegionSerializer


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.filter(is_active=True)
    serializer_class = RegionSerializer
    permission_classes = [permissions.AllowAny]


class CampusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Campus.objects.select_related("region").filter(is_active=True)
    serializer_class = CampusSerializer
    permission_classes = [permissions.AllowAny]


class AreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Area.objects.select_related("campus", "campus__region").filter(is_active=True)
    serializer_class = AreaSerializer
    permission_classes = [permissions.AllowAny]
