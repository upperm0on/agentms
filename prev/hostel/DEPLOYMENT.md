# StayPal Production Deployment Guide

## 📋 Project Overview

**StayPal** is a comprehensive hostel management system built with Django that provides:
- **Hostel Management**: Create, update, and manage hostel listings
- **Tenant Management**: Track active tenants and their details
- **Payment Processing**: Integrated Paystack payment system
- **Manager Dashboard**: Dedicated interface for hostel managers
- **Multi-subdomain Architecture**: Separate domains for different user types

### 🏗️ Project Structure
```
hostel/
├── hostel/                 # Main Django project
│   ├── settings/          # Environment-specific settings
│   │   ├── base.py        # Shared settings
│   │   ├── dev.py         # Development settings
│   │   └── prod.py        # Production settings
│   ├── urls.py            # Main URL configuration
│   └── wsgi.py            # WSGI application
├── hq/                    # Core hostel management app
├── managers/              # Manager-specific functionality
├── consumers/             # Tenant/consumer management
├── user_auth/             # Authentication system
├── payments/              # Payment processing
├── location/              # Location/campus management
├── category/              # Hostel categories
├── ratings/               # Rating system
├── reviews/               # Review system
├── templates/             # HTML templates
├── static/                # Static files (CSS, JS, images)
├── media/                 # User-uploaded media
└── logs/                  # Application logs
```

## 🚀 Local Production Testing

### 1. Test with Production Settings Locally

```bash
# Activate virtual environment
source workstation/bin/activate

# Install production dependencies
pip install -r requirements.txt

# Test with production settings (using SQLite for local testing)
DJANGO_SETTINGS_MODULE=hostel.settings.prod_test python manage.py check

# Run migrations
DJANGO_SETTINGS_MODULE=hostel.settings.prod_test python manage.py migrate

# Collect static files
DJANGO_SETTINGS_MODULE=hostel.settings.prod_test python manage.py collectstatic --noinput

# Test with Gunicorn
DJANGO_SETTINGS_MODULE=hostel.settings.prod_test gunicorn --config gunicorn.conf.py hostel.wsgi:application
```

### 2. Test Development Settings

```bash
# Normal development
python manage.py runserver 8080

# Or with explicit dev settings
DJANGO_SETTINGS_MODULE=hostel.settings.dev python manage.py runserver 8080
```

## 📦 Dependencies

### Python Packages (requirements.txt)
```
Django==4.1.2
djangorestframework==3.14.0
django-cors-headers==4.0.0
django-allauth==0.52.0
django-q==1.3.9
python-decouple==3.8
psycopg2-binary==2.9.5
gunicorn==21.2.0
whitenoise==6.5.0
Pillow==10.0.0
requests==2.31.0
```

### System Requirements
- **Python**: 3.8+ (tested with 3.13)
- **PostgreSQL**: 12+ (for production)
- **Nginx**: Latest stable version
- **Gunicorn**: 21.2.0+
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 20GB disk space

## 🏗️ EC2 Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib nginx -y

# Create project directory
sudo mkdir -p /home/ubuntu/staypal
sudo chown ubuntu:ubuntu /home/ubuntu/staypal

# Create logs directory
sudo mkdir -p /home/ubuntu/staypal/logs
sudo chown ubuntu:ubuntu /home/ubuntu/staypal/logs
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Run the database setup script
\i /home/ubuntu/staypal/database_setup.sql

# Exit postgres
\q
```

### 3. Application Deployment

```bash
# Clone your repository
cd /home/ubuntu/staypal
git clone <your-repo-url> .

# Create virtual environment
python3 -m venv workstation
source workstation/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your production values

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

### 4. Gunicorn Service Setup

```bash
# Copy systemd service file
sudo cp staypal.service /etc/systemd/system/

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable staypal
sudo systemctl start staypal

# Check status
sudo systemctl status staypal
```

### 5. Nginx Configuration

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/staypal
sudo ln -s /etc/nginx/sites-available/staypal /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## 🔧 Environment Variables

Create a `.env` file in your project root with:

```env
# Django Configuration
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False

# Database Configuration
DB_NAME=staypal
DB_USER=staypaluser
DB_PASS=supersecurepassword
DB_HOST=localhost
DB_PORT=5432

# Paystack Configuration (Test Keys - Replace with Live Keys for Production)
PAYSTACK_PUBLIC_KEY=pk_test_edb5f4f28031c270ab3c34258aa859b3f7e70495
PAYSTACK_SECRET_KEY=sk_test_dd824ddf3dcfdca8ba6293dfed882079ae1cc2bb

# Google OAuth Configuration
SOCIAL_AUTH_GOOGLE_CLIENT_ID=826839521219-9u0v1qimobnrfnt7plch3nlr8phsnsia.apps.googleusercontent.com
SOCIAL_AUTH_GOOGLE_SECRET=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

# Email Configuration (Hostinger SMTP)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=developers@kwabenaboakyeroyalventures.com
EMAIL_HOST_PASSWORD=Khemikalx@08

# Admin Configuration
ADMIN_URL=super-secret-admin/

# EC2 Configuration
EC2_PUBLIC_IP=your-ec2-public-ip-here
```

## 📡 API Endpoints

### Authentication
- `POST /hq/api/login/` - Manager/User login with custom authentication
- `POST /hq/api/signup/` - User registration

### Hostel Management
- `GET /hq/api/hostels/` - List all hostels
- `GET /hq/api/landing_page/` - Landing page data
- `POST /hq/api/manager/create_hostel/` - Create new hostel
- `GET|POST /hq/api/manager/update_or_create/` - Update or create hostel (auto-detects)

### Tenant Management
- `GET /hq/api/manager/tenants/` - Get manager's active tenants
- `POST /hq/api/payments/consumer_request/` - Tenant payment requests

### Payment Processing
- `POST /hq/api/payments/` - Initiate payment
- `POST /hq/api/payments/verify/` - Verify payment
- `POST /hq/api/payments/paystack_callback` - Paystack webhook

### Search & Discovery
- `POST /hq/api/search_request/` - Campus-based hostel search

### Banking
- `GET /hq/api/manager/banks/` - Get banking details

## 🗄️ Database Models

### Core Models
- **User**: Django's built-in user model
- **Manager**: Links to User, manages hostels
- **Hostel**: Main hostel entity with JSON fields for details
- **Consumer**: Tenant/renter information
- **Payment**: Payment records and history
- **Location**: Campus/university locations
- **Category**: Hostel categories
- **Reviews**: User reviews and ratings

### Key Features
- **JSON Fields**: `additional_details` and `room_details` for flexible data storage
- **Image Uploads**: Hostel and room images via `ImageField`
- **Foreign Key Relationships**: Proper relational data structure
- **Status Tracking**: Active/inactive states for tenants and hostels

## 🌐 URL Structure

### Main Application URLs
```
/                           # Landing page
/dashboard/                 # Main dashboard
/landing_page/             # Landing page (alternative)
/super-secret-admin/       # Django admin (custom URL)
```

### HQ (Core) URLs
```
/hq/add_hostel/            # Add hostel form
/hq/update_hostel/<id>/    # Update hostel form
/hq/read_hostel/           # List hostels
/hq/search_hostel/<rooms>/ # Search hostels by room count
/hq/detail_hostel/<id>/    # Hostel details
/hq/confirm_payment/       # Payment confirmation
/hq/man_search/           # Manual search
```

### Manager URLs
```
/managers/                 # Manager-specific views
```

### Consumer URLs
```
/consumer/                 # Consumer/tenant views
```

### Authentication URLs
```
/authenticate/             # User authentication
```

### Category & Review URLs
```
/category/                 # Hostel categories
/review/                   # Reviews and ratings
```

## 🔧 Configuration Files

### Settings Structure
- **base.py**: Shared settings for all environments
- **dev.py**: Development-specific settings (SQLite, DEBUG=True)
- **prod.py**: Production settings (PostgreSQL, security, logging)
- **prod_test.py**: Production-like settings with SQLite for local testing

### Key Configuration Files
- **gunicorn.conf.py**: Gunicorn server configuration
- **staypal.service**: Systemd service file
- **nginx.conf**: Nginx reverse proxy configuration
- **database_setup.sql**: PostgreSQL database setup script
- **.env**: Environment variables (not in version control)

## 📊 Monitoring and Logs

### View Logs

```bash
# Django application logs
tail -f /home/ubuntu/staypal/logs/django_errors.log

# Gunicorn access logs
tail -f /home/ubuntu/staypal/logs/gunicorn_access.log

# Gunicorn error logs
tail -f /home/ubuntu/staypal/logs/gunicorn_error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Service Management

```bash
# Restart services
sudo systemctl restart staypal
sudo systemctl restart nginx

# Check service status
sudo systemctl status staypal
sudo systemctl status nginx

# View service logs
sudo journalctl -u staypal -f
sudo journalctl -u nginx -f
```

## 🔒 Security Checklist

- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY
- [ ] Secure database passwords
- [ ] Custom admin URL
- [ ] SSL certificates configured
- [ ] Firewall rules set
- [ ] Regular security updates
- [ ] Backup strategy implemented

## 🚨 Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure ubuntu user owns all files
2. **Database Connection**: Check PostgreSQL is running and credentials are correct
3. **Static Files**: Run `collectstatic` and check nginx configuration
4. **Port Conflicts**: Ensure ports 80, 443, and 8000 are available
5. **Virtual Environment Issues**: If packages aren't found, recreate the virtual environment
6. **Django Q Issues**: If `q_cluster` command not found, check django-q installation

### Debug Commands

```bash
# Check Django configuration
python manage.py check --deploy

# Test database connection
python manage.py dbshell

# Verify static files
python manage.py findstatic admin/css/base.css

# Check nginx configuration
sudo nginx -t

# Test gunicorn manually
gunicorn --config gunicorn.conf.py hostel.wsgi:application

# Check Django Q cluster status
python manage.py q_cluster

# Verify virtual environment
which python
pip list
```

### Virtual Environment Recovery

If you encounter `ModuleNotFoundError` issues:

```bash
# Remove corrupted virtual environment
rm -rf workstation

# Create new virtual environment
python3 -m venv workstation

# Activate and install dependencies
source workstation/bin/activate
pip install -r requirements.txt

# Verify installation
pip list
python manage.py check
```

## 🔄 Django Q Configuration

The project uses Django Q for background task processing:

```python
# In settings/base.py (currently commented out due to compatibility issues)
Q_CLUSTER = {
    'name': 'hosttels-cluster',
    'workers': 4,
    'recycle': 500,
    'timeout': 60,
    'retry': 120,
    'queue_limit': 50,
    'bulk': 10,
    'orm': 'default',
}
```

To start the Django Q cluster:
```bash
python manage.py q_cluster
```

## 🎯 Production Checklist

### Pre-Deployment
- [ ] Update `SECRET_KEY` in `.env`
- [ ] Replace Paystack test keys with live keys
- [ ] Update Google OAuth credentials for production domain
- [ ] Set `DEBUG=False` in production settings
- [ ] Configure SSL certificates
- [ ] Set up proper firewall rules
- [ ] Create database backup strategy

### Post-Deployment
- [ ] Test all API endpoints
- [ ] Verify payment processing
- [ ] Check email functionality
- [ ] Monitor application logs
- [ ] Set up automated backups
- [ ] Configure monitoring alerts
- [ ] Test failover procedures

## 📈 Performance Optimization

### Database
- Use PostgreSQL connection pooling
- Implement database indexing for frequently queried fields
- Regular database maintenance and cleanup

### Static Files
- Use CDN for static file delivery
- Enable gzip compression in Nginx
- Implement browser caching headers

### Application
- Enable Django's caching framework
- Use Redis for session storage
- Implement database query optimization
- Monitor and optimize slow queries

## 🔐 Security Best Practices

### Django Security
- Use strong, unique `SECRET_KEY`
- Enable all security middleware
- Implement proper CSRF protection
- Use HTTPS in production
- Regular security updates

### Server Security
- Keep system packages updated
- Use fail2ban for intrusion prevention
- Implement proper firewall rules
- Regular security audits
- Monitor access logs

### Application Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure file upload handling
- Regular dependency updates


