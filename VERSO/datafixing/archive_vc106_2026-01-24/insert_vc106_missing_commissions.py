#!/usr/bin/env python3
"""Insert VC106 missing commissions via Supabase REST API in batches."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd

ENV_PATH = Path(".env.local")
MISSING_COMM_PATH = Path("VERSO/datafixing/vc106_missing_commissions.csv")
DEAL_ID = "07eff085-9f1d-4e02-b1e2-d717817503f1"


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


def fetch_all(base: dict[str, str], table: str, select: str, filters: dict[str, str] | None = None) -> list[dict]:
    headers = {
        "apikey": base["key"],
        "Authorization": f"Bearer {base['key']}",
        "Accept": "application/json",
    }
    results: list[dict] = []
    offset = 0
    page_size = 1000
    while True:
        params = {
            "select": select,
            "order": "id",
            "limit": page_size,
            "offset": offset,
        }
        if filters:
            params.update(filters)
        url = f"{base['url']}/rest/v1/{table}?{urlencode(params)}"
        req = Request(url, headers=headers)
        with urlopen(req) as resp:
            data = resp.read().decode("utf-8")
        rows = pd.read_json(data)
        if rows.empty:
            break
        results.extend(rows.to_dict(orient="records"))
        if len(rows) < page_size:
            break
        offset += page_size
    return results


def main() -> None:
    env = load_env(ENV_PATH)
    supabase_url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL") or "").rstrip("/")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing Supabase URL/service key in .env.local")
    base = {"url": supabase_url, "key": supabase_key}

    if not MISSING_COMM_PATH.exists():
        raise SystemExit(f"Missing {MISSING_COMM_PATH}")

    df = pd.read_csv(MISSING_COMM_PATH)

    introductions = fetch_all(
        base,
        "introductions",
        "id,introducer_id,deal_id,prospect_investor_id",
        {"deal_id": f"eq.{DEAL_ID}"},
    )
    intro_map = {
        (row["introducer_id"], row["prospect_investor_id"]): row["id"] for row in introductions
    }

    records: list[dict] = []
    missing_intro = 0
    for _, row in df.iterrows():
        introducer_id = row["introducer_id"]
        investor_id = row["investor_id"]
        introduction_id = intro_map.get((introducer_id, investor_id))
        if not introduction_id:
            missing_intro += 1
        perf_type = row["performance_threshold_type"]
        perf_type = None if pd.isna(perf_type) or perf_type == "" else perf_type
        threshold = row["threshold_multiplier"]
        threshold = None if pd.isna(threshold) or threshold == "" else float(threshold)
        accrual = row["accrual_amount"]
        accrual = None if pd.isna(accrual) or accrual == "" else float(accrual)
        records.append(
            {
                "introducer_id": introducer_id,
                "deal_id": row["deal_id"],
                "investor_id": investor_id,
                "basis_type": row["basis_type"],
                "rate_bps": int(row["rate_bps"]),
                "accrual_amount": accrual,
                "threshold_multiplier": threshold,
                "performance_threshold_type": perf_type,
                "currency": "USD",
                "status": "accrued",
                "introduction_id": introduction_id,
            }
        )

    if missing_intro:
        print(f"Warning: {missing_intro} rows missing introduction_id")

    headers = {
        "apikey": base["key"],
        "Authorization": f"Bearer {base['key']}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    batch_size = 100
    total = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        url = f"{base['url']}/rest/v1/introducer_commissions"
        payload = json.dumps(batch).encode("utf-8")
        req = Request(url, data=payload, headers=headers, method="POST")
        with urlopen(req) as resp:
            resp.read()
        total += len(batch)
        print(f"Inserted {total}/{len(records)}")


if __name__ == "__main__":
    main()
