from django.db import models
from managers.models import Manager
from category.models import Category
from location.models import Location
import json


class Hostel(models.Model): 
    name = models.CharField(max_length=50)
    campus = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)
    
    status_choices = [
        ('Available', 'Available'),
        ('Unavailable', 'Unavailable'),
    ]
    
    ratings = models.DecimalField(decimal_places=1, max_digits=10, blank=True, null=True)
    status = models.CharField(choices=status_choices, default="Available", max_length=50)
    additional_details = models.JSONField(null=True, blank=True)
    room_details = models.JSONField(null=True, blank=True)
    image = models.ImageField(upload_to='media/', blank=True, null=True)
    manager = models.ForeignKey(Manager, on_delete=models.CASCADE, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    gender_type = models.CharField(max_length=20, blank=True, null=True)  
    checkout = models.DateTimeField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    accepts_bookings = models.BooleanField(default=True, help_text="Whether this hostel accepts direct bookings (Book button) or only reservations")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """
        1. Ensure every room in room_details has 'room_available': true
        2. Automatically set gender_type based on room_details
        """
        if self.room_details:
            # Convert JSON string to Python object if needed
            if isinstance(self.room_details, str):
                try:
                    rooms = json.loads(self.room_details)
                except json.JSONDecodeError:
                    rooms = []
            else:
                rooms = self.room_details

            # Preserve existing UUIDs where possible (immutability)
            old_uuid_map = {}
            if self.pk:
                try:
                    existing = Hostel.objects.get(pk=self.pk)
                    prev_rooms = existing.room_details
                    if isinstance(prev_rooms, str):
                        prev_rooms = json.loads(prev_rooms)
                    if isinstance(prev_rooms, list):
                        for prev in prev_rooms:
                            prev_uuid = prev.get('uuid')
                            # Build a deterministic key to match rooms across edits
                            key = (
                                str(prev.get('label')),
                                str(prev.get('number_in_room')),
                                str(prev.get('number_of_rooms')),
                                str(prev.get('price')),
                            )
                            if prev_uuid:
                                old_uuid_map[key] = prev_uuid
                except Hostel.DoesNotExist:
                    pass

            # Loop through each room and add room_available/uuid if missing
            import uuid as _uuid
            changed = False
            for room in rooms:
                if 'room_available' not in room:
                    room['room_available'] = True
                    changed = True
                # Ensure each room has a stable UUID identifier (immutable)
                if not room.get('uuid'):
                    # Try to reuse previous UUID by matching deterministic key
                    key = (
                        str(room.get('label')),
                        str(room.get('number_in_room')),
                        str(room.get('number_of_rooms')),
                        str(room.get('price')),
                    )
                    prev_uuid = old_uuid_map.get(key)
                    if prev_uuid:
                        room['uuid'] = prev_uuid
                    else:
                        room['uuid'] = str(_uuid.uuid4())
                    changed = True

            # Assign the updated rooms list back to room_details
            if changed:
                self.room_details = rooms

        # Automatically set gender_type
        self.gender_type = self.get_gender_type()

        # Automatically assign category if not already set
        if not self.category:
            auto_category = self.get_auto_category()
            if auto_category:
                self.category = auto_category

        super().save(*args, **kwargs)

    def get_gender_type(self):
        """
        Determine gender_type based on room_details.
        Returns 'male', 'female', 'mixed', or None.
        """
        if not self.room_details:
            return None

        try:
            # Handle if room_details is a string
            rooms = self.room_details
            if isinstance(rooms, str):
                rooms = json.loads(rooms)

            genders = set()
            for room in rooms:
                gender_keys = room.get('gender', {}).keys()
                genders.update(gender_keys)

            if genders == {'male'}:
                return 'male'
            elif genders == {'female'}:
                return 'female'
            elif 'male' in genders and 'female' in genders:
                return 'mixed'
            else:
                return None
        except Exception:
            return None

    def get_auto_category(self):
        """
        Automatically determine the best category based on hostel details.
        Returns a Category object or None.
        """
        if not self.room_details:
            return None

        try:
            # Handle if room_details is a string
            rooms = self.room_details
            if isinstance(rooms, str):
                rooms = json.loads(rooms)

            if not rooms:
                return None

            # Analyze room characteristics
            total_capacity = 0
            single_rooms = 0
            shared_rooms = 0
            dormitory_rooms = 0
            studio_rooms = 0
            luxury_amenities = 0
            eco_amenities = 0
            business_amenities = 0
            family_amenities = 0
            avg_price = 0
            price_count = 0

            # Define amenity categories
            luxury_amenity_keywords = ['air conditioning', 'swimming pool', 'gym', 'spa', 'concierge', 'room service']
            eco_amenity_keywords = ['solar', 'recycling', 'organic', 'green', 'sustainable', 'eco-friendly']
            business_amenity_keywords = ['business center', 'conference', 'meeting', 'wifi', 'desk', 'printer']
            family_amenity_keywords = ['family', 'children', 'playground', 'kitchen', 'laundry']

            for room in rooms:
                # Count room types
                label = room.get('label', '').lower()
                number_in_room = int(room.get('number_in_room', 0))
                number_of_rooms = int(room.get('number_of_rooms', 0))
                room_capacity = number_in_room * number_of_rooms
                total_capacity += room_capacity

                # Categorize room types
                if 'single' in label or number_in_room == 1:
                    single_rooms += room_capacity
                elif 'studio' in label:
                    studio_rooms += room_capacity
                elif 'dormitory' in label or number_in_room >= 6:
                    dormitory_rooms += room_capacity
                else:
                    shared_rooms += room_capacity

                # Analyze amenities
                amenities = room.get('amenities', [])
                for amenity in amenities:
                    amenity_lower = amenity.lower()
                    if any(keyword in amenity_lower for keyword in luxury_amenity_keywords):
                        luxury_amenities += 1
                    if any(keyword in amenity_lower for keyword in eco_amenity_keywords):
                        eco_amenities += 1
                    if any(keyword in amenity_lower for keyword in business_amenity_keywords):
                        business_amenities += 1
                    if any(keyword in amenity_lower for keyword in family_amenity_keywords):
                        family_amenities += 1

                # Calculate average price
                try:
                    price = float(room.get('price', 0))
                    if price > 0:
                        avg_price += price
                        price_count += 1
                except (ValueError, TypeError):
                    pass

            if price_count > 0:
                avg_price = avg_price / price_count

            # Decision logic for category assignment
            # Priority order: Luxury > Eco-Friendly > Business > Family > Modern > Premium > Budget
            
            # Luxury Hostels: High-end amenities and high prices
            if luxury_amenities >= 3 and avg_price > 2000:
                return Category.objects.filter(name='Luxury Hostels').first()
            
            # Eco-Friendly Hostels: Environmental amenities
            elif eco_amenities >= 2:
                return Category.objects.filter(name='Eco-Friendly Hostels').first()
            
            # Business Hostels: Business-focused amenities
            elif business_amenities >= 3:
                return Category.objects.filter(name='Business Hostels').first()
            
            # Family Hostels: Family-oriented amenities
            elif family_amenities >= 2:
                return Category.objects.filter(name='Family Hostels').first()
            
            # Modern Hostels: Good amenities and reasonable prices
            elif luxury_amenities >= 2 and avg_price > 1500:
                return Category.objects.filter(name='Modern Hostels').first()
            
            # Premium Hostels: Above average amenities and prices
            elif luxury_amenities >= 1 and avg_price > 1200:
                return Category.objects.filter(name='Premium Hostels').first()
            
            # Private Rooms: Mostly single rooms and studios
            elif single_rooms + studio_rooms >= total_capacity * 0.7:
                return Category.objects.filter(name='Private Rooms').first()
            
            # Shared Accommodation: Mix of shared rooms
            elif shared_rooms >= total_capacity * 0.5:
                return Category.objects.filter(name='Shared Accommodation').first()
            
            # Student Housing: Dormitory-style or budget-friendly
            elif dormitory_rooms >= total_capacity * 0.4 or avg_price < 1000:
                return Category.objects.filter(name='Student Housing').first()
            
            # Budget Hostels: Low prices and basic amenities
            elif avg_price < 800:
                return Category.objects.filter(name='Budget Hostels').first()
            
            # Default fallback
            else:
                return Category.objects.filter(name='Modern Hostels').first()

        except Exception as e:
            print(f"Error in get_auto_category: {e}")
            return None


# Helper to keep room and hostel availability in sync
import json as _json
from django.apps import apps as _apps

def update_room_and_hostel_availability(hostel_id: int) -> None:
    """
    Recompute per-room availability (room_available) and overall hostel availability
    based on active Consumer entries.

    - Room capacity = number_in_room * number_of_rooms
    - Current count = Consumer.objects.filter(hostel=hostel, room_uuid=room['uuid'], is_active=True).count()
    - room_available = current_count < capacity
    - Hostel is available if any room_available is True

    Writes results back into Hostel.room_details and updates Hostel.status (and
    Hostel.is_available if the field exists).
    """
    try:
        hostel = Hostel.objects.get(id=hostel_id)
    except Hostel.DoesNotExist:
        return

    rooms = hostel.room_details
    if not rooms:
        # No rooms -> mark hostel unavailable
        fields = []
        if getattr(hostel, 'is_available', None) is not None:
            if hostel.is_available is not False:
                hostel.is_available = False
                fields.append('is_available')
        if hostel.status != 'Unavailable':
            hostel.status = 'Unavailable'
            fields.append('status')
        if fields:
            hostel.save(update_fields=fields)
        return

    # Normalize rooms to list[dict]
    try:
        if isinstance(rooms, str):
            rooms = _json.loads(rooms)
    except Exception:
        rooms = []

    Consumer = _apps.get_model('consumers', 'Consumer')

    any_available = False
    updated_rooms = []

    import uuid as _uuid
    for room in rooms or []:
        # Support both explicit id and index-based fallbacks
        try:
            room_id = int(room.get('id')) if room.get('id') is not None else None
        except (TypeError, ValueError):
            room_id = None

        # Ensure each room has a stable UUID
        room_uuid = room.get('uuid') or None
        if not room_uuid:
            room_uuid = str(_uuid.uuid4())
            # assign but continue computing availability
            room['uuid'] = room_uuid

        try:
            number_in_room = int(str(room.get('number_in_room', 0) or 0))
        except (TypeError, ValueError):
            number_in_room = 0
        try:
            number_of_rooms = int(str(room.get('number_of_rooms', 0) or 0))
        except (TypeError, ValueError):
            number_of_rooms = 0

        capacity = number_in_room * number_of_rooms

        # If no explicit id, we cannot correlate reliably; mark unavailable when capacity invalid
        if room_uuid:
            occupants = Consumer.objects.filter(
                hostel=hostel,
                room_uuid=room_uuid,
                is_active=True
            ).count()
        elif room_id is not None:
            occupants = Consumer.objects.filter(
                hostel=hostel,
                room_id=room_id,
                is_active=True
            ).count()
        else:
            occupants = 0

        room_available = (occupants < capacity) if capacity > 0 else False
        any_available = any_available or room_available

        new_room = dict(room)
        new_room['room_available'] = room_available
        new_room['current_occupants'] = occupants
        new_room['capacity'] = capacity
        if new_room.get('id') is None:
            # keep structure consistent, but avoid forcing an id when not provided
            pass
        new_room['uuid'] = room_uuid
        updated_rooms.append(new_room)

    # Persist updates
    fields_to_update = []
    if updated_rooms != (rooms or []):
        hostel.room_details = updated_rooms
        fields_to_update.append('room_details')

    new_is_available = any_available
    if getattr(hostel, 'is_available', None) is not None and hostel.is_available != new_is_available:
        hostel.is_available = new_is_available
        fields_to_update.append('is_available')

    new_status = 'Available' if any_available else 'Unavailable'
    if hostel.status != new_status:
        hostel.status = new_status
        fields_to_update.append('status')

    if fields_to_update:
        hostel.save(update_fields=fields_to_update)
