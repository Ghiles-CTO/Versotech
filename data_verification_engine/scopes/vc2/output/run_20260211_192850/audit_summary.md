# VC2 Audit Summary

- Rules version: `2026-02-11.2`
- Dashboard active rows: `105`
- Dashboard zero rows: `5`
- DB subscriptions: `105`
- DB positions: `94`
- DB introductions: `88`
- DB commissions: `264`
- Contacts checked rows: `123`
- Failures: `164`
- Warnings: `6`

## Result
FAIL

## Failure breakdown
- commission_row_missing_in_db: `71`
- commission_row_missing_in_dashboard: `65`
- row_numeric_mismatch: `21`
- vehicle_totals_mismatch: `3`
- row_unmatched_dashboard: `2`
- row_unmatched_db: `2`

## Warning breakdown
- commission_totals_ruled_diff_invested_amount: `4`
- commission_row_warning_only_present: `1`
- introducer_warning_only_present: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260211_192850/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260211_192850/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260211_192850/audit_summary.md`