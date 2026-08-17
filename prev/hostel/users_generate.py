import json
import random
from faker import Faker

faker = Faker()

# General and room amenities
general_amenities_pool = [
    'Study room', 'CCTV', '24/7 water supply', 'Security post', 'Laundry area',
    'TV room', 'WiFi', 'Generator', 'Ironing bay', 'Parking space'
]

room_amenities_pool = [
    'Fan', 'Tiled floor', 'Private bath', 'Study desk', 'Curtains', 'Wardrobe',
    'Ceiling light', 'Reading lamp', 'Power socket', 'Window netting'
]

hostel_fixtures = []

for i in range(1, 101):
    room_type_counts = random.sample(range(1, 6), k=random.randint(2, 4))  # unique number_in_room values
    rooms = []

    for room_type in room_type_counts:
        gender_choice = random.choice(["males", "females", "mixed"])
        number_of_rooms = random.randint(5, 20)

        gender_obj = {}
        if gender_choice == "mixed":
            male = number_of_rooms // 2
            female = number_of_rooms - male
            gender_obj = {"gender": {"male": str(male), "female": str(female)}}
        elif gender_choice == "males":
            gender_obj = {"gender": {"male": str(number_of_rooms)}}
        else:
            gender_obj = {"gender": {"female": str(number_of_rooms)}}

        room = {
            "number_in_room": str(room_type),
            "price": str(random.randint(800, 2000)),
            "number_of_rooms": str(number_of_rooms),
            "room_image": [],
            "amenities": json.dumps(random.sample(room_amenities_pool, k=random.randint(2, 5))),
            **gender_obj
        }

        rooms.append(room)

    hostel_fixtures.append({
        "model": "hq.hostel",
        "pk": i,
        "fields": {
            "name": f"{faker.word().capitalize()} {faker.word().capitalize()} Hostel",
            "campus": random.randint(1, 25),
            "category": None,
            "image": None,
            # Remove "status" here if you're setting it manually
            "status": "Available",
            "ratings": None,
            "additional_details": json.dumps(random.sample(general_amenities_pool, k=random.randint(2, 5))),
            "room_details": json.dumps(rooms),
            "manager": i,
            "checkout": None
        }
    })

with open("hostel_fixtures.json", "w") as f:
    json.dump(hostel_fixtures, f, indent=4)
