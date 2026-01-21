#!/usr/bin/env python3
"""
Export Supabase data for commission and subscription reports.

Outputs:
- datamigration/commission_data_export.json
- /tmp/subscription_data.json
"""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ENV_PATH = Path(".env.local")
COMMISSION_OUT = Path("datamigration/commission_data_export.json")
SUBSCRIPTION_OUT = Path("/tmp/subscription_data.json")


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
        key = key.strip()
        value = value.strip().strip('"')
        env[key] = value
    return env


def fetch_all(base: dict[str, str], table: str, select: str, page_size: int = 1000) -> list[dict]:
    headers = {
        "apikey": base["key"],
        "Authorization": f"Bearer {base['key']}",
        "Accept": "application/json",
    }
    results: list[dict] = []
    offset = 0
    while True:
        params = {
            "select": select,
            "order": "id",
            "limit": page_size,
            "offset": offset,
        }
        url = f"{base['url']}/rest/v1/{table}?{urlencode(params)}"
        req = Request(url, headers=headers)
        try:
            with urlopen(req) as resp:
                payload = resp.read()
        except Exception as exc:
            if hasattr(exc, "read"):
                error_body = exc.read().decode("utf-8", errors="ignore")
                raise RuntimeError(f"Request failed: {url}\n{error_body}") from exc
            raise
        data = json.loads(payload.decode("utf-8"))
        if not data:
            break
        results.extend(data)
        if len(data) < page_size:
            break
        offset += page_size
    return results


def format_amount(value) -> str | None:
    if value is None:
        return None
    try:
        return f"{float(value):.2f}"
    except (TypeError, ValueError):
        return None


def main() -> None:
    env = load_env(ENV_PATH)
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing Supabase URL/service key in .env.local")

    base = {"url": supabase_url.rstrip("/"), "key": supabase_key}

    commission_select = ",".join(
        [
            "id",
            "basis_type",
            "rate_bps",
            "accrual_amount",
            "currency",
            "introducer:introducers(display_name,legal_name)",
            "investor:investors(display_name,legal_name)",
            "deal:deals(vehicle:vehicles(entity_code))",
        ]
    )
    subscription_select = ",".join(
        [
            "id",
            "commitment",
            "funded_amount",
            "num_shares",
            "contract_date",
            "investor:investors(display_name,legal_name,type)",
            "vehicle:vehicles(entity_code)",
        ]
    )

    print("Fetching subscriptions...")
    subscriptions = fetch_all(base, "subscriptions", subscription_select)
    codes = {
        row.get("vehicle", {}).get("entity_code")
        for row in subscriptions
        if row.get("vehicle", {}).get("entity_code")
    }

    print("Fetching introducer commissions...")
    commissions = fetch_all(base, "introducer_commissions", commission_select)

    subscription_rows: list[dict] = []
    for row in subscriptions:
        vehicle = row.get("vehicle") or {}
        entity_code = vehicle.get("entity_code")
        if not entity_code or entity_code not in codes:
            continue
        investor = row.get("investor") or {}
        investor_name = investor.get("legal_name") or investor.get("display_name")
        subscription_rows.append(
            {
                "Entity Code": entity_code,
                "Investor Name": investor_name,
                "Investor Type": investor.get("type"),
                "Commitment": format_amount(row.get("commitment")),
                "Funded Amount": format_amount(row.get("funded_amount")),
                "Shares": format_amount(row.get("num_shares")),
                "Contract Date": row.get("contract_date"),
            }
        )

    commission_rows: list[dict] = []
    for row in commissions:
        deal = row.get("deal") or {}
        vehicle = deal.get("vehicle") or {}
        entity_code = vehicle.get("entity_code")
        if not entity_code or entity_code not in codes:
            continue
        introducer = row.get("introducer") or {}
        investor = row.get("investor") or {}
        introducer_name = introducer.get("display_name") or introducer.get("legal_name")
        investor_name = investor.get("legal_name") or investor.get("display_name")
        rate_bps = row.get("rate_bps")
        rate_pct = None
        if rate_bps is not None:
            try:
                rate_pct = f"{float(rate_bps) / 100:.2f}"
            except (TypeError, ValueError):
                rate_pct = None
        commission_rows.append(
            {
                "entity_code": entity_code,
                "introducer": introducer_name,
                "investor": investor_name,
                "fee_type": row.get("basis_type"),
                "rate_bps": rate_bps,
                "rate_pct": rate_pct,
                "commission_amount": format_amount(row.get("accrual_amount")),
                "currency": row.get("currency"),
            }
        )

    COMMISSION_OUT.write_text(json.dumps(commission_rows, ensure_ascii=True))
    SUBSCRIPTION_OUT.write_text(json.dumps(subscription_rows, ensure_ascii=True))

    print(f"Wrote {COMMISSION_OUT}")
    print(f"Wrote {SUBSCRIPTION_OUT}")
    print(f"Subscription records: {len(subscription_rows)}")
    print(f"Commission records: {len(commission_rows)}")


if __name__ == "__main__":
    main()
