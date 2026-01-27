#!/usr/bin/env python3
"""Verify VC106 subscriptions + positions vs VERSO dashboard (VC6 sheet).

Outputs:
- VERSO/datafixing/vc106_subscriptions_prepared.csv
- VERSO/datafixing/vc106_positions_prepared.csv
- VERSO/datafixing/vc106_subs_positions_report.md

No DB writes; analysis only.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd

ENV_PATH = Path(".env.local")
INVESTOR_SUMMARY = Path("VERSO/datafixing/dashboard_investor_summary_extracted.csv")
OUT_SUBS = Path("VERSO/datafixing/vc106_subscriptions_prepared.csv")
OUT_POS = Path("VERSO/datafixing/vc106_positions_prepared.csv")
OUT_REPORT = Path("VERSO/datafixing/vc106_subs_positions_report.md")

VC_CODE = "VC106"


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


def _normalize_text(value: object) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip().lower()
    if not text or text in {"nan", "none"}:
        return None
    return " ".join(text.split())


def _name_keys(first: object, last: object, entity: object) -> set[str]:
    keys: set[str] = set()
    if entity:
        ent = _normalize_text(entity)
        if ent:
            keys.add(ent)
    if first or last:
        if first and last:
            first_text = _normalize_text(first)
            last_text = _normalize_text(last)
            if first_text and last_text:
                variants = {f"{first_text} {last_text}", f"{last_text} {first_text}"}
                parts = _split_compound_name(first_text)
                if len(parts) >= 2:
                    variants.update(
                        {
                            f"{parts[0]} and {parts[1]} {last_text}",
                            f"{parts[1]} and {parts[0]} {last_text}",
                            f"{parts[0]} {parts[1]} {last_text}",
                            f"{parts[1]} {parts[0]} {last_text}",
                        }
                    )
                for variant in variants:
                    keys.add(_normalize_text(variant) or "")
        else:
            parts = [p for p in [_normalize_text(first), _normalize_text(last)] if p]
            if parts:
                keys.add(" ".join(parts))
    return keys


def _split_compound_name(value: str) -> list[str]:
    if not value:
        return []
    text = value.replace("&", " and ")
    parts = [p.strip() for p in text.split("and") if p.strip()]
    return parts or [value.strip()]


def _build_lookup(rows: list[dict], fields: list[str]) -> dict[str, list[dict]]:
    lookup: dict[str, list[dict]] = {}
    for row in rows:
        for field in fields:
            value = _normalize_text(row.get(field))
            if not value:
                continue
            lookup.setdefault(value, []).append(row)
    return lookup


def _to_numeric(value: object) -> float | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _close(a: float | None, b: float | None, tolerance: float) -> bool:
    if a is None or b is None:
        return False
    return abs(a - b) <= tolerance


@dataclass
class MatchResult:
    status: str
    ids: list[str]


def _match_by_keys(keys: set[str], lookup: dict[str, list[dict]]) -> MatchResult:
    matches: list[dict] = []
    for key in keys:
        matches.extend(lookup.get(key, []))
    unique = {row["id"] for row in matches}
    if not unique:
        return MatchResult("NO_MATCH", [])
    if len(unique) == 1:
        return MatchResult("MATCH", list(unique))
    return MatchResult("MULTI_MATCH", list(unique))


def main() -> None:
    env = load_env(ENV_PATH)
    supabase_url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL") or "").rstrip("/")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing Supabase URL/service key in .env.local")
    base = {"url": supabase_url, "key": supabase_key}

    if not INVESTOR_SUMMARY.exists():
        raise SystemExit(f"Missing {INVESTOR_SUMMARY}")

    df = pd.read_csv(INVESTOR_SUMMARY)
    df = df[df["vc_code"] == VC_CODE].copy()
    if df.empty:
        raise SystemExit(f"No VC106 rows found in {INVESTOR_SUMMARY}")
    df.insert(0, "row_index", range(1, len(df) + 1))

    vehicles = fetch_all(base, "vehicles", "id,entity_code", {"entity_code": "eq.VC106"})
    if not vehicles:
        raise SystemExit("VC106 vehicle not found in DB")
    vehicle_id = vehicles[0]["id"]
    deals = fetch_all(base, "deals", "id,vehicle_id", {"vehicle_id": f"eq.{vehicle_id}"})
    if not deals:
        raise SystemExit("VC106 deal not found in DB")
    deal_id = deals[0]["id"]

    subscriptions = fetch_all(
        base,
        "subscriptions",
        "id,deal_id,investor_id,commitment,num_shares,price_per_share,cost_per_share,contract_date,subscription_fee_percent,subscription_fee_amount,performance_fee_tier1_percent,performance_fee_tier1_threshold,performance_fee_tier2_percent,performance_fee_tier2_threshold,spread_per_share,spread_fee_amount,opportunity_name,sourcing_contract_ref",
        {"deal_id": f"eq.{deal_id}"},
    )
    positions = fetch_all(base, "positions", "id,investor_id,vehicle_id,units", {"vehicle_id": f"eq.{vehicle_id}"})
    investors = fetch_all(base, "investors", "id,display_name,legal_name,type")

    investor_lookup = _build_lookup(investors, ["legal_name", "display_name"])

    subscription_by_investor: dict[tuple[str, str], list[dict]] = {}
    for sub in subscriptions:
        subscription_by_investor.setdefault((sub["investor_id"], sub["deal_id"]), []).append(sub)

    position_by_investor: dict[tuple[str, str], list[dict]] = {}
    for pos in positions:
        position_by_investor.setdefault((pos["investor_id"], pos["vehicle_id"]), []).append(pos)

    prepared_subs: list[dict] = []
    prepared_pos: list[dict] = []
    matched_subscription_ids: set[str] = set()
    soft_matched_subscription_ids: set[str] = set()
    matched_position_ids: set[str] = set()
    position_aggregate: dict[tuple[str, str], dict] = {}
    row_records: list[dict] = []

    for _, row in df.iterrows():
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

        # if multiple matches, try to resolve using existing subs/positions
        if match.status == "MULTI_MATCH":
            candidate_ids = match.ids
            with_sub = [cid for cid in candidate_ids if (cid, deal_id) in subscription_by_investor]
            if len(with_sub) == 1:
                investor_id = with_sub[0]
                match = MatchResult("MATCH", [investor_id])
                match_note = "resolved_by_subscription"
            else:
                with_pos = [cid for cid in candidate_ids if (cid, vehicle_id) in position_by_investor]
                if len(with_pos) == 1:
                    investor_id = with_pos[0]
                    match = MatchResult("MATCH", [investor_id])
                    match_note = "resolved_by_position"

        # Fallback: match by subscription values when name match fails
        if investor_id is None:
            amount = _to_numeric(row.get("amount_invested"))
            row_shares = _to_numeric(row.get("num_shares") or row.get("ownership_position"))
            price = _to_numeric(row.get("price_per_share"))
            contract_date = row.get("contract_date")
            candidate_ids: list[str] = []
            for sub in subscriptions:
                commitment = _to_numeric(sub.get("commitment"))
                sub_shares = _to_numeric(sub.get("num_shares"))
                sub_price = _to_numeric(sub.get("price_per_share"))
                sub_date = sub.get("contract_date")
                if amount is not None and commitment is not None and abs(amount - commitment) > 0.05:
                    continue
                if row_shares is not None and sub_shares is not None and abs(row_shares - sub_shares) > 0.05:
                    continue
                if price is not None and sub_price is not None and abs(price - sub_price) > 0.0002:
                    continue
                if contract_date and sub_date and str(contract_date) != str(sub_date):
                    continue
                candidate_ids.append(sub["investor_id"])
            unique_ids = list(dict.fromkeys(candidate_ids))
            if len(unique_ids) == 1:
                investor_id = unique_ids[0]
                match = MatchResult("MATCH_BY_NUMBERS", [investor_id])
                match_note = "resolved_by_subscription_values"

        ownership = _to_numeric(row.get("ownership_position"))
        skip_reason = None
        if ownership is None or ownership == 0:
            skip_reason = "ownership_zero"

        row_records.append(
            {
                **row.to_dict(),
                "investor_match_status": match.status,
                "investor_match_note": match_note,
                "investor_id": investor_id,
                "vehicle_id": vehicle_id,
                "deal_id": deal_id,
                "skip_reason": skip_reason,
                "subscription_match_status": None,
                "matched_subscription_id": None,
            }
        )

        if investor_id and skip_reason is None:
            key = (investor_id, vehicle_id)
            entry = position_aggregate.get(key)
            if not entry:
                position_aggregate[key] = {
                    "vc_code": VC_CODE,
                    "sheet": row.get("sheet"),
                    "row_indices": [row.get("row_index")],
                    "investor_last": row.get("investor_last"),
                    "investor_first": row.get("investor_first"),
                    "investor_entity": row.get("investor_entity"),
                    "ownership_position": ownership or 0.0,
                    "investor_match_status": match.status,
                    "investor_match_note": match_note,
                    "investor_id": investor_id,
                    "vehicle_id": vehicle_id,
                }
            else:
                entry["row_indices"].append(row.get("row_index"))
                entry["ownership_position"] = (entry.get("ownership_position") or 0.0) + (ownership or 0.0)

    def _matches_subscription(row_data: dict, candidate: dict, require_date: bool) -> bool:
        commitment = _to_numeric(candidate.get("commitment"))
        num_shares = _to_numeric(candidate.get("num_shares"))
        price = _to_numeric(candidate.get("price_per_share"))
        if row_data.get("amount_invested") is not None and not _close(
            _to_numeric(row_data.get("amount_invested")), commitment, 0.05
        ):
            return False
        if row_data.get("num_shares") is not None and not _close(
            _to_numeric(row_data.get("num_shares")), num_shares, 0.05
        ):
            return False
        if row_data.get("price_per_share") is not None and not _close(
            _to_numeric(row_data.get("price_per_share")), price, 0.0002
        ):
            return False
        if require_date:
            contract = candidate.get("contract_date")
            if row_data.get("contract_date") and contract and str(row_data.get("contract_date")) != str(contract):
                return False
        return True

    rows_by_investor: dict[str | None, list[dict]] = {}
    for row_data in row_records:
        rows_by_investor.setdefault(row_data.get("investor_id"), []).append(row_data)

    for investor_id, rows in rows_by_investor.items():
        if not investor_id:
            for row_data in rows:
                row_data["subscription_match_status"] = "NO_INVESTOR_MATCH"
            continue
        candidates = subscription_by_investor.get((investor_id, deal_id), [])
        used: set[str] = set()

        # Pass 1: exact matches including date
        for row_data in rows:
            for candidate in candidates:
                if candidate["id"] in used:
                    continue
                if _matches_subscription(row_data, candidate, require_date=True):
                    row_data["subscription_match_status"] = "MATCH"
                    row_data["matched_subscription_id"] = candidate["id"]
                    used.add(candidate["id"])
                    matched_subscription_ids.add(candidate["id"])
                    break

        # Pass 2: value matches ignoring date
        for row_data in rows:
            if row_data.get("matched_subscription_id"):
                continue
            for candidate in candidates:
                if candidate["id"] in used:
                    continue
                if _matches_subscription(row_data, candidate, require_date=False):
                    row_data["subscription_match_status"] = "DATE_MISMATCH"
                    row_data["matched_subscription_id"] = candidate["id"]
                    used.add(candidate["id"])
                    soft_matched_subscription_ids.add(candidate["id"])
                    break

        # Pass 3: no match
        for row_data in rows:
            if row_data.get("subscription_match_status") is None:
                row_data["subscription_match_status"] = "NOT_FOUND"

    for row_data in row_records:
        prepared_subs.append(
            {
                **row_data,
                "should_insert": bool(
                    row_data.get("investor_id")
                    and row_data.get("deal_id")
                    and not row_data.get("matched_subscription_id")
                    and row_data.get("skip_reason") is None
                    and row_data.get("subscription_match_status") == "NOT_FOUND"
                ),
            }
        )

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

    subs_df = pd.DataFrame(prepared_subs)
    pos_df = pd.DataFrame(prepared_pos)

    def _key_amount(value: object) -> float | None:
        num = _to_numeric(value)
        if num is None:
            return None
        return round(num, 2)

    def _key_shares(value: object) -> float | None:
        num = _to_numeric(value)
        if num is None:
            return None
        return round(num, 3)

    subs_df["amount_key"] = subs_df["amount_invested"].apply(_key_amount)
    subs_df["shares_key"] = subs_df["num_shares"].apply(_key_shares)
    repeat_counts = (
        subs_df.dropna(subset=["investor_id", "amount_key", "shares_key"])
        .groupby(["investor_id", "amount_key", "shares_key"])["row_index"]
        .count()
    )
    repeat_keys = {key for key, count in repeat_counts.items() if count > 1}
    subs_df["repeat_group"] = subs_df.apply(
        lambda row: (row.get("investor_id"), row.get("amount_key"), row.get("shares_key")) in repeat_keys
        if row.get("investor_id") and row.get("amount_key") is not None and row.get("shares_key") is not None
        else False,
        axis=1,
    )
    subs_df.to_csv(OUT_SUBS, index=False)
    pos_df.to_csv(OUT_POS, index=False)

    extra_subs = [
        s for s in subscriptions if s["id"] not in matched_subscription_ids and s["id"] not in soft_matched_subscription_ids
    ]
    extra_positions = [p for p in positions if p["id"] not in matched_position_ids]

    report_lines = [
        "# VC106 Subscriptions & Positions Verification",
        "",
        f"Dashboard rows (VC6): {len(df)}",
        f"Prepared subscriptions: {len(subs_df)}",
        f"Prepared positions (aggregated): {len(pos_df)}",
        "",
        f"Subscriptions marked should_insert: {int(subs_df['should_insert'].sum())}",
        f"Positions marked should_insert: {int(pos_df['should_insert'].sum())}",
        "",
        f"DB subscriptions not matched to dashboard rows: {len(extra_subs)}",
        f"DB positions not matched to dashboard rows: {len(extra_positions)}",
        "",
        "## Dashboard repeated rows (same investor/amount/shares)",
    ]

    for _, row in subs_df.iterrows():
        if row.get("repeat_group"):
            report_lines.append(
                f"- row {row.get('row_index')}: {row.get('investor_entity') or row.get('investor_last')} "
                f"(matched_subscription_id {row.get('matched_subscription_id')})"
            )

    report_lines.append("")
    report_lines.append("## Subscription date mismatches (matching values, different dates)")
    for _, row in subs_df.iterrows():
        if str(row.get("subscription_match_status", "")).startswith("DATE_MISMATCH"):
            report_lines.append(
                f"- row {row.get('row_index')}: {row.get('investor_entity') or row.get('investor_last')} "
                f"(matched_subscription_id {row.get('matched_subscription_id')})"
            )

    if extra_subs:
        report_lines.append("")
        report_lines.append("## DB subscriptions not found in dashboard")
        for sub in extra_subs[:50]:
            report_lines.append(
                f"- {sub['id']} investor_id {sub.get('investor_id')} commitment {sub.get('commitment')} shares {sub.get('num_shares')} date {sub.get('contract_date')}"
            )
        if len(extra_subs) > 50:
            report_lines.append(f"- ... and {len(extra_subs) - 50} more")

    if extra_positions:
        report_lines.append("")
        report_lines.append("## DB positions not found in dashboard")
        for pos in extra_positions[:50]:
            report_lines.append(
                f"- {pos['id']} investor_id {pos.get('investor_id')} units {pos.get('units')}"
            )
        if len(extra_positions) > 50:
            report_lines.append(f"- ... and {len(extra_positions) - 50} more")

    OUT_REPORT.write_text("\n".join(report_lines))
    print(f"Wrote {OUT_SUBS}")
    print(f"Wrote {OUT_POS}")
    print(f"Wrote {OUT_REPORT}")


if __name__ == "__main__":
    main()
