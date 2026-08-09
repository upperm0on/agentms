"""
Django app configuration for email service
"""

from django.apps import AppConfig

class EmailServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'email_service'
    verbose_name = 'Email Service'
    
    def ready(self):
        """Import signals when the app is ready"""
        import email_service.signals
