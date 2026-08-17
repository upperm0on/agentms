# Admin Credentials for Database Management

## Test Admin User
- **Email**: testadmin@example.com
- **Password**: testpass123
- **Role**: Superuser (is_staff=True)

## How to Access Database Management

1. **Login to Admin App**
   - Go to the admin login page
   - Use the credentials above
   - The system will authenticate and provide a token

2. **Access Database Management**
   - Navigate to "Database" in the sidebar
   - All database tables will be automatically discovered
   - Full CRUD operations are available

## Security Features

- **Admin-Only Access**: Only users with `is_staff=True` can access database management
- **Token Authentication**: All API calls require valid admin tokens
- **Automatic Discovery**: New tables appear automatically without code changes
- **Full CRUD Operations**: Create, Read, Update, Delete any record in any table

## Available Tables

The system automatically discovers all these tables:

### Core Application Tables
- **hq_hostel** - Hostel information
- **managers_manager** - Manager accounts  
- **consumers_consumer** - Tenant information
- **payments_payment** - Payment records
- **reviews_reviews** - User reviews
- **reservations_reservation** - Booking reservations

### Supporting Tables
- **category_category** - Hostel categories
- **location_location** - Campus locations
- **payment_account_paymentaccount** - Manager payment accounts

### User Management Tables
- **user_auth_account_status** - User account status
- **user_auth_gender** - User gender information
- **user_auth_userprofile** - User profile details
- **user_auth_userverification** - Email verification

### Rating System Tables
- **ratings_one_star** through **ratings_five_star** - Rating breakdowns

## API Endpoints

### Authentication
```
POST /hq/api/admin-login/
```

### Database Management
```
GET /hq/api/admin/tables/ - Get all tables
GET /hq/api/admin/tables/{app_label}/{model_name}/ - Get table data
POST /hq/api/admin/tables/{app_label}/{model_name}/create/ - Create record
PUT /hq/api/admin/tables/{app_label}/{model_name}/{id}/ - Update record
DELETE /hq/api/admin/tables/{app_label}/{model_name}/{id}/delete/ - Delete record
```

All endpoints require `Authorization: Token <token>` header.

## Creating Additional Admin Users

To create more admin users, run:

```bash
cd /home/barimah/projects/hostel
python manage.py shell
```

Then in the shell:
```python
from django.contrib.auth.models import User
User.objects.create_superuser('newadmin', 'newadmin@example.com', 'password123')
```

Or make an existing user an admin:
```python
user = User.objects.get(email='user@example.com')
user.is_staff = True
user.is_superuser = True
user.save()
```
