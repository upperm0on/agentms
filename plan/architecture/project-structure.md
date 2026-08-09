# Project Structure

Current workspace has a fresh `backend/` Django project and `frontend/` React TypeScript app. Keep this structure, but split the backend into clear domain apps.

```text
agentms/
├── PROJECT_PLAN.md
├── plan/
├── backend/
│   ├── manage.py
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/
│   │   ├── agents/
│   │   ├── locations/
│   │   ├── listings/
│   │   ├── inquiries/
│   │   ├── moderation/
│   │   ├── notifications/
│   │   └── analytics/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   └── env.py
│   ├── media/
│   ├── static/
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── app/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── assets/
│   └── public/
└── docs/
```

Backend app expectation:

- Each domain app owns `models.py`, `serializers.py`, `views.py`, `urls.py`, `services.py`, and `tests/` when applicable.

Frontend expectation:

- App shell and routing live under `src/app/`.
- Backend clients live under `src/api/`.
- User-facing workflows live under `src/features/`.
- Route-level screens live under `src/pages/`.
