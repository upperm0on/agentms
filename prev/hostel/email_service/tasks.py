"""
Celery tasks for sending email notifications asynchronously
Enhanced with constant notifications and PDF receipts
"""

from celery import shared_task
from django.contrib.auth.models import User
from email_service.enhanced_email_service import enhanced_email_service
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_reservation_confirmation_email(reservation_id, user_id):
    """Send reservation confirmation email asynchronously"""
    try:
        from reservations.models import Reservation
        reservation = Reservation.objects.get(id=reservation_id)
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_reservation_confirmation_with_receipt(reservation, user)
        logger.info(f"Reservation confirmation email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send reservation confirmation email: {str(e)}")
        return False

@shared_task
def send_payment_confirmation_email(payment_id, user_id):
    """Send payment confirmation email asynchronously"""
    try:
        from payments.models import Payment  # Assuming you have a Payment model
        payment = Payment.objects.get(id=payment_id)
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_payment_confirmation_with_receipt(payment, user)
        logger.info(f"Payment confirmation email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send payment confirmation email: {str(e)}")
        return False

@shared_task
def send_reservation_reminder_email(reservation_id, user_id, days_until_expiry):
    """Send reservation reminder email asynchronously"""
    try:
        from reservations.models import Reservation
        reservation = Reservation.objects.get(id=reservation_id)
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_reservation_reminder(reservation, user, days_until_expiry)
        logger.info(f"Reservation reminder email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send reservation reminder email: {str(e)}")
        return False

@shared_task
def send_payment_overdue_email(user_id, amount, days_overdue):
    """Send payment overdue email asynchronously"""
    try:
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_payment_overdue(user, amount, days_overdue)
        logger.info(f"Payment overdue email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send payment overdue email: {str(e)}")
        return False

@shared_task
def send_maintenance_scheduled_email(user_id, maintenance_details):
    """Send maintenance scheduled email asynchronously"""
    try:
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_maintenance_scheduled(user, maintenance_details)
        logger.info(f"Maintenance scheduled email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send maintenance scheduled email: {str(e)}")
        return False

@shared_task
def send_emergency_maintenance_email(user_id, maintenance_details):
    """Send emergency maintenance email asynchronously"""
    try:
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_emergency_maintenance(user, maintenance_details)
        logger.info(f"Emergency maintenance email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send emergency maintenance email: {str(e)}")
        return False

@shared_task
def send_login_alert_email(user_id, login_details):
    """Send login alert email asynchronously"""
    try:
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_login_alert(user, login_details)
        logger.info(f"Login alert email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send login alert email: {str(e)}")
        return False

@shared_task
def send_password_changed_email(user_id):
    """Send password changed email asynchronously"""
    try:
        user = User.objects.get(id=user_id)
        
        result = enhanced_email_service.send_password_changed(user)
        logger.info(f"Password changed email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send password changed email: {str(e)}")
        return False

@shared_task
def send_ticket_created_email(user_id, ticket_id):
    """Send ticket created email asynchronously"""
    try:
        user = User.objects.get(id=user_id)
        # Assuming you have a Ticket model
        from support.models import Ticket
        ticket = Ticket.objects.get(id=ticket_id)
        
        result = enhanced_email_service.send_ticket_created(user, ticket)
        logger.info(f"Ticket created email sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send ticket created email: {str(e)}")
        return False

@shared_task
def send_occupancy_report_email(manager_id, report_data):
    """Send occupancy report email asynchronously"""
    try:
        manager = User.objects.get(id=manager_id)
        
        result = enhanced_email_service.send_occupancy_report(manager, report_data)
        logger.info(f"Occupancy report email sent to {manager.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send occupancy report email: {str(e)}")
        return False

@shared_task
def send_revenue_report_email(manager_id, report_data):
    """Send revenue report email asynchronously"""
    try:
        manager = User.objects.get(id=manager_id)
        
        result = enhanced_email_service.send_revenue_report(manager, report_data)
        logger.info(f"Revenue report email sent to {manager.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send revenue report email: {str(e)}")
        return False

@shared_task
def send_system_alert_email(admin_id, alert_details):
    """Send system alert email asynchronously"""
    try:
        admin = User.objects.get(id=admin_id)
        
        result = enhanced_email_service.send_system_alert(admin, alert_details)
        logger.info(f"System alert email sent to {admin.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send system alert email: {str(e)}")
        return False

@shared_task
def send_bulk_notification_email(user_ids, subject, template_name, context):
    """Send bulk notification email to multiple users"""
    try:
        users = User.objects.filter(id__in=user_ids)
        success_count = 0
        
        for user in users:
            try:
                result = enhanced_email_service.send_email_with_pdf(
                    subject=subject,
                    template_name=template_name,
                    context=context,
                    recipient_list=[user.email]
                )
                if result:
                    success_count += 1
            except Exception as e:
                logger.error(f"Failed to send bulk notification to {user.email}: {str(e)}")
        
        logger.info(f"Bulk notification sent to {success_count}/{len(users)} users")
        return success_count
    except Exception as e:
        logger.error(f"Failed to send bulk notification: {str(e)}")
        return 0

# New tasks for constant notifications
@shared_task
def send_constant_notification_email(user_id, action_type, details):
    """Send constant notification email"""
    try:
        user = User.objects.get(id=user_id)
        result = enhanced_email_service.send_constant_notifications(user, action_type, details)
        logger.info(f"Constant notification sent to {user.email}: {action_type}")
        return result
    except Exception as e:
        logger.error(f"Failed to send constant notification: {str(e)}")
        return False

@shared_task
def send_daily_summary_email(user_id):
    """Send daily summary email"""
    try:
        user = User.objects.get(id=user_id)
        
        # Generate summary data (you can customize this based on your needs)
        summary_data = {
            'searches': 0,  # This would be calculated from user activity
            'hostels_viewed': 0,
            'page_visits': 0,
            'time_spent': '0 minutes',
            'emails_received': 0,
        }
        
        result = enhanced_email_service.send_daily_summary(user, summary_data)
        logger.info(f"Daily summary sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send daily summary: {str(e)}")
        return False

@shared_task
def send_weekly_report_email(user_id):
    """Send weekly report email"""
    try:
        user = User.objects.get(id=user_id)
        
        # Generate report data (you can customize this based on your needs)
        report_data = {
            'total_bookings': 0,
            'total_spent': 0,
            'favorite_hostels': [],
            'activity_summary': {},
        }
        
        result = enhanced_email_service.send_weekly_report(user, report_data)
        logger.info(f"Weekly report sent to {user.email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send weekly report: {str(e)}")
        return False

@shared_task
def send_transparency_notification_email(user_id, notification_type, data):
    """Send transparency notification email"""
    try:
        user = User.objects.get(id=user_id)
        result = enhanced_email_service.send_transparency_notification(user, notification_type, data)
        logger.info(f"Transparency notification sent to {user.email}: {notification_type}")
        return result
    except Exception as e:
        logger.error(f"Failed to send transparency notification: {str(e)}")
        return False

@shared_task
def send_manager_notification_email(manager_id, notification_type, data):
    """Send manager notification email"""
    try:
        manager = User.objects.get(id=manager_id)
        result = enhanced_email_service.send_manager_notification(manager, notification_type, data)
        logger.info(f"Manager notification sent to {manager.email}: {notification_type}")
        return result
    except Exception as e:
        logger.error(f"Failed to send manager notification: {str(e)}")
        return False

@shared_task
def schedule_daily_summaries():
    """Schedule daily summary emails for all users"""
    try:
        from email_service.automation_service import email_automation_service
        result = email_automation_service.schedule_daily_summaries()
        logger.info("Daily summaries scheduled successfully")
        return result
    except Exception as e:
        logger.error(f"Failed to schedule daily summaries: {str(e)}")
        return False

@shared_task
def cleanup_temp_pdfs():
    """Clean up temporary PDF files"""
    try:
        from email_service.pdf_cleanup import pdf_cleanup_utility
        cleaned_count = pdf_cleanup_utility.cleanup_temp_pdfs()
        logger.info(f"PDF cleanup completed: {cleaned_count} files removed")
        return cleaned_count
    except Exception as e:
        logger.error(f"Failed to cleanup temporary PDFs: {str(e)}")
        return 0

@shared_task
def monitor_disk_usage():
    """Monitor disk usage and cleanup if necessary"""
    try:
        from email_service.pdf_cleanup import pdf_cleanup_utility
        cleaned_count = pdf_cleanup_utility.monitor_disk_usage()
        logger.info(f"Disk usage monitoring completed: {cleaned_count} files cleaned")
        return cleaned_count
    except Exception as e:
        logger.error(f"Failed to monitor disk usage: {str(e)}")
        return 0

@shared_task
def schedule_weekly_reports():
    """Schedule weekly report emails for all users"""
    try:
        from email_service.automation_service import email_automation_service
        result = email_automation_service.schedule_weekly_reports()
        logger.info("Weekly reports scheduled successfully")
        return result
    except Exception as e:
        logger.error(f"Failed to schedule weekly reports: {str(e)}")
        return False
