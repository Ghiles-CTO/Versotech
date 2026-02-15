# VC1 Audit Summary

- Rules version: `2026-02-11.1`
- Dashboard active rows: `415`
- Dashboard zero rows: `59`
- DB subscriptions: `426`
- DB positions: `353`
- DB introductions: `487`
- DB commissions: `1031`
- Contacts checked rows: `0`
- Failures: `941`
- Warnings: `7`

## Result
FAIL

## Failure breakdown
- commission_row_missing_in_dashboard: `200`
- commission_row_missing_in_db: `194`
- position_vs_dashboard_ownership_by_investor: `142`
- row_numeric_mismatch: `126`
- row_unmatched_db: `89`
- row_unmatched_dashboard: `78`
- row_contract_date_mismatch: `32`
- vehicle_totals_mismatch: `31`
- commission_duplicate_exact: `11`
- commission_row_amount_mismatch: `9`
- commission_totals_mismatch_invested_amount: `9`
- commission_totals_mismatch_spread: `7`
- zero_ownership_loaded: `5`
- position_vs_dashboard_ownership: `4`
- max_introducers_per_subscription_exceeded: `3`
- dashboard_columns_missing: `1`

## Warning breakdown
- dashboard_commission_header_check: `4`
- dashboard_combined_introducer_name: `3`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260211_235807/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260211_235807/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260211_235807/audit_summary.md`