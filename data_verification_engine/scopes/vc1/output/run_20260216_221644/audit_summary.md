# VC1 Audit Summary

- Rules version: `2026-02-14.3`
- Dashboard active rows: `466`
- Dashboard zero rows: `56`
- DB subscriptions: `466`
- DB positions: `384`
- DB introductions: `498`
- DB commissions: `1030`
- Strikethrough source rows: `29`
- Strikethrough rows still in DB: `6`
- Contacts checked rows: `0`
- Failures: `1879`
- Warnings: `37`

## Result
FAIL

## Failure breakdown
- dashboard_numeric_parse_error: `1878`
- dashboard_date_parse_error: `1`

## Warning breakdown
- commission_row_ruled_dashboard_override: `17`
- strikethrough_commission_row_reinstated_ruled: `6`
- commission_base_amount_vs_funded_amount_ruled: `4`
- commission_totals_ruled_diff_spread: `4`
- introduction_tuple_repeat_ruled: `3`
- commission_rate_amount_formula_ruled: `1`
- introduction_missing_date_ruled: `1`
- performance_fee_threshold_multiplier_non_zero_ruled: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_221644/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_221644/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_221644/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_221644/audit_summary.md`