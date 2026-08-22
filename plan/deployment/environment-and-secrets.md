# Environment And Secrets

All previous credentials from `prev/` must be treated as invalid and non-reusable.

Required future environment variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DATABASE_URL`
- `REDIS_URL`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `FRONTEND_ORIGIN`
- `VITE_API_BASE_URL`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`
- `MEDIA_STORAGE_BACKEND`
- `MEDIA_STORAGE_BUCKET`

Rules:

- Do not reuse old auth, payment, email, or Firebase keys.
- Production settings must be separated from development settings.
- Deployment must be repeatable from documented steps.

## Current EC2 HTTP Setup

For the current direct-IP deployment, keep the Vite frontend and Django API as separate origins until a reverse proxy is added:

```env
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=16.170.217.128
FRONTEND_ORIGIN=http://16.170.217.128:5173
CORS_ALLOWED_ORIGINS=http://16.170.217.128:5173
CSRF_TRUSTED_ORIGINS=http://16.170.217.128:5173
GOOGLE_OAUTH_REDIRECT_URI=http://16.170.217.128:8001/api/auth/google/callback/
VITE_API_BASE_URL=http://16.170.217.128:8001/api
```

With this setup, frontend requests should go to `http://16.170.217.128:8001/api/...`. Requests to `http://16.170.217.128:5173/api/...` only work when a production reverse proxy intentionally forwards `/api` from the frontend origin to Django.
