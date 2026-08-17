from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()
from .models import Hostel
from location.models import Location
from managers.models import Manager
from consumers.models import Consumer
from reservations.models import Reservation
import json


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class CampusSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Location
        fields = ['campus']


class ManagerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # expand user details

    class Meta: 
        model = Manager
        fields = ['id', 'user', 'paystack_subaccount_id', 'bank_account_setup', 'payment_currency', 'is_payment_ready', 'created_at', 'updated_at']


class HostelSerializer(serializers.ModelSerializer):
    campus = CampusSerializer(read_only=True)
    manager = ManagerSerializer(read_only=True)
    room_availability = serializers.SerializerMethodField()
    payment_ready = serializers.SerializerMethodField()

    class Meta:
        model = Hostel
        fields = '__all__'
    
    def get_room_availability(self, obj):
        """
        Calculate room availability for each room type
        """
        try:
            if not obj.room_details:
                return []
            
            rooms = obj.room_details
            if isinstance(rooms, str):
                rooms = json.loads(rooms)
            
            availability_data = []
            for room in rooms:
                room_uuid = room.get('uuid')
                number_of_rooms = int(room.get('number_of_rooms', 1))
                number_in_room = int(room.get('number_in_room', 1))
                
                # Calculate total capacity for this room type
                total_capacity = number_of_rooms * number_in_room
                
                # Count active consumers (tenants) already in this room
                active_consumers = Consumer.objects.filter(
                    hostel=obj,
                    room_uuid=room_uuid,
                    is_active=True
                ).count()
                
                # Count current active reservations for this room
                active_reservations = Reservation.objects.filter(
                    hostel=obj,
                    room_uuid=room_uuid,
                    status__in=['pending', 'confirmed'],
                    is_paid=True
                ).count()
                
                # Calculate available slots
                occupied_slots = active_consumers + active_reservations
                available_slots = total_capacity - occupied_slots
                
                availability_data.append({
                    'room_uuid': room_uuid,
                    'room_label': room.get('room_label', 'Standard Room'),
                    'total_capacity': total_capacity,
                    'occupied_slots': occupied_slots,
                    'available_slots': available_slots,
                    'is_available': available_slots > 0,
                    'is_full': available_slots <= 0
                })
            
            return availability_data
        except (ValueError, TypeError, KeyError) as e:
            print(f"Error calculating room availability: {e}")
            return []
    
    def get_payment_ready(self, obj):
        """
        Check if manager has complete payment setup
        """
        try:
            if not obj.manager:
                return False
            
            return obj.manager.is_payment_ready
        except Exception as e:
            print(f"Error checking payment readiness: {e}")
            return False
