# Global Audit Summary

- Generated at: `2026-02-16T21:22:36.667983+00:00`
- Run folder: `data_verification_engine/output/global/run_20260216_212221`
- Total fails: `0`
- Total warnings: `95`
- All scopes pass: `true`

| Scope | Fails | Warnings | Run ID | Report |
|---|---:|---:|---|---|
| `vc1` | 0 | 37 | `run_20260216_222228` | `data_verification_engine/scopes/vc1/output/run_20260216_222228/audit_report.json` |
| `vc2` | 0 | 45 | `run_20260216_222233` | `data_verification_engine/scopes/vc2/output/run_20260216_222233/audit_report.json` |
| `in` | 0 | 13 | `run_20260216_222236` | `data_verification_engine/scopes/in/output/run_20260216_222236/audit_report.json` |

## Warning Breakdown

### `vc1`
- `commission_base_amount_vs_funded_amount_ruled`: 4
- `commission_rate_amount_formula_ruled`: 1
- `commission_row_ruled_dashboard_override`: 17
- `commission_totals_ruled_diff_spread`: 4
- `introduction_missing_date_ruled`: 1
- `introduction_tuple_repeat_ruled`: 3
- `performance_fee_threshold_multiplier_non_zero_ruled`: 1
- `strikethrough_commission_row_reinstated_ruled`: 6

### `vc2`
- `commission_base_amount_vs_funded_amount_ruled`: 6
- `commission_combined_ruled_removed`: 9
- `commission_rate_amount_formula_ruled`: 8
- `commission_row_ruled_dashboard_override`: 5
- `commission_row_ruled_removed`: 11
- `commission_totals_ruled_diff_invested_amount`: 4
- `introducer_warning_only_present`: 1
- `introduction_missing_date_ruled`: 1

### `in`
- `commission_row_ruled_dashboard_override`: 4
- `commission_totals_ruled_diff_invested_amount`: 2
- `commission_totals_ruled_diff_spread`: 1
- `dashboard_formula_error_token`: 6
