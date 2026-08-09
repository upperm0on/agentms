import uuid

from apps.listings.models import Listing

from .models import PaymentIntent


def create_payment_intent(*, listing: Listing, guest_name: str, guest_email: str, guest_phone: str, wants_account_history: bool, student=None) -> PaymentIntent:
    amount = listing.deposit_amount or listing.price_amount
    return PaymentIntent.objects.create(
        listing=listing,
        student=student if student and student.is_authenticated else None,
        guest_name=guest_name,
        guest_email=guest_email,
        guest_phone=guest_phone,
        amount=amount,
        currency="GHS",
        provider="manual",
        provider_reference=f"AGMS-{uuid.uuid4().hex[:16].upper()}",
        wants_account_history=wants_account_history,
        metadata={
            "listing_title": listing.title,
            "agent_id": str(listing.agent_id),
            "auth_required": False,
            "portal_history_requires_account": True,
        },
    )

