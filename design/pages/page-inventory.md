# Page Inventory

Status: `Draft`

Every route from `plan/architecture/frontend-routes.md` is represented here. Page design must stay inside the MVP scope.

## Public

| Route | Page Goal | Primary Components |
| --- | --- | --- |
| `/` | Let students start campus/area search and understand that listings are agent-sourced and freshness-aware. | Public navbar, search panel, featured listings, trust summary |
| `/listings` | Compare published room listings by campus, price, gender, occupancy, availability, and freshness. | Search, filters, listing cards/table, sort, empty state |
| `/listings/:id` | Inspect listing detail, freshness, agent summary, room types, rules, media, and inquiry action. | Gallery, detail sections, agent profile card, inquiry CTA, report action |
| `/agents/:id` | Review public agent trust profile and current listings. | Profile card, verification badge, trust metrics, listing list |

## Auth

| Route | Page Goal | Primary Components |
| --- | --- | --- |
| `/login` | Authenticate student, agent, or admin without mixing role permissions. | Auth form, role-aware help, password reset link |
| `/signup` | Register student or agent and guide agents toward profile completion. | Role selector, signup form, verification prompt |
| `/verify-email/:token` | Confirm account email and show next destination. | Status panel, success/error states, continue action |
| `/forgot-password` | Start password reset safely. | Email form, confirmation state |
| `/reset-password` | Set a new password after token validation. | Password form, token error state |

## Student

| Route | Page Goal | Primary Components |
| --- | --- | --- |
| `/student/dashboard` | Show saved context, active inquiries, and recommended next searches. | Summary cards, inquiry list, saved listings |
| `/student/inquiries` | Track inquiry states and next contact actions. | Table/list, state badges, listing/agent summary |
| `/student/saved` | Compare saved listings and freshness changes. | Listing cards, freshness badges, filters |
| `/student/profile` | Manage student contact and account basics. | Profile form, notification preferences |

## Agent

| Route | Page Goal | Primary Components |
| --- | --- | --- |
| `/agent/dashboard` | Show operational priorities: stale listings, new inquiries, verification, and listing performance. | Task cards, freshness queue, inquiry queue, stats |
| `/agent/profile` | Manage public agent identity and contact channels. | Profile form, operating areas, public preview |
| `/agent/verification` | Submit and track verification evidence. | Stepper, document checklist, status panel |
| `/agent/listings` | Manage owned listings and freshness state. | Table/cards, filters, publish controls, refresh action |
| `/agent/listings/new` | Create a structured room listing. | Multi-section form, media upload, room type editor |
| `/agent/listings/:id/edit` | Update listing content, availability, and publish state. | Edit form, status controls, confirmation modal |
| `/agent/inquiries` | Follow up student inquiries and update lead status. | Inquiry table, status picker, detail drawer |
| `/agent/settings` | Manage account, notifications, and security basics. | Settings form, toggles, password controls |

## Admin

| Route | Page Goal | Primary Components |
| --- | --- | --- |
| `/admin/dashboard` | Monitor trust, listing freshness, moderation, and platform activity. | KPI cards, queues, compact charts |
| `/admin/agents` | Review agent verification and account states. | Data table, filters, bulk/status actions |
| `/admin/agents/:id` | Inspect agent evidence, activity, listings, reports, and decision history. | Detail panel, evidence list, decision controls |
| `/admin/listings` | Moderate published and flagged listings. | Data table, status filters, hide/remove actions |
| `/admin/reports` | Triage reported listings and moderation outcomes. | Report queue, severity badges, evidence drawer |
| `/admin/locations` | Manage campus and area reference data. | Table, create/edit modal |
| `/admin/users` | Inspect user accounts and role/status state. | Data table, filters, account detail drawer |

