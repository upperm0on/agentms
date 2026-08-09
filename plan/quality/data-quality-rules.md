# Data Quality Rules

## Listing Freshness

- Fresh: confirmed within 48 hours.
- Aging: confirmed within 3-7 days.
- Stale: not confirmed for more than 7 days.
- Expired: not confirmed for more than 14 days, hidden or heavily downgraded.

## Listing Duplication

- Same property + same room type + same price + same agent should be blocked or warned.
- Same property listed by multiple agents should be allowed but monitored.

## Availability

- Available slots cannot exceed capacity.
- Full listings should not appear as available.
- Published listings must have price, campus/location, room type, and contactable agent.

## Agent Trust

- Verified agents rank higher.
- Agents with stale listings rank lower.
- Reported listings reduce listing visibility until reviewed.
