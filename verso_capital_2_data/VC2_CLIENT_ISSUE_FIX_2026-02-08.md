# VC2 Client Issue Fix - 2026-02-08

## What was fixed in DB

### VC203 investor-introducer correspondence
- `Tobias ENSELE`:
  - now linked to 2 introducers: `Renaissance Bridge Capital LLC` + `Old City Securities LLC`
  - commissions now include both introducers (invested 26,250 each; spread/perf 0)
- `INCRED GLOBAL WEALTH PTE LTD`:
  - now linked to 2 introducers: `Renaissance Bridge Capital LLC` + `Old City Securities LLC`
  - commissions now include both introducers (invested 26,250 each; spread/perf 0)
- `DOMINARI SECURITIES LLC`:
  - broker side restored in introducer-flow for consistency with dashboard combined line
  - now includes `R. F. Lafferty & Co. Inc.` with invested commission `48,055.07`
- `Sebastian LATTUGA`:
  - now includes `R. F. Lafferty & Co. Inc.` with invested commission `14,563.11`

## Workbook updated
- File updated: `verso_capital_2_data/VC2_Subscriptions_Introducers.xlsx`
- Rows corrected in `Subscriptions_Review`:
  - VC203 `INCRED GLOBAL WEALTH PTE LTD`
  - VC203 `Tobias ENSELE`
  - VC203 `DOMINARI SECURITIES LLC`
  - VC203 `Sebastian LATTUGA`
- Added sheet: `VC203_VC206_Reconciliation`
  - explains VC206 fee-total difference split between:
    - active-subscription rows (ownership > 0)
    - zero-ownership commission-only rows

## VC206 totals clarification
- Dashboard introducer invested fees (all rows): `473,766.54`
- Dashboard introducer invested fees (ownership > 0 rows): `62,960.29`
- Dashboard introducer invested fees (ownership = 0 rows): `410,806.25`
- Export `Subscriptions_Review` introduces only active-subscription rows, so it shows `62,960.28`.

This is why VC206 can appear mismatched if the dashboard total is taken from all rows while the export is filtered to active subscription rows.

## VC215 Bromley + X rule correction (2026-02-08, late pass)

Applied exactly on `invested_amount` commissions for VC215 combined rows:
- Removed Bromley share by reducing kept introducer rate by `100 bps` (1.00%).
- Updated both:
  - `introducer_commissions.rate_bps`
  - `introducer_commissions.accrual_amount` (proportional recalculation)
  - `introductions.commission_rate_override_bps`

Rows corrected:
- `Anthropic Compartment, HAG Private Markets SARL` / `Hottinger AG`: `800 -> 700 bps`
- `Anuroop ARORA` / `Renaissance Bridge Capital LLC`: `261 -> 161 bps`
- `VARUN SEMBIUM VARADARAJAN` / `Renaissance Bridge Capital LLC`: `202 -> 102 bps`
- `CARTA INVESTMENTS LLC` / `Infinyte Club Private Limited`: `161 -> 61 bps`
- `Gourav KAKKAR` / `Infinyte Club Private Limited`: `261 -> 161 bps`
- `Rajagopalan MADHUSUDAN` / `Infinyte Club Private Limited`: `261 -> 161 bps`
- `Ved NIRANJANBHAI ANTANI` / `Infinyte Club Private Limited`: `261 -> 161 bps`
- `Mahesh NALLAPATI` / `Infinyte Club Private Limited`: `261 -> 161 bps`

Post-fix checks:
- VC2 active-linked invested commissions:
  - DB: `1,931,876.85`
  - Export file: `1,931,876.85`
- Subscription/position sums remain matched (dashboard active vs DB vs export).

## Additional client feedback fixes (2026-02-08, late pass #2)

### VC203 - EVERLASTING HOLDINGS LLC (fee split correction)
Dashboard (`VC203`, row 9) specifies the subscription fee split as `0.5% + 1%` across:
- `Sakal Advisory, LLC` (0.50%) -> **$5,000.00**
- `Astral Global Limited` (1.00%) -> **$10,000.00**

DB was previously splitting the total fee equally (`$7,500 + $7,500`).

Fix applied in Prod:
- Updated `introducer_commissions` (`basis_type = invested_amount`) amounts and `rate_bps`:
  - `Sakal Advisory, LLC`: `50 bps`, `$5,000.00`
  - `Astral Global Limited`: `100 bps`, `$10,000.00`
- Updated `introductions.commission_rate_override_bps` accordingly for both introductions.

### VC203 - DOMINARI SECURITIES LLC (fee split correction)
Dashboard (`VC203`, row 4) specifies the subscription fee split as `1.99998% + 1.844426%` across:
- `Dimensional Advisors` -> **$49,999.50**
- `R. F. Lafferty & Co. Inc.` -> **$46,110.65**

DB was previously allocating an even split (`$48,055.08 + $48,055.07`), which matched the total but not the per-introducer amounts.

Fix applied in Prod:
- Updated `introducer_commissions` (`basis_type = invested_amount`) accrual amounts to match dashboard:
  - `Dimensional Advisors`: `$49,999.50` (stored `rate_bps = 200`)
  - `R. F. Lafferty & Co. Inc.`: `$46,110.65` (stored `rate_bps = 184`)
- Updated `introductions.commission_rate_override_bps` to the same integer bps used above.

### VC203 - AEON INC (removed bogus introducer)
Dashboard (`VC203`, row 20) and the VC2 contacts file both show **no introducer** for `AEON INC` in `VC203`.

DB had a single introducer link (`Alliance Global Partners LLC`) with all-zero commissions.

Fix applied in Prod:
- Deleted the `introductions` row for `AEON INC` + `VC203` deal + `Alliance Global Partners LLC`
- Deleted the 3 associated `introducer_commissions` rows (all `0.00`)

### Export regenerated
Updated client workbook regenerated from Prod after the fixes above:
- `verso_capital_2_data/VERSO Capital 2 SCSp - Subscriptions and Introducers.xlsx`

## Clarification: VCL001/VCL002 are NOT part of VC203
The dashboard workbook lists `VCL001` / `VCL002` rows inside the `VC203` tab, but those rows are explicitly marked with `Vehicle = VCL001` or `Vehicle = VCL002`.

In Production, these are separate vehicles (VERSO Capital LLC), and we keep them separate in DB + export:
- `VC203`: VERSO Capital 2 SCSP Series 203
- `VCL001`: VERSO Capital LLC Series 001
- `VCL002`: VERSO Capital LLC Series 002
