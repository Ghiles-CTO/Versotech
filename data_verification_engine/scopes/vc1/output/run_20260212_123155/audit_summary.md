# VC1 Audit Summary

- Rules version: `2026-02-12.6`
- Dashboard active rows: `426`
- Dashboard zero rows: `55`
- DB subscriptions: `426`
- DB positions: `353`
- DB introductions: `487`
- DB commissions: `1031`
- Contacts checked rows: `0`
- Failures: `97`
- Warnings: `3`

## Result
FAIL

## Failure breakdown
- row_numeric_mismatch: `34`
- subscription_missing_deal_id: `12`
- commission_duplicate_exact: `11`
- commission_row_amount_mismatch: `9`
- vehicle_totals_mismatch: `7`
- commission_row_missing_in_db: `6`
- commission_totals_mismatch_spread: `4`
- commission_row_missing_in_dashboard: `3`
- max_introducers_per_subscription_exceeded: `3`
- commission_totals_mismatch_invested_amount: `2`
- position_vs_dashboard_ownership: `2`
- position_vs_dashboard_ownership_by_investor: `2`
- row_contract_date_mismatch: `1`
- zero_ownership_loaded: `1`

## Warning breakdown
- row_fallback_match_amounts_date: `1`
- row_fallback_match_amounts_no_date: `1`
- row_fallback_match_investor_shares_date: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_123155/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_123155/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260212_123155/audit_summary.md`