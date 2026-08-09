# Non-Functional Requirements

## Security

- New secrets only.
- Environment variables for all credentials.
- Role-based API permissions.
- Media upload validation.
- Rate limiting for login, inquiry, and reports.
- Audit log for admin actions.

## Performance

- Listing browse page should support pagination.
- Search/filter endpoints should be indexed.
- Images should be optimized.
- Admin analytics should avoid heavy runtime queries for large datasets.

## Reliability

- Availability refresh must be timestamped.
- Inquiry creation should send notification but still persist if email sending fails.
- Failed notifications should be retryable.

## Maintainability

- Avoid JSON blobs for core listing data.
- Keep marketplace out of MVP modules.
- Keep business logic in services where it crosses model/view boundaries.
- Keep API serializers explicit.
