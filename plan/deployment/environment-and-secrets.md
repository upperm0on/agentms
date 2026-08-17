# Environment And Secrets

All previous credentials from `prev/` must be treated as invalid and non-reusable.

Required future environment variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DATABASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
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
