# VC1 Audit Summary

- Rules version: `2026-02-13.2`
- Dashboard active rows: `426`
- Dashboard zero rows: `55`
- DB subscriptions: `426`
- DB positions: `352`
- DB introductions: `485`
- DB commissions: `1012`
- Contacts checked rows: `0`
- Failures: `9`
- Warnings: `4`

## Result
FAIL

## Failure breakdown
- commission_row_missing_in_db: `3`
- commission_row_amount_mismatch: `2`
- commission_row_count_mismatch: `2`
- commission_row_missing_in_dashboard: `1`
- commission_totals_mismatch_invested_amount: `1`

## Warning breakdown
- commission_totals_ruled_diff_spread: `3`
- dashboard_commission_amount_without_name: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_194525/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_194525/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_194525/audit_summary.md`