# AgentMS Progress

Last updated: August 17, 2026

## Current Phase

AgentMS is still in Phase 3: Implementation, with Phase 4 verification work started through build checks, Django checks, endpoint validation, and local QA.

The active implementation now covers the planned backend modules and the main frontend surfaces for public discovery, student workspace, agent workspace, and admin operations. The main remaining Phase 3 concern is frontend structure and route isolation: many screens still live in one large route file and should be split into route-level modules before implementation is treated as complete.

## Plan-Relevant Progress

### Product Scope

- Payment functionality is excluded from the active platform.
- README and active platform direction now align with the current decision: students and agents are not paying through AgentMS.
- Payment, checkout, wallet, escrow, and payment-route work should not be reintroduced unless the product decision changes explicitly.

### Backend Implementation

- Django REST Framework is wired under `/api/...`.
- Backend apps are implemented for:
  - accounts
  - agents
  - locations
  - listings
  - inquiries
  - moderation
  - notifications
  - common
- Payment app and active payment routes have been removed from the current platform scope.
- Public listing responses are cached through Django cache configuration.
- Redis-compatible cache settings are in place, with local-memory fallback when `REDIS_URL` is not configured.
- Listing, location, and moderation cache invalidation is wired for listing changes.
- Listing media seed data now copies usable room images into backend media storage.
- Listing detail API responses include multiple listing images for the frontend gallery.
- Public listing list responses now use a lighter serializer so browse pages do not download full detail-page payloads for every card.
- Backend pagination is active with `PAGE_SIZE = 20`.

### Frontend Implementation

- Frontend data is now expected to come from the Django backend, not static seed files.
- The old frontend mock dataset was removed from active runtime use.
- Public `/listings` uses paginated backend listing pages.
- Browse results load 20 listings at a time and append more only after user scroll intent.
- Public `/listings` no longer fetches student-only data on initial load.
- Public `/listings` no longer fetches area/location reference data before room cards render.
- Area/location reference data now loads only when the user interacts with filter controls.
- Listing detail pages fetch only the selected listing detail instead of triggering a full database refresh.
- Listing detail image gallery supports multiple backend images with a focused main image and selectable thumbnails.
- Workscape is lazy-loaded and split away from normal listing/dashboard routes.
- Auth routes and Workscape no longer trigger broad backend data refreshes on page load.

### Performance Work

- Full listing auto-drain was removed; the frontend no longer follows every paginated `next` URL for browse results.
- First listing page payload was reduced from about `138.7 KB` to about `37.6 KB` locally.
- Listing page 2 is about `37.9 KB` locally.
- Listing detail payload is about `6.6 KB` locally.
- Main listing/detail images use eager or async loading behavior where appropriate.
- Duplicate in-flight GET requests are deduped in the frontend API adapter.

### Verification

Latest checks run successfully:

```bash
npm run build
red/bin/python backend/manage.py check
```

Local endpoint checks confirmed:

- `/api/listings/` returns 20 results with pagination metadata.
- `/api/listings/?page=2` returns the next 20 results.
- Listing detail responses include multiple image records.
- Frontend dev server responds at `http://127.0.0.1:5173/`.
- Backend dev server responds at `http://127.0.0.1:8001/`.

## Current Known State

- Frontend is Vite and should run from `frontend/`.
- Vite proxies `/api` and `/media` to `http://127.0.0.1:8001`.
- Django should run from the workspace root with:

```bash
red/bin/python backend/manage.py runserver 127.0.0.1:8001
```

- Redis server is not installed locally in this workspace.
- `django-redis` is available, but Django falls back to local-memory cache unless `REDIS_URL` is configured.
- The current database is SQLite at `backend/db.sqlite3`.
- `backend/db.sqlite3` is a local development artifact and should not be committed.

## Where To Pick Up

Recommended next work:

1. Split `frontend/src/pages/RouteScreens.tsx` into route-level modules.
2. Lazy-load route modules so inactive page code is not loaded with the current page.
3. Move route-specific data loading closer to the route modules.
4. Add focused frontend tests for:
   - public listing pagination
   - listing detail loading
   - filter-triggered location loading
   - no student-only requests on public browse
5. Add backend API tests for:
   - listing list pagination
   - lightweight listing serializer shape
   - listing detail image payloads
   - cache invalidation after listing changes
6. Confirm repository boundary and deployment shape before production preparation.
7. Replace local SQLite with environment-specific database configuration before deployment.
8. Configure production environment settings:
   - `SECRET_KEY`
   - `DEBUG`
   - `ALLOWED_HOSTS`
   - database URL
   - Redis URL
   - CORS/CSRF origins

## Push Readiness Notes

Before pushing, check that these are not committed:

- `frontend/node_modules/`
- `frontend/dist/`
- `red/`
- `backend/db.sqlite3`
- `backend/**/__pycache__/`
- local `.env` files
- large or sensitive files under `prev/` unless intentionally preserved
