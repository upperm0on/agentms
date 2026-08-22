from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AccountAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="student@example.com",
            password="password123",
            first_name="Esi",
            last_name="Boateng",
            role="student",
            is_email_verified=True,
        )

    def test_password_login_starts_session(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": "student@example.com", "password": "password123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "student@example.com")
        self.assertEqual(response.data["role"], "student")

        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "student@example.com")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="google-client.test")
    @patch("apps.accounts.views.id_token.verify_oauth2_token")
    def test_google_login_creates_verified_student_session(self, verify_token):
        verify_token.return_value = {
            "email": "google.student@example.com",
            "email_verified": True,
            "given_name": "Google",
            "family_name": "Student",
        }

        response = self.client.post(
            "/api/auth/google/",
            {"credential": "token", "role": "student"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="google.student@example.com")
        self.assertEqual(user.role, "student")
        self.assertTrue(user.is_email_verified)

        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "google.student@example.com")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="")
    def test_google_login_requires_configuration(self):
        response = self.client.post(
            "/api/auth/google/",
            {"credential": "token", "role": "student"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @override_settings(
        GOOGLE_OAUTH_CLIENT_ID="google-client.test",
        GOOGLE_OAUTH_CLIENT_SECRET="secret",
        GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5173/api/auth/google/callback/",
    )
    def test_google_oauth_start_redirects_to_google(self):
        response = self.client.get("/api/auth/google/start/?role=agent")

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertTrue(response["Location"].startswith("https://accounts.google.com/o/oauth2/v2/auth?"))
        self.assertIn("redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fapi%2Fauth%2Fgoogle%2Fcallback%2F", response["Location"])
