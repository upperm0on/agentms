# Production Deployment Guide

This guide covers the complete setup for deploying the Hostel application to production, including API, Celery workers, and all required services.

## Prerequisites

- Ubuntu 20.04+ server
- Python 3.8+
- PostgreSQL
- Redis
- Nginx
- SSL certificate (Let's Encrypt recommended)

## 1. System Dependencies

### Install Required Packages

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib redis-server nginx supervisor git
```

### Start and Enable Services

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## 2. Database Setup

### Create PostgreSQL Database and User

```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE hostel_db;
CREATE USER hosteluser WITH PASSWORD 'your_secure_password';
ALTER ROLE hosteluser SET client_encoding TO 'utf8';
ALTER ROLE hosteluser SET default_transaction_isolation TO 'read committed';
ALTER ROLE hosteluser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE hostel_db TO hosteluser;
\q
```

## 3. Redis Configuration

### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

### Configure Redis (if needed)

Edit `/etc/redis/redis.conf`:
```conf
bind 127.0.0.1
port 6379
```

Restart Redis:
```bash
sudo systemctl restart redis-server
```

## 4. Application Setup

### Clone and Setup Project

```bash
cd /home/ubuntu
git clone <your-repo-url> hostel
cd hostel
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Environment Variables

Create `.env` file in project root:

```bash
nano /home/ubuntu/hostel/.env
```

Add the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
DJANGO_SETTINGS_MODULE=hostel.settings.prod

# Database
DB_NAME=hostel_db
DB_USER=hosteluser
DB_PASS=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email Configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=developers@kwabenaboakyeroyalventures.com
EMAIL_HOST_PASSWORD=your_email_password
FRONTEND_URL=https://hosttelz.com

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=eu-north-1

# Paystack
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

### Run Migrations (SAFE METHOD)

**⚠️ IMPORTANT: Always backup before running migrations!**

Use the safe migration script:
```bash
cd /home/ubuntu/hostel
source venv/bin/activate

# Option 1: Use the safe migration script (recommended)
./safe_migrate.sh

# Option 2: Use the Python migration wrapper
python manage_production_migrations.py

# Option 3: Manual migration (only if you know what you're doing)
# First, enable migrations in .env: ALLOW_MIGRATIONS=True
python manage.py migrate
```

**Before running migrations:**
1. Create a database backup
2. Review pending migrations: `python manage.py showmigrations`
3. Preview SQL: `python manage.py sqlmigrate <app> <migration>`
4. Test in staging first

See `PRODUCTION_MIGRATION_GUIDE.md` for detailed migration safety procedures.

### Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Create Superuser

```bash
python manage.py createsuperuser
```

## 5. Systemd Services

### Copy Service Files

```bash
sudo cp /home/ubuntu/hostel/hostel.service /etc/systemd/system/
sudo cp /home/ubuntu/hostel/celery-worker.service /etc/systemd/system/
sudo cp /home/ubuntu/hostel/celery-beat.service /etc/systemd/system/
```

### Update Service File Paths

**Important**: Update the paths in the service files to match your actual deployment path:
- `/home/ubuntu/hostel` - Update if your project is in a different location
- `/home/ubuntu/hostel/venv` - Update if your virtual environment is in a different location
- User/Group: Update `ubuntu` if using a different user

### Reload Systemd and Start Services

```bash
sudo systemctl daemon-reload

# Start and enable Django application
sudo systemctl enable hostel.service
sudo systemctl start hostel.service

# Start and enable Celery worker
sudo systemctl enable celery-worker.service
sudo systemctl start celery-worker.service

# Start and enable Celery beat (for scheduled tasks)
sudo systemctl enable celery-beat.service
sudo systemctl start celery-beat.service
```

### Verify Services are Running

```bash
# Check Django application
sudo systemctl status hostel.service

# Check Celery worker
sudo systemctl status celery-worker.service

# Check Celery beat
sudo systemctl status celery-beat.service
```

### View Logs

```bash
# Django application logs
sudo journalctl -u hostel.service -f

# Celery worker logs
tail -f /home/ubuntu/hostel/logs/celery_worker.log
sudo journalctl -u celery-worker.service -f

# Celery beat logs
tail -f /home/ubuntu/hostel/logs/celery_beat.log
sudo journalctl -u celery-beat.service -f

# Django errors
tail -f /home/ubuntu/hostel/logs/django_errors.log

# Gunicorn logs
tail -f /home/ubuntu/hostel/logs/gunicorn_access.log
tail -f /home/ubuntu/hostel/logs/gunicorn_error.log
```

## 6. Nginx Configuration

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/hostel
```

Add the following configuration:

```nginx
upstream django {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name hosttelz.com www.hosttelz.com manager.hosttelz.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hosttelz.com www.hosttelz.com manager.hosttelz.com;

    ssl_certificate /etc/letsencrypt/live/hosttelz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hosttelz.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/hostel_access.log;
    error_log /var/log/nginx/hostel_error.log;

    # Max upload size
    client_max_body_size 100M;

    # Static files
    location /static/ {
        alias /home/ubuntu/hostel/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /home/ubuntu/hostel/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Django application
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Enable Site and Test Configuration

```bash
sudo ln -s /etc/nginx/sites-available/hostel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d hosttelz.com -d www.hosttelz.com -d manager.hosttelz.com
```

Certbot will automatically configure Nginx with SSL.

## 8. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 9. Monitoring and Maintenance

### Check Service Status

```bash
# All services
sudo systemctl status hostel.service celery-worker.service celery-beat.service

# Quick health check
curl http://localhost:8000/health  # If you have a health endpoint
```

### Restart Services

```bash
# Restart Django application
sudo systemctl restart hostel.service

# Restart Celery worker
sudo systemctl restart celery-worker.service

# Restart Celery beat
sudo systemctl restart celery-beat.service

# Restart all
sudo systemctl restart hostel.service celery-worker.service celery-beat.service
```

### Update Application

```bash
cd /home/ubuntu/hostel
source venv/bin/activate
git pull
pip install -r requirements.txt

# ⚠️ IMPORTANT: Use safe migration method
# Option 1: Use safe migration script
./safe_migrate.sh

# Option 2: Use Python migration wrapper
python manage_production_migrations.py

# Option 3: Manual (only if ALLOW_MIGRATIONS=True in .env)
python manage.py migrate

python manage.py collectstatic --noinput
sudo systemctl restart hostel.service celery-worker.service celery-beat.service
```

**⚠️ Always backup before running migrations!** See `PRODUCTION_MIGRATION_GUIDE.md` for details.

## 10. Troubleshooting

### Celery Worker Not Processing Tasks

1. Check if Redis is running:
   ```bash
   redis-cli ping
   ```

2. Check Celery worker logs:
   ```bash
   tail -f /home/ubuntu/hostel/logs/celery_worker.log
   ```

3. Test Celery connection:
   ```bash
   cd /home/ubuntu/hostel
   source venv/bin/activate
   celery -A hostel inspect active
   ```

### Email Not Sending

1. Check email configuration in `.env`
2. Test email connection:
   ```bash
   python manage.py shell
   >>> from django.core.mail import send_mail
   >>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
   ```

3. Check Celery worker is processing email tasks:
   ```bash
   tail -f /home/ubuntu/hostel/logs/celery_worker.log | grep email
   ```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Test database connection:
   ```bash
   psql -U hosteluser -d hostel_db -h localhost
   ```

## 11. Production Checklist

- [ ] All environment variables set in `.env`
- [ ] Database created and migrations run
- [ ] Static files collected
- [ ] Redis running and accessible
- [ ] PostgreSQL running and accessible
- [ ] Django application service running
- [ ] Celery worker service running
- [ ] Celery beat service running (if using scheduled tasks)
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Logs directory created and writable
- [ ] Email service tested
- [ ] All services set to start on boot

## 12. Quick Start Commands

```bash
# Start all services
sudo systemctl start hostel.service celery-worker.service celery-beat.service

# Stop all services
sudo systemctl stop hostel.service celery-worker.service celery-beat.service

# Restart all services
sudo systemctl restart hostel.service celery-worker.service celery-beat.service

# Check status
sudo systemctl status hostel.service celery-worker.service celery-beat.service

# View logs
sudo journalctl -u hostel.service -f
sudo journalctl -u celery-worker.service -f
sudo journalctl -u celery-beat.service -f
```

## Support

For issues or questions, check the logs first:
- Application logs: `/home/ubuntu/hostel/logs/`
- System logs: `sudo journalctl -u <service-name>`
- Nginx logs: `/var/log/nginx/`

