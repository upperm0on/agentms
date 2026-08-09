"""
Custom management command for safe migrations in production
This command wraps the standard migrate command with safety checks
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from django.db import connection
import sys
import os
from datetime import datetime
import subprocess
from pathlib import Path


class Command(BaseCommand):
    help = 'Safely run migrations in production with automatic backups and checks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-backup',
            action='store_true',
            help='Skip creating backup (not recommended)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force migration even if ALLOW_MIGRATIONS is False',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without actually running migrations',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('Production Migration Safety Check'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('')

        # Check if migrations are allowed
        if not options.get('force'):
            allow_migrations = getattr(settings, 'ALLOW_MIGRATIONS', False)
            if not allow_migrations:
                self.stdout.write(
                    self.style.ERROR(
                        '❌ Migrations are disabled in production!\n'
                        '   Set ALLOW_MIGRATIONS=True in your .env file to enable migrations.\n'
                        '   Or use --force flag to override (not recommended).'
                    )
                )
                sys.exit(1)

        # Check if in production
        if settings.DEBUG:
            self.stdout.write(
                self.style.WARNING(
                    '⚠️  WARNING: DEBUG is True. This doesn\'t look like production!'
                )
            )
            if not options.get('force'):
                response = input('Continue anyway? (yes/no): ')
                if response.lower() != 'yes':
                    self.stdout.write(self.style.WARNING('Migration cancelled.'))
                    sys.exit(0)

        # Show database info
        db_name = settings.DATABASES['default']['NAME']
        self.stdout.write(f'Database: {db_name}')
        self.stdout.write(f'DEBUG: {settings.DEBUG}')
        self.stdout.write('')

        # Create backup
        if not options.get('skip_backup'):
            backup_file = self.create_backup()
            if backup_file:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Backup created: {backup_file}')
                )
        else:
            self.stdout.write(
                self.style.WARNING('⚠️  Skipping backup (not recommended)')
            )

        # Show migration plan
        self.stdout.write('')
        self.stdout.write('📋 Checking migration status...')
        call_command('showmigrations', '--plan')

        # Check for pending migrations
        result = subprocess.run(
            ['python', 'manage.py', 'showmigrations', '--plan'],
            capture_output=True,
            text=True
        )
        pending = [line for line in result.stdout.split('\n') if '[ ]' in line]

        if not pending:
            self.stdout.write(
                self.style.SUCCESS('\n✅ No pending migrations. Nothing to do.')
            )
            return

        self.stdout.write(
            self.style.WARNING(f'\n⚠️  Found {len(pending)} pending migration(s)')
        )

        # Dry run mode
        if options.get('dry_run'):
            self.stdout.write('')
            self.stdout.write('🔍 DRY RUN MODE - Previewing migrations...')
            for line in pending[:5]:  # Limit to first 5
                parts = line.strip().split()
                if parts and '.' in parts[0]:
                    app, migration = parts[0].split('.', 1)
                    self.stdout.write(f'\n--- Preview: {app}.{migration} ---')
                    result = subprocess.run(
                        ['python', 'manage.py', 'sqlmigrate', app, migration],
                        capture_output=True,
                        text=True
                    )
                    self.stdout.write(result.stdout[:500])
            self.stdout.write('')
            self.stdout.write(
                self.style.SUCCESS('Dry run complete. No migrations were applied.')
            )
            return

        # Confirm before running
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(
            self.style.WARNING('⚠️  WARNING: You are about to run migrations in production!')
        )
        self.stdout.write(self.style.WARNING('=' * 60))
        if not options.get('skip_backup') and backup_file:
            self.stdout.write(f'📦 Backup: {backup_file}')
        self.stdout.write('')

        response = input('Continue with migration? (yes/no): ')
        if response.lower() != 'yes':
            self.stdout.write(self.style.WARNING('Migration cancelled by user.'))
            sys.exit(0)

        # Run migrations
        self.stdout.write('')
        self.stdout.write('🚀 Running migrations...')
        try:
            call_command('migrate', verbosity=1)
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write(
                self.style.SUCCESS('✅ Migrations completed successfully!')
            )
            self.stdout.write(self.style.SUCCESS('=' * 60))
            if not options.get('skip_backup') and backup_file:
                self.stdout.write(f'\n📦 Backup saved at: {backup_file}')
            self.stdout.write('')
            self.stdout.write('Next steps:')
            self.stdout.write('  1. Verify application is working correctly')
            self.stdout.write('  2. Monitor logs for any errors')
            self.stdout.write('  3. Test critical functionality')
        except Exception as e:
            self.stdout.write('')
            self.stdout.write(self.style.ERROR('=' * 60))
            self.stdout.write(self.style.ERROR('❌ Migration failed!'))
            self.stdout.write(self.style.ERROR('=' * 60))
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            self.stdout.write('')
            self.stdout.write(
                'PostgreSQL migrations run in transactions, so the database should have rolled back automatically.'
            )
            if not options.get('skip_backup') and backup_file:
                self.stdout.write(f'\n📦 Backup available at: {backup_file}')
            sys.exit(1)

    def create_backup(self):
        """Create database backup"""
        backup_dir = Path(settings.BASE_DIR) / 'backups'
        backup_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']

        backup_file = backup_dir / f'db_backup_{timestamp}.dump'

        self.stdout.write('📦 Creating database backup...')

        try:
            # Try pg_dump
            env = os.environ.copy()
            if 'DB_PASS' in env:
                env['PGPASSWORD'] = env['DB_PASS']

            result = subprocess.run(
                [
                    'pg_dump',
                    '-U', db_user,
                    '-d', db_name,
                    '-F', 'c',
                    '-f', str(backup_file)
                ],
                env=env,
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                return str(backup_file)
            else:
                # Fallback to Django dumpdata
                self.stdout.write(
                    self.style.WARNING('pg_dump failed, using Django dumpdata...')
                )
                json_backup = backup_dir / f'data_backup_{timestamp}.json'
                call_command(
                    'dumpdata',
                    '--exclude', 'auth.permission',
                    '--exclude', 'contenttypes',
                    '--output', str(json_backup),
                    verbosity=0
                )
                return str(json_backup)
        except FileNotFoundError:
            # Fallback to Django dumpdata
            self.stdout.write(
                self.style.WARNING('pg_dump not found, using Django dumpdata...')
            )
            json_backup = backup_dir / f'data_backup_{timestamp}.json'
            call_command(
                'dumpdata',
                '--exclude', 'auth.permission',
                '--exclude', 'contenttypes',
                '--output', str(json_backup),
                verbosity=0
            )
            return str(json_backup)
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'Backup failed: {str(e)}')
            )
            response = input('Continue without backup? (yes/no): ')
            if response.lower() != 'yes':
                sys.exit(1)
            return None

