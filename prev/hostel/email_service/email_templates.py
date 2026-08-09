"""
Email templates for the hostel management system
"""

from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class EmailTemplates:
    """Centralized email template management"""
    
    @staticmethod
    def get_base_context():
        """Get base context for all emails"""
        return {
            'site_name': 'HostTels',
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
            'support_email': 'support@hosttels.com',
            'current_year': datetime.now().year,
        }
    
    @staticmethod
    def send_email(subject, template_name, context, recipient_list, from_email=None):
        """Send email with template"""
        try:
            base_context = EmailTemplates.get_base_context()
            base_context.update(context)
            
            message = render_to_string(f'emails/{template_name}.html', base_context)
            text_message = render_to_string(f'emails/{template_name}.txt', base_context)
            
            send_mail(
                subject=subject,
                message=text_message,
                html_message=message,
                from_email=from_email or settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipient_list,
                fail_silently=False,
            )
            logger.info(f"Email sent successfully to {recipient_list}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

class ReservationEmails:
    """Reservation-related email notifications"""
    
    @staticmethod
    def send_reservation_confirmation(reservation, user):
        """Send reservation confirmation email"""
        context = {
            'user': user,
            'reservation': reservation,
            'hostel': reservation.hostel,
            'check_in_date': reservation.reservee_date,
            'expiry_date': reservation.expiry_date,
            'amount': reservation.amount,
            'reference': reservation.reference,
        }
        
        return EmailTemplates.send_email(
            subject=f'Reservation Confirmed - {reservation.hostel.name}',
            template_name='reservation_confirmation',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_reservation_reminder(reservation, user, days_until_expiry):
        """Send reservation reminder email"""
        context = {
            'user': user,
            'reservation': reservation,
            'hostel': reservation.hostel,
            'expiry_date': reservation.expiry_date,
            'days_remaining': days_until_expiry,
        }
        
        return EmailTemplates.send_email(
            subject=f'Reservation Reminder - {days_until_expiry} days remaining',
            template_name='reservation_reminder',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_reservation_expired(reservation, user):
        """Send reservation expired notification"""
        context = {
            'user': user,
            'reservation': reservation,
            'hostel': reservation.hostel,
            'expiry_date': reservation.expiry_date,
        }
        
        return EmailTemplates.send_email(
            subject='Reservation Expired - Action Required',
            template_name='reservation_expired',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_room_assignment(reservation, user, room_details):
        """Send room assignment notification"""
        context = {
            'user': user,
            'reservation': reservation,
            'hostel': reservation.hostel,
            'room_details': room_details,
            'check_in_date': reservation.reservee_date,
        }
        
        return EmailTemplates.send_email(
            subject=f'Room Assigned - {room_details.get("room_number", "Room")}',
            template_name='room_assignment',
            context=context,
            recipient_list=[user.email]
        )

class PaymentEmails:
    """Payment-related email notifications"""
    
    @staticmethod
    def send_payment_confirmation(payment, user):
        """Send payment confirmation email"""
        context = {
            'user': user,
            'payment': payment,
            'amount': payment.amount,
            'reference': payment.reference,
            'payment_date': payment.created_at,
        }
        
        return EmailTemplates.send_email(
            subject='Payment Confirmation - Transaction Successful',
            template_name='payment_confirmation',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_payment_overdue(user, amount, days_overdue):
        """Send payment overdue notification"""
        context = {
            'user': user,
            'amount': amount,
            'days_overdue': days_overdue,
        }
        
        return EmailTemplates.send_email(
            subject=f'Payment Overdue - {days_overdue} days past due',
            template_name='payment_overdue',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_refund_processed(user, amount, reference):
        """Send refund processed notification"""
        context = {
            'user': user,
            'amount': amount,
            'reference': reference,
        }
        
        return EmailTemplates.send_email(
            subject='Refund Processed - Payment Returned',
            template_name='refund_processed',
            context=context,
            recipient_list=[user.email]
        )

class MaintenanceEmails:
    """Maintenance-related email notifications"""
    
    @staticmethod
    def send_maintenance_scheduled(user, maintenance_details):
        """Send scheduled maintenance notification"""
        context = {
            'user': user,
            'maintenance': maintenance_details,
            'scheduled_date': maintenance_details.get('scheduled_date'),
            'duration': maintenance_details.get('duration'),
            'description': maintenance_details.get('description'),
        }
        
        return EmailTemplates.send_email(
            subject='Scheduled Maintenance - Advance Notice',
            template_name='maintenance_scheduled',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_emergency_maintenance(user, maintenance_details):
        """Send emergency maintenance alert"""
        context = {
            'user': user,
            'maintenance': maintenance_details,
            'urgency': maintenance_details.get('urgency', 'High'),
            'description': maintenance_details.get('description'),
        }
        
        return EmailTemplates.send_email(
            subject='URGENT: Emergency Maintenance Required',
            template_name='emergency_maintenance',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_maintenance_completed(user, maintenance_details):
        """Send maintenance completion notification"""
        context = {
            'user': user,
            'maintenance': maintenance_details,
            'completion_date': maintenance_details.get('completion_date'),
            'description': maintenance_details.get('description'),
        }
        
        return EmailTemplates.send_email(
            subject='Maintenance Completed - Service Restored',
            template_name='maintenance_completed',
            context=context,
            recipient_list=[user.email]
        )

class SecurityEmails:
    """Security-related email notifications"""
    
    @staticmethod
    def send_login_alert(user, login_details):
        """Send login alert for suspicious activity"""
        context = {
            'user': user,
            'login_time': login_details.get('login_time'),
            'ip_address': login_details.get('ip_address'),
            'location': login_details.get('location'),
            'device': login_details.get('device'),
        }
        
        return EmailTemplates.send_email(
            subject='Security Alert - New Login Detected',
            template_name='login_alert',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_password_changed(user):
        """Send password change confirmation"""
        context = {
            'user': user,
            'change_time': datetime.now(),
        }
        
        return EmailTemplates.send_email(
            subject='Password Changed - Account Security Update',
            template_name='password_changed',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_account_suspended(user, reason):
        """Send account suspension notification"""
        context = {
            'user': user,
            'reason': reason,
            'suspension_date': datetime.now(),
        }
        
        return EmailTemplates.send_email(
            subject='Account Suspended - Action Required',
            template_name='account_suspended',
            context=context,
            recipient_list=[user.email]
        )

class SupportEmails:
    """Support-related email notifications"""
    
    @staticmethod
    def send_ticket_created(user, ticket):
        """Send ticket creation confirmation"""
        context = {
            'user': user,
            'ticket': ticket,
            'ticket_id': ticket.id,
            'subject': ticket.subject,
            'priority': ticket.priority,
        }
        
        return EmailTemplates.send_email(
            subject=f'Support Ticket Created - #{ticket.id}',
            template_name='ticket_created',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_ticket_response(user, ticket, response):
        """Send ticket response notification"""
        context = {
            'user': user,
            'ticket': ticket,
            'response': response,
            'ticket_id': ticket.id,
        }
        
        return EmailTemplates.send_email(
            subject=f'Support Response - Ticket #{ticket.id}',
            template_name='ticket_response',
            context=context,
            recipient_list=[user.email]
        )
    
    @staticmethod
    def send_ticket_resolved(user, ticket):
        """Send ticket resolution notification"""
        context = {
            'user': user,
            'ticket': ticket,
            'ticket_id': ticket.id,
            'resolution_date': datetime.now(),
        }
        
        return EmailTemplates.send_email(
            subject=f'Support Ticket Resolved - #{ticket.id}',
            template_name='ticket_resolved',
            context=context,
            recipient_list=[user.email]
        )

class AnalyticsEmails:
    """Analytics and reporting email notifications"""
    
    @staticmethod
    def send_occupancy_report(manager, report_data):
        """Send occupancy report to manager"""
        context = {
            'manager': manager,
            'report_data': report_data,
            'report_date': datetime.now(),
            'occupancy_rate': report_data.get('occupancy_rate'),
            'total_rooms': report_data.get('total_rooms'),
            'occupied_rooms': report_data.get('occupied_rooms'),
        }
        
        return EmailTemplates.send_email(
            subject='Monthly Occupancy Report',
            template_name='occupancy_report',
            context=context,
            recipient_list=[manager.email]
        )
    
    @staticmethod
    def send_revenue_report(manager, report_data):
        """Send revenue report to manager"""
        context = {
            'manager': manager,
            'report_data': report_data,
            'report_date': datetime.now(),
            'total_revenue': report_data.get('total_revenue'),
            'monthly_growth': report_data.get('monthly_growth'),
        }
        
        return EmailTemplates.send_email(
            subject='Monthly Revenue Report',
            template_name='revenue_report',
            context=context,
            recipient_list=[manager.email]
        )

class AdminEmails:
    """Administrative email notifications"""
    
    @staticmethod
    def send_system_alert(admin, alert_details):
        """Send system alert to admin"""
        context = {
            'admin': admin,
            'alert': alert_details,
            'alert_time': datetime.now(),
            'severity': alert_details.get('severity'),
            'description': alert_details.get('description'),
        }
        
        return EmailTemplates.send_email(
            subject=f'System Alert - {alert_details.get("severity")}',
            template_name='system_alert',
            context=context,
            recipient_list=[admin.email]
        )
    
    @staticmethod
    def send_backup_completed(admin, backup_details):
        """Send backup completion notification"""
        context = {
            'admin': admin,
            'backup': backup_details,
            'backup_time': datetime.now(),
            'size': backup_details.get('size'),
        }
        
        return EmailTemplates.send_email(
            subject='Database Backup Completed',
            template_name='backup_completed',
            context=context,
            recipient_list=[admin.email]
        )
