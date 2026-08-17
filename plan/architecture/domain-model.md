# Domain Model

## Account

Purpose:

- Represents authentication identity and platform role.

Fields:

- `id`
- `email`
- `password`
- `first_name`
- `last_name`
- `phone`
- `role`: student, agent, admin
- `is_email_verified`
- `is_active`
- `created_at`
- `updated_at`

## AgentProfile

Purpose:

- Represents the public and operational profile of a room agent.

Fields:

- `id`
- `user`
- `display_name`
- `business_name`
- `bio`
- `phone`
- `whatsapp_number`
- `profile_photo`
- `verification_status`: unsubmitted, pending, verified, rejected, suspended
- `verification_notes`
- `operating_locations`
- `response_rate`
- `listing_freshness_score`
- `created_at`
- `updated_at`

## Location

Purpose:

- Represents campus, region, and nearby areas.

Fields:

- `id`
- `region`
- `campus`
- `abbreviation`
- `city`
- `area`
- `is_active`

## Property

Purpose:

- Represents a hostel/property that may have listings from one or more agents.

Fields:

- `id`
- `name`
- `location`
- `address_text`
- `landmark`
- `property_type`: hostel, apartment, chamber_and_hall, single_room, other
- `gender_policy`: male, female, mixed, unknown
- `amenities`
- `created_at`
- `updated_at`

Important design note:

- A property should not automatically belong to an agent forever. Multiple agents may list rooms from the same hostel. Admin moderation can later merge duplicate properties.

## Listing

Purpose:

- Represents a room offer controlled by an agent.

Fields:

- `id`
- `agent`
- `property`
- `title`
- `description`
- `status`: draft, published, unpublished, archived, removed
- `availability_status`: available, few_left, full, unknown
- `last_confirmed_at`
- `price_amount`
- `price_period`: month, semester, academic_year, year
- `deposit_amount`
- `agent_fee_amount`
- `negotiable`
- `gender_restriction`: male, female, mixed, any
- `room_type`: single, shared, two_in_room, three_in_room, four_in_room, dormitory, apartment, other
- `capacity`
- `available_slots`
- `amenities`
- `rules`
- `source_type`: manager, porter, owner, caretaker, agent_verified, unknown
- `source_name_optional`
- `moderation_status`: pending, approved, flagged, rejected
- `created_at`
- `updated_at`

## ListingImage

Purpose:

- Stores listing media.

Fields:

- `id`
- `listing`
- `image`
- `caption`
- `sort_order`
- `is_cover`
- `created_at`

## Inquiry

Purpose:

- Tracks a student's interest in a listing.

Fields:

- `id`
- `student`
- `listing`
- `agent`
- `message`
- `student_phone`
- `preferred_contact_method`: phone, whatsapp, email
- `status`: new, contacted, viewing_scheduled, negotiating, closed_won, closed_lost, spam
- `agent_notes`
- `created_at`
- `updated_at`

## ListingReport

Purpose:

- Lets students/admins flag bad listings.

Fields:

- `id`
- `listing`
- `reported_by`
- `reason`: stale, fake, wrong_price, wrong_location, duplicate, abusive_agent, other
- `details`
- `status`: open, reviewing, resolved, dismissed
- `created_at`
- `updated_at`

## VerificationRequest

Purpose:

- Tracks agent verification submissions.

Fields:

- `id`
- `agent`
- `id_document`
- `selfie_or_profile_photo`
- `supporting_notes`
- `status`: pending, approved, rejected
- `reviewed_by`
- `reviewed_at`
- `created_at`

## AuditLog

Purpose:

- Records sensitive actions.

Fields:

- `id`
- `actor`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `created_at`
