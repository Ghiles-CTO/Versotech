# VC2 Audit Summary

- Rules version: `2026-02-14.2`
- Dashboard active rows: `105`
- Dashboard zero rows: `5`
- DB subscriptions: `105`
- DB positions: `94`
- DB introductions: `88`
- DB commissions: `264`
- Contacts checked rows: `123`
- Failures: `0`
- Warnings: `31`

## Result
PASS (no hard failures)

## Warning breakdown
- commission_row_ruled_removed: `11`
- commission_combined_ruled_removed: `9`
- commission_row_ruled_dashboard_override: `5`
- commission_totals_ruled_diff_invested_amount: `4`
- introducer_warning_only_present: `1`
- introduction_missing_date_ruled: `1`

## Artifacts
- `scopes/vc2/output/run_20260215_133820/audit_report.json`
- `scopes/vc2/output/run_20260215_133820/audit_issues.csv`
- `scopes/vc2/output/run_20260215_133820/mapping_coverage.json`
- `scopes/vc2/output/run_20260215_133820/audit_summary.md`