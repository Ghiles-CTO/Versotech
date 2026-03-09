# Global Audit Summary

- Generated at: `2026-02-27T14:43:48.400185+00:00`
- Run folder: `data_verification_engine/output/global/run_20260227_144334`
- Total fails: `0`
- Total warnings: `187`
- All scopes pass: `true`

| Scope | Fails | Warnings | Run ID | Report |
|---|---:|---:|---|---|
| `vc1` | 0 | 121 | `run_20260227_154341` | `data_verification_engine/scopes/vc1/output/run_20260227_154341/audit_report.json` |
| `vc2` | 0 | 48 | `run_20260227_154345` | `data_verification_engine/scopes/vc2/output/run_20260227_154345/audit_report.json` |
| `in` | 0 | 18 | `run_20260227_154348` | `data_verification_engine/scopes/in/output/run_20260227_154348/audit_report.json` |

## Warning Breakdown

### `vc1`
- `commission_base_amount_vs_funded_amount_ruled`: 4
- `commission_rate_amount_formula_ruled`: 1
- `commission_row_ruled_dashboard_override`: 17
- `commission_totals_ruled_diff_spread`: 4
- `introduction_missing_date_ruled`: 1
- `introduction_tuple_repeat_ruled`: 3
- `orphan_introduction_without_subscription`: 85
- `strikethrough_commission_row_reinstated_ruled`: 6

### `vc2`
- `commission_base_amount_vs_funded_amount_ruled`: 2
- `commission_combined_ruled_removed`: 9
- `commission_rate_amount_formula_ruled`: 8
- `commission_row_ruled_dashboard_override`: 5
- `commission_row_ruled_removed`: 11
- `commission_totals_ruled_diff_invested_amount`: 4
- `introducer_warning_only_present`: 1
- `introduction_missing_date_ruled`: 1
- `orphan_introduction_without_subscription`: 7

### `in`
- `commission_row_ruled_dashboard_override`: 4
- `commission_totals_ruled_diff_invested_amount`: 2
- `commission_totals_ruled_diff_spread`: 1
- `dashboard_formula_error_token`: 6
- `orphan_introduction_without_subscription`: 5
