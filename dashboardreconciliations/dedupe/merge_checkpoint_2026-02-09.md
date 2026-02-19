# Merge Checkpoint (Prod) - 2026-02-09

This checkpoint documents **production database** cleanup work: investor/introducer deduplication and one missing position fix.

## Goals

- Merge true duplicates by updating all FK references to a single canonical record.
- Preserve economics (subscriptions/positions/commissions) and avoid data loss.
- Leave merged-from records **archived** (investors) or **inactive** (introducers).

## Backups (Pre-change Snapshots)

JSON snapshots were taken before the merges and stored in `dashboardreconciliations/dedupe/`:

- `backup_investor_merge_julien_machot_2026-02-08.json`
- `backup_merge_as_advisory_dwc_llc_20260209T002100Z.json`
- `backup_merge_aeon_inc_20260209T002100Z.json`
- `backup_merge_set_cap_20260209T002100Z.json`
- `backup_merge_bright_views_holdings_20260209T002100Z.json`
- `backup_merge_jeffrey_wan_20260209T002100Z.json`
- `backup_merge_rubix_holdings_limited_20260209T002100Z.json`

## Investor Dedupes

### 1) Julien MACHOT

- Canon: `f3dabc56-d079-4536-9ad5-9e6b543aea21` (status `active`)
- Dupe:  `5ee17648-dd9d-4351-a450-f57119440739` (status `archived`)

Additional cleanup applied on 2026-02-09:

- Moved remaining `investor_risk_profiles` rows from dupe -> canon.
- Verified dupe has **0** FK references across all FK columns pointing to `investors`.

### 2) AS ADVISORY DWC LLC

- Canon: `0988f448-e53c-461c-862d-c254f34a0dda`
- Dupe:  `41b8b9df-623b-4b68-9a33-f8abddccf526` (archived)

Actions:

- Updated all FK references (all tables with FK to `investors`) from dupe -> canon.
- Archived dupe (`status='archived'`, `archived_at=now()`).
- Verified dupe has **0** FK references across all FK columns pointing to `investors`.

### 3) AEON INC

- Canon: `e5e82fa2-6bd9-4ef4-b26e-a96a65f995db`
- Dupe:  `4011deca-d273-4fc9-bd33-5fcec27b2d67` (archived)

Actions:

- Deleted duplicate `entity_investors` overlap rows for the dupe investor (to prevent `(vehicle_id, investor_id)` uniqueness issues).
- Updated all FK references (all tables with FK to `investors`) from dupe -> canon.
- Archived dupe (`status='archived'`, `archived_at=now()`).
- Verified dupe has **0** FK references across all FK columns pointing to `investors`.

## Introducer Dedupes

### 1) Set Cap / Setcap

Kept existing canonical ID to avoid changing widely-referenced records, then **renamed** to match client preference.

- Canon (kept): `b661243f-e6b4-41f1-b239-de4b197a689a`
  - Renamed to `legal_name='Set Cap'`, `display_name='Set Cap'`
- Dupes (set `inactive`):
  - `709eb58e-ac69-4618-9421-31afd16df47b`
  - `969a8d38-5e87-49b3-bee4-83e410113d76`

Actions:

- Updated all FK references (all tables with FK to `introducers`) from dupe -> canon.
- Set dupes to `status='inactive'`.
- Verified both dupes have **0** FK references across all FK columns pointing to `introducers`.

### 2) Bright Views Holdings

- Canon: `1ac70c7a-1ea5-477b-8680-2bb54817fb06`
- Dupe (inactive): `3bf18ac4-8462-461f-9b7d-f2299b10be98`

### 3) Jeffrey Wan

- Canon: `5d97cb49-ee76-4653-a62f-baba22263228`
- Dupe (inactive): `8e10c94f-54fa-46b4-a9fa-fd5b8d7a0407`

### 4) Rubix Holdings Limited

- Canon: `3d66464e-d323-45b2-84cc-e533f3643168`
- Dupe (inactive): `ea718107-1545-43f0-9847-8d8e16fd2ec2`

For 2–4:

- Updated all FK references from dupe -> canon (no-op where unused).
- Set dupes to `status='inactive'`.
- Verified dupes have **0** FK references across all FK columns pointing to `introducers`.

## Position Fix

### VC132 - Julien MACHOT position missing

Issue:

- Subscription existed with `num_shares=11505` but **no** `positions` row for the same `(investor_id, vehicle_id)`.

Fix applied:

- Inserted a missing `positions` row:
  - position_id: `f8a1e58e-7d84-4823-9e39-ee2f24bdbf96`
  - investor_id: `f3dabc56-d079-4536-9ad5-9e6b543aea21`
  - vehicle_id: `feb6c223-d0fa-4725-9d89-39d5cf0c8e08` (VC132)
  - units: `11505`
  - cost_basis: `214505.60`
  - as_of_date: `2022-07-02`

Verification:

- Count of subscriptions with `num_shares>0` and missing position is now **0**.

## Current Verification Results

- No remaining **non-archived** investor duplicates by `(email_norm, legal_name_norm)`.
- No remaining **active** introducer duplicates by `(email_norm, legal_name_norm)`.
- No subscriptions with `num_shares>0` and missing positions.

