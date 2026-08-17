"""
Email notifications for all user actions
Works synchronously for testing, asynchronously for production
"""
from django.contrib.auth.models import User
from django.conf import settings
from email_service.tasks import send_constant_notification_email, send_manager_notification_email
from email_service.automation_service import email_automation_service
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Check if we're in testing mode
TESTING_MODE = getattr(settings, 'TESTING_EMAILS', False)

def send_action_email(user, action_type, details, use_async=None):
    """
    Send email for user action
    If use_async is None, uses TESTING_MODE to decide
    """
    if use_async is None:
        use_async = not TESTING_MODE
    
    try:
        if use_async:
            # Production: Use Celery async
            send_constant_notification_email.delay(user.id, action_type, details)
        else:
            # Testing: Send synchronously
            from email_service.enhanced_email_service import enhanced_email_service
            enhanced_email_service.send_constant_notifications(user, action_type, details)
        
        logger.info(f"Action email sent: {action_type} to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send action email: {str(e)}")
        # Fallback to synchronous if async fails
        try:
            from email_service.enhanced_email_service import enhanced_email_service
            enhanced_email_service.send_constant_notifications(user, action_type, details)
            return True
        except Exception as e2:
            logger.error(f"Failed to send action email (sync fallback): {str(e2)}")
            return False

# Admin Action Emails
def notify_admin_hostel_created(admin, hostel):
    """Notify admin when hostel is created"""
    details = {
        'hostel_name': hostel.name,
        'hostel_id': hostel.id,
        'campus': str(hostel.campus) if hasattr(hostel, 'campus') and hostel.campus else 'N/A',
        'action_time': hostel.created_at.isoformat() if hasattr(hostel, 'created_at') and hostel.created_at else datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_hostel_created', details)

def notify_admin_hostel_updated(admin, hostel, changes=None):
    """Notify admin when hostel is updated"""
    details = {
        'hostel_name': hostel.name,
        'hostel_id': hostel.id,
        'changes': changes or {},
        'action_time': hostel.updated_at.isoformat() if hasattr(hostel, 'updated_at') and hostel.updated_at else datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_hostel_updated', details)

def notify_admin_hostel_deleted(admin, hostel_name, hostel_id):
    """Notify admin when hostel is deleted"""
    details = {
        'hostel_name': hostel_name,
        'hostel_id': hostel_id,
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_hostel_deleted', details)

def notify_admin_user_created(admin, user):
    """Notify admin when user is created"""
    details = {
        'user_email': user.email,
        'user_id': user.id,
        'username': user.username,
        'action_time': user.date_joined.isoformat() if hasattr(user, 'date_joined') and user.date_joined else datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_user_created', details)

def notify_admin_user_updated(admin, user, changes=None):
    """Notify admin when user is updated"""
    details = {
        'user_email': user.email,
        'user_id': user.id,
        'changes': changes or {},
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_user_updated', details)

def notify_admin_user_deleted(admin, user_email, user_id):
    """Notify admin when user is deleted"""
    details = {
        'user_email': user_email,
        'user_id': user_id,
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_user_deleted', details)

def notify_admin_reservation_created(admin, reservation):
    """Notify admin when reservation is created"""
    details = {
        'reservation_id': reservation.id,
        'user_email': reservation.user.email if hasattr(reservation, 'user') else 'N/A',
        'hostel_name': reservation.hostel.name if hasattr(reservation, 'hostel') else 'N/A',
        'amount': str(reservation.amount) if hasattr(reservation, 'amount') and reservation.amount else '0',
        'action_time': reservation.created_at.isoformat() if hasattr(reservation, 'created_at') and reservation.created_at else datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_reservation_created', details)

def notify_admin_reservation_updated(admin, reservation, changes=None):
    """Notify admin when reservation is updated"""
    details = {
        'reservation_id': reservation.id,
        'user_email': reservation.user.email if hasattr(reservation, 'user') else 'N/A',
        'changes': changes or {},
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_reservation_updated', details)

def notify_admin_reservation_cancelled(admin, reservation):
    """Notify admin when reservation is cancelled"""
    details = {
        'reservation_id': reservation.id,
        'user_email': reservation.user.email if hasattr(reservation, 'user') else 'N/A',
        'hostel_name': reservation.hostel.name if hasattr(reservation, 'hostel') else 'N/A',
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_reservation_cancelled', details)

def notify_admin_payment_confirmed(admin, reservation):
    """Notify admin when payment is confirmed"""
    details = {
        'reservation_id': reservation.id,
        'user_email': reservation.user.email if hasattr(reservation, 'user') else 'N/A',
        'amount': str(reservation.amount) if hasattr(reservation, 'amount') and reservation.amount else '0',
        'reference': reservation.reference if hasattr(reservation, 'reference') and reservation.reference else 'N/A',
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_payment_confirmed', details)

def notify_admin_record_created(admin, app_label, model_name, record_id, record_data=None):
    """Notify admin when any database record is created"""
    details = {
        'app_label': app_label,
        'model_name': model_name,
        'record_id': record_id,
        'record_data': record_data or {},
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_record_created', details)

def notify_admin_record_updated(admin, app_label, model_name, record_id, changes=None):
    """Notify admin when any database record is updated"""
    details = {
        'app_label': app_label,
        'model_name': model_name,
        'record_id': record_id,
        'changes': changes or {},
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_record_updated', details)

def notify_admin_record_deleted(admin, app_label, model_name, record_id):
    """Notify admin when any database record is deleted"""
    details = {
        'app_label': app_label,
        'model_name': model_name,
        'record_id': record_id,
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(admin, 'admin_record_deleted', details)

# Manager Action Emails
def notify_manager_hostel_created(manager, hostel):
    """Notify manager when hostel is created"""
    details = {
        'hostel_name': hostel.name,
        'hostel_id': hostel.id,
        'campus': str(hostel.campus) if hasattr(hostel, 'campus') and hostel.campus else 'N/A',
    }
    return email_automation_service.trigger_manager_notification(
        manager, 'hostel_created', details
    )

def notify_manager_hostel_updated(manager, hostel, changes=None):
    """Notify manager when hostel is updated"""
    details = {
        'hostel_name': hostel.name,
        'hostel_id': hostel.id,
        'changes': changes or {},
    }
    return email_automation_service.trigger_manager_notification(
        manager, 'hostel_updated', details
    )

def notify_manager_new_reservation(manager, reservation):
    """Notify manager when new reservation is created"""
    return email_automation_service.trigger_new_booking_manager_notification(
        manager, reservation
    )

def notify_manager_payment_received(manager, payment):
    """Notify manager when payment is received"""
    return email_automation_service.trigger_payment_received_manager_notification(
        manager, payment
    )

# Market Action Emails
def notify_market_listing_created(user, listing):
    """Notify user when listing is created"""
    details = {
        'listing_id': listing.id if hasattr(listing, 'id') else 'N/A',
        'product_name': getattr(listing, 'name', 'Product'),
        'price': str(getattr(listing, 'price', '0')),
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(user, 'market_listing_created', details)

def notify_market_order_created(user, order):
    """Notify user when order is created"""
    details = {
        'order_id': order.id if hasattr(order, 'id') else 'N/A',
        'product_name': getattr(order.product, 'name', 'Product') if hasattr(order, 'product') and order.product else 'Product',
        'amount': str(getattr(order, 'amount', '0')),
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(user, 'market_order_created', details)

def notify_market_order_status_changed(user, order, old_status, new_status):
    """Notify user when order status changes"""
    details = {
        'order_id': order.id if hasattr(order, 'id') else 'N/A',
        'old_status': old_status,
        'new_status': new_status,
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(user, 'market_order_status_changed', details)

def notify_market_store_created(user, store):
    """Notify user when store is created"""
    details = {
        'store_id': store.id if hasattr(store, 'id') else 'N/A',
        'store_name': getattr(store, 'name', 'Store'),
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(user, 'market_store_created', details)

def notify_market_store_updated(user, store, changes=None):
    """Notify user when store is updated"""
    details = {
        'store_id': store.id if hasattr(store, 'id') else 'N/A',
        'store_name': getattr(store, 'name', 'Store'),
        'changes': changes or {},
        'action_time': datetime.now().isoformat(),
    }
    return send_action_email(user, 'market_store_updated', details)

