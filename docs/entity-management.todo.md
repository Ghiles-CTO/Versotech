# Entity & Investor Management Overhaul TODO

## Data Model & Migrations
- [x] Audit current Supabase schema for `entity_flags`, `entity_stakeholders`, `entity_investors`, and `subscriptions` status values; design missing tables/columns.
- [x] Write migrations for:
  - [x] `entity_flags` (type, severity, status, due dates, resolution metadata).
  - [x] `entity_investors` (vehicle ↔ investor allocations, invite state, notes).
  - [x] `subscriptions` enhancements (status enum, commitment metadata, effective dates).
  - [x] `documents.external_url` support and default entity folder seeds (KYC, Legal, Redemption, etc.).
- [x] Review/adjust RLS policies for new tables and ensure staff has full access while investors remain scoped.

## Backend APIs
- [x] Finish `/api/staff/investors` by adding POST handler (validation, duplicate checks, auditing).
- [x] Build `/api/entities/[id]/investors` CRUD endpoints to manage allocations, invitations, and subscription details.
- [x] Extend `/api/vehicles` + `/api/vehicles/[id]` to expose investor summaries, pending commitments, document tree, and flag snapshots.
- [x] Add `/api/documents/link`, `/api/documents/folders` management, and ensure `/api/documents/upload` handles folder + scope metadata.
- [ ] Create `/api/entities/[id]/flags` endpoints (list/create/resolve) and schedule jobs to auto-populate key health checks.

## Staff Portal UX
- [ ] Enhance `EntitiesPageEnhanced` statistics (investor count, unresolved flags, last activity) and add action center for overdue items.
- [x] Implement investor allocation panel on `EntityDetailEnhanced` with “Link Existing” / “Create & Invite” modals capturing subscription details.
- [ ] Categorise Directors/Stakeholders by type (Board, Shareholders, Legal, Accounting, Administrators, Auditors, Strategic Partners) per meeting notes.
- [x] Redesign documents tab with folder tree, drag & drop upload, external link support, version history, and investor access controls.
- [ ] Surface flag summary widget with severity badges and inline resolution actions.

## Investor Portal Alignment
- [ ] Ensure `/api/vehicles?related=true` returns pending holdings so “Portfolio Holdings” can show commitments with `PENDING` status.
- [ ] Update holdings components to display commitment state when NAV/positions are missing.
- [ ] Trigger investor notifications/timeline entries when allocations or flags change.

## Documents & Storage
- [x] Normalize document metadata (folder assignments, tags) and expose bulk download/zip functionality.
- [x] Sync document visibility with investor allocations and update audit logging.

## Notifications & Automation
- [ ] Hook entity flag changes, document uploads, and investor invitations into audit + notification pipelines.

## Testing & Rollout
- [ ] Add unit/integration tests for new API routes and validation (Zod + Vitest).
- [ ] Create end-to-end coverage (Playwright/Cypress) for investor onboarding + document flows.
- [ ] Draft migration rollout checklist, including backfill scripts for existing data and feature toggle plan for deployment.
