# Deployment Design Alignment

Deployment-related design should expose only product-facing operational states:

- Maintenance or outage messaging if needed.
- Email verification delivery failure state.
- Secure reset-token failure state.

Secrets, infrastructure configuration, and key handling are not UI concerns.

