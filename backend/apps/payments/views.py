from rest_framework import generics, permissions, response, status

from apps.listings.models import Listing

from .models import PaymentIntent
from .serializers import PaymentIntentSerializer
from .services import create_payment_intent


class PaymentIntentCreateView(generics.CreateAPIView):
    serializer_class = PaymentIntentSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        listing = Listing.objects.get(pk=request.data["listing"])
        intent = create_payment_intent(
            listing=listing,
            guest_name=request.data["guest_name"],
            guest_email=request.data["guest_email"],
            guest_phone=request.data["guest_phone"],
            wants_account_history=bool(request.data.get("wants_account_history", False)),
            student=request.user,
        )
        return response.Response(self.get_serializer(intent).data, status=status.HTTP_201_CREATED)


class StudentPaymentIntentListView(generics.ListAPIView):
    serializer_class = PaymentIntentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentIntent.objects.filter(student=self.request.user).select_related("listing", "listing__agent", "listing__property")

