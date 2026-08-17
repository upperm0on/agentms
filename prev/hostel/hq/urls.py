from django.urls import path 
from .views import add_hostel, read_hostel, update_hostel, search_hostel, detail_hostel, man_search, email_verified, get_all_tables, get_table_data, create_table_record, update_table_record, delete_table_record, get_table_structure, admin_login
from .api_views import hostel_list_view, landing_page, signup, initiate_payment, verify_payment, paystack_callback, consumer_request, search_request, custom_login, google_oauth_login, verify_email, activate_user_account, assign_hostel_category, create_review_api, get_reviews_api, check_room_availability_api, create_store, get_listings, get_product_by_id, get_store_by_id, get_store_products, get_categories, get_my_store, get_my_store_products, update_store_settings, create_listing, update_listing, get_entrepreneur_me, get_store_analytics, get_store_transactions, track_commodity_click, upload_marketplace_image, upload_store_logo, upload_store_banner, create_order, get_user_orders, get_user_wallet, register_deliverer, get_deliverer_status, get_user_hostel, get_delivery_requests, accept_delivery_request, get_my_deliveries, get_completed_deliveries, confirm_delivery, buyer_confirm_delivery, seller_confirm_delivery
from .manager_api_views import manager_post_api, get_tenants, update_or_create_hostel, get_banks, get_manager_reservations, cancel_reservation, confirm_payment, get_payments
from .reservations_views import create_reservation, delete_reservation, initiate_reservation_payment, verify_reservation_payment, list_user_reservations
from .enhanced_api_views import (
    advanced_search, get_notifications, mark_notification_read,
    enhanced_analytics, get_documents, upload_documents,
    get_conversations, get_conversation_messages, send_message
)

urlpatterns = [
    path('add_hostel/', add_hostel, name="add_hostel"),
    path('update_hostel/<int:id>/', update_hostel, name="update_hostel"),
    path('read_hostel/', read_hostel, name="read_hostels"),
    path('search_hostel/<int:rooms>/', search_hostel, name="search_hostel"),
    path('detail_hostel/<int:id>/', detail_hostel, name="detail_hostel"),
    path('man_search/', man_search, name='manual_search'),
    path('email-verified/', email_verified, name='email_verified'),

    path('api/hostels/', hostel_list_view, name='hostel-list'),
    path("api/login/", custom_login, name="api_login"),
    path("api/google-oauth/", google_oauth_login, name="google_oauth_login"),
    path("api/signup/", signup, name="api_signup"),
    path('api/verify-email/<str:token>/', verify_email, name='verify_email'),
    path('api/activate-account/', activate_user_account, name='activate_user_account'),
    path('api/assign-hostel-category/', assign_hostel_category, name='assign_hostel_category'),
    path('api/landing_page/', landing_page, name='api_landing_page'),
    path('api/check-room-availability/', check_room_availability_api, name='check_room_availability'),
    path('api/payments/', initiate_payment, name='payment_initiation'),
    path('api/payments/verify/', verify_payment, name='payment_verification'),
    path('api/payments/paystack_callback/', paystack_callback, name="callback url"),
    path('api/payments/consumer_request/', consumer_request, name='consumer_request'),
    path('api/search_request/', search_request, name="campus_search_request"),

    path('api/manager/create_hostel/', manager_post_api, name='manager_post_api'),
    path('api/manager/tenants/', get_tenants, name='get_tenants'),
    path('api/manager/payments/', get_payments, name='get_payments'),
    path('api/manager/update_or_create/', update_or_create_hostel, name='update_or_create_hostel'),
    path('api/manager/banks/', get_banks, name='get_banks'),
    path('api/manager/reservations/', get_manager_reservations, name='get_manager_reservations'),
    path('api/manager/reservations/confirm-payment/', confirm_payment, name='confirm_payment'),
    path('api/manager/reservations/cancel/', cancel_reservation, name='cancel_reservation'),

    path('api/reservations/create/', create_reservation, name='create_reservation'),
    path('api/reservations/delete/<int:reservation_id>/', delete_reservation, name='delete_reservation'),
    path('api/reservations/payment/initiate/', initiate_reservation_payment, name='initiate_reservation_payment'),
    path('api/reservations/payment/verify/', verify_reservation_payment, name='verify_reservation_payment'),
    path('api/reservations/list/', list_user_reservations, name='list_user_reservations'),
    
    # Review endpoints
    path('api/reviews/create/', create_review_api, name='create_review_api'),
    path('api/reviews/<int:hostel_id>/', get_reviews_api, name='get_reviews_api'),
    
    # Admin Authentication
    path('api/admin-login/', admin_login, name='admin_login'),
    
    # Dynamic Database Management API
    path('api/admin/tables/', get_all_tables, name='get_all_tables'),
    path('api/admin/tables/<str:app_label>/<str:model_name>/', get_table_data, name='get_table_data'),
    path('api/admin/tables/<str:app_label>/<str:model_name>/structure/', get_table_structure, name='get_table_structure'),
    path('api/admin/tables/<str:app_label>/<str:model_name>/create/', create_table_record, name='create_table_record'),
    path('api/admin/tables/<str:app_label>/<str:model_name>/<int:record_id>/', update_table_record, name='update_table_record'),
    path('api/admin/tables/<str:app_label>/<str:model_name>/<int:record_id>/delete/', delete_table_record, name='delete_table_record'),
    
    # Enhanced Features API (V2)
    # Advanced Search
    path('api/v2/search/', advanced_search, name='advanced_search'),
    
    # Notifications
    path('api/v2/notifications/', get_notifications, name='get_notifications'),
    path('api/v2/notifications/<str:notification_id>/read/', mark_notification_read, name='mark_notification_read'),
    
    # Enhanced Analytics
    path('api/v2/analytics/', enhanced_analytics, name='enhanced_analytics'),
    
    # Document Management
    path('api/v2/documents/', get_documents, name='get_documents'),
    path('api/v2/documents/upload/', upload_documents, name='upload_documents'),
    
    # Communication
    path('api/v2/communication/conversations/', get_conversations, name='get_conversations'),
    path('api/v2/communication/conversations/<int:conversation_id>/messages/', get_conversation_messages, name='get_conversation_messages'),
    path('api/v2/communication/conversations/<int:conversation_id>/messages/', send_message, name='send_message'),
    
    # Marketplace Store endpoints
    path('api/store/create/', create_store, name='create_store'),
    
    # Marketplace API endpoints
    path('api/listings/', get_listings, name='get_listings'),
    path('api/marketplace/listings/', get_listings, name='get_marketplace_listings'),  # Alias for frontend
    path('api/products/<int:product_id>/', get_product_by_id, name='get_product_by_id'),
    path('api/stores/<int:store_id>/products/', get_store_products, name='get_store_products'),
    path('api/stores/<int:store_id>/', get_store_by_id, name='get_store_by_id'),
    path('api/categories/', get_categories, name='get_categories'),
    path('api/marketplace/categories/', get_categories, name='get_marketplace_categories'),  # Alias for frontend
    
    # Authenticated marketplace endpoints
    path('api/entrepreneur/me/', get_entrepreneur_me, name='get_entrepreneur_me'),
    path('api/marketplace/store/me/', get_my_store, name='get_my_store'),
    path('api/marketplace/products/', get_my_store_products, name='get_my_store_products'),
    path('api/marketplace/store/settings/', update_store_settings, name='update_store_settings'),
    path('api/marketplace/listings/create/', create_listing, name='create_listing'),
    path('api/marketplace/listings/<int:commodity_id>/update/', update_listing, name='update_listing'),
    
    # Store analytics and transactions
    path('api/marketplace/store/<int:store_id>/analytics/', get_store_analytics, name='get_store_analytics'),
    path('api/marketplace/store/<int:store_id>/transactions/', get_store_transactions, name='get_store_transactions'),
    path('api/marketplace/commodities/<int:commodity_id>/click/', track_commodity_click, name='track_commodity_click'),
    
    # Image upload endpoints
    path('api/marketplace/upload/', upload_marketplace_image, name='upload_marketplace_image'),
    path('api/marketplace/store/logo/', upload_store_logo, name='upload_store_logo'),
    path('api/marketplace/store/banner/', upload_store_banner, name='upload_store_banner'),
    
    # Orders and Wallet endpoints
    path('api/orders/', get_user_orders, name='get_user_orders'),  # GET for listing orders
    path('api/orders/create/', create_order, name='create_order'),  # POST for creating order
    path('api/wallet/', get_user_wallet, name='get_user_wallet'),
    
    # Delivery Person endpoints
    path('api/deliverers/register/', register_deliverer, name='register_deliverer'),
    path('api/deliverers/me/', get_deliverer_status, name='get_deliverer_status'),
    path('api/user/hostel/', get_user_hostel, name='get_user_hostel'),
    path('api/deliverers/requests/', get_delivery_requests, name='get_delivery_requests'),
    path('api/deliverers/requests/<int:transaction_id>/accept/', accept_delivery_request, name='accept_delivery_request'),
    path('api/deliverers/deliveries/', get_my_deliveries, name='get_my_deliveries'),
    path('api/deliverers/completed/', get_completed_deliveries, name='get_completed_deliveries'),
    path('api/deliverers/deliveries/<int:transaction_id>/confirm/', confirm_delivery, name='confirm_delivery'),
    path('api/orders/<int:transaction_id>/buyer-confirm/', buyer_confirm_delivery, name='buyer_confirm_delivery'),
    path('api/orders/<int:transaction_id>/seller-confirm/', seller_confirm_delivery, name='seller_confirm_delivery'),
]   
