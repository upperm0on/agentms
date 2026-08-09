# Listings

This is the core product domain. A listing represents a room offer controlled by an agent.

Previous system behavior:

- Hostel CRUD
- Hostel name, campus, status, category, gender type, images
- Room details as JSON
- Room UUIDs
- Room availability calculation
- Booking acceptance flag
- Auto-category logic
- Room price/capacity/gender/amenity handling

AgentMS direction:

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

Deep feature docs:

- [Listing CRUD](./features/listing-crud.md)
- [Availability Freshness](./features/availability-freshness.md)
- [Listing Media](./features/listing-media.md)
