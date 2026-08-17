# Authentication Flow

MVP authentication features:

- Student signup/login
- Agent signup/login
- Admin login
- Email verification
- Password reset
- Role-based protected routes

Core expectations:

- A user account must have one primary platform role.
- Authenticated endpoints must derive permissions from the user role, not from frontend route state.
- Email verification should be required before sensitive workflows.
- Admin login should be separated in the UI, even if the backend auth mechanism is shared.

Deferred:

- Google OAuth
- Multi-role switching
- Organization/team accounts
