import shutil
from collections import defaultdict
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from apps.agents.models import AgentProfile
from apps.listings.models import Amenity, Listing, ListingImage, ListingRule, Property
from apps.locations.models import Area, Campus, Region


User = get_user_model()

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".jfif", ".png", ".webp"}

AGENT_SPECS = [
    ("Adwoa", "Agyemang", "Adwoa Campus Homes", "+233 24 710 0101"),
    ("Kwaku", "Frimpong", "Frimpong Student Rooms", "+233 24 710 0102"),
    ("Abena", "Sarpong", "Abena Hostel Connect", "+233 24 710 0103"),
    ("Yaw", "Antwi", "Antwi Campus Lets", "+233 24 710 0104"),
    ("Akosua", "Nyarko", "Nyarko Room Hub", "+233 24 710 0105"),
    ("Kwabena", "Acheampong", "Acheampong Hostel Services", "+233 24 710 0106"),
    ("Efua", "Bonsu", "Bonsu Student Living", "+233 24 710 0107"),
    ("Kojo", "Ampofo", "Ampofo Campus Rooms", "+233 24 710 0108"),
    ("Ama", "Danso", "Danso Hostel Finder", "+233 24 710 0109"),
    ("Nana", "Opoku", "Opoku Student Homes", "+233 24 710 0110"),
]

AREA_SPECS = [
    ("Ashanti", "KNUST", "KNUST", "Kumasi", "Ayeduase"),
    ("Ashanti", "KNUST", "KNUST", "Kumasi", "Kotei"),
    ("Ashanti", "KNUST", "KNUST", "Kumasi", "Bomso"),
    ("Ashanti", "KNUST", "KNUST", "Kumasi", "Boadi"),
    ("Ashanti", "KNUST", "KNUST", "Kumasi", "Ayigya"),
    ("Greater Accra", "University of Ghana", "UG", "Accra", "East Legon"),
    ("Greater Accra", "University of Ghana", "UG", "Accra", "Legon"),
    ("Greater Accra", "University of Ghana", "UG", "Accra", "Atomic"),
    ("Central", "University of Cape Coast", "UCC", "Cape Coast", "Amamoma"),
    ("Central", "University of Cape Coast", "UCC", "Cape Coast", "Kwaprow"),
]

AMENITY_SETS = [
    ("Wi-Fi", "Security", "Water tank", "Study desk"),
    ("Private bath", "Kitchen", "Backup power", "Laundry"),
    ("CCTV", "Parking", "Wardrobe", "Prepaid electricity"),
    ("Common room", "Hot water", "On-site caretaker", "Study lounge"),
    ("Balcony", "Tiled floor", "Generator", "Kitchenette"),
]

RULE_SETS = [
    ("Student ID required", "Quiet hours after 10 PM"),
    ("No smoking", "Visitors until 9 PM"),
    ("Keep the compound gate locked", "No subletting"),
    ("Caretaker check-in required", "No pets"),
]

HOSTEL_NAME_OVERRIDES = {
    "Testing another Theroy": "Theoria Student Lodge",
    "davio": "Davio Hostel",
    "first_hostel": "First Choice Hostel",
    "hoste7": "Hostel Seven",
    "Hostel 1": "Hostel One North",
    "Hostel one": "Hostel One Annex",
    "hostel 1": "Hostel One South",
    "know hostel": "Know Hostel",
    "latest Hostel": "Legacy Heights",
    "presentation hostel": "Presentation Hostel",
    "Prestige Hostel": "Prestige Hall",
    "prestige hostel": "Prestige Annex",
    "test": "Testimony Hostel",
    "Test Hostel": "Testimony Court",
    "tu17": "TU 17 Residence",
    "tu20": "TU 20 Residence",
    "updated test hostel": "Updated Court",
}


class Command(BaseCommand):
    help = (
        "Seed 10 agents and 46 room listings from the legacy hostel room_images library. "
        "The command is additive and safe to rerun."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--source-dir",
            type=Path,
            default=settings.BASE_DIR.parent / "prev" / "hostel" / "media" / "room_images",
            help="Legacy room_images directory (defaults to prev/hostel/media/room_images).",
        )

    def handle(self, *args, **options):
        source_dir = options["source_dir"].expanduser().resolve()
        room_groups = self.discover_room_groups(source_dir)
        assignments = self.assign_hostels_to_agents(room_groups)

        room_counts = [sum(len(room_groups[name]) for name in hostels) for hostels in assignments]
        if len(room_groups) != 31 or sum(room_counts) != 46 or not all(4 <= count <= 6 for count in room_counts):
            raise CommandError(
                "Expected the legacy library to produce 31 hostels and 46 rooms, "
                f"but found {len(room_groups)} hostels and {sum(room_counts)} rooms."
            )

        with transaction.atomic():
            areas = self.create_locations()
            amenities = self.create_amenities()
            agents = self.create_agents(areas)
            listing_count, image_count = self.create_inventory(
                source_dir=source_dir,
                room_groups=room_groups,
                assignments=assignments,
                agents=agents,
                areas=areas,
                amenities=amenities,
            )

        distribution = ", ".join(str(count) for count in room_counts)
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded 10 agents, {listing_count} rooms, and {image_count} images "
                f"(rooms per agent: {distribution})."
            )
        )

    def discover_room_groups(self, source_dir):
        if not source_dir.is_dir():
            raise CommandError(f"Legacy room image directory does not exist: {source_dir}")

        room_groups = defaultdict(lambda: defaultdict(list))
        for source in sorted(path for path in source_dir.rglob("*") if path.is_file()):
            # Some legacy JPEG names contain a URL query suffix, so inspect the
            # portion before '?' rather than relying on Path.suffix alone.
            extension = Path(source.name.split("?", 1)[0]).suffix.lower()
            if extension not in IMAGE_EXTENSIONS:
                continue
            relative = source.relative_to(source_dir)
            if len(relative.parts) < 3:
                continue
            hostel_name, room_label = relative.parts[0], relative.parts[1]
            room_groups[hostel_name][room_label].append(source)

        return {
            hostel_name: {
                room_label: sorted(images)
                for room_label, images in sorted(rooms.items(), key=lambda item: self.room_sort_key(item[0]))
            }
            for hostel_name, rooms in sorted(room_groups.items(), key=lambda item: item[0].casefold())
        }

    @staticmethod
    def room_sort_key(room_label):
        try:
            return 0, int(room_label)
        except ValueError:
            return 1, room_label.casefold()

    @staticmethod
    def assign_hostels_to_agents(room_groups):
        """Keep each hostel with one agent while balancing the room totals."""
        assignments = [[] for _ in AGENT_SPECS]
        loads = [0 for _ in AGENT_SPECS]
        ordered_hostels = sorted(
            room_groups,
            key=lambda name: (-len(room_groups[name]), name.casefold()),
        )
        for hostel_name in ordered_hostels:
            agent_index = min(range(len(loads)), key=lambda index: (loads[index], index))
            assignments[agent_index].append(hostel_name)
            loads[agent_index] += len(room_groups[hostel_name])
        return assignments

    @staticmethod
    def create_locations():
        areas = []
        for region_name, campus_name, abbreviation, city, area_name in AREA_SPECS:
            region, _ = Region.objects.update_or_create(name=region_name, defaults={"is_active": True})
            campus, _ = Campus.objects.update_or_create(
                region=region,
                name=campus_name,
                defaults={"abbreviation": abbreviation, "city": city, "is_active": True},
            )
            area, _ = Area.objects.update_or_create(
                campus=campus,
                name=area_name,
                defaults={"is_active": True},
            )
            areas.append(area)
        return areas

    @staticmethod
    def create_amenities():
        amenities = {}
        for name in sorted({name for amenity_set in AMENITY_SETS for name in amenity_set}):
            amenities[name], _ = Amenity.objects.update_or_create(name=name, defaults={"is_active": True})
        return amenities

    def create_agents(self, areas):
        now = timezone.now()
        agents = []
        for index, (first_name, last_name, business_name, phone) in enumerate(AGENT_SPECS, start=1):
            email = f"legacy-agent-{index:02d}@agentms.local"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "phone": phone,
                    "role": "agent",
                    "is_email_verified": True,
                    "status": "active",
                    "last_active_at": now,
                },
            )
            user.first_name = first_name
            user.last_name = last_name
            user.phone = phone
            user.role = "agent"
            user.is_email_verified = True
            user.status = "active"
            user.last_active_at = now
            if created:
                user.set_password("password123")
            user.save()

            area = areas[index - 1]
            agent, _ = AgentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "display_name": f"{first_name} {last_name}",
                    "business_name": business_name,
                    "bio": (
                        f"Verified student accommodation agent covering {area.name} and nearby "
                        f"{area.campus.abbreviation or area.campus.name} hostels."
                    ),
                    "phone": phone,
                    "whatsapp_number": phone,
                    "verification_status": "verified",
                    "verification_notes": "Legacy room inventory seed profile.",
                    "response_rate": Decimal(82 + index),
                    "listing_freshness_score": Decimal(78 + (index * 2)),
                },
            )
            agent.operating_areas.set([area])
            agents.append(agent)
        return agents

    def create_inventory(self, *, source_dir, room_groups, assignments, agents, areas, amenities):
        now = timezone.now()
        listing_count = 0
        image_count = 0
        global_room_index = 0

        for agent_index, hostel_names in enumerate(assignments):
            agent = agents[agent_index]
            area = areas[agent_index]
            for hostel_name in sorted(hostel_names, key=str.casefold):
                display_name = HOSTEL_NAME_OVERRIDES.get(hostel_name, hostel_name.replace("_", " ").title())
                amenity_names = AMENITY_SETS[global_room_index % len(AMENITY_SETS)]
                gender = ("mixed", "female", "male")[global_room_index % 3]
                prop, _ = Property.objects.update_or_create(
                    area=area,
                    name=display_name,
                    defaults={
                        "address_text": f"{area.name} student residential area",
                        "landmark": f"Near the {area.campus.abbreviation or area.campus.name} campus route",
                        "property_type": "hostel",
                        "gender_policy": gender,
                        "created_by": agent.user,
                    },
                )
                prop.amenities.set([amenities[name] for name in amenity_names])

                for room_label, image_sources in room_groups[hostel_name].items():
                    capacity, room_type = self.room_details(room_label)
                    availability, available_slots = self.availability(global_room_index, capacity)
                    room_name = self.room_name(room_label, room_type)
                    title = f"{room_name} at {display_name}"
                    price = Decimal(2200 + ((global_room_index * 325) % 6100))
                    listing, _ = Listing.objects.update_or_create(
                        agent=agent,
                        property=prop,
                        title=title,
                        defaults={
                            "description": (
                                f"{room_name} in {display_name}, {area.name}, with "
                                f"{', '.join(name.lower() for name in amenity_names)}. "
                                "Photos are drawn from the legacy hostel room inventory."
                            ),
                            "status": "published",
                            "availability_status": availability,
                            "moderation_status": "approved",
                            "room_type": room_type,
                            "gender_restriction": gender,
                            "capacity": capacity,
                            "available_slots": available_slots,
                            "price_amount": price,
                            "price_period": "academic_year",
                            "deposit_amount": (price * Decimal("0.10")).quantize(Decimal("0.01")),
                            "agent_fee_amount": Decimal("0.00"),
                            "negotiable": global_room_index % 3 == 0,
                            "source_type": "agent_verified",
                            "source_name": agent.display_name,
                            "last_confirmed_at": now - timedelta(days=global_room_index % 10),
                            "published_at": now - timedelta(days=10 + (global_room_index % 25)),
                            "view_count": 60 + ((global_room_index * 43) % 480),
                            "inquiry_count": 2 + ((global_room_index * 7) % 30),
                        },
                    )
                    listing.amenities.set([amenities[name] for name in amenity_names])
                    for rule_index, rule in enumerate(RULE_SETS[global_room_index % len(RULE_SETS)]):
                        ListingRule.objects.update_or_create(
                            listing=listing,
                            text=rule,
                            defaults={"sort_order": rule_index},
                        )

                    image_count += self.sync_images(
                        source_dir=source_dir,
                        listing=listing,
                        uploaded_by=agent.user,
                        image_sources=image_sources,
                        caption=title,
                    )
                    listing_count += 1
                    global_room_index += 1

        return listing_count, image_count

    @staticmethod
    def room_details(room_label):
        try:
            number_in_room = int(room_label)
        except ValueError:
            number_in_room = 2
        if number_in_room <= 1:
            return 1, "single"
        if number_in_room == 2:
            return 2, "two_in_room"
        if number_in_room == 3:
            return 3, "three_in_room"
        if number_in_room == 4:
            return 4, "four_in_room"
        return min(number_in_room, 8), "dormitory"

    @staticmethod
    def room_name(room_label, room_type):
        if room_type == "dormitory":
            return f"Dormitory room (legacy group {room_label})"
        labels = {
            "single": "Single room",
            "two_in_room": "Two-in-a-room",
            "three_in_room": "Three-in-a-room",
            "four_in_room": "Four-in-a-room",
        }
        return labels[room_type]

    @staticmethod
    def availability(index, capacity):
        if index % 11 == 0:
            return "full", 0
        if index % 7 == 0:
            return "limited", max(1, capacity // 2)
        return "available", capacity

    @staticmethod
    def sync_images(*, source_dir, listing, uploaded_by, image_sources, caption):
        media_root = Path(settings.MEDIA_ROOT)
        target_root = media_root / "listings" / "legacy_rooms"
        relative_room_dir = image_sources[0].parent.relative_to(source_dir)
        target_dir = target_root / slugify(relative_room_dir.parts[0]) / slugify(relative_room_dir.parts[1])
        target_dir.mkdir(parents=True, exist_ok=True)

        for sort_order, source in enumerate(image_sources):
            original_name = source.name.split("?", 1)[0]
            extension = Path(original_name).suffix.lower()
            target_name = f"{sort_order + 1:02d}-{slugify(Path(original_name).stem) or 'room'}{extension}"
            target = target_dir / target_name
            shutil.copyfile(source, target)
            relative_target = target.relative_to(media_root).as_posix()
            ListingImage.objects.update_or_create(
                listing=listing,
                sort_order=sort_order,
                defaults={
                    "image": relative_target,
                    "caption": f"{caption} photo {sort_order + 1}",
                    "is_cover": sort_order == 0,
                    "uploaded_by": uploaded_by,
                },
            )
        return len(image_sources)
