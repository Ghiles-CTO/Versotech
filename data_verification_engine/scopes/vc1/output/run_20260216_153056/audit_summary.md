# VC1 Audit Summary

- Rules version: `2026-02-14.3`
- Dashboard active rows: `426`
- Dashboard zero rows: `55`
- DB subscriptions: `426`
- DB positions: `352`
- DB introductions: `485`
- DB commissions: `1013`
- Strikethrough source rows: `12`
- Strikethrough rows still in DB: `6`
- Contacts checked rows: `0`
- Failures: `2`
- Warnings: `14`

## Result
FAIL

## Failure breakdown
- position_vs_dashboard_ownership: `1`
- position_vs_dashboard_ownership_by_investor: `1`

## Warning breakdown
- strikethrough_commission_row_reinstated_ruled: `6`
- commission_totals_ruled_diff_spread: `3`
- introduction_tuple_repeat_ruled: `3`
- introduction_missing_date_ruled: `1`
- performance_fee_threshold_multiplier_non_zero_ruled: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_153056/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_153056/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_153056/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_153056/audit_summary.md`