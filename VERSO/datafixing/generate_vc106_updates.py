#!/usr/bin/env python3
"""Generate VC106 intro + commission inserts from reconciliation output.

Creates:
- vc106_missing_introductions.csv
- vc106_missing_commissions.csv
- vc106_db_updates_intro.sql
- vc106_db_updates_comm.sql
- vc106_db_updates_dedupe.sql
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pandas as pd

ENV_PATH = Path(".env.local")
INTRO_RECON_PATH = Path("VERSO/datafixing/vc106_intro_reconciliation.csv")

OUT_MISSING_INTRO = Path("VERSO/datafixing/vc106_missing_introductions.csv")
OUT_MISSING_COMM = Path("VERSO/datafixing/vc106_missing_commissions.csv")
OUT_INTRO_SQL = Path("VERSO/datafixing/vc106_db_updates_intro.sql")
OUT_COMM_SQL = Path("VERSO/datafixing/vc106_db_updates_comm.sql")
OUT_DEDUPE_SQL = Path("VERSO/datafixing/vc106_db_updates_dedupe.sql")

DEAL_ID = "07eff085-9f1d-4e02-b1e2-d717817503f1"
TODAY = date(2026, 1, 24).isoformat()
MONEY_SCALE = Decimal("0.01")


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


def to_decimal(value: object) -> Decimal | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def norm_decimal(value: Decimal | None) -> str | None:
    if value is None:
        return None
    normalized = value.normalize()
    text = format(normalized, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text or "0"


def round_money(value: Decimal | None) -> Decimal | None:
    if value is None:
        return None
    try:
        return value.quantize(MONEY_SCALE, rounding=ROUND_HALF_UP)
    except InvalidOperation:
        return value


def sql_decimal(value: Decimal | None) -> str:
    normalized = norm_decimal(value)
    return "NULL" if normalized is None else normalized


def sql_money(value: Decimal | None) -> str:
    return sql_decimal(round_money(value))


def pct_to_decimal(pct: Decimal | None) -> Decimal | None:
    if pct is None:
        return None
    if pct > 1:
        return pct / Decimal("100")
    return pct


def pct_to_bps(pct: Decimal | None) -> int | None:
    dec = pct_to_decimal(pct)
    if dec is None:
        return None
    return int(round(dec * Decimal("10000")))


def nonzero(value: Decimal | None) -> bool:
    return value is not None and value != 0


def build_intro_rows(df: pd.DataFrame) -> list[dict]:
    matched = df[
        (df["introducer_match_status"] == "MATCH")
        & (df["investor_match_status"].isin(["MATCH", "MATCH_BY_NUMBERS"]))
    ]
    intro_rows: dict[tuple[str, str], dict] = {}
    for _, row in matched.iterrows():
        key = (row["introducer_id"], row["investor_id"])
        introduced_at = row.get("contract_date") or TODAY
        current = intro_rows.get(key)
        if current:
            # keep earliest contract_date if multiple rows
            if current["introduced_at"] and introduced_at and str(introduced_at) < str(current["introduced_at"]):
                current["introduced_at"] = introduced_at
            continue
        intro_rows[key] = {
            "introducer_id": row["introducer_id"],
            "deal_id": DEAL_ID,
            "prospect_investor_id": row["investor_id"],
            "status": "allocated",
            "introduced_at": introduced_at,
            "introduction_exists": bool(row.get("introduction_exists")),
        }
    return list(intro_rows.values())


def build_expected_commissions(df: pd.DataFrame) -> list[dict]:
    matched = df[
        (df["introducer_match_status"] == "MATCH")
        & (df["investor_match_status"].isin(["MATCH", "MATCH_BY_NUMBERS"]))
    ]
    expected_rows: list[dict] = []
    for _, row in matched.iterrows():
        introducer_id = row["introducer_id"]
        investor_id = row["investor_id"]
        amount = to_decimal(row.get("amount_invested"))
        shares = to_decimal(row.get("num_shares")) or to_decimal(row.get("ownership_position"))
        sub_fee_pct = to_decimal(row.get("sub_fee_pct"))
        sub_fee_amt = to_decimal(row.get("sub_fee_amt"))
        spread_pps = to_decimal(row.get("spread_pps"))
        spread_fee_amt = to_decimal(row.get("spread_fee_amt"))
        perf_fee_1_pct = to_decimal(row.get("perf_fee_1_pct"))
        perf_fee_2_pct = to_decimal(row.get("perf_fee_2_pct"))

        # Invested amount commission
        if nonzero(sub_fee_pct) or nonzero(sub_fee_amt):
            rate_bps = pct_to_bps(sub_fee_pct) or 0
            accrual = sub_fee_amt
            if accrual is None and amount is not None and sub_fee_pct is not None:
                accrual = amount * pct_to_decimal(sub_fee_pct)
            accrual = round_money(accrual)
            if accrual is not None:
                expected_rows.append(
                    {
                        "introducer_id": introducer_id,
                        "deal_id": DEAL_ID,
                        "investor_id": investor_id,
                        "basis_type": "invested_amount",
                        "rate_bps": rate_bps,
                        "accrual_amount": accrual,
                        "threshold_multiplier": None,
                        "performance_threshold_type": None,
                    }
                )

        # Spread commission
        if nonzero(spread_fee_amt) or nonzero(spread_pps):
            accrual = spread_fee_amt
            if accrual is None and spread_pps is not None and shares is not None:
                accrual = spread_pps * shares
            accrual = round_money(accrual)
            if accrual is not None:
                expected_rows.append(
                    {
                        "introducer_id": introducer_id,
                        "deal_id": DEAL_ID,
                        "investor_id": investor_id,
                        "basis_type": "spread",
                        "rate_bps": 0,
                        "accrual_amount": accrual,
                        "threshold_multiplier": None,
                        "performance_threshold_type": None,
                    }
                )

        # Performance fees (tiers)
        for perf_pct in (perf_fee_1_pct, perf_fee_2_pct):
            if nonzero(perf_pct):
                rate_bps = pct_to_bps(perf_pct) or 0
                expected_rows.append(
                    {
                        "introducer_id": introducer_id,
                        "deal_id": DEAL_ID,
                        "investor_id": investor_id,
                        "basis_type": "performance_fee",
                        "rate_bps": rate_bps,
                        "accrual_amount": round_money(Decimal("0.0")),
                        "threshold_multiplier": Decimal("0.0"),
                        "performance_threshold_type": None,
                    }
                )

    return expected_rows


def build_missing_commissions(
    expected_rows: list[dict], existing_rows: list[dict]
) -> list[dict]:
    def keyify(row: dict) -> tuple:
        return (
            row["introducer_id"],
            row["investor_id"],
            row["basis_type"],
            row.get("rate_bps") or 0,
            norm_decimal(round_money(to_decimal(row.get("accrual_amount")))),
            norm_decimal(to_decimal(row.get("threshold_multiplier"))),
            row.get("performance_threshold_type"),
        )

    expected_counts = Counter(keyify(r) for r in expected_rows)
    existing_counts = Counter(keyify(r) for r in existing_rows)
    missing_counts = expected_counts - existing_counts

    if not missing_counts:
        return []

    remaining = dict(missing_counts)
    missing: list[dict] = []
    for row in expected_rows:
        key = keyify(row)
        if remaining.get(key, 0) > 0:
            missing.append(row)
            remaining[key] -= 1
    return missing


def write_intro_sql(rows: list[dict]) -> None:
    values = []
    for row in rows:
        if row.get("introduction_exists"):
            continue
        values.append(
            "("
            f"'{row['introducer_id']}'::uuid, "
            f"'{row['deal_id']}'::uuid, "
            f"'{row['prospect_investor_id']}'::uuid, "
            f"'{row['status']}', "
            f"'{row['introduced_at']}'::date"
            ")"
        )
    if not values:
        OUT_INTRO_SQL.write_text("-- No missing introductions\n")
        return
    sql = [
        "-- VC106 (VC6) missing introductions for partners/introducers",
        "with new_intro (introducer_id, deal_id, prospect_investor_id, status, introduced_at) as (",
        "  values",
        "    " + ",\n    ".join(values),
        ")",
        "insert into introductions (introducer_id, deal_id, prospect_investor_id, status, introduced_at)",
        "select v.introducer_id, v.deal_id, v.prospect_investor_id, v.status, v.introduced_at",
        "from new_intro v",
        "where not exists (",
        "  select 1 from introductions i",
        "  where i.introducer_id = v.introducer_id",
        "    and i.deal_id = v.deal_id",
        "    and i.prospect_investor_id = v.prospect_investor_id",
        ");",
    ]
    OUT_INTRO_SQL.write_text("\n".join(sql))


def write_comm_sql(rows: list[dict]) -> None:
    values = []
    for row in rows:
        perf_type = row.get("performance_threshold_type")
        perf_sql = "NULL::text" if perf_type is None else f"'{perf_type}'"
        threshold_val = to_decimal(row.get("threshold_multiplier"))
        threshold_sql = "NULL::numeric" if threshold_val is None else sql_decimal(threshold_val)
        values.append(
            "("
            f"'{row['introducer_id']}'::uuid, "
            f"'{row['deal_id']}'::uuid, "
            f"'{row['investor_id']}'::uuid, "
            f"'{row['basis_type']}', "
            f"{int(row.get('rate_bps') or 0)}, "
            f"{sql_money(to_decimal(row.get('accrual_amount')))}, "
            f"{threshold_sql}, "
            f"{perf_sql})"
        )
    if not values:
        OUT_COMM_SQL.write_text("-- No missing commissions\n")
        return
    sql = [
        "-- VC106 missing commissions for partners/introducers",
        "with new_comm (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount, threshold_multiplier, performance_threshold_type) as (",
        "  values",
        "    " + ",\n    ".join(values),
        ")",
        "insert into introducer_commissions (introducer_id, deal_id, investor_id, basis_type, rate_bps, accrual_amount,",
        "  threshold_multiplier, performance_threshold_type, currency, status, introduction_id)",
        "select v.introducer_id, v.deal_id, v.investor_id, v.basis_type, v.rate_bps, v.accrual_amount,",
        "  v.threshold_multiplier, v.performance_threshold_type,",
        "  'USD', 'accrued', i.id",
        "from new_comm v",
        "left join introductions i",
        "  on i.introducer_id = v.introducer_id",
        "  and i.deal_id = v.deal_id",
        "  and i.prospect_investor_id = v.investor_id;",
    ]
    OUT_COMM_SQL.write_text("\n".join(sql))


def write_dedupe_sql() -> None:
    sql = [
        "-- VC106 exact duplicate commissions (all fields except id/created_at)",
        "with ranked as (",
        "  select id,",
        "         row_number() over (",
        "           partition by introducer_id, deal_id, investor_id, basis_type, tier_number,",
        "                        rate_bps, accrual_amount, currency, status, introduction_id, base_amount",
        "           order by created_at, id",
        "         ) as rn",
        "  from introducer_commissions",
        f"  where deal_id = '{DEAL_ID}'::uuid",
        ")",
        "delete from introducer_commissions c",
        "using ranked r",
        "where c.id = r.id and r.rn > 1;",
    ]
    OUT_DEDUPE_SQL.write_text("\n".join(sql))


def main() -> None:
    env = load_env(ENV_PATH)
    supabase_url = (env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL") or "").rstrip("/")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise SystemExit("Missing Supabase URL/service key in .env.local")
    base = {"url": supabase_url, "key": supabase_key}

    if not INTRO_RECON_PATH.exists():
        raise SystemExit(f"Missing intro reconciliation CSV: {INTRO_RECON_PATH}")

    intro_df = pd.read_csv(INTRO_RECON_PATH)

    # Introductions
    intro_rows = build_intro_rows(intro_df)
    missing_intro = [r for r in intro_rows if not r.get("introduction_exists")]
    pd.DataFrame(missing_intro).to_csv(OUT_MISSING_INTRO, index=False)
    write_intro_sql(missing_intro)

    # Commissions
    expected_comm = build_expected_commissions(intro_df)
    existing_comm = fetch_all(
        base,
        "introducer_commissions",
        "introducer_id,deal_id,investor_id,basis_type,rate_bps,accrual_amount,threshold_multiplier,performance_threshold_type",
        {"deal_id": f"eq.{DEAL_ID}"},
    )
    missing_comm = build_missing_commissions(expected_comm, existing_comm)
    pd.DataFrame(missing_comm).to_csv(OUT_MISSING_COMM, index=False)
    write_comm_sql(missing_comm)

    # Dedupe script
    write_dedupe_sql()

    print(f"Missing introductions: {len(missing_intro)}")
    print(f"Missing commissions: {len(missing_comm)}")


if __name__ == "__main__":
    main()
