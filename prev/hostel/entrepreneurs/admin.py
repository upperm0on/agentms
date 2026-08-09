from django.contrib import admin
from .models import Entrepreneur, Store, Commodity, Deliverer, Transaction


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'created_at']
    list_filter = ['created_at', 'location']
    search_fields = ['name', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Store Information', {
            'fields': ('name', 'description', 'location')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Commodity)
class CommodityAdmin(admin.ModelAdmin):
    list_display = ['name', 'store', 'type', 'price', 'created_at']
    list_filter = ['type', 'created_at', 'store']
    search_fields = ['name', 'description', 'store__name']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['store']

    fieldsets = (
        ('Commodity Information', {
            'fields': ('store', 'name', 'description', 'type', 'price', 'category_slug')
        }),
        ('Image', {
            'fields': ('image',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Entrepreneur)
class EntrepreneurAdmin(admin.ModelAdmin):
    list_display = ['user', 'store', 'location', 'created_at']
    list_filter = ['created_at', 'location']
    search_fields = ['user__email', 'user__username', 'location', 'store__name']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['user', 'store']

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Store Information', {
            'fields': ('store',),
            'description': 'Store owned by this entrepreneur'
        }),
        ('Location', {
            'fields': ('location',),
            'description': 'Auto-populated from consumer.hostel.campus if user is a consumer'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Deliverer)
class DelivererAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'phone_number', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'location']
    search_fields = ['user__email', 'user__username', 'location', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['user']

    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Delivery Information', {
            'fields': ('location', 'phone_number', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'consumer', 'product', 'store', 'price', 'status', 'delivery_status', 'deliverer', 'transaction_date']
    list_filter = ['status', 'delivery_status', 'transaction_date', 'created_at', 'deliverer_confirmed', 'buyer_confirmed', 'seller_confirmed']
    search_fields = ['consumer__email', 'consumer__username', 'product__name', 'store__name', 'deliverer__user__email']
    readonly_fields = ['created_at', 'updated_at', 'transaction_date', 'net_profit', 'service_fee', 'delivery_fee']
    raw_id_fields = ['consumer', 'product', 'store', 'deliverer']
    date_hierarchy = 'transaction_date'
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('consumer', 'product', 'store', 'price', 'status', 'transaction_date')
        }),
        ('Delivery Information', {
            'fields': ('deliverer', 'delivery_status', 'delivery_fee', 'buyer_location', 'seller_location')
        }),
        ('Confirmation Status', {
            'fields': ('deliverer_confirmed', 'buyer_confirmed', 'seller_confirmed')
        }),
        ('Financial Details', {
            'fields': ('service_fee', 'net_profit'),
            'description': 'Service fee (1.5%) and net profit (price - service_fee) are calculated automatically'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related for foreign keys"""
        qs = super().get_queryset(request)
        return qs.select_related('consumer', 'product', 'store', 'deliverer__user')
