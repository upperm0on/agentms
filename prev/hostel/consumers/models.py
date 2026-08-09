from django.db import models
from hq.models import Hostel
from django.contrib.auth import get_user_model

User = get_user_model()

from datetime import datetime, timezone


# Create your models here.
class Consumer(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    room_uuid = models.CharField(max_length=36, blank=True, null=True, db_index=True)
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, null=True, blank=True) 
    amount = models.DecimalField(max_digits=255, decimal_places=2, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    is_active = models.BooleanField(default=False)
    reference = models.CharField(max_length=100, blank=True, null=True, unique=True)
    def set_active(self, active=True):
        self.is_active = active
        self.save()

    def remove_self(self): 
        if self.hostel and self.hostel.checkout <= datetime.now(timezone.utc):
            self.delete()


# Signals to keep availability real-time without manual triggers
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from hq.models import update_room_and_hostel_availability

@receiver([post_save, post_delete], sender=Consumer)
def update_hostel_on_consumer_change(sender, instance, **kwargs):
    if instance.hostel_id:
        update_room_and_hostel_availability(instance.hostel_id)