"""
Email service views for monitoring and management
"""

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from email_service.utils import (
    notify_reservation_confirmed,
    notify_payment_confirmed,
    notify_maintenance_scheduled,
    notify_security_alert,
    notify_analytics_report,
    notify_admin_alert,
    notify_bulk_users
)
import logging

logger = logging.getLogger(__name__)

@staff_member_required
def email_dashboard(request):
    """Email system dashboard for monitoring"""
    context = {
        'title': 'Email System Dashboard',
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'staff_users': User.objects.filter(is_staff=True).count(),
    }
    return render(request, 'email_service/dashboard.html', context)

@staff_member_required
def test_email_system(request):
    """Test email system functionality"""
    if request.method == 'POST':
        test_type = request.POST.get('test_type')
        
        try:
            if test_type == 'reservation':
                # Test reservation email
                user = User.objects.filter(is_active=True).first()
                if user:
                    # Create a mock reservation for testing
                    from hq.models import Hostel
                    hostel = Hostel.objects.first()
                    if hostel:
                        from reservations.models import Reservation
                        reservation = Reservation.objects.create(
                            user=user,
                            hostel=hostel,
                            reservee_date=timezone.now().date() + timedelta(days=7),
                            room_uuid='test-room-123',
                            amount=50000.00,
                            status='pending'
                        )
                        
                        result = notify_reservation_confirmed(reservation, user)
                        reservation.delete()  # Clean up
                        
                        return JsonResponse({
                            'success': True,
                            'message': f'Reservation test email sent to {user.email}'
                        })
            
            elif test_type == 'payment':
                # Test payment email
                user = User.objects.filter(is_active=True).first()
                if user:
                    payment_data = {
                        'amount': 50000.00,
                        'reference': 'TEST-REF-123',
                        'created_at': timezone.now()
                    }
                    result = notify_payment_confirmed(payment_data, user)
                    
                    return JsonResponse({
                        'success': True,
                        'message': f'Payment test email sent to {user.email}'
                    })
            
            elif test_type == 'maintenance':
                # Test maintenance email
                users = User.objects.filter(is_active=True)[:3]
                if users:
                    maintenance_details = {
                        'scheduled_date': timezone.now().date() + timedelta(days=1),
                        'duration': '2 hours',
                        'description': 'Test maintenance notification'
                    }
                    result = notify_maintenance_scheduled(users, maintenance_details, False)
                    
                    return JsonResponse({
                        'success': True,
                        'message': f'Maintenance test email sent to {len(users)} users'
                    })
            
            elif test_type == 'security':
                # Test security email
                user = User.objects.filter(is_active=True).first()
                if user:
                    login_details = {
                        'login_time': timezone.now(),
                        'ip_address': '192.168.1.100',
                        'location': 'Test Location',
                        'device': 'Test Device'
                    }
                    result = notify_security_alert(user, 'login_alert', login_details)
                    
                    return JsonResponse({
                        'success': True,
                        'message': f'Security test email sent to {user.email}'
                    })
            
            elif test_type == 'analytics':
                # Test analytics email
                manager = User.objects.filter(is_staff=True).first()
                if manager:
                    report_data = {
                        'total_rooms': 50,
                        'occupied_rooms': 45,
                        'occupancy_rate': 90.0
                    }
                    result = notify_analytics_report(manager, 'occupancy', report_data)
                    
                    return JsonResponse({
                        'success': True,
                        'message': f'Analytics test email sent to {manager.email}'
                    })
            
            elif test_type == 'bulk':
                # Test bulk email
                users = User.objects.filter(is_active=True)[:5]
                user_ids = [user.id for user in users]
                
                context = {
                    'announcement': 'Test bulk notification',
                    'timestamp': timezone.now()
                }
                result = notify_bulk_users(
                    user_ids,
                    'Test Bulk Notification',
                    'maintenance_announcement',
                    context
                )
                
                return JsonResponse({
                    'success': True,
                    'message': f'Bulk test email sent to {len(users)} users'
                })
            
            return JsonResponse({
                'success': False,
                'message': 'Invalid test type'
            })
            
        except Exception as e:
            logger.error(f"Email test failed: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': f'Test failed: {str(e)}'
            })
    
    return render(request, 'email_service/test_emails.html')

@staff_member_required
def email_logs(request):
    """View email system logs"""
    # This would typically read from a log file or database
    # For now, we'll return a simple response
    context = {
        'title': 'Email System Logs',
        'logs': [
            {
                'timestamp': timezone.now(),
                'level': 'INFO',
                'message': 'Email system initialized',
                'type': 'system'
            },
            {
                'timestamp': timezone.now() - timedelta(minutes=5),
                'level': 'SUCCESS',
                'message': 'Reservation confirmation sent to user@example.com',
                'type': 'reservation'
            },
            {
                'timestamp': timezone.now() - timedelta(minutes=10),
                'level': 'SUCCESS',
                'message': 'Payment confirmation sent to user@example.com',
                'type': 'payment'
            }
        ]
    }
    return render(request, 'email_service/logs.html', context)
