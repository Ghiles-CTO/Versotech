# IN Audit Status (2026-02-11)

## Engine updates applied before this run
- Fixed numeric parsing for dashboard strings like `ETH 15.00`, `ETH 0.30`, etc.
- Added ownership header fallback: `OWNERSHIP POSITION` or `Position`.
- Added management fee header fallback: `Management fees` or `Management Fee`.
- Switched ownership totals to positions table (not `subscriptions.units`).
- Added investor-level ownership check (dashboard vs positions).
- Allowed skipping row-level ownership numeric comparison for IN scope.
- Added alias mappings for middle-name variants (IN102).
- Enabled broker-rule toggle (`run_broker_checks`) so it can be disabled cleanly.
- Fixed summary title to `IN Audit Summary`.

## Latest run
- Command: `python3 data_verification_engine/scopes/in/run_in_audit.py`
- Run folder: `data_verification_engine/scopes/in/output/run_20260211_221632`
- Result: `FAIL`
- Failures: `41`
- Warnings: `2`

## Remaining failures (real deltas to resolve)

### IN102
- `commission_totals_mismatch_invested_amount`: dashboard `74,881.5498` vs DB `0.0` (delta `-74,881.5498`).

### IN103
- BD fee mismatch:
  - Vehicle total: dashboard `5,000.0` vs DB `0.08`.
  - Row-level:
    - `IN3:6` N SQUARE PATEL LLC: dashboard `2,000.0` vs DB `0.02`.
    - `IN3:7` Elizabeth GRACE: dashboard `1,000.0` vs DB `0.02`.
    - `IN3:8` Sherri Lipton Grace 2020 Irrevocable Family Trust: dashboard `1,000.0` vs DB `0.02`.
    - `IN3:10` Jeremy LOWY: dashboard `1,000.0` vs DB `0.02`.
- Exact duplicate commissions in DB: `4` duplicate sets (same introducer/deal/investor/introduction/basis/rate/amount key appears twice).

### IN105
- Entire sheet exists in dashboard but not in DB:
  - `6` subscriptions missing (`IN5:3,4,5,6,7,8`).
  - Vehicle totals all missing in DB (count/commitment/shares/ownership/etc).
  - Positions missing for all 6 investors (dashboard ownership total `70`, DB `0`).

### IN106
- `commission_totals_mismatch_invested_amount`: dashboard `6,600.0` vs DB `3,300.0` (delta `-3,300.0`).

### IN108
- Entire subscription missing in DB:
  - `IN8:3` Anand SETHIA missing.
  - Vehicle totals missing (count/commitment/shares/ownership).
  - Position missing (dashboard `750,000`, DB `0`).

### IN111
- Price mismatch on Boris IPPOLITOV:
  - Vehicle total `price_per_share`: dashboard `292.0` vs DB `292.48`.
  - Row `IN11:4`: dashboard `290.0` vs DB `290.48`.

## Warnings
- IN103 combined introducer name appears in dashboard rows:
  - `IN3:3` and `IN3:9`: introducer text `Altras+Andrew`.
  - Warning only (name-combination style), not an automatic fail.
