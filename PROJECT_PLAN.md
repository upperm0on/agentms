# AgentMS Project Plan

The full project plan is organized under [plan/](./plan/README.md).

This root file is intentionally short. AgentMS prioritizes organization over dumping every decision into one document.

Start here:

- [Plan Index](./plan/README.md)
- [Project Grounding](./plan/phases/00-project-grounding.md)
- [Feature Pivot Map](./plan/discovery/feature-pivot-map.md)
- [MVP Scope](./plan/requirements/mvp-scope.md)
- [Proposed Project Structure](./plan/architecture/project-structure.md)
- [Build Order](./plan/roadmap/build-order.md)

Stable decisions:

- AgentMS is agent-first.
- Managers are not the MVP user target.
- Listings are agent-owned.
- Availability freshness is a first-class feature.
- Marketplace and real payment capture are deferred from MVP.
- Guest payment intent creation must not require authentication; remembered history and preferences require a student account.
- Old credentials from `prev/` must not be reused.
- Waterfall artifacts must be completed and reviewed before broad implementation.
