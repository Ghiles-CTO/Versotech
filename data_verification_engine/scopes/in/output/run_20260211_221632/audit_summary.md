# IN Audit Summary

- Rules version: `2026-02-11.1`
- Dashboard active rows: `33`
- Dashboard zero rows: `8`
- DB subscriptions: `26`
- DB positions: `23`
- DB introductions: `15`
- DB commissions: `34`
- Contacts checked rows: `0`
- Failures: `41`
- Warnings: `2`

## Result
FAIL

## Failure breakdown
- vehicle_totals_mismatch: `14`
- position_vs_dashboard_ownership_by_investor: `7`
- row_unmatched_dashboard: `7`
- row_numeric_mismatch: `5`
- commission_duplicate_exact: `4`
- commission_totals_mismatch_invested_amount: `2`
- position_vs_dashboard_ownership: `2`

## Warning breakdown
- dashboard_combined_introducer_name: `2`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260211_221632/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260211_221632/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260211_221632/audit_summary.md`