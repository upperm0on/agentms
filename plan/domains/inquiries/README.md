# Inquiries

This domain replaces the old reservation-first workflow with a lead/contact workflow.

Previous system behavior:

- Student reservations
- Reservation expiry by room configuration
- Reservation status: pending, confirmed, cancelled, converted, full
- Reservation payment initiation and verification
- Manager confirmation/cancellation

AgentMS direction:

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

Deep feature docs:

- [Inquiry Workflow](./features/inquiry-workflow.md)
