from django.utils import timezone

from apps.listings.models import Listing
from apps.notifications.services import create_notification

from .models import Inquiry, InquiryStatusEvent


def create_listing_inquiry(*, student, listing: Listing, message: str, student_phone: str, preferred_contact_method: str) -> Inquiry:
    inquiry = Inquiry.objects.create(
        student=student,
        listing=listing,
        agent=listing.agent,
        message=message,
        student_phone=student_phone,
        preferred_contact_method=preferred_contact_method,
    )
    Listing.objects.filter(pk=listing.pk).update(inquiry_count=listing.inquiry_count + 1)
    create_notification(
        recipient=listing.agent.user,
        audience="agent",
        title="New inquiry",
        body=f"{student.get_full_name() or student.email} asked about {listing.title}.",
        tone="warning",
        link_url=f"/agent/inquiries?inquiry={inquiry.id}",
    )
    return inquiry


def transition_inquiry(*, inquiry: Inquiry, to_status: str, changed_by, note: str = "") -> Inquiry:
    from_status = inquiry.status
    inquiry.status = to_status
    if to_status.startswith("closed_"):
        inquiry.closed_at = timezone.now()
    inquiry.save(update_fields=["status", "closed_at", "updated_at"])
    InquiryStatusEvent.objects.create(
        inquiry=inquiry,
        from_status=from_status,
        to_status=to_status,
        note=note,
        changed_by=changed_by,
    )
    create_notification(
        recipient=inquiry.student,
        audience="student",
        title="Inquiry updated",
        body=f"{inquiry.listing.title} is now {inquiry.get_status_display()}.",
        tone="info",
        link_url=f"/student/inquiries?inquiry={inquiry.id}",
    )
    return inquiry
