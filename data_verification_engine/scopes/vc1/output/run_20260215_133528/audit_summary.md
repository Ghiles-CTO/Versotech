# VC1 Audit Summary

- Rules version: `2026-02-14.3`
- Dashboard active rows: `426`
- Dashboard zero rows: `55`
- DB subscriptions: `426`
- DB positions: `352`
- DB introductions: `485`
- DB commissions: `1013`
- Contacts checked rows: `0`
- Failures: `5`
- Warnings: `3`

## Result
FAIL

## Failure breakdown
- introduction_duplicate_tuple: `3`
- introduction_missing_date: `1`
- performance_fee_threshold_multiplier_non_zero: `1`

## Warning breakdown
- commission_totals_ruled_diff_spread: `3`

## Artifacts
- `scopes/vc1/output/run_20260215_133528/audit_report.json`
- `scopes/vc1/output/run_20260215_133528/audit_issues.csv`
- `scopes/vc1/output/run_20260215_133528/mapping_coverage.json`
- `scopes/vc1/output/run_20260215_133528/audit_summary.md`