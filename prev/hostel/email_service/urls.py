"""
URL patterns for email service
"""

from django.urls import path
from . import views

app_name = 'email_service'

urlpatterns = [
    path('dashboard/', views.email_dashboard, name='email_dashboard'),
    path('test/', views.test_email_system, name='test_email_system'),
    path('logs/', views.email_logs, name='email_logs'),
]
