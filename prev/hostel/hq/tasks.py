from django_q.tasks import schedule
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

def cleanup_unverified_accounts():
    """
    Django Q task to clean up unverified user accounts.
    This task runs daily at midnight to delete accounts that haven't been verified
    within 24 hours of creation.
    """
    try:
        logger.info('Starting scheduled cleanup of unverified accounts...')
        
        # Run the cleanup command
        call_command('cleanup_unverified_accounts')
        
        logger.info('Scheduled cleanup of unverified accounts completed successfully')
        
    except Exception as e:
        logger.error(f'Error in scheduled cleanup of unverified accounts: {str(e)}')
        raise

def schedule_cleanup_task():
    """
    Schedule the cleanup task to run daily at midnight.
    This should be called once during application startup.
    """
    try:
        # Check if task is already scheduled
        existing_tasks = schedule('cleanup_unverified_accounts')
        
        if not existing_tasks:
            # Schedule the task to run daily at midnight
            schedule(
                'hq.tasks.cleanup_unverified_accounts',
                name='Daily Cleanup of Unverified Accounts',
                schedule_type='D',  # Daily
                repeats=-1,  # Repeat indefinitely
                next_run='00:00',  # Run at midnight
            )
            logger.info('Scheduled daily cleanup task for unverified accounts at midnight')
        else:
            logger.info('Cleanup task already scheduled')
            
    except Exception as e:
        logger.error(f'Error scheduling cleanup task: {str(e)}')
        raise