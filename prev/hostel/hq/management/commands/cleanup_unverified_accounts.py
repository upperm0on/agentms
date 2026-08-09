from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from user_auth.models import UserVerification
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Delete unverified user accounts that are older than 24 hours'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Delete accounts older than this many hours (default: 24)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        hours_threshold = options['hours']
        
        # Calculate the cutoff time
        cutoff_time = timezone.now() - timedelta(hours=hours_threshold)
        
        self.stdout.write(
            self.style.SUCCESS(f'🧹 Starting cleanup of unverified accounts older than {hours_threshold} hours...')
        )
        self.stdout.write(f'📅 Cutoff time: {cutoff_time}')
        
        # Find unverified users created before the cutoff time
        unverified_users = User.objects.filter(
            verification__account_verified=False,
            date_joined__lt=cutoff_time
        ).select_related('verification')
        
        total_count = unverified_users.count()
        
        if total_count == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ No unverified accounts found to delete.')
            )
            return
        
        self.stdout.write(f'📊 Found {total_count} unverified accounts to delete:')
        
        deleted_count = 0
        for user in unverified_users:
            self.stdout.write(f'   👤 {user.email} (created: {user.date_joined})')
            
            if not dry_run:
                try:
                    # Delete the user (this will cascade to related objects)
                    user.delete()
                    deleted_count += 1
                    logger.info(f'Deleted unverified user: {user.email}')
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'❌ Error deleting {user.email}: {str(e)}')
                    )
                    logger.error(f'Error deleting user {user.email}: {str(e)}')
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'🔍 DRY RUN: Would delete {total_count} accounts')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Successfully deleted {deleted_count} unverified accounts')
            )
            
        # Log the cleanup operation
        logger.info(f'Cleanup completed: {deleted_count} accounts deleted (dry_run={dry_run})')
