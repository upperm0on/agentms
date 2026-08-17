from django.core.cache import cache
from rest_framework import permissions, viewsets
from rest_framework.response import Response

from apps.common.cache import cache_timeout, response_cache_key

from .models import Area, Campus, Region
from .serializers import AreaSerializer, CampusSerializer, RegionSerializer


class CachedReferenceViewSet(viewsets.ReadOnlyModelViewSet):
    cache_namespace = "reference-data"

    def list(self, request, *args, **kwargs):
        cache_key = response_cache_key(self.cache_namespace, request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            cache.set(cache_key, paginated_response.data, cache_timeout("REFERENCE_DATA_CACHE_TTL", 900))
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, cache_timeout("REFERENCE_DATA_CACHE_TTL", 900))
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        cache_key = response_cache_key(self.cache_namespace, request)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        instance = self.get_object()
        serializer = self.get_serializer(instance)
        cache.set(cache_key, serializer.data, cache_timeout("REFERENCE_DATA_CACHE_TTL", 900))
        return Response(serializer.data)


class RegionViewSet(CachedReferenceViewSet):
    queryset = Region.objects.filter(is_active=True)
    serializer_class = RegionSerializer
    permission_classes = [permissions.AllowAny]


class CampusViewSet(CachedReferenceViewSet):
    queryset = Campus.objects.select_related("region").filter(is_active=True)
    serializer_class = CampusSerializer
    permission_classes = [permissions.AllowAny]


class AreaViewSet(CachedReferenceViewSet):
    queryset = Area.objects.select_related("campus", "campus__region").filter(is_active=True)
    serializer_class = AreaSerializer
    permission_classes = [permissions.AllowAny]
