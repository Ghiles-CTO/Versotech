import csv
import json
from collections import defaultdict
from pathlib import Path


DASHBOARD_PATH = Path("VERSO/datafixing/dashboard_introducer_summary_extracted.csv")
COMMISSION_PATH = Path("datamigration/commission_data_export.json")
OUTPUT_PATH = Path("VERSO/datafixing/dashboard_vs_db_intro_mismatches.csv")

VC133_RULE_INTRODUCER = "Rick"
VC133_RULE_SUB_FEE_SHARE = 0.05
VC133_RULE_SPREAD_PPS = 150.0


def _to_float(value):
    if value is None:
        return 0.0
    text = str(value).strip()
    if not text:
        return 0.0
    try:
        return float(text)
    except ValueError:
        return 0.0


def _investor_key(row):
    entity = (row.get("investor_entity") or "").strip()
    if entity:
        return entity.lower()
    first = (row.get("investor_first") or "").strip()
    last = (row.get("investor_last") or "").strip()
    full = f"{first} {last}".strip()
    return full.lower() if full else None


def _aggregate_dashboard():
    totals = defaultdict(
        lambda: {"sub": 0.0, "spread": 0.0, "name": None}
    )
    vc133_subscriptions = {}

    with DASHBOARD_PATH.open(newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            vc_code = (row.get("vc_code") or "").strip().upper()
            if not vc_code:
                continue

            if vc_code == "VC133":
                investor_key = _investor_key(row)
                if not investor_key:
                    continue
                amount_invested = _to_float(row.get("amount_invested"))
                num_shares = _to_float(row.get("num_shares"))
                sub_fee_pct = _to_float(row.get("sub_fee_pct"))
                subscription_key = (
                    investor_key,
                    round(amount_invested, 6),
                    round(num_shares, 6),
                )
                existing_pct = vc133_subscriptions.get(subscription_key)
                if existing_pct is None or sub_fee_pct > existing_pct:
                    vc133_subscriptions[subscription_key] = sub_fee_pct
                continue

            name = (row.get("introducer_name_mapped") or "").strip()
            if not name:
                continue
            sub_fee = _to_float(row.get("sub_fee_amt"))
            spread_fee = _to_float(row.get("spread_fee_amt"))

            key = (vc_code, name.lower())
            totals[key]["sub"] += sub_fee
            totals[key]["spread"] += spread_fee
            totals[key]["name"] = name

    if vc133_subscriptions:
        key = ("VC133", VC133_RULE_INTRODUCER.lower())
        for subscription_key, sub_fee_pct in vc133_subscriptions.items():
            _, amount_invested, num_shares = subscription_key
            sub_fee_amt = amount_invested * sub_fee_pct * VC133_RULE_SUB_FEE_SHARE
            spread_fee_amt = num_shares * VC133_RULE_SPREAD_PPS
            totals[key]["sub"] += sub_fee_amt
            totals[key]["spread"] += spread_fee_amt
        totals[key]["name"] = VC133_RULE_INTRODUCER

    return totals


def _aggregate_db():
    totals = defaultdict(
        lambda: {"sub": 0.0, "spread": 0.0, "name": None}
    )
    data = json.loads(COMMISSION_PATH.read_text())

    for row in data:
        vc_code = (row.get("entity_code") or "").strip().upper()
        name = (row.get("introducer") or "").strip()
        if not vc_code or not name:
            continue
        fee_type = row.get("fee_type")
        amount = _to_float(row.get("commission_amount"))
        key = (vc_code, name.lower())
        if fee_type == "invested_amount":
            totals[key]["sub"] += amount
        elif fee_type == "spread":
            totals[key]["spread"] += amount
        totals[key]["name"] = name

    return totals


def _write_mismatches(dashboard_totals, db_totals):
    keys = sorted(set(dashboard_totals.keys()) | set(db_totals.keys()))
    with OUTPUT_PATH.open("w", newline="") as f:
        fieldnames = [
            "vc_code",
            "introducer_name_mapped",
            "dash_sub_fee",
            "db_sub_fee",
            "sub_fee_diff",
            "dash_spread",
            "db_spread",
            "spread_diff",
            "mismatch",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for vc_code, name_key in keys:
            dash_entry = dashboard_totals.get(
                (vc_code, name_key), {"sub": 0.0, "spread": 0.0, "name": None}
            )
            db_entry = db_totals.get(
                (vc_code, name_key), {"sub": 0.0, "spread": 0.0, "name": None}
            )
            dash_sub = float(dash_entry["sub"])
            dash_spread = float(dash_entry["spread"])
            db_sub = float(db_entry["sub"])
            db_spread = float(db_entry["spread"])
            sub_diff = db_sub - dash_sub
            spread_diff = db_spread - dash_spread
            mismatch = abs(sub_diff) > 1 or abs(spread_diff) > 1
            name = dash_entry["name"] or db_entry["name"] or name_key
            writer.writerow(
                {
                    "vc_code": vc_code,
                    "introducer_name_mapped": name,
                    "dash_sub_fee": dash_sub,
                    "db_sub_fee": db_sub,
                    "sub_fee_diff": sub_diff,
                    "dash_spread": dash_spread,
                    "db_spread": db_spread,
                    "spread_diff": spread_diff,
                    "mismatch": mismatch,
                }
            )


def main():
    dashboard_totals = _aggregate_dashboard()
    db_totals = _aggregate_db()
    _write_mismatches(dashboard_totals, db_totals)
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
