"""
Management command to send scheduled email notifications
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from hq.models import Hostel
from reservations.models import Reservation
from email_service.email_service import email_service
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send scheduled email notifications'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what emails would be sent without actually sending them',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No emails will be sent'))
        
        self.send_reservation_reminders(dry_run)
        self.send_payment_overdue_notifications(dry_run)
        self.send_occupancy_reports(dry_run)
        self.send_maintenance_notifications(dry_run)
        
        self.stdout.write(self.style.SUCCESS('Scheduled email processing completed'))

    def send_reservation_reminders(self, dry_run=False):
        """Send reservation reminder emails"""
        today = timezone.now().date()
        
        # Get reservations expiring in 7, 3, and 1 days
        for days in [7, 3, 1]:
            expiry_date = today + timedelta(days=days)
            reservations = Reservation.objects.filter(
                expiry_date=expiry_date,
                status='pending'
            )
            
            for reservation in reservations:
                if dry_run:
                    self.stdout.write(f'Would send reminder to {reservation.user.email} for reservation {reservation.id} (expires in {days} days)')
                else:
                    try:
                        email_service.send_reservation_reminder(reservation, reservation.user, days)
                        self.stdout.write(f'Sent reminder to {reservation.user.email} for reservation {reservation.id}')
                    except Exception as e:
                        logger.error(f'Failed to send reminder to {reservation.user.email}: {str(e)}')

    def send_payment_overdue_notifications(self, dry_run=False):
        """Send payment overdue notifications"""
        today = timezone.now().date()
        
        # Get reservations that expired 7, 14, and 30 days ago
        for days_overdue in [7, 14, 30]:
            expiry_date = today - timedelta(days=days_overdue)
            reservations = Reservation.objects.filter(
                expiry_date=expiry_date,
                status='pending',
                is_paid=False
            )
            
            for reservation in reservations:
                if dry_run:
                    self.stdout.write(f'Would send overdue notification to {reservation.user.email} for reservation {reservation.id} ({days_overdue} days overdue)')
                else:
                    try:
                        email_service.send_payment_overdue(reservation.user, reservation.amount, days_overdue)
                        self.stdout.write(f'Sent overdue notification to {reservation.user.email} for reservation {reservation.id}')
                    except Exception as e:
                        logger.error(f'Failed to send overdue notification to {reservation.user.email}: {str(e)}')

    def send_occupancy_reports(self, dry_run=False):
        """Send monthly occupancy reports to managers"""
        today = timezone.now().date()
        
        # Send reports on the 1st of each month
        if today.day == 1:
            managers = User.objects.filter(is_staff=True, is_active=True)
            
            for manager in managers:
                # Calculate occupancy data
                hostels = Hostel.objects.filter(manager=manager)
                total_rooms = sum(hostel.total_rooms for hostel in hostels)
                occupied_rooms = sum(hostel.occupied_rooms for hostel in hostels)
                occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
                
                report_data = {
                    'total_rooms': total_rooms,
                    'occupied_rooms': occupied_rooms,
                    'occupancy_rate': round(occupancy_rate, 2),
                }
                
                if dry_run:
                    self.stdout.write(f'Would send occupancy report to {manager.email} (Rate: {occupancy_rate}%)')
                else:
                    try:
                        email_service.send_occupancy_report(manager, report_data)
                        self.stdout.write(f'Sent occupancy report to {manager.email}')
                    except Exception as e:
                        logger.error(f'Failed to send occupancy report to {manager.email}: {str(e)}')

    def send_maintenance_notifications(self, dry_run=False):
        """Send maintenance notifications"""
        today = timezone.now().date()
        
        # This would integrate with a maintenance scheduling system
        # For now, we'll create a placeholder for scheduled maintenance
        
        # Example: Send maintenance reminders 24 hours before scheduled maintenance
        scheduled_maintenance = []  # This would come from a maintenance model
        
        for maintenance in scheduled_maintenance:
            if dry_run:
                self.stdout.write(f'Would send maintenance notification for {maintenance.get("description")}')
            else:
                try:
                    # Get affected users
                    affected_users = []  # This would be determined by the maintenance scope
                    for user in affected_users:
                        email_service.send_maintenance_scheduled(user, maintenance)
                        self.stdout.write(f'Sent maintenance notification to {user.email}')
                except Exception as e:
                    logger.error(f'Failed to send maintenance notification: {str(e)}')
