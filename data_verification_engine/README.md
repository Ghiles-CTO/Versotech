# Data Verification Engine (All Vehicles)

Purpose: deterministic verification of DB vs dashboard with explicit rule files.

Current scopes:
- `scopes/vc1/`
- `scopes/vc2/`
- `scopes/in/`

Design:
- each scope has its own `run_*.py` + `rules_*.json`
- outputs written to scope-local `output/run_<timestamp>/`
- rule checkpoints are documented in markdown next to each scope

Commands:
- Strict one-command gate (recommended):
  - `bash data_verification_engine/verify_all_scopes.sh`
- Raw scope runner (no trust gate):
  - `python3 data_verification_engine/run_all_scopes.py`
- Trust pack directly:
  - `python3 data_verification_engine/run_trust_pack.py`

Trust pack checks:
- no failures in any scope
- no unexpected warning check categories (allow-list enforced)
- no forbidden check patterns (fallback/unresolved/missing/duplicate/etc.)
- summary counts must match issue CSV counts (independent consistency check)
- dashboard active rows must equal DB subscriptions per scope
