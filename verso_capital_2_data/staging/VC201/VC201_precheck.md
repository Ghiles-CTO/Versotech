# VC201 Precheck (Staged, Not Applied)

## Source Rows
- Dashboard: `VC201` row `3`
- Client contacts: row `2`

## Row Count Checks
- Dashboard subscription rows for VC201: `1`
- Staged subscriptions: `1`
- Staged positions: `1`
- Staged introductions: `0`
- Staged introducer commissions: `0`

## Sum Checks (Dashboard vs Stage)
- Commitment: `372237.5` vs `372237.5`
- Shares: `12408.0` vs `12408.0`
- Ownership/Units: `12408` vs `12408`
- Spread fee: `24816` vs `24816`
- Subscription fee: `11512.5` vs `11512.5`
- BD fee: `0` vs `0`
- FINRA fee: `0` vs `0`

## Naming Decision
- Investor canonical name used: `Infinitas Capital SPV V a series of Infinitas Capital Master LLC`
- Reason: exact match with dashboard VC201 investor entity.

## Broker/Introducer Decision for VC201
- Contact row role is `-` and `Introducer 1` is empty.
- No introducer/broker relationship is staged for VC201.

## Files
- `verso_capital_2_data/staging/VC201/VC201_staged_rows.csv`
- `verso_capital_2_data/staging/VC201/VC201_stage_insert.sql`
- `verso_capital_2_data/staging/VC201/VC201_dashboard_snapshot.json`
