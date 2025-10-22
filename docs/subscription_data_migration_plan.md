# Subscription Data Migration & Implementation Plan

## 1. Objective
- Consolidate legacy spreadsheet holdings into Supabase so staff and investors can use the portal without manual reconciliations.
- Preserve workflow automation (approvals, tasks, notifications) and investor visibility by respecting existing constraints, enums, and RLS policies.
- Deliver a repeatable, auditable ETL that can run against staging before production.

## 2. Current Database Snapshot
### 2.1 Vehicles (entities)
- Table: `public.vehicles` (`supabase/migrations/00000000000000_baseline.sql:3564`).
- Key columns: `id`, `name`, `domicile`, `currency default 'USD'`, `type public.vehicle_type`, `formation_date`, registration fields, `notes`, branding fields `logo_url`, `website_url` (`20251018094500_add_vehicle_branding_fields.sql`).
- RLS: investors gain read access via linked `subscriptions` or `positions`; staff have full read/write (`00000000000000_baseline.sql:4932-4948`).
- Downstream: `entity_directors`, `entity_events`, `entity_stakeholders`, `entity_investors`, `entity_flags`, `deals`, `documents` cascade off `vehicle_id`.

### 2.2 Subscriptions
- Table: `public.subscriptions` (`00000000000000_baseline.sql:3487`).
- Columns: `investor_id`, `vehicle_id`, `commitment numeric(18,2)`, `currency` (default USD), `status`, `signed_doc_id`, timestamps plus enhancements `committed_at`, `effective_date`, `funding_due_at`, `units`, `acknowledgement_notes` (`20251120000100_entity_management_enhancements.sql:202`).
- Constraints: PK on `id`, FK to `investors`/`vehicles` with `ON DELETE CASCADE`; CHECK `status = ANY('{pending,committed,active,closed,cancelled}')`; index on `(investor_id,status)`.
- RLS: investors read linked rows; staff can view via `user_is_staff()` policy.

### 2.3 Entity Support Tables
- `entity_investors`: bridges vehicles to investors with optional `subscription_id`, `relationship_role`, `allocation_status`, `invite_sent_at`, `notes`, `created_by`, timestamps (`20251120000100_entity_management_enhancements.sql:55`). Unique `(vehicle_id, investor_id)` with `set_updated_at` trigger. Staff-only write, investors read via `get_my_investor_ids()`.
- `entity_stakeholders`, `entity_flags` augment governance/compliance contexts; both are staff-managed with investor read-through.
- `entity_directors`, `entity_events` pre-existing with staff RLS; `entity_events.changed_by` ties to `profiles`.

### 2.4 Deal Workflow Tables
- `deal_subscription_submissions`: captures investor submissions, payload JSON, approval linkage (`20251020000000_deal_workflow_phase1.sql:306`).
- `investor_deal_holdings`: normalized holdings per investor/deal once subscriptions approve (`20251102121500_create_investor_deal_holdings.sql:6`); unique `(investor_id, deal_id)`, statuses `pending_funding|funded|active|closed`.
- Automation: approvals auto-assign to RM pod when `entity_type IN ('deal_interest','deal_subscription')` (`20251102093000_deal_workflow_phase1_finish.sql:12`); webhook route `subscription-complete` upserts holdings and tasks (`versotech-portal/src/app/api/automation/subscription-complete/route.ts`).

### 2.5 Remote Snapshot Considerations
- `supabase/migrations/20251014175844_remote_schema.sql` revokes CRUD privileges on `subscriptions`, `vehicles`, and many tables for anon/auth/service roles. Imports must either run with the service-role key or reapply grants pre-ETL.
- Reservation system disabled (`20251015110000_remove_reservation_support.sql`), so historical reservations should not be resurrected.

## 3. Application Dependencies
- Staff entity API merges `entity_investors`, raw `subscriptions`, holdings, and deals (`versotech-portal/src/app/api/entities/[id]/investors/route.ts`). Missing optional fields like `units`, `acknowledgement_notes` surface as `undefined` and affect UI.
- Front-end types expect normalized subscriptions with origins and statuses (`versotech-portal/src/components/entities/types.ts` & `entity-investor-utils.ts`).
- KPI functions (`calculate_investor_kpis`) sum commitments where `status IN ('active','pending')`, so imported statuses dictate reporting.
- Deal subscription routes (`versotech-portal/src/app/api/deals/[id]/subscriptions/route.ts`) rely on `deal_subscription_submissions` for audit trails and analytics (`trackDealEvent`).
- Automation updates tasks, notifications, and holdings on subscription completion. Historical data inserted without these hooks will not automatically backfill secondary records.

## 4. Source Data Profile (Workbook `docs/VERSO DASHBOARD_V1.0.xlsx`)
- `Summary` sheet lists ~40 vehicles (“Compartments” `VC1`…`VC43`) with stage, investment amounts, fee ratios, comments, FX hints (e.g., GBP>USD 1.33505).
- Individual `VC#` sheets detail investors: name segments, entity, amount invested, price/share, contract dates, status annotations (“settled”, “repaid”, comments). Counts range from 1 to 217 rows; totals align with Summary (e.g., `VC6` sum ≈ $74.16M).
- Additional sheets (`JM`, `VEGINVEST`, escrow accounts) contain tranche-level metadata, fee breakdowns, and to-do commentary.
- Data quality considerations: mixed currencies (CHF, GBP, EUR) with FX notes, inconsistent formatting (dates as strings, zero-valued rows), duplicate investor appearances across vehicles.

## 5. Detailed Implementation Plan
### Phase 0 – Pre-flight
1. Confirm Supabase migrations applied remotely (`supabase/migrations` vs remote). Run `supabase db push status` or compare `supabase.migrations` table.
2. Verify RLS/grants allow service-role imports; if revoked (per remote dump), secure the service key and run ETL via service client.
3. Snapshot current production data for `vehicles`, `investors`, `subscriptions`, `entity_investors`, `investor_deal_holdings` for rollback auditing.

### Phase 1 – Staging Environment Dry-Run
1. Provision Supabase preview project and import baseline schema/migrations.
2. Load a copy of the workbook and execute the ETL end-to-end; fix issues before production.

### Phase 2 – Data Ingestion Pipeline
1. **Extraction**
   - Use Python (pandas/openpyxl) or a lightweight ETL script to parse sheets:
     - `summary` table: `vehicle_code`, `opportunity_name`, `stage`, `amount_invested`, `total_fees`, FX hints, comments.
     - `subscription_lines` table: `sheet_code`, `investor_last_name`, `investor_first_name`, `investor_entity`, `amount`, `price_per_share`, `ownership`, `contract_date`, `status`, comments.
     - `tranche_details` for VEGINVEST and others as supplementary info.
   - Store extraction results in staging tables (`stg_vehicles`, `stg_subscriptions`, `stg_tranches`) with source metadata (sheet name, row number) for traceability.
2. **Normalization Helpers**
   - Normalize investor names (strip whitespace, uppercase surnames) and unify duplicates (e.g., “Julien Machot” vs entity “LF GROUP SARL”).
   - Standardize currencies: detect from sheet comments or columns; default to USD if none provided with explicit justification.
   - Map textual statuses to allowed enum values: e.g., `settled/repaid` → `active`, `closed` stays `closed`, blank → `pending`, `cancelled` → `cancelled`.
   - Derive `effective_date` from `contract_date` or `order date`; parse dd/mm/yyyy vs mm/dd/yy carefully.
   - Convert amounts to numeric using FX hints when denominated in non-USD. Record conversion rate in staging notes for audit.

### Phase 3 – Vehicles Alignment
1. For each `vehicle_code` (`VC#`):
   - Check existing `vehicles` table for a matching record (by `name` or newly assigned `code` stored in `notes`).
   - Insert/update with `name` (Opportunity), `domicile`/`currency` if known, `type` mapping (`fund`, `spv`, `note`, `securitization`, `other`). If stage doesn’t match enum, store in `notes`.
   - Populate branding fields (`logo_url`, `website_url`) if available elsewhere; otherwise leave null.
   - Maintain consistent IDs between environments by capturing `id` after insert/upsert.
2. Document any vehicles missing from the sheet but present in DB to avoid unintended overwrites.

### Phase 4 – Investor Master Data
1. Deduplicate investors by legal name/email:
   - Prefer existing investors (match on `legal_name` or `email`). Resolve conflicts manually before import (Sheet contains repeated individuals).
   - For new investors, insert into `public.investors` with type heuristics (`entity` when `Investor Entity` populated, `individual` otherwise). Set `display_name`, `country` if available, default onboarding/AML states.
2. Maintain mapping table `stg_investor_match` linking staging row to final `investor_id` for later steps.

### Phase 5 – Subscription Creation
1. Aggregate staging rows per `(investor_id, vehicle_id)` to avoid duplicate `entity_investors` uniqueness conflicts. Sum commitments where appropriate but retain line-level metadata in `subscription_notes`.
2. Insert into `public.subscriptions`:
   - `investor_id`, `vehicle_id`, `commitment`, `currency`, `status`, `effective_date`, `funding_due_at` (if available), `units` (if share count provided), `acknowledgement_notes` capturing comments/line IDs.
   - Respect `status` CHECK constraint; coerce invalid strings to nearest allowable value or escalate for manual review.
   - Use `ON CONFLICT (id)` only if re-running ETL; otherwise allow Supabase to generate IDs.
3. For historical committed deals lacking actual submissions, set `committed_at` to `effective_date`.

### Phase 6 – Entity Links & Holdings
1. Upsert `entity_investors` per `(vehicle_id, investor_id)`:
   - `subscription_id` to the latest subscription record, `relationship_role` default “investor”, `allocation_status` derived from subscription status via same enum set.
   - `invite_sent_at` null unless legacy invites exist; store `notes` from staging comments.
2. Seed `investor_deal_holdings` when the vehicle has active deals:
   - Identify `deals` tied to each vehicle (default to most recent “open” deal).
   - Insert holdings with `status` `funded` when subscription status `active`, else `pending_funding`; include `subscribed_amount`, `currency`, `effective_date`, `funding_due_at`, `funded_at` (when applicable).
   - Ensure uniqueness `(investor_id, deal_id)`; if multiple deals exist but data only references vehicle-level commitment, decide whether to split or associate with primary deal and note the assumption.

### Phase 7 – Optional Workflow Backfill
1. If audit trail is required, insert rows into `deal_subscription_submissions` mirroring final subscriptions (payload JSON containing amount/currency/status) and mark as `approved`.
2. Create corresponding `approvals` (entity_type `deal_subscription`) with `status 'approved'`, `priority` heuristics based on amount.
3. Consider inserting historical `deal_activity_events` to reflect subscription completion, aligning with automation expectations.

### Phase 8 – Validation & Reconciliation
1. Compare per-vehicle commitment totals against `Summary` sheet (allow small FX rounding differences). Store reconciliation report in `docs/`.
2. Run sampling queries:
   - Investor-level: ensure `mergeEntityInvestorData` returns subscription arrays and totals > 0.
   - KPI functions return expected values when invoked with new investor IDs.
3. Execute staff entity page and investor dashboard flows in staging to confirm data surfaces without runtime errors.
4. Validate RLS by testing with investor role (ensuring they see only linked vehicles).

### Phase 9 – Production Deployment
1. Schedule maintenance window; communicate ETL duration/impact.
2. Disable conflicting automations if necessary (e.g., triggers that could fire on bulk inserts).
3. Run ETL with production service key; capture logs to immutable storage (timestamp, record counts, errors).
4. Post-load, re-run validation suite and compare snapshots. Sign-off before re-enabling automations.

### Phase 10 – Rollback & Monitoring
1. If discrepancies arise, restore from pre-etl snapshot or delete inserted ranges using staged metadata.
2. Monitor portal analytics, notifications, and KPI dashboards for anomalies over next reporting cycle.

## 6. Risks & Mitigations
- **Enum violations**: statuses or vehicle types outside defined set → build mapping table and fail fast if unmapped values remain.
- **Investor duplication**: same person across sheets causing `entity_investors` unique conflict → pre-compute canonical investor IDs and warn on collisions.
- **Currency inconsistencies**: mixing CHF/GBP/EUR commitments without conversion skews KPIs → enforce conversion step, record FX rate used.
- **RLS/grant failures**: running ETL without service role when privileges revoked → verify permissions beforehand; run a write test before main job.
- **Automation gaps**: skipping holdings/submission backfill leaves investor dashboards blank → include holdings upsert in primary ETL path.
- **Data drift**: workbook may lack latest commitments → maintain a delta log for manual review post-import.

## 7. Next Steps
1. Build staging ETL script (Python or dbt) with configuration for FX rates, status mapping, and dry-run mode.
2. Run staging load, iterate until validation passes, and publish reconciliation report.
3. Prepare production runbook (commands, expected row counts, rollback steps).
4. Schedule production import with stakeholders and execute according to plan.

