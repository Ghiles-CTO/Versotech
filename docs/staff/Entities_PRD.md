# Entities Management PRD – VersoTech Staff Portal

## 1. Overview
- **Goal**: Provide staff with a single source of truth for every legal vehicle ("entity") used in Verso investments. Supports compliance documentation, director roster management, relationship visibility, and change tracking.
- **Audience**: Operations, Legal/Compliance, Relationship Managers.
- **Scope**: Staff portal only. Investor portal consumes entity metadata/documents via existing document access rules.

## 2. Success Metrics
- 100% of deals reference an entity record.
- Staff can upload/find entity corporate docs within 3 clicks.
- Director updates logged with timestamp + actor.
- Entity detail surfaces linked deals, clients, introducers without manual lookup.

## 3. Core Use Cases
1. **Create / Edit Entity**
   - Capture legal name, type, jurisdiction, registration no., formation date, default currency, notes.
2. **Upload / Manage Corporate Documents**
   - KYC, incorporation docs, board resolutions; accessible by staff (and investors if entitled).
3. **Maintain Directors & Officers**
   - Add/remove directors with effective dates; view historical roster.
4. **View Linked Relationships**
   - Deals (via `deals.vehicle_id`), Investors (via `subscriptions`/`investor_users`), Introducers (via `introductions`).
5. **Audit & Change Log**
   - Record metadata edits, director changes, document uploads.

## 4. Data Model Updates
- `vehicles` table (existing)
  - Add columns: `formation_date date`, `legal_jurisdiction text`, `registration_number text`, `notes text`.
- New table `entity_directors`
  - Columns: `id uuid`, `vehicle_id uuid`, `full_name text`, `role text`, `email text`, `effective_from date`, `effective_to date`, `notes text`, `created_at timestamptz`.
- New table `entity_events`
  - Columns: `id uuid`, `vehicle_id uuid`, `event_type text`, `description text`, `changed_by uuid`, `payload jsonb`, `created_at timestamptz`.
- `documents` table
  - Add nullable `entity_id uuid` referencing `vehicles(id)` to tag corporate docs.
- RLS
  - Staff full read/write on new/updated tables.
  - Investor read access to documents scoped by existing entitlements and new `entity_id` when applicable.

## 5. API Requirements
- `/api/vehicles`
  - Include new metadata fields in GET/POST/PATCH.
- `/api/vehicles/[id]`
  - Support PATCH for metadata updates; embed summary (directors count, latest event).
- New routes:
  - `/api/entities/[id]/directors` (GET POST PATCH DELETE) with validation and audit logging.
  - `/api/entities/[id]/events` (GET POST) for manual log entries and automatic hooks.
  - `/api/entities/[id]/documents` (GET POST) wrappers over existing document service to enforce tagging.

## 6. UI / UX
- **Entities Index**
  - Columns: Name, Type, Jurisdiction, Formation Date, Directors (active count), Last Change, Actions.
  - Filters: type, jurisdiction, active director, currency.
  - CTA: Create Entity.
- **Entity Detail Page** (`/versotech/staff/entities/[id]`)
  - Summary header with quick stats.
  - Tabs:
    1. Overview (metadata, notes).
    2. Documents (upload/list by category).
    3. Directors & Officers (active list + history timeline).
    4. Deals (list of linked deals).
    5. Clients (investors linked via subscriptions).
    6. Introducers (from `introductions`).
    7. Change Log (from `entity_events` + audit).
- Deal creation/edit flows reference “Entities” label.
- Investor portal uses `entity_id` for document filtering (no UI change needed now).

## 7. Workflows
- Creating an entity optionally uploads initial docs.
- Updating metadata or director roster auto-writes to `entity_events` and `audit_log`.
- Document uploads tagged with `entity_id` maintain investor access logic.

## 8. Non-Goals / Out of Scope
- Director approval workflows.
- Integrations with third-party registries.
- Investor self-service entity editing.
- Versioned document generation.

## 9. Dependencies & Risks
- Requires migrations + RLS updates (Supabase).
- Must ensure investor document access remains correct when `entity_id` added.
- Need seed data to showcase UI states.

## 10. Implementation Checklist
1. Migrations: new columns/tables, `documents.entity_id`.
2. RLS policies for new tables.
3. API updates + new endpoints.
4. Seed dummy entities (MCP).
5. Frontend rename + index enhancements.
6. Entity detail page components.
7. Hook document flows.
8. Audit logging instrumentation.
9. QA (staff + investor portals).
10. Update docs / release notes.


