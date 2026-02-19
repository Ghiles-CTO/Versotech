from __future__ import annotations

from typing import Any


def build_mapping_coverage(failures: list[dict[str, Any]], warnings: list[dict[str, Any]], name_mapping_applied_count: int = 0) -> dict[str, Any]:
    fail_checks = [str(x.get("check") or "") for x in failures]
    warn_checks = [str(x.get("check") or "") for x in warnings]

    unmapped_dashboard_rows = sum(1 for c in fail_checks if c == "row_unmatched_dashboard")
    unmapped_db_rows = sum(1 for c in fail_checks if c == "row_unmatched_db")
    unmapped_comm_dash_to_db = sum(1 for c in fail_checks if c == "commission_row_missing_in_db")
    unmapped_comm_db_to_dash = sum(1 for c in fail_checks if c == "commission_row_missing_in_dashboard")
    unresolved_name_mapping = sum(1 for c in fail_checks if c == "row_mapping_unresolved")

    fallback_match_warnings = sum(1 for c in warn_checks if c.startswith("row_fallback_match"))

    return {
        "unmapped_dashboard_rows": unmapped_dashboard_rows,
        "unmapped_db_rows": unmapped_db_rows,
        "unmapped_commission_rows_dashboard_to_db": unmapped_comm_dash_to_db,
        "unmapped_commission_rows_db_to_dashboard": unmapped_comm_db_to_dash,
        "name_mapping_applied_count": int(name_mapping_applied_count),
        "name_mapping_unresolved_count": int(unresolved_name_mapping),
        "fallback_match_warning_count": int(fallback_match_warnings),
    }

