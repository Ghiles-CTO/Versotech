import json
from pathlib import Path

import pandas as pd


SUBSCRIPTION_JSON = Path("/tmp/subscription_data.json")
NEW_SUBSCRIPTIONS = Path("VERSO/datafixing/missing_subscriptions_to_insert.csv")
INVESTOR_LOOKUP = Path("VERSO/datafixing/missing_subscription_investors.json")


def _investor_name(info: dict) -> str:
    for key in ("display_name", "legal_name"):
        value = info.get(key)
        if value:
            return value
    first = info.get("first_name") or ""
    last = info.get("last_name") or ""
    full = f"{first} {last}".strip()
    return full if full else "Unknown Investor"


def _row_key(row: dict) -> tuple:
    return (
        row.get("Entity Code"),
        row.get("Investor Name"),
        row.get("Commitment"),
        row.get("Contract Date"),
    )


def main() -> None:
    existing = json.loads(SUBSCRIPTION_JSON.read_text())
    existing_keys = {_row_key(row) for row in existing}

    new_rows = pd.read_csv(NEW_SUBSCRIPTIONS)
    investors = json.loads(INVESTOR_LOOKUP.read_text())
    investor_map = {(row["investor_id"], row["vehicle_id"]): row for row in investors}

    appended = 0

    for _, sub in new_rows.iterrows():
        info = investor_map.get((sub["investor_id"], sub["vehicle_id"]))
        if not info:
            continue

        entry = {
            "Entity Code": info["entity_code"],
            "Investor Name": _investor_name(info),
            "Investor Type": info["investor_type"],
            "Commitment": float(sub["commitment"]) if not pd.isna(sub["commitment"]) else None,
            "Funded Amount": float(sub["commitment"]) if not pd.isna(sub["commitment"]) else None,
            "Shares": float(sub["num_shares"]) if not pd.isna(sub["num_shares"]) else None,
            "Contract Date": sub["contract_date"] if not pd.isna(sub["contract_date"]) else None,
        }

        key = _row_key(entry)
        if key in existing_keys:
            continue

        existing.append(entry)
        existing_keys.add(key)
        appended += 1

    SUBSCRIPTION_JSON.write_text(json.dumps(existing, indent=2))
    print(f"Appended {appended} rows to {SUBSCRIPTION_JSON}")


if __name__ == "__main__":
    main()
