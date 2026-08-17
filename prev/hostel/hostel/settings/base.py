import os
from pathlib import Path

try:
    from decouple import config
except ImportError:
    # Fallback for when decouple is not available
    def config(key, default=None, cast=None):
        import os
        value = os.getenv(key, default)
        if cast and value is not None:
            return cast(value)
        return value

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-9sl0ysrh+0%bcvst9q74c@6v=69vjoq#vdrkz1lnwzc7o#u=a1')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # custom apps
    'hq',
    'managers',
    'consumers',
    'user_auth',
    'category',
    'ratings',
    'payments',
    'reviews',
    'location',
    'payment_account',
    'reservations',
    'entrepreneurs',
    'email_service',

    'django.contrib.sites',
    # 'allauth',
    # 'allauth.account',
    # 'allauth.socialaccount',
    # 'allauth.socialaccount.providers.google',

     # "django_q",  # Temporarily commented for testing
     'rest_framework',
     'corsheaders',
     'rest_framework.authtoken',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'hostel.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hostel.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static')
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Paystack Configuration
PAYSTACK_PUBLIC_KEY = config('PAYSTACK_PUBLIC_KEY', default='pk_test_edb5f4f28031c270ab3c34258aa859b3f7e70495')
PAYSTACK_SECRET_KEY = config('PAYSTACK_SECRET_KEY', default='sk_test_dd824ddf3dcfdca8ba6293dfed882079ae1cc2bb')

# Django Allauth Configuration
AUTHENTICATION_BACKENDS = (
    'user_auth.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
    # 'allauth.account.auth_backends.AuthenticationBackend',
)

SITE_ID = 1
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_LOGIN_METHOD = "email"

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
    }
}

# Google OAuth Configuration
SOCIAL_AUTH_GOOGLE_CLIENT_ID = config('SOCIAL_AUTH_GOOGLE_CLIENT_ID', default='826839521219-9u0v1qimobnrfnt7plch3nlr8phsnsia.apps.googleusercontent.com')
SOCIAL_AUTH_GOOGLE_SECRET = config('SOCIAL_AUTH_GOOGLE_SECRET', default='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')

LOGIN_REDIRECT_URL = '/dashboard/'

# Celery Configuration
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_WORKER_MAX_TASKS_PER_CHILD = 1000

# Django Q Configuration (optional - can be used alongside Celery)
# Q_CLUSTER = {
#     'name': 'hosttels-cluster',
#     'workers': 4,
#     'recycle': 500,
#     'timeout': 60,
#     'retry': 120,
#     'queue_limit': 50,
#     'bulk': 10,
#     'orm': 'default',
# }

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5175",
    "http://localhost:3000",
]

# Django REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.hostinger.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='developers@kwabenaboakyeroyalventures.com')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='Khemikalx@08')
DEFAULT_FROM_EMAIL = config('EMAIL_HOST_USER', default='developers@kwabenaboakyeroyalventures.com')

# Frontend URL for email verification links
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')

# Additional Email Settings
EMAIL_TIMEOUT = 30  # Email timeout in seconds
EMAIL_USE_SSL = False  # Use SSL instead of TLS (set to True if needed)
EMAIL_USE_TLS = True  # Ensure TLS is enabled
SERVER_EMAIL = DEFAULT_FROM_EMAIL  # Email address for error messages
ADMINS = [
    ('Admin', 'developers@kwabenaboakyeroyalventures.com'),
]

# Testing Email Configuration
# Set to True during testing to send emails synchronously and use console backend
TESTING_EMAILS = config('TESTING_EMAILS', default=False, cast=bool)

# Use console email backend during testing for immediate visibility
if TESTING_EMAILS:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    # This will print emails to console instead of sending via SMTP

# Admin URL Configuration
ADMIN_URL = config('ADMIN_URL', default='super-secret-admin/')
