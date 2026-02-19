# VC1 Audit Summary

- Rules version: `2026-02-14.3`
- Dashboard active rows: `466`
- Dashboard zero rows: `56`
- DB subscriptions: `464`
- DB positions: `383`
- DB introductions: `498`
- DB commissions: `1029`
- Strikethrough source rows: `29`
- Strikethrough rows still in DB: `6`
- Contacts checked rows: `0`
- Failures: `62`
- Warnings: `14`

## Result
FAIL

## Failure breakdown
- commission_row_missing_in_db: `13`
- vehicle_totals_mismatch: `12`
- commission_row_amount_mismatch: `5`
- row_numeric_mismatch: `5`
- subscription_bd_fee_amount_equals_percent_bug: `4`
- subscription_bd_fee_formula_mismatch: `4`
- commission_row_missing_in_dashboard: `3`
- position_vs_dashboard_ownership: `3`
- position_vs_dashboard_ownership_by_investor: `3`
- row_unmatched_dashboard: `2`
- commission_totals_mismatch_invested_amount: `1`
- commission_totals_mismatch_spread: `1`
- investor_identity_duplicate: `1`
- investor_identity_duplicate_individual_loose: `1`
- name_mapping_unresolved_total: `1`
- position_row_missing_in_db: `1`
- row_contract_date_mismatch: `1`
- row_mapping_unresolved: `1`

## Warning breakdown
- strikethrough_commission_row_reinstated_ruled: `6`
- commission_totals_ruled_diff_spread: `3`
- introduction_tuple_repeat_ruled: `3`
- introduction_missing_date_ruled: `1`
- performance_fee_threshold_multiplier_non_zero_ruled: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_164910/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_164910/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_164910/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260216_164910/audit_summary.md`