# Engine Upgrade Implementation - 2026-02-15

## Objective
Implement the trustworthy-engine upgrade plan across all scopes (`VC1`, `VC2`, `IN`) with deterministic rule governance, strict mapping coverage, and governed warnings.

## What Was Implemented

### 1) Shared core modules
Created:
- `data_verification_engine/core/normalize.py`
- `data_verification_engine/core/matcher.py`
- `data_verification_engine/core/commission_checks.py`
- `data_verification_engine/core/rule_resolver.py`
- `data_verification_engine/core/governance_checks.py`

### 2) Rule governance hardening
- `run_all_scopes.py` now builds rule registry before running scopes.
- Hard-stop on unresolved governance conflicts.
- Resolver now uses latest coverage matrix automatically (`ENGINE_RULE_COVERAGE_MATRIX_*.csv`) instead of hardcoded file.
- Output artifact:
  - `data_verification_engine/rule_registry/rule_registry_resolved.json`

### 3) Scope parity upgrades (VC1/VC2/IN)
Applied consistently across all scope engines:
- Mapping coverage output and hard-fail behavior for unresolved mappings.
- Introduction integrity controls.
- Subscription cross-field formula controls.
- Commission integrity controls.
- Dual-role introducer controls.
- Deprecated introducer-reference controls.
- Enriched summary output sections:
  - `mapping_coverage`
  - `rule_enforcement_summary`
  - `warning_governance_status` (set by trust pack)
- Added per-run artifact:
  - `mapping_coverage.json`

### 4) Warning governance upgrade
- `run_trust_pack.py` now enforces:
  - allow-list by scope
  - threshold by warning category
  - expiry by warning category
  - required owner + reason metadata
- Updated policy:
  - `data_verification_engine/trust_pack/trust_policy.json`

### 5) Coverage matrix closure
Created updated matrix:
- `data_verification_engine/ENGINE_RULE_COVERAGE_MATRIX_2026-02-15.csv`

Status counts in this matrix:
- `IMPLEMENTED`: 83
- `N/A`: 1
- `PARTIAL`: 1

## Governed ruled-exception controls added
Explicit, rule-configured exceptions were introduced where historical data intentionally differs from strict structural shape. These are now warnings (not silent skips), and governed by trust policy thresholds/expiry/owner/reason.

Configured in scope rules:
- `allowed_introduction_duplicate_tuples`
- `allowed_introduction_missing_date_ids`
- `allowed_performance_fee_threshold_multiplier_non_zero_ids`
- `strikethrough_commission_allowed_source_rows`

## Fresh Run Evidence

### Global audit
- Command: `python3 data_verification_engine/run_all_scopes.py --global-outdir data_verification_engine/output/global`
- Output:
  - `data_verification_engine/output/global/run_20260215_133955/global_audit_report.json`
  - `data_verification_engine/output/global/run_20260215_133955/global_audit_summary.md`
- Result:
  - Total fails: `0`
  - Total warnings: `52`

### Trust pack
- Command: `python3 data_verification_engine/run_trust_pack.py --policy data_verification_engine/trust_pack/trust_policy.json --global-outdir data_verification_engine/output/global --trust-outdir data_verification_engine/output/trust`
- Output:
  - `data_verification_engine/output/trust/run_20260215_134008/trust_pack_report.json`
  - `data_verification_engine/output/trust/run_20260215_134008/trust_pack_summary.md`
- Result:
  - `TRUST_STATUS: PASS`
  - `FINDINGS_COUNT: 0`

## Final scope status (latest trust run)
- VC1: `0` fails, `14` warnings
- VC2: `0` fails, `31` warnings
- IN: `0` fails, `7` warnings

Mapping coverage (all scopes):
- `name_mapping_unresolved_count = 0`
- `unmapped_dashboard_rows = 0`
- `unmapped_db_rows = 0`
- `unmapped_commission_rows_dashboard_to_db = 0`
- `unmapped_commission_rows_db_to_dashboard = 0`

## Files changed
- `data_verification_engine/run_all_scopes.py`
- `data_verification_engine/run_trust_pack.py`
- `data_verification_engine/trust_pack/trust_policy.json`
- `data_verification_engine/scopes/vc1/run_vc1_audit.py`
- `data_verification_engine/scopes/vc1/rules_vc1.json`
- `data_verification_engine/scopes/vc2/run_vc2_audit.py`
- `data_verification_engine/scopes/vc2/rules_vc2.json`
- `data_verification_engine/scopes/in/run_in_audit.py`
- `data_verification_engine/scopes/in/rules_in.json`
- `data_verification_engine/core/normalize.py`
- `data_verification_engine/core/matcher.py`
- `data_verification_engine/core/commission_checks.py`
- `data_verification_engine/core/rule_resolver.py`
- `data_verification_engine/core/governance_checks.py`
- `data_verification_engine/ENGINE_RULE_COVERAGE_MATRIX_2026-02-15.csv`
- `data_verification_engine/rule_registry/rule_registry_resolved.json`
