from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _parse_date_ymd(s: str) -> datetime | None:
    try:
        return datetime.strptime(s.strip(), "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except Exception:
        return None


def evaluate_warning_governance(
    scope_name: str,
    warn_by_check: dict[str, int],
    policy: dict[str, Any],
    now_utc: datetime | None = None,
) -> list[dict[str, str]]:
    now = now_utc or datetime.now(timezone.utc)
    findings: list[dict[str, str]] = []

    threshold_scope = (policy.get("warning_thresholds_by_scope") or {}).get(scope_name, {})
    expiry_scope = (policy.get("warning_expiry_by_scope") or {}).get(scope_name, {})
    owner_scope = (policy.get("warning_owner_by_scope") or {}).get(scope_name, {})
    reason_scope = (policy.get("warning_reason_by_scope") or {}).get(scope_name, {})

    for check, count in sorted((warn_by_check or {}).items()):
        # Threshold
        max_allowed = threshold_scope.get(check)
        if max_allowed is not None:
            try:
                max_allowed_int = int(max_allowed)
                if int(count) > max_allowed_int:
                    findings.append(
                        {
                            "scope": scope_name,
                            "code": "warning_threshold_exceeded",
                            "message": f"{check} count={count} threshold={max_allowed_int}",
                        }
                    )
            except Exception:
                findings.append(
                    {
                        "scope": scope_name,
                        "code": "warning_threshold_invalid",
                        "message": f"{check} threshold={max_allowed!r}",
                    }
                )

        # Expiry
        expiry_raw = expiry_scope.get(check)
        if expiry_raw:
            dt = _parse_date_ymd(str(expiry_raw))
            if not dt:
                findings.append(
                    {
                        "scope": scope_name,
                        "code": "warning_expiry_invalid",
                        "message": f"{check} expiry={expiry_raw!r}",
                    }
                )
            elif now > dt:
                findings.append(
                    {
                        "scope": scope_name,
                        "code": "warning_allowlist_expired",
                        "message": f"{check} expired_on={dt.date().isoformat()}",
                    }
                )

        # Ownership and rationale metadata
        if check not in owner_scope or not str(owner_scope.get(check) or "").strip():
            findings.append(
                {
                    "scope": scope_name,
                    "code": "warning_owner_missing",
                    "message": f"{check} has no owner in policy",
                }
            )
        if check not in reason_scope or not str(reason_scope.get(check) or "").strip():
            findings.append(
                {
                    "scope": scope_name,
                    "code": "warning_reason_missing",
                    "message": f"{check} has no reason in policy",
                }
            )

    return findings

