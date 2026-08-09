from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.agents.models import AgentProfile
from apps.inquiries.models import Inquiry, InquiryStatus
from apps.listings.models import Amenity, AvailabilityStatus, Listing, ListingStatus, PricePeriod, Property, RoomType
from apps.locations.models import Area, Campus, Region
from apps.moderation.models import ListingReport, ModerationAction
from apps.notifications.models import Notification
from apps.payments.models import PaymentIntent


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

    def test_guest_can_create_payment_intent_without_account(self):
        response = self.client.post(
            "/api/payments/intents/",
            {
                "listing": str(self.listing.id),
                "guest_name": "Guest Student",
                "guest_email": "guest@student.test",
                "guest_phone": "+233201234567",
                "wants_account_history": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PaymentIntent.objects.count(), 1)
        intent = PaymentIntent.objects.get()
        self.assertIsNone(intent.student)
        self.assertEqual(intent.guest_email, "guest@student.test")
        self.assertEqual(intent.amount, self.listing.deposit_amount)
        self.assertFalse(intent.metadata["auth_required"])

    def test_payment_history_requires_authenticated_student_account(self):
        anonymous_response = self.client.get("/api/payments/student/intents/")
        self.assertEqual(anonymous_response.status_code, status.HTTP_403_FORBIDDEN)

        PaymentIntent.objects.create(
            listing=self.listing,
            student=self.student,
            guest_name="Esi Boateng",
            guest_email="esi@knust.edu.gh",
            guest_phone="+233245550182",
            amount=self.listing.deposit_amount,
            currency="GHS",
            provider="manual",
            provider_reference="AGMS-TEST-HISTORY",
            status="pending",
            wants_account_history=True,
        )
        self.client.force_authenticate(self.student)
        authenticated_response = self.client.get("/api/payments/student/intents/")

        self.assertEqual(authenticated_response.status_code, status.HTTP_200_OK)
        self.assertEqual(authenticated_response.data["count"], 1)
