<!-- cb26b732-06b1-41cf-a308-37e82cc89765 bc5976cf-694b-48df-9fa4-36aeed9b66e8 -->
# Marketplace UI/UX Elevation Plan

## Goals

- Document the current UX on every page (landing, browse, categories, product, store, favorites, login, seller dashboard/settings, wallet, not-found) noting key gaps.
- Propose page-by-page modernization upgrades that align with the current color palette and typography.
- Identify shared components (store/product cards, forms, modals) that need styling cohesion across pages.

## Approach

1. **UX Audit Snapshot**  
   Review each page’s layout, visual style, and interactions.  
   Capture issues with spacing, alignment, component reuse, responsiveness, empty states, iconography.

2. **Design Upgrade Playbook**  
   For every page, outline UI refinements: hero treatments, section rhythm, card layouts, filter panels, dashboards, forms.  
   Specify component adjustments (e.g., update `ProductCard.css`, `StoreCard.css`, form inputs) to achieve a cohesive modern feel.

3. **Roadmap & Priorities**  
   Sequence work (shared components → high-traffic buyer flows → seller dashboards).  
   Highlight dependencies and opportunities to reuse patterns (carousels, badges, metrics, CTAs).  
   Recommend verification steps (responsive checks, hover/focus states, empty states).

## UX Audit Snapshot (Deliverable 1)

| Area | Current UI/UX | Key Gaps |
| --- | --- | --- |
| Landing `MarketplaceHome.jsx` | Premium hero with glass cards and themed sections (about, audience, metrics, how-to, CTA). | Mobile stacks feel dense; secondary sections need more breathing room and motion; CTA banner lacks supporting iconography. |
| Browse `BrowsePage.jsx` | Filters, grid/list toggle, horizontal scroll carousels. | Flat white panels, minimal hierarchy, plain pagination, no skeleton/empty states, cramped mobile experience. |
| Categories `CategoriesPage.jsx` | Category chips, store/listing carousels. | Shared ref makes all carousels scroll together, arrow controls basic, typography flat, empty state generic. |
| Product Detail `ProductDetail.jsx` | Clear layout (gallery, price card, info cards). | Visuals dated, repeated thumbnails, no sticky CTA, limited trust cues, long copy unstyled. |
| Store Detail `StoreDetail.jsx` | Tabbed content with filters. | Banner placeholder, select inputs clash with theme, about/contact sections sparse, product grid spacing tight. |
| Favorites `Favorites.jsx` | Simple list of saved items. | No hero/filters, empty state plain text, layout feels like utility page. |
| Login `Login.jsx` | Gradient form with icon labels. | Palette inconsistent with new theme, lacks supportive messaging/testimonials, button styles basic. |
| My Store `MyStore.jsx` & `StoreDashboard.jsx` | Functional seller dashboard using ProductCard grid. | Inline styles heavy, no cohesive dashboard shell, prompts/empty states basic, no progress tracking. |
| Store Prompts (`CreateStorePrompt.jsx`, `NoProductsPrompt.jsx`) | Simple cards guiding store setup. | Not aligned with new gradients/icons, limited visual hierarchy. |
| Store Settings `StoreSettings.jsx` | Form sections within white cards. | Inline styling, weak section headers, toggles basic, success feedback via alert. |
| Wallet Suite (`Wallet.jsx`, wallet components) | Wallet card styled, transactions/payout plain. | Inconsistent spacing/icon use, tables utilitarian, modals lack hero visuals, no charts. |
| Not Found (`NotFound.jsx` via `AccessDenied.jsx`) | Generic access denied view. | Tone mismatch, missing illustration/CTA consistent with brand. |
| Shared Components (cards, forms, modals) | Product/Store cards elevated, shared Button/Input solid. | Card sizing fixed for carousels, need tokenized spacing, skeleton states, consistent modals, reusable badges/empty states.

✅ **Captured current UI/UX notes for all pages and key shared components.**

## Design Upgrade Playbook (Deliverable 2)

### Global Foundations
- Extend `src/index.css` with spacing/typography tokens (clamp-based headings, responsive section padding) and standardized shadow/radius tiers.
- Add utility classes for section headings, stat chips, pills, badge variants, and animated reveals to keep theming consistent.
- Consolidate card variants (elevated, glass, tinted) and share across Product/Store cards, dashboard summaries, and modal headers.

### Buyer Journey Pages
- **Landing**: Introduce scroll-triggered motion, adjust mobile spacing, enrich CTA with iconography and gradient animation, ensure section dividers/patterns reuse tokens.
- **Browse**: Redesign filter bar with icon-labeled chips and collapsible facets; convert horizontal lists to snap sliders with gradient fades; add skeleton loaders and pill-based pagination/infinite scroll.
- **Categories**: Gradient hero per category, independent scroll containers with overlay arrow controls, metric chips (store count, rating), brand-aligned empty illustration.
- **Product Detail**: Sticky checkout summary (side rail desktop, bottom bar mobile), carousel gallery with zoom/video support, info cards with timeline icons, expanded trust badges.
- **Store Detail**: Hero banner overlay with CTA, pill segmented tabs, chip filters, analytics cards (views/orders), richer contact tab with share buttons/map placeholder.
- **Favorites**: Hero summary, filter/sort chips, redesigned empty state with illustration, grid spacing using tokens.
- **Not Found**: Friendly illustration, brand voice copy, dual CTAs (browse, go home), icon badge.

### Seller & Operational Experience
- **My Store/StoreDashboard**: Dashboard shell with hero metrics, task checklist, consistent card layouts; migrate inline styles to CSS modules using shared utilities.
- **Store Prompts**: Gradient-backed cards with icon banners, consistent CTA treatments, progress cues.
- **Store Settings**: Two-column responsive layout, section headers with icons and descriptions, inline validation, toast feedback instead of alerts.
- **Wallet Suite**: Align TransactionHistory and PayoutRequest with WalletBalance styling, add status badges, filter chips, optional sparkline chart for trends.

### Shared Components & Modals
- Tokenize spacing in `ProductCard.css` / `StoreCard.css`, add `skeleton` modifier classes, support fixed and fluid widths.
- Create reusable `Badge`, `Chip`, and `EmptyState` components (or utility classes) for consistent use across pages.
- Standardize modals (`Modal.css`, `CreateStoreModal`, `AddItemWizard`) with glass headers, icon circles, spacing tokens.
- Extend `Button` variants (ghost, tonal) and ensure focus/hover states meet accessibility.

✅ **Drafted modernization recommendations aligned with existing theme.**

## Implementation Roadmap & Priorities (Deliverable 3)

1. **Foundations & Shared Assets**
   - Update `src/index.css` tokens/utilities.
   - Refactor shared cards, badges, buttons, modals.
   - Introduce skeleton + empty-state utilities.

2. **Buyer Journey Refresh**
   - Redesign `BrowsePage` and `CategoriesPage` (filters, carousels, metrics, responsive spacing).
   - Modernize `ProductDetail` and `StoreDetail` (sticky CTAs, richer content blocks).
   - Refresh `Favorites` and `NotFound` pages to match brand tone.

3. **Seller Dashboard Experience**
   - Implement new shell for `MyStore`/`StoreDashboard`, update prompts, restyle `StoreSettings`.
   - Align wallet suite components with updated visuals.

4. **Auth & Supporting Flows**
   - Rework `Login` (and other auth screens if present) to match landing aesthetic.

5. **Enhancements & QA**
   - Perform responsive and accessibility pass, add micro-interactions, document component usage.

✅ **Outlined prioritized roadmap with dependencies.**

## Next Steps
- Begin Phase 1 focusing on global tokens and shared components, then proceed sequentially.
- After each phase, run responsive + accessibility checks and update documentation/playbook.

