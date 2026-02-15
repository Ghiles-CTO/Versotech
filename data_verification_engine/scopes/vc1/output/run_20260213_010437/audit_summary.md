# VC1 Audit Summary

- Rules version: `2026-02-13.1`
- Dashboard active rows: `426`
- Dashboard zero rows: `55`
- DB subscriptions: `426`
- DB positions: `352`
- DB introductions: `487`
- DB commissions: `1007`
- Contacts checked rows: `0`
- Failures: `41`
- Warnings: `3`

## Result
FAIL

## Failure breakdown
- row_numeric_mismatch: `16`
- commission_row_count_mismatch: `5`
- vehicle_totals_mismatch: `4`
- max_introducers_per_subscription_exceeded: `3`
- commission_row_amount_mismatch: `2`
- commission_totals_mismatch_invested_amount: `2`
- commission_totals_mismatch_spread: `2`
- position_vs_dashboard_ownership: `2`
- position_vs_dashboard_ownership_by_investor: `2`
- commission_row_missing_in_db: `1`
- row_contract_date_mismatch: `1`
- zero_ownership_loaded: `1`

## Warning breakdown
- commission_totals_ruled_diff_spread: `2`
- dashboard_commission_amount_without_name: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_010437/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_010437/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_010437/audit_summary.md`