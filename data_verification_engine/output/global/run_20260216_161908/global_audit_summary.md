# Global Audit Summary

- Generated at: `2026-02-16T16:19:23.447830+00:00`
- Run folder: `data_verification_engine/output/global/run_20260216_161908`
- Total fails: `0`
- Total warnings: `52`
- All scopes pass: `true`

| Scope | Fails | Warnings | Run ID | Report |
|---|---:|---:|---|---|
| `vc1` | 0 | 14 | `run_20260216_171915` | `data_verification_engine/scopes/vc1/output/run_20260216_171915/audit_report.json` |
| `vc2` | 0 | 31 | `run_20260216_171920` | `data_verification_engine/scopes/vc2/output/run_20260216_171920/audit_report.json` |
| `in` | 0 | 7 | `run_20260216_171923` | `data_verification_engine/scopes/in/output/run_20260216_171923/audit_report.json` |

## Warning Breakdown

### `vc1`
- `commission_totals_ruled_diff_spread`: 3
- `introduction_missing_date_ruled`: 1
- `introduction_tuple_repeat_ruled`: 3
- `performance_fee_threshold_multiplier_non_zero_ruled`: 1
- `strikethrough_commission_row_reinstated_ruled`: 6

### `vc2`
- `commission_combined_ruled_removed`: 9
- `commission_row_ruled_dashboard_override`: 5
- `commission_row_ruled_removed`: 11
- `commission_totals_ruled_diff_invested_amount`: 4
- `introducer_warning_only_present`: 1
- `introduction_missing_date_ruled`: 1

### `in`
- `commission_row_ruled_dashboard_override`: 4
- `commission_totals_ruled_diff_invested_amount`: 2
- `commission_totals_ruled_diff_spread`: 1
