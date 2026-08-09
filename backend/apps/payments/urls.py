from django.urls import path

from .views import PaymentIntentCreateView, StudentPaymentIntentListView


app_name = "payments"

urlpatterns = [
    path("intents/", PaymentIntentCreateView.as_view(), name="payment-intent-create"),
    path("student/intents/", StudentPaymentIntentListView.as_view(), name="student-payment-intents"),
]
