# VC1 Audit Summary

- Rules version: `2026-02-12.3`
- Dashboard active rows: `422`
- Dashboard zero rows: `59`
- DB subscriptions: `426`
- DB positions: `353`
- DB introductions: `487`
- DB commissions: `1031`
- Contacts checked rows: `0`
- Failures: `142`
- Warnings: `8`

## Result
FAIL

## Failure breakdown
- row_contract_date_mismatch: `33`
- row_numeric_mismatch: `26`
- vehicle_totals_mismatch: `18`
- commission_duplicate_exact: `11`
- commission_row_amount_mismatch: `9`
- position_vs_dashboard_ownership_by_investor: `8`
- row_unmatched_db: `7`
- commission_row_missing_in_db: `6`
- zero_ownership_loaded: `5`
- commission_row_missing_in_dashboard: `4`
- commission_totals_mismatch_spread: `4`
- max_introducers_per_subscription_exceeded: `3`
- position_vs_dashboard_ownership: `3`
- row_unmatched_dashboard: `3`
- commission_totals_mismatch_invested_amount: `2`

## Warning breakdown
- dashboard_commission_header_check: `4`
- dashboard_combined_introducer_name: `3`
- row_fallback_match_amounts_date: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_005101/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_005101/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_005101/audit_summary.md`