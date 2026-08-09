# Payments

Payment capture is deferred from MVP, but the auth boundary is now defined.

Students must be able to start a one-time booking/payment intent without an authenticated account. Authentication is required only when the student wants AgentMS to remember preferences, saved rooms, inquiry history, payment history, and other student portal features.

Previous system behavior:

- Paystack payment initiation/verification
- Manager payment readiness
- Manager bank account/subaccount setup
- Platform fee percentage
- Reservation deposits
- Payment receipts

AgentMS direction:

- Guest checkout/payment intent creation must not require login.
- Student portal history and preference storage must require login.
- Payment capture is not MVP-critical unless the business requires paid agent leads, deposits, subscriptions, or commissions.
- New keys and auth must be generated; do not reuse old secrets.
- Provider-specific payment design should be deferred until listing and inquiry workflows are stable.

Potential future payment models:

- Agent subscription
- Pay-per-lead
- Featured listings
- Student deposit escrow
- Agent commission tracking
