# VC113 – Fix Log (2026-01-25)

## Source of truth
- Dashboard: `datamigration/VERSO DASHBOARD_V1.0.xlsx` → sheet `VC13`
- Vehicle: `VC113` (`vehicle_id` `8d4db38a-0119-4eef-bb1a-d9f266aef1e7`)

## Summary (post‑fix)
- Dashboard active subs (position > 0): **73** / **€29,684,740.51**
- DB subs (status != cancelled): **73** / **€29,684,740.51**
- No remaining key mismatches by (amount, shares, contract_date).

## Changes applied

### 1) Mickael RYAN (4 dashboard rows)
- Updated existing 3 DB subs to add shares/price/cost + zero fees:
  - `82f25861-904f-426a-86bb-57f579e886c8` → €1,000,000 / 25,000 shares @ 40
  - `e7e2ff36-892b-49b5-b411-d6ed5984aaa3` → €500,000 / 12,500 shares @ 40
  - `fb696d65-92bb-4e46-8b68-d161222ca0e8` → €600,000 / 14,634 shares @ 41
- Inserted missing €1,000,000 row (23,809 shares @ 42):
  - new sub id: `d04fc9d4-d5f7-4d16-8b32-d9bfb0b7dec6` (status `active`)

**Assumption used:** existing €1,000,000 row mapped to **25,000 @ 40**; inserted row corresponds to **23,809 @ 42**.

### 2) Julien MACHOT (2× €2,000,000 rows)
- Updated existing row with 75,485 shares to correct date:
  - `8815350d-0464-49c9-8a6c-b29c5395221b` contract_date → `2021-07-06`
- Inserted missing 74,539‑shares row:
  - new sub id: `f91884ba-dc5c-4666-84eb-eb6e126c9c36` (status `funded`)

### 3) Scott FLETCHER
- Updated active €500k row with shares/date/fees:
  - `bcb098f7-0432-47ef-ba24-10e8bc9121b9` → 18,634 shares, 2021‑07‑21, 4% sub fee, spread 0.3364
- Zero‑ownership €2M row marked cancelled:
  - `5fb4a18d-5686-4bcb-bd25-d92423c00fce` → status `cancelled`

### 4) Contract date corrections
- Mayuriben JOGANI: `1b1c39af-8403-4040-9cbf-e3fd6146902d` → `2021-09-07`
- Gielke BURGMANS: `48ec1752-e7c2-4a81-bac1-a3fd174410ec` → `2021-08-24`
- Robert DETTMEIJER: `c24a6861-6e3e-4b7f-8bfc-a3470b7a86fb` → `2021-11-17`
- Abhie SHAH: `fbb833f6-d07e-42fa-939b-036936f6f362` → `2022-03-17`

### 5) “ISIN” contract date (dashboard)
- Dashboard shows `ISIN` in Contract Date for Tuygan GOKER.
- DB date set to NULL to match dashboard missing date:
  - `3fc7fd36-d40b-4b5d-9cdd-b4ace2a4f6b0` → `contract_date = NULL`

### 6) Investor name normalization
- Display name aligned to dashboard:
  - Investor `14919d5e-50fc-4c0f-8794-e83a72b62813` display_name → **Daniel BAUMSLAG**

## Notes
- No introducer/partner data was present for the affected rows (Ryan, Julien, Fletcher), so no introductions/commissions were added.
- Positions already aligned with dashboard ownership totals; no position updates required.
