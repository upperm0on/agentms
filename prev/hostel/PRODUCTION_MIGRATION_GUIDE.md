# Production Migration Safety Guide

This guide ensures safe database migrations in production without data loss or downtime.

## ⚠️ Critical Rules for Production Migrations

### 1. **ALWAYS Backup First**
```bash
# Create a database backup before any migration
pg_dump -U hosteluser -d hostel_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using Django management command
python manage.py dumpdata > backup_$(date +%Y%m%d_%H%M%S).json
```

### 2. **Test Migrations in Staging First**
- Never run migrations directly in production
- Always test in a staging environment that mirrors production
- Verify data integrity after migrations

### 3. **Check Migration Plan Before Running**
```bash
# Show what migrations will be applied
python manage.py showmigrations

# Show SQL that will be executed (without running it)
python manage.py sqlmigrate <app_name> <migration_number>
```

### 4. **Use Transactions When Possible**
- Django migrations run in transactions by default for PostgreSQL
- If a migration fails, it will rollback automatically
- **Exception**: Data migrations (RunPython) are NOT in transactions by default

## 🔍 Pre-Migration Checklist

Before running any migration in production:

- [ ] **Backup database** (both SQL dump and JSON dumpdata)
- [ ] **Check migration plan** (`showmigrations`)
- [ ] **Review SQL** (`sqlmigrate` for each migration)
- [ ] **Test in staging** environment first
- [ ] **Schedule during low-traffic** period
- [ ] **Notify team** of maintenance window
- [ ] **Have rollback plan** ready
- [ ] **Monitor application** during migration

## 🚨 Dangerous Migration Operations

### High Risk Operations:

1. **DeleteModel** - Permanently deletes table and all data
   - Example: `payment_account/migrations/0002_delete_splitpaymentconfig.py`
   - **Action**: Verify model is truly unused before running

2. **AlterField with data loss** - Changing field types that lose data
   - Example: Changing CharField to IntegerField
   - **Action**: Create data migration first to transform data

3. **RenameModel** - Can break foreign keys
   - **Action**: Use `RenameModel` operation, Django handles this safely

4. **RemoveField** - Permanently deletes column
   - **Action**: Ensure field is not used anywhere

5. **RunPython** - Custom Python code (not in transaction by default)
   - **Action**: Wrap in `atomic=False` only if necessary, otherwise keep atomic

## ✅ Safe Migration Strategy

### Step 1: Check Current Migration Status
```bash
python manage.py showmigrations
```

### Step 2: Create Backup
```bash
# Full database backup
pg_dump -U hosteluser -d hostel_db -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Django data backup
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > backup_$(date +%Y%m%d_%H%M%S).json
```

### Step 3: Review Migrations to Apply
```bash
# See what migrations will run
python manage.py showmigrations --plan

# Preview SQL for each migration
python manage.py sqlmigrate <app> <migration_number>
```

### Step 4: Run Migrations in Dry-Run Mode (if possible)
```bash
# Some operations can be tested with --dry-run
# Note: Django doesn't have built-in dry-run, but you can:
# 1. Test on a copy of production database
# 2. Use --check flag to verify without applying
python manage.py migrate --check
```

### Step 5: Apply Migrations
```bash
# Apply all pending migrations
python manage.py migrate

# Or apply specific app
python manage.py migrate <app_name>
```

### Step 6: Verify Migration Success
```bash
# Check migration status
python manage.py showmigrations

# Verify database schema
python manage.py dbshell
# Then run: \dt to list tables
```

## 🔄 Rollback Strategy

### If Migration Fails:

1. **Automatic Rollback** (PostgreSQL)
   - Django migrations run in transactions
   - If migration fails, it automatically rolls back
   - Database should be in previous state

2. **Manual Rollback**
   ```bash
   # Rollback specific migration
   python manage.py migrate <app_name> <previous_migration_number>
   
   # Example: Rollback to 0006
   python manage.py migrate entrepreneurs 0006
   ```

3. **Restore from Backup**
   ```bash
   # Restore database from backup
   pg_restore -U hosteluser -d hostel_db backup_YYYYMMDD_HHMMSS.dump
   
   # Or restore from SQL dump
   psql -U hosteluser -d hostel_db < backup_YYYYMMDD_HHMMSS.sql
   ```

## 📋 Migration Safety Script

Create a script to safely run migrations:

```bash
#!/bin/bash
# safe_migrate.sh

set -e

DB_NAME="hostel_db"
DB_USER="hosteluser"
BACKUP_DIR="/home/ubuntu/hostel/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Creating backup..."
mkdir -p "$BACKUP_DIR"

# Create database backup
pg_dump -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_DIR/db_backup_$TIMESTAMP.dump"

# Create Django data backup
cd /home/ubuntu/hostel
source venv/bin/activate
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > "$BACKUP_DIR/data_backup_$TIMESTAMP.json"

echo "Backup created: $BACKUP_DIR/db_backup_$TIMESTAMP.dump"
echo "Data backup created: $BACKUP_DIR/data_backup_$TIMESTAMP.json"

echo "Checking migration status..."
python manage.py showmigrations

read -p "Review migrations above. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 1
fi

echo "Running migrations..."
python manage.py migrate

echo "Migration completed successfully!"
echo "Backup location: $BACKUP_DIR/db_backup_$TIMESTAMP.dump"
```

## 🛡️ Production Migration Best Practices

### 1. **Zero-Downtime Migrations**

For large tables or critical operations:

```python
# Example: Adding a nullable field (safe)
# Step 1: Add field as nullable
migrations.AddField(
    model_name='model',
    name='new_field',
    field=models.CharField(max_length=100, null=True, blank=True),
)

# Step 2: Populate data (separate migration)
# Step 3: Make field required (separate migration)
```

### 2. **Index Creation**

```python
# Add index in separate migration for large tables
# This prevents table locking during index creation
migrations.RunSQL(
    "CREATE INDEX CONCURRENTLY idx_name ON table_name(column_name);",
    reverse_sql="DROP INDEX CONCURRENTLY idx_name;"
)
```

### 3. **Data Migrations**

```python
# Always use atomic=True for data migrations when possible
from django.db import migrations

def migrate_data(apps, schema_editor):
    # Your data migration code
    pass

class Migration(migrations.Migration):
    atomic = True  # Run in transaction
    
    operations = [
        migrations.RunPython(migrate_data, reverse_code=migrations.RunPython.noop),
    ]
```

## 📊 Monitoring During Migration

```bash
# Monitor database connections
psql -U hosteluser -d hostel_db -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor table locks
psql -U hosteluser -d hostel_db -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Monitor application logs
tail -f /home/ubuntu/hostel/logs/django_errors.log
```

## 🚫 What NOT to Do

1. ❌ **Never run migrations without backup**
2. ❌ **Never run migrations during peak hours**
3. ❌ **Never skip testing in staging**
4. ❌ **Never run `migrate --fake` in production** (unless you know exactly what you're doing)
5. ❌ **Never delete migration files** that have been run in production
6. ❌ **Never modify existing migrations** that have been run in production

## ✅ Safe Migration Commands

```bash
# Check migration status
python manage.py showmigrations

# Show migration plan
python manage.py showmigrations --plan

# Preview SQL
python manage.py sqlmigrate <app> <migration>

# Check for issues without applying
python manage.py migrate --check

# Apply migrations
python manage.py migrate

# Rollback (if needed)
python manage.py migrate <app> <previous_migration>
```

## 🔐 Production Migration Workflow

1. **Development** → Create migration
2. **Staging** → Test migration
3. **Backup** → Create production backup
4. **Review** → Check migration SQL
5. **Schedule** → Choose low-traffic window
6. **Notify** → Inform team
7. **Execute** → Run migration
8. **Verify** → Check application health
9. **Monitor** → Watch for issues
10. **Document** → Record migration details

## 📝 Migration Log Template

Keep a log of all production migrations:

```
Date: YYYY-MM-DD HH:MM:SS
Migration: <app>/<migration_number>
Description: <what the migration does>
Backup: backup_YYYYMMDD_HHMMSS.dump
Status: Success/Failed
Rollback: Yes/No
Notes: <any issues or observations>
```

## 🆘 Emergency Procedures

If a migration causes issues:

1. **Stop the application** (if necessary)
   ```bash
   sudo systemctl stop hostel.service
   ```

2. **Assess the damage**
   ```bash
   python manage.py showmigrations
   python manage.py dbshell
   ```

3. **Rollback if possible**
   ```bash
   python manage.py migrate <app> <previous_migration>
   ```

4. **Restore from backup if rollback fails**
   ```bash
   pg_restore -U hosteluser -d hostel_db backup_YYYYMMDD_HHMMSS.dump
   ```

5. **Restart application**
   ```bash
   sudo systemctl start hostel.service
   ```

## 📚 Additional Resources

- Django Migration Documentation: https://docs.djangoproject.com/en/stable/topics/migrations/
- PostgreSQL Backup/Restore: https://www.postgresql.org/docs/current/backup.html
- Django Migration Operations: https://docs.djangoproject.com/en/stable/ref/migration-operations/

