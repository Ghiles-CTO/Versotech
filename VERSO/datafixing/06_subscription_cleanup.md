# 06 Subscriptions Cleanup (Missing Positions)

## Rule
If dashboard ownership position = **0**, subscription (and position) should **not** exist in DB.

## Verification
Matched all 20 subscriptions to dashboard rows using:
- investor name (both `First Last` and `Last First` order)
- vehicle/entity code
- commitment (amount invested)
- shares
- contract date

Result: **all 20 matched rows have ownership = 0** in dashboard.

Evidence:
- `VERSO/datafixing/06_subscriptions_missing_positions.csv`
- `VERSO/datafixing/06_missing_positions_dashboard_check.csv`

## Action
Deleted 20 subscriptions from DB (no positions existed for these IDs).

Output SQL (reference):
- `VERSO/datafixing/06_subscriptions_zero_ownership_delete.sql`
