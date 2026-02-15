# VC2 Audit Summary

- Rules version: `2026-02-11.1`
- Dashboard active rows: `36`
- Dashboard zero rows: `5`
- DB subscriptions: `26`
- DB positions: `23`
- DB introductions: `15`
- DB commissions: `34`
- Contacts checked rows: `0`
- Failures: `106`
- Warnings: `2`

## Result
FAIL

## Failure breakdown
- vehicle_totals_mismatch: `34`
- row_numeric_mismatch: `23`
- row_unmatched_dashboard: `19`
- row_unmatched_db: `9`
- commission_row_missing_in_dashboard: `6`
- commission_row_missing_in_db: `6`
- commission_duplicate_exact: `4`
- position_vs_dashboard_ownership: `3`
- commission_totals_mismatch_invested_amount: `2`

## Warning breakdown
- dashboard_combined_introducer_name: `2`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260211_221007/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260211_221007/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260211_221007/audit_summary.md`