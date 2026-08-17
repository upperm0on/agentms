# Student Page Designs

Status: `Draft`

## Student Shell

- Top navigation keeps search, saved listings, inquiries, and profile accessible.
- Mobile navigation uses bottom or drawer navigation with labels.

## Dashboard `/student/dashboard`

Priority:

- Resume active inquiry work.
- Surface saved listings whose freshness changed.

Layout:

- Summary cards: active inquiries, saved listings, recently refreshed matches.
- Active inquiry list with lead state and next step.
- Saved listing preview with freshness badges.
- Search prompt for campus/area.

## Inquiries `/student/inquiries`

Priority:

- Let students understand whether an agent has followed up.

Layout:

- Inquiry list/table with listing, agent, state, last update, and next action.
- Detail drawer for message/request content and contact summary.

States:

- New, Contacted, Viewing Scheduled, Negotiating, Closed Won, Closed Lost.
- Spam/Invalid should not be student-editable in MVP.

## Saved `/student/saved`

Priority:

- Compare saved listings and spot stale or unavailable rooms.

Layout:

- Saved listing cards with freshness and availability changes.
- Filters for campus, price, availability, and freshness.
- Empty state sends user to `/listings`.

## Profile `/student/profile`

Priority:

- Maintain contact details needed for inquiry follow-up.

Layout:

- Account details.
- Phone/WhatsApp contact.
- Notification preferences.
- Security section.

