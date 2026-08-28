from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.agents.models import AgentProfile
from apps.inquiries.models import Inquiry, InquiryStatus
from apps.listings.models import Amenity, AvailabilityStatus, Listing, ListingStatus, PricePeriod, Property, RoomType
from apps.locations.models import Area, Campus, Region
from apps.moderation.models import AuditLog, ListingReport, ModerationAction
from apps.notifications.models import Notification


User = get_user_model()


class AgentMSAPITestCase(APITestCase):
    def setUp(self):
        self.region = Region.objects.create(name="Ashanti", is_active=True)
        self.campus = Campus.objects.create(
            region=self.region,
            name="KNUST",
            abbreviation="KNUST",
            city="Kumasi",
            is_active=True,
        )
        self.area = Area.objects.create(campus=self.campus, name="Ayeduase", is_active=True)
        self.amenity = Amenity.objects.create(name="Wi-Fi", is_active=True)

        self.student = User.objects.create_user(
            email="esi@knust.edu.gh",
            password="password123",
            first_name="Esi",
            last_name="Boateng",
            phone="+233245550182",
            role="student",
            is_email_verified=True,
        )
        self.agent_user = User.objects.create_user(
            email="ama@campuskey.test",
            password="password123",
            first_name="Ama",
            last_name="Mensah",
            phone="+233244027188",
            role="agent",
            is_email_verified=True,
        )
        self.admin = User.objects.create_superuser(
            email="admin@agentms.test",
            password="password123",
            first_name="Admin",
            last_name="User",
            phone="+233200000000",
            role="admin",
            is_email_verified=True,
        )
        self.agent = AgentProfile.objects.create(
            user=self.agent_user,
            display_name="Ama Mensah",
            business_name="CampusKey Rooms",
            bio="Verified accommodation agent around KNUST.",
            phone="+233244027188",
            whatsapp_number="+233244027188",
            profile_photo="agents/profile_photos/ama.jpg",
            verification_status="verified",
            verification_notes="Approved test agent.",
            response_rate=92,
            listing_freshness_score=88,
        )
        self.agent.operating_areas.add(self.area)
        self.other_agent_user = User.objects.create_user(
            email="kojo@rooms.test",
            password="password123",
            first_name="Kojo",
            last_name="Asare",
            phone="+233552319094",
            role="agent",
            is_email_verified=True,
        )
        self.other_agent = AgentProfile.objects.create(
            user=self.other_agent_user,
            display_name="Kojo Asare",
            business_name="Kojo Rooms",
            bio="Another accommodation agent.",
            phone="+233552319094",
            whatsapp_number="+233552319094",
            profile_photo="agents/profile_photos/kojo.jpg",
            verification_status="verified",
            verification_notes="Approved test agent.",
            response_rate=81,
            listing_freshness_score=74,
        )
        self.other_agent.operating_areas.add(self.area)
        self.property = Property.objects.create(
            name="Unity Court",
            area=self.area,
            address_text="Ayeduase High Street",
            landmark="Near KNUST commercial area",
            property_type="hostel",
            gender_policy="mixed",
            created_by=self.agent_user,
        )
        self.property.amenities.add(self.amenity)
        self.listing = Listing.objects.create(
            agent=self.agent,
            property=self.property,
            title="Sunlit single room",
            description="A quiet, furnished single room with reliable water.",
            status=ListingStatus.PUBLISHED,
            availability_status=AvailabilityStatus.AVAILABLE,
            moderation_status="approved",
            room_type=RoomType.SINGLE,
            gender_restriction="mixed",
            capacity=1,
            available_slots=1,
            price_amount=4200,
            price_period=PricePeriod.ACADEMIC_YEAR,
            deposit_amount=500,
            agent_fee_amount=150,
            negotiable=True,
            source_type="agent_verified",
            source_name="Ama Mensah",
            last_confirmed_at=timezone.now(),
            published_at=timezone.now(),
            view_count=12,
            inquiry_count=0,
        )
        self.listing.amenities.add(self.amenity)

    def test_register_creates_user(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new@student.test",
                "password": "password123",
                "first_name": "New",
                "last_name": "Student",
                "phone": "+233201111111",
                "role": "student",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="new@student.test").exists())

    def test_public_listing_list_returns_location_and_agent_data(self):
        response = self.client.get("/api/listings/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item = response.data["results"][0]
        self.assertEqual(item["title"], "Sunlit single room")
        self.assertEqual(item["campus_name"], "KNUST")
        self.assertEqual(item["area_name"], "Ayeduase")
        self.assertEqual(item["agent_detail"]["business_name"], "CampusKey Rooms")

    def test_public_listing_list_applies_discovery_filters_and_popular_ordering(self):
        Listing.objects.create(
            agent=self.agent,
            property=self.property,
            title="Affordable shared room",
            description="Shared room near Ayeduase market.",
            status=ListingStatus.PUBLISHED,
            availability_status=AvailabilityStatus.LIMITED,
            moderation_status="approved",
            room_type=RoomType.SHARED,
            gender_restriction="mixed",
            capacity=2,
            available_slots=1,
            price_amount=2800,
            price_period=PricePeriod.ACADEMIC_YEAR,
            source_type="agent_verified",
            last_confirmed_at=timezone.now(),
            published_at=timezone.now(),
            view_count=300,
            inquiry_count=12,
        )

        response = self.client.get(
            "/api/listings/",
            {
                "q": "Ayeduase",
                "availability": "limited",
                "room_type": "shared",
                "min_price": "2500",
                "max_price": "3000",
                "ordering": "popular",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item["title"] for item in response.data["results"]]
        self.assertEqual(titles, ["Affordable shared room"])

    def test_student_can_create_listing_inquiry(self):
        self.client.force_authenticate(self.student)

        response = self.client.post(
            f"/api/inquiries/listings/{self.listing.id}/",
            {
                "message": "Is the room still available?",
                "student_phone": "+233245550182",
                "preferred_contact_method": "whatsapp",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Inquiry.objects.count(), 1)
        self.assertEqual(Inquiry.objects.get().agent, self.agent)
        self.assertEqual(Notification.objects.filter(recipient=self.agent_user, audience="agent").count(), 1)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.inquiry_count, 1)

    def test_agent_can_transition_owned_inquiry(self):
        inquiry = Inquiry.objects.create(
            student=self.student,
            listing=self.listing,
            agent=self.agent,
            message="Please send viewing times.",
            student_phone="+233245550182",
            preferred_contact_method="phone",
        )
        self.client.force_authenticate(self.agent_user)

        response = self.client.patch(
            f"/api/inquiries/agent/{inquiry.id}/",
            {"status": InquiryStatus.CONTACTED, "agent_notes": "Called student."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inquiry.refresh_from_db()
        self.assertEqual(inquiry.status, InquiryStatus.CONTACTED)
        self.assertEqual(inquiry.status_events.count(), 1)
        self.assertEqual(Notification.objects.filter(recipient=self.student, audience="student").count(), 1)

    def test_admin_can_moderate_listing_and_update_report(self):
        report = ListingReport.objects.create(
            listing=self.listing,
            reported_by=self.student,
            reason="wrong_price",
            details="Agent quoted a different price.",
            severity="high",
            status="open",
        )
        self.client.force_authenticate(self.admin)

        listing_response = self.client.patch(
            f"/api/admin/listings/{self.listing.id}/moderation/",
            {"moderation_status": "flagged", "note": "Needs price review."},
            format="json",
        )
        report_response = self.client.patch(
            f"/api/admin/reports/{report.id}/",
            {"status": "reviewing", "resolution_notes": "Contacting agent."},
            format="json",
        )

        self.assertEqual(listing_response.status_code, status.HTTP_200_OK)
        self.assertEqual(report_response.status_code, status.HTTP_200_OK)
        self.listing.refresh_from_db()
        report.refresh_from_db()
        self.assertEqual(self.listing.moderation_status, "flagged")
        self.assertEqual(report.status, "reviewing")
        self.assertGreaterEqual(ModerationAction.objects.count(), 2)

    def test_student_cannot_create_listing(self):
        self.client.force_authenticate(self.student)

        response = self.client.post(
            "/api/listings/",
            {
                "property": str(self.property.id),
                "title": "Student owned listing",
                "description": "This should not be allowed.",
                "availability_status": "available",
                "moderation_status": "pending",
                "room_type": "single",
                "gender_restriction": "mixed",
                "capacity": 1,
                "available_slots": 1,
                "price_amount": "2000.00",
                "price_period": "academic_year",
                "source_type": "unknown",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_agent_cannot_mutate_another_agents_listing(self):
        self.client.force_authenticate(self.other_agent_user)

        response = self.client.post(f"/api/listings/{self.listing.id}/unpublish/", {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.status, ListingStatus.PUBLISHED)

    def test_agent_cannot_create_student_inquiry(self):
        self.client.force_authenticate(self.agent_user)

        response = self.client.post(
            f"/api/inquiries/listings/{self.listing.id}/",
            {
                "message": "Agents should not create student inquiries.",
                "student_phone": "+233244027188",
                "preferred_contact_method": "phone",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Inquiry.objects.count(), 0)

    def test_student_cannot_access_admin_moderation(self):
        self.client.force_authenticate(self.student)

        response = self.client.patch(
            f"/api/admin/listings/{self.listing.id}/moderation/",
            {"moderation_status": "flagged", "note": "Student attempt."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.moderation_status, "approved")

    def test_public_listing_list_hides_unapproved_or_unpublished(self):
        Listing.objects.create(
            agent=self.agent,
            property=self.property,
            title="Flagged listing",
            description="This listing is not public.",
            status=ListingStatus.PUBLISHED,
            availability_status=AvailabilityStatus.AVAILABLE,
            moderation_status="flagged",
            room_type=RoomType.SINGLE,
            gender_restriction="mixed",
            capacity=1,
            available_slots=1,
            price_amount=3000,
            price_period=PricePeriod.ACADEMIC_YEAR,
            source_type="agent_verified",
        )

        response = self.client.get("/api/listings/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [item["title"] for item in response.data["results"]]
        self.assertEqual(titles, ["Sunlit single room"])

    def test_admin_listing_moderation_persists_state_note_and_audit(self):
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/admin/listings/{self.listing.id}/moderation/",
            {
                "moderation_status": "flagged",
                "listing_status": "unpublished",
                "note": "The price needs confirmation.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.moderation_status, "flagged")
        self.assertEqual(self.listing.status, ListingStatus.UNPUBLISHED)
        self.assertTrue(
            ModerationAction.objects.filter(
                entity_id=self.listing.id,
                note="The price needs confirmation.",
            ).exists()
        )
        self.assertTrue(AuditLog.objects.filter(action="listing_moderation_update", entity_id=self.listing.id).exists())

    def test_admin_can_suspend_and_reactivate_user(self):
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": self.student.email, "password": "password123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        initial_me = self.client.get("/api/auth/me/")
        self.assertEqual(initial_me.status_code, status.HTTP_200_OK)

        admin_client = self.client_class()
        admin_client.force_authenticate(self.admin)

        suspend_response = admin_client.patch(
            f"/api/admin/users/{self.student.id}/status/",
            {"status": "suspended"},
            format="json",
        )
        suspended_me = self.client.get("/api/auth/me/")
        reactivate_response = admin_client.patch(
            f"/api/admin/users/{self.student.id}/status/",
            {"status": "active"},
            format="json",
        )

        self.assertEqual(suspend_response.status_code, status.HTTP_200_OK)
        self.assertEqual(suspended_me.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(reactivate_response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.status, "active")
        self.assertEqual(AuditLog.objects.filter(action="user_status_update", entity_id=self.student.id).count(), 2)

    def test_admin_cannot_suspend_own_account(self):
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/admin/users/{self.admin.id}/status/",
            {"status": "suspended"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.status, "active")

    def test_admin_can_create_edit_and_archive_location(self):
        self.client.force_authenticate(self.admin)
        create_response = self.client.post(
            "/api/admin/locations/",
            {
                "campus": "University of Ghana",
                "abbreviation": "UG",
                "city": "Accra",
                "area": "Legon",
                "region": "Greater Accra",
                "active": True,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        location_id = create_response.data["id"]
        update_response = self.client.patch(
            f"/api/admin/locations/{location_id}/",
            {
                "campus": "University of Ghana",
                "abbreviation": "UG",
                "city": "Accra",
                "area": "East Legon",
                "region": "Greater Accra",
                "active": False,
            },
            format="json",
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        area = Area.objects.get(pk=location_id)
        self.assertEqual(area.name, "East Legon")
        self.assertFalse(area.is_active)
        admin_list = self.client.get("/api/admin/locations/")
        public_list = self.client.get("/api/locations/areas/")
        self.assertIn(location_id, [str(item["id"]) for item in admin_list.data["results"]])
        self.assertNotIn(location_id, [str(item["id"]) for item in public_list.data["results"]])

    def test_admin_can_inspect_inquiries_but_student_cannot_use_admin_endpoint(self):
        Inquiry.objects.create(
            student=self.student,
            listing=self.listing,
            agent=self.agent,
            message="Can I view this room tomorrow?",
            student_phone=self.student.phone,
            preferred_contact_method="whatsapp",
        )
        self.client.force_authenticate(self.admin)
        admin_response = self.client.get("/api/admin/inquiries/")
        self.client.force_authenticate(self.student)
        student_response = self.client.get("/api/admin/inquiries/")

        self.assertEqual(admin_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_response.data["count"], 1)
        self.assertEqual(admin_response.data["results"][0]["student_detail"]["email"], self.student.email)
        self.assertEqual(student_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_profile_persists_primary_campus_from_reference_data(self):
        self.client.force_authenticate(self.student)

        response = self.client.patch(
            "/api/auth/me/",
            {
                "phone": "+233200000111",
                "whatsapp_number": "+233200000222",
                "primary_campus": str(self.campus.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.primary_campus, self.campus)
        self.assertEqual(self.student.whatsapp_number, "+233200000222")
        self.assertEqual(response.data["primary_campus_detail"]["name"], "KNUST")

    def test_agent_profile_accepts_active_admin_areas_and_rejects_archived_ones(self):
        archived_area = Area.objects.create(campus=self.campus, name="Bomso", is_active=False)
        self.client.force_authenticate(self.agent_user)

        accepted = self.client.patch(
            "/api/agents/me/",
            {"operating_areas": [str(self.area.id)]},
            format="json",
        )
        rejected = self.client.patch(
            "/api/agents/me/",
            {"operating_areas": [str(archived_area.id)]},
            format="json",
        )

        self.assertEqual(accepted.status_code, status.HTTP_200_OK)
        self.assertEqual(rejected.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(list(self.agent.operating_areas.values_list("id", flat=True)), [self.area.id])

    def test_admin_campus_rename_propagates_to_students_agents_and_listings(self):
        self.student.primary_campus = self.campus
        self.student.save(update_fields=["primary_campus", "updated_at"])
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/admin/locations/{self.area.id}/",
            {"campus": "Kwame Nkrumah University of Science and Technology"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.agent.refresh_from_db()
        self.listing.refresh_from_db()
        expected = "Kwame Nkrumah University of Science and Technology"
        self.assertEqual(self.student.primary_campus.name, expected)
        self.assertEqual(self.agent.operating_areas.get().campus.name, expected)
        self.assertEqual(self.listing.property.area.campus.name, expected)

    def test_agent_creates_listing_against_an_admin_managed_area(self):
        self.client.force_authenticate(self.agent_user)
        property_response = self.client.post(
            "/api/listings/properties/",
            {
                "name": "Canonical Court",
                "area": str(self.area.id),
                "property_type": "hostel",
                "gender_policy": "mixed",
            },
            format="json",
        )
        listing_response = self.client.post(
            "/api/listings/",
            {
                "property": property_response.data["id"],
                "title": "Canonical campus room",
                "description": "A room tied to the admin-managed location directory.",
                "status": "draft",
                "moderation_status": "approved",
                "availability_status": "available",
                "room_type": "single",
                "gender_restriction": "mixed",
                "capacity": 1,
                "available_slots": 1,
                "price_amount": "3500.00",
                "price_period": "academic_year",
            },
            format="json",
        )

        self.assertEqual(property_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(listing_response.status_code, status.HTTP_201_CREATED)
        created = Listing.objects.get(pk=listing_response.data["id"])
        self.assertEqual(created.agent, self.agent)
        self.assertEqual(created.property.area, self.area)
        self.assertEqual(created.moderation_status, "pending")
