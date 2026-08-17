"""
Enhanced Email Notification System for Constant Transparency
Sends comprehensive email notifications for all user actions and system events
"""

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import logging
import os
import tempfile
from .email_templates import EmailTemplates
from .pdf_generator import pdf_generator

logger = logging.getLogger(__name__)

class EnhancedEmailService:
    """Enhanced email service with constant notifications and PDF receipts"""
    
    def __init__(self):
        self.base_service = EmailTemplates()
    
    def send_email_with_pdf(self, subject, template_name, context, recipient_list, pdf_content=None, pdf_filename=None):
        """Send email with optional PDF attachment"""
        temp_file = None
        
        try:
            # Try to render HTML content - fallback to general template if not found
            try:
                html_content = render_to_string(f'emails/{template_name}.html', context)
            except Exception:
                # Fallback to general notification template
                html_content = render_to_string('emails/general_notification.html', context)
            
            # Try to render text content - fallback to general template if not found
            try:
                text_content = render_to_string(f'emails/{template_name}.txt', context)
            except Exception:
                # Fallback to simple text if template not found
                try:
                    text_content = render_to_string('emails/general_notification.txt', context)
                except Exception:
                    # Final fallback - create simple text email
                    details = context.get('details', {})
                    details_text = '\n'.join(f'{k}: {v}' for k, v in details.items()) if details else 'No additional details'
                    text_content = f"""
{subject}

Dear {user.first_name or user.username},

This email confirms an action you performed.

Action Type: {action_type.replace('_', ' ').title()}
Timestamp: {context.get('timestamp', 'N/A')}

Details:
{details_text}

Best regards,
The {context.get('site_name', 'HostTels')} Team
"""
            
            # Create email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list
            )
            
            # Attach HTML content
            email.attach_alternative(html_content, "text/html")
            
            # Attach PDF if provided
            if pdf_content and pdf_filename:
                email.attach(pdf_filename, pdf_content, 'application/pdf')
            
            # Send email
            email.send()
            logger.info(f"Enhanced email sent successfully to {recipient_list}")
            
            # Log PDF attachment info
            if pdf_content:
                logger.info(f"PDF attachment sent: {pdf_filename} ({len(pdf_content)} bytes)")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send enhanced email: {str(e)}")
            return False
        
        finally:
            # Ensure any temporary files are cleaned up
            if temp_file:
                try:
                    temp_file.close()
                    if os.path.exists(temp_file.name):
                        os.unlink(temp_file.name)
                        logger.info(f"Temporary file cleaned up: {temp_file.name}")
                except Exception as cleanup_error:
                    logger.error(f"Failed to cleanup temporary file: {str(cleanup_error)}")
    
    def send_reservation_confirmation_with_receipt(self, reservation, user):
        """Send reservation confirmation with PDF receipt"""
        try:
            # Generate PDF receipt
            pdf_content = pdf_generator.generate_manager_receipt(reservation, user)
            
            # Prepare context
            context = {
                'user': user,
                'reservation': reservation,
                'hostel': reservation.hostel,
                'check_in_date': reservation.reservee_date,
                'expiry_date': reservation.expiry_date,
                'amount': reservation.amount,
                'reference': reservation.reference,
                'pdf_attached': True,
            }
            
            # Send email with PDF
            pdf_filename = f"Reservation_Receipt_{reservation.reference}.pdf"
            return self.send_email_with_pdf(
                subject=f'🎉 Reservation Confirmed - {reservation.hostel.name} (Receipt Attached)',
                template_name='reservation_confirmation',
                context=context,
                recipient_list=[user.email],
                pdf_content=pdf_content,
                pdf_filename=pdf_filename
            )
            
        except Exception as e:
            logger.error(f"Failed to send reservation confirmation with receipt: {str(e)}")
            return False
    
    def send_payment_confirmation_with_receipt(self, payment, user):
        """Send payment confirmation with PDF receipt"""
        try:
            # Generate PDF receipt (assuming payment has reservation info)
            reservation = getattr(payment, 'reservation', None)
            if reservation:
                pdf_content = pdf_generator.generate_manager_receipt(reservation, user)
            else:
                pdf_content = None
            
            # Prepare context
            context = {
                'user': user,
                'payment': payment,
                'amount': payment.amount,
                'reference': payment.reference,
                'payment_date': payment.created_at,
                'pdf_attached': pdf_content is not None,
            }
            
            # Send email with PDF
            pdf_filename = f"Payment_Receipt_{payment.reference}.pdf" if pdf_content else None
            return self.send_email_with_pdf(
                subject=f'✅ Payment Confirmed - ₦{payment.amount:,.2f} (Receipt Attached)',
                template_name='payment_confirmation',
                context=context,
                recipient_list=[user.email],
                pdf_content=pdf_content,
                pdf_filename=pdf_filename
            )
            
        except Exception as e:
            logger.error(f"Failed to send payment confirmation with receipt: {str(e)}")
            return False
    
    def send_constant_notifications(self, user, action_type, details):
        """Send constant notifications for transparency"""
        try:
            # Determine notification type and template
            notification_templates = {
                'login': 'login_notification',
                'profile_update': 'profile_update_notification',
                'password_change': 'password_change_notification',
                'booking_view': 'booking_view_notification',
                'search_performed': 'search_notification',
                'page_visit': 'page_visit_notification',
                'support_ticket': 'support_ticket_notification',
                'review_submitted': 'review_notification',
                'rating_given': 'rating_notification',
                # Admin action notifications
                'admin_hostel_created': 'admin_action_notification',
                'admin_hostel_updated': 'admin_action_notification',
                'admin_hostel_deleted': 'admin_action_notification',
                'admin_user_created': 'admin_action_notification',
                'admin_user_updated': 'admin_action_notification',
                'admin_user_deleted': 'admin_action_notification',
                'admin_reservation_created': 'admin_action_notification',
                'admin_reservation_updated': 'admin_action_notification',
                'admin_reservation_cancelled': 'admin_action_notification',
                'admin_payment_confirmed': 'admin_action_notification',
                'admin_record_created': 'admin_action_notification',
                'admin_record_updated': 'admin_action_notification',
                'admin_record_deleted': 'admin_action_notification',
                # Market action notifications
                'market_listing_created': 'market_action_notification',
                'market_order_created': 'market_action_notification',
                'market_order_status_changed': 'market_action_notification',
                'market_store_created': 'market_action_notification',
                'market_store_updated': 'market_action_notification',
            }
            
            template_name = notification_templates.get(action_type, 'general_notification')
            
            # Prepare context
            context = {
                'user': user,
                'action_type': action_type,
                'details': details,
                'timestamp': datetime.now(),
                'site_name': 'HostTels',
                'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                'support_email': 'support@hosttels.com',
            }
            
            # Send notification
            return self.send_email_with_pdf(
                subject=f'📱 Activity Update - {action_type.replace("_", " ").title()}',
                template_name=template_name,
                context=context,
                recipient_list=[user.email]
            )
            
        except Exception as e:
            logger.error(f"Failed to send constant notification: {str(e)}")
            return False
    
    def send_daily_summary(self, user, summary_data):
        """Send daily activity summary"""
        try:
            context = {
                'user': user,
                'summary_data': summary_data,
                'date': datetime.now().strftime('%B %d, %Y'),
                'site_name': 'HostTels',
                'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                'support_email': 'support@hosttels.com',
            }
            
            return self.send_email_with_pdf(
                subject=f'📊 Daily Summary - {datetime.now().strftime("%B %d, %Y")}',
                template_name='daily_summary',
                context=context,
                recipient_list=[user.email]
            )
            
        except Exception as e:
            logger.error(f"Failed to send daily summary: {str(e)}")
            return False
    
    def send_weekly_report(self, user, report_data):
        """Send weekly activity report"""
        try:
            context = {
                'user': user,
                'report_data': report_data,
                'week_start': (datetime.now() - timedelta(days=7)).strftime('%B %d, %Y'),
                'week_end': datetime.now().strftime('%B %d, %Y'),
                'site_name': 'HostTels',
                'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                'support_email': 'support@hosttels.com',
            }
            
            return self.send_email_with_pdf(
                subject=f'📈 Weekly Report - Week of {datetime.now().strftime("%B %d")}',
                template_name='weekly_report',
                context=context,
                recipient_list=[user.email]
            )
            
        except Exception as e:
            logger.error(f"Failed to send weekly report: {str(e)}")
            return False
    
    def send_transparency_notification(self, user, notification_type, data):
        """Send transparency notification for system events"""
        try:
            transparency_templates = {
                'system_maintenance': 'system_maintenance_notification',
                'security_update': 'security_update_notification',
                'policy_change': 'policy_change_notification',
                'feature_update': 'feature_update_notification',
                'data_backup': 'data_backup_notification',
                'performance_report': 'performance_report_notification',
            }
            
            template_name = transparency_templates.get(notification_type, 'general_transparency_notification')
            
            context = {
                'user': user,
                'notification_type': notification_type,
                'data': data,
                'timestamp': datetime.now(),
                'site_name': 'HostTels',
                'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                'support_email': 'support@hosttels.com',
            }
            
            return self.send_email_with_pdf(
                subject=f'🔍 Transparency Update - {notification_type.replace("_", " ").title()}',
                template_name=template_name,
                context=context,
                recipient_list=[user.email]
            )
            
        except Exception as e:
            logger.error(f"Failed to send transparency notification: {str(e)}")
            return False
    
    def send_manager_notification(self, manager, notification_type, data):
        """Send notification to managers"""
        try:
            manager_templates = {
                'new_booking': 'manager_new_booking_notification',
                'payment_received': 'manager_payment_notification',
                'occupancy_update': 'manager_occupancy_notification',
                'maintenance_request': 'manager_maintenance_notification',
                'tenant_feedback': 'manager_feedback_notification',
                'revenue_report': 'manager_revenue_notification',
            }
            
            template_name = manager_templates.get(notification_type, 'general_manager_notification')
            
            context = {
                'manager': manager,
                'notification_type': notification_type,
                'data': data,
                'timestamp': datetime.now(),
                'site_name': 'HostTels',
                'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
                'support_email': 'support@hosttels.com',
            }
            
            return self.send_email_with_pdf(
                subject=f'🏨 Manager Update - {notification_type.replace("_", " ").title()}',
                template_name=template_name,
                context=context,
                recipient_list=[manager.email]
            )
            
        except Exception as e:
            logger.error(f"Failed to send manager notification: {str(e)}")
            return False

# Global instance
enhanced_email_service = EnhancedEmailService()
