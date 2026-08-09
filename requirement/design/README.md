# Design Requirements

The design requirement defines the stable design system for AgentMS. It covers two requirement layers:

- **Information requirements**: what users must be able to understand, compare, verify, or monitor.
- **Action requirements**: what users must be able to do through controls, workflows, and component behavior.

Every page should be assembled from approved UI components. Page work should not introduce new visual language, spacing rules, typography, interaction states, or responsive behavior unless this requirement is updated first.

## Documents

- [Foundations](./foundations.md): brand principles, design language, grid, typography, spacing, color, elevation, motion, accessibility, and component philosophy.
- [Component Inventory](./component-inventory.md): reusable component contracts for buttons, cards, tables, inputs, search, navigation, overlays, charts, calendar, and profile cards.
- [Design Review Checklist](./review-checklist.md): checkpoints for improving the base design requirements before moving to page design or implementation.

## Page Assembly Principle

Pages are composed from Lego-like building blocks:

1. Choose the user goal for the page.
2. Select the information components needed to explain state and context.
3. Select the action components needed to complete the workflow.
4. Arrange components using the approved grid, spacing, and responsive rules.
5. Verify states, variants, accessibility, and device behavior before page approval.

## Requirement Maturity

Each requirement should eventually be marked as one of:

- `Draft`: useful direction, still open to change.
- `Review`: ready for critique and refinement.
- `Stable`: safe for implementation.
- `Needs Revision`: blocked by missing context, conflict, or weak definition.

Current status: `Draft`.

