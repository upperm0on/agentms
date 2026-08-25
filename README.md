# AgentMS

AgentMS is a student accommodation discovery and agent-management application. The current build pairs a React/Vite frontend with a Django REST Framework backend.

The product direction is agent-first: agents publish and maintain listings, students browse rooms and submit inquiries, and admins moderate trust-sensitive activity.

## Current Capabilities

- Public room discovery with backend-loaded listings.
- Student dashboard, saved rooms, inquiries, profile, and notification preferences.
- Agent dashboard, listings, inquiries, profile, verification, and settings screens.
- Admin dashboard, agent review, listing moderation, reports, locations, and users screens.
- Django REST API organized by domain apps.
- Demo seed data for listings, agents, locations, inquiries, notifications, moderation, and users.
- Icon-first listing signal tags for availability, freshness, and verified agents.

## Project Structure

```text
agentms/
  backend/
    apps/
      accounts/
      agents/
      common/
      inquiries/
      listings/
      locations/
      moderation/
      notifications/
    backend/
      settings.py
      urls.py
    docs/
      database-schema.md
    manage.py
    requirements.txt
  frontend/
    public/
    scripts/
    src/
      api/
      pages/
      workscape/
      App.css
      main.tsx
    package.json
    vite.config.ts
  design/
  plan/
  requirement/
  PROGRESS.md
  PROJECT_PLAN.md
```

## Backend Setup

From the workspace root:

```bash
python -m venv red
red/bin/pip install -r backend/requirements.txt
red/bin/python backend/manage.py migrate
red/bin/python backend/manage.py seed_demo_data
red/bin/python backend/manage.py seed_legacy_agents
red/bin/python backend/manage.py runserver 127.0.0.1:8001
```

`seed_legacy_agents` is an optional, rerunnable inventory seed. It creates 10 namespaced
agent accounts and assigns the 46 room groups in `prev/hostel/media/room_images` across
them, preserving all valid room photos. It creates required location, amenity, property,
and listing records without deleting existing data.

The current development database is SQLite. It lives at:

```text
backend/db.sqlite3
```

This file is intentionally treated as local development data and should not be committed.

### Backend Cache

The backend uses Django's cache framework for read-heavy public data. By default it uses local memory so development works without extra services. Set `REDIS_URL` to use Redis:

```bash
export REDIS_URL=redis://127.0.0.1:6379/1
red/bin/python backend/manage.py runserver 127.0.0.1:8001
```

Cached API data currently covers anonymous public listings and shared location/reference endpoints. Authenticated student, agent, and admin responses are not shared through the public cache because they can contain user-specific state.

## Frontend Setup

From `frontend/`:

```bash
npm install
npm run dev
```

The Vite dev server proxies API traffic to Django:

```text
/api   -> http://127.0.0.1:8001
/media -> http://127.0.0.1:8001
```

Build the frontend with:

```bash
npm run build
```

## Useful Commands

Run Django system checks:

```bash
red/bin/python backend/manage.py check
```

Run Django tests:

```bash
red/bin/python backend/manage.py test
```

Build the frontend:

```bash
cd frontend
npm run build
```

Run frontend linting:

```bash
cd frontend
npm run lint
```

Regenerate the Workscape manifest:

```bash
cd frontend
npm run workscape:generate
```

## API Surface

The backend routes are mounted under:

```text
/api/auth/
/api/agents/
/api/locations/
/api/listings/
/api/inquiries/
/api/moderation/
/api/admin/
/api/notifications/
```

See `backend/docs/database-schema.md` and `plan/architecture/api-surface.md` for more context.

## Development Notes

- Keep backend code organized by app and responsibility.
- Keep serializers, views, services, permissions, and URLs in separate files.
- Avoid putting unrelated backend behavior into a single module.
- Keep frontend data access in `frontend/src/api/`.
- Keep major route screens in `frontend/src/pages/RouteScreens.tsx` until the UI is ready to split further.
- Do not commit generated build outputs, virtual environments, local databases, caches, or secrets.

## Current Limitations

- Production settings are not yet environment-driven.
- Redis should be configured in deployed environments with `REDIS_URL`; local memory cache is only a development fallback.
- Payments, deposits, checkout, wallets, and booking payment flows are intentionally excluded from the platform.
- Authentication is still prototype-level for the frontend experience.
- Automated test coverage needs to be expanded across API permissions and frontend workflows.
- The repository boundary should be clarified before the final GitHub push.

## Handoff

Read `PROGRESS.md` before continuing. It records what was incomplete before this session, what was completed, and the recommended next steps.
