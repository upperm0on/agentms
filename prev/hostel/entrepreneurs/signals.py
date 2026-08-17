from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Entrepreneur
from consumers.models import Consumer


@receiver(post_save, sender=Entrepreneur)
def populate_entrepreneur_location(sender, instance, **kwargs):
    """
    Signal to auto-populate entrepreneur location from consumer.hostel.campus
    if the user is an active consumer with a hostel.
    """
    # Check if user has an active consumer record
    active_consumer = Consumer.objects.filter(
        user=instance.user,
        is_active=True,
        hostel__isnull=False
    ).first()
    
    if active_consumer and active_consumer.hostel and active_consumer.hostel.campus:
        # Get the campus name from the Location model
        campus_name = active_consumer.hostel.campus.campus
        if campus_name and instance.location != campus_name:
            instance.location = campus_name
            # Use update() to avoid recursion
            Entrepreneur.objects.filter(pk=instance.pk).update(location=campus_name)






