from django.db import models
from django.contrib.auth.models import User
from hq.models import Hostel
from datetime import timedelta

# Create your models here.
class Reservation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE)
    reservee_date = models.DateField()
    expiry_date = models.DateField()
    room_uuid = models.CharField(max_length=36)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled'), ('converted', 'Converted'), ('full', 'Full')])
    
    # Payment fields
    amount = models.DecimalField(max_digits=255, decimal_places=2, blank=True, null=True)
    deposit_amount = models.DecimalField(max_digits=255, decimal_places=2, blank=True, null=True)
    reference = models.CharField(max_length=100, blank=True, null=True, unique=True)
    is_paid = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # If expiry_date hasn't been set explicitly, calculate based on room settings
        if not self.expiry_date and self.reservee_date:
            from datetime import date
            if isinstance(self.reservee_date, str):
                self.reservee_date = date.fromisoformat(self.reservee_date)
            
            # Get expiry period from room details
            expiry_days = self.get_room_expiry_period()
            self.expiry_date = self.reservee_date + timedelta(days=expiry_days)
        super().save(*args, **kwargs)
    
    def get_room_expiry_period(self):
        """Get expiry period in days from room details"""
        try:
            if self.hostel and self.hostel.room_details:
                import json
                rooms = self.hostel.room_details
                if isinstance(rooms, str):
                    rooms = json.loads(rooms)
                
                # Find the room with matching UUID
                for room in rooms:
                    if room.get('uuid') == self.room_uuid:
                        # Return room-specific expiry period or default to 3 days
                        return int(room.get('reservation_expiry_days', 3))
        except (ValueError, TypeError, KeyError):
            pass
        
        # Default to 3 days if no room-specific setting found
        return 3