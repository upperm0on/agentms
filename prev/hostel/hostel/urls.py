from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
from django.urls import path, include
from .views import dashboard, landingPage
from hq.api_views import get_listings, get_product_by_id, get_store_by_id, get_store_products, get_categories, get_my_store, get_my_store_products, update_store_settings, create_listing, update_listing, get_entrepreneur_me, create_order, get_user_orders, get_user_wallet, google_oauth_login

urlpatterns = [
    path(f'{settings.ADMIN_URL}', admin.site.urls),
    path('dashboard/', dashboard, name="dashboard"),
    path('landing_page/', landingPage, name="landing_page"),
    path('', landingPage, name="landing_page"),
    path('hq/', include('hq.urls')),
    path('managers/', include('managers.urls')),
    path('consumer/', include("consumers.urls")),
    path('authenticate/', include("user_auth.urls")),
    path('category/', include("category.urls")),
    path('review/', include("reviews.urls")),
    path('emails/', include('email_service.urls')),
    # path('accounts/', include('allauth.urls')),
    
    # Authentication endpoints (accessible at /api/ instead of /hq/api/)
    path('api/google-oauth/', google_oauth_login, name='api_google_oauth'),
    
    # Marketplace API endpoints (accessible at /api/ instead of /hq/api/)
    path('api/listings/', get_listings, name='api_get_listings'),
    path('api/products/<int:product_id>/', get_product_by_id, name='api_get_product_by_id'),
    path('api/stores/<int:store_id>/products/', get_store_products, name='api_get_store_products'),
    path('api/stores/<int:store_id>/', get_store_by_id, name='api_get_store_by_id'),
    path('api/categories/', get_categories, name='api_get_categories'),
    path('api/entrepreneur/me/', get_entrepreneur_me, name='api_get_entrepreneur_me'),
    path('api/marketplace/store/me/', get_my_store, name='api_get_my_store'),
    path('api/marketplace/products/', get_my_store_products, name='api_get_my_store_products'),
    path('api/marketplace/store/settings/', update_store_settings, name='api_update_store_settings'),
    path('api/marketplace/listings/create/', create_listing, name='api_create_listing'),
    path('api/marketplace/listings/<int:commodity_id>/update/', update_listing, name='api_update_listing'),
    # Orders and Wallet endpoints
    path('api/orders/', get_user_orders, name='api_get_user_orders'),
    path('api/orders/create/', create_order, name='api_create_order'),
    path('api/wallet/', get_user_wallet, name='api_get_user_wallet'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)