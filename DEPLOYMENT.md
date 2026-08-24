# AgentMS Debian EC2 Deployment

This deployment keeps the existing SQLite database, migrations, media files, and secrets in place. Do not delete `backend/db.sqlite3`, `backend/media/`, existing migrations, or the production environment file.

## Architecture

- React is built separately and served by Nginx from `/var/www/agentms`.
- Nginx proxies `/api/` to Gunicorn at `http://127.0.0.1:8000`.
- Django WSGI module: `backend.wsgi:application`.
- Backend working directory: `/home/admin/agentms/backend`.
- Backend virtual environment: `/home/admin/agentms/backend/venv`.
- Current database: SQLite at `/home/admin/agentms/backend/db.sqlite3` unless `DATABASE_URL` is set.
- Django static files are collected to `/home/admin/agentms/backend/staticfiles`.
- User-uploaded media files live in `/home/admin/agentms/backend/media`.

## Required Secrets And Decisions

Create `/etc/agentms/backend.env` with production values before starting the service:

```ini
SECRET_KEY=replace-with-a-long-random-production-secret
DEBUG=false
ALLOWED_HOSTS=your-domain.example.com,server-public-ip,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://your-domain.example.com,http://server-public-ip
CORS_ALLOWED_ORIGINS=https://your-domain.example.com,http://server-public-ip
FRONTEND_ORIGIN=https://your-domain.example.com
DATABASE_URL=
REDIS_URL=
STATIC_URL=/static/
STATIC_ROOT=/home/admin/agentms/backend/staticfiles
MEDIA_URL=/media/
MEDIA_ROOT=/home/admin/agentms/backend/media
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=Lax
CSRF_COOKIE_SAMESITE=Lax
SECURE_SSL_REDIRECT=false
SECURE_HSTS_SECONDS=0
SECURE_HSTS_INCLUDE_SUBDOMAINS=false
SECURE_HSTS_PRELOAD=false
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=https://your-domain.example.com/api/auth/google/callback/
```

Use `SESSION_COOKIE_SECURE=false` and `CSRF_COOKIE_SECURE=false` only if serving over plain HTTP. Use `SECURE_SSL_REDIRECT=true` only after Nginx is configured for HTTPS and forwards `X-Forwarded-Proto`. Set `SECURE_HSTS_SECONDS` only after HTTPS is verified for the whole site because HSTS is intentionally sticky in browsers.

## Backend Commands

Run from the project root unless noted:

```bash
cd /home/admin/agentms/backend
/home/admin/agentms/backend/venv/bin/python -m pip install --upgrade pip
/home/admin/agentms/backend/venv/bin/python -m pip install -r requirements.txt
/home/admin/agentms/backend/venv/bin/python manage.py check
env $(grep -v '^#' /etc/agentms/backend.env | xargs) /home/admin/agentms/backend/venv/bin/python manage.py check --deploy
env $(grep -v '^#' /etc/agentms/backend.env | xargs) /home/admin/agentms/backend/venv/bin/python manage.py migrate
env $(grep -v '^#' /etc/agentms/backend.env | xargs) /home/admin/agentms/backend/venv/bin/python manage.py collectstatic --noinput
```

Manual Gunicorn verification:

```bash
cd /home/admin/agentms/backend
set -a
. /etc/agentms/backend.env
set +a
/home/admin/agentms/backend/venv/bin/gunicorn --bind 127.0.0.1:8000 backend.wsgi:application
```

In another shell:

```bash
curl -I http://127.0.0.1:8000/api/listings/
```

Stop the manual Gunicorn process with `Ctrl+C` before starting systemd.

## systemd

Create `/etc/systemd/system/agentms-backend.service`:

```ini
[Unit]
Description=AgentMS Django backend
After=network.target

[Service]
User=admin
Group=www-data
WorkingDirectory=/home/admin/agentms/backend
EnvironmentFile=/etc/agentms/backend.env
ExecStart=/home/admin/agentms/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 backend.wsgi:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable agentms-backend
sudo systemctl start agentms-backend
sudo systemctl status agentms-backend --no-pager
sudo journalctl -u agentms-backend -n 80 --no-pager
```

## Nginx

Keep the existing React root:

```nginx
root /var/www/agentms;
index index.html;

location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /static/ {
    alias /home/admin/agentms/backend/staticfiles/;
}

location /media/ {
    alias /home/admin/agentms/backend/media/;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Test and reload safely:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verification

```bash
sudo systemctl status agentms-backend --no-pager
sudo journalctl -u agentms-backend -n 80 --no-pager
curl -I http://127.0.0.1:8000/api/listings/
curl -I http://127.0.0.1/api/listings/
curl -I http://your-domain.example.com/api/listings/
curl -I http://your-domain.example.com/
```
