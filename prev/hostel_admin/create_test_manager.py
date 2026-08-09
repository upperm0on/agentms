#!/usr/bin/env python3
"""
Script to create a test manager user for the admin panel
Run this in your Django project directory
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/home/barimah/projects/hostel')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hostel.settings')
django.setup()

from django.contrib.auth.models import User
from managers.models import Manager
from django.contrib.auth.hashers import make_password

def create_test_manager():
    """Create a test manager user"""
    
    # Test credentials
    email = "admin@test.com"
    password = "admin123"
    username = "admin_test"
    
    try:
        # Create or get user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'first_name': 'Admin',
                'last_name': 'Test',
                'password': make_password(password),
                'is_active': True,
                'is_staff': False,
                'is_superuser': False
            }
        )
        
        if created:
            print(f"✅ Created user: {email}")
        else:
            print(f"ℹ️  User already exists: {email}")
        
        # Create manager record
        manager, created = Manager.objects.get_or_create(user=user)
        
        if created:
            print(f"✅ Created manager record for: {email}")
        else:
            print(f"ℹ️  Manager record already exists for: {email}")
        
        print(f"\n🎯 Test Credentials:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Username: {username}")
        print(f"\n📝 Use these credentials to login to the admin panel!")
        
    except Exception as e:
        print(f"❌ Error creating test manager: {e}")

if __name__ == "__main__":
    create_test_manager()
