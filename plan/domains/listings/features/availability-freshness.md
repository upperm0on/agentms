# Availability Freshness

Availability freshness is a first-class AgentMS feature.

Freshness states:

- Fresh: confirmed within 48 hours.
- Aging: confirmed within 3-7 days.
- Stale: not confirmed for more than 7 days.
- Expired: not confirmed for more than 14 days.

Behavior:

- Fresh listings rank higher.
- Aging listings remain visible but should display weaker confidence.
- Stale listings should be downgraded and trigger agent reminders.
- Expired listings should be hidden or heavily downgraded.

Required fields:

- Availability status
- Last confirmed at
- Available slots
- Capacity

Rules:

- Available slots cannot exceed capacity.
- Full listings should not appear as available.
- Refreshing availability must update `last_confirmed_at`.
