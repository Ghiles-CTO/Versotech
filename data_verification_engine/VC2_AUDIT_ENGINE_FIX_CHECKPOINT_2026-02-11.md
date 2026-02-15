# VC2 Audit Engine Fix Checkpoint — 2026-02-11

## Scope
Hardened the VC2 audit engine for deterministic row-level verification across dashboard vs DB with broker/introducer rules applied.

## Files changed
- `data_verification_engine/scopes/vc2/run_vc2_audit.py`
- `data_verification_engine/scopes/vc2/rules_vc2.json`

## Engine fixes applied
1. Commission name/amount slot mapping fixed
- Added `dashboard_commission_slots` support.
- Default slots now map name -> correct amount columns:
  - Slot1: name col 43, invested col 45, spread col 51
  - Slot2: name col 53, invested col 55, spread col 61
- VC203 slot override:
  - Slot1: name 44, invested 46, spread 52
  - Slot2: name 54, invested 56, spread 62

2. Alias normalization fixed (root cause of false commission mismatches)
- Added canonical keying (`canonical_name_key`) and normalized alias map in engine init.
- Alias targets are now canonicalized too, so `Renbridge -> Renaissance Bridge Capital LLC` resolves properly.

3. Combined-introducer handling expanded
- Ambiguous combined cells now detected for both `+` and multi-line names (`\n`).
- These rows are treated as warning-only for strict row-level commission parity.

4. Row-level commission matching scope alignment
- Row-level commission parity now skips vehicles excluded by rules (`VCL001`, `VCL002`) the same way totals logic does.

5. Rule aliases updated for VC2 naming patterns
- Added/standardized aliases for:
  - Renbridge/Renaissance -> Renaissance Bridge Capital LLC
  - Aeon -> AEON INC
  - Headwall / AGP -> Alliance Global Partners LLC
  - Astra/Astral naming
  - Bromley variants
  - Lafferty shorthand
  - Bright Views variants
  - Set Cap / Anand variants
  - Robert C. VOGT IV / Georges CHEN normalization

## Latest run
- Run folder: `data_verification_engine/scopes/vc2/output/run_20260211_200701`
- Result: `FAIL`
- Fail count: `24`
- Warning count: `32`

### Remaining FAILS (all in VC209)
- `vehicle_totals_mismatch` (3)
  - cost_per_share
  - spread_per_share
  - spread_fee
- `row_numeric_mismatch` (21)
  - 7 investors x 3 fields each:
    - PREAMBLE X CAPITAL I, A SERIES OF PREAMBLE X CAPITAL LLC
    - Kartik Kumar ATTULURI
    - MADISON TRUST COMPANY (on behalf of Edward Bendickson)
    - FRONTIERX VIII, LP
    - Julien MACHOT
    - Prabhakar Somana KONGANDA
    - Mohan SASANAPURI
  - Pattern: dashboard uses `cost_per_share=75` and corresponding spread values; DB has older values (`35`-based row economics).

### Warnings (ruled/expected)
- `dashboard_combined_introducer_name`: 16
- `commission_row_ruled_removed`: 11
- `commission_totals_ruled_diff_invested_amount`: 4
- `introducer_warning_only_present`: 1 (Bright Views Holdings)

## Interpretation
- Engine logic is now deterministic and rule-aware for VC2.
- Remaining failures are true numeric deltas concentrated in VC209 (not parser/matching noise).
