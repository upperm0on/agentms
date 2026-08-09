import os
import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from faker import Faker
from django.contrib.auth.models import User
from hq.models import Hostel
from category.models import Category
from managers.models import Manager
from location.models import Location

fake = Faker()

class Command(BaseCommand):
    help = 'Seed the database with 100 hostels and 100 managers (1-to-1)'

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Starting hostel seeding process...")

        image_dir = 'media/hostel_images/'
        image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

        if not image_files:
            self.stdout.write(self.style.WARNING("⚠️ No images found in 'media/hostel_images/'. Skipping image assignment."))

        # 1. Create Campuses
        campuses = ['KNUST', 'UG', 'UCC', 'UEW', 'UENR']
        location_objs = [Location.objects.get_or_create(name=campus)[0] for campus in campuses]

        # 2. Create Categories
        categories = ['Affordable', 'Premium', 'Executive']
        category_objs = [Category.objects.get_or_create(name=name)[0] for name in categories]

        # 3. Create 100 Managers and 100 Hostels (1-to-1)
        statuses = ['Available', 'Full', 'Under Maintenance']
        gender_types = ['Male', 'Female', 'Unisex']

        for i in range(100):
            # Create user
            username = f"manager_{i}"
            user, _ = User.objects.get_or_create(username=username)
            user.set_password('password123')
            user.email = fake.email()
            user.save()

            # Create manager
            manager, _ = Manager.objects.get_or_create(user=user)

            # Create hostel
            hostel = Hostel.objects.create(
                name=f"{fake.last_name()} {random.choice(['Lodge', 'Heights', 'Hostel', 'Residency'])}",
                rating=round(random.uniform(3.0, 5.0), 1),
                status=random.choice(statuses),
                gender_type=random.choice(gender_types),
                manager=manager,
                category=random.choice(category_objs),
                location=random.choice(location_objs),
                room_details=fake.paragraph(nb_sentences=3),
                additional_details=fake.text(max_nb_chars=200),
                checkout=timezone.now() + timedelta(days=random.randint(1, 30))
            )

            if image_files:
                hostel.image = os.path.join('hostel_images', random.choice(image_files))
                hostel.save()

            self.stdout.write(self.style.SUCCESS(f"✅ Created hostel: {hostel.name} (Manager: {username})"))

        self.stdout.write(self.style.SUCCESS("🎉 100 hostels and 100 managers created (1-to-1 relationship)."))
