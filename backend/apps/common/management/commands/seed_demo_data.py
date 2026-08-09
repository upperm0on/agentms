from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.agents.models import AgentDocument, AgentProfile, VerificationRequest
from apps.inquiries.models import Inquiry, InquiryStatusEvent
from apps.listings.models import Amenity, Listing, ListingImage, ListingRule, Property, SavedListing
from apps.locations.models import Area, Campus, Region
from apps.moderation.models import AuditLog, ListingReport, ModerationAction
from apps.notifications.models import Notification
from apps.payments.models import PaymentIntent


User = get_user_model()


class Command(BaseCommand):
    help = "Populate AgentMS with complete demo data for development and API testing."

    def handle(self, *args, **options):
        now = timezone.now()

        users = self.create_users()
        locations = self.create_locations()
        amenities = self.create_amenities()
        agents = self.create_agents(users, locations, now)
        properties = self.create_properties(users, locations, amenities)
        listings = self.create_listings(agents, properties, amenities, now)
        self.create_saved_listings(users, listings)
        inquiries = self.create_inquiries(users, agents, listings, now)
        reports = self.create_reports(users, listings, now)
        self.create_moderation(users, agents, listings, reports, now)
        self.create_notifications(users, now)
        self.create_payment_intents(users, listings)

        self.stdout.write(self.style.SUCCESS("AgentMS demo database populated."))

    def upsert_user(self, *, email, password, **fields):
        user, _created = User.objects.get_or_create(email=email, defaults=fields)
        for key, value in fields.items():
            setattr(user, key, value)
        user.set_password(password)
        user.save()
        return user

    def create_users(self):
        return {
            "student_esi": self.upsert_user(
                email="esi@knust.edu.gh",
                password="password123",
                first_name="Esi",
                last_name="Boateng",
                phone="+233 24 555 0182",
                role="student",
                is_email_verified=True,
                status="active",
                last_active_at=timezone.now(),
            ),
            "student_kwame": self.upsert_user(
                email="kwame@st.knust.edu.gh",
                password="password123",
                first_name="Kwame",
                last_name="Adu",
                phone="+233 55 901 1182",
                role="student",
                is_email_verified=True,
                status="active",
                last_active_at=timezone.now(),
            ),
            "student_akua": self.upsert_user(
                email="akua@ug.edu.gh",
                password="password123",
                first_name="Akua",
                last_name="Owusu",
                phone="+233 20 440 1290",
                role="student",
                is_email_verified=False,
                status="active",
                last_active_at=timezone.now(),
            ),
            "agent_ama": self.upsert_user(
                email="ama@campuskey.com",
                password="password123",
                first_name="Ama",
                last_name="Mensah",
                phone="+233 24 402 7188",
                role="agent",
                is_email_verified=True,
                status="active",
                last_active_at=timezone.now(),
            ),
            "agent_kojo": self.upsert_user(
                email="hello@kojorooms.com",
                password="password123",
                first_name="Kojo",
                last_name="Asare",
                phone="+233 55 231 9094",
                role="agent",
                is_email_verified=True,
                status="active",
                last_active_at=timezone.now(),
            ),
            "agent_nana": self.upsert_user(
                email="nana@lets.gh",
                password="password123",
                first_name="Nana",
                last_name="Osei",
                phone="+233 20 664 2281",
                role="agent",
                is_email_verified=True,
                status="suspended",
                last_active_at=timezone.now(),
            ),
            "admin": self.upsert_user(
                email="admin@agentms.local",
                password="password123",
                first_name="Kofi",
                last_name="Owusu",
                phone="+233 20 000 0000",
                role="admin",
                is_staff=True,
                is_superuser=True,
                is_email_verified=True,
                status="active",
                last_active_at=timezone.now(),
            ),
        }

    def create_locations(self):
        ashanti, _ = Region.objects.update_or_create(name="Ashanti", defaults={"is_active": True})
        greater_accra, _ = Region.objects.update_or_create(name="Greater Accra", defaults={"is_active": True})
        central, _ = Region.objects.update_or_create(name="Central", defaults={"is_active": True})

        knust, _ = Campus.objects.update_or_create(
            region=ashanti,
            name="KNUST",
            defaults={"abbreviation": "KNUST", "city": "Kumasi", "is_active": True},
        )
        ug, _ = Campus.objects.update_or_create(
            region=greater_accra,
            name="University of Ghana",
            defaults={"abbreviation": "UG", "city": "Accra", "is_active": True},
        )
        ucc, _ = Campus.objects.update_or_create(
            region=central,
            name="University of Cape Coast",
            defaults={"abbreviation": "UCC", "city": "Cape Coast", "is_active": True},
        )

        def area(campus, name):
            obj, _ = Area.objects.update_or_create(campus=campus, name=name, defaults={"is_active": True})
            return obj

        return {
            "ayeduase": area(knust, "Ayeduase"),
            "kotei": area(knust, "Kotei"),
            "bomso": area(knust, "Bomso"),
            "boadi": area(knust, "Boadi"),
            "east_legon": area(ug, "East Legon"),
            "amamoma": area(ucc, "Amamoma"),
        }

    def create_amenities(self):
        names = [
            "Wi-Fi",
            "Study desk",
            "Water tank",
            "Security",
            "Private bath",
            "Shuttle",
            "Kitchen",
            "Backup power",
            "Parking",
            "Air conditioning",
            "Study lounge",
            "Laundry",
            "Kitchenette",
        ]
        amenities = {}
        for name in names:
            amenities[name], _ = Amenity.objects.update_or_create(name=name, defaults={"is_active": True})
        return amenities

    def create_agents(self, users, locations, now):
        data = {
            "ama": {
                "user": users["agent_ama"],
                "display_name": "Ama Mensah",
                "business_name": "CampusKey Rooms",
                "bio": "Student accommodation agent serving KNUST and UG with current, personally checked room options.",
                "phone": "+233 24 402 7188",
                "whatsapp_number": "+233 24 402 7188",
                "profile_photo": "agents/profile_photos/ama-mensah.jpg",
                "verification_status": "verified",
                "verification_notes": "Ghana Card, business registration, and address evidence approved.",
                "response_rate": Decimal("92.00"),
                "listing_freshness_score": Decimal("88.00"),
                "areas": ["ayeduase", "kotei", "boadi", "east_legon"],
            },
            "kojo": {
                "user": users["agent_kojo"],
                "display_name": "Kojo Asare",
                "business_name": "Kojo Rooms",
                "bio": "Room finder working around KNUST and UCC with reliable caretaker contacts.",
                "phone": "+233 55 231 9094",
                "whatsapp_number": "+233 55 231 9094",
                "profile_photo": "agents/profile_photos/kojo-asare.jpg",
                "verification_status": "pending",
                "verification_notes": "Business registration still under review.",
                "response_rate": Decimal("81.00"),
                "listing_freshness_score": Decimal("74.00"),
                "areas": ["kotei", "amamoma"],
            },
            "nana": {
                "user": users["agent_nana"],
                "display_name": "Nana Osei",
                "business_name": "Nana Lets",
                "bio": "Independent accommodation agent in Kumasi with reports requiring admin review.",
                "phone": "+233 20 664 2281",
                "whatsapp_number": "+233 20 664 2281",
                "profile_photo": "agents/profile_photos/nana-osei.jpg",
                "verification_status": "suspended",
                "verification_notes": "Suspended pending stale listing investigation.",
                "response_rate": Decimal("67.00"),
                "listing_freshness_score": Decimal("43.00"),
                "areas": ["bomso"],
            },
        }
        agents = {}
        for key, values in data.items():
            area_keys = values.pop("areas")
            agent, _ = AgentProfile.objects.update_or_create(user=values["user"], defaults=values)
            agent.operating_areas.set([locations[item] for item in area_keys])
            agents[key] = agent
            for title in ["Ghana Card", "Proof of address", "Business registration"]:
                AgentDocument.objects.update_or_create(
                    agent=agent,
                    title=title,
                    defaults={
                        "file": f"agents/documents/{agent.business_name.lower().replace(' ', '-')}-{title.lower().replace(' ', '-')}.pdf",
                        "uploaded_by": agent.user,
                    },
                )
            VerificationRequest.objects.update_or_create(
                agent=agent,
                status="approved" if agent.verification_status == "verified" else "pending",
                defaults={
                    "submitted_notes": f"{agent.business_name} submitted identity and business evidence.",
                    "reviewer_notes": agent.verification_notes,
                    "reviewed_by": users["admin"] if agent.verification_status == "verified" else None,
                    "reviewed_at": now if agent.verification_status == "verified" else None,
                },
            )
        return agents

    def create_properties(self, users, locations, amenities):
        specs = {
            "unity": ("Unity Court", locations["ayeduase"], "Ayeduase High Street", "Near KNUST commercial area", "hostel", "mixed", ["Wi-Fi", "Water tank", "Security"]),
            "north_gate": ("North Gate Hostel", locations["kotei"], "Kotei Station Road", "Near shuttle stop", "hostel", "female", ["Private bath", "Shuttle", "Kitchen", "Backup power"]),
            "bomso": ("Bomso Residences", locations["bomso"], "Bomso main road", "Behind pharmacy", "apartment", "mixed", ["Kitchen", "Parking", "Water tank"]),
            "pentagon": ("Pentagon Annex", locations["east_legon"], "East Legon campus route", "UG shuttle route", "hostel", "mixed", ["Wi-Fi", "Air conditioning", "Study lounge", "Laundry"]),
            "cape": ("Cape Coast Studio", locations["amamoma"], "Amamoma Science Gate road", "Near UCC Science Gate", "apartment", "mixed", ["Kitchenette", "Private bath", "Water tank"]),
            "green": ("Green Court", locations["boadi"], "Boadi Junction", "Near taxi rank", "hostel", "male", ["Security", "Water tank", "Parking"]),
        }
        properties = {}
        for key, (name, area, address, landmark, property_type, gender_policy, amenity_names) in specs.items():
            prop, _ = Property.objects.update_or_create(
                area=area,
                name=name,
                defaults={
                    "address_text": address,
                    "landmark": landmark,
                    "property_type": property_type,
                    "gender_policy": gender_policy,
                    "created_by": users["agent_ama"],
                },
            )
            prop.amenities.set([amenities[name] for name in amenity_names])
            properties[key] = prop
        return properties

    def create_listings(self, agents, properties, amenities, now):
        specs = [
            ("sunlit", agents["ama"], properties["unity"], "Sunlit single room", "A quiet, furnished single room with reliable water and a short walk to the KNUST commercial area.", "published", "available", "approved", "single", "mixed", 1, 1, "4200.00", "academic_year", "500.00", "150.00", True, ["Wi-Fi", "Study desk", "Water tank", "Security"], "agent_verified", "Ama Mensah", 286, 18, ["No smoking", "Visitors until 9 PM"], "room-1.png"),
            ("kotei", agents["kojo"], properties["north_gate"], "Two-in-a-room at Kotei", "Bright shared room with private washroom, kitchen access and regular shuttle service to campus.", "published", "limited", "approved", "two_in_room", "female", 2, 1, "2850.00", "academic_year", "300.00", "120.00", False, ["Private bath", "Shuttle", "Kitchen", "Backup power"], "caretaker", "North Gate caretaker", 174, 11, ["Female residents only", "No pets"], "room-2.png"),
            ("chamber", agents["nana"], properties["bomso"], "Chamber and hall", "Self-contained chamber and hall for students who want more space and privacy.", "published", "available", "flagged", "apartment", "mixed", 2, 2, "6900.00", "year", "800.00", "200.00", True, ["Kitchen", "Parking", "Water tank"], "owner", "Property owner", 93, 4, ["One-year agreement", "Inspection before payment"], "room-3.png"),
            ("legon", agents["ama"], properties["pentagon"], "Affordable shared room", "Modern shared student room close to the UG shuttle route with shared study lounge.", "published", "available", "approved", "four_in_room", "mixed", 4, 2, "5100.00", "academic_year", "600.00", "180.00", False, ["Wi-Fi", "Air conditioning", "Study lounge", "Laundry"], "agent_verified", "Ama Mensah", 412, 29, ["Student ID required", "No overnight visitors"], "room-4.png"),
            ("ucc", agents["kojo"], properties["cape"], "Private studio near UCC", "Compact self-contained studio with kitchenette and easy transport to UCC Science Gate.", "published", "full", "approved", "studio", "mixed", 1, 0, "4800.00", "academic_year", "450.00", "150.00", False, ["Kitchenette", "Private bath", "Water tank"], "manager", "Cape Coast Studio manager", 207, 14, ["Quiet hours after 10 PM", "No subletting"], "room-5.jpeg"),
            ("boadi", agents["ama"], properties["green"], "Three-in-a-room at Boadi", "Budget shared room in a gated compound with a direct car route to KNUST.", "unpublished", "available", "pending", "three_in_room", "male", 3, 3, "2400.00", "academic_year", "250.00", "100.00", True, ["Security", "Water tank", "Parking"], "porter", "Green Court porter", 61, 2, ["Male residents only", "Keep compound gate locked"], "room-6.jpeg"),
        ]
        listings = {}
        for key, agent, prop, title, description, status, availability, moderation, room_type, gender, capacity, slots, price, period, deposit, fee, negotiable, amenity_names, source_type, source_name, views, inquiries, rules, image in specs:
            listing, _ = Listing.objects.update_or_create(
                agent=agent,
                property=prop,
                title=title,
                defaults={
                    "description": description,
                    "status": status,
                    "availability_status": availability,
                    "moderation_status": moderation,
                    "room_type": room_type,
                    "gender_restriction": gender,
                    "capacity": capacity,
                    "available_slots": slots,
                    "price_amount": Decimal(price),
                    "price_period": period,
                    "deposit_amount": Decimal(deposit),
                    "agent_fee_amount": Decimal(fee),
                    "negotiable": negotiable,
                    "source_type": source_type,
                    "source_name": source_name,
                    "last_confirmed_at": now,
                    "published_at": now if status == "published" else None,
                    "view_count": views,
                    "inquiry_count": inquiries,
                },
            )
            listing.amenities.set([amenities[name] for name in amenity_names])
            for index, rule in enumerate(rules):
                ListingRule.objects.update_or_create(listing=listing, text=rule, defaults={"sort_order": index})
            ListingImage.objects.update_or_create(
                listing=listing,
                caption=f"{title} cover image",
                defaults={
                    "image": f"listings/images/{image}",
                    "sort_order": 0,
                    "is_cover": True,
                    "uploaded_by": agent.user,
                },
            )
            listings[key] = listing
        return listings

    def create_saved_listings(self, users, listings):
        for listing in [listings["sunlit"], listings["legon"], listings["kotei"]]:
            SavedListing.objects.update_or_create(student=users["student_esi"], listing=listing)
        SavedListing.objects.update_or_create(student=users["student_kwame"], listing=listings["chamber"])

    def create_inquiries(self, users, agents, listings, now):
        specs = [
            ("esi-sunlit", users["student_esi"], listings["sunlit"], agents["ama"], "Is the room still available? I would like to visit this week.", "+233 24 555 0182", "whatsapp", "contacted", "Agent confirmed availability.", now),
            ("esi-legon", users["student_esi"], listings["legon"], agents["ama"], "Can I see the room on Wednesday morning?", "+233 24 555 0182", "phone", "viewing_scheduled", "Viewing scheduled for Wednesday.", now),
            ("kwame-chamber", users["student_kwame"], listings["chamber"], agents["nana"], "Is the annual price negotiable if I pay at once?", "+233 55 901 1182", "whatsapp", "negotiating", "Waiting for owner feedback.", now),
            ("akua-sunlit", users["student_akua"], listings["sunlit"], agents["ama"], "Please send the exact location and viewing times.", "+233 20 440 1290", "email", "new", "Needs first response.", now),
        ]
        inquiries = {}
        for key, student, listing, agent, message, phone, contact, inquiry_status, notes, follow_up in specs:
            inquiry, _ = Inquiry.objects.update_or_create(
                student=student,
                listing=listing,
                message=message,
                defaults={
                    "agent": agent,
                    "student_phone": phone,
                    "preferred_contact_method": contact,
                    "status": inquiry_status,
                    "agent_notes": notes,
                    "next_follow_up_at": follow_up,
                    "closed_at": None,
                },
            )
            InquiryStatusEvent.objects.update_or_create(
                inquiry=inquiry,
                to_status=inquiry_status,
                defaults={
                    "from_status": "new" if inquiry_status != "new" else "",
                    "note": notes,
                    "changed_by": agent.user,
                },
            )
            inquiries[key] = inquiry
        return inquiries

    def create_reports(self, users, listings, now):
        specs = [
            (listings["chamber"], users["student_kwame"], "wrong_price", "Agent quoted GHS 8,000 after the listing showed GHS 6,900.", "high", "open"),
            (listings["boadi"], users["student_esi"], "stale", "Caretaker says all rooms were taken last month.", "medium", "reviewing"),
        ]
        reports = []
        for listing, reporter, reason, details, severity, status in specs:
            report, _ = ListingReport.objects.update_or_create(
                listing=listing,
                reported_by=reporter,
                reason=reason,
                defaults={
                    "details": details,
                    "severity": severity,
                    "status": status,
                    "reviewed_by": users["admin"],
                    "reviewed_at": now,
                    "resolution_notes": "Admin review in progress.",
                },
            )
            reports.append(report)
        return reports

    def create_moderation(self, users, agents, listings, reports, now):
        for report in reports:
            ModerationAction.objects.update_or_create(
                actor=users["admin"],
                entity_type="report",
                entity_id=report.id,
                action=f"report_{report.status}",
                defaults={"note": report.resolution_notes, "metadata": {"severity": report.severity}},
            )
        ModerationAction.objects.update_or_create(
            actor=users["admin"],
            entity_type="agent",
            entity_id=agents["nana"].id,
            action="agent_suspended",
            defaults={"note": "Suspended pending report review.", "metadata": {"reason": "stale_inventory"}},
        )
        ModerationAction.objects.update_or_create(
            actor=users["admin"],
            entity_type="listing",
            entity_id=listings["chamber"].id,
            action="listing_flagged",
            defaults={"note": "Pricing mismatch report requires follow-up.", "metadata": {"report_count": 1}},
        )
        AuditLog.objects.update_or_create(
            actor=users["admin"],
            action="seed_demo_data",
            entity_type="system",
            defaults={"entity_id": None, "metadata": {"seeded_at": now.isoformat()}},
        )

    def create_notifications(self, users, now):
        specs = [
            (users["student_esi"], "student", "Viewing scheduled", "Ama scheduled a viewing for Affordable shared room.", "info", False, "/student/inquiries"),
            (users["student_esi"], "student", "Listing refreshed", "Sunlit single room was confirmed available today.", "success", False, "/listings"),
            (users["agent_ama"], "agent", "New inquiry", "Akua asked about Sunlit single room.", "warning", False, "/agent/inquiries"),
            (users["agent_ama"], "agent", "Availability due", "Three listings need a freshness check.", "danger", False, "/agent/listings"),
            (users["admin"], "admin", "High priority report", "A pricing report needs moderation.", "danger", False, "/admin/reports"),
        ]
        for recipient, audience, title, body, tone, is_read, link_url in specs:
            Notification.objects.filter(recipient=recipient, title=title).exclude(link_url=link_url).delete()
            Notification.objects.update_or_create(
                recipient=recipient,
                title=title,
                audience=audience,
                link_url=link_url,
                defaults={
                    "body": body,
                    "tone": tone,
                    "is_read": is_read,
                    "read_at": now if is_read else None,
                    "metadata": {"source": "seed_demo_data"},
                },
            )

    def create_payment_intents(self, users, listings):
        specs = [
            ("AGMS-DEMO-GUEST-001", None, "Guest Student", "guest@student.test", "+233 20 123 4567", listings["sunlit"], False),
            ("AGMS-DEMO-ESI-001", users["student_esi"], "Esi Boateng", "esi@knust.edu.gh", "+233 24 555 0182", listings["legon"], True),
        ]
        for reference, student, name, email, phone, listing, wants_history in specs:
            PaymentIntent.objects.update_or_create(
                provider_reference=reference,
                defaults={
                    "listing": listing,
                    "student": student,
                    "guest_name": name,
                    "guest_email": email,
                    "guest_phone": phone,
                    "amount": listing.deposit_amount or listing.price_amount,
                    "currency": "GHS",
                    "provider": "manual",
                    "status": "pending",
                    "wants_account_history": wants_history,
                    "metadata": {
                        "source": "seed_demo_data",
                        "auth_required": False,
                        "portal_history_requires_account": True,
                    },
                },
            )
