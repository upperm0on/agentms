"""
Production settings for local testing with SQLite
"""
from .prod import *

# Override database to use SQLite for local testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Override ALLOWED_HOSTS for local testing
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Keep production security settings but allow local testing
DEBUG = False  # Still test with DEBUG=False
SECURE_SSL_REDIRECT = False  # Disable SSL redirect for local testing
SESSION_COOKIE_SECURE = False  # Allow HTTP for local testing
CSRF_COOKIE_SECURE = False  # Allow HTTP for local testing

