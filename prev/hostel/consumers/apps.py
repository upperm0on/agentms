from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError


class ConsumersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'consumers'

    def ready(self):
        """
        Automatically creates a scheduled task to delete expired consumers daily.
        This runs when the Django app is ready.
        """
        try:
            # Import the Schedule model, not the schedule function
            from django_q.models import Schedule

            # Check if the scheduled task already exists
            if not Schedule.objects.filter(func='hq.tasks.delete_expired_consumers').exists():
                Schedule.objects.create(
                    func='hq.tasks.delete_expired_consumers',
                    schedule_type=Schedule.DAILY,
                    name='Auto-delete expired consumers',
                    repeats=-1  # Infinite repeats
                )
        except (OperationalError, ImportError, ProgrammingError):
            # Likely because migrations haven't been applied yet or django_q not installed
            pass
