# Gunicorn configuration file
import multiprocessing
import os

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

accesslog = os.path.join(LOGS_DIR, "gunicorn_access.log")
errorlog = os.path.join(LOGS_DIR, "gunicorn_error.log")
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "staypal_gunicorn"

# Server mechanics
daemon = False
pidfile = os.path.join(BASE_DIR, "gunicorn.pid")
user = None  # Will use current user for local testing
group = None  # Will use current group for local testing
tmp_upload_dir = None

# SSL (uncomment if using SSL)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Environment variables
raw_env = [
    'DJANGO_SETTINGS_MODULE=hostel.settings.prod',
]

# Preload app for better performance
preload_app = True

# Worker timeout
graceful_timeout = 30

# Forwarded allow ips (for nginx proxy)
forwarded_allow_ips = "127.0.0.1"
