"""
Django signals for automatic email notifications
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.apps import apps
from django.utils import timezone
from datetime import timedelta
from email_service.tasks import (
    send_reservation_confirmation_email,
    send_payment_confirmation_email,
    send_login_alert_email,
    send_password_changed_email,
    send_ticket_created_email,
    send_system_alert_email
)
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender='reservations.Reservation')
def send_reservation_confirmation_signal(sender, instance, created, **kwargs):
    """Send confirmation email when a new reservation is created"""
    if created and instance.status == 'pending':
        try:
            send_reservation_confirmation_email.delay(instance.id, instance.user.id)
            logger.info(f"Reservation confirmation email queued for {instance.user.email}")
        except Exception as e:
            logger.error(f"Failed to queue reservation confirmation email: {str(e)}")

@receiver(post_save, sender='payments.Payment')
def send_payment_confirmation_signal(sender, instance, created, **kwargs):
    """Send confirmation email when a payment is processed"""
    if created and instance.status == 'completed':
        try:
            send_payment_confirmation_email.delay(instance.id, instance.user.id)
            logger.info(f"Payment confirmation email queued for {instance.user.email}")
        except Exception as e:
            logger.error(f"Failed to queue payment confirmation email: {str(e)}")

# Only register support ticket signal if support app is installed
if apps.is_installed('support'):
    @receiver(post_save, sender='support.Ticket')
    def send_ticket_created_signal(sender, instance, created, **kwargs):
        """Send notification email when a support ticket is created"""
        if created:
            try:
                send_ticket_created_email.delay(instance.user.id, instance.id)
                logger.info(f"Ticket created email queued for {instance.user.email}")
            except Exception as e:
                logger.error(f"Failed to queue ticket created email: {str(e)}")

@receiver(pre_save, sender=User)
def detect_password_change(sender, instance, **kwargs):
    """Detect password changes and send notification"""
    if instance.pk:
        try:
            old_instance = User.objects.get(pk=instance.pk)
            if old_instance.password != instance.password:
                # Password has changed
                send_password_changed_email.delay(instance.id)
                logger.info(f"Password changed email queued for {instance.email}")
        except User.DoesNotExist:
            # New user, no password change
            pass
        except Exception as e:
            logger.error(f"Failed to detect password change: {str(e)}")

# Custom signal for login alerts
from django.dispatch import Signal

login_alert_signal = Signal()

@receiver(login_alert_signal)
def handle_login_alert(sender, user, login_details, **kwargs):
    """Handle login alert signal"""
    try:
        send_login_alert_email.delay(user.id, login_details)
        logger.info(f"Login alert email queued for {user.email}")
    except Exception as e:
        logger.error(f"Failed to queue login alert email: {str(e)}")

# Custom signal for system alerts
system_alert_signal = Signal()

@receiver(system_alert_signal)
def handle_system_alert(sender, admin, alert_details, **kwargs):
    """Handle system alert signal"""
    try:
        send_system_alert_email.delay(admin.id, alert_details)
        logger.info(f"System alert email queued for {admin.email}")
    except Exception as e:
        logger.error(f"Failed to queue system alert email: {str(e)}")

# Custom signal for maintenance notifications
maintenance_scheduled_signal = Signal()

@receiver(maintenance_scheduled_signal)
def handle_maintenance_scheduled(sender, users, maintenance_details, **kwargs):
    """Handle maintenance scheduled signal"""
    try:
        from email_service.tasks import send_maintenance_scheduled_email
        for user in users:
            send_maintenance_scheduled_email.delay(user.id, maintenance_details)
        logger.info(f"Maintenance scheduled emails queued for {len(users)} users")
    except Exception as e:
        logger.error(f"Failed to queue maintenance scheduled emails: {str(e)}")

# Custom signal for emergency maintenance
emergency_maintenance_signal = Signal()

@receiver(emergency_maintenance_signal)
def handle_emergency_maintenance(sender, users, maintenance_details, **kwargs):
    """Handle emergency maintenance signal"""
    try:
        from email_service.tasks import send_emergency_maintenance_email
        for user in users:
            send_emergency_maintenance_email.delay(user.id, maintenance_details)
        logger.info(f"Emergency maintenance emails queued for {len(users)} users")
    except Exception as e:
        logger.error(f"Failed to queue emergency maintenance emails: {str(e)}")
