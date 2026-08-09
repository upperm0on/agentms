from rest_framework import serializers
from .models import Entrepreneur, Store, Commodity, Deliverer, Transaction


class CommoditySerializer(serializers.ModelSerializer):
    """Serializer for Commodity model"""
    image_url = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Commodity
        fields = ['id', 'store', 'name', 'description', 'type', 'category_slug', 'price', 
                  'image', 'image_url', 'primary_image',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Get image URL if image exists"""
        if obj.image:
            try:
                return obj.image.url
            except Exception:
                return obj.image.name if obj.image.name else None
        return None
    
    def get_primary_image(self, obj):
        """Get primary image URL (alias for image_url)"""
        return self.get_image_url(obj)


class StoreSerializer(serializers.ModelSerializer):
    """Serializer for Store model"""
    commodities = CommoditySerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Store
        fields = ['id', 'name', 'description', 'location', 'commodities',
                  'logo_url', 'banner_url',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_logo_url(self, obj):
        """Get logo URL if logo exists"""
        # Check if Store model has logo field (using hasattr to avoid errors)
        if hasattr(obj, 'logo') and obj.logo:
            try:
                return obj.logo.url
            except Exception:
                return obj.logo.name if obj.logo.name else None
        return None
    
    def get_banner_url(self, obj):
        """Get banner URL if cover_photo exists"""
        # Check if Store model has cover_photo field (using hasattr to avoid errors)
        if hasattr(obj, 'cover_photo') and obj.cover_photo:
            try:
                return obj.cover_photo.url
            except Exception:
                return obj.cover_photo.name if obj.cover_photo.name else None
        return None


class EntrepreneurSerializer(serializers.ModelSerializer):
    """Serializer for Entrepreneur model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    store = StoreSerializer(read_only=True)
    store_id = serializers.IntegerField(source='store.id', read_only=True, allow_null=True)

    class Meta:
        model = Entrepreneur
        fields = ['id', 'user', 'user_email', 'user_username', 'store', 'store_id',
                  'location', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DelivererSerializer(serializers.ModelSerializer):
    """Serializer for Deliverer model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Deliverer
        fields = ['id', 'user', 'user_email', 'user_username', 'location', 'phone_number',
                  'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    product = CommoditySerializer(read_only=True)
    store = StoreSerializer(read_only=True)
    deliverer = DelivererSerializer(read_only=True)
    consumer_email = serializers.EmailField(source='consumer.email', read_only=True)
    consumer_username = serializers.CharField(source='consumer.username', read_only=True)
    consumer = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'consumer', 'consumer_email', 'consumer_username', 'product', 'store',
                  'price', 'delivery_fee', 'service_fee', 'net_profit', 'status', 'deliverer',
                  'delivery_status', 'deliverer_confirmed', 'buyer_confirmed', 'seller_confirmed',
                  'buyer_location', 'seller_location', 'transaction_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'transaction_date']
    
    def get_consumer(self, obj):
        """Return consumer information as a nested object"""
        if obj.consumer:
            return {
                'id': obj.consumer.id,
                'username': obj.consumer.username,
                'email': obj.consumer.email,
            }
        return None

