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


def as_number(value) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
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
            "investor_id",
            "vehicle_id",
            "commitment",
            "funded_amount",
            "num_shares",
            "contract_date",
            "price_per_share",
            "cost_per_share",
            "subscription_fee_percent",
            "subscription_fee_amount",
            "performance_fee_tier1_percent",
            "performance_fee_tier1_threshold",
            "performance_fee_tier2_percent",
            "performance_fee_tier2_threshold",
            "spread_per_share",
            "spread_fee_amount",
            "management_fee_percent",
            "bd_fee_percent",
            "bd_fee_amount",
            "finra_shares",
            "finra_fee_amount",
            "discount_rate",
            "interest_rate",
            "valuation_cap",
            "opportunity_name",
            "sourcing_contract_ref",
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

    # Build position lookup: (investor_id, vehicle_id) -> units
    vehicle_records = fetch_all(base, "vehicles", "id,entity_code")
    vehicle_id_by_code: dict[str, str] = {}
    for row in vehicle_records:
        code = row.get("entity_code")
        if code in codes:
            vehicle_id_by_code[code] = row.get("id")

    position_rows: list[dict] = []
    vehicle_ids = [vid for vid in vehicle_id_by_code.values() if vid]
    if vehicle_ids:
        for i in range(0, len(vehicle_ids), 100):
            batch = vehicle_ids[i : i + 100]
            params = {
                "select": "investor_id,vehicle_id,units",
                "vehicle_id": f"in.({','.join(batch)})",
                "limit": 10000,
            }
            url = f"{base['url']}/rest/v1/positions?{urlencode(params)}"
            req = Request(
                url,
                headers={
                    "apikey": base["key"],
                    "Authorization": f"Bearer {base['key']}",
                    "Accept": "application/json",
                },
            )
            with urlopen(req) as resp:
                position_rows.extend(json.loads(resp.read().decode("utf-8")))

    position_map: dict[tuple[str, str], float] = {}
    for row in position_rows:
        investor_id = row.get("investor_id")
        vehicle_id = row.get("vehicle_id")
        units = row.get("units")
        if investor_id and vehicle_id and units is not None:
            key = (investor_id, vehicle_id)
            position_map[key] = position_map.get(key, 0.0) + float(units)

    subscription_rows: list[dict] = []
    for row in subscriptions:
        vehicle = row.get("vehicle") or {}
        entity_code = vehicle.get("entity_code")
        if not entity_code or entity_code not in codes:
            continue
        investor = row.get("investor") or {}
        investor_name = investor.get("legal_name") or investor.get("display_name")
        investor_id = row.get("investor_id")
        vehicle_id = row.get("vehicle_id")
        current_position = None
        if investor_id and vehicle_id:
            units = position_map.get((investor_id, vehicle_id))
            if units is not None:
                current_position = float(units)
        subscription_rows.append(
            {
                "Entity Code": entity_code,
                "Investor Name": investor_name,
                "Investor Type": investor.get("type"),
                "Commitment": as_number(row.get("commitment")),
                "Funded Amount": as_number(row.get("funded_amount")),
                "Shares": as_number(row.get("num_shares")),
                "Current Position": current_position,
                "Price Per Share": as_number(row.get("price_per_share")),
                "Cost Per Share": as_number(row.get("cost_per_share")),
                "Subscription Fee (%)": as_number(row.get("subscription_fee_percent")),
                "Subscription Fee Amount": as_number(row.get("subscription_fee_amount")),
                "Performance Fee Tier 1 (%)": as_number(row.get("performance_fee_tier1_percent")),
                "Performance Fee Tier 1 Threshold": as_number(row.get("performance_fee_tier1_threshold")),
                "Performance Fee Tier 2 (%)": as_number(row.get("performance_fee_tier2_percent")),
                "Performance Fee Tier 2 Threshold": as_number(row.get("performance_fee_tier2_threshold")),
                "Spread Per Share": as_number(row.get("spread_per_share")),
                "Spread Fee Amount": as_number(row.get("spread_fee_amount")),
                "Management Fee (%)": as_number(row.get("management_fee_percent")),
                "BD Fee (%)": as_number(row.get("bd_fee_percent")),
                "BD Fee Amount": as_number(row.get("bd_fee_amount")),
                "FINRA Fee Shares": as_number(row.get("finra_shares")),
                "FINRA Fee Amount": as_number(row.get("finra_fee_amount")),
                "Discount Rate": as_number(row.get("discount_rate")),
                "Interest Rate": as_number(row.get("interest_rate")),
                "Valuation Cap": as_number(row.get("valuation_cap")),
                "Opportunity Name": row.get("opportunity_name"),
                "Sourcing Contract Ref": row.get("sourcing_contract_ref"),
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
