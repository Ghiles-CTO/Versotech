# VC112 / VC143 Data Rules & Actions

## Source of truth
- Dashboard file: `datamigration/VERSO DASHBOARD_V1.0.xlsx`
- Sheets used:
  - `VC12` → `VC112`
  - `VC43` → `VC143`
- Only these two vehicles were processed for this task.

## Matching & normalization rules
- **Investor matching priority**:
  1) If **Investor Entity** is present, match by entity name (normalized: lowercase, no accents/punctuation).
  2) Otherwise, match by **First + Last** name (normalized).
  3) If multiple matches exist, disambiguate using existing subscriptions/positions on the same deal/vehicle.
- **Introducer matching** uses normalized names against `introducers` table (`display_name` / `legal_name`).
- **Name normalization** uses `VERSO/datafixing/introducers name change.csv` plus manual aliases:
  - Anand → Setcap
  - Dan / Daniel → Daniel Baumslag
  - Rick / Rick+Andrew / Elevation+Rick → Altras Capital Financing Broker
  - Terra Financial → Terra Financial & Management Services SA
  - (others as in CSV)

## Subscription & position rules
- A dashboard row is a **subscription candidate** if it has investor data.
- **Ownership position = 0** → **do not create** subscription or position.
- Positions in DB are **aggregated per investor + vehicle** (sum of ownership positions from dashboard).
- The **subscription** row should include all numeric fee columns where available:
  - `commitment`, `num_shares`, `price_per_share`, `cost_per_share`
  - `subscription_fee_percent`, `subscription_fee_amount`
  - `performance_fee_tier1_percent` (threshold stored as NULL when dashboard shows `0x`)
  - `spread_per_share` / `spread_fee_amount` only when non‑zero
- **Opportunity** column maps to `subscriptions.opportunity_name`.

## Introducers / partners
- **Partners are treated as introducers**.
- Both **PARTNERS** and **INTRODUCERS** columns in the dashboard are extracted.
- For VC112/VC143 specifically:
  - VC112 has introducer rows (TERRA, FINSA).
  - VC143 has no introducer rows in the dashboard.

## Commission rules
- Only commissions from **introducer columns** are created.
- Basis type mapping:
  - Subscription fee → `invested_amount`
  - Performance fee → `performance_fee`
  - Spread → `spread` (only if non‑zero)
- `tier_number` not used (NULL), matching existing DB patterns for performance fee commissions.

## Actions performed (2026‑01‑23)
1) **Inserted missing subscription**
   - VC112 row 9 (Dan BAUMSLAG)
   - New subscription id: `df3ac382-be56-4267-ae06-7af7042b9fc9`
   - Values: commitment 25,000; shares 16,370; price/cost per share 1.5271; performance fee 10%; subscription fee 0; contract date NULL; opportunity `BETTER BRAND`.

2) **Updated existing subscription**
   - VC112 row 20 (Giovanni ALBERTINI)
   - Subscription id: `a3ac1c10-012e-43da-92d6-3266e03ab8f4`
   - Updates:
     - `contract_date` → 2022‑10‑28 (dashboard)
     - `subscription_fee_amount` → 2,000
     - `performance_fee_tier1_percent` → 0.2
     - `subscription_fee_percent` kept at 0.04

## Verification status
- `VERSO/datafixing/vc112_vc143_report.md` now shows:
  - 0 missing investor matches
  - 0 missing introducer matches
  - 0 DB subscriptions/positions not found in dashboard
- Prepared CSVs:
  - `vc112_vc143_subscriptions_prepared.csv`
  - `vc112_vc143_positions_prepared.csv`
  - `vc112_vc143_introductions_prepared.csv`
  - `vc112_vc143_commissions_prepared.csv`
