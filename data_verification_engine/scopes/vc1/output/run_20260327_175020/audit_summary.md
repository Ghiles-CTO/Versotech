# VC1 Audit Summary

- Rules version: `2026-02-14.3`
- Dashboard active rows: `466`
- Dashboard zero rows: `56`
- DB subscriptions: `466`
- DB positions: `385`
- DB introductions: `479`
- DB commissions: `1000`
- Strikethrough source rows: `29`
- Strikethrough rows still in DB: `6`
- Contacts checked rows: `0`
- Failures: `2`
- Warnings: `121`

## Result
FAIL

## Failure breakdown
- investor_identity_duplicate_global_refs: `2`

## Warning breakdown
- orphan_introduction_without_subscription: `85`
- commission_row_ruled_dashboard_override: `17`
- strikethrough_commission_row_reinstated_ruled: `6`
- commission_base_amount_vs_funded_amount_ruled: `4`
- commission_totals_ruled_diff_spread: `4`
- introduction_tuple_repeat_ruled: `3`
- commission_rate_amount_formula_ruled: `1`
- introduction_missing_date_ruled: `1`

## Artifacts
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260327_175020/audit_report.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260327_175020/audit_issues.csv`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260327_175020/mapping_coverage.json`
- `/Users/ghilesmoussaoui/Desktop/Versotech/data_verification_engine/scopes/vc1/output/run_20260327_175020/audit_summary.md`