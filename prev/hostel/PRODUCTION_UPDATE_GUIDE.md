# Production Update Guide

This guide covers the steps to safely update your production server after pulling new code.

## 📋 Pre-Update Checklist

Before starting the update:

- [ ] **Check current status** - Verify all services are running
- [ ] **Review changes** - Check what changed in the new code
- [ ] **Schedule update** - Choose low-traffic period
- [ ] **Notify team** - Inform about maintenance window (if needed)
- [ ] **Have rollback plan** - Know how to revert if needed

## 🚀 Step-by-Step Update Process

### Step 1: SSH into Production Server

```bash
ssh ubuntu@your-production-server
cd /home/ubuntu/hostel
```

### Step 2: Check Current Status

```bash
# Check if all services are running
sudo systemctl status hostel.service
sudo systemctl status celery-worker.service
sudo systemctl status celery-beat.service

# Check application logs
tail -f logs/django_errors.log
```

### Step 3: Create Backup (IMPORTANT!)

```bash
# Create database backup before any changes
pg_dump -U hosteluser -d hostel_db -F c -f backups/pre_update_$(date +%Y%m%d_%H%M%S).dump

# Or use Django dumpdata
source venv/bin/activate
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > backups/pre_update_$(date +%Y%m%d_%H%M%S).json
```

### Step 4: Pull Latest Code

```bash
cd /home/ubuntu/hostel
git pull origin master
```

### Step 5: Activate Virtual Environment

```bash
source venv/bin/activate
```

### Step 6: Update Dependencies

```bash
# Update pip
pip install --upgrade pip

# Install/update dependencies
pip install -r requirements.txt
```

### Step 7: Update Environment Variables (if needed)

```bash
# Check if new environment variables are needed
nano .env

# Add any new variables from the code changes
# For example, if migrations are now protected:
# ALLOW_MIGRATIONS=True  # Only when you need to run migrations
```

### Step 8: Run Migrations (SAFE METHOD)

**⚠️ IMPORTANT: Always use the safe migration method!**

```bash
# Option 1: Use the safe migration script (RECOMMENDED)
./safe_migrate.sh

# Option 2: Use the Django management command
python manage.py safe_migrate

# Option 3: Use the Python wrapper
python manage_production_migrations.py

# Option 4: Manual migration (only if you know what you're doing)
# First, enable migrations in .env: ALLOW_MIGRATIONS=True
python manage.py migrate
```

**The safe migration tools will:**
- Create automatic backups
- Show pending migrations
- Preview SQL
- Ask for confirmation
- Run migrations safely

### Step 9: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Step 10: Restart Services

```bash
# Restart all services
sudo systemctl restart hostel.service celery-worker.service celery-beat.service

# Or restart individually
sudo systemctl restart hostel.service
sudo systemctl restart celery-worker.service
sudo systemctl restart celery-beat.service
```

### Step 11: Verify Services are Running

```bash
# Check service status
sudo systemctl status hostel.service
sudo systemctl status celery-worker.service
sudo systemctl status celery-beat.service

# Check if services started successfully
sudo systemctl is-active hostel.service
sudo systemctl is-active celery-worker.service
sudo systemctl is-active celery-beat.service
```

### Step 12: Check Application Logs

```bash
# Check Django application logs
tail -f logs/django_errors.log

# Check Gunicorn logs
tail -f logs/gunicorn_access.log
tail -f logs/gunicorn_error.log

# Check Celery worker logs
tail -f logs/celery_worker.log

# Check Celery beat logs
tail -f logs/celery_beat.log

# Check systemd logs
sudo journalctl -u hostel.service -f
sudo journalctl -u celery-worker.service -f
sudo journalctl -u celery-beat.service -f
```

### Step 13: Test Application

```bash
# Test API endpoints (if you have health check)
curl http://localhost:8000/health

# Test Celery connection
python manage.py shell
# In Python shell:
# from celery import current_app
# current_app.control.inspect().active()
```

### Step 14: Monitor for Issues

```bash
# Monitor logs for a few minutes
tail -f logs/django_errors.log

# Check for any errors
grep -i error logs/django_errors.log | tail -20
```

## 🔄 Quick Update Script

Create a script for quick updates:

```bash
#!/bin/bash
# quick_update.sh

set -e

cd /home/ubuntu/hostel
source venv/bin/activate

echo "Creating backup..."
pg_dump -U hosteluser -d hostel_db -F c -f backups/pre_update_$(date +%Y%m%d_%H%M%S).dump

echo "Pulling latest code..."
git pull origin master

echo "Updating dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Running migrations (safe method)..."
./safe_migrate.sh

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Restarting services..."
sudo systemctl restart hostel.service celery-worker.service celery-beat.service

echo "Checking service status..."
sudo systemctl status hostel.service --no-pager
sudo systemctl status celery-worker.service --no-pager
sudo systemctl status celery-beat.service --no-pager

echo "✅ Update complete!"
```

## 🚨 Rollback Procedure

If something goes wrong:

### Step 1: Stop Services

```bash
sudo systemctl stop hostel.service celery-worker.service celery-beat.service
```

### Step 2: Restore Database

```bash
# Restore from backup
pg_restore -U hosteluser -d hostel_db backups/pre_update_YYYYMMDD_HHMMSS.dump

# Or restore from SQL dump
psql -U hosteluser -d hostel_db < backups/pre_update_YYYYMMDD_HHMMSS.sql
```

### Step 3: Revert Code

```bash
cd /home/ubuntu/hostel
git reset --hard HEAD~1  # Revert last commit
# Or checkout specific commit
git checkout <previous-commit-hash>
```

### Step 4: Restart Services

```bash
sudo systemctl start hostel.service celery-worker.service celery-beat.service
```

## 📝 Post-Update Checklist

After updating:

- [ ] **All services running** - Check status of all services
- [ ] **No errors in logs** - Review application logs
- [ ] **API working** - Test critical endpoints
- [ ] **Celery working** - Verify async tasks are processing
- [ ] **Email working** - Test email functionality
- [ ] **Database healthy** - Check database connections
- [ ] **Static files served** - Verify static files are accessible
- [ ] **Monitor for issues** - Watch logs for 10-15 minutes

## 🔍 Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status hostel.service

# Check logs
sudo journalctl -u hostel.service -n 50

# Check for errors
tail -f logs/django_errors.log
```

### Migration Failed

```bash
# Check migration status
python manage.py showmigrations

# Check for migration errors
python manage.py migrate --verbosity=2

# Rollback if needed
python manage.py migrate <app> <previous_migration>
```

### Celery Not Processing Tasks

```bash
# Check Celery worker status
sudo systemctl status celery-worker.service

# Check Celery logs
tail -f logs/celery_worker.log

# Test Celery connection
python manage.py shell
# from celery import current_app
# current_app.control.inspect().active()
```

### Application Errors

```bash
# Check Django errors
tail -f logs/django_errors.log

# Check Gunicorn errors
tail -f logs/gunicorn_error.log

# Check systemd logs
sudo journalctl -u hostel.service -f
```

## 📊 Monitoring Commands

```bash
# Monitor all services
watch -n 5 'sudo systemctl status hostel.service celery-worker.service celery-beat.service'

# Monitor logs
tail -f logs/django_errors.log logs/celery_worker.log logs/celery_beat.log

# Monitor system resources
htop
df -h
free -h
```

## ✅ Success Indicators

After a successful update:

- ✅ All services show "active (running)"
- ✅ No errors in logs
- ✅ API responds correctly
- ✅ Celery processes tasks
- ✅ Email sends successfully
- ✅ Database queries work
- ✅ Static files load correctly

## 🎯 Best Practices

1. **Always backup first** - Never skip backups
2. **Test in staging** - Test changes in staging before production
3. **Use safe migration tools** - Always use the safe migration methods
4. **Monitor after update** - Watch logs for at least 10-15 minutes
5. **Have rollback plan** - Know how to revert if needed
6. **Update during low traffic** - Schedule updates during off-peak hours
7. **Notify team** - Inform team about updates
8. **Document changes** - Keep track of what was updated

## 📞 Emergency Contacts

If something goes wrong:

1. **Stop services** - Prevent further issues
2. **Check logs** - Identify the problem
3. **Restore backup** - If database is corrupted
4. **Revert code** - If code changes caused issues
5. **Contact team** - If you need help

---

**Remember:** Always use the safe migration tools and create backups before any updates!

