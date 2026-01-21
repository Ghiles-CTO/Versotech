import json
import re
from pathlib import Path

import pandas as pd


INVESTOR_SUMMARY = Path("VERSO/datafixing/dashboard_investor_summary_extracted.csv")
MISSING_PAIRS = Path("VERSO/datafixing/missing_subscription_pairs.json")
OUT_CSV = Path("VERSO/datafixing/missing_subscriptions_to_insert.csv")
OUT_SQL = Path("VERSO/datafixing/missing_subscriptions_insert.sql")


def _norm(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return re.sub(r"[^a-z0-9]+", "", str(value).lower())


def _match_rows(inv_df, pair):
    vc = pair["vehicle_code"]
    df = inv_df[inv_df["vc_code"] == vc]
    matches = pd.DataFrame()

    legal = pair.get("investor_legal_name")
    display = pair.get("investor_display_name")
    first = pair.get("first_name")
    last = pair.get("last_name")

    if legal:
        matches = df[df["investor_entity"].fillna("").apply(_norm) == _norm(legal)]
    if matches.empty and display:
        matches = df[df["investor_entity"].fillna("").apply(_norm) == _norm(display)]
    if matches.empty and first and last:
        matches = df[
            (df["investor_first"].fillna("").apply(_norm) == _norm(first))
            & (df["investor_last"].fillna("").apply(_norm) == _norm(last))
        ]
    if matches.empty and legal:
        combined = _norm(legal)
        matches = df[(df["investor_first"].fillna("") + df["investor_last"].fillna("")).apply(_norm) == combined]

    if not matches.empty:
        matches = matches[matches["amount_invested"] > 0].copy()

    return matches


def _format_value(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return "null"
    if isinstance(value, (int, float)):
        return f"{value}"
    text = str(value).replace("'", "''")
    return f"'{text}'"


def _format_date(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return "null"
    return f"'{value}'"


def main():
    inv = pd.read_csv(INVESTOR_SUMMARY)
    with open(MISSING_PAIRS, "r") as f:
        missing = json.load(f)

    rows = []
    unmatched = []

    for pair in missing:
        matches = _match_rows(inv, pair)
        if matches.empty:
            unmatched.append(pair)
            continue

        matches = matches.drop_duplicates(
            subset=[
                "vc_code",
                "investor_first",
                "investor_last",
                "investor_entity",
                "amount_invested",
                "price_per_share",
                "num_shares",
                "contract_date",
            ]
        )

        for _, match in matches.iterrows():
            rows.append(
                {
                    "investor_id": pair["investor_id"],
                    "vehicle_id": pair["vehicle_id"],
                    "deal_id": pair["deal_id"],
                    "commitment": match["amount_invested"],
                    "currency": "USD",
                    "status": "funded",
                    "contract_date": match.get("contract_date"),
                    "subscription_date": match.get("contract_date"),
                    "price_per_share": match.get("price_per_share"),
                    "num_shares": match.get("num_shares"),
                    "subscription_fee_percent": match.get("subscription_fee_percent"),
                    "subscription_fee_amount": match.get("subscription_fee_amount"),
                    "spread_per_share": match.get("spread_per_share"),
                    "spread_fee_amount": match.get("spread_fee_amount"),
                    "opportunity_name": match.get("opportunity"),
                    "sourcing_contract_ref": match.get("sourcing_contract_ref"),
                }
            )

    pd.DataFrame(rows).to_csv(OUT_CSV, index=False)

    with OUT_SQL.open("w") as f:
        f.write("-- Generated from dashboard_investor_summary_extracted.csv\n")
        f.write("-- Inserts for missing subscriptions (commission pairs with no subscription)\n")
        f.write(
            "insert into subscriptions (\n"
            "  investor_id,\n"
            "  vehicle_id,\n"
            "  deal_id,\n"
            "  commitment,\n"
            "  currency,\n"
            "  status,\n"
            "  contract_date,\n"
            "  subscription_date,\n"
            "  price_per_share,\n"
            "  num_shares,\n"
            "  subscription_fee_percent,\n"
            "  subscription_fee_amount,\n"
            "  spread_per_share,\n"
            "  spread_fee_amount,\n"
            "  opportunity_name,\n"
            "  sourcing_contract_ref\n"
            ") values\n"
        )
        for idx, row in enumerate(rows):
            values = [
                _format_value(row["investor_id"]),
                _format_value(row["vehicle_id"]),
                _format_value(row["deal_id"]),
                _format_value(row["commitment"]),
                _format_value(row["currency"]),
                _format_value(row["status"]),
                _format_date(row["contract_date"]),
                _format_date(row["subscription_date"]),
                _format_value(row["price_per_share"]),
                _format_value(row["num_shares"]),
                _format_value(row.get("subscription_fee_percent")),
                _format_value(row.get("subscription_fee_amount")),
                _format_value(row.get("spread_per_share")),
                _format_value(row.get("spread_fee_amount")),
                _format_value(row.get("opportunity_name")),
                _format_value(row.get("sourcing_contract_ref")),
            ]
            suffix = "," if idx < len(rows) - 1 else ";"
            f.write("  (" + ", ".join(values) + ")" + suffix + "\n")

    if unmatched:
        print("Unmatched pairs:")
        for pair in unmatched:
            print(pair)


if __name__ == "__main__":
    main()
