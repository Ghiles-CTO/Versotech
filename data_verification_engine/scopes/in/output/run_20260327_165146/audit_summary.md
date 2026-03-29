# IN Audit Summary

- Rules version: `2026-02-14.2`
- Dashboard active rows: `26`
- Dashboard zero rows: `5`
- DB subscriptions: `26`
- DB positions: `23`
- DB introductions: `15`
- DB commissions: `38`
- Contacts checked rows: `0`
- Failures: `2`
- Warnings: `18`

## Result
FAIL

## Failure breakdown
- investor_identity_duplicate_global_refs: `1`
- subscription_duplicate_exact: `1`

## Warning breakdown
- dashboard_formula_error_token: `6`
- orphan_introduction_without_subscription: `5`
- commission_row_ruled_dashboard_override: `4`
- commission_totals_ruled_diff_invested_amount: `2`
- commission_totals_ruled_diff_spread: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260327_165146/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260327_165146/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260327_165146/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/in/output/run_20260327_165146/audit_summary.md`