# AGP / Infinitas Verification (VC2)

## What was checked
- Client file: `verso_capital_2_data/VERSO Capital 2 SCSp Emails and Contacts.xlsx`
- Dashboard: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx` (sheet `VC203`)
- Production DB (`investors`, `subscriptions`, `positions`, `introducers`, `introductions`, `introducer_commissions`)

## Exact name in production DB
- Investor used for AGP QP subscription:
  - `AGP Alternative Investment QP`
  - `investor_id = c0b9a5e9-bab5-43bb-a84f-44217c55c6d6`

## Exact name in client file
- Row `24`:
  - `Series = VCL001`
  - `Legal Name = AGP Alternative Investment QP`
  - `Introducer 1 = Alliance Global Partners LLC`

## Exact name in dashboard
- `VC203` row `16`:
  - Investor entity = `AGP Alternative Investment QP`
  - Vehicle = `VCL001`
  - Amount = `9,195,433.90`
  - Shares = `211,730`
  - Ownership = `211,730`
  - Date = `2025-11-04`

- `VC203` row `3`:
  - Investor entity = `Infinitas Capital SPV VII a series of Infinitas Capital Master LLC`
  - Vehicle = `VC203`
  - Amount = `704,509.00`
  - Shares = `19,040`
  - Ownership = `19,040`
  - Date = `2025-01-31`

## Current DB row assignment (after correction)
- `0316fec6-1c83-42eb-84ea-bb7a476bf27a` -> `AGP Alternative Investment QP` (`9,195,433.90 / 211,730 / 2025-11-04`)
- `1b9bf971-2ad7-40ce-b8f6-5eb8ae53812f` -> `Infinitas Capital SPV VII a series of Infinitas Capital Master LLC` (`704,509.00 / 19,040 / 2025-01-31`)

## Introducer naming status
- `Alliance Global Partners LLC` exists and is in use.
- `Headwall / AGP` exists but is unused:
  - `introductions` refs = `0`
  - `introducer_commissions` refs = `0`

## Recheck method (deterministic)
- Match rows only by:
  - `vehicle + commitment + shares + contract_date`
- Do not rely on fuzzy name matching for this case.
