from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


def store_image_upload_path(instance, filename):
    """Generate upload path for store images: media/store/{user_id}/store_image/{filename}"""
    # Get user_id from entrepreneur if available
    entrepreneur = instance.entrepreneurs.first()
    if entrepreneur and entrepreneur.user:
        user_id = entrepreneur.user.id
    else:
        # Fallback to store id if no entrepreneur yet
        user_id = instance.id
    return f'store/{user_id}/store_image/{filename}'


def product_image_upload_path(instance, filename):
    """Generate upload path for product images: media/store/{user_id}/product_images/{filename}"""
    # Get user_id from store's entrepreneur
    entrepreneur = instance.store.entrepreneurs.first()
    if entrepreneur and entrepreneur.user:
        user_id = entrepreneur.user.id
    else:
        # Fallback to store id if no entrepreneur yet
        user_id = instance.store.id
    return f'store/{user_id}/product_images/{filename}'


class Store(models.Model):
    """
    Store model for marketplace sellers.
    Each store belongs to an entrepreneur.
    """
    name = models.CharField(max_length=255, help_text="Store/Business name")
    description = models.TextField(blank=True, null=True, help_text="Store description")
    location = models.CharField(max_length=255, blank=True, null=True,
                               help_text="Store location/campus")
    logo = models.ImageField(upload_to=store_image_upload_path, blank=True, null=True, help_text="Store logo image")
    cover_photo = models.ImageField(upload_to=store_image_upload_path, blank=True, null=True, help_text="Store cover photo/banner")
    monthly_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00,
                                                 help_text="Monthly fee percentage (5% default)")
    last_monthly_fee_date = models.DateTimeField(blank=True, null=True,
                                                 help_text="Last date monthly fee was calculated")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Store"
        verbose_name_plural = "Stores"
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Commodity(models.Model):
    """
    Commodity model for store items (products/services).
    Each commodity belongs to a store.
    """
    COMMODITY_TYPE_CHOICES = [
        ('product', 'Product'),
        ('service', 'Service'),
    ]
    # For commodity: add a single image
    image = models.ImageField(upload_to=product_image_upload_path, blank=True, null=True, help_text="Image of the commodity")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='commodities')
    name = models.CharField(max_length=255, help_text="Commodity name")
    description = models.TextField(blank=True, null=True, help_text="Commodity description")
    type = models.CharField(max_length=20, choices=COMMODITY_TYPE_CHOICES, default='product',
                           help_text="Commodity type: product or service")
    category_slug = models.CharField(max_length=100, blank=True, null=True,
                                    help_text="Category slug (e.g., 'electronics', 'fashion', 'food')")
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True,
                               help_text="Price of the commodity")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Commodity"
        verbose_name_plural = "Commodities"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.type}) - {self.store.name}"


class Entrepreneur(models.Model):
    """
    Entrepreneur model for marketplace sellers.
    Location is auto-populated from consumer.hostel.campus via signal if user is a consumer.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='entrepreneurs',
                             null=True, blank=True, help_text="Store owned by this entrepreneur")
    location = models.CharField(max_length=255, blank=True, null=True,
                               help_text="Auto-populated from consumer.hostel.campus if user is a consumer")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Entrepreneur"
        verbose_name_plural = "Entrepreneurs"
        ordering = ['-created_at']

    def __str__(self):
        return f"Entrepreneur: {self.user.email}"


class Deliverer(models.Model):
    """
    Deliverer model for delivery persons.
    Users can become deliverers to deliver products between sellers and buyers.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deliverer_profile')
    location = models.CharField(max_length=255, blank=True, null=True,
                               help_text="Deliverer's hostel/campus location")
    phone_number = models.CharField(max_length=20, blank=True, null=True,
                                    help_text="Contact phone number for delivery coordination")
    is_active = models.BooleanField(default=True, help_text="Whether deliverer is actively accepting deliveries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Deliverer"
        verbose_name_plural = "Deliverers"
        ordering = ['-created_at']
        unique_together = ['user']  # One deliverer profile per user

    def __str__(self):
        return f"Deliverer: {self.user.email}"


class Transaction(models.Model):
    """
    Transaction model for tracking all store transactions.
    Tracks consumer purchases, product sales, and earnings.
    """
    TRANSACTION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('delivery_assigned', 'Delivery Assigned'),
        ('delivery_confirmed', 'Delivery Confirmed'),
        ('buyer_confirmed', 'Buyer Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    DELIVERY_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
    ]
    
    consumer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                 related_name='purchases', help_text="Consumer who made the purchase")
    product = models.ForeignKey(Commodity, on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='transactions', help_text="Product/service sold")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='transactions',
                             help_text="Store that made the sale")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Transaction price")
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00,
                                      help_text="Delivery fee (8.5% of price)")
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00,
                                     help_text="Service fee deducted from transaction (1.5% of price)")
    net_profit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00,
                                     help_text="Net profit after service fee (price - service_fee)")
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS_CHOICES, default='pending',
                             help_text="Transaction status")
    deliverer = models.ForeignKey('Deliverer', on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='deliveries', help_text="Deliverer assigned to this transaction")
    delivery_status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default='pending',
                                      help_text="Delivery status")
    deliverer_confirmed = models.BooleanField(default=False, help_text="Deliverer confirmed delivery")
    buyer_confirmed = models.BooleanField(default=False, help_text="Buyer confirmed delivery")
    seller_confirmed = models.BooleanField(default=False, help_text="Seller confirmed delivery")
    buyer_location = models.CharField(max_length=255, blank=True, null=True,
                                    help_text="Buyer's hostel/location")
    seller_location = models.CharField(max_length=255, blank=True, null=True,
                                     help_text="Seller's store location")
    transaction_date = models.DateTimeField(auto_now_add=True, help_text="Date of transaction")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['store', '-transaction_date']),
            models.Index(fields=['consumer', '-transaction_date']),
            models.Index(fields=['product', '-transaction_date']),
            models.Index(fields=['deliverer', '-transaction_date']),
            models.Index(fields=['status', 'delivery_status']),
        ]

    def save(self, *args, **kwargs):
        # Calculate net profit automatically
        if self.price and self.service_fee is not None:
            self.net_profit = self.price - self.service_fee
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Transaction: {self.store.name} - {self.product.name if self.product else 'N/A'} - {self.price}"


class CommodityClick(models.Model):
    """
    Track click rates for commodities (products/services).
    Used for analytics to show which items get the most views.
    """
    commodity = models.ForeignKey(Commodity, on_delete=models.CASCADE, related_name='clicks',
                                 help_text="Commodity that was clicked/viewed")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                            help_text="User who clicked (optional, for analytics)")
    clicked_at = models.DateTimeField(auto_now_add=True, help_text="When the click occurred")
    ip_address = models.GenericIPAddressField(null=True, blank=True, help_text="IP address for analytics")

    class Meta:
        verbose_name = "Commodity Click"
        verbose_name_plural = "Commodity Clicks"
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['commodity', '-clicked_at']),
        ]

    def __str__(self):
        return f"Click: {self.commodity.name} - {self.clicked_at}"
