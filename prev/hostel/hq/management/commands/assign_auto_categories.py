import logging
from django.core.management.base import BaseCommand
from hq.models import Hostel
from category.models import Category

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Automatically assign categories to hostels based on their room details and amenities.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Perform a dry run without actually updating any hostels.',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update categories even if hostels already have categories assigned.',
        )

    def handle(self, *args, **kwargs):
        dry_run = kwargs['dry_run']
        force = kwargs['force']
        
        self.stdout.write(self.style.SUCCESS('🏷️ Starting automatic category assignment...'))
        logger.info(f'Starting automatic category assignment (dry_run={dry_run}, force={force}).')

        # Get hostels to update
        if force:
            hostels_to_update = Hostel.objects.all()
            self.stdout.write('🔄 Force mode: Updating all hostels (including those with existing categories)')
        else:
            hostels_to_update = Hostel.objects.filter(category__isnull=True)
            self.stdout.write('📝 Normal mode: Updating only hostels without categories')

        if not hostels_to_update.exists():
            self.stdout.write(self.style.SUCCESS('✅ No hostels found to update.'))
            logger.info('No hostels found to update.')
            return

        self.stdout.write(f'📊 Found {hostels_to_update.count()} hostels to process:')

        updated_count = 0
        skipped_count = 0
        error_count = 0

        for hostel in hostels_to_update:
            try:
                # Get current category
                current_category = hostel.category.name if hostel.category else 'None'
                
                # Get auto-assigned category
                auto_category = hostel.get_auto_category()
                
                if auto_category:
                    new_category_name = auto_category.name
                    
                    if current_category == new_category_name:
                        self.stdout.write(f'   ⏭️  {hostel.name}: Already has correct category ({current_category})')
                        skipped_count += 1
                        continue
                    
                    if dry_run:
                        self.stdout.write(f'   🔍 {hostel.name}: Would change from "{current_category}" to "{new_category_name}"')
                        updated_count += 1
                    else:
                        hostel.category = auto_category
                        hostel.save(update_fields=['category'])
                        self.stdout.write(self.style.SUCCESS(f'   ✅ {hostel.name}: Updated to "{new_category_name}"'))
                        updated_count += 1
                        logger.info(f'Updated hostel {hostel.name} category to {new_category_name}.')
                else:
                    self.stdout.write(self.style.WARNING(f'   ⚠️  {hostel.name}: Could not determine category (no room details or error)'))
                    skipped_count += 1
                    
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'   ❌ {hostel.name}: Error - {e}'))
                error_count += 1
                logger.error(f'Error updating hostel {hostel.name}: {e}')

        # Summary
        if dry_run:
            self.stdout.write(self.style.WARNING(f'🔍 DRY RUN COMPLETE:'))
            self.stdout.write(f'   Would update: {updated_count} hostels')
            self.stdout.write(f'   Would skip: {skipped_count} hostels')
            self.stdout.write(f'   Errors: {error_count} hostels')
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ CATEGORY ASSIGNMENT COMPLETE:'))
            self.stdout.write(f'   Updated: {updated_count} hostels')
            self.stdout.write(f'   Skipped: {skipped_count} hostels')
            self.stdout.write(f'   Errors: {error_count} hostels')
        
        logger.info(f'Category assignment completed: updated={updated_count}, skipped={skipped_count}, errors={error_count} (dry_run={dry_run}).')
