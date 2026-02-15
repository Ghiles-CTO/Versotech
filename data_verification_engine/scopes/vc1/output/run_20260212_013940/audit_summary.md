# VC1 Audit Summary

- Rules version: `2026-02-12.5`
- Dashboard active rows: `427`
- Dashboard zero rows: `54`
- DB subscriptions: `426`
- DB positions: `353`
- DB introductions: `487`
- DB commissions: `1031`
- Contacts checked rows: `0`
- Failures: `100`
- Warnings: `6`

## Result
FAIL

## Failure breakdown
- row_numeric_mismatch: `34`
- vehicle_totals_mismatch: `16`
- commission_duplicate_exact: `11`
- commission_row_amount_mismatch: `9`
- commission_row_missing_in_db: `6`
- position_vs_dashboard_ownership_by_investor: `6`
- commission_row_missing_in_dashboard: `4`
- commission_totals_mismatch_spread: `4`
- max_introducers_per_subscription_exceeded: `3`
- position_vs_dashboard_ownership: `3`
- commission_totals_mismatch_invested_amount: `2`
- row_contract_date_mismatch: `1`
- row_unmatched_dashboard: `1`

## Warning breakdown
- dashboard_combined_introducer_name: `3`
- row_fallback_match_amounts_date: `1`
- row_fallback_match_amounts_no_date: `1`
- row_fallback_match_investor_shares_date: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_013940/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_013940/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_013940/audit_summary.md`