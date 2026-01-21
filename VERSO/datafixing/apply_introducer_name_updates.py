#!/usr/bin/env python3
"""
Apply introducer name updates from CSV via Supabase REST.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


ENV_PATH = Path(".env.local")
CSV_PATH = Path("VERSO/datafixing/introducers name change.csv")


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith("```"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"')
    return env


def valid_full_name(value: str | None) -> bool:
    if not value:
        return False
    lowered = value.strip().lower()
    if not lowered:
        return False
    return lowered not in {"add full legal name / last name", "add full legal name"}


def build_or_filter(current: str, full: str) -> str:
    conditions = [
        f"display_name.ilike.{quote(current)}",
        f"legal_name.ilike.{quote(current)}",
        f"display_name.ilike.{quote(full)}",
        f"legal_name.ilike.{quote(full)}",
    ]
    return f"or=({','.join(conditions)})"


def patch(base_url: str, api_key: str, table: str, query: str, data: dict) -> list[dict]:
    url = f"{base_url}/rest/v1/{table}?{query}"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    req = Request(url, method="PATCH", headers=headers, data=json.dumps(data).encode("utf-8"))
    with urlopen(req) as resp:
        payload = resp.read().decode("utf-8")
    return json.loads(payload) if payload else []


def main() -> None:
    env = load_env(ENV_PATH)
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing Supabase URL/service key in .env.local")

    base_url = supabase_url.rstrip("/")

    updated = 0
    skipped = 0
    missing = []

    with CSV_PATH.open(newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            current = (row.get("Current Name") or "").strip()
            full = (row.get("Full Name") or "").strip()
            if not current or not valid_full_name(full):
                skipped += 1
                continue

            payload = {
                "display_name": full,
                "legal_name": full,
            }
            email = (row.get("Email") or "").strip()
            contact = (row.get("Contact") or "").strip()
            if email:
                payload["email"] = email
            if contact:
                payload["contact_name"] = contact

            query = build_or_filter(current, full)
            rows = patch(base_url, supabase_key, "introducers", query, payload)
            if not rows:
                missing.append(current)
                continue
            updated += len(rows)
            print(f"Updated {current} -> {full} ({len(rows)} rows)")

    print(f"Total rows updated: {updated}")
    print(f"Skipped rows: {skipped}")
    if missing:
        print("No match for:", ", ".join(sorted(set(missing))))


if __name__ == "__main__":
    main()
