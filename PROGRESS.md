# AgentMS Progress

Last updated: August 9, 2026

## Where We Started

Before this session, AgentMS had planning artifacts and a frontend prototype, but the implementation was not ready for backend-driven work.

The main gaps were:

- Django REST Framework had been installed locally but was not fully wired into the backend project.
- The backend schema still needed organized Django apps, models, serializers, views, services, URLs, migrations, and seed data.
- The frontend still depended heavily on local mock data instead of the Django REST API.
- Security and permission behavior needed clarification, especially for public browsing, student actions, agent actions, moderation, and payment intent creation.
- Guest payment intent creation still needed to work without requiring an authenticated student account.
- The `/listings` page was receiving backend data but hiding some populated records because the default availability filter was too restrictive.
- Student-facing UI metrics and supporting copy still had hardwired placeholders.
- The browse filter rail was fixed in place on desktop and only behaved like a drawer on mobile.
- Student and listing UI needed a clearer icon language with contextual tooltips.

## What Was Done

### Backend

- Added `rest_framework` to Django `INSTALLED_APPS`.
- Organized backend functionality into separate Django apps:
  - `accounts`
  - `agents`
  - `locations`
  - `listings`
  - `inquiries`
  - `moderation`
  - `notifications`
  - `payments`
  - `common`
- Added DRF URL routing under `/api/...`.
- Added models, serializers, views, service modules, permissions, migrations, and seed data across the backend apps.
- Added anonymous guest payment intent support for one-time student bookings.
- Populated the SQLite database with demo records across the current schema.
- Added schema documentation at `backend/docs/database-schema.md`.
- Added a minimal backend dependency file at `backend/requirements.txt`.

### Frontend

- Wired the frontend API adapter to load data from the Django backend.
- Updated `/listings` so it defaults to `Any availability`, allowing populated backend listings with `Available`, `Limited`, and `Full` availability to appear.
- Reworked student dashboard metrics so they derive from backend-loaded data:
  - active inquiries
  - viewing scheduled count
  - saved rooms
  - saved rooms currently available
  - campus matches
  - fresh matches
- Updated the student dashboard, saved rooms, and inquiry screens with clearer icon-forward actions.
- Added a collapsible desktop filter rail for browse results.
- Preserved the mobile filter drawer behavior.
- Cleaned up filter sidebar spacing.
- Improved input and select field styling.
- Replaced native browser title tooltips with custom pointed tooltip boxes.
- Built a reusable signal tag system for listing cards and detail headers.
- Added icon-only signal tags for:
  - availability
  - freshness
  - verified agent status
- Configured listing cards so signal icons are always visible, but tooltip titles only appear for the first occurrence of each signal value in a listing grid.
- Moved listing card signal icons to a uniform bottom row with fixed slots.

### Verification

Commands run successfully during the session:

```bash
npm run build
red/bin/python backend/manage.py check
```

The frontend production build and Django system check both passed after the latest UI changes.

## Current Known State

- Frontend dev server is expected to run from `frontend/`.
- Vite proxies `/api` and `/media` to `http://127.0.0.1:8001`.
- Django should run from the workspace root with:

```bash
red/bin/python backend/manage.py runserver 127.0.0.1:8001
```

- The current database is SQLite at `backend/db.sqlite3`.
- `backend/db.sqlite3` is a local development artifact and should not be committed.
- The root workspace did not behave like a normal Git repository in this session, but `backend/` contains its own `.git` metadata.

## Where To Pick Up

Recommended next work:

1. Decide the final repository boundary before pushing to GitHub:
   - Push the whole `agentms` workspace as one repo, or
   - Split frontend and backend into separate repos.
2. Initialize or repair root-level Git metadata if the full workspace is the intended repository.
3. Confirm backend dependency installation in a fresh virtual environment using `backend/requirements.txt`.
4. Add environment-based Django settings:
   - `SECRET_KEY`
   - `DEBUG`
   - `ALLOWED_HOSTS`
   - database configuration
   - CORS/CSRF settings if the frontend and backend deploy separately
5. Replace the development SQLite database with a real environment-specific database for production.
6. Add fuller automated tests:
   - backend API endpoint tests
   - backend permission tests
   - frontend API adapter tests
   - listing and student workflow tests
7. Wire the frontend guest payment flow to the payment intent API.
8. Add real authentication flows for remembered history, preferences, and the student portal.
9. Continue converting repeated visual labels into icon-first signal tags where it improves scan speed.
10. Review design and accessibility for keyboard behavior, focus states, and reduced-motion preferences.

## Push Readiness Notes

Before pushing, check that these are not committed:

- `frontend/node_modules/`
- `frontend/dist/`
- `red/`
- `backend/db.sqlite3`
- `backend/**/__pycache__/`
- local `.env` files
- large or sensitive files under `prev/` unless intentionally preserved

