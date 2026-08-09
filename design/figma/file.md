# Figma Design File

File name: `AgentMS MVP Product Design`

URL: https://www.figma.com/design/phZ7PVRwNzDLnKhOIGgjl0

## Pages To Maintain

- `00 Foundations`: color, type, spacing, status, and component direction.
- `01 Public and Auth`: public browse, listing detail, agent profile, login, signup, verification, and reset flows.
- `02 Student`: student dashboard, inquiries, saved listings, and profile.
- `03 Agent`: agent dashboard, profile, verification, listing management, inquiry management, and settings.
- `04 Admin`: admin dashboard, agent review, listing moderation, reports, locations, and users.

## Frame Principles

- One desktop frame and one mobile frame for each major workflow family.
- Route cards are used for secondary pages so all routes remain represented without over-designing low-risk states.
- Trust, freshness, status, ownership, and next action must be visible in every operational frame.
- No payment or booking UI should be introduced in MVP frames.

## Current Figma Scope

The first Figma pass should show:

- Design tokens and component vocabulary.
- Public discovery and listing-detail surfaces.
- Student inquiry tracking.
- Agent listing and inquiry operations.
- Admin verification and moderation queues.

## Current Connector State

Created:

- Figma file `AgentMS MVP Product Design`.
- Foundation board covering palette, state language, and component vocabulary.
- Partial page structure: `00 Foundations`, `01 Public and Auth`, and `02 Student`.

Blocked during this pass:

- The Figma connector began returning `INVALID_ARGUMENT` for additional page/frame writes and metadata reads after the foundation board was created.
- The local design specs in `design/pages/` remain the complete source for all planned routes until the remaining Figma boards can be added.
