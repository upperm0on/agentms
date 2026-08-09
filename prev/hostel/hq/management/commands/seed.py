import os
import random
import json
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from faker import Faker
from pathlib import Path
from django.core.files import File

from hq.models import Hostel
from category.models import Category
from managers.models import Manager
from location.models import Location

fake = Faker()

class Command(BaseCommand):
    help = 'Seed the database with 100 realistic hostels and dependencies'

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Starting hostel seeding process...")

        # Resolve base media directory
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        media_dir = project_root / 'media'

        # Load all available image files
        image_files = [f for f in media_dir.iterdir() if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png']]
        if not image_files:
            self.stdout.write(self.style.WARNING("⚠️ No images found in /media. Hostels will be created without images."))

        # 1. Create campuses
        campus_names = ['KNUST', 'UG', 'UCC', 'UEW', 'UENR']
        campuses = []
        for name in campus_names:
            campus, _ = Location.objects.get_or_create(
                campus=name,
                defaults={'abreviation': name[:4], 'region': fake.state()}
            )
            campuses.append(campus)

        # 2. Create categories
        category_names = ['Single Room', 'Executive Room', 'Shared Room']
        categories = []
        for name in category_names:
            category, _ = Category.objects.get_or_create(name=name)
            categories.append(category)

        # 3. Create 100 managers and 100 hostels
        for i in range(100):
            username = f"manager_{i}"
            email = f"{username}@example.com"

            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': email, 'password': 'pbkdf2_sha256$260000$testpasswordhash'}
            )
            manager, _ = Manager.objects.get_or_create(user=user)

            # Room details structure
            room_details = []
            for _ in range(random.randint(2, 4)):  # 2–4 types of rooms
                gender_choice = random.choice(["males", "females", "mixed"])
                room_detail = {
                    "number_in_room": random.choice(["1", "2", "3", "4"]),
                    "price": str(random.randint(1500, 5000)),
                    "number_of_rooms": str(random.randint(5, 20)),
                    "room_image": [],
                    "amenities": random.sample(
                        ["Fan", "Study Table", "Wardrobe", "Private Toilet", "AC", "Wi-Fi", "Fridge"],
                        k=random.randint(2, 4)
                    ),
                }

                # Handle gender
                if gender_choice == "mixed":
                    males = random.randint(2, 10)
                    females = random.randint(2, 10)
                    room_detail["gender"] = {"male": str(males), "female": str(females)}
                elif gender_choice == "males":
                    room_detail["gender"] = {"male": str(random.randint(5, 15))}
                else:
                    room_detail["gender"] = {"female": str(random.randint(5, 15))}

                room_details.append(room_detail)

            # Additional details
            additional_info = random.sample([
                "24/7 Security",
                "Close to lecture halls",
                "Quiet environment",
                "Free utilities included",
                "Regular water supply",
                "CCTV Monitoring",
                "Night lighting in corridors"
            ], k=random.randint(2, 4))

            hostel = Hostel.objects.create(
                name=fake.company() + " Hostel",
                ratings=round(random.uniform(3.0, 5.0), 1),
                status=random.choice(['Available', 'Full', 'Under Maintenance']),
                gender_type=random.choice(['Male', 'Female', 'Unisex']),
                room_details=json.dumps(room_details),
                additional_details=json.dumps(additional_info),
                campus=random.choice(campuses),
                category=random.choice(categories),
                manager=manager,
                checkout=fake.future_datetime(end_date="+30d", tzinfo=timezone.get_current_timezone())
            )

            # Attach image
            if image_files:
                chosen_image = random.choice(image_files)
                with open(chosen_image, 'rb') as img_file:
                    hostel.image.save(chosen_image.name, File(img_file), save=True)

            self.stdout.write(self.style.SUCCESS(f"✅ Created hostel: {hostel.name}"))

        self.stdout.write(self.style.SUCCESS("🎉 100 hostels created with campuses, categories, managers, and images."))
