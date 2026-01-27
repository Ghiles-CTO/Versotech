#!/usr/bin/env python3
"""
Prepare VC112/VC143 data from VERSO dashboard for subscriptions, positions,
introductions, and commissions. No DB writes.
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd

DASHBOARD_PATH = Path("datamigration/VERSO DASHBOARD_V1.0.xlsx")
NAME_MAP_PATH = Path("VERSO/datafixing/introducers name change.csv")
ENV_PATH = Path(".env.local")

OUT_INVESTORS = Path("VERSO/datafixing/vc112_vc143_investor_rows.csv")
OUT_INTRODUCERS = Path("VERSO/datafixing/vc112_vc143_introducer_rows.csv")
OUT_SUBS = Path("VERSO/datafixing/vc112_vc143_subscriptions_prepared.csv")
OUT_POS = Path("VERSO/datafixing/vc112_vc143_positions_prepared.csv")
OUT_INTRO = Path("VERSO/datafixing/vc112_vc143_introductions_prepared.csv")
OUT_COMM = Path("VERSO/datafixing/vc112_vc143_commissions_prepared.csv")
OUT_REPORT = Path("VERSO/datafixing/vc112_vc143_report.md")

TARGET_SHEETS = {
    "VC12": "VC112",
    "VC43": "VC143",
}


@dataclass(frozen=True)
class MatchResult:
    status: str
    ids: list[str]


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
        try:
            with urlopen(req) as resp:
                payload = resp.read()
        except Exception as exc:
            if hasattr(exc, "read"):
                body = exc.read().decode("utf-8", errors="ignore")
                raise RuntimeError(f"Request failed: {url}\n{body}") from exc
            raise
        data = json.loads(payload.decode("utf-8"))
        if not data:
            break
        results.extend(data)
        if len(data) < page_size:
            break
        offset += page_size
    return results


def _clean_str(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none"}:
        return None
    return text


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


def _find_header_row(df: pd.DataFrame) -> int | None:
    for idx in range(min(10, len(df))):
        row = df.iloc[idx]
        for value in row:
            if _clean_str(value) and str(value).strip().lower() == "investor last name":
                return idx
    return None


def _header_map(row: list[object]) -> dict[int, str | None]:
    return {idx: _clean_str(value) for idx, value in enumerate(row)}


def _find_col_index(header_map: dict[int, str | None], label: str) -> int | None:
    label_lower = label.lower()
    for idx, name in header_map.items():
        if not name:
            continue
        if name.strip().lower() == label_lower:
            return idx
    return None


def _find_col_index_contains(header_map: dict[int, str | None], needle: str) -> int | None:
    needle_lower = needle.lower()
    for idx, name in header_map.items():
        if not name:
            continue
        if needle_lower in name.strip().lower():
            return idx
    return None


def _header_lower(header_map: dict[int, str | None]) -> dict[int, str]:
    return {idx: (name.strip().lower() if name else "") for idx, name in header_map.items()}


def _find_fee_columns(header_map: dict[int, str | None], name_col: int) -> dict[str, int | None]:
    header_lower = _header_lower(header_map)
    targets = {
        "sub_fee_pct": lambda s: "subscription fees" in s and "%" in s,
        "sub_fee_amt": lambda s: "subscription fees" in s and "%" not in s,
        "perf_fee_1_pct": lambda s: "performance fees 1" in s,
        "thresh_1": lambda s: "threshold 1" in s,
        "perf_fee_2_pct": lambda s: "performance fees 2" in s,
        "thresh_2": lambda s: "threshold 2" in s,
        "spread_pps": lambda s: "spread pps" in s and "fees" not in s,
        "spread_fee_amt": lambda s: "spread pps fees" in s,
    }
    found: dict[str, int | None] = {key: None for key in targets}
    for offset in range(1, 16):
        idx = name_col + offset
        if idx not in header_lower:
            continue
        label = header_lower[idx]
        for key, matcher in targets.items():
            if found[key] is None and matcher(label):
                found[key] = idx
    return found


def _find_group_label(group_row: list[object], header_row: list[object], name_idx: int) -> str | None:
    for offset in (0, 1, -1, 2, -2):
        idx = name_idx + offset
        if idx < 0 or idx >= len(group_row):
            continue
        label = _clean_str(group_row[idx])
        if not label:
            continue
        lowered = label.lower()
        if "partner" in lowered:
            return "PARTNERS"
        if "introducer" in lowered:
            return "INTRODUCERS"
        if "verso capital" in lowered:
            return "VERSO CAPITAL"
    header_label = _clean_str(header_row[name_idx]) if name_idx < len(header_row) else None
    if header_label:
        lowered = header_label.lower()
        if "partner" in lowered:
            return "PARTNERS"
        if "introducer" in lowered:
            return "INTRODUCERS"
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


def _normalize_text(text: str | None) -> str | None:
    if not text:
        return None
    normalized = unicodedata.normalize("NFKD", text)
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = normalized.lower()
    normalized = re.sub(r"[^a-z0-9]+", "", normalized)
    return normalized or None


def _name_keys(first: str | None, last: str | None, entity: str | None) -> set[str]:
    keys: set[str] = set()
    if entity:
        key = _normalize_text(entity)
        if key:
            keys.add(key)
    if first or last:
        if first and last:
            keys.add(_normalize_text(f"{first} {last}") or "")
            keys.add(_normalize_text(f"{last} {first}") or "")
        else:
            keys.add(_normalize_text(first or last) or "")
    return {k for k in keys if k}


def _build_lookup(records: Iterable[dict], name_fields: Iterable[str]) -> dict[str, list[dict]]:
    lookup: dict[str, list[dict]] = defaultdict(list)
    for record in records:
        for field in name_fields:
            value = record.get(field)
            if not value:
                continue
            key = _normalize_text(str(value))
            if key:
                lookup[key].append(record)
            if "," in str(value):
                parts = [p.strip() for p in str(value).split(",")]
                if len(parts) >= 2:
                    swapped = f"{parts[1]} {parts[0]}"
                    swap_key = _normalize_text(swapped)
                    if swap_key:
                        lookup[swap_key].append(record)
    return lookup


def _match_by_keys(keys: set[str], lookup: dict[str, list[dict]]) -> MatchResult:
    matches: dict[str, dict] = {}
    for key in keys:
        for record in lookup.get(key, []):
            rec_id = record.get("id")
            if not rec_id:
                continue
            matches[rec_id] = record
    if not matches:
        return MatchResult("NO_MATCH", [])
    if len(matches) == 1:
        return MatchResult("MATCH", list(matches.keys()))
    return MatchResult("MULTI_MATCH", list(matches.keys()))


def _to_bps(rate: float | None) -> int | None:
    if rate is None:
        return None
    if rate > 1:
        return int(round(rate * 100))
    return int(round(rate * 10000))


def _close(a: float | None, b: float | None, tol: float) -> bool:
    if a is None or b is None:
        return False
    return abs(a - b) <= tol


def _parse_threshold(raw: object) -> tuple[float | None, str | None]:
    if raw is None:
        return None, None
    text = str(raw).strip()
    if not text:
        return None, None
    lowered = text.lower()
    if lowered.endswith("x"):
        try:
            num = float(lowered.replace("x", ""))
            return num, "multiple"
        except ValueError:
            return None, "multiple"
    try:
        return float(text), None
    except ValueError:
        return None, None


def extract_dashboard_rows(dashboard_path: Path) -> tuple[list[dict], list[dict]]:
    name_map = _build_name_map()
    xl = pd.ExcelFile(dashboard_path)
    investor_rows: list[dict] = []
    introducer_rows: list[dict] = []

    for sheet, vc_code in TARGET_SHEETS.items():
        if sheet not in xl.sheet_names:
            continue
        df_raw = pd.read_excel(dashboard_path, sheet_name=sheet, header=None)
        header_row_idx = _find_header_row(df_raw)
        if header_row_idx is None:
            continue
        header_row = df_raw.iloc[header_row_idx].tolist()
        group_row = df_raw.iloc[header_row_idx - 1].tolist() if header_row_idx > 0 else [None] * len(header_row)
        header_map = _header_map(header_row)

        name_col_idxs = [
            idx
            for idx, name in header_map.items()
            if name and name.strip().lower() in {"names", "name", "partners", "introducers", "bi"}
        ]
        name_col_group: dict[int, str] = {}
        for idx in name_col_idxs:
            label = _find_group_label(group_row, header_row, idx)
            if label:
                name_col_group[idx] = label
        if len(name_col_group) != len(name_col_idxs) and name_col_idxs:
            sorted_cols = sorted(name_col_idxs)
            for i, idx in enumerate(sorted_cols):
                if idx in name_col_group:
                    continue
                name_col_group[idx] = "PARTNERS" if i == 0 else "INTRODUCERS"

        name_col_fees = {idx: _find_fee_columns(header_map, idx) for idx in name_col_idxs}

        investor_last_col = _find_col_index(header_map, "Investor Last Name")
        investor_first_col = _find_col_index(header_map, "Investor First Name")
        investor_entity_col = _find_col_index(header_map, "Investor Entity")
        amount_col = _find_col_index(header_map, "Amount invested")
        price_col = _find_col_index(header_map, "Price per Share")
        if price_col is None:
            price_col = _find_col_index(header_map, "Cost per Share")
        shares_col = _find_col_index(header_map, "Number of shares invested")
        ownership_col = _find_col_index_contains(header_map, "ownership position")
        contract_date_col = _find_col_index(header_map, "Contract Date")
        spread_pps_col = _find_col_index(header_map, "Spread PPS")
        spread_fee_col = _find_col_index(header_map, "Spread PPS Fees")
        sub_fee_pct_col = _find_col_index(header_map, "Subscription fees %")
        sub_fee_amt_col = _find_col_index(header_map, "Subscription fees")
        perf_fee_1_col = _find_col_index(header_map, "Performance fees 1")
        thresh_1_col = _find_col_index(header_map, "Threshold 1")
        perf_fee_2_col = _find_col_index(header_map, "Performance fees 2")
        thresh_2_col = _find_col_index(header_map, "Threshold 2")
        sourcing_ref_col = _find_col_index(header_map, "Sourcing Contract ref")
        opportunity_col = _find_col_index(header_map, "Opportunity")
        vehicle_col = _find_col_index(header_map, "Vehicle")
        management_fee_col = _find_col_index_contains(header_map, "management fees")
        discount_rate_col = _find_col_index_contains(header_map, "discount rate")
        interest_rate_col = _find_col_index_contains(header_map, "interest rate")
        valuation_cap_col = _find_col_index_contains(header_map, "valuation cap")
        interest_col = _find_col_index(header_map, "Interest")
        conversion_price_col = _find_col_index(header_map, "Conversion Price per Share")
        bd_fee_pct_col = _find_col_index(header_map, "BD Fees %")
        bd_fee_amt_col = _find_col_index(header_map, "BD fees")
        finra_fee_shares_col = _find_col_index(header_map, "FINRA fees in share")
        finra_fee_amt_col = _find_col_index(header_map, "FINRA fees")
        comments_col = _find_col_index(header_map, "Comments")
        todo_col = _find_col_index(header_map, "TO DO")

        for row_idx in range(header_row_idx + 1, len(df_raw)):
            row = df_raw.iloc[row_idx].tolist()

            investor_last = _clean_name(row[investor_last_col]) if investor_last_col is not None else None
            investor_first = _clean_name(row[investor_first_col]) if investor_first_col is not None else None
            investor_entity = _clean_name(row[investor_entity_col]) if investor_entity_col is not None else None
            if not investor_last and not investor_first and not investor_entity:
                continue

            amount_num = _to_numeric(row[amount_col]) if amount_col is not None else None
            shares_num = _to_numeric(row[shares_col]) if shares_col is not None else None
            ownership_num = _to_numeric(row[ownership_col]) if ownership_col is not None else None

            investor_rows.append(
                {
                    "vc_code": vc_code,
                    "sheet": sheet,
                    "row_index": row_idx,
                    "investor_last": investor_last,
                    "investor_first": investor_first,
                    "investor_entity": investor_entity,
                    "amount_invested": amount_num,
                    "price_per_share": _to_numeric(row[price_col]) if price_col is not None else None,
                    "num_shares": shares_num,
                    "ownership_position": ownership_num,
                    "contract_date": _to_date(row[contract_date_col]) if contract_date_col is not None else None,
                    "subscription_fee_percent": _to_numeric(row[sub_fee_pct_col]) if sub_fee_pct_col is not None else None,
                    "subscription_fee_amount": _to_numeric(row[sub_fee_amt_col]) if sub_fee_amt_col is not None else None,
                    "performance_fee_1_percent": _to_numeric(row[perf_fee_1_col]) if perf_fee_1_col is not None else None,
                    "performance_fee_1_threshold": _clean_str(row[thresh_1_col]) if thresh_1_col is not None else None,
                    "performance_fee_2_percent": _to_numeric(row[perf_fee_2_col]) if perf_fee_2_col is not None else None,
                    "performance_fee_2_threshold": _clean_str(row[thresh_2_col]) if thresh_2_col is not None else None,
                    "spread_per_share": _to_numeric(row[spread_pps_col]) if spread_pps_col is not None else None,
                    "spread_fee_amount": _to_numeric(row[spread_fee_col]) if spread_fee_col is not None else None,
                    "sourcing_contract_ref": _clean_str(row[sourcing_ref_col]) if sourcing_ref_col is not None else None,
                    "opportunity": _clean_str(row[opportunity_col]) if opportunity_col is not None else None,
                    "vehicle": _clean_str(row[vehicle_col]) if vehicle_col is not None else None,
                    "management_fee_percent": _to_numeric(row[management_fee_col]) if management_fee_col is not None else None,
                    "discount_rate": _to_numeric(row[discount_rate_col]) if discount_rate_col is not None else None,
                    "interest_rate": _to_numeric(row[interest_rate_col]) if interest_rate_col is not None else None,
                    "valuation_cap": _to_numeric(row[valuation_cap_col]) if valuation_cap_col is not None else None,
                    "interest": _to_numeric(row[interest_col]) if interest_col is not None else None,
                    "conversion_price_per_share": _to_numeric(row[conversion_price_col]) if conversion_price_col is not None else None,
                    "bd_fee_percent": _to_numeric(row[bd_fee_pct_col]) if bd_fee_pct_col is not None else None,
                    "bd_fee_amount": _to_numeric(row[bd_fee_amt_col]) if bd_fee_amt_col is not None else None,
                    "finra_fee_shares": _to_numeric(row[finra_fee_shares_col]) if finra_fee_shares_col is not None else None,
                    "finra_fee_amount": _to_numeric(row[finra_fee_amt_col]) if finra_fee_amt_col is not None else None,
                    "comments": _clean_str(row[comments_col]) if comments_col is not None else None,
                    "todo": _clean_str(row[todo_col]) if todo_col is not None else None,
                }
            )

            for name_col in name_col_idxs:
                raw_name = _clean_name(row[name_col]) if name_col < len(row) else None
                if not raw_name:
                    continue
                mapped = _map_introducer_name(raw_name, name_map)
                fees = name_col_fees.get(name_col, {})
                introducer_rows.append(
                    {
                        "vc_code": vc_code,
                        "sheet": sheet,
                        "row_index": row_idx,
                        "group_label": name_col_group.get(name_col),
                        "raw_name": raw_name,
                        "introducer_name_mapped": mapped,
                        "sub_fee_amt": _to_numeric(row[fees.get("sub_fee_amt")]) if fees.get("sub_fee_amt") is not None else None,
                        "spread_fee_amt": _to_numeric(row[fees.get("spread_fee_amt")]) if fees.get("spread_fee_amt") is not None else None,
                        "sub_fee_pct": _to_numeric(row[fees.get("sub_fee_pct")]) if fees.get("sub_fee_pct") is not None else None,
                        "spread_pps": _to_numeric(row[fees.get("spread_pps")]) if fees.get("spread_pps") is not None else None,
                        "perf_fee_1_pct": _to_numeric(row[fees.get("perf_fee_1_pct")]) if fees.get("perf_fee_1_pct") is not None else None,
                        "thresh_1": _clean_str(row[fees.get("thresh_1")]) if fees.get("thresh_1") is not None else None,
                        "perf_fee_2_pct": _to_numeric(row[fees.get("perf_fee_2_pct")]) if fees.get("perf_fee_2_pct") is not None else None,
                        "thresh_2": _clean_str(row[fees.get("thresh_2")]) if fees.get("thresh_2") is not None else None,
                        "investor_last": investor_last,
                        "investor_first": investor_first,
                        "investor_entity": investor_entity,
                        "amount_invested": amount_num,
                        "price_per_share": _to_numeric(row[price_col]) if price_col is not None else None,
                        "num_shares": shares_num,
                        "ownership_position": ownership_num,
                        "contract_date": _to_date(row[contract_date_col]) if contract_date_col is not None else None,
                    }
                )

    return investor_rows, introducer_rows


def main() -> None:
    if not DASHBOARD_PATH.exists():
        raise SystemExit(f"Missing dashboard file: {DASHBOARD_PATH}")

    investor_rows, introducer_rows = extract_dashboard_rows(DASHBOARD_PATH)

    pd.DataFrame(investor_rows).to_csv(OUT_INVESTORS, index=False)
    pd.DataFrame(introducer_rows).to_csv(OUT_INTRODUCERS, index=False)

    env = load_env(ENV_PATH)
    supabase_url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL") or "").rstrip("/")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing Supabase URL/service key in .env.local")

    base = {"url": supabase_url, "key": supabase_key}

    vehicles = fetch_all(base, "vehicles", "id,entity_code", {"entity_code": "in.(VC112,VC143)"})
    vehicle_by_code = {row["entity_code"]: row["id"] for row in vehicles}
    vehicle_ids = [row["id"] for row in vehicles]

    deals = fetch_all(base, "deals", "id,vehicle_id,name", {"vehicle_id": f"in.({','.join(vehicle_ids)})"})
    deal_by_vehicle = {row["vehicle_id"]: row["id"] for row in deals}

    subscriptions = fetch_all(
        base,
        "subscriptions",
        "id,deal_id,investor_id,commitment,num_shares,price_per_share,contract_date",
        {"deal_id": f"in.({','.join([d['id'] for d in deals])})"},
    )

    positions = fetch_all(
        base,
        "positions",
        "id,investor_id,vehicle_id,units",
        {"vehicle_id": f"in.({','.join(vehicle_ids)})"},
    )

    introductions = fetch_all(
        base,
        "introductions",
        "id,introducer_id,deal_id,prospect_investor_id,status,introduced_at",
        {"deal_id": f"in.({','.join([d['id'] for d in deals])})"},
    )

    commissions = fetch_all(
        base,
        "introducer_commissions",
        "id,introducer_id,deal_id,investor_id,basis_type,rate_bps,accrual_amount,tier_number",
        {"deal_id": f"in.({','.join([d['id'] for d in deals])})"},
    )

    investors = fetch_all(base, "investors", "id,display_name,legal_name,type")
    introducers = fetch_all(base, "introducers", "id,display_name,legal_name")

    investor_lookup = _build_lookup(investors, ["legal_name", "display_name"])
    introducer_lookup = _build_lookup(introducers, ["legal_name", "display_name"])

    subscription_by_investor: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for sub in subscriptions:
        subscription_by_investor[(sub["investor_id"], sub["deal_id"])].append(sub)

    position_by_investor: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for pos in positions:
        position_by_investor[(pos["investor_id"], pos["vehicle_id"])].append(pos)

    introduction_key = {(intro["introducer_id"], intro["deal_id"], intro["prospect_investor_id"]): intro for intro in introductions}
    commission_key = {
        (comm["introducer_id"], comm["deal_id"], comm["investor_id"], comm["basis_type"], comm.get("tier_number")): comm
        for comm in commissions
    }

    investor_match_by_row: dict[tuple[str, int], MatchResult] = {}
    investor_match_note_by_row: dict[tuple[str, int], str | None] = {}

    prepared_subs: list[dict] = []
    prepared_pos: list[dict] = []
    matched_subscription_ids: set[str] = set()
    soft_matched_subscription_ids: set[str] = set()
    matched_position_ids: set[str] = set()
    position_aggregate: dict[tuple[str, str], dict] = {}

    for row in investor_rows:
        vc_code = row["vc_code"]
        row_key = (vc_code, row["row_index"])
        entity_key = _normalize_text(row.get("investor_entity")) if row.get("investor_entity") else None
        if entity_key:
            match = _match_by_keys({entity_key}, investor_lookup)
            if match.status == "NO_MATCH":
                keys = _name_keys(row.get("investor_first"), row.get("investor_last"), None)
                match = _match_by_keys(keys, investor_lookup)
        else:
            keys = _name_keys(row.get("investor_first"), row.get("investor_last"), None)
            match = _match_by_keys(keys, investor_lookup)
        investor_id = match.ids[0] if match.status == "MATCH" else None
        match_note = None

        vehicle_id = vehicle_by_code.get(vc_code)
        deal_id = deal_by_vehicle.get(vehicle_id) if vehicle_id else None
        if match.status == "MULTI_MATCH" and (deal_id or vehicle_id):
            candidate_ids = match.ids
            with_sub = [cid for cid in candidate_ids if deal_id and (cid, deal_id) in subscription_by_investor]
            if len(with_sub) == 1:
                investor_id = with_sub[0]
                match = MatchResult("MATCH", [investor_id])
                match_note = "resolved_by_subscription"
            elif vehicle_id:
                with_pos = [cid for cid in candidate_ids if (cid, vehicle_id) in position_by_investor]
                if len(with_pos) == 1:
                    investor_id = with_pos[0]
                    match = MatchResult("MATCH", [investor_id])
                    match_note = "resolved_by_position"
        investor_match_by_row[row_key] = match
        investor_match_note_by_row[row_key] = match_note

        ownership = row.get("ownership_position")
        skip_reason = None
        if ownership is None or ownership == 0:
            skip_reason = "ownership_zero"

        subscription_match_status = "NO_INVESTOR_MATCH" if not investor_id else "NOT_FOUND"
        matched_subscription_id = None
        if investor_id and deal_id:
            candidates = subscription_by_investor.get((investor_id, deal_id), [])
            matches: list[dict] = []
            date_mismatch: list[dict] = []
            for candidate in candidates:
                commitment = _to_numeric(candidate.get("commitment"))
                num_shares = _to_numeric(candidate.get("num_shares"))
                price = _to_numeric(candidate.get("price_per_share"))
                contract = candidate.get("contract_date")
                if row.get("amount_invested") is not None and not _close(row.get("amount_invested"), commitment, 0.05):
                    continue
                if row.get("num_shares") is not None and not _close(row.get("num_shares"), num_shares, 0.05):
                    continue
                if row.get("price_per_share") is not None and not _close(row.get("price_per_share"), price, 0.0002):
                    continue
                if row.get("contract_date") and contract and row.get("contract_date") != contract:
                    date_mismatch.append(candidate)
                    continue
                matches.append(candidate)
            if len(matches) == 1:
                subscription_match_status = "MATCH"
                matched_subscription_id = matches[0]["id"]
                matched_subscription_ids.add(matches[0]["id"])
            elif len(matches) > 1:
                subscription_match_status = "MULTI_MATCH"
            elif len(date_mismatch) == 1:
                subscription_match_status = "DATE_MISMATCH"
                matched_subscription_id = date_mismatch[0]["id"]
                soft_matched_subscription_ids.add(date_mismatch[0]["id"])
            elif len(date_mismatch) > 1:
                subscription_match_status = "DATE_MISMATCH_MULTI"
            else:
                subscription_match_status = "NOT_FOUND"

        prepared_subs.append(
            {
                **row,
                "investor_match_status": match.status,
                "investor_match_note": match_note,
                "investor_id": investor_id,
                "vehicle_id": vehicle_id,
                "deal_id": deal_id,
                "subscription_match_status": subscription_match_status,
                "matched_subscription_id": matched_subscription_id,
                "skip_reason": skip_reason,
                "should_insert": bool(
                    investor_id
                    and deal_id
                    and not matched_subscription_id
                    and skip_reason is None
                    and subscription_match_status == "NOT_FOUND"
                ),
            }
        )

        if investor_id and vehicle_id and skip_reason is None:
            key = (investor_id, vehicle_id)
            entry = position_aggregate.get(key)
            if not entry:
                position_aggregate[key] = {
                    "vc_code": vc_code,
                    "sheet": row["sheet"],
                    "row_indices": [row["row_index"]],
                    "investor_last": row.get("investor_last"),
                    "investor_first": row.get("investor_first"),
                    "investor_entity": row.get("investor_entity"),
                    "ownership_position": row.get("ownership_position") or 0.0,
                    "investor_match_status": match.status,
                    "investor_match_note": match_note,
                    "investor_id": investor_id,
                    "vehicle_id": vehicle_id,
                }
            else:
                entry["row_indices"].append(row["row_index"])
                entry["ownership_position"] = (entry.get("ownership_position") or 0.0) + (row.get("ownership_position") or 0.0)

    # Build aggregated positions and match against DB positions
    for (investor_id, vehicle_id), entry in position_aggregate.items():
        candidates = position_by_investor.get((investor_id, vehicle_id), [])
        matches: list[dict] = []
        for candidate in candidates:
            units = _to_numeric(candidate.get("units"))
            if entry.get("ownership_position") is not None and not _close(entry.get("ownership_position"), units, 0.05):
                continue
            matches.append(candidate)
        if len(matches) == 1:
            position_match_status = "MATCH"
            matched_position_id = matches[0]["id"]
            matched_position_ids.add(matches[0]["id"])
        elif len(matches) > 1:
            position_match_status = "MULTI_MATCH"
            matched_position_id = None
        else:
            position_match_status = "NOT_FOUND"
            matched_position_id = None

        prepared_pos.append(
            {
                "vc_code": entry.get("vc_code"),
                "sheet": entry.get("sheet"),
                "row_indices": ",".join(str(x) for x in sorted(entry.get("row_indices", []))),
                "investor_last": entry.get("investor_last"),
                "investor_first": entry.get("investor_first"),
                "investor_entity": entry.get("investor_entity"),
                "ownership_position": entry.get("ownership_position"),
                "investor_match_status": entry.get("investor_match_status"),
                "investor_match_note": entry.get("investor_match_note"),
                "investor_id": investor_id,
                "vehicle_id": vehicle_id,
                "position_match_status": position_match_status,
                "matched_position_id": matched_position_id,
                "should_insert": bool(investor_id and vehicle_id and not matched_position_id),
            }
        )

    prepared_introductions: list[dict] = []
    prepared_commissions: list[dict] = []

    for row in introducer_rows:
        vc_code = row["vc_code"]
        vehicle_id = vehicle_by_code.get(vc_code)
        deal_id = deal_by_vehicle.get(vehicle_id) if vehicle_id else None
        row_key = (vc_code, row["row_index"])
        investor_match = investor_match_by_row.get(row_key, MatchResult("NO_MATCH", []))
        investor_id = investor_match.ids[0] if investor_match.status == "MATCH" else None

        intro_keys = _name_keys(None, None, row.get("introducer_name_mapped"))
        introducer_match = _match_by_keys(intro_keys, introducer_lookup)
        introducer_id = introducer_match.ids[0] if introducer_match.status == "MATCH" else None

        intro_match_status = "NO_MATCH"
        matched_intro_id = None
        if introducer_id and investor_id and deal_id:
            existing = introduction_key.get((introducer_id, deal_id, investor_id))
            if existing:
                intro_match_status = "MATCH"
                matched_intro_id = existing.get("id")
            else:
                intro_match_status = "NOT_FOUND"

        prepared_introductions.append(
            {
                "vc_code": vc_code,
                "sheet": row["sheet"],
                "row_index": row["row_index"],
                "group_label": row.get("group_label"),
                "introducer_raw_name": row.get("raw_name"),
                "introducer_name_mapped": row.get("introducer_name_mapped"),
                "introducer_match_status": introducer_match.status,
                "introducer_id": introducer_id,
                "investor_match_status": investor_match.status,
                "investor_match_note": investor_match_note_by_row.get(row_key),
                "investor_id": investor_id,
                "deal_id": deal_id,
                "introduction_match_status": intro_match_status,
                "matched_introduction_id": matched_intro_id,
                "should_insert": bool(introducer_id and investor_id and deal_id and not matched_intro_id),
            }
        )

        # Prepare commission records for each fee type
        sub_fee_amt = row.get("sub_fee_amt")
        sub_fee_pct = row.get("sub_fee_pct")
        spread_fee_amt = row.get("spread_fee_amt")
        spread_pps = row.get("spread_pps")
        perf_fee_1_pct = row.get("perf_fee_1_pct")
        perf_fee_2_pct = row.get("perf_fee_2_pct")
        thresh_1 = row.get("thresh_1")
        thresh_2 = row.get("thresh_2")

        commission_candidates: list[dict] = []
        if sub_fee_amt is not None or sub_fee_pct is not None:
            rate_bps = _to_bps(sub_fee_pct)
            if rate_bps is None and sub_fee_amt and row.get("amount_invested"):
                rate_bps = _to_bps(sub_fee_amt / row.get("amount_invested"))
            commission_candidates.append(
                {
                    "basis_type": "invested_amount",
                    "rate_bps": rate_bps,
                    "accrual_amount": sub_fee_amt,
                    "base_amount": row.get("amount_invested"),
                    "tier_number": None,
                    "threshold_multiplier": None,
                    "performance_threshold_type": None,
                }
            )

        has_spread = False
        if spread_fee_amt is not None and abs(spread_fee_amt) > 0:
            has_spread = True
        if spread_pps is not None and abs(spread_pps) > 0:
            has_spread = True
        if has_spread:
            commission_candidates.append(
                {
                    "basis_type": "spread",
                    "rate_bps": 0,
                    "accrual_amount": spread_fee_amt,
                    "base_amount": spread_pps,
                    "tier_number": None,
                    "threshold_multiplier": None,
                    "performance_threshold_type": None,
                }
            )

        if perf_fee_1_pct is not None:
            thresh_val, thresh_type = _parse_threshold(thresh_1)
            commission_candidates.append(
                {
                    "basis_type": "performance_fee",
                    "rate_bps": _to_bps(perf_fee_1_pct),
                    "accrual_amount": 0.0,
                    "base_amount": None,
                    "tier_number": None,
                    "threshold_multiplier": thresh_val,
                    "performance_threshold_type": thresh_type,
                }
            )

        if perf_fee_2_pct is not None:
            thresh_val, thresh_type = _parse_threshold(thresh_2)
            commission_candidates.append(
                {
                    "basis_type": "performance_fee",
                    "rate_bps": _to_bps(perf_fee_2_pct),
                    "accrual_amount": 0.0,
                    "base_amount": None,
                    "tier_number": None,
                    "threshold_multiplier": thresh_val,
                    "performance_threshold_type": thresh_type,
                }
            )

        for candidate in commission_candidates:
            comm_match_status = "NO_MATCH"
            matched_comm_id = None
            if introducer_id and investor_id and deal_id:
                existing = commission_key.get(
                    (introducer_id, deal_id, investor_id, candidate["basis_type"], candidate["tier_number"])
                )
                if existing:
                    comm_match_status = "MATCH"
                    matched_comm_id = existing.get("id")
                else:
                    comm_match_status = "NOT_FOUND"

            prepared_commissions.append(
                {
                    "vc_code": vc_code,
                    "sheet": row["sheet"],
                    "row_index": row["row_index"],
                    "group_label": row.get("group_label"),
                    "introducer_name_mapped": row.get("introducer_name_mapped"),
                    "introducer_id": introducer_id,
                    "investor_id": investor_id,
                    "deal_id": deal_id,
                    "basis_type": candidate["basis_type"],
                    "rate_bps": candidate["rate_bps"],
                    "accrual_amount": candidate["accrual_amount"],
                    "base_amount": candidate["base_amount"],
                    "tier_number": candidate["tier_number"],
                    "threshold_multiplier": candidate["threshold_multiplier"],
                    "performance_threshold_type": candidate["performance_threshold_type"],
                    "sub_fee_pct": sub_fee_pct,
                    "sub_fee_amt": sub_fee_amt,
                    "perf_fee_1_pct": perf_fee_1_pct,
                    "perf_fee_2_pct": perf_fee_2_pct,
                    "spread_fee_amt": spread_fee_amt,
                    "spread_pps": spread_pps,
                    "commission_match_status": comm_match_status,
                    "matched_commission_id": matched_comm_id,
                    "should_insert": bool(introducer_id and investor_id and deal_id and not matched_comm_id),
                }
            )

    pd.DataFrame(prepared_subs).to_csv(OUT_SUBS, index=False)
    pd.DataFrame(prepared_pos).to_csv(OUT_POS, index=False)
    pd.DataFrame(prepared_introductions).to_csv(OUT_INTRO, index=False)
    pd.DataFrame(prepared_commissions).to_csv(OUT_COMM, index=False)

    subs_by_id = {sub["id"]: sub for sub in subscriptions}
    # Build report summary
    extra_subs = [
        s
        for s in subscriptions
        if s["id"] not in matched_subscription_ids and s["id"] not in soft_matched_subscription_ids
    ]
    extra_positions = [p for p in positions if p["id"] not in matched_position_ids]
    missing_investors = [row for row in prepared_subs if row["investor_match_status"] != "MATCH"]
    missing_introducers = [row for row in prepared_introductions if row["introducer_match_status"] != "MATCH"]
    date_mismatches = [
        row
        for row in prepared_subs
        if str(row.get("subscription_match_status", "")).startswith("DATE_MISMATCH")
    ]

    report_lines = [
        "# VC112/VC143 Preparation Report",
        "",
        f"Source dashboard: {DASHBOARD_PATH}",
        "",
        f"Investor rows extracted: {len(investor_rows)}",
        f"Introducer rows extracted: {len(introducer_rows)}",
        f"Subscriptions prepared: {len(prepared_subs)}",
        f"Positions prepared (aggregated per investor): {len(prepared_pos)}",
        f"Introductions prepared: {len(prepared_introductions)}",
        f"Commissions prepared: {len(prepared_commissions)}",
        "",
        f"Rows with missing investor match: {len(missing_investors)}",
        f"Rows with missing introducer match: {len(missing_introducers)}",
        "",
        f"DB subscriptions not matched to dashboard rows: {len(extra_subs)}",
        f"DB positions not matched to dashboard rows: {len(extra_positions)}",
        "",
    ]

    if missing_investors:
        report_lines.append("## Missing investor matches (dashboard -> DB)")
        for row in missing_investors:
            report_lines.append(
                f"- {row['vc_code']} row {row['row_index']}: "
                f"{row.get('investor_first') or ''} {row.get('investor_last') or ''} "
                f"{row.get('investor_entity') or ''} => {row['investor_match_status']}"
            )
        report_lines.append("")

    if missing_introducers:
        report_lines.append("## Missing introducer matches (dashboard -> DB)")
        for row in missing_introducers:
            report_lines.append(
                f"- {row['vc_code']} row {row['row_index']}: "
                f"{row.get('introducer_name_mapped') or row.get('introducer_raw_name')} => {row['introducer_match_status']}"
            )
        report_lines.append("")

    if date_mismatches:
        report_lines.append("## Subscription date mismatches (same amounts, different dates)")
        for row in date_mismatches:
            sub_id = row.get("matched_subscription_id")
            db_date = subs_by_id.get(sub_id, {}).get("contract_date") if sub_id else None
            report_lines.append(
                f"- {row['vc_code']} row {row['row_index']}: "
                f"{row.get('investor_first') or ''} {row.get('investor_last') or ''} "
                f"{row.get('investor_entity') or ''} "
                f"dashboard_date {row.get('contract_date')} vs db_date {db_date} (sub_id {sub_id})"
            )
        report_lines.append("")

    if extra_subs:
        report_lines.append("## DB subscriptions not found in dashboard")
        for sub in extra_subs:
            report_lines.append(
                f"- sub_id {sub['id']} investor_id {sub['investor_id']} deal_id {sub['deal_id']} "
                f"commitment {sub.get('commitment')} shares {sub.get('num_shares')}"
            )
        report_lines.append("")

    if extra_positions:
        report_lines.append("## DB positions not found in dashboard")
        for pos in extra_positions:
            report_lines.append(
                f"- pos_id {pos['id']} investor_id {pos['investor_id']} vehicle_id {pos['vehicle_id']} units {pos.get('units')}"
            )
        report_lines.append("")

    OUT_REPORT.write_text("\n".join(report_lines))
    print(f"Wrote {OUT_REPORT}")


if __name__ == "__main__":
    main()
