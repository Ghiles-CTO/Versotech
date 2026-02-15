# Trust Pack Report

- Generated at: `2026-02-14T20:14:41.501832+00:00`
- Global report: `data_verification_engine/output/global/run_20260214_201426/global_audit_report.json`
- Status: `FAIL`
- Findings: `3`

| Scope | Fail | Warn | CSV Rows | Verdict |
|---|---:|---:|---:|---|
| `vc1` | 0 | 3 | 3 | `PASS` |
| `vc2` | 0 | 30 | 30 | `FAIL` |
| `in` | 0 | 7 | 7 | `FAIL` |

## Findings

- `vc2` `unexpected_warning_check`: commission_combined_ruled_removed (count=9) not in allow-list
- `vc2` `unexpected_warning_check`: commission_row_ruled_dashboard_override (count=5) not in allow-list
- `in` `unexpected_warning_check`: commission_row_ruled_dashboard_override (count=4) not in allow-list