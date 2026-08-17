# Public And Auth Page Designs

Status: `Draft`

## Public Shell

- Header: AgentMS identity, search entry, login, signup.
- Mobile header: menu icon, page title, account action.
- Footer: minimal support, policies, and contact links.

## Home `/`

Priority:

- Start campus or area search.
- Explain that listings are maintained by agents and freshness is visible.

Layout:

- Search-first hero with campus, area, price, and gender controls.
- Fresh listings band with 4 to 6 listing cards.
- Trust band explaining verified agents, freshness timestamps, and report flow.

Creative allowance:

- Ghana campus context may be shown through subtle location language and photography later.
- Avoid decorative visuals that hide the search task.

## Listings `/listings`

Priority:

- Compare listings quickly.
- Keep filters visible without overwhelming mobile.

Layout:

- Search toolbar with result count and sort.
- Filter drawer on mobile; persistent left filter rail on desktop.
- Listing cards with price, campus, occupancy, gender, availability, freshness, and verified-agent signal.

States:

- Loading skeleton.
- Empty result.
- Filtered empty result.
- Stale-heavy warning if many matches need refresh.

## Listing Detail `/listings/:id`

Priority:

- Confirm whether the room is relevant and current.
- Make agent contact/inquiry action obvious.

Layout:

- Media gallery.
- Summary rail with price, availability, last confirmed, campus, gender, occupancy, and inquiry CTA.
- Room types, amenities, rules, transport notes, and agent profile summary.
- Report listing action is visible but secondary.

Out of scope:

- No deposit, checkout, booking calendar, or payment proof UI.

## Agent Public Profile `/agents/:id`

Priority:

- Help students judge whether an agent is credible.

Layout:

- Agent identity, photo/logo, verification badge, operating areas, contact channels.
- Trust metrics: response rate, listing freshness score, report history summary.
- Active listings grid.

## Auth Pages

Shared:

- Simple centered form layout.
- Clear token, validation, loading, and success states.
- Role behavior must match permissions matrix.

Pages:

- `/login`: email, password, forgot password, role-safe redirect.
- `/signup`: student/agent role selector; agent path explains verification is required for trust.
- `/verify-email/:token`: success, expired token, invalid token.
- `/forgot-password`: request reset link.
- `/reset-password`: token validation and new password form.

