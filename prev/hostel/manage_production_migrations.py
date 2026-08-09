#!/usr/bin/env python
"""
Production Migration Safety Wrapper
This script ensures safe migration execution in production
"""

import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

# Add project directory to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel.settings.prod')

import django
django.setup()

from django.conf import settings

def check_production_environment():
    """Verify we're in production and migrations are allowed"""
    if settings.DEBUG:
        print("⚠️  WARNING: DEBUG is True. This doesn't look like production!")
        response = input("Continue anyway? (yes/no): ")
        if response.lower() != 'yes':
            sys.exit(1)
    
    if not getattr(settings, 'ALLOW_MIGRATIONS', False):
        print("❌ ERROR: Migrations are disabled in production!")
        print("   Set ALLOW_MIGRATIONS=True in your .env file to enable migrations.")
        print("   This is a safety feature to prevent accidental migrations.")
        sys.exit(1)
    
    print("✅ Production environment check passed")
    print(f"   Database: {settings.DATABASES['default']['NAME']}")
    print(f"   DEBUG: {settings.DEBUG}")

def create_backup():
    """Create database backup before migration"""
    backup_dir = BASE_DIR / 'backups'
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    db_name = settings.DATABASES['default']['NAME']
    db_user = settings.DATABASES['default']['USER']
    
    backup_file = backup_dir / f'db_backup_{timestamp}.dump'
    
    print(f"\n📦 Creating database backup...")
    print(f"   Backup file: {backup_file}")
    
    try:
        # Try pg_dump
        cmd = [
            'pg_dump',
            '-U', db_user,
            '-d', db_name,
            '-F', 'c',
            '-f', str(backup_file)
        ]
        
        # Set PGPASSWORD if available
        env = os.environ.copy()
        if 'DB_PASS' in env:
            env['PGPASSWORD'] = env['DB_PASS']
        
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Backup created successfully: {backup_file}")
            return str(backup_file)
        else:
            print(f"⚠️  pg_dump failed: {result.stderr}")
            print("   Attempting Django dumpdata instead...")
            
            # Fallback to Django dumpdata
            json_backup = backup_dir / f'data_backup_{timestamp}.json'
            cmd = ['python', 'manage.py', 'dumpdata', 
                   '--exclude', 'auth.permission',
                   '--exclude', 'contenttypes',
                   '--output', str(json_backup)]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ Data backup created: {json_backup}")
                return str(json_backup)
            else:
                print(f"❌ Backup failed: {result.stderr}")
                response = input("Continue without backup? (yes/no): ")
                if response.lower() != 'yes':
                    sys.exit(1)
                return None
    except FileNotFoundError:
        print("⚠️  pg_dump not found. Using Django dumpdata...")
        json_backup = backup_dir / f'data_backup_{timestamp}.json'
        cmd = ['python', 'manage.py', 'dumpdata',
               '--exclude', 'auth.permission',
               '--exclude', 'contenttypes',
               '--output', str(json_backup)]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Data backup created: {json_backup}")
            return str(json_backup)
        else:
            print(f"❌ Backup failed: {result.stderr}")
            response = input("Continue without backup? (yes/no): ")
            if response.lower() != 'yes':
                sys.exit(1)
            return None

def show_migration_plan():
    """Show what migrations will be applied"""
    print("\n📋 Checking migration status...")
    result = subprocess.run(['python', 'manage.py', 'showmigrations', '--plan'], 
                          capture_output=True, text=True)
    print(result.stdout)
    
    # Count pending migrations
    pending = [line for line in result.stdout.split('\n') if '[ ]' in line]
    if pending:
        print(f"\n⚠️  Found {len(pending)} pending migration(s)")
        return True
    else:
        print("\n✅ No pending migrations")
        return False

def preview_migrations():
    """Preview SQL for pending migrations"""
    print("\n🔍 Previewing SQL for pending migrations...")
    result = subprocess.run(['python', 'manage.py', 'showmigrations', '--plan'],
                          capture_output=True, text=True)
    
    pending_migrations = []
    for line in result.stdout.split('\n'):
        if '[ ]' in line:
            parts = line.strip().split()
            if len(parts) >= 1:
                app_migration = parts[0]
                if '.' in app_migration:
                    app, migration = app_migration.split('.', 1)
                    pending_migrations.append((app, migration))
    
    for app, migration in pending_migrations[:5]:  # Limit to first 5
        print(f"\n--- Preview: {app}.{migration} ---")
        result = subprocess.run(['python', 'manage.py', 'sqlmigrate', app, migration],
                              capture_output=True, text=True)
        print(result.stdout[:500])  # First 500 chars
        if len(result.stdout) > 500:
            print("... (truncated)")

def run_migrations():
    """Run migrations with safety checks"""
    print("\n🚀 Running migrations...")
    
    # Check migrations first
    result = subprocess.run(['python', 'manage.py', 'migrate', '--check'],
                          capture_output=True, text=True)
    if result.returncode != 0:
        print("⚠️  Migration check found issues:")
        print(result.stderr)
        response = input("Continue anyway? (yes/no): ")
        if response.lower() != 'yes':
            sys.exit(1)
    
    # Run migrations
    result = subprocess.run(['python', 'manage.py', 'migrate'],
                          capture_output=True, text=True)
    
    print(result.stdout)
    if result.returncode != 0:
        print("❌ Migration failed!")
        print(result.stderr)
        sys.exit(1)
    
    print("✅ Migrations completed successfully!")

def main():
    """Main migration safety workflow"""
    print("=" * 60)
    print("Production Migration Safety Wrapper")
    print("=" * 60)
    
    # Step 1: Check production environment
    check_production_environment()
    
    # Step 2: Create backup
    backup_file = create_backup()
    
    # Step 3: Show migration plan
    has_pending = show_migration_plan()
    
    if not has_pending:
        print("\n✅ No migrations to apply. Exiting.")
        sys.exit(0)
    
    # Step 4: Preview migrations
    preview_migrations()
    
    # Step 5: Confirm
    print("\n" + "=" * 60)
    print("⚠️  WARNING: You are about to run migrations in production!")
    print("=" * 60)
    if backup_file:
        print(f"📦 Backup created: {backup_file}")
    print("\nReview the migrations above carefully.")
    response = input("\nContinue with migration? (yes/no): ")
    
    if response.lower() != 'yes':
        print("Migration cancelled by user.")
        sys.exit(0)
    
    # Step 6: Run migrations
    run_migrations()
    
    print("\n" + "=" * 60)
    print("✅ Migration process completed successfully!")
    print("=" * 60)
    if backup_file:
        print(f"\n📦 Backup saved at: {backup_file}")
    print("\nNext steps:")
    print("  1. Verify application is working correctly")
    print("  2. Monitor logs for any errors")
    print("  3. Test critical functionality")

if __name__ == '__main__':
    main()

