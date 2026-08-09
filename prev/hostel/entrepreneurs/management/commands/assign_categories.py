"""
Django management command to assign categories to products based on their name and description.
"""
from django.core.management.base import BaseCommand
from entrepreneurs.models import Commodity


class Command(BaseCommand):
    help = 'Assign categories to products based on their name and description'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be assigned without actually updating the database',
        )

    def assign_category(self, commodity):
        """Assign a category to a commodity based on its name and description."""
        # If already has a category, skip
        if commodity.category_slug:
            return commodity.category_slug
        
        # Get text to analyze
        name = (commodity.name or '').lower()
        description = (commodity.description or '').lower()
        text = f"{name} {description}"
        
        # Category keywords mapping (based on frontend categoryAssigner.js)
        category_keywords = {
            'electronics': [
                'electronics', 'laptop', 'phone', 'headphone', 'speaker', 'charger', 
                'cable', 'usb', 'wireless', 'bluetooth', 'tech', 'gadget', 'device', 
                'computer', 'tablet', 'keyboard', 'mouse', 'monitor', 'screen', 'tv', 
                'television', 'iphone', 'samsung', 'macbook', 'ipad', 'airpods', 
                'sony', 'dell', 'logitech', 'mechanical', 'ssd', 'external'
            ],
            'fashion': [
                'fashion', 'clothing', 'clothes', 'shirt', 'pants', 'jeans', 'dress', 
                'shoes', 'sneakers', 'hoodie', 'jacket', 'accessories', 'sunglasses', 
                'watch', 'jewelry', 'bag', 'backpack', 'designer', 'nike', 'adidas'
            ],
            'food': [
                'food', 'snack', 'drink', 'beverage', 'coffee', 'tea', 'meal', 
                'restaurant', 'delivery', 'cooking', 'recipe', 'groceries', 'fruit', 
                'vegetable', 'fridge', 'refrigerator', 'kettle', 'maker'
            ],
            'services': [
                'service', 'cleaning', 'tutoring', 'editing', 'installation', 'setup', 
                'delivery', 'pickup', 'moving', 'assistance', 'help', 'support', 
                'consultation', 'repair', 'replacement', 'photography', 'design', 
                'writing', 'thesis', 'essay', 'assignment', 'project', 'session'
            ],
            'books': [
                'book', 'textbook', 'study', 'material', 'supplies', 'stationery', 
                'pen', 'paper', 'notebook', 'notes', 'calculator', 'bundle', 'set'
            ],
            'furniture': [
                'furniture', 'chair', 'table', 'desk', 'bed', 'sofa', 'cabinet', 
                'shelf', 'bookshelf', 'lamp', 'lighting', 'mirror', 'stand', 'topper'
            ],
        }
        
        # Check each category
        for category_slug, keywords in category_keywords.items():
            if any(keyword in text for keyword in keywords):
                return category_slug
        
        # If it's a service type, default to services
        if commodity.type == 'service':
            return 'services'
        
        # Default fallback
        return 'electronics'  # Default category instead of 'all'

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all commodities without category
        commodities = Commodity.objects.filter(category_slug__isnull=True) | Commodity.objects.filter(category_slug='')
        total = commodities.count()
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('All products already have categories assigned.'))
            return
        
        self.stdout.write(f'Found {total} products without categories.')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Category assignment statistics
        category_stats = {}
        updated_count = 0
        
        for commodity in commodities:
            assigned_category = self.assign_category(commodity)
            
            if assigned_category:
                if not dry_run:
                    commodity.category_slug = assigned_category
                    commodity.save(update_fields=['category_slug'])
                
                category_stats[assigned_category] = category_stats.get(assigned_category, 0) + 1
                updated_count += 1
                
                if updated_count % 100 == 0:
                    self.stdout.write(f'Processed {updated_count}/{total} products...')
        
        # Print results
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully assigned categories to {updated_count} products'))
        self.stdout.write('\nCategory distribution:')
        for category, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / updated_count * 100) if updated_count > 0 else 0
            self.stdout.write(f'  {category}: {count} ({percentage:.1f}%)')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n⚠️  This was a dry run. Use without --dry-run to apply changes.'))

