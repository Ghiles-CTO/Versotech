# VC1 Audit Summary

- Rules version: `2026-02-12.6`
- Dashboard active rows: `426`
- Dashboard zero rows: `55`
- DB subscriptions: `426`
- DB positions: `352`
- DB introductions: `487`
- DB commissions: `1020`
- Contacts checked rows: `0`
- Failures: `67`
- Warnings: `1`

## Result
FAIL

## Failure breakdown
- row_numeric_mismatch: `16`
- commission_row_count_mismatch: `12`
- commission_row_amount_mismatch: `10`
- commission_row_missing_in_db: `6`
- commission_totals_mismatch_spread: `4`
- vehicle_totals_mismatch: `4`
- commission_row_missing_in_dashboard: `3`
- commission_totals_mismatch_invested_amount: `3`
- max_introducers_per_subscription_exceeded: `3`
- position_vs_dashboard_ownership: `2`
- position_vs_dashboard_ownership_by_investor: `2`
- row_contract_date_mismatch: `1`
- zero_ownership_loaded: `1`

## Warning breakdown
- dashboard_commission_amount_without_name: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_003006/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_003006/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260213_003006/audit_summary.md`