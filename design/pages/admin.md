# Admin Page Designs

Status: `Draft`

## Admin Shell

- Persistent desktop sidebar: Dashboard, Agents, Listings, Reports, Locations, Users.
- Admin pages must favor dense tables, filters, evidence, and audit-friendly decisions.

## Dashboard `/admin/dashboard`

Priority:

- Monitor trust, moderation, and data freshness.

Layout:

- KPI cards: pending agents, stale listings, reports, active inquiries.
- Queues: verification, reported listings, stale listings.
- Compact trend visuals only if they clarify operations.

## Agents `/admin/agents`

Priority:

- Process verification and account status.

Layout:

- Data table with status, verification age, operating areas, listings, reports, and last activity.
- Filters for verification state and suspension state.
- Row action opens detail page.

## Agent Detail `/admin/agents/:id`

Priority:

- Make approve/reject/suspend decisions with evidence.

Layout:

- Agent profile summary.
- Verification evidence.
- Listing activity and report history.
- Decision controls with required reason for reject/suspend.
- Audit timeline.

## Listings `/admin/listings`

Priority:

- Review listing quality and moderation state.

Layout:

- Table with listing, agent, campus, freshness, status, reports, and action.
- Detail drawer for content, media, room types, and decision history.

## Reports `/admin/reports`

Priority:

- Triage stale, fake, duplicate, or misleading listing reports.

Layout:

- Report queue grouped by severity and age.
- Evidence drawer.
- Resolution actions: dismiss, hide listing, remove listing, flag agent.

## Locations `/admin/locations`

Priority:

- Keep campus and area data clean for discovery filters.

Layout:

- Campus/area table.
- Create/edit modal.
- Disabled/archive state instead of destructive deletion where possible.

## Users `/admin/users`

Priority:

- Inspect account and role state without becoming a broad impersonation tool.

Layout:

- User table with role, email verification, status, and last activity.
- Account detail drawer.
- No impersonation control in MVP.

