# API Surface

## Authentication

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/verify-email/`
- `POST /api/auth/password-reset/request/`
- `POST /api/auth/password-reset/confirm/`
- `GET /api/auth/me/`

## Agents

- `GET /api/agents/me/`
- `PATCH /api/agents/me/`
- `POST /api/agents/verification/`
- `GET /api/agents/{id}/`

## Locations

- `GET /api/locations/`
- `GET /api/locations/campuses/`

## Listings

- `GET /api/listings/`
- `POST /api/listings/`
- `GET /api/listings/{id}/`
- `PATCH /api/listings/{id}/`
- `DELETE /api/listings/{id}/`
- `POST /api/listings/{id}/publish/`
- `POST /api/listings/{id}/unpublish/`
- `POST /api/listings/{id}/refresh-availability/`
- `POST /api/listings/{id}/images/`
- `DELETE /api/listings/{id}/images/{image_id}/`

## Inquiries

- `POST /api/listings/{id}/inquiries/`
- `GET /api/agent/inquiries/`
- `PATCH /api/agent/inquiries/{id}/`
- `GET /api/student/inquiries/`

## Reports

- `POST /api/listings/{id}/reports/`

## Admin

- `GET /api/admin/agents/`
- `PATCH /api/admin/agents/{id}/verification/`
- `GET /api/admin/listings/`
- `PATCH /api/admin/listings/{id}/moderation/`
- `GET /api/admin/reports/`
- `PATCH /api/admin/reports/{id}/`
- `GET /api/admin/analytics/summary/`
