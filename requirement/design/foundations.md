# Design Foundations

Status: `Draft`

These foundations define things that should almost never change. They should be improved before detailed page design begins.

## Brand Principles

### Information Requirements

- The product must feel trustworthy, operational, and clear.
- Users must quickly understand which data is current, pending, stale, missing, or requires action.
- Important records must expose ownership, status, dates, and next steps.
- The interface must make verification and accountability visible without overwhelming the page.

### Action Requirements

- Primary actions must be obvious and limited to the most important workflow on a screen.
- Destructive, irreversible, or high-impact actions must require confirmation.
- Repeated operational tasks must be efficient, predictable, and keyboard-accessible where practical.
- The product must guide users toward completing data freshness, listing management, and follow-up tasks.

## Design Language

### Information Requirements

- The visual language must prioritize scanability over decoration.
- Status, hierarchy, and grouping must be visible through layout, type, color, iconography, and spacing.
- The UI must avoid one-off patterns that cannot become reusable components.
- Dense operational screens should remain calm and readable.

### Action Requirements

- Controls must use familiar patterns: buttons for commands, inputs for data entry, menus for option sets, tabs for peer views, toggles for binary choices, and modals only for focused interruptions.
- Components must support hover, focus, disabled, loading, and responsive states.
- Pages must use the shared component inventory unless a new component requirement is approved.

## Grid System

### Information Requirements

- Layouts must support mobile, tablet, and desktop without changing the meaning of the page.
- Information density may increase on larger screens, but critical content must remain available on mobile.
- Data-heavy pages must preserve alignment between labels, values, actions, and status.

### Action Requirements

- Use a mobile-first grid.
- Mobile: single-column primary flow.
- Tablet: two-column layouts only when comparison or side context improves the task.
- Desktop: multi-column layouts may be used for navigation, filters, data tables, and detail panels.
- Fixed-format components such as tables, calendars, and charts must define overflow, wrapping, and minimum usable widths.

## Typography

### Information Requirements

- Type must create clear hierarchy for page title, section title, body text, metadata, labels, values, and validation messages.
- Operational text must be concise and scannable.
- Numeric values, dates, statuses, and IDs must be easy to compare.

### Action Requirements

- Avoid viewport-based font scaling.
- Avoid negative letter spacing.
- Labels must remain visible or programmatically associated with inputs.
- Button text must fit at mobile, tablet, and desktop sizes.
- Use consistent type roles before adding new sizes.

## Spacing Scale

### Information Requirements

- Spacing must clarify grouping, separation, and hierarchy.
- Related controls and data must sit closer together than unrelated groups.
- Compact operational views must still provide enough touch area and readable separation.

### Action Requirements

- Use a tokenized spacing scale.
- Suggested initial scale: `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`.
- Component internal spacing must be documented in the component inventory.
- Page sections must use consistent vertical rhythm across breakpoints.

## Color Tokens

### Information Requirements

- Color must communicate role and status, not decoration alone.
- Status colors must remain distinguishable for users with color-vision differences through labels, icons, or shape.
- Surfaces, borders, text, and states must have defined tokens.

### Action Requirements

- Define tokens for background, surface, elevated surface, text, muted text, border, focus ring, primary action, secondary action, danger, warning, success, info, disabled, and loading.
- Do not encode critical meaning using color alone.
- Validate contrast for text, icons, controls, charts, and status indicators.

## Elevation

### Information Requirements

- Elevation must communicate layering and focus.
- Cards, menus, dropdowns, modals, sticky navigation, and popovers must use predictable depth.

### Action Requirements

- Use minimal elevation for operational pages.
- Reserve stronger elevation for overlays and active floating elements.
- Do not stack cards inside cards.
- Shadow and border tokens must be defined before implementation.

## Motion

### Information Requirements

- Motion must help users understand change, loading, navigation, or state transition.
- Motion must not distract from operational tasks.

### Action Requirements

- Keep transitions short and purposeful.
- Loading states must communicate progress or waiting clearly.
- Respect reduced-motion preferences.
- Avoid motion that blocks task completion.

## Accessibility Rules

### Information Requirements

- Users must be able to perceive, navigate, and understand the interface without relying on color alone.
- Error, empty, loading, success, and disabled states must be explicit.
- Data tables, forms, modals, menus, and navigation must expose correct semantics.

### Action Requirements

- All interactive elements must have visible focus states.
- Controls must be keyboard accessible.
- Inputs must have labels and validation messaging.
- Modals and dropdowns must handle focus management.
- Touch targets must be large enough on mobile.
- Text contrast must meet accepted accessibility standards.

## Component Philosophy

### Information Requirements

- Components are the durable vocabulary of the product.
- A page should communicate using approved components and variants.
- Component requirements must describe content, structure, states, responsiveness, and accessibility.

### Action Requirements

- Each component must define:
  - States
  - Variants
  - Mobile behavior
  - Tablet behavior
  - Desktop behavior
  - Hover behavior
  - Focus behavior
  - Disabled behavior
  - Loading behavior
- New page patterns must either reuse existing components or propose a component update first.

## Open Questions

- What final brand adjectives should guide the product: operational, premium, academic, agent-first, marketplace-like, or another mix?
- What level of density should be preferred for agent workflows on desktop?
- Should the design system support dark mode in the first implementation phase?
- Which chart types are essential for MVP reporting?
- What accessibility conformance target should be formally adopted?

