#!/usr/bin/env python
"""
Generate market data (stores, commodities, entrepreneurs) for the marketplace app.
This script generates JSON fixture data that can be loaded into Django using loaddata.

Usage:
    python manage.py shell < generate_market_data.py
    OR
    python generate_market_data.py (if Django is properly configured)
"""

import os
import sys
import json
import random
from decimal import Decimal
from datetime import datetime
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel.settings.dev')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from django.contrib.auth.models import User
from consumers.models import Consumer
from entrepreneurs.models import Store, Commodity, Entrepreneur
from hq.models import Hostel

# Product and service categories for realistic data
PRODUCT_CATEGORIES = {
    'Electronics': [
        ('iPhone 13 Pro Max', '128GB, Space Gray, Excellent condition', 3500, 4500),
        ('Samsung Galaxy S21', '256GB, Phantom Black, Like new', 2800, 3500),
        ('MacBook Air M1', '8GB RAM, 256GB SSD, Perfect for students', 4500, 5500),
        ('iPad Pro 11"', '128GB, Wi-Fi, Great for note-taking', 3200, 4000),
        ('AirPods Pro', '2nd Generation, Noise Cancelling', 800, 1200),
        ('Sony WH-1000XM4', 'Wireless Noise Cancelling Headphones', 1200, 1800),
        ('Dell XPS 13', 'Intel i7, 16GB RAM, 512GB SSD', 5000, 6500),
        ('Logitech MX Master 3', 'Wireless Mouse, Ergonomic Design', 400, 600),
        ('Mechanical Keyboard', 'RGB Backlit, Cherry MX Switches', 300, 500),
        ('External SSD 1TB', 'USB-C, Fast Transfer Speeds', 500, 800),
    ],
    'Furniture': [
        ('Study Desk', 'Wooden desk with drawers, Perfect for dorm', 200, 400),
        ('Office Chair', 'Ergonomic, Adjustable height, Comfortable', 300, 600),
        ('Bookshelf', '5-tier bookshelf, Easy assembly', 150, 300),
        ('Bedside Table', 'Compact nightstand with drawer', 100, 200),
        ('Storage Box', 'Plastic storage box with lid, 50L', 50, 100),
        ('Mattress Topper', 'Memory foam, 2-inch thickness', 200, 350),
        ('Desk Lamp', 'LED lamp with adjustable brightness', 80, 150),
        ('Wall Mirror', 'Full-length mirror, 60x180cm', 120, 250),
    ],
    'Clothing & Accessories': [
        ('Designer Jeans', 'Brand new, Multiple sizes available', 150, 300),
        ('Sneakers', 'Nike/Adidas, Various sizes, Good condition', 200, 400),
        ('Backpack', 'Laptop backpack, Waterproof, Multiple pockets', 150, 300),
        ('Watch', 'Smartwatch, Fitness tracking, Water resistant', 300, 600),
        ('Sunglasses', 'Ray-Ban style, UV protection', 100, 200),
        ('Hoodie', 'Branded hoodie, Comfortable, Various colors', 80, 150),
    ],
    'Books & Supplies': [
        ('Textbook Bundle', 'Complete set for current semester', 300, 600),
        ('Scientific Calculator', 'TI-84 Plus, Graphing calculator', 200, 350),
        ('Notebook Set', '5-pack, College ruled, 200 pages each', 50, 100),
        ('Pen Set', 'Premium pens, Multiple colors', 30, 60),
        ('Laptop Stand', 'Adjustable aluminum stand', 100, 200),
    ],
    'Food & Beverages': [
        ('Snack Care Package', 'Variety pack of snacks and drinks', 50, 100),
        ('Coffee Maker', 'Drip coffee maker, 12 cups', 150, 300),
        ('Mini Fridge', 'Compact refrigerator, 50L capacity', 400, 700),
        ('Electric Kettle', 'Stainless steel, Auto shut-off', 80, 150),
    ],
}

SERVICE_CATEGORIES = {
    'Academic Services': [
        ('Essay Writing Service', 'Professional essay writing, Any subject, Fast turnaround', 50, 200),
        ('Assignment Help', 'Complete assignment solutions, Guaranteed quality', 30, 150),
        ('Thesis Editing', 'Professional thesis editing and proofreading', 100, 300),
        ('Research Paper Writing', 'Custom research papers, Properly cited', 80, 250),
        ('Tutoring Session', 'One-on-one tutoring, All subjects available', 40, 100),
        ('Exam Preparation', 'Comprehensive exam prep sessions', 60, 150),
        ('Project Assistance', 'Help with coding projects and assignments', 50, 200),
    ],
    'Design & Creative': [
        ('Logo Design', 'Professional logo design, Multiple revisions', 100, 300),
        ('Graphic Design', 'Flyers, posters, social media graphics', 50, 200),
        ('Video Editing', 'Professional video editing services', 80, 250),
        ('Photography', 'Event photography, Portrait sessions', 150, 400),
        ('Web Design', 'Custom website design and development', 200, 500),
        ('Branding Package', 'Complete branding solution', 300, 800),
    ],
    'Tech Services': [
        ('Laptop Repair', 'Fast laptop repair service, All brands', 100, 300),
        ('Phone Screen Replacement', 'Quick screen replacement, Warranty included', 150, 400),
        ('Software Installation', 'OS installation, Software setup', 50, 150),
        ('Data Recovery', 'Recover lost files and data', 100, 300),
        ('PC Building Service', 'Custom PC building and setup', 200, 500),
        ('Network Setup', 'WiFi setup, Network configuration', 80, 200),
    ],
    'Personal Services': [
        ('Haircut & Styling', 'Professional haircut and styling', 30, 80),
        ('Laundry Service', 'Wash, dry, and fold service', 20, 50),
        ('Cleaning Service', 'Room cleaning, Deep cleaning available', 50, 150),
        ('Cooking Service', 'Meal prep and cooking services', 40, 120),
        ('Personal Shopping', 'Shopping assistance and delivery', 30, 80),
        ('Fitness Training', 'Personal training sessions', 50, 150),
    ],
    'Delivery & Logistics': [
        ('Food Delivery', 'Fast food delivery from restaurants', 15, 40),
        ('Grocery Shopping', 'Grocery shopping and delivery', 25, 60),
        ('Package Pickup', 'Package pickup and delivery service', 20, 50),
        ('Moving Assistance', 'Help with moving and relocation', 100, 300),
    ],
}

STORE_NAMES = [
    'TechHub Electronics', 'Campus Gadgets', 'Student Essentials', 'Digital Solutions',
    'Smart Devices Co', 'Electronics Plus', 'Tech Corner', 'Gadget Zone',
    'Study Supplies Pro', 'Academic Helpers', 'Bookworm Supplies', 'Campus Books',
    'Design Studio', 'Creative Solutions', 'Art & Design Hub', 'Visual Creations',
    'Fix It Fast', 'Tech Repair Center', 'Device Doctors', 'Repair Experts',
    'Campus Services', 'Student Services Hub', 'Convenience Plus', 'Quick Services',
    'Food Express', 'Campus Eats', 'Snack Central', 'Meal Solutions',
    'Fashion Forward', 'Style Hub', 'Campus Wear', 'Trendy Threads',
    'Home Essentials', 'Dorm Decor', 'Furniture Plus', 'Living Spaces',
    'Academic Tutors', 'Study Support', 'Learning Hub', 'Education Services',
]

STORE_DESCRIPTIONS = [
    'Your one-stop shop for all electronics and tech needs on campus.',
    'Quality products at affordable prices for students.',
    'Professional services delivered with a student-friendly approach.',
    'Serving the campus community with reliable products and services.',
    'Student-owned business committed to great prices and service.',
    'Everything you need for campus life, all in one place.',
    'Fast, reliable, and affordable solutions for students.',
    'Your trusted partner for academic and personal needs.',
    'Quality products and services tailored for student life.',
    'Making campus life easier with convenient products and services.',
]

LOCATIONS = ['KNUST', 'UG', 'UCC', 'UEW', 'UENR', 'Campus', 'Main Campus', 'North Campus', 'South Campus']


def get_users_with_hostels():
    """Get users who have Consumer records with hostels."""
    try:
        consumers = Consumer.objects.filter(
            hostel__isnull=False,
            user__isnull=False
        ).select_related('user', 'hostel', 'hostel__campus')
        
        users = []
        seen_user_ids = set()
        
        for consumer in consumers:
            if consumer.user_id and consumer.user_id not in seen_user_ids:
                location = None
                if consumer.hostel and consumer.hostel.campus:
                    location = consumer.hostel.campus.campus
                
                users.append({
                    'id': consumer.user_id,
                    'user': consumer.user,
                    'hostel': consumer.hostel,
                    'location': location
                })
                seen_user_ids.add(consumer.user_id)
        
        return users
    except Exception as e:
        print(f"⚠️  Error fetching users with hostels: {e}")
        return []


def generate_store_data(num_stores=40):
    """Generate store data."""
    stores = []
    for i in range(num_stores):
        store_name = random.choice(STORE_NAMES)
        # Ensure unique store names
        if any(s['fields']['name'] == store_name for s in stores):
            store_name = f"{store_name} {i+1}"
        
        now = timezone.now().isoformat()
        stores.append({
            'model': 'entrepreneurs.store',
            'pk': i + 1,
            'fields': {
                'name': store_name,
                'description': random.choice(STORE_DESCRIPTIONS),
                'location': random.choice(LOCATIONS),
                'created_at': now,
                'updated_at': now,
            }
        })
    return stores


def generate_commodity_data(stores, users_with_hostels):
    """Generate commodity data (products and services) for each store."""
    commodities = []
    commodity_pk = 1
    
    for store in stores:
        store_pk = store['pk']
        num_commodities = random.randint(15, 25)
        
        # Mix of products and services (60% products, 40% services)
        num_products = int(num_commodities * 0.6)
        num_services = num_commodities - num_products
        
        # Generate products
        product_categories = list(PRODUCT_CATEGORIES.keys())
        for _ in range(num_products):
            category = random.choice(product_categories)
            product_list = PRODUCT_CATEGORIES[category]
            name, description, min_price, max_price = random.choice(product_list)
            
            # Ensure unique product names per store
            base_name = name
            counter = 1
            while any(c['fields']['name'] == name and c['fields']['store'] == store_pk for c in commodities):
                name = f"{base_name} {counter}"
                counter += 1
            
            now = timezone.now().isoformat()
            commodities.append({
                'model': 'entrepreneurs.commodity',
                'pk': commodity_pk,
                'fields': {
                    'store': store_pk,
                    'name': name,
                    'description': description,
                    'type': 'product',
                    'price': str(Decimal(random.randint(int(min_price), int(max_price)))),
                    'created_at': now,
                    'updated_at': now,
                }
            })
            commodity_pk += 1
        
        # Generate services
        service_categories = list(SERVICE_CATEGORIES.keys())
        for _ in range(num_services):
            category = random.choice(service_categories)
            service_list = SERVICE_CATEGORIES[category]
            name, description, min_price, max_price = random.choice(service_list)
            
            # Ensure unique service names per store
            base_name = name
            counter = 1
            while any(c['fields']['name'] == name and c['fields']['store'] == store_pk for c in commodities):
                name = f"{base_name} {counter}"
                counter += 1
            
            now = timezone.now().isoformat()
            commodities.append({
                'model': 'entrepreneurs.commodity',
                'pk': commodity_pk,
                'fields': {
                    'store': store_pk,
                    'name': name,
                    'description': description,
                    'type': 'service',
                    'price': str(Decimal(random.randint(int(min_price), int(max_price)))),
                    'created_at': now,
                    'updated_at': now,
                }
            })
            commodity_pk += 1
    
    return commodities


def generate_entrepreneur_data(stores, users_with_hostels):
    """Generate entrepreneur data linking users to stores."""
    entrepreneurs = []
    entrepreneur_pk = 1
    
    # Shuffle users to randomly assign to stores
    available_users = users_with_hostels.copy()
    random.shuffle(available_users)
    
    # Assign at least one user per store, cycling through users if needed
    user_index = 0
    for store in stores:
        if not available_users:
            # If we run out of users, we can skip or create without user
            # For now, let's cycle through users
            available_users = users_with_hostels.copy()
            random.shuffle(available_users)
            user_index = 0
        
        user_data = available_users[user_index % len(available_users)]
        user_index += 1
        
        now = timezone.now().isoformat()
        entrepreneurs.append({
            'model': 'entrepreneurs.entrepreneur',
            'pk': entrepreneur_pk,
            'fields': {
                'user': user_data['id'],
                'store': store['pk'],
                'location': user_data['location'] or store['fields']['location'],
                'created_at': now,
                'updated_at': now,
            }
        })
        entrepreneur_pk += 1
    
    return entrepreneurs


def main():
    """Main function to generate all market data."""
    print("🚀 Starting market data generation...")
    
    # Get users with hostels
    print("📋 Fetching users with hostels...")
    users_with_hostels = get_users_with_hostels()
    
    if not users_with_hostels:
        print("⚠️  Warning: No users with hostels found.")
        print("   Attempting to use any available users...")
        # Try to get any users from the database
        try:
            any_users = User.objects.all()[:40]
            if any_users:
                users_with_hostels = [
                    {'id': user.id, 'user': user, 'hostel': None, 'location': random.choice(LOCATIONS)}
                    for user in any_users
                ]
                print(f"✅ Using {len(users_with_hostels)} available users")
            else:
                print("❌ No users found in database. Please create users first.")
                print("   The fixture will be generated but entrepreneurs will need manual user assignment.")
                users_with_hostels = [{'id': 1, 'user': None, 'hostel': None, 'location': 'KNUST'}]
        except Exception as e:
            print(f"⚠️  Error fetching users: {e}")
            users_with_hostels = [{'id': 1, 'user': None, 'hostel': None, 'location': 'KNUST'}]
    else:
        print(f"✅ Found {len(users_with_hostels)} users with hostels")
    
    # Generate stores
    print("🏪 Generating 40 stores...")
    stores = generate_store_data(40)
    print(f"✅ Generated {len(stores)} stores")
    
    # Generate commodities
    print("📦 Generating commodities (15-25 per store)...")
    commodities = generate_commodity_data(stores, users_with_hostels)
    print(f"✅ Generated {len(commodities)} commodities")
    
    # Generate entrepreneurs
    print("👤 Generating entrepreneurs...")
    entrepreneurs = generate_entrepreneur_data(stores, users_with_hostels)
    print(f"✅ Generated {len(entrepreneurs)} entrepreneurs")
    
    # Combine all data
    all_data = stores + commodities + entrepreneurs
    
    # Write to JSON file
    output_file = 'market_fixtures.json'
    print(f"💾 Writing data to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully generated market data!")
    print(f"📊 Summary:")
    print(f"   - Stores: {len(stores)}")
    print(f"   - Commodities: {len(commodities)}")
    print(f"   - Entrepreneurs: {len(entrepreneurs)}")
    print(f"   - Total records: {len(all_data)}")
    print(f"\n📝 To load this data into Django, run:")
    print(f"   python manage.py loaddata {output_file}")


if __name__ == '__main__':
    main()

