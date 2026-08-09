# Component Inventory

Status: `Draft`

Every page should be assembled from these reusable components. Each component includes information requirements, action requirements, required states, required variants, and responsive behavior.

## Component Coverage Matrix

| Component | Information Role | Action Role | Required Before Page Work |
| --- | --- | --- | --- |
| Buttons | Communicate available commands and priority | Trigger commands and workflow steps | Yes |
| Cards | Group related records, summaries, or actions | Open details, expose quick actions | Yes |
| Tables | Compare structured records | Sort, filter, select, paginate, act on rows | Yes |
| Inputs | Collect structured data | Edit, validate, submit user data | Yes |
| Search | Find records and narrow context | Query, clear, refine, submit | Yes |
| Navbar | Expose global product location | Navigate primary areas | Yes |
| Sidebar | Expose workspace navigation and filters | Switch sections, collapse, select items | Yes |
| Dropdown | Present compact option sets | Select options or trigger menu actions | Yes |
| Modal | Focus attention on contained tasks | Confirm, edit, create, or inspect | Yes |
| Charts | Explain trends, status, and comparisons | Filter or inspect values where needed | Review |
| Calendar | Show dates, availability, and schedules | Select dates or manage date ranges | Review |
| Profile Card | Summarize a person or organization | Contact, view, assign, edit | Yes |

## Shared Component Requirements

### Information Requirements

- Components must show clear hierarchy, labels, values, status, and metadata where relevant.
- Components must support empty, loading, error, and success feedback when the underlying workflow needs those states.
- Components must make stale, pending, disabled, or unavailable content visually and textually clear.

### Action Requirements

- Components must be keyboard reachable when interactive.
- Components must preserve layout across hover, focus, disabled, loading, and content-length changes.
- Components must define mobile, tablet, and desktop behavior before use in page designs.

### Required State Set

- Default
- Hover
- Focus
- Active or selected
- Disabled
- Loading
- Error, where user input or data fetch can fail
- Empty, where no data can exist
- Success, where completion feedback is useful

## Buttons

### Information Requirements

- Button priority must be clear: primary, secondary, tertiary, danger, and icon-only.
- Labels must describe the action result, not the implementation detail.
- Loading and disabled states must explain whether the action is unavailable or in progress.

### Action Requirements

- Support click, keyboard activation, focus, hover, disabled, and loading.
- Prevent duplicate submission while loading.
- Danger buttons require confirmation when the action is destructive.

### Variants

- Primary
- Secondary
- Tertiary
- Danger
- Icon-only
- Split button, only when paired actions are common

### Responsive Behavior

- Mobile: full-width for primary form actions when needed; icon-only actions require accessible labels.
- Tablet: grouped actions may remain inline if labels fit.
- Desktop: primary and secondary actions align with page or section hierarchy.

## Cards

### Information Requirements

- Cards must group one record, summary, task, or decision area.
- Cards must expose title, key metadata, status, and the most relevant action.
- Repeated cards must be comparable in structure.

### Action Requirements

- Cards may be clickable only when the entire card has a single clear destination.
- Quick actions must be visually separate from the card body.
- Cards must not contain nested cards.

### Variants

- Summary card
- Record card
- Task card
- Empty-state card
- Alert card

### Responsive Behavior

- Mobile: stack cards in one column.
- Tablet: use two columns only when comparison is useful.
- Desktop: cards may form grids, dashboards, or side panels.

## Tables

### Information Requirements

- Tables must support comparison of records using stable columns.
- Each row must expose identity, status, ownership, recency, and primary action where relevant.
- Empty, filtered-empty, loading, and error states must be distinguishable.

### Action Requirements

- Support sorting, filtering, pagination or virtual scrolling, row selection, and row-level actions where needed.
- Preserve accessible table semantics.
- Define horizontal overflow behavior before implementation.

### Variants

- Simple table
- Data table with filters
- Selectable table
- Compact table
- Comparison table

### Responsive Behavior

- Mobile: convert to stacked row summaries or controlled horizontal scroll.
- Tablet: preserve key columns and hide secondary metadata behind row details if needed.
- Desktop: full table with filters, sorting, bulk actions, and pagination.

## Inputs

### Information Requirements

- Inputs must show label, current value, help text where needed, validation, and required or optional status.
- Validation must identify the problem and how to fix it.

### Action Requirements

- Support typing, selection, focus, disabled, readonly, loading, error, and success states.
- Preserve labels for accessibility.
- Prevent invalid submission when validation fails.

### Variants

- Text
- Number
- Email
- Phone
- URL
- Password
- Textarea
- Select
- Checkbox
- Radio
- Toggle
- Date or date range
- File upload, if required later

### Responsive Behavior

- Mobile: single-column forms with large touch targets.
- Tablet: grouped related fields may use two columns.
- Desktop: forms may use multi-column layout only when scanning remains clear.

## Search

### Information Requirements

- Search must communicate scope, query state, result count, no-result state, and active filters.
- Search results must show why a result is relevant when practical.

### Action Requirements

- Support query entry, submit, clear, debounce where appropriate, filter refinement, keyboard navigation, loading, and error recovery.

### Variants

- Global search
- Page search
- Table search
- Filtered search
- Autocomplete search

### Responsive Behavior

- Mobile: search should be prominent and easy to clear.
- Tablet: search may pair with filter controls.
- Desktop: search may sit in toolbar, table header, or global nav.

## Navbar

### Information Requirements

- Navbar must show product identity, current area, and access to global navigation or account controls.
- It must make active location clear.

### Action Requirements

- Support navigation, responsive collapse, keyboard access, and focus states.
- Account, notification, or workspace controls must use approved dropdown or modal patterns.

### Variants

- App navbar
- Auth navbar
- Compact mobile navbar

### Responsive Behavior

- Mobile: prioritize title, menu trigger, and critical action.
- Tablet: expose primary destinations if space allows.
- Desktop: show stable global navigation and account controls.

## Sidebar

### Information Requirements

- Sidebar must expose product sections, active location, nested groups where needed, and collapsed state.
- It must help users move between operational areas without losing context.

### Action Requirements

- Support expand, collapse, section selection, keyboard navigation, and disabled items.

### Variants

- Primary navigation sidebar
- Filter sidebar
- Detail sidebar
- Collapsible sidebar

### Responsive Behavior

- Mobile: become drawer or hidden navigation.
- Tablet: may be collapsible.
- Desktop: persistent sidebar where workflow complexity justifies it.

## Dropdown

### Information Requirements

- Dropdowns must show selected value or menu trigger meaning.
- Menu items must clearly communicate action, selection, disabled status, or destructive intent.

### Action Requirements

- Support keyboard navigation, focus trap where needed, escape close, outside click close, disabled items, and loading options.

### Variants

- Select dropdown
- Action menu
- Multi-select
- Status picker

### Responsive Behavior

- Mobile: use sheet or full-width menu when option count or touch interaction requires it.
- Tablet: inline dropdowns are acceptable if touch targets remain large.
- Desktop: compact menus may be used in toolbars, rows, and nav.

## Modal

### Information Requirements

- Modals must contain one focused task or decision.
- Title, body, primary action, secondary action, and close affordance must be clear.
- Destructive confirmations must explain consequence.

### Action Requirements

- Trap focus, restore focus on close, support escape close where safe, prevent background interaction, and handle loading and errors.

### Variants

- Confirmation modal
- Form modal
- Detail modal
- Alert modal

### Responsive Behavior

- Mobile: use full-screen or bottom-sheet behavior when content is large.
- Tablet: centered modal or sheet depending on complexity.
- Desktop: centered modal with constrained width.

## Charts

### Information Requirements

- Charts must explain trends, comparisons, distribution, progress, or status.
- Every chart must include title, timeframe, units, legend where needed, and empty or insufficient-data state.
- Data must remain understandable without relying on color alone.

### Action Requirements

- Support tooltip or value inspection when precision matters.
- Support filter or date range controls when chart context changes.
- Avoid chart types that obscure comparison.

### Variants

- Line chart
- Bar chart
- Stacked bar chart
- Donut or progress chart, only for simple part-to-whole summaries
- KPI tile with sparkline

### Responsive Behavior

- Mobile: simplify labels and preserve core insight.
- Tablet: allow legend and filters if space supports them.
- Desktop: full axes, legends, comparison controls, and inspection affordances.

## Calendar

### Information Requirements

- Calendar must show date, availability, events, schedule status, and selected range where relevant.
- Today, selected dates, blocked dates, unavailable dates, and stale dates must be visually distinct and textually accessible.

### Action Requirements

- Support date selection, date range selection, keyboard navigation, disabled dates, loading, and conflict feedback.

### Variants

- Month calendar
- Week calendar
- Date picker
- Date range picker
- Availability calendar

### Responsive Behavior

- Mobile: compact month or agenda list depending on task.
- Tablet: month view with side details may be used.
- Desktop: month, week, and side-detail layouts may be used.

## Profile Card

### Information Requirements

- Profile cards must summarize identity, role, contact options, status, affiliation, and relevant metadata.
- The card must make verification, ownership, and last activity clear where applicable.

### Action Requirements

- Support view profile, contact, assign, edit, deactivate, or other approved role-specific actions.
- Sensitive actions must use confirmation and permission checks.

### Variants

- Agent profile
- Student or user profile
- Organization profile
- Compact profile chip
- Expanded profile summary

### Responsive Behavior

- Mobile: stack identity, metadata, and actions.
- Tablet: identity and actions may sit side by side.
- Desktop: profile card may appear in side panels, record headers, and dashboards.

## Open Questions

- Which components need first implementation priority for MVP pages?
- Should tables use stacked cards on mobile or horizontal scroll for the first release?
- Which navigation model is canonical: top navbar, sidebar, or hybrid?
- Which charting library should be adopted once implementation begins?
- What exact profile fields are required for agents, students, managers, and organizations?

