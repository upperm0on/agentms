from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import signing
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.views import GOOGLE_OAUTH_STATE_SALT
from apps.common.models import ActiveState


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
    def test_google_login_creates_verified_student_with_unusable_password_session(self, verify_token):
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
        self.assertFalse(user.has_usable_password())

        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "google.student@example.com")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="google-client.test")
    @patch("apps.accounts.views.id_token.verify_oauth2_token")
    def test_google_login_uses_existing_password_user_by_normalized_email(self, verify_token):
        verify_token.return_value = {
            "email": "STUDENT@example.com",
            "email_verified": True,
            "given_name": "Changed",
            "family_name": "Name",
        }

        response = self.client.post(
            "/api/auth/google/",
            {"credential": "token", "role": "agent"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(email__iexact="student@example.com").count(), 1)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, "student")
        self.assertTrue(self.user.has_usable_password())

        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["email"], "student@example.com")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="google-client.test")
    @patch("apps.accounts.views.id_token.verify_oauth2_token")
    def test_google_login_rejects_invalid_role(self, verify_token):
        verify_token.return_value = {
            "email": "invalid.role@example.com",
            "email_verified": True,
        }

        response = self.client.post(
            "/api/auth/google/",
            {"credential": "token", "role": "owner"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="invalid.role@example.com").exists())

    @override_settings(
        GOOGLE_OAUTH_CLIENT_ID="google-client.test",
        GOOGLE_OAUTH_CLIENT_SECRET="secret",
        GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5173/api/auth/google/callback/",
        FRONTEND_ORIGIN="http://localhost:5173",
    )
    @patch("apps.accounts.views.id_token.verify_oauth2_token")
    @patch("apps.accounts.views.requests.post")
    def test_google_oauth_callback_does_not_create_admin(self, token_post, verify_token):
        token_post.return_value.ok = True
        token_post.return_value.json.return_value = {"id_token": "id-token"}
        verify_token.return_value = {
            "email": "admin.signup@example.com",
            "email_verified": True,
        }
        state = signing.dumps({"role": "admin"}, salt=GOOGLE_OAUTH_STATE_SALT)

        response = self.client.get(f"/api/auth/google/callback/?code=code&state={state}")

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response["Location"], "http://localhost:5173/login?auth_error=google_email_failed")
        self.assertFalse(User.objects.filter(email="admin.signup@example.com").exists())

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="google-client.test")
    @patch("apps.accounts.views.id_token.verify_oauth2_token")
    def test_google_login_rejects_suspended_user(self, verify_token):
        self.user.status = ActiveState.SUSPENDED
        self.user.save(update_fields=["status", "updated_at"])
        verify_token.return_value = {
            "email": "student@example.com",
            "email_verified": True,
        }

        response = self.client.post(
            "/api/auth/google/",
            {"credential": "token", "role": "student"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(
        GOOGLE_OAUTH_CLIENT_ID="google-client.test",
        GOOGLE_OAUTH_CLIENT_SECRET="secret",
        GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5173/api/auth/google/callback/",
        FRONTEND_ORIGIN="http://localhost:5173",
    )
    def test_google_oauth_callback_rejects_invalid_state(self):
        response = self.client.get("/api/auth/google/callback/?code=code&state=bad-state")

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response["Location"], "http://localhost:5173/login?auth_error=google_bad_state")

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="google-client.test")
    @patch("apps.accounts.views.id_token.verify_oauth2_token")
    def test_google_login_rejects_unverified_google_email(self, verify_token):
        verify_token.return_value = {
            "email": "unverified@example.com",
            "email_verified": False,
        }

        response = self.client.post(
            "/api/auth/google/",
            {"credential": "token", "role": "student"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="unverified@example.com").exists())

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
