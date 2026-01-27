# VC126 (VC26) – Fix Log (2026-01-25)

## Scope
- VC26 sheet in `datamigration/VERSO DASHBOARD_V1.0.xlsx`
- Supabase prod (`versotech-prod` via REST)
- Tables: `investors`, `subscriptions`, `introductions`, `introducer_commissions`
- Rule: partners are introducers; zero-ownership rows have no subscription/position but can still have introductions/commissions.

## Investor name normalization (DB)
- `Anand RATHI` → `Setcap` (investor id `97f2847e-abf6-4e8b-881a-81aa1dda8022`)
- `Garson LEVY` → `Garson Brandon LEVY` (investor id `b1bec6b1-22a2-4088-a69c-7a26358862db`)
- `Odile and Georges MRAD and FENERGI` → `Odile and Georges Abou MRAD and FENERGI` (investor id `20264559-6a69-447d-baa5-72d7ea111fb9`)

## Subscription data fixes
- VC126 Setcap subscription (shares 3676, contract_date 2023-03-24) had `funded_amount = 0` → updated to `250000`.

## Introductions
- Inserted 1 missing introduction for VC126 deal `e2d649da-f1e9-49ca-b426-dd8ade244f12`.
  - Most introductions already existed; created missing one before inserting commissions.

## Commissions
- Inserted 16 missing commissions total for VC126 (partners + introducers):
  - 10 rows from initial reconciliation (spread/subscription fees)
  - 6 additional rows for zero-ownership rows where subscription does not exist (matched by investor name)
- Basis types used: `invested_amount`, `spread`.
- `rate_bps` rounded to integer (DB column is integer). `accrual_amount` rounded to 2 decimals.

## Reconciliation status
- VC26 ownership>0 rows (20 investors) now match DB subscriptions after name normalization.
- Commissions for VC126 reconcile to `dashboard_introducer_summary_v2.csv` (partners + introducers) with 2‑decimal rounding.
- Positions for VC126 align with dashboard ownership (case‑insensitive name match + Setcap mapping).

## Updated exports
- Re-ran `VERSO/datafixing/export_supabase_reports.py`.
  - `datamigration/commission_data_export.json` updated (commissions: 1369)
  - `/tmp/subscription_data.json` updated (subscriptions: 480)

## Supporting artifacts
- `VERSO/datafixing/vc126_missing_introductions.json`
- `VERSO/datafixing/vc126_missing_commissions.json`
- `VERSO/datafixing/vc126_missing_commissions_int.json`
- `VERSO/datafixing/vc126_missing_commissions_all.json`
- `VERSO/datafixing/vc126_missing_introductions_all.json`

## Follow-up (other agent changes)
- Validated “other agent” updates for VC126: current values now match dashboard.
- Patched VC126 Setcap 3676‑shares subscription (`3a4d2982-...`): set `deal_id` to VC126 deal and `introducer_id` to Manna Capital.

## Out-of-scope insert (needs your decision)
- VC130 subscription insert (`25700ca9-...`) exists with `deal_id = NULL` and `funded_amount = 0`.
  - Requires rollback or proper alignment; awaiting your instruction.

## VC130 audit + fix (2026-01-25)
- VC30 dashboard rows: 5 ownership>0; DB subscriptions: 5 (all exact match).
- Positions match dashboard ownership (no mismatches).
- Commissions: none in dashboard or DB.
- Fixed subscription `25700ca9-77c4-4742-a332-51ed10206abd` (Julien MACHOT 250k):
  - set `deal_id` to VC130 deal `690ffc05-9928-4684-8a3b-1b6e4f022716`
  - set `funded_amount` to 250,000
