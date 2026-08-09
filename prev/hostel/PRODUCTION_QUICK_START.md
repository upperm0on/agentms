# Production Quick Start Guide

## Quick Commands

### Start All Services
```bash
sudo systemctl start hostel.service celery-worker.service celery-beat.service
```

### Stop All Services
```bash
sudo systemctl stop hostel.service celery-worker.service celery-beat.service
```

### Restart All Services
```bash
sudo systemctl restart hostel.service celery-worker.service celery-beat.service
```

### Enable Services to Start on Boot
```bash
sudo systemctl enable hostel.service celery-worker.service celery-beat.service
```

### Check Service Status
```bash
sudo systemctl status hostel.service
sudo systemctl status celery-worker.service
sudo systemctl status celery-beat.service
```

### View Logs
```bash
# Django application
sudo journalctl -u hostel.service -f

# Celery worker
tail -f /home/ubuntu/hostel/logs/celery_worker.log
sudo journalctl -u celery-worker.service -f

# Celery beat
tail -f /home/ubuntu/hostel/logs/celery_beat.log
sudo journalctl -u celery-beat.service -f

# Django errors
tail -f /home/ubuntu/hostel/logs/django_errors.log

# Gunicorn
tail -f /home/ubuntu/hostel/logs/gunicorn_access.log
tail -f /home/ubuntu/hostel/logs/gunicorn_error.log
```

### Test Celery Connection
```bash
cd /home/ubuntu/hostel
source venv/bin/activate
celery -A hostel inspect active
celery -A hostel inspect stats
```

### Test Email Service
```bash
cd /home/ubuntu/hostel
source venv/bin/activate
python manage.py shell
```

In Python shell:
```python
from email_service.tasks import send_constant_notification_email
from django.contrib.auth.models import User

user = User.objects.first()
send_constant_notification_email.delay(user.id, 'test', {'message': 'Test email'})
```

## Service Files Location

- Django Application: `/etc/systemd/system/hostel.service`
- Celery Worker: `/etc/systemd/system/celery-worker.service`
- Celery Beat: `/etc/systemd/system/celery-beat.service`

## Important Paths

- Project Directory: `/home/ubuntu/hostel` (or your deployment path)
- Virtual Environment: `/home/ubuntu/hostel/venv`
- Logs Directory: `/home/ubuntu/hostel/logs`
- Environment File: `/home/ubuntu/hostel/.env`

## Troubleshooting

### Service Won't Start
1. Check logs: `sudo journalctl -u <service-name> -n 50`
2. Verify paths in service file match your deployment
3. Check permissions: `ls -la /home/ubuntu/hostel`
4. Verify environment variables in `.env`

### Celery Not Processing Tasks
1. Check Redis: `redis-cli ping`
2. Check Celery worker logs
3. Verify `CELERY_BROKER_URL` in `.env`
4. Restart Celery worker: `sudo systemctl restart celery-worker.service`

### Email Not Sending
1. Check email configuration in `.env`
2. Verify Celery worker is running
3. Check email logs in Celery worker log file
4. Test email connection manually

## Environment Variables Required

Make sure your `.env` file contains:

```env
# Django
SECRET_KEY=your-secret-key
DJANGO_SETTINGS_MODULE=hostel.settings.prod

# Database
DB_NAME=hostel_db
DB_USER=hosteluser
DB_PASS=your-password
DB_HOST=localhost
DB_PORT=5432

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-password
FRONTEND_URL=https://hosttelz.com
```

## First Time Setup

1. Run the setup script:
   ```bash
   ./setup_production.sh
   ```

2. Enable and start services:
   ```bash
   sudo systemctl enable hostel.service celery-worker.service celery-beat.service
   sudo systemctl start hostel.service celery-worker.service celery-beat.service
   ```

3. Verify all services are running:
   ```bash
   sudo systemctl status hostel.service celery-worker.service celery-beat.service
   ```

For detailed instructions, see `PRODUCTION_DEPLOYMENT.md`.

