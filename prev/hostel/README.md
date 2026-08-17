# 🏠 Hostel Management System

A comprehensive hostel management platform built with Django and React, featuring multi-role access, payment processing, and real-time analytics.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (for production)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hostel
```

2. **Set up Python environment**
```bash
# Create virtual environment
python -m venv workstation
source workstation/bin/activate  # On Windows: workstation\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

3. **Configure environment variables**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

4. **Set up database**
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

5. **Start development server**
```bash
python manage.py runserver
```

## 🏗️ Project Structure

```
hostel/
├── hostel/                 # Django project settings
│   ├── settings/
│   │   ├── base.py        # Shared settings
│   │   ├── dev.py         # Development settings
│   │   └── prod.py        # Production settings
│   └── urls.py
├── hq/                    # Core hostel management
├── managers/              # Manager functionality
├── consumers/             # Consumer/tenant features
├── payments/              # Payment processing
├── reservations/          # Booking management
├── user_auth/             # Authentication system
├── email_service/         # Email notifications
└── requirements.txt       # Python dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Development uses SQLite by default)
# For production PostgreSQL:
# DB_NAME=staypal
# DB_USER=staypaluser
# DB_PASS=supersecurepassword
# DB_HOST=localhost
# DB_PORT=5432

# Email Configuration
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password

# Payment Configuration
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key

# Admin Security
ADMIN_URL=super-secret-admin/
```

## 🚀 Deployment

### Development
```bash
# Use development settings
python manage.py runserver
```

### Production
```bash
# Use production settings
DJANGO_SETTINGS_MODULE=hostel.settings.prod python manage.py runserver

# Or with Gunicorn
DJANGO_SETTINGS_MODULE=hostel.settings.prod gunicorn --config gunicorn.conf.py hostel.wsgi:application
```

## 📱 Frontend Applications

This backend serves three React applications:

1. **Consumer App** (`hostel_react/`) - For students/tenants
2. **Manager App** (`hostel_manager/`) - For hostel managers  
3. **Admin App** (`hostel_admin/`) - For system administrators

## 🔐 Security Features

- **Token-based authentication** for API access
- **Role-based permissions** (Consumer, Manager, Admin)
- **CSRF protection** enabled
- **Secure admin URL** (configurable)
- **Environment-based secrets** management
- **CORS configuration** for frontend integration

## 📊 Key Features

### For Consumers
- Browse and search hostels
- Make reservations
- Manage payments
- Rate and review hostels

### For Managers
- Manage hostel details
- Track tenants and occupancy
- Process payments
- Generate reports
- Switch between multiple hostels

### For Administrators
- System-wide oversight
- User management
- Analytics and reporting
- Database management

## 🛠️ API Endpoints

### Authentication
- `POST /hq/api/login/` - User login
- `POST /hq/api/logout/` - User logout

### Hostels
- `GET /hq/api/hostels/` - List hostels
- `POST /hq/api/hostels/` - Create hostel
- `GET /hq/api/hostels/{id}/` - Get hostel details

### Reservations
- `GET /hq/api/reservations/` - List reservations
- `POST /hq/api/reservations/` - Create reservation
- `GET /hq/api/manager/reservations/` - Manager reservations

### Payments
- `GET /hq/api/payments/` - List payments
- `POST /hq/api/payments/` - Process payment

## 📧 Email System

Automated email notifications for:
- Reservation confirmations
- Payment receipts
- Account verification
- System alerts

## 🔍 Monitoring

- **Error logging** to `logs/django_errors.log`
- **Performance monitoring** with Django Debug Toolbar (development)
- **Email notifications** for critical errors

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email developers@kwabenaboakyeroyalventures.com