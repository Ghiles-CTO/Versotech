# VC2 Audit Summary

- Rules version: `2026-02-11.2`
- Dashboard active rows: `105`
- Dashboard zero rows: `5`
- DB subscriptions: `105`
- DB positions: `94`
- DB introductions: `88`
- DB commissions: `264`
- Contacts checked rows: `123`
- Failures: `25`
- Warnings: `4`

## Result
FAIL

## Failure breakdown
- row_numeric_mismatch: `21`
- vehicle_totals_mismatch: `3`
- commission_totals_mismatch_invested_amount: `1`

## Warning breakdown
- commission_totals_ruled_diff_invested_amount: `3`
- introducer_warning_only_present: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260211_190919/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260211_190919/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc2/output/run_20260211_190919/audit_summary.md`