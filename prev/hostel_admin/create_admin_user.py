#!/usr/bin/env python3
"""
Script to create an admin superuser for the admin panel
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
from django.contrib.auth.hashers import make_password

def create_admin_user():
    """Create an admin superuser"""
    
    # Admin credentials
    email = "admin@gmail.com"
    password = "password"
    username = "admin"
    
    try:
        # Create or get superuser
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'first_name': 'Admin',
                'last_name': 'User',
                'password': make_password(password),
                'is_active': True,
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        if created:
            print(f"✅ Created admin superuser: {email}")
        else:
            # Update existing user to be superuser
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            print(f"✅ Updated user to admin superuser: {email}")
        
        print(f"\n🎯 Admin Credentials:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Username: {username}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"\n📝 Use these credentials to login to the admin panel!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")

if __name__ == "__main__":
    create_admin_user()
