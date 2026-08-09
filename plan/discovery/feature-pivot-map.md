# Feature Pivot Map

This file maps previous manager-centered product areas into the new agent-centered AgentMS scope.

## Identity And Access

Previous features:

- User signup/login/logout
- Google OAuth
- Email verification
- Account status: consumer or manager
- User profile with phone
- Gender field
- Admin login
- Role-based access

AgentMS pivot:

- Replace `manager` as primary business role with `agent`.
- Keep `student` as demand-side role.
- Keep `admin` for platform operations.
- Add agent verification state.
- Add agent contact channels.
- Add agent operating campuses/areas.
- Add trust and moderation metadata.

Target roles:

- Student
- Agent
- Admin
- Optional future role: Property Contact, for hostel manager/porter/caretaker collaboration

## Hostel And Room Listings

Previous features:

- Hostel CRUD
- Hostel name, campus, status, category, gender type, images
- Room details as JSON
- Room UUIDs
- Room availability calculation
- Booking acceptance flag
- Auto-category logic
- Room price/capacity/gender/amenity handling

AgentMS pivot:

- Agent-owned listing CRUD is the core feature.
- A listing is not necessarily an official hostel-managed property record.
- A listing should represent what an agent currently has access to or has been told is available.
- Availability freshness matters as much as availability itself.
- Room details should become structured models instead of one large JSON blob.
- Listings should support verification and confidence indicators.

Core listing concepts:

- Property/hostel
- Room type
- Room availability batch
- Listing source
- Agent ownership
- Availability status
- Last confirmed date/time
- Media gallery
- Pricing
- Location/campus proximity
- Rules and amenities

## Reservation And Lead Flow

Previous features:

- Student reservations
- Reservation expiry by room configuration
- Reservation status: pending, confirmed, cancelled, converted, full
- Reservation payment initiation and verification
- Manager confirmation/cancellation

AgentMS pivot:

- First release should avoid complex direct booking/payment unless required.
- Start with lead/contact flow: student expresses interest, agent follows up.
- Track inquiry state so agents can manage demand.
- Keep reservation-like concepts for future escalation.

MVP lead states:

- New
- Contacted
- Viewing Scheduled
- Negotiating
- Closed Won
- Closed Lost
- Spam/Invalid

Future reservation states:

- Requested
- Agent Accepted
- Deposit Pending
- Deposit Paid
- Room Held
- Converted
- Expired
- Cancelled

## Payments

Previous features:

- Paystack payment initiation/verification
- Manager payment readiness
- Manager bank account/subaccount setup
- Platform fee percentage
- Reservation deposits
- Payment receipts

AgentMS pivot:

- Payments are not MVP-critical unless the business requires paid agent leads, deposits, subscriptions, or commissions.
- New keys and auth must be generated; do not reuse old secrets.
- Payment design should be deferred until listing and inquiry workflows are stable.

Potential future payment models:

- Agent subscription
- Pay-per-lead
- Featured listings
- Student deposit escrow
- Agent commission tracking

## Reviews, Ratings, And Trust

Previous features:

- Hostel reviews
- Hostel ratings
- Basic star models

AgentMS pivot:

- Trust should shift from only hostel rating to agent and listing reliability.
- Track whether listings are accurate and whether agents respond.
- Let students report stale, fake, duplicate, or misleading listings.

Trust features:

- Agent verification badge
- Agent response rate
- Agent listing freshness score
- Listing report flow
- Admin moderation
- Optional student review after contact or successful room acquisition

## Location And Discovery

Previous features:

- Ghana tertiary campus fixture
- Location model with region, campus, abbreviation
- Campus search
- Hostel search and advanced search
- Categories
- Gender filtering
- Pricing utilities

AgentMS pivot:

- Campus and area-based search remain essential.
- Discovery should prioritize available rooms near campus and reliable agents.
- Filters must reflect real student search behavior.

Search/filter dimensions:

- Campus
- Area/neighborhood
- Price range
- Room occupancy
- Gender restriction
- Availability status
- Last confirmed freshness
- Amenities
- Distance or transport notes
- Agent verified/unverified

## Notifications And Email

Previous features:

- Email verification
- Reservation confirmation
- Payment confirmation
- Reservation reminders
- Login alerts
- Maintenance notifications
- Daily summaries
- Occupancy reports
- Admin/manager action notifications

AgentMS pivot:

- Keep transactional notifications, but scope them tightly.
- Email/SMS/WhatsApp should support agent workflows and student inquiries.

MVP notifications:

- Email verification
- New inquiry to agent
- Inquiry confirmation to student
- Listing stale reminder to agent
- Admin verification decision

Future notifications:

- Viewing reminders
- Deposit/payment receipts
- Weekly agent performance summary
- Student saved-search alerts

## Admin Operations

Previous features:

- Admin dashboard
- System stats
- Hostels/users/reservations CRUD
- Analytics
- Dynamic database management

AgentMS pivot:

- Admin operations should focus on platform trust, agent onboarding, moderation, and data quality.
- Avoid exposing raw dynamic table edits as a primary admin feature in the new product.

Admin modules:

- Agent verification queue
- Listing moderation queue
- Reported listings
- User management
- Campus/location management
- Analytics
- Audit logs

## Marketplace

Previous features:

- Store creation
- Product/service listing
- Orders
- Wallet
- Delivery
- Seller/entrepreneur flow

AgentMS pivot:

- Marketplace is out of scope for the first AgentMS release.
- Useful reusable concepts: listing CRUD, seller dashboard patterns, image upload, search, moderation, transaction states.
- Do not merge marketplace into the initial domain model.
