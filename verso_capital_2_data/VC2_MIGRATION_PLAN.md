# VC2 Migration Plan (Vehicle-by-Vehicle)

## Current Confirmed State
- Source files:
  - `verso_capital_2_data/VERSO Capital 2 SCSp Emails and Contacts.xlsx`
  - `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- Red rows in contacts file (excluded by client rule): `10`, `13`.
- Dashboard matching status:
  - Investors matched to dashboard: `119/119`.
  - Introducer/broker/partner rows matched to dashboard: `69/69`.
- Production DB state for VC2xx:
  - `subscriptions`: `0`
  - `positions`: `0`
  - `introductions`: `0`
  - `introducer_commissions`: `0`
- Client file `Series` values (non-red rows):
  - `VC201`, `VC202`, `VC203`, `VC206`, `VC207`, `VC209`, `VC210`, `VC211`, `VC215`
  - `VCL001`, `VCL002` are present in the file but are not `VC2xx` vehicle codes in current DB scope.

## Matching Rules Locked
- Partners and brokers are treated as introducers.
- Contacts `Introducer 1` is matched against dashboard `Names` columns.
- Dashboard aliases applied during matching:
  - `Renbridge` <-> `Renaissance Bridge Capital (LLC)`
  - `Headwall / AGP` <-> `Alliance Global Partners LLC`
  - `Set Cap` / `Setcap` / `Anand` -> same introducer identity
  - `Old City Securities LLC` <-> `Old City Capital`
  - `Astral Global Limited` <-> `Astra Global`
  - `R. F. Lafferty & Co. Inc.` <-> `Lafferty`
  - `AEON INC` <-> `Aeon`
- Investor name normalization includes:
  - first/middle/last swaps for individuals
  - entity-name fallback
  - punctuation/case cleanup
- Canonical naming rule for inserts:
  - use **client file legal names** as stored names in DB
  - use dashboard names only for matching/row alignment
  - alias mapping is matching-only, not storage-name override

## Broker Handling (DB Reality)
- `brokers` table exists, but it is not connected to the current introduction/commission pipeline:
  - `introductions` uses `introducer_id` (no `broker_id`)
  - `introducer_commissions` uses `introducer_id` (no `broker_id`)
  - no FK links from core subscription/introduction/commission tables to `brokers`
- Execution rule for VC2 migration:
  - load all partner/broker/introducer relationships into `introducers` + `introductions` + `introducer_commissions`
  - keep labels via source `role` in migration artifacts (and optional `notes` in DB if needed)
  - when source role is `Broker`, also upsert the broker identity into `brokers` table (dual-write), while keeping commercial flow in introducer tables

## Data Rules to Apply During Upload
- Dashboard is source of truth.
- Zero ownership rows:
  - do not create subscription
  - do not create position
  - commissions can still exist when defined by dashboard structure
- Status/funding:
  - set `status = funded`
  - set `funded_amount = commitment`
- Currency:
  - set from dashboard row value, no assumptions
- Never create partner role; use introducer records only.
- Reuse existing investor/introducer records when matched; do not create duplicates.

## Legacy Rename Guardrails
- Historical rename sources reviewed:
  - `VERSO/datafixing`
  - `datamigration`
  - `dashboardreconciliations`
- VC2 execution rule:
  - resolve known aliases first
  - then upsert only when canonical identity does not exist
  - do not create a new identity when the name difference is only formatting/short-name/alias

## Execution Scope (Client File Only)
- In scope now:
  - `VC201`, `VC202`, `VC203`, `VC206`, `VC207`, `VC209`, `VC210`, `VC211`, `VC215`
- Out of current scope:
  - `VCL001`, `VCL002` (require explicit mapping to DB vehicles before load)

## Execution Order (Controlled Rollout)
1. VC201
2. VC202
3. VC210
4. VC211
5. VC206
6. VC203
7. VC207
8. VC209
9. VC215

Reason: start with smallest compartments first to validate scripts and checks, then move to larger/high-relationship vehicles.

## Per-Vehicle Checklist (Repeat For Each VC)
1. Extract active subscription rows from dashboard sheet.
2. Resolve investor names to canonical DB record IDs (or mark for creation).
3. Resolve introducer/broker/partner names to canonical introducer IDs.
4. Build staged rows:
   - subscriptions
   - positions
   - introductions
   - introducer_commissions
5. Pre-apply validation:
   - row count parity vs dashboard active rows
   - sum checks by currency (`commitment`, `shares`, fee fields)
   - no zero-ownership subscriptions/positions in stage
   - no duplicate keys for subscriptions/commissions
6. Apply vehicle transaction.
7. Post-apply validation in DB:
   - counts and sums equal stage
   - referential integrity (investor/introducer/deal links)
   - no zero-unit positions
8. Log vehicle result and exceptions.

## Validation Outputs Required Per Vehicle
- `vc2_<VC>_staged_rows.csv`
- `vc2_<VC>_precheck.md`
- `vc2_<VC>_postcheck.md`
- `vc2_<VC>_sql.sql`

## Existing Analysis Artifacts
- `verso_capital_2_data/vc2_match_db_review.csv`
- `verso_capital_2_data/VC2_REVIEW_LOG.md`
