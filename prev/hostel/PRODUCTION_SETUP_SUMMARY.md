# Production Setup Summary

## What Has Been Configured

### 1. Celery Configuration ✅
- **Celery app created**: `hostel/celery.py`
- **Celery initialized**: `hostel/__init__.py` imports Celery app
- **Settings configured**: 
  - `hostel/settings/base.py` - Base Celery configuration
  - `hostel/settings/prod.py` - Production-specific Celery settings
- **Broker**: Redis (default: `redis://localhost:6379/0`)
- **Result Backend**: Redis (default: `redis://localhost:6379/0`)

### 2. Email Service ✅
- **Email service app**: Added to `INSTALLED_APPS` in `base.py`
- **Celery tasks**: All email tasks configured in `email_service/tasks.py`
- **Async email sending**: Configured to use Celery for production

### 3. Systemd Services ✅
- **Django Application**: `hostel.service`
  - Runs Gunicorn with production settings
  - Auto-restarts on failure
  - Logs to systemd and file
  
- **Celery Worker**: `celery-worker.service`
  - Processes async tasks (emails, etc.)
  - Auto-restarts on failure
  - Logs to `/home/ubuntu/hostel/logs/celery_worker.log`
  
- **Celery Beat**: `celery-beat.service`
  - Handles scheduled tasks
  - Auto-restarts on failure
  - Logs to `/home/ubuntu/hostel/logs/celery_beat.log`

### 4. Production Settings ✅
- **Security**: All security headers enabled
- **Database**: PostgreSQL configuration
- **Static Files**: Configured for production
- **Logging**: Comprehensive logging setup
- **CORS**: Production origins configured
- **AWS S3**: Media and static files storage

### 5. Documentation ✅
- **Production Deployment Guide**: `PRODUCTION_DEPLOYMENT.md`
  - Complete step-by-step deployment instructions
  - Database setup
  - Service configuration
  - Nginx configuration
  - SSL setup
  - Troubleshooting guide

- **Quick Start Guide**: `PRODUCTION_QUICK_START.md`
  - Quick reference commands
  - Common tasks
  - Troubleshooting tips

- **Setup Script**: `setup_production.sh`
  - Automated setup script
  - Checks prerequisites
  - Configures services

## Services That Need to Be Running

### Required Services:
1. **PostgreSQL** - Database
   ```bash
   sudo systemctl status postgresql
   ```

2. **Redis** - Celery broker and result backend
   ```bash
   sudo systemctl status redis-server
   ```

3. **Django Application** (Gunicorn) - API server
   ```bash
   sudo systemctl status hostel.service
   ```

4. **Celery Worker** - Processes async tasks (emails)
   ```bash
   sudo systemctl status celery-worker.service
   ```

5. **Celery Beat** - Scheduled tasks (optional but recommended)
   ```bash
   sudo systemctl status celery-beat.service
   ```

6. **Nginx** - Web server and reverse proxy
   ```bash
   sudo systemctl status nginx
   ```

## Quick Start Commands

### Start All Services
```bash
sudo systemctl start hostel.service celery-worker.service celery-beat.service
```

### Enable Services (Start on Boot)
```bash
sudo systemctl enable hostel.service celery-worker.service celery-beat.service
```

### Check Status
```bash
sudo systemctl status hostel.service celery-worker.service celery-beat.service
```

### View Logs
```bash
# Application logs
sudo journalctl -u hostel.service -f

# Celery worker logs
tail -f /home/ubuntu/hostel/logs/celery_worker.log

# Celery beat logs
tail -f /home/ubuntu/hostel/logs/celery_beat.log
```

## Environment Variables

Make sure your `.env` file contains all required variables. See `PRODUCTION_DEPLOYMENT.md` for the complete list.

Key variables:
- `DJANGO_SETTINGS_MODULE=hostel.settings.prod`
- `CELERY_BROKER_URL=redis://localhost:6379/0`
- `CELERY_RESULT_BACKEND=redis://localhost:6379/0`
- Database credentials
- Email configuration
- AWS credentials (if using S3)

## Next Steps

1. **Run the setup script**:
   ```bash
   ./setup_production.sh
   ```

2. **Enable and start services**:
   ```bash
   sudo systemctl enable hostel.service celery-worker.service celery-beat.service
   sudo systemctl start hostel.service celery-worker.service celery-beat.service
   ```

3. **Verify everything is working**:
   ```bash
   # Check services
   sudo systemctl status hostel.service celery-worker.service celery-beat.service
   
   # Test Celery
   cd /home/ubuntu/hostel
   source venv/bin/activate
   celery -A hostel inspect active
   
   # Test email (in Django shell)
   python manage.py shell
   # Then test email sending
   ```

4. **Configure Nginx** (see `PRODUCTION_DEPLOYMENT.md`)

5. **Set up SSL** (Let's Encrypt recommended)

## Important Notes

- **Celery is used for emails** - All email tasks are processed asynchronously via Celery
- **Redis is required** - Celery needs Redis as the message broker
- **Services auto-restart** - All services are configured to restart on failure
- **Logs are centralized** - Check `/home/ubuntu/hostel/logs/` for application logs
- **Environment variables** - Make sure `.env` file is properly configured

## Troubleshooting

If services won't start:
1. Check logs: `sudo journalctl -u <service-name> -n 50`
2. Verify Redis is running: `redis-cli ping`
3. Verify PostgreSQL is running: `sudo systemctl status postgresql`
4. Check environment variables in `.env`
5. Verify paths in service files match your deployment

For detailed troubleshooting, see `PRODUCTION_DEPLOYMENT.md`.

