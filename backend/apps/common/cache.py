import hashlib

from django.conf import settings
from django.core.cache import cache


def cache_timeout(name: str, default: int = 300) -> int:
    return int(getattr(settings, name, default))


def get_cache_version(namespace: str) -> int:
    return cache.get(f"cache-version:{namespace}", 1)


def bump_cache_version(namespace: str) -> None:
    key = f"cache-version:{namespace}"
    try:
        cache.incr(key)
    except ValueError:
        cache.set(key, 2, None)


def response_cache_key(namespace: str, request) -> str:
    digest = hashlib.sha256(request.get_full_path().encode("utf-8")).hexdigest()
    version = get_cache_version(namespace)
    return f"response-cache:{namespace}:v{version}:{digest}"
