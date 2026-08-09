# Agent Page Designs

Status: `Draft`

## Agent Shell

- Persistent desktop sidebar: Dashboard, Profile, Verification, Listings, Inquiries, Settings.
- Mobile navigation becomes a drawer.
- Global action: `New listing`.

## Dashboard `/agent/dashboard`

Priority:

- Show what needs action today.

Layout:

- Task cards: new inquiries, stale listings, verification status, unavailable listings.
- Freshness queue with one-click refresh path.
- Inquiry queue sorted by newest and waiting longest.
- Lightweight stats: active listings, verified status, response rate.

## Profile `/agent/profile`

Priority:

- Maintain public trust identity.

Layout:

- Profile/business name, photo/logo, bio, phone, WhatsApp.
- Operating campuses/areas.
- Public preview panel.

## Verification `/agent/verification`

Priority:

- Make verification status and required evidence clear.

Layout:

- Status panel for Unsubmitted, Pending, Verified, Rejected, Suspended.
- Stepper for identity, contact, operating areas, evidence, review.
- Rejection reason and resubmission path.

## Listings `/agent/listings`

Priority:

- Manage owned listings and keep availability current.

Layout:

- Toolbar with search, status, freshness, campus, and publish filters.
- Table on desktop; card summaries on mobile.
- Row actions: edit, refresh availability, publish/unpublish, archive.

## New Listing `/agent/listings/new`

Priority:

- Create structured, searchable listing data.

Layout:

- Sections: property basics, location, room types, pricing, availability, gender/occupancy, amenities/rules, media, review/publish.
- Save draft and publish are separate actions.

## Edit Listing `/agent/listings/:id/edit`

Priority:

- Update content and availability without losing publishing context.

Layout:

- Same sections as new listing.
- Sticky status panel with publish state, approval state, freshness, and last confirmed time.
- Confirmation modal for archive/delete.

## Inquiries `/agent/inquiries`

Priority:

- Convert student interest into follow-up action.

Layout:

- Inquiry table with student, listing, state, received date, last update.
- Status picker for lead states.
- Detail drawer with contact info and listing context.

## Settings `/agent/settings`

Priority:

- Manage account, notification, and security settings.

Layout:

- Account basics.
- Notification toggles for new inquiry and stale listing reminders.
- Password/security controls.

