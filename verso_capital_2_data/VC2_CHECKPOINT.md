# VC2 Checkpoint (2026-02-07, Final)

## Scope
- Client file: `verso_capital_2_data/VERSO Capital 2 SCSp Emails and Contacts.xlsx`
- Dashboard file: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- Vehicles in scope:
  - `VC201, VC202, VC203, VC206, VC207, VC209, VC210, VC211, VC215`
  - `VCL001, VCL002` (separate vehicles/deals, not merged into VC203)

## Rules Applied
- Red rows in client file excluded:
  - row `10` (`Sebastian LATTUGA`)
  - row `13` (`EVERLASTING HOLDINGS LLC`)
- Ownership rule:
  - `ownership > 0` -> subscription + position in DB
  - `ownership = 0` -> no subscription/position in DB
  - introducer commissions can still exist
- Partners treated as introducers.
- Brokers stored in `brokers` table, not in introducer commission flow.

## DB Corrections Applied

### 1) VCL split corrected
- Created missing deals:
  - `VCL001` -> `798f52f9-de4a-4f64-9500-24cad865ed4c`
  - `VCL002` -> `38cac51e-e953-410e-8d6a-14edc05b63d8`
- Moved 4 subscriptions out of VC203:
  - AGP QP `9,195,433.90` -> `VCL001`
  - AGP Fund VI Series 2 `1,642,609.46` -> `VCL001`
  - AGP QF `356,169.43` -> `VCL002`
  - AGP Fund VI Series 2 `1,842,691.47` -> `VCL002`
- Rebuilt affected introductions/commissions and re-linked positions for these AGP rows.

### 2) Broker flow cleanup
- Removed introductions/commissions in VC2 scope for:
  - `R. F. Lafferty & Co. Inc.`
  - `Old City Securities LLC`
- Broker master records were kept (only introducer-flow records removed).
- Final hard cleanup applied:
  - Removed dormant introducer master rows (`introducers`) for:
    - `R. F. Lafferty & Co. Inc.`
    - `Old City Securities LLC` (2 duplicate master rows)
    - `Bromley Capital`
  - Post-check:
    - remaining rows in `introducers` for these names: `0`
    - remaining rows in `introductions`: `0`
    - remaining rows in `introducer_commissions`: `0`
  - Broker masters still present in `brokers` table:
    - `R. F. Lafferty & Co. Inc.`: `1`
    - `Old City Securities LLC`: `1`

### 3) VC215 Bromley rule
- Removed all `Bromley Capital` introductions/commissions on VC215.
- Where Bromley was paired with another introducer:
  - kept the other introducer
  - reduced invested-rate by `1%` (`100 bps`, floor at 0)
- Result: no Bromley introducer-flow records remain on VC215.

## Current DB Counts (post-fix)
- `VC201`: 1
- `VC202`: 2
- `VC203`: 15
- `VC206`: 11
- `VC207`: 25
- `VC209`: 25
- `VC210`: 2
- `VC211`: 1
- `VC215`: 19
- `VCL001`: 2
- `VCL002`: 2

## Workbook Generated
- Output: `verso_capital_2_data/VC2_Subscriptions_Introducers.xlsx`
- Rows: `105`
- Max introducers per subscription in file: `2`
- Three-way total check: `totals_mismatch_rows = 0`
  - dashboard vs DB vs generated file are aligned in the totals sheet.

## Contact Data
- VC2 investor/introducer contact values from client file were applied in DB where mapped.
- `Infinitas Capital SPV VII a series of Infinitas Capital Master LLC` confirmed with:
  - `display_name` populated
  - email set.
- Current DB completeness check in VC2 scope:
  - investors with blank email: `0/80`
  - introducers with blank email: `0/21`

## Notes
- Duplicate-looking rows that exist in dashboard as separate subscriptions were preserved as separate subscriptions in DB.
- No new partner role type was created; partner-origin lines are handled in introducer/broker logic per rule above.
