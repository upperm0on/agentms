# Identity And Access

This domain owns authentication, user role assignment, session/token handling, and account-level security.

Previous system behavior:

- User signup/login/logout
- Google OAuth
- Email verification
- Account status: consumer or manager
- User profile with phone
- Gender field
- Admin login
- Role-based access

AgentMS direction:

- Replace `manager` as the primary business role with `agent`.
- Keep `student` as the demand-side role.
- Keep `admin` for platform operations.
- Add agent verification state through the agents domain.
- Add role-based route and API permissions from the start.

Target roles:

- Student
- Agent
- Admin
- Optional future role: Property Contact

Deep feature docs:

- [Authentication Flow](./features/authentication-flow.md)
