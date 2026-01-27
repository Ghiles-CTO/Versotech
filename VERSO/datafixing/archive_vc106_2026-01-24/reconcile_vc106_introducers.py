#!/usr/bin/env python3
"""Reconcile VC106 (VC6 sheet) partner/introducer rows vs DB introductions/commissions.
Writes CSVs + summary report. No DB writes.
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd

DASHBOARD_PATH = Path("datamigration/VERSO DASHBOARD_V1.0.xlsx")
SHEET_NAME = "VC6"
NAME_MAP_PATH = Path("VERSO/datafixing/introducers name change.csv")
ENV_PATH = Path(".env.local")

OUT_INTRO_ROWS = Path("VERSO/datafixing/vc106_intro_rows.csv")
OUT_INTRO_RECON = Path("VERSO/datafixing/vc106_intro_reconciliation.csv")
OUT_COMM_RECON = Path("VERSO/datafixing/vc106_commission_reconciliation.csv")
OUT_UNMATCHED_CANDIDATES = Path("VERSO/datafixing/vc106_unmatched_investor_candidates.csv")
OUT_DUP_COMM = Path("VERSO/datafixing/vc106_commission_duplicates_analysis.csv")
OUT_REPORT = Path("VERSO/datafixing/vc106_reconciliation_report.md")


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
            data = json.loads(resp.read().decode("utf-8"))
        if not data:
            break
        results.extend(data)
        if len(data) < page_size:
            break
        offset += page_size
    return results


def _clean_name(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)) and value == 0:
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none", "0", "0.0"}:
        return None
    return re.sub(r"\s+", " ", text)


def _to_numeric(value: object) -> float | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError:
        return None


def _to_date(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)):
        return None
    if isinstance(value, pd.Timestamp):
        return value.date().isoformat()
    try:
        parsed = pd.to_datetime(value, errors="coerce", dayfirst=True)
    except Exception:
        return None
    if pd.isna(parsed):
        return None
    return parsed.date().isoformat()


def _normalize(text: str | None) -> str | None:
    if not text:
        return None
    normalized = unicodedata.normalize("NFKD", text)
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = normalized.lower()
    normalized = re.sub(r"[^a-z0-9]+", "", normalized)
    return normalized or None


def _build_lookup(records: list[dict], name_fields: list[str]) -> dict[str, list[dict]]:
    lookup: dict[str, list[dict]] = defaultdict(list)
    for record in records:
        for field in name_fields:
            value = record.get(field)
            if not value:
                continue
            key = _normalize(str(value))
            if key:
                lookup[key].append(record)
            if "," in str(value):
                parts = [p.strip() for p in str(value).split(",")]
                if len(parts) >= 2:
                    swapped = f"{parts[1]} {parts[0]}"
                    swap_key = _normalize(swapped)
                    if swap_key:
                        lookup[swap_key].append(record)
    return lookup


def _name_keys(first: str | None, last: str | None, entity: str | None) -> set[str]:
    keys: set[str] = set()
    if entity:
        key = _normalize(entity)
        if key:
            keys.add(key)
    if first or last:
        if first and last:
            base_variants = {f"{first} {last}", f"{last} {first}"}
            # Handle compound first names like "Heinz & Barbara"
            parts = _split_compound_name(first)
            if len(parts) >= 2:
                base_variants.add(f"{parts[0]} and {parts[1]} {last}")
                base_variants.add(f"{parts[1]} and {parts[0]} {last}")
                base_variants.add(f"{parts[0]} {parts[1]} {last}")
                base_variants.add(f"{parts[1]} {parts[0]} {last}")
            for variant in base_variants:
                keys.add(_normalize(variant) or "")
        else:
            keys.add(_normalize(first or last) or "")
    return {k for k in keys if k}


def _split_compound_name(value: str) -> list[str]:
    if not value:
        return []
    text = value.replace("&", " and ")
    parts = re.split(r"\band\b", text, flags=re.IGNORECASE)
    cleaned = [p.strip() for p in parts if p.strip()]
    return cleaned or [value.strip()]


def _find_header_row(df: pd.DataFrame) -> int | None:
    for idx in range(min(10, len(df))):
        row = df.iloc[idx]
        for value in row:
            if isinstance(value, str) and value.strip().lower() == "investor last name":
                return idx
    return None


def _find_col_index(header_row: list[object], label: str) -> int | None:
    for idx, value in enumerate(header_row):
        if isinstance(value, str) and value.strip().lower() == label.lower():
            return idx
    return None


def _find_fee_col(header_row: list[object], start_idx: int, label: str) -> int | None:
    for offset in range(1, 12):
        idx = start_idx + offset
        if idx >= len(header_row):
            continue
        value = header_row[idx]
        if isinstance(value, str) and value.strip().lower() == label.lower():
            return idx
    return None


def _build_name_map() -> dict[str, str]:
    df = pd.read_csv(NAME_MAP_PATH)
    mapping: dict[str, str] = {}
    placeholder_full_names = {"add full legal name / last name", "add full legal name"}
    for _, row in df.iterrows():
        current = _clean_name(row.get("Current Name"))
        full = _clean_name(row.get("Full Name"))
        if full and full.lower() in placeholder_full_names:
            continue
        if current and full:
            mapping[current.lower()] = full
    mapping.update(
        {
            "anand": "Setcap",
            "anand sethia": "Setcap",
            "set cap": "Setcap",
            "dan": "Daniel Baumslag",
            "daniel": "Daniel Baumslag",
            "dan baumslag": "Daniel Baumslag",
            "daniel baumslag": "Daniel Baumslag",
            "rick": "Altras Capital Financing Broker",
            "rick + andrew": "Altras Capital Financing Broker",
            "rick+andrew": "Altras Capital Financing Broker",
            "elevation+rick": "Altras Capital Financing Broker",
            "stableton+terra": "Stableton+Terra",
            "terra financial": "Terra Financial & Management Services SA",
        }
    )
    return mapping


def _map_introducer_name(raw: str | None, name_map: dict[str, str]) -> str | None:
    if not raw:
        return None
    lowered = raw.lower()
    if lowered in name_map:
        return name_map[lowered]
    if "+" in raw:
        parts = [p.strip() for p in raw.split("+")]
        mapped_parts = []
        for part in parts:
            if not part:
                continue
            mapped_parts.append(name_map.get(part.lower(), part))
        return "+".join(mapped_parts) if mapped_parts else None
    return name_map.get(lowered, raw)


def main() -> None:
    env = load_env(ENV_PATH)
    supabase_url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL") or "").rstrip("/")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing Supabase URL/service key in .env.local")
    base = {"url": supabase_url, "key": supabase_key}

    if not DASHBOARD_PATH.exists():
        raise SystemExit(f"Missing dashboard file: {DASHBOARD_PATH}")

    df = pd.read_excel(DASHBOARD_PATH, sheet_name=SHEET_NAME, header=None)
    header_idx = _find_header_row(df)
    if header_idx is None:
        raise SystemExit("Could not find header row in VC6 sheet")

    header_row = df.iloc[header_idx].tolist()
    partner_col = _find_col_index(header_row, "Partner")
    bi_col = _find_col_index(header_row, "BI")
    last_col = _find_col_index(header_row, "Investor Last Name")
    first_col = _find_col_index(header_row, "Investor First Name")
    entity_col = _find_col_index(header_row, "Investor Entity")
    amount_col = _find_col_index(header_row, "Amount invested")
    price_col = _find_col_index(header_row, "Price per Share")
    shares_col = _find_col_index(header_row, "Number of shares invested")
    ownership_col = _find_col_index(header_row, "Ownership position") or _find_col_index(header_row, "OWNERSHIP POSITION")
    contract_date_col = _find_col_index(header_row, "Contract Date")
    sourcing_ref_col = _find_col_index(header_row, "Final Sourcing contract ref")

    if partner_col is None or bi_col is None:
        raise SystemExit("VC6 sheet missing Partner or BI columns")

    name_map = _build_name_map()

    fee_cols = {
        "partner": {
            "sub_fee_pct": _find_fee_col(header_row, partner_col, "Subscription fees %"),
            "sub_fee_amt": _find_fee_col(header_row, partner_col, "Subscription fees"),
            "perf_fee_1": _find_fee_col(header_row, partner_col, "Performance fees 1"),
            "thresh_1": _find_fee_col(header_row, partner_col, "Threshold 1"),
            "perf_fee_2": _find_fee_col(header_row, partner_col, "Performance fees 2"),
            "thresh_2": _find_fee_col(header_row, partner_col, "Threshold 2"),
            "spread_pps": _find_fee_col(header_row, partner_col, "Spread PPS"),
            "spread_fee_amt": _find_fee_col(header_row, partner_col, "Spread PPS Fees"),
        },
        "bi": {
            "sub_fee_pct": _find_fee_col(header_row, bi_col, "Subscription fees %"),
            "sub_fee_amt": _find_fee_col(header_row, bi_col, "Subscription fees"),
            "perf_fee_1": _find_fee_col(header_row, bi_col, "Performance fees 1"),
            "thresh_1": _find_fee_col(header_row, bi_col, "Threshold 1"),
            "perf_fee_2": _find_fee_col(header_row, bi_col, "Performance fees 2"),
            "thresh_2": _find_fee_col(header_row, bi_col, "Threshold 2"),
            "spread_pps": _find_fee_col(header_row, bi_col, "Spread PPS"),
            "spread_fee_amt": _find_fee_col(header_row, bi_col, "Spread PPS Fees"),
        },
    }

    intro_rows: list[dict] = []
    for row_idx in range(header_idx + 1, len(df)):
        row = df.iloc[row_idx].tolist()
        investor_last = _clean_name(row[last_col]) if last_col is not None else None
        investor_first = _clean_name(row[first_col]) if first_col is not None else None
        investor_entity = _clean_name(row[entity_col]) if entity_col is not None else None
        if not investor_last and not investor_first and not investor_entity:
            continue
        base_row = {
            "row_index": row_idx,
            "investor_last": investor_last,
            "investor_first": investor_first,
            "investor_entity": investor_entity,
            "amount_invested": _to_numeric(row[amount_col]) if amount_col is not None else None,
            "price_per_share": _to_numeric(row[price_col]) if price_col is not None else None,
            "num_shares": _to_numeric(row[shares_col]) if shares_col is not None else None,
            "ownership_position": _to_numeric(row[ownership_col]) if ownership_col is not None else None,
            "contract_date": _to_date(row[contract_date_col]) if contract_date_col is not None else None,
            "sourcing_contract_ref": _clean_name(row[sourcing_ref_col]) if sourcing_ref_col is not None else None,
        }

        for label, col_key, col_idx in (
            ("PARTNER", "partner", partner_col),
            ("INTRODUCER", "bi", bi_col),
        ):
            raw_name = _clean_name(row[col_idx]) if col_idx is not None else None
            if not raw_name:
                continue
            mapped = _map_introducer_name(raw_name, name_map)
            fees = fee_cols[col_key]
            intro_rows.append(
                {
                    **base_row,
                    "group_label": label,
                    "introducer_raw_name": raw_name,
                    "introducer_name_mapped": mapped,
                    "sub_fee_pct": _to_numeric(row[fees["sub_fee_pct"]]) if fees["sub_fee_pct"] is not None else None,
                    "sub_fee_amt": _to_numeric(row[fees["sub_fee_amt"]]) if fees["sub_fee_amt"] is not None else None,
                    "perf_fee_1_pct": _to_numeric(row[fees["perf_fee_1"]]) if fees["perf_fee_1"] is not None else None,
                    "thresh_1": _clean_name(row[fees["thresh_1"]]) if fees["thresh_1"] is not None else None,
                    "perf_fee_2_pct": _to_numeric(row[fees["perf_fee_2"]]) if fees["perf_fee_2"] is not None else None,
                    "thresh_2": _clean_name(row[fees["thresh_2"]]) if fees["thresh_2"] is not None else None,
                    "spread_pps": _to_numeric(row[fees["spread_pps"]]) if fees["spread_pps"] is not None else None,
                    "spread_fee_amt": _to_numeric(row[fees["spread_fee_amt"]]) if fees["spread_fee_amt"] is not None else None,
                }
            )

    pd.DataFrame(intro_rows).to_csv(OUT_INTRO_ROWS, index=False)

    # Load DB data
    vehicles = fetch_all(base, "vehicles", "id,entity_code", {"entity_code": "eq.VC106"})
    if not vehicles:
        raise SystemExit("VC106 vehicle not found in DB")
    vehicle_id = vehicles[0]["id"]
    deals = fetch_all(base, "deals", "id,vehicle_id", {"vehicle_id": f"eq.{vehicle_id}"})
    if not deals:
        raise SystemExit("VC106 deal not found in DB")
    deal_id = deals[0]["id"]

    investors = fetch_all(base, "investors", "id,display_name,legal_name")
    introducers = fetch_all(base, "introducers", "id,display_name,legal_name")
    subscriptions = fetch_all(
        base,
        "subscriptions",
        "id,deal_id,investor_id,commitment,num_shares,price_per_share,cost_per_share,contract_date,sourcing_contract_ref,subscription_number",
        {"deal_id": f"eq.{deal_id}"},
    )
    positions = fetch_all(base, "positions", "id,investor_id,vehicle_id,units", {"vehicle_id": f"eq.{vehicle_id}"})
    introductions = fetch_all(base, "introductions", "id,introducer_id,deal_id,prospect_investor_id", {"deal_id": f"eq.{deal_id}"})
    commissions = fetch_all(
        base,
        "introducer_commissions",
        "id,introducer_id,deal_id,investor_id,basis_type,rate_bps,accrual_amount,currency,status,introduction_id,base_amount,created_at,tier_number",
        {"deal_id": f"eq.{deal_id}"},
    )

    investor_lookup = _build_lookup(investors, ["legal_name", "display_name"])
    introducer_lookup = _build_lookup(introducers, ["legal_name", "display_name"])

    subs_by_investor = defaultdict(list)
    for sub in subscriptions:
        subs_by_investor[(sub["investor_id"], sub["deal_id"])].append(sub)

    pos_by_investor = defaultdict(list)
    for pos in positions:
        pos_by_investor[(pos["investor_id"], pos["vehicle_id"])].append(pos)

    intro_key = {(i["introducer_id"], i["deal_id"], i["prospect_investor_id"]): i for i in introductions}
    comm_key = {
        (c["introducer_id"], c["deal_id"], c["investor_id"], c["basis_type"], c.get("tier_number")): c
        for c in commissions
    }

    # Reconcile
    intro_recon: list[dict] = []
    comm_recon: list[dict] = []

    for row in intro_rows:
        # investor match
        investor_id = None
        investor_match_status = "NO_MATCH"
        matches = []
        entity_key = _normalize(row.get("investor_entity")) if row.get("investor_entity") else None
        if entity_key:
            matches = investor_lookup.get(entity_key, [])
        if not matches:
            for k in _name_keys(row.get("investor_first"), row.get("investor_last"), None):
                matches.extend(investor_lookup.get(k, []))
        if matches:
            unique = {m["id"]: m for m in matches}
            matches = list(unique.values())

        if len(matches) == 1:
            investor_id = matches[0]["id"]
            investor_match_status = "MATCH"
        elif len(matches) > 1:
            candidate_ids = [m["id"] for m in matches]
            # Disambiguate using subscriptions (amount/shares/price)
            amount = row.get("amount_invested")
            row_shares = row.get("num_shares") or row.get("ownership_position")
            price = row.get("price_per_share")
            if price is None and amount and row_shares and row_shares != 0:
                price = amount / row_shares
            contract_date = row.get("contract_date")
            sourcing_ref = row.get("sourcing_contract_ref")
            matched_by_sub = []
            for cid in candidate_ids:
                for sub in subs_by_investor.get((cid, deal_id), []):
                    commitment = _to_numeric(sub.get("commitment"))
                    sub_shares = _to_numeric(sub.get("num_shares"))
                    price_db = _to_numeric(sub.get("price_per_share"))
                    sub_date = sub.get("contract_date")
                    sub_ref = _clean_name(sub.get("sourcing_contract_ref"))
                    if amount is not None and commitment is not None and abs(amount - commitment) > 0.05:
                        continue
                    if row_shares is not None and sub_shares is not None and abs(row_shares - sub_shares) > 0.05:
                        continue
                    if price is not None and price_db is not None and abs(price - price_db) > 0.0002:
                        continue
                    if contract_date and sub_date and contract_date != sub_date:
                        continue
                    if sourcing_ref and sub_ref and sourcing_ref != sub_ref:
                        continue
                    matched_by_sub.append(cid)
                    break
            if len(set(matched_by_sub)) == 1:
                investor_id = list(set(matched_by_sub))[0]
                investor_match_status = "MATCH"
            else:
                # fallback to positions
                with_pos = [cid for cid in candidate_ids if (cid, vehicle_id) in pos_by_investor]
                if len(with_pos) == 1:
                    investor_id = with_pos[0]
                    investor_match_status = "MATCH"
                else:
                    investor_match_status = "MULTI_MATCH"
        else:
            # Try number-based match if no name match
            amount = row.get("amount_invested")
            row_shares = row.get("num_shares") or row.get("ownership_position")
            price = row.get("price_per_share")
            if price is None and amount and row_shares and row_shares != 0:
                price = amount / row_shares
            contract_date = row.get("contract_date")
            sourcing_ref = row.get("sourcing_contract_ref")
            candidate_ids = []
            for sub in subscriptions:
                commitment = _to_numeric(sub.get("commitment"))
                sub_shares = _to_numeric(sub.get("num_shares"))
                sub_price = _to_numeric(sub.get("price_per_share"))
                sub_date = sub.get("contract_date")
                sub_ref = _clean_name(sub.get("sourcing_contract_ref"))
                if amount is not None and commitment is not None and abs(amount - commitment) > 0.05:
                    continue
                if row_shares is not None and sub_shares is not None and abs(row_shares - sub_shares) > 0.05:
                    continue
                if price is not None and sub_price is not None and abs(price - sub_price) > 0.0002:
                    continue
                if contract_date and sub_date and contract_date != sub_date:
                    continue
                if sourcing_ref and sub_ref and sourcing_ref != sub_ref:
                    continue
                candidate_ids.append(sub["investor_id"])
            candidate_ids = list(dict.fromkeys(candidate_ids))
            if len(candidate_ids) == 1:
                investor_id = candidate_ids[0]
                investor_match_status = "MATCH_BY_NUMBERS"

        # introducer match
        introducer_id = None
        introducer_match_status = "NO_MATCH"
        intro_key_norm = _normalize(row.get("introducer_name_mapped"))
        intro_matches = introducer_lookup.get(intro_key_norm, []) if intro_key_norm else []
        if intro_matches:
            unique_intro = {m["id"]: m for m in intro_matches}
            intro_matches = list(unique_intro.values())
        if len(intro_matches) == 1:
            introducer_id = intro_matches[0]["id"]
            introducer_match_status = "MATCH"
        elif len(intro_matches) > 1:
            # try exact string match on display_name/legal_name
            target = (row.get("introducer_name_mapped") or "").strip().lower()
            exact = [
                m
                for m in intro_matches
                if (m.get("display_name") or "").strip().lower() == target
                or (m.get("legal_name") or "").strip().lower() == target
            ]
            if len(exact) == 1:
                introducer_id = exact[0]["id"]
                introducer_match_status = "MATCH"
            else:
                introducer_match_status = "MULTI_MATCH"

        intro_exists = False
        if investor_id and introducer_id:
            intro_exists = (introducer_id, deal_id, investor_id) in intro_key

        intro_recon.append(
            {
                **row,
                "investor_id": investor_id,
                "investor_match_status": investor_match_status,
                "introducer_id": introducer_id,
                "introducer_match_status": introducer_match_status,
                "introduction_exists": intro_exists,
            }
        )

        # Expected commissions
        def _nonzero(val: float | None) -> bool:
            return val is not None and abs(val) > 0

        expected_basis: list[tuple[str, int | None]] = []
        if _nonzero(row.get("sub_fee_pct")) or _nonzero(row.get("sub_fee_amt")):
            expected_basis.append(("invested_amount", None))
        # spread only if non-zero
        if _nonzero(row.get("spread_fee_amt")) or _nonzero(row.get("spread_pps")):
            expected_basis.append(("spread", None))
        if _nonzero(row.get("perf_fee_1_pct")):
            expected_basis.append(("performance_fee", None))
        if _nonzero(row.get("perf_fee_2_pct")):
            expected_basis.append(("performance_fee", None))

        for basis_type, tier in expected_basis:
            comm_exists = False
            if investor_id and introducer_id:
                comm_exists = (introducer_id, deal_id, investor_id, basis_type, tier) in comm_key
            comm_recon.append(
                {
                    "row_index": row["row_index"],
                    "group_label": row["group_label"],
                    "introducer_name_mapped": row["introducer_name_mapped"],
                    "investor_first": row["investor_first"],
                    "investor_last": row["investor_last"],
                    "investor_entity": row["investor_entity"],
                    "basis_type": basis_type,
                    "introducer_id": introducer_id,
                    "investor_id": investor_id,
                    "commission_exists": comm_exists,
                }
            )

    pd.DataFrame(intro_recon).to_csv(OUT_INTRO_RECON, index=False)
    pd.DataFrame(comm_recon).to_csv(OUT_COMM_RECON, index=False)

    # Candidates for unmatched investors using amount/shares/price
    candidate_rows: list[dict] = []
    candidate_seen: set[tuple[int, str]] = set()
    for row in intro_recon:
        if row["investor_match_status"] == "MATCH":
            continue
        amount = row.get("amount_invested")
        row_shares = row.get("num_shares") or row.get("ownership_position")
        price = row.get("price_per_share")
        contract_date = row.get("contract_date")
        sourcing_ref = row.get("sourcing_contract_ref")
        if price is None and amount and row_shares and row_shares != 0:
            price = amount / row_shares
        for sub in subscriptions:
            commitment = _to_numeric(sub.get("commitment"))
            sub_shares = _to_numeric(sub.get("num_shares"))
            sub_price = _to_numeric(sub.get("price_per_share"))
            sub_date = sub.get("contract_date")
            sub_ref = _clean_name(sub.get("sourcing_contract_ref"))
            if amount is not None and commitment is not None and abs(amount - commitment) > 0.05:
                continue
            if row_shares is not None and sub_shares is not None and abs(row_shares - sub_shares) > 0.05:
                continue
            if price is not None and sub_price is not None and abs(price - sub_price) > 0.0002:
                continue
            if contract_date and sub_date and contract_date != sub_date:
                continue
            if sourcing_ref and sub_ref and sourcing_ref != sub_ref:
                continue
            key = (row["row_index"], sub["id"])
            if key in candidate_seen:
                continue
            candidate_seen.add(key)
            investor_name = None
            for inv in investors:
                if inv["id"] == sub["investor_id"]:
                    investor_name = inv.get("legal_name") or inv.get("display_name")
                    break
            candidate_rows.append(
                {
                    "row_index": row["row_index"],
                    "investor_first": row.get("investor_first"),
                    "investor_last": row.get("investor_last"),
                    "investor_entity": row.get("investor_entity"),
                    "amount_invested": amount,
                    "num_shares": row_shares,
                    "price_per_share": price,
                    "subscription_id": sub["id"],
                    "investor_id": sub["investor_id"],
                    "investor_name_db": investor_name,
                    "commitment_db": commitment,
                    "num_shares_db": sub_shares,
                    "price_per_share_db": sub_price,
                    "contract_date_db": sub.get("contract_date"),
                    "sourcing_contract_ref_db": sub.get("sourcing_contract_ref"),
                }
            )

    if candidate_rows:
        pd.DataFrame(candidate_rows).to_csv(OUT_UNMATCHED_CANDIDATES, index=False)

    # Summary
    matched_statuses = {"MATCH", "MATCH_BY_NUMBERS"}
    missing_intro = [
        r
        for r in intro_recon
        if r["introducer_match_status"] == "MATCH"
        and r["investor_match_status"] in matched_statuses
        and not r["introduction_exists"]
    ]
    missing_comm = [r for r in comm_recon if r["introducer_id"] and r["investor_id"] and not r["commission_exists"]]
    unmatched_investors = [r for r in intro_recon if r["investor_match_status"] not in matched_statuses]
    unmatched_introducers = [r for r in intro_recon if r["introducer_match_status"] != "MATCH"]

    # Duplicate commissions within VC106 (same introducer/investor/basis/tier)
    dup_comm: dict[tuple[str, str, str, str | None], int] = {}
    for c in commissions:
        key = (c["introducer_id"], c["investor_id"], c["basis_type"], str(c.get("tier_number")))
        dup_comm[key] = dup_comm.get(key, 0) + 1
    dup_comm = {k: v for k, v in dup_comm.items() if v > 1}

    # Exact duplicates (all relevant fields identical except id/created_at)
    dup_comm_exact: dict[tuple, int] = {}
    for c in commissions:
        key_full = (
            c["introducer_id"],
            c["deal_id"],
            c["investor_id"],
            c["basis_type"],
            c.get("tier_number"),
            c.get("rate_bps"),
            str(c.get("accrual_amount")),
            c.get("currency"),
            c.get("status"),
            c.get("introduction_id"),
            str(c.get("base_amount")),
        )
        dup_comm_exact[key_full] = dup_comm_exact.get(key_full, 0) + 1
    dup_comm_exact = {k: v for k, v in dup_comm_exact.items() if v > 1}

    # Export duplicate commission details with subscription counts
    if dup_comm:
        dup_rows = []
        subs_by_investor = defaultdict(list)
        for sub in subscriptions:
            subs_by_investor[sub["investor_id"]].append(sub)
        for (intro_id, investor_id, basis_type, tier), count in sorted(dup_comm.items()):
            sub_count = len(subs_by_investor.get(investor_id, []))
            # mark if exact duplicate exists for this key
            exact = [
                k
                for k, v in dup_comm_exact.items()
                if k[0] == intro_id and k[2] == investor_id and k[3] == basis_type and str(k[4]) == str(tier)
            ]
            dup_rows.append(
                {
                    "introducer_id": intro_id,
                    "investor_id": investor_id,
                    "basis_type": basis_type,
                    "tier_number": tier,
                    "count": count,
                    "subscription_count_for_investor": sub_count,
                    "exact_duplicate_groups": len(exact),
                }
            )
        pd.DataFrame(dup_rows).to_csv(OUT_DUP_COMM, index=False)

    # Duplicate introducer records by mapped name
    mapped_names = sorted({r["introducer_name_mapped"] for r in intro_rows if r.get("introducer_name_mapped")})
    introducer_dups: list[str] = []
    for name in mapped_names:
        norm = _normalize(name)
        matches = introducer_lookup.get(norm, []) if norm else []
        unique_ids = {m["id"] for m in matches}
        if len(unique_ids) > 1:
            introducer_dups.append(f"{name}: {len(unique_ids)} IDs ({', '.join(sorted(unique_ids))})")

    report_lines = [
        "# VC106 (VC6) Introducer Reconciliation",
        "",
        f"Dashboard sheet: {SHEET_NAME}",
        f"Rows with introducers/partners extracted: {len(intro_rows)}",
        f"Unique introducer names (mapped): {len(set(r['introducer_name_mapped'] for r in intro_rows))}",
        "",
        f"Unmatched investors: {len(unmatched_investors)}",
        f"Unmatched introducers: {len(unmatched_introducers)}",
        f"Missing introductions (DB): {len(missing_intro)}",
        f"Missing commissions (DB): {len(missing_comm)}",
        "",
    ]

    if unmatched_investors:
        report_lines.append("## Unmatched investors (dashboard -> DB)")
        for row in unmatched_investors[:50]:
            report_lines.append(
                f"- row {row['row_index']}: {row.get('investor_first') or ''} {row.get('investor_last') or ''} {row.get('investor_entity') or ''} => {row['investor_match_status']}"
            )
        report_lines.append("")

    if unmatched_introducers:
        report_lines.append("## Unmatched introducers (dashboard -> DB)")
        for row in unmatched_introducers[:50]:
            report_lines.append(
                f"- row {row['row_index']}: {row.get('introducer_name_mapped') or row.get('introducer_raw_name')} => {row['introducer_match_status']}"
            )
        report_lines.append("")

    if missing_intro:
        report_lines.append("## Missing introductions by introducer")
        counts = Counter(r["introducer_name_mapped"] for r in missing_intro)
        for name, count in counts.most_common():
            report_lines.append(f"- {name}: {count}")
        report_lines.append("")

    if missing_comm:
        report_lines.append("## Missing commissions by introducer + basis")
        counts = Counter((r["introducer_name_mapped"], r["basis_type"]) for r in missing_comm)
        for (name, basis), count in counts.most_common():
            report_lines.append(f"- {name} / {basis}: {count}")
        report_lines.append("")

    if candidate_rows:
        report_lines.append("## Unmatched investor candidates (by numbers)")
        # show up to 10 candidates
        preview = candidate_rows[:10]
        for cand in preview:
            report_lines.append(
                f"- row {cand['row_index']}: {cand.get('investor_first') or ''} {cand.get('investor_last') or ''} "
                f"=> DB {cand.get('investor_name_db')} (sub_id {cand['subscription_id']}, date {cand.get('contract_date_db')})"
            )
        report_lines.append(f"(Full list in {OUT_UNMATCHED_CANDIDATES})")
        report_lines.append("")

    if introducer_dups:
        report_lines.append("## Duplicate introducer records (DB)")
        report_lines.extend([f"- {line}" for line in introducer_dups])
        report_lines.append("")

    if dup_comm:
        report_lines.append("## Duplicate commission rows (DB)")
        for (intro_id, investor_id, basis_type, tier), count in sorted(dup_comm.items()):
            report_lines.append(
                f"- introducer_id {intro_id} investor_id {investor_id} basis {basis_type} tier {tier} => {count} rows"
            )
        report_lines.append("")

    if dup_comm_exact:
        report_lines.append("## Exact duplicate commission rows (all fields)")
        for key, count in sorted(dup_comm_exact.items()):
            intro_id, deal_id, investor_id, basis_type, tier, rate_bps, accrual, currency, status, intro_ref, base_amount = key
            report_lines.append(
                f"- introducer_id {intro_id} investor_id {investor_id} basis {basis_type} tier {tier} "
                f"rate_bps {rate_bps} accrual {accrual} status {status} => {count} rows"
            )
        report_lines.append("")

    OUT_REPORT.write_text("\n".join(report_lines))
    print(f"Wrote {OUT_REPORT}")


if __name__ == "__main__":
    main()
