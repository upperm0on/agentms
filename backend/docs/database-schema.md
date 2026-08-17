# AgentMS Backend Database Schema

Status: `Draft schema`

This schema is based on the current frontend prototype data contract in `frontend/src/api/mockApi.ts` and the product planning docs under `plan/`.

## App Boundaries

Backend code is split by domain. Each app owns its models and will later own serializers, views, URLs, services, permissions, and tests.

| App | Responsibility |
| --- | --- |
| `apps.accounts` | Auth identity, platform role, email verification, account status. |
| `apps.locations` | Regions, campuses, and nearby accommodation areas. |
| `apps.agents` | Agent public profile, operating areas, verification requests, verification documents. |
| `apps.listings` | Properties, room listings, listing images, amenities, rules, saved listings. |
| `apps.inquiries` | Student inquiries, preferred contact method, status transitions, follow-up dates. |
| `apps.moderation` | Listing reports, moderation decisions, sensitive audit records. |
| `apps.notifications` | In-app notification records for students, agents, and admins. |
| `apps.common` | Shared abstract model fields and reusable enum values. |

## Core Relationships

```text
User
├── AgentProfile (one-to-one, only for agent users)
├── SavedListing (student saved rooms)
├── Inquiry (student-created)
├── ListingReport (student/admin-created)
└── Notification

Region
└── Campus
    └── Area
        ├── Property
        └── AgentProfile.operating_areas

Property
└── Listing
    ├── ListingImage
    ├── ListingRule
    ├── Inquiry
    ├── ListingReport
    └── SavedListing
```

## Frontend Contract Coverage

| Frontend mock type | Backend source |
| --- | --- |
| `User` | `accounts.User` |
| `Agent` | `agents.AgentProfile`, `agents.AgentDocument`, `agents.VerificationRequest` |
| `Location` | `locations.Region`, `locations.Campus`, `locations.Area` |
| `Listing` | `listings.Property`, `listings.Listing`, `listings.ListingImage`, `listings.ListingRule`, `listings.Amenity`, `listings.SavedListing` |
| `Inquiry` | `inquiries.Inquiry`, `inquiries.InquiryStatusEvent` |
| `Report` | `moderation.ListingReport`, `moderation.ModerationAction` |
| `Notification` | `notifications.Notification` |

## Important Design Decisions

- Users use UUID primary keys and email login.
- Role is stored on `accounts.User` as `student`, `agent`, or `admin`.
- Agent data is not stored directly on the user. Public and operational agent fields live in `agents.AgentProfile`.
- Locations are normalized into region, campus, and area so filtering can stay reliable.
- Properties are independent from agents. Multiple agents may create listings for the same property.
- Listings belong to agents and properties. Availability and freshness are listing-level fields.
- Listing amenities use a reusable `Amenity` table. Listing rules use separate ordered rows so they can be edited cleanly.
- Media fields currently use Django `FileField` so the schema works without extra dependencies. Add Pillow-backed image validation when the media upload API is implemented.
- Saved listings are first-class rows instead of a boolean on the listing.
- Inquiry status changes can be audited through `InquiryStatusEvent`.
- Moderation reports are separate from listing moderation status. This allows a listing to receive multiple reports over time.
- Notification records can target one user or an audience role.

## REST API Direction

The model layout supports the planned API surface:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/me/`
- `GET /api/locations/`
- `GET /api/listings/`
- `POST /api/listings/`
- `GET /api/listings/{id}/`
- `PATCH /api/listings/{id}/`
- `POST /api/listings/{id}/refresh-availability/`
- `POST /api/listings/{id}/inquiries/`
- `GET /api/student/inquiries/`
- `GET /api/agent/inquiries/`
- `GET /api/admin/agents/`
- `GET /api/admin/listings/`
- `GET /api/admin/reports/`

Serializers, views, permissions, and services should be added inside the owning app instead of a shared catch-all module.
