from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from django.core import signing
from django.shortcuts import redirect
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import requests
from urllib.parse import urlencode
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.models import ActiveState
from apps.common.permissions import IsAdminRole

from .serializers import GoogleLoginSerializer, LoginSerializer, RegisterSerializer, UserSerializer


User = get_user_model()
GOOGLE_OAUTH_STATE_SALT = "agentms.google.oauth.state"


def google_error_redirect(message):
    return redirect(f"{settings.FRONTEND_ORIGIN}/login?auth_error={message}")


def user_from_google_claims(claims, role):
    email = claims.get("email", "").strip().lower()
    if not email or not claims.get("email_verified"):
        return None, False, Response({"detail": "Google account email is not verified."}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": "",
            "first_name": claims.get("given_name", ""),
            "last_name": claims.get("family_name", ""),
            "role": role,
            "is_email_verified": True,
        },
    )
    if not created and user.status != ActiveState.ACTIVE:
        return None, False, Response({"detail": "This account is not active."}, status=status.HTTP_403_FORBIDDEN)
    if not user.is_email_verified:
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified", "updated_at"])
    return user, created, None


@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)
        if user.status != ActiveState.ACTIVE:
            return Response({"detail": "This account is not active."}, status=status.HTTP_403_FORBIDDEN)
        login(request, user)
        return Response(UserSerializer(user).data)


@method_decorator(csrf_exempt, name="dispatch")
class GoogleLoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not settings.GOOGLE_OAUTH_CLIENT_ID:
            return Response({"detail": "Google login is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            claims = id_token.verify_oauth2_token(
                serializer.validated_data["credential"],
                google_requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
        except ValueError:
            return Response({"detail": "Invalid Google credential."}, status=status.HTTP_400_BAD_REQUEST)

        user, created, error = user_from_google_claims(claims, serializer.validated_data["role"])
        if error:
            return error

        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class GoogleOAuthStartView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not settings.GOOGLE_OAUTH_CLIENT_ID or not settings.GOOGLE_OAUTH_CLIENT_SECRET:
            return google_error_redirect("google_not_configured")

        role = request.query_params.get("role", "student")
        if role not in {"student", "agent"}:
            role = "student"
        state = signing.dumps({"role": role}, salt=GOOGLE_OAUTH_STATE_SALT)
        query = urlencode({
            "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        })
        return redirect(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")


@method_decorator(csrf_exempt, name="dispatch")
class GoogleOAuthCallbackView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.query_params.get("error"):
            return google_error_redirect("google_denied")

        code = request.query_params.get("code")
        state = request.query_params.get("state")
        if not code or not state:
            return google_error_redirect("google_missing_code")

        try:
            state_data = signing.loads(state, salt=GOOGLE_OAUTH_STATE_SALT, max_age=600)
        except signing.BadSignature:
            return google_error_redirect("google_bad_state")

        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        if not token_response.ok:
            return google_error_redirect("google_token_failed")

        try:
            claims = id_token.verify_oauth2_token(
                token_response.json()["id_token"],
                google_requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
        except (KeyError, ValueError):
            return google_error_redirect("google_invalid_token")

        user, _, error = user_from_google_claims(claims, state_data.get("role", "student"))
        if error:
            return google_error_redirect("google_email_failed")

        login(request, user)
        role = user.role if user.role in {"student", "agent", "admin"} else "student"
        target = "agent" if role == "agent" else "admin" if role == "admin" else "student"
        return redirect(f"{settings.FRONTEND_ORIGIN}/{target}/dashboard")


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
