# Design Review Checklist

Status: `Draft`

Use this checklist to improve the base design requirements before moving into page design or implementation.

## Foundation Review

- [ ] Brand principles are specific enough to guide tradeoffs.
- [ ] Design language defines what the UI should and should not feel like.
- [ ] Grid rules cover mobile, tablet, and desktop.
- [ ] Typography roles are named and constrained.
- [ ] Spacing scale is approved.
- [ ] Color token categories are approved.
- [ ] Elevation levels are approved.
- [ ] Motion rules include reduced-motion behavior.
- [ ] Accessibility target is chosen.
- [ ] Component philosophy is accepted by the team.

## Component Review

- [ ] Buttons define priority, variants, and all interaction states.
- [ ] Cards define content hierarchy and avoid nested-card patterns.
- [ ] Tables define sorting, filtering, selection, overflow, and mobile behavior.
- [ ] Inputs define labels, validation, helper text, and form behavior.
- [ ] Search defines scope, result feedback, and clear behavior.
- [ ] Navbar defines global navigation and active state.
- [ ] Sidebar defines persistent, collapsible, and mobile behavior.
- [ ] Dropdown defines keyboard behavior and menu semantics.
- [ ] Modal defines focus management and confirmation behavior.
- [ ] Charts define chart types, units, legends, and accessible data presentation.
- [ ] Calendar defines date states, selection, availability, and responsive behavior.
- [ ] Profile card defines identity, metadata, status, and actions.

## State Review

- [ ] Default state is clear.
- [ ] Hover state does not shift layout.
- [ ] Focus state is visible and accessible.
- [ ] Disabled state explains unavailable actions where needed.
- [ ] Loading state prevents duplicate actions where needed.
- [ ] Empty state gives useful next steps.
- [ ] Error state explains what happened and how to recover.
- [ ] Success state confirms completion without blocking further work.

## Responsive Review

- [ ] Mobile behavior is defined for every component.
- [ ] Tablet behavior is defined for every component.
- [ ] Desktop behavior is defined for every component.
- [ ] Text does not overflow buttons, controls, cards, or panels.
- [ ] Tables, charts, and calendars have explicit overflow or alternate layouts.
- [ ] Navigation remains usable on small screens.

## Accessibility Review

- [ ] Controls are keyboard accessible.
- [ ] Focus order is logical.
- [ ] Focus is trapped and restored for modals where required.
- [ ] Labels are programmatically associated with inputs.
- [ ] Status and validation messages are accessible.
- [ ] Color is not the only way meaning is communicated.
- [ ] Contrast requirements are documented and testable.
- [ ] Touch targets are large enough on mobile.

## Page Assembly Review

- [ ] Page requirements reference approved components.
- [ ] Page-specific needs do not create hidden one-off components.
- [ ] Information requirements are separated from action requirements.
- [ ] Primary actions are limited and clearly prioritized.
- [ ] Secondary actions are discoverable without overwhelming the page.
- [ ] Data freshness, ownership, and status are visible where relevant.
- [ ] Open questions are resolved or explicitly deferred.

## Improvement Backlog

Add items here before moving from `Draft` to `Review`.

| Item | Owner | Status | Notes |
| --- | --- | --- | --- |
| Define final brand adjectives | TBD | Open | Needed before visual exploration. |
| Choose accessibility conformance target | TBD | Open | Suggested target: WCAG 2.2 AA. |
| Define exact typography scale | TBD | Open | Should align with frontend framework. |
| Define color token names and values | TBD | Open | Needs visual direction approval. |
| Define elevation token values | TBD | Open | Should remain restrained. |
| Prioritize MVP components | TBD | Open | Should follow MVP page requirements. |

