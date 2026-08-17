"""
Email Automation System for Constant Notifications
Automatically sends emails for all user actions and system events
"""

from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
import logging
from .enhanced_email_service import enhanced_email_service
from .tasks import *

logger = logging.getLogger(__name__)

class EmailAutomationService:
    """Service for automating email notifications"""
    
    def __init__(self):
        self.enhanced_service = enhanced_email_service
    
    def trigger_user_action_notification(self, user, action_type, details):
        """Trigger notification for user actions"""
        try:
            # Send immediate notification
            send_constant_notification_email.delay(
                user.id, action_type, details
            )
            
            # Log the action
            logger.info(f"User action notification triggered for {user.email}: {action_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to trigger user action notification: {str(e)}")
            return False
    
    def trigger_login_notification(self, user, login_details):
        """Trigger login notification"""
        details = {
            'ip_address': login_details.get('ip_address', 'Unknown'),
            'location': login_details.get('location', 'Unknown'),
            'device': login_details.get('device', 'Unknown'),
            'browser': login_details.get('browser', 'Unknown'),
        }
        return self.trigger_user_action_notification(user, 'login', details)
    
    def trigger_profile_update_notification(self, user, update_details):
        """Trigger profile update notification"""
        details = {
            'fields_updated': update_details.get('fields_updated', []),
            'update_time': datetime.now().isoformat(),
        }
        return self.trigger_user_action_notification(user, 'profile_update', details)
    
    def trigger_booking_action_notification(self, user, booking, action_type):
        """Trigger booking action notification"""
        details = {
            'hostel_name': booking.hostel.name,
            'booking_id': booking.id,
            'amount': str(booking.amount),
            'action_time': datetime.now().isoformat(),
        }
        return self.trigger_user_action_notification(user, f'booking_{action_type}', details)
    
    def trigger_search_notification(self, user, search_details):
        """Trigger search notification"""
        details = {
            'search_query': search_details.get('query', ''),
            'results_count': search_details.get('results_count', 0),
            'filters_applied': search_details.get('filters', {}),
            'search_time': datetime.now().isoformat(),
        }
        return self.trigger_user_action_notification(user, 'search_performed', details)
    
    def trigger_page_visit_notification(self, user, page_details):
        """Trigger page visit notification"""
        details = {
            'page_url': page_details.get('url', ''),
            'page_title': page_details.get('title', ''),
            'visit_duration': page_details.get('duration', 0),
            'visit_time': datetime.now().isoformat(),
        }
        return self.trigger_user_action_notification(user, 'page_visit', details)
    
    def schedule_daily_summaries(self):
        """Schedule daily summary emails for all active users"""
        try:
            # Get all active users
            active_users = User.objects.filter(is_active=True)
            
            for user in active_users:
                # Schedule daily summary
                send_daily_summary_email.delay(user.id)
            
            logger.info(f"Scheduled daily summaries for {active_users.count()} users")
            return True
            
        except Exception as e:
            logger.error(f"Failed to schedule daily summaries: {str(e)}")
            return False
    
    def schedule_weekly_reports(self):
        """Schedule weekly reports for all active users"""
        try:
            # Get all active users
            active_users = User.objects.filter(is_active=True)
            
            for user in active_users:
                # Schedule weekly report
                send_weekly_report_email.delay(user.id)
            
            logger.info(f"Scheduled weekly reports for {active_users.count()} users")
            return True
            
        except Exception as e:
            logger.error(f"Failed to schedule weekly reports: {str(e)}")
            return False
    
    def trigger_transparency_notification(self, notification_type, data, user_list=None):
        """Trigger transparency notification to users"""
        try:
            if user_list is None:
                # Send to all active users
                user_list = User.objects.filter(is_active=True)
            
            for user in user_list:
                send_transparency_notification_email.delay(
                    user.id, notification_type, data
                )
            
            logger.info(f"Transparency notification sent to {len(user_list)} users")
            return True
            
        except Exception as e:
            logger.error(f"Failed to trigger transparency notification: {str(e)}")
            return False
    
    def trigger_system_maintenance_notification(self, maintenance_details):
        """Trigger system maintenance notification"""
        data = {
            'maintenance_type': maintenance_details.get('type', 'Scheduled'),
            'start_time': maintenance_details.get('start_time'),
            'end_time': maintenance_details.get('end_time'),
            'affected_services': maintenance_details.get('services', []),
            'description': maintenance_details.get('description', ''),
        }
        return self.trigger_transparency_notification('system_maintenance', data)
    
    def trigger_security_update_notification(self, security_details):
        """Trigger security update notification"""
        data = {
            'update_type': security_details.get('type', 'Security Update'),
            'severity': security_details.get('severity', 'Medium'),
            'description': security_details.get('description', ''),
            'action_required': security_details.get('action_required', False),
        }
        return self.trigger_transparency_notification('security_update', data)
    
    def trigger_policy_change_notification(self, policy_details):
        """Trigger policy change notification"""
        data = {
            'policy_type': policy_details.get('type', 'Policy Update'),
            'effective_date': policy_details.get('effective_date'),
            'changes': policy_details.get('changes', []),
            'summary': policy_details.get('summary', ''),
        }
        return self.trigger_transparency_notification('policy_change', data)
    
    def trigger_feature_update_notification(self, feature_details):
        """Trigger feature update notification"""
        data = {
            'feature_name': feature_details.get('name', 'New Feature'),
            'description': feature_details.get('description', ''),
            'benefits': feature_details.get('benefits', []),
            'how_to_use': feature_details.get('how_to_use', ''),
        }
        return self.trigger_transparency_notification('feature_update', data)
    
    def trigger_manager_notification(self, manager, notification_type, data):
        """Trigger manager-specific notification"""
        try:
            send_manager_notification_email.delay(
                manager.id, notification_type, data
            )
            
            logger.info(f"Manager notification sent to {manager.email}: {notification_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to trigger manager notification: {str(e)}")
            return False
    
    def trigger_new_booking_manager_notification(self, manager, booking):
        """Trigger new booking notification for manager"""
        data = {
            'booking_id': booking.id,
            'customer_name': booking.user.get_full_name() or booking.user.username,
            'customer_email': booking.user.email,
            'hostel_name': booking.hostel.name,
            'amount': str(booking.amount),
            'check_in_date': booking.reservee_date.isoformat(),
            'booking_time': booking.created_at.isoformat(),
        }
        return self.trigger_manager_notification(manager, 'new_booking', data)
    
    def trigger_payment_received_manager_notification(self, manager, payment):
        """Trigger payment received notification for manager"""
        data = {
            'payment_id': payment.id,
            'amount': str(payment.amount),
            'customer_name': payment.user.get_full_name() or payment.user.username,
            'payment_method': getattr(payment, 'method', 'Online Payment'),
            'payment_time': payment.created_at.isoformat(),
            'transaction_id': payment.reference,
        }
        return self.trigger_manager_notification(manager, 'payment_received', data)
    
    def trigger_occupancy_update_manager_notification(self, manager, occupancy_data):
        """Trigger occupancy update notification for manager"""
        data = {
            'current_occupancy': occupancy_data.get('current', 0),
            'total_capacity': occupancy_data.get('total', 0),
            'occupancy_rate': occupancy_data.get('rate', 0),
            'available_rooms': occupancy_data.get('available', 0),
            'update_time': datetime.now().isoformat(),
        }
        return self.trigger_manager_notification(manager, 'occupancy_update', data)
    
    def trigger_maintenance_request_manager_notification(self, manager, maintenance_request):
        """Trigger maintenance request notification for manager"""
        data = {
            'request_id': maintenance_request.id,
            'request_type': maintenance_request.type,
            'priority': maintenance_request.priority,
            'description': maintenance_request.description,
            'requested_by': maintenance_request.requested_by.get_full_name() or maintenance_request.requested_by.username,
            'request_time': maintenance_request.created_at.isoformat(),
        }
        return self.trigger_manager_notification(manager, 'maintenance_request', data)
    
    def trigger_tenant_feedback_manager_notification(self, manager, feedback):
        """Trigger tenant feedback notification for manager"""
        data = {
            'feedback_id': feedback.id,
            'rating': feedback.rating,
            'comment': feedback.comment,
            'tenant_name': feedback.user.get_full_name() or feedback.user.username,
            'feedback_time': feedback.created_at.isoformat(),
            'hostel_name': feedback.hostel.name,
        }
        return self.trigger_manager_notification(manager, 'tenant_feedback', data)
    
    def trigger_revenue_report_manager_notification(self, manager, revenue_data):
        """Trigger revenue report notification for manager"""
        data = {
            'period': revenue_data.get('period', 'Monthly'),
            'total_revenue': revenue_data.get('total', 0),
            'booking_count': revenue_data.get('bookings', 0),
            'average_booking_value': revenue_data.get('average', 0),
            'growth_rate': revenue_data.get('growth', 0),
            'report_date': datetime.now().isoformat(),
        }
        return self.trigger_manager_notification(manager, 'revenue_report', data)

# Global instance
email_automation_service = EmailAutomationService()
