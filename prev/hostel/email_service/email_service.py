"""
Email service for sending notifications throughout the hostel management system
"""

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import logging
from .email_templates import (
    EmailTemplates, ReservationEmails, PaymentEmails, MaintenanceEmails, 
    SecurityEmails, SupportEmails, AnalyticsEmails, AdminEmails
)

logger = logging.getLogger(__name__)

class EmailService:
    """Centralized email service for all notifications"""
    
    def __init__(self):
        self.reservation_emails = ReservationEmails()
        self.payment_emails = PaymentEmails()
        self.maintenance_emails = MaintenanceEmails()
        self.security_emails = SecurityEmails()
        self.support_emails = SupportEmails()
        self.analytics_emails = AnalyticsEmails()
        self.admin_emails = AdminEmails()
    
    def send_email(self, subject, template_name, context, recipient_list, from_email=None):
        """Send email with template"""
        return EmailTemplates.send_email(subject, template_name, context, recipient_list, from_email)
    
    # Reservation Management
    def send_reservation_confirmation(self, reservation, user):
        """Send reservation confirmation email"""
        return self.reservation_emails.send_reservation_confirmation(reservation, user)
    
    def send_reservation_reminder(self, reservation, user, days_until_expiry):
        """Send reservation reminder email"""
        return self.reservation_emails.send_reservation_reminder(reservation, user, days_until_expiry)
    
    def send_reservation_expired(self, reservation, user):
        """Send reservation expired notification"""
        return self.reservation_emails.send_reservation_expired(reservation, user)
    
    def send_room_assignment(self, reservation, user, room_details):
        """Send room assignment notification"""
        return self.reservation_emails.send_room_assignment(reservation, user, room_details)
    
    # Payment Management
    def send_payment_confirmation(self, payment, user):
        """Send payment confirmation email"""
        return self.payment_emails.send_payment_confirmation(payment, user)
    
    def send_payment_overdue(self, user, amount, days_overdue):
        """Send payment overdue notification"""
        return self.payment_emails.send_payment_overdue(user, amount, days_overdue)
    
    def send_refund_processed(self, user, amount, reference):
        """Send refund processed notification"""
        return self.payment_emails.send_refund_processed(user, amount, reference)
    
    # Maintenance Management
    def send_maintenance_scheduled(self, user, maintenance_details):
        """Send scheduled maintenance notification"""
        return self.maintenance_emails.send_maintenance_scheduled(user, maintenance_details)
    
    def send_emergency_maintenance(self, user, maintenance_details):
        """Send emergency maintenance alert"""
        return self.maintenance_emails.send_emergency_maintenance(user, maintenance_details)
    
    def send_maintenance_completed(self, user, maintenance_details):
        """Send maintenance completion notification"""
        return self.maintenance_emails.send_maintenance_completed(user, maintenance_details)
    
    # Security Management
    def send_login_alert(self, user, login_details):
        """Send login alert for suspicious activity"""
        return self.security_emails.send_login_alert(user, login_details)
    
    def send_password_changed(self, user):
        """Send password change confirmation"""
        return self.security_emails.send_password_changed(user)
    
    def send_account_suspended(self, user, reason):
        """Send account suspension notification"""
        return self.security_emails.send_account_suspended(user, reason)
    
    # Support Management
    def send_ticket_created(self, user, ticket):
        """Send ticket creation confirmation"""
        return self.support_emails.send_ticket_created(user, ticket)
    
    def send_ticket_response(self, user, ticket, response):
        """Send ticket response notification"""
        return self.support_emails.send_ticket_response(user, ticket, response)
    
    def send_ticket_resolved(self, user, ticket):
        """Send ticket resolution notification"""
        return self.support_emails.send_ticket_resolved(user, ticket)
    
    # Analytics and Reporting
    def send_occupancy_report(self, manager, report_data):
        """Send occupancy report to manager"""
        return self.analytics_emails.send_occupancy_report(manager, report_data)
    
    def send_revenue_report(self, manager, report_data):
        """Send revenue report to manager"""
        return self.analytics_emails.send_revenue_report(manager, report_data)
    
    # Administrative
    def send_system_alert(self, admin, alert_details):
        """Send system alert to admin"""
        return self.admin_emails.send_system_alert(admin, alert_details)
    
    def send_backup_completed(self, admin, backup_details):
        """Send backup completion notification"""
        return self.admin_emails.send_backup_completed(admin, backup_details)

# Global email service instance
email_service = EmailService()

# Convenience functions for easy access
def send_reservation_confirmation(reservation, user):
    return email_service.send_reservation_confirmation(reservation, user)

def send_reservation_reminder(reservation, user, days_until_expiry):
    return email_service.send_reservation_reminder(reservation, user, days_until_expiry)

def send_reservation_expired(reservation, user):
    return email_service.send_reservation_expired(reservation, user)

def send_room_assignment(reservation, user, room_details):
    return email_service.send_room_assignment(reservation, user, room_details)

def send_payment_confirmation(payment, user):
    return email_service.send_payment_confirmation(payment, user)

def send_payment_overdue(user, amount, days_overdue):
    return email_service.send_payment_overdue(user, amount, days_overdue)

def send_refund_processed(user, amount, reference):
    return email_service.send_refund_processed(user, amount, reference)

def send_maintenance_scheduled(user, maintenance_details):
    return email_service.send_maintenance_scheduled(user, maintenance_details)

def send_emergency_maintenance(user, maintenance_details):
    return email_service.send_emergency_maintenance(user, maintenance_details)

def send_maintenance_completed(user, maintenance_details):
    return email_service.send_maintenance_completed(user, maintenance_details)

def send_login_alert(user, login_details):
    return email_service.send_login_alert(user, login_details)

def send_password_changed(user):
    return email_service.send_password_changed(user)

def send_account_suspended(user, reason):
    return email_service.send_account_suspended(user, reason)

def send_ticket_created(user, ticket):
    return email_service.send_ticket_created(user, ticket)

def send_ticket_response(user, ticket, response):
    return email_service.send_ticket_response(user, ticket, response)

def send_ticket_resolved(user, ticket):
    return email_service.send_ticket_resolved(user, ticket)

def send_occupancy_report(manager, report_data):
    return email_service.send_occupancy_report(manager, report_data)

def send_revenue_report(manager, report_data):
    return email_service.send_revenue_report(manager, report_data)

def send_system_alert(admin, alert_details):
    return email_service.send_system_alert(admin, alert_details)

def send_backup_completed(admin, backup_details):
    return email_service.send_backup_completed(admin, backup_details)
