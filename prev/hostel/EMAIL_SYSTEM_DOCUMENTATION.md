# Hostel Management Email System Documentation

## Overview

The Hostel Management Email System provides comprehensive email notifications for all aspects of the hostel management platform. It includes automated emails for reservations, payments, maintenance, security, support, analytics, and administrative functions.

## Features

### 1. Reservation Management Emails
- **Reservation Confirmation**: Sent when a new reservation is created
- **Reservation Reminders**: Sent 7, 3, and 1 days before expiry
- **Reservation Expired**: Sent when a reservation expires without payment
- **Room Assignment**: Sent when a room is assigned to a tenant

### 2. Payment Management Emails
- **Payment Confirmation**: Sent after successful payment
- **Payment Overdue**: Sent 7, 14, and 30 days after due date
- **Refund Processed**: Sent when a refund is processed

### 3. Maintenance Management Emails
- **Scheduled Maintenance**: Advance notice of planned maintenance
- **Emergency Maintenance**: Immediate alerts for urgent maintenance
- **Maintenance Completed**: Notification when maintenance is finished

### 4. Security Management Emails
- **Login Alerts**: Notifications for suspicious login activity
- **Password Changed**: Confirmation when password is changed
- **Account Suspended**: Notification of account suspension

### 5. Support Management Emails
- **Ticket Created**: Confirmation when support ticket is created
- **Ticket Response**: Notification of support team response
- **Ticket Resolved**: Notification when ticket is resolved

### 6. Analytics and Reporting Emails
- **Occupancy Reports**: Monthly occupancy statistics for managers
- **Revenue Reports**: Monthly revenue analysis for managers
- **Performance Alerts**: Notifications for performance issues

### 7. Administrative Emails
- **System Alerts**: Critical system notifications for admins
- **Backup Completed**: Database backup completion notifications
- **Security Breaches**: Security incident notifications

## Architecture

### Core Components

1. **Email Templates** (`email_service/email_templates.py`)
   - Centralized email template management
   - HTML and text versions of all emails
   - Professional branding and styling

2. **Email Service** (`email_service/email_service.py`)
   - Main email sending service
   - Template rendering and email delivery
   - Error handling and logging

3. **Celery Tasks** (`email_service/tasks.py`)
   - Asynchronous email sending
   - Background processing for bulk emails
   - Retry mechanisms for failed emails

4. **Django Signals** (`email_service/signals.py`)
   - Automatic email triggers
   - Event-driven notifications
   - Integration with Django models

5. **Utility Functions** (`email_service/utils.py`)
   - High-level email functions
   - Bulk notification management
   - Easy-to-use API for developers

### Email Templates

All email templates are located in `templates/emails/` and include:

- **Base Template** (`base_email.html`): Common layout and styling
- **Reservation Templates**: Confirmation, reminders, expired
- **Payment Templates**: Confirmation, overdue, refunds
- **Maintenance Templates**: Scheduled, emergency, completed
- **Security Templates**: Login alerts, password changes
- **Support Templates**: Ticket creation, responses, resolution
- **Analytics Templates**: Reports and performance data
- **Admin Templates**: System alerts and notifications

## Usage

### Basic Email Sending

```python
from email_service.utils import notify_reservation_confirmed

# Send reservation confirmation
notify_reservation_confirmed(reservation, user)
```

### Asynchronous Email Sending

```python
from email_service.tasks import send_reservation_confirmation_email

# Send email asynchronously
send_reservation_confirmation_email.delay(reservation.id, user.id)
```

### Bulk Notifications

```python
from email_service.utils import notify_bulk_users

# Send bulk notification
user_ids = [1, 2, 3, 4, 5]
notify_bulk_users(
    user_ids,
    'System Maintenance',
    'maintenance_announcement',
    {'maintenance_time': '2:00 AM - 4:00 AM'}
)
```

### Custom Email Templates

```python
from email_service.email_service import email_service

# Send custom email
email_service.send_email(
    subject='Custom Notification',
    template_name='custom_template',
    context={'custom_data': 'value'},
    recipient_list=['user@example.com']
)
```

## Configuration

### Django Settings

The email system uses Django's built-in email configuration:

```python
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.hostinger.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@domain.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'your-email@domain.com'
```

### Celery Configuration

For asynchronous email processing:

```python
# Celery settings
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
```

### Cron Jobs

Set up automated email sending:

```bash
# Run the setup script
./setup_email_cron.sh

# Or manually add cron jobs
0 9 * * * cd /path/to/project && python manage.py send_scheduled_emails
```

## Testing

### Test the Email System

```bash
# Run the comprehensive test
python test_email_system.py

# Test specific components
python manage.py send_scheduled_emails --dry-run
```

### Manual Testing

```python
# Test individual email functions
from email_service.utils import notify_reservation_confirmed
from django.contrib.auth.models import User
from reservations.models import Reservation

user = User.objects.get(email='test@example.com')
reservation = Reservation.objects.get(id=1)
notify_reservation_confirmed(reservation, user)
```

## Monitoring and Logging

### Email Logs

All email activities are logged with the following information:
- Email type and recipient
- Success/failure status
- Error messages for failed emails
- Timestamp and processing time

### Monitoring

Monitor email system health:
- Check Celery worker status
- Monitor email queue length
- Review failed email logs
- Track email delivery rates

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check firewall settings

2. **Template errors**
   - Verify template syntax
   - Check context variables
   - Test template rendering

3. **Celery issues**
   - Check Celery worker status
   - Verify Redis connection
   - Monitor task queue

### Debug Mode

Enable debug logging:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'email_debug.log',
        },
    },
    'loggers': {
        'email_service': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

## Best Practices

### Email Design
- Use responsive HTML templates
- Include both HTML and text versions
- Maintain consistent branding
- Keep emails concise and actionable

### Performance
- Use asynchronous processing for bulk emails
- Implement email queuing for high volume
- Monitor email delivery rates
- Use email templates for consistency

### Security
- Validate all email inputs
- Use secure SMTP connections
- Implement rate limiting
- Monitor for spam complaints

### Maintenance
- Regular testing of email templates
- Monitor email delivery statistics
- Update email content regularly
- Backup email configurations

## API Reference

### Email Service Functions

```python
# Reservation emails
notify_reservation_confirmed(reservation, user)
notify_reservation_reminder(reservation, user, days)
notify_reservation_expired(reservation, user)

# Payment emails
notify_payment_confirmed(payment, user)
notify_payment_overdue(user, amount, days_overdue)
notify_refund_processed(user, amount, reference)

# Maintenance emails
notify_maintenance_scheduled(users, details, is_emergency)
notify_maintenance_completed(users, details)

# Security emails
notify_security_alert(user, type, details)
notify_password_changed(user)
notify_account_suspended(user, reason)

# Support emails
notify_support_ticket(user, ticket, type)
notify_ticket_response(user, ticket, response)
notify_ticket_resolved(user, ticket)

# Analytics emails
notify_analytics_report(manager, type, data)
notify_occupancy_report(manager, data)
notify_revenue_report(manager, data)

# Admin emails
notify_admin_alert(admin, type, details)
notify_system_alert(admin, details)
notify_backup_completed(admin, details)

# Bulk notifications
notify_bulk_users(user_ids, subject, template, context)
```

## Support

For issues with the email system:

1. Check the logs for error messages
2. Verify email configuration settings
3. Test with the provided test script
4. Contact the development team for assistance

## Changelog

### Version 1.0.0
- Initial implementation of comprehensive email system
- Support for all major notification types
- Asynchronous email processing with Celery
- Professional email templates
- Automated scheduling with cron jobs
- Comprehensive testing framework
