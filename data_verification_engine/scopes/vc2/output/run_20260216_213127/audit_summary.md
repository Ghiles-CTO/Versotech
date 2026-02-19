# VC2 Audit Summary

- Rules version: `2026-02-14.2`
- Dashboard active rows: `105`
- Dashboard zero rows: `5`
- DB subscriptions: `105`
- DB positions: `94`
- DB introductions: `88`
- DB commissions: `264`
- Contacts checked rows: `123`
- Failures: `31`
- Warnings: `31`

## Result
FAIL

## Failure breakdown
- commission_rate_amount_formula_mismatch: `25`
- commission_base_amount_vs_funded_amount_mismatch: `6`

## Warning breakdown
- commission_row_ruled_removed: `11`
- commission_combined_ruled_removed: `9`
- commission_row_ruled_dashboard_override: `5`
- commission_totals_ruled_diff_invested_amount: `4`
- introducer_warning_only_present: `1`
- introduction_missing_date_ruled: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260216_213127/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260216_213127/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260216_213127/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260216_213127/audit_summary.md`