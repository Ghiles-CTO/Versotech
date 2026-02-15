# VC1 Audit Summary

- Rules version: `2026-02-11.1`
- Dashboard active rows: `215`
- Dashboard zero rows: `32`
- DB subscriptions: `426`
- DB positions: `353`
- DB introductions: `487`
- DB commissions: `1031`
- Contacts checked rows: `0`
- Failures: `1168`
- Warnings: `106`

## Result
FAIL

## Failure breakdown
- commission_row_missing_in_dashboard: `536`
- row_unmatched_db: `240`
- position_vs_dashboard_ownership_by_investor: `236`
- vehicle_totals_mismatch: `46`
- row_contract_date_mismatch: `32`
- row_unmatched_dashboard: `29`
- commission_duplicate_exact: `11`
- commission_totals_mismatch_invested_amount: `9`
- dashboard_columns_missing: `7`
- commission_totals_mismatch_spread: `6`
- row_numeric_mismatch: `6`
- position_vs_dashboard_ownership: `5`
- max_introducers_per_subscription_exceeded: `3`
- commission_row_missing_in_db: `2`

## Warning breakdown
- dashboard_commission_header_check: `106`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260211_235455/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260211_235455/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260211_235455/audit_summary.md`