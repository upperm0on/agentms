from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class HqConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hq'
    
    def ready(self):
        """
        Called when the app is ready. Schedule the cleanup task.
        """
        try:
            # Temporarily comment out to test management command first
            # from .tasks import schedule_cleanup_task
            # schedule_cleanup_task()
            pass
        except Exception as e:
            logger.error(f'Error scheduling cleanup task: {str(e)}')
