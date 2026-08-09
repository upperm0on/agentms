from django.utils import timezone

from apps.agents.models import AgentProfile
from apps.listings.models import Listing
from apps.notifications.services import create_notification

from .models import AuditLog, ListingReport, ModerationAction


def record_audit(*, actor, action: str, entity_type: str, entity_id=None, metadata=None):
    return AuditLog.objects.create(
        actor=actor if actor and actor.is_authenticated else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata=metadata or {},
    )


def create_listing_report(*, listing: Listing, reported_by, reason: str, details: str, severity: str = "medium") -> ListingReport:
    report = ListingReport.objects.create(
        listing=listing,
        reported_by=reported_by if reported_by and reported_by.is_authenticated else None,
        reason=reason,
        details=details,
        severity=severity,
    )
    create_notification(
        audience="admin",
        title="New listing report",
        body=f"{listing.title} was reported for {report.get_reason_display()}.",
        tone="danger" if severity == "high" else "warning",
        link_url=f"/admin/reports?report={report.id}",
    )
    return report


def moderate_listing(*, listing: Listing, actor, moderation_status: str, note: str = "") -> Listing:
    listing.moderation_status = moderation_status
    listing.save(update_fields=["moderation_status", "updated_at"])
    ModerationAction.objects.create(
        actor=actor,
        entity_type="listing",
        entity_id=listing.id,
        action=f"listing_{moderation_status}",
        note=note,
    )
    record_audit(actor=actor, action="listing_moderation_update", entity_type="listing", entity_id=listing.id, metadata={"status": moderation_status})
    return listing


def update_report_status(*, report: ListingReport, actor, status: str, resolution_notes: str = "") -> ListingReport:
    report.status = status
    report.reviewed_by = actor
    report.reviewed_at = timezone.now()
    report.resolution_notes = resolution_notes
    report.save(update_fields=["status", "reviewed_by", "reviewed_at", "resolution_notes", "updated_at"])
    ModerationAction.objects.create(
        actor=actor,
        entity_type="report",
        entity_id=report.id,
        action=f"report_{status}",
        note=resolution_notes,
    )
    return report


def update_agent_verification(*, agent: AgentProfile, actor, verification_status: str, note: str = "") -> AgentProfile:
    agent.verification_status = verification_status
    agent.verification_notes = note
    agent.save(update_fields=["verification_status", "verification_notes", "updated_at"])
    ModerationAction.objects.create(
        actor=actor,
        entity_type="agent",
        entity_id=agent.id,
        action=f"agent_{verification_status}",
        note=note,
    )
    create_notification(
        recipient=agent.user,
        audience="agent",
        title="Verification updated",
        body=f"Your verification status is now {agent.get_verification_status_display()}.",
        tone="success" if verification_status == "verified" else "warning",
        link_url="/agent/verification",
    )
    return agent
