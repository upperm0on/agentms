from .base import *
from decouple import config 

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    '*',
    '192.168.0.183',
    '172.20.10.3',
    '172.20.10.10',
    '.ngrok-free.app',
    'localhost',
    '127.0.0.1',
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# CSRF Configuration for development
CSRF_TRUSTED_ORIGINS = [
    "https://*.ngrok-free.app",
    'http://*',
    'https://*',
]

# Development-specific settings
CORS_ALLOW_ALL_ORIGINS = True

# Logging for development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

