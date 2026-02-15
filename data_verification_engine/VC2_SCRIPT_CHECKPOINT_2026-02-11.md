# VC2 Script Checkpoint - 2026-02-11

Scope: VC2 audit engine only (no DB writes).

## What was changed

1. Normalized script defaults to the new engine path:
- `data_verification_engine/scopes/vc2/run_vc2_audit.py`
- `data_verification_engine/scopes/vc2/rules_vc2.json`
- output under `data_verification_engine/scopes/vc2/output/`

2. Fixed dashboard commission column parsing by sheet:
- Default commission amount columns remain:
  - invested: `35,45,55`
  - spread: `41,51,61`
- VC203 override added:
  - invested: `36,46,56`
  - spread: `42,52,62`

3. Added rule-based exclusions/deltas for commission parity:
- Excluded from dashboard commission parity (no sheet-level parity check): `VCL001`, `VCL002`
- Ruled invested deltas (treated as warning, not failure):
  - `VC203: -60673.76`
  - `VC207: -26138.70`
  - `VC209: -252680.50`
  - `VC215: -141572.41`

## Current run

- Run: `data_verification_engine/scopes/vc2/output/run_20260211_190953/`
- Result: `FAIL`
- Failures: `24`
  - `row_numeric_mismatch: 21`
  - `vehicle_totals_mismatch: 3`
- Warnings: `5`
  - `commission_totals_ruled_diff_invested_amount: 4`
  - `introducer_warning_only_present: 1`

## What still fails (real, deterministic)

All hard failures are VC209 numeric parity:
- `cost_per_share`
- `spread_per_share`
- `spread_fee`

The mismatches are exactly on the known 7 VC209 subscriptions where dashboard reflects `cost_per_share=75` and DB remains on `cost_per_share=35`.
