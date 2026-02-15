# VC1 Audit Summary

- Rules version: `2026-02-11.1`
- Dashboard active rows: `422`
- Dashboard zero rows: `59`
- DB subscriptions: `426`
- DB positions: `353`
- DB introductions: `487`
- DB commissions: `1031`
- Contacts checked rows: `0`
- Failures: `388`
- Warnings: `15`

## Result
FAIL

## Failure breakdown
- commission_row_missing_in_dashboard: `111`
- commission_row_missing_in_db: `105`
- row_contract_date_mismatch: `32`
- position_vs_dashboard_ownership_by_investor: `24`
- row_numeric_mismatch: `23`
- vehicle_totals_mismatch: `18`
- row_unmatched_db: `15`
- commission_duplicate_exact: `11`
- commission_row_amount_mismatch: `11`
- row_unmatched_dashboard: `11`
- commission_totals_mismatch_invested_amount: `9`
- commission_totals_mismatch_spread: `7`
- zero_ownership_loaded: `5`
- max_introducers_per_subscription_exceeded: `3`
- position_vs_dashboard_ownership: `3`

## Warning breakdown
- dashboard_commission_header_check: `10`
- dashboard_combined_introducer_name: `3`
- row_fallback_match_amounts_date: `1`
- row_fallback_match_loose_name_amounts: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_002223/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_002223/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_002223/audit_summary.md`