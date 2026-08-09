# MVP Scope

## Included

Authentication:

- Student signup/login
- Agent signup/login
- Admin login
- Email verification
- Password reset
- Role-based protected routes

Agent profile:

- Create profile
- Update profile
- Phone and WhatsApp contact
- Operating campuses/areas
- Verification status
- Profile photo or business logo

Listings:

- Create listing
- Read own listings
- Update listing
- Delete or archive listing
- Publish/unpublish listing
- Upload listing images
- Add room types
- Set price
- Set gender restriction
- Set capacity and available slots
- Set amenities
- Set room rules
- Set location/campus
- Mark listing available/unavailable/full
- Refresh availability timestamp

Student discovery:

- Browse listings
- Search by campus/area
- Filter by price, gender, occupancy, availability, freshness
- View listing details
- View agent profile summary
- Contact or submit inquiry
- Start a one-time booking/payment intent without creating an account
- Create or log into a student account only when saving preferences, history, saved rooms, or portal access

Inquiries:

- Student sends inquiry
- Agent sees inquiry list
- Agent updates inquiry status
- Student receives confirmation
- Admin can inspect inquiry records when needed

Admin:

- View agents
- Approve/reject/suspend agents
- View listings
- Approve/hide/remove listings
- View reported listings
- Manage campus/location data
- Basic platform stats

Payments:

- Guest checkout/payment intent creation must not require authentication.
- Authenticated student accounts are required only for remembered preferences, saved rooms, payment history, inquiry history, and portal features.
- Guest payment records must collect enough contact detail for follow-up: name, email, and phone.
- Guest payment records may later be claimed by a student account after verification.

Notifications:

- Email verification
- New inquiry notification
- Stale listing reminder
- Admin verification result

## Excluded

- Full hostel manager dashboard
- Tenant/occupancy management after move-in
- Direct online room booking
- Real Paystack deposit/payment capture
- Marketplace stores/products/delivery
- Wallets
- Advanced analytics
- PDF reports
- In-app chat
- Native mobile app
- AI recommendations

These may be added after the core agent/listing/inquiry loop works.
