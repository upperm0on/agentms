from django.apps import AppConfig


class EntrepreneursConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'entrepreneurs'

    def ready(self):
        
        """Import signals when app is ready"""
        import entrepreneurs.signals
