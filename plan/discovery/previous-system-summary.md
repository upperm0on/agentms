# Previous System Summary

The `prev/` folder contains the failed but useful prior ecosystem.

## Previous Backend

Main project: `prev/hostel`

Stack:

- Django backend
- Django REST-style API endpoints
- SQLite/PostgreSQL configuration
- Paystack payment integration
- Email service and PDF generation
- Multi-role auth
- Separate apps for hostels, managers, consumers, reservations, payments, reviews, marketplace, locations, and categories

Important backend apps:

- `hq`: Core hostel/listing management
- `managers`: Manager profile and payment readiness
- `consumers`: Student/tenant occupancy tracking
- `reservations`: Reservation lifecycle and expiry
- `payments`: Payment records
- `payment_account`: Manager bank/subaccount setup
- `reviews` and `ratings`: Hostel feedback
- `location`: Ghana campus/region records
- `category`: Hostel categorization
- `user_auth`: User role, profile, gender, email verification
- `email_service`: Notifications, reminders, receipts, reports
- `entrepreneurs`: Marketplace stores, products/services, delivery, wallet-like transaction records

## Previous Frontends

Student hostel app:

- `prev/hostel_react`
- Browse/search hostels
- View hostel detail
- Reserve rooms
- Login/signup/email verification
- Help, campus guide, policies, safety pages
- Ratings/reviews
- Availability utilities

Manager app:

- `prev/hostel/hostel_manager`
- Manager-focused hostel CRUD
- Tenant tracking
- Reservations
- Payment setup
- Reports/analytics
- Multi-hostel manager workflow

Admin dashboard:

- `prev/hostel_admin`
- Hostels CRUD
- Users CRUD
- Reservations management
- Analytics and reports
- Dynamic database table management
- Admin login

Marketplace:

- `prev/hostel_market`
- Student sellers/entrepreneurs
- Stores
- Products and services
- Orders
- Wallet
- Delivery workflow
- Search/filtering
