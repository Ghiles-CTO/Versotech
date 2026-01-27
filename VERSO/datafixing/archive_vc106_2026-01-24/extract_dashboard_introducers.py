import argparse
import re
from pathlib import Path

import pandas as pd


DEFAULT_DASHBOARD_PATH = Path("VERSO/datafixing/VERSO DASHBOARD_V1.0.xlsx")
NAME_MAP_PATH = Path("VERSO/datafixing/introducers name change.csv")
DEFAULT_OUT_INTRODUCERS = Path("VERSO/datafixing/dashboard_introducer_summary_extracted.csv")
DEFAULT_OUT_INVESTORS = Path("VERSO/datafixing/dashboard_investor_summary_extracted.csv")


def _clean_str(value: object):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none"}:
        return None
    return text


def _clean_name(value: object):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)) and value == 0:
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none", "0", "0.0"}:
        return None
    return re.sub(r"\s+", " ", text)


def _build_name_map():
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
    # Manual aliases from client instructions
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


def _map_introducer_name(raw, name_map):
    if not raw:
        return None
    lowered = raw.lower()
    if "elevation" in lowered and "rick" in lowered:
        return "Rick"
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


def _sheet_to_vc_code(sheet):
    match = re.fullmatch(r"(VC|IN)(\d+)", sheet, re.IGNORECASE)
    if not match:
        return None
    prefix = match.group(1).upper()
    num = match.group(2)
    if len(num) <= 2:
        return f"{prefix}1{int(num):02d}"
    return f"{prefix}{num}"


def _find_header_row(df):
    for idx in range(min(10, len(df))):
        row = df.iloc[idx]
        for value in row:
            if _clean_str(value) and str(value).strip().lower() == "investor last name":
                return idx
    return None


def _match_header(value, needle):
    if not value:
        return False
    return value.strip().lower() == needle


def _find_col_index(header_map, label):
    label_lower = label.lower()
    for idx, name in header_map.items():
        if not name:
            continue
        if name.strip().lower() == label_lower:
            return idx
    return None


def _find_col_index_contains(header_map, needle):
    needle_lower = needle.lower()
    for idx, name in header_map.items():
        if not name:
            continue
        if needle_lower in name.strip().lower():
            return idx
    return None


def _is_numeric(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return False
    try:
        float(value)
        return True
    except (TypeError, ValueError):
        return False


def _to_numeric(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError:
        return None


def _to_date(value):
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


def _header_lower(header_map):
    return {idx: (name.strip().lower() if name else "") for idx, name in header_map.items()}


def _find_fee_columns(header_map, name_col):
    header_lower = _header_lower(header_map)
    targets = {
        "sub_fee_pct": lambda s: "subscription fees" in s and "%" in s,
        "sub_fee_amt": lambda s: "subscription fees" in s and "%" not in s,
        "spread_pps": lambda s: "spread pps" in s and "fees" not in s,
        "spread_fee_amt": lambda s: "spread pps" in s and "fees" in s,
    }
    found: dict[str, int | None] = {key: None for key in targets}
    for offset in range(1, 15):
        idx = name_col + offset
        if idx not in header_lower:
            continue
        label = header_lower[idx]
        for key, matcher in targets.items():
            if found[key] is None and matcher(label):
                found[key] = idx
    return found


def _find_group_label(group_row, header_row, name_idx):
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
    header_label = _clean_str(header_row[name_idx]) if name_idx < len(header_row) else None
    if header_label:
        lowered = header_label.lower()
        if "partner" in lowered:
            return "PARTNERS"
        if "introducer" in lowered:
            return "INTRODUCERS"
    return None


def extract(dashboard_path: Path, out_introducers: Path, out_investors: Path):
    name_map = _build_name_map()
    xl = pd.ExcelFile(dashboard_path)

    introducer_rows: list[dict[str, object]] = []
    investor_rows: list[dict[str, object]] = []

    for sheet in xl.sheet_names:
        vc_code = _sheet_to_vc_code(sheet)
        if not vc_code:
            continue

        df_raw = pd.read_excel(dashboard_path, sheet_name=sheet, header=None)
        header_row_idx = _find_header_row(df_raw)
        if header_row_idx is None:
            continue

        header_row = df_raw.iloc[header_row_idx].tolist()
        group_row = df_raw.iloc[header_row_idx - 1].tolist() if header_row_idx > 0 else [None] * len(header_row)
        header_map = {idx: _clean_str(value) for idx, value in enumerate(header_row)}

        name_col_idxs = [
            idx
            for idx, name in header_map.items()
            if name and name.strip().lower() in {"names", "name", "partners", "partner", "introducers", "introducer", "bi"}
        ]

        name_col_group: dict[int, str] = {}
        for idx in name_col_idxs:
            label = _find_group_label(group_row, header_row, idx)
            if label:
                name_col_group[idx] = label

        if len(name_col_group) != len(name_col_idxs) and name_col_idxs:
            # Fallback: assign by order if group labels are missing.
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
        cost_col = _find_col_index(header_map, "Cost per Share")
        final_cost_col = _find_col_index(header_map, "Final Cost per Share")
        price_col = _find_col_index(header_map, "Price per Share")
        shares_col = _find_col_index(header_map, "Number of shares invested")
        ownership_col = _find_col_index_contains(header_map, "ownership")
        contract_date_col = _find_col_index(header_map, "Contract Date")
        spread_pps_col = _find_col_index(header_map, "Spread PPS")
        spread_fee_col = _find_col_index(header_map, "Spread PPS Fees")
        sub_fee_pct_col = _find_col_index(header_map, "Subscription fees %")
        sub_fee_amt_col = _find_col_index(header_map, "Subscription fees")
        sourcing_ref_col = _find_col_index(header_map, "Sourcing Contract ref")
        opportunity_col = _find_col_index(header_map, "Opportunity")
        vehicle_col = _find_col_index(header_map, "Vehicle")

        for row_idx in range(header_row_idx + 1, len(df_raw)):
            row = df_raw.iloc[row_idx].tolist()

            investor_last = _clean_name(row[investor_last_col]) if investor_last_col is not None else None
            investor_first = _clean_name(row[investor_first_col]) if investor_first_col is not None else None
            investor_entity = _clean_name(row[investor_entity_col]) if investor_entity_col is not None else None
            if not investor_last and not investor_first and not investor_entity:
                continue

            amount_val = row[amount_col] if amount_col is not None and amount_col < len(row) else None
            amount_num = _to_numeric(amount_val) if _is_numeric(amount_val) else None
            shares_num = _to_numeric(row[shares_col]) if shares_col is not None else None
            ownership_num = _to_numeric(row[ownership_col]) if ownership_col is not None else None

            has_amount = amount_num is not None and amount_num != 0
            has_shares = shares_num is not None and shares_num != 0
            has_ownership = ownership_num is not None and ownership_num != 0

            if has_amount or has_shares or has_ownership:
                investor_rows.append(
                    {
                        "vc_code": vc_code,
                        "sheet": sheet,
                        "investor_last": investor_last,
                        "investor_first": investor_first,
                        "investor_entity": investor_entity,
                        "amount_invested": amount_num,
                        "cost_per_share": _to_numeric(row[cost_col]) if cost_col is not None else None,
                        "final_cost_per_share": _to_numeric(row[final_cost_col]) if final_cost_col is not None else None,
                        "price_per_share": _to_numeric(row[price_col]) if price_col is not None else None,
                        "num_shares": shares_num,
                        "ownership_position": ownership_num,
                        "contract_date": _to_date(row[contract_date_col]) if contract_date_col is not None else None,
                        "subscription_fee_percent": _to_numeric(row[sub_fee_pct_col]) if sub_fee_pct_col is not None else None,
                        "subscription_fee_amount": _to_numeric(row[sub_fee_amt_col]) if sub_fee_amt_col is not None else None,
                        "spread_per_share": _to_numeric(row[spread_pps_col]) if spread_pps_col is not None else None,
                        "spread_fee_amount": _to_numeric(row[spread_fee_col]) if spread_fee_col is not None else None,
                        "sourcing_contract_ref": _clean_str(row[sourcing_ref_col]) if sourcing_ref_col is not None else None,
                        "opportunity": _clean_str(row[opportunity_col]) if opportunity_col is not None else None,
                        "vehicle": _clean_str(row[vehicle_col]) if vehicle_col is not None else None,
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
                        "group_label": name_col_group.get(name_col),
                        "raw_name": raw_name,
                        "introducer_name_mapped": mapped,
                        "sub_fee_amt": _to_numeric(row[fees.get("sub_fee_amt")]) if fees.get("sub_fee_amt") is not None else None,
                        "spread_fee_amt": _to_numeric(row[fees.get("spread_fee_amt")]) if fees.get("spread_fee_amt") is not None else None,
                        "sub_fee_pct": _to_numeric(row[fees.get("sub_fee_pct")]) if fees.get("sub_fee_pct") is not None else None,
                        "spread_pps": _to_numeric(row[fees.get("spread_pps")]) if fees.get("spread_pps") is not None else None,
                        "investor_last": investor_last,
                        "investor_first": investor_first,
                        "investor_entity": investor_entity,
                        "amount_invested": amount_num,
                        "price_per_share": _to_numeric(row[price_col]) if price_col is not None else None,
                        "num_shares": shares_num,
                        "ownership_position": ownership_num,
                    }
                )

    pd.DataFrame(investor_rows).to_csv(out_investors, index=False)
    pd.DataFrame(introducer_rows).to_csv(out_introducers, index=False)


def _parse_args():
    parser = argparse.ArgumentParser(description="Extract dashboard introducers/investors.")
    parser.add_argument("--dashboard", type=Path, default=DEFAULT_DASHBOARD_PATH)
    parser.add_argument("--out-introducers", type=Path, default=DEFAULT_OUT_INTRODUCERS)
    parser.add_argument("--out-investors", type=Path, default=DEFAULT_OUT_INVESTORS)
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    extract(args.dashboard, args.out_introducers, args.out_investors)
