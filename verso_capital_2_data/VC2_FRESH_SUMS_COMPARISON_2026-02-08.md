# VC2 Fresh Sums Comparison (Dashboard vs DB vs Export)

Date: 2026-02-08  
Scope: `VC201, VC202, VC203, VC206, VC207, VC209, VC210, VC211, VC215, VCL001, VCL002`  
Sources used directly:
- Dashboard workbook: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- Live DB (production): `subscriptions`, `positions`, `introducer_commissions`, `introductions`
- Client export file: `verso_capital_2_data/VC2_Subscriptions_Introducers.xlsx`

No old extracted CSVs were used for this comparison.

## Rules applied in comparison
- Subscription/position parity uses dashboard rows with `OWNERSHIP POSITION > 0` (active rows only).
- Zero-ownership rows are excluded from subscription/position sums.
- Commission comparisons are shown in two ways:
  - `Dashboard active rows` vs `DB/file active-linked commissions`
  - `DB all commissions` (includes commission-only rows such as VC206 ownership=0 cases)
- Broker cleanup and VC215 Bromley rule are considered expected transformations.

## Result summary
- Subscription sums: **MATCH** across Dashboard (active), DB, and Export.
- Introducer spread sums: **MATCH** (rounding-level difference only).
- Introducer invested-fee sums:
  - **DB == Export** (active-linked logic)
  - **Dashboard(active) > DB/Export** on specific vehicles because of rule-based exclusions/transformations.

## Overall totals

### Subscriptions (active rows)
- Commitment: `122,416,868.40` (Dashboard = DB = Export)
- Shares: `1,602,962.00` (Dashboard = DB = Export)
- Ownership Units: `1,597,362.00` (Dashboard = DB = Export)
- Spread Fee Amount: `20,968,173.41` (Dashboard = DB = Export)
- Subscription Fee Amount: `1,170,988.48` (Dashboard = DB = Export)
- BD Fee Amount: `33,115.55` (Dashboard = DB = Export)
- FINRA Fee Amount: `400,805.45` (Dashboard = DB = Export)

### Introducer commissions
- Invested amount commissions:
  - Dashboard active: `2,306,418.48`
  - DB active-linked: `2,034,265.26`
  - Export active: `2,034,265.26`
- Spread commissions:
  - Dashboard active: `25,654.80`
  - DB active-linked: `25,654.81`
  - Export active: `25,654.81`
- DB all invested commissions (includes commission-only rows): `2,445,071.51`
  - DB all - DB active-linked = `410,806.25` (this is VC206 commission-only population)

## Vehicle-level commission deltas (Dashboard active - Export/DB active-linked)
- `VC206`: `+0.01` (rounding)
- `VC207`: `+26,138.70`
- `VC209`: `+207,680.50`
- `VC215`: `+38,334.00`
- `VCL002`: `+0.01` (rounding)

Interpretation:
- `VC207` / `VC209`: delta is from broker-side rows present in dashboard logic but removed from introducer-flow per rule.
- `VC215`: delta is from Bromley handling rule (Bromley-only removed; Bromley+other renamed/adjusted by -1%).

## Data health checks
- DB subscription rows in scope: `105`
- Dashboard active rows in scope: `105`
- Export rows in scope: `105`
- DB subscriptions with `units = 0`: `0`
- DB subscriptions with non-funded status: `0`

## Notes
- This comparison confirms subscription/position data is consistent.
- Remaining discrepancy is only on invested-fee totals when comparing **raw dashboard active introducer columns** against **rule-adjusted DB/export introducer flow**.
