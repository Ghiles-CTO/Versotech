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
- Failures: `18`
- Warnings: `14`

## Result
FAIL

## Failure breakdown
- commission_row_missing_in_db: `10`
- commission_row_amount_mismatch: `6`
- commission_row_missing_in_dashboard: `1`
- commission_totals_mismatch_spread: `1`

## Warning breakdown
- strikethrough_commission_row_reinstated_ruled: `6`
- commission_totals_ruled_diff_spread: `3`
- introduction_tuple_repeat_ruled: `3`
- introduction_missing_date_ruled: `1`
- performance_fee_threshold_multiplier_non_zero_ruled: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_182312/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_182312/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_182312/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_182312/audit_summary.md`