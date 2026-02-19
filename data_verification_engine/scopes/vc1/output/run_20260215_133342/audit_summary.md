# VC1 Audit Summary

- Rules version: `2026-02-14.3`
- Dashboard active rows: `426`
- Dashboard zero rows: `55`
- DB subscriptions: `426`
- DB positions: `352`
- DB introductions: `485`
- DB commissions: `1013`
- Contacts checked rows: `0`
- Failures: `630`
- Warnings: `3`

## Result
FAIL

## Failure breakdown
- commission_rate_amount_formula_mismatch: `390`
- commission_base_amount_vs_funded_amount_mismatch: `130`
- introduction_contract_date_mismatch: `104`
- introduction_duplicate_tuple: `3`
- introduction_missing_date: `1`
- performance_fee_threshold_multiplier_non_zero: `1`
- subscription_fee_formula_mismatch: `1`

## Warning breakdown
- commission_totals_ruled_diff_spread: `3`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260215_133342/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260215_133342/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260215_133342/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260215_133342/audit_summary.md`