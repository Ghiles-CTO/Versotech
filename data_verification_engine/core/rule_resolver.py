from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


RULE_DATE_RE = re.compile(r"(20\d{2}-\d{2}-\d{2}|20\d{6})")


@dataclass
class RuleSource:
    path: Path
    date: str | None


def _extract_date_from_name(name: str) -> str | None:
    m = RULE_DATE_RE.search(name)
    if not m:
        return None
    raw = m.group(1)
    if "-" in raw:
        return raw
    # YYYYMMDD -> YYYY-MM-DD
    return f"{raw[0:4]}-{raw[4:6]}-{raw[6:8]}"


def _scan_sources(base_dir: Path) -> list[RuleSource]:
    source_roots = [
        base_dir / "data_verification_engine",
        base_dir / "verso_capital_2_data",
        base_dir / "dashboardreconciliations",
        base_dir / "datamigration",
        base_dir / "VERSO" / "datafixing",
    ]
    out: list[RuleSource] = []
    for root in source_roots:
        if not root.exists():
            continue
        for p in root.rglob("*.md"):
            out.append(RuleSource(path=p, date=_extract_date_from_name(p.name)))
    # Deterministic order: newest dated docs first, then by path.
    out.sort(key=lambda x: (x.date or "0000-00-00", str(x.path)), reverse=True)
    return out


def resolve_rule_registry(base_dir: Path) -> dict[str, Any]:
    coverage_candidates = sorted(
        (base_dir / "data_verification_engine").glob("ENGINE_RULE_COVERAGE_MATRIX_*.csv")
    )
    if not coverage_candidates:
        raise FileNotFoundError("No ENGINE_RULE_COVERAGE_MATRIX_*.csv found in data_verification_engine/")
    coverage_csv = coverage_candidates[-1]
    rows = list(csv.DictReader(coverage_csv.open(encoding="utf-8")))

    sources = _scan_sources(base_dir)
    latest_source = str(sources[0].path) if sources else ""
    latest_source_date = sources[0].date if sources else None

    by_id: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        rid = str(row.get("rule_id") or "").strip()
        if not rid:
            continue
        by_id.setdefault(rid, []).append(row)

    conflicts: list[dict[str, Any]] = []
    active_rules: list[dict[str, Any]] = []
    for rid, items in sorted(by_id.items()):
        descriptions = {str(x.get("rule_description") or "").strip() for x in items}
        scopes = sorted({str(x.get("scope") or "").strip() for x in items if str(x.get("scope") or "").strip()})
        statuses = {str(x.get("engine_status") or "").strip() for x in items}
        if len(descriptions) > 1:
            conflicts.append(
                {
                    "rule_id": rid,
                    "reason": "multiple_descriptions",
                    "descriptions": sorted(descriptions),
                }
            )
        active_rules.append(
            {
                "rule_id": rid,
                "scope": "/".join(scopes) if scopes else "",
                "description": sorted(descriptions)[0] if descriptions else "",
                "effective_version_date": latest_source_date,
                "source_file": latest_source,
                "supersedes": [],
                "status": "active",
                "engine_status": sorted(statuses)[0] if statuses else "",
            }
        )

    return {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "coverage_matrix_file": str(coverage_csv),
        "source_order": [
            "data_verification_engine (latest dated checkpoints first)",
            "verso_capital_2_data (latest dated docs first)",
            "dashboardreconciliations (latest dated docs first)",
            "datamigration (latest dated docs first)",
            "VERSO/datafixing (latest dated docs first)",
        ],
        "sources_scanned_count": len(sources),
        "conflicts": conflicts,
        "rules": active_rules,
    }


def write_rule_registry(base_dir: Path) -> Path:
    payload = resolve_rule_registry(base_dir)
    out_dir = base_dir / "data_verification_engine" / "rule_registry"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / "rule_registry_resolved.json"
    out.write_text(json.dumps(payload, indent=2))
    return out
