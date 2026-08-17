"""
Utility functions for email notifications
"""

from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
from email_service.email_service import email_service
from email_service.tasks import (
    send_reservation_confirmation_email,
    send_payment_confirmation_email,
    send_reservation_reminder_email,
    send_payment_overdue_email,
    send_maintenance_scheduled_email,
    send_emergency_maintenance_email,
    send_login_alert_email,
    send_password_changed_email,
    send_ticket_created_email,
    send_occupancy_report_email,
    send_revenue_report_email,
    send_system_alert_email,
    send_bulk_notification_email
)
import logging

logger = logging.getLogger(__name__)

class EmailNotificationManager:
    """Manager class for handling email notifications"""
    
    def __init__(self):
        self.email_service = email_service
    
    def send_reservation_notifications(self, reservation, user):
        """Send all reservation-related notifications"""
        try:
            # Send confirmation email
            send_reservation_confirmation_email.delay(reservation.id, user.id)
            
            # Schedule reminder emails
            self.schedule_reservation_reminders(reservation, user)
            
            logger.info(f"Reservation notifications scheduled for {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send reservation notifications: {str(e)}")
            return False
    
    def schedule_reservation_reminders(self, reservation, user):
        """Schedule reservation reminder emails"""
        try:
            # Schedule reminders for 7, 3, and 1 days before expiry
            for days in [7, 3, 1]:
                send_reservation_reminder_email.apply_async(
                    args=[reservation.id, user.id, days],
                    eta=reservation.expiry_date - timedelta(days=days)
                )
            
            logger.info(f"Reservation reminders scheduled for {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to schedule reservation reminders: {str(e)}")
            return False
    
    def send_payment_notifications(self, payment, user):
        """Send payment-related notifications"""
        try:
            # Send confirmation email
            send_payment_confirmation_email.delay(payment.id, user.id)
            
            # Schedule overdue notifications if needed
            self.schedule_payment_overdue_notifications(payment, user)
            
            logger.info(f"Payment notifications scheduled for {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send payment notifications: {str(e)}")
            return False
    
    def schedule_payment_overdue_notifications(self, payment, user):
        """Schedule payment overdue notifications"""
        try:
            # Schedule overdue notifications for 7, 14, and 30 days after due date
            for days_overdue in [7, 14, 30]:
                send_payment_overdue_email.apply_async(
                    args=[user.id, payment.amount, days_overdue],
                    eta=timezone.now() + timedelta(days=days_overdue)
                )
            
            logger.info(f"Payment overdue notifications scheduled for {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to schedule payment overdue notifications: {str(e)}")
            return False
    
    def send_maintenance_notifications(self, users, maintenance_details, is_emergency=False):
        """Send maintenance notifications to users"""
        try:
            if is_emergency:
                for user in users:
                    send_emergency_maintenance_email.delay(user.id, maintenance_details)
            else:
                for user in users:
                    send_maintenance_scheduled_email.delay(user.id, maintenance_details)
            
            logger.info(f"Maintenance notifications sent to {len(users)} users")
            return True
        except Exception as e:
            logger.error(f"Failed to send maintenance notifications: {str(e)}")
            return False
    
    def send_security_notifications(self, user, notification_type, details):
        """Send security-related notifications"""
        try:
            if notification_type == 'login_alert':
                send_login_alert_email.delay(user.id, details)
            elif notification_type == 'password_changed':
                send_password_changed_email.delay(user.id)
            elif notification_type == 'account_suspended':
                # This would be handled by the account suspension process
                pass
            
            logger.info(f"Security notification sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send security notification: {str(e)}")
            return False
    
    def send_support_notifications(self, user, ticket, notification_type):
        """Send support-related notifications"""
        try:
            if notification_type == 'ticket_created':
                send_ticket_created_email.delay(user.id, ticket.id)
            elif notification_type == 'ticket_response':
                # This would be handled by the support system
                pass
            elif notification_type == 'ticket_resolved':
                # This would be handled by the support system
                pass
            
            logger.info(f"Support notification sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send support notification: {str(e)}")
            return False
    
    def send_analytics_reports(self, manager, report_type, report_data):
        """Send analytics reports to managers"""
        try:
            if report_type == 'occupancy':
                send_occupancy_report_email.delay(manager.id, report_data)
            elif report_type == 'revenue':
                send_revenue_report_email.delay(manager.id, report_data)
            
            logger.info(f"Analytics report sent to {manager.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send analytics report: {str(e)}")
            return False
    
    def send_admin_notifications(self, admin, notification_type, details):
        """Send administrative notifications"""
        try:
            if notification_type == 'system_alert':
                send_system_alert_email.delay(admin.id, details)
            elif notification_type == 'backup_completed':
                # This would be handled by the backup system
                pass
            
            logger.info(f"Admin notification sent to {admin.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send admin notification: {str(e)}")
            return False
    
    def send_bulk_notifications(self, user_ids, subject, template_name, context):
        """Send bulk notifications to multiple users"""
        try:
            send_bulk_notification_email.delay(user_ids, subject, template_name, context)
            logger.info(f"Bulk notification sent to {len(user_ids)} users")
            return True
        except Exception as e:
            logger.error(f"Failed to send bulk notification: {str(e)}")
            return False

# Global notification manager instance
notification_manager = EmailNotificationManager()

# Convenience functions
def notify_reservation_confirmed(reservation, user):
    """Notify user of reservation confirmation"""
    return notification_manager.send_reservation_notifications(reservation, user)

def notify_payment_confirmed(payment, user):
    """Notify user of payment confirmation"""
    return notification_manager.send_payment_notifications(payment, user)

def notify_maintenance_scheduled(users, maintenance_details, is_emergency=False):
    """Notify users of maintenance"""
    return notification_manager.send_maintenance_notifications(users, maintenance_details, is_emergency)

def notify_security_alert(user, notification_type, details):
    """Notify user of security alert"""
    return notification_manager.send_security_notifications(user, notification_type, details)

def notify_support_ticket(user, ticket, notification_type):
    """Notify user of support ticket"""
    return notification_manager.send_support_notifications(user, ticket, notification_type)

def notify_analytics_report(manager, report_type, report_data):
    """Notify manager of analytics report"""
    return notification_manager.send_analytics_reports(manager, report_type, report_data)

def notify_admin_alert(admin, notification_type, details):
    """Notify admin of system alert"""
    return notification_manager.send_admin_notifications(admin, notification_type, details)

def notify_bulk_users(user_ids, subject, template_name, context):
    """Notify multiple users"""
    return notification_manager.send_bulk_notifications(user_ids, subject, template_name, context)
