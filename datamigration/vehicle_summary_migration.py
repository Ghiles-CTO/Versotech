#!/usr/bin/env python3
"""
Vehicle Summary Data Migration Script
=====================================
Extracts per-investor share data from VERSO DASHBOARD and generates SQL
to update subscriptions (num_shares, price_per_share) and positions (units).

Based on the migration plan:
- Phase 1: Vehicle currency and status updates
- Phase 2: Global Custody position update (VC106)
- Phase 3: Per-investor subscription and position updates

Data mapping:
- "Number of shares invested" → subscriptions.num_shares (shares BOUGHT)
- "OWNERSHIP POSITION" → positions.units (shares CURRENTLY OWNED)
- "Price per Share" → subscriptions.price_per_share
- "Amount invested" → subscriptions.funded_amount
"""

import pandas as pd
import json
import os
from datetime import datetime
from typing import Optional, Dict, List, Any, Tuple
from decimal import Decimal

# Configuration
EXCEL_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/VERSO DASHBOARD_V1.0.xlsx"
OUTPUT_SQL = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/vehicle_summary_migration.sql"
OUTPUT_JSON = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/vehicle_summary_extracted.json"

# Dashboard sheet name -> DB entity_code
SHEET_MAPPING = {
    "JM": "IN101",
    "JM 102": "IN102",
    "JM103": "IN103",
    "JM 106": "IN106",
    "JM 109": "IN109",
    "JM 110": "IN110",
    "JM 111": "IN111",
    "VC2": "VC102",
    "VC6": "VC106",
    "VC11": "VC111",
    "VC12": "VC112",
    "VC13": "VC113",
    "VC14": "VC114",
    "VC18": "VC118",
    "VC21": "VC121",
    "VC22": "VC122",
    "VC23": "VC123",
    "VC24": "VC124",
    "VC25": "VC125",
    "VC26": "VC126",
    "VC28": "VC128",
    "VC30": "VC130",
    "VC31": "VC131",
    "VC32": "VC132",
    "VC33": "VC133",
    "VC38": "VC138",
    "VC40": "VC140",
    "VC41": "VC141",
    "VC43": "VC143",
}

# Vehicles requiring currency corrections (from plan)
CURRENCY_CORRECTIONS = {
    "IN110": "ETH",
    "VC121": "CHF",
    "VC125": "EUR",
    "VC128": "GBP",
    "VC141": "EUR",
}

# Column positions will be detected dynamically per sheet
# These are the header names to look for
HEADER_PATTERNS = {
    'last_name': ['investor last name', 'last name'],
    'middle_name': ['investor middle name', 'middle name'],
    'first_name': ['investor first name', 'first name'],
    'entity': ['investor entity', 'entity'],
    'vehicle': ['vehicle'],
    'amount_invested': ['amount invested', 'amount'],
    'price_per_share': ['price per share', 'price'],
    'shares': ['number of shares invested', 'number of shares', 'shares invested', 'shares'],
    'ownership': ['ownership position', 'ownership'],
    'contract_ref': ['sourcing contract ref', 'contract ref'],
}


def detect_columns(df: pd.DataFrame) -> Tuple[int, Dict[str, int]]:
    """
    Detect column positions by finding headers.
    Returns (header_row, column_map).
    """
    header_row = None
    col_map = {}

    # Search first 5 rows for headers
    for i in range(min(5, df.shape[0])):
        for j in range(min(30, df.shape[1])):
            val = str(df.iloc[i, j]).lower().strip() if pd.notna(df.iloc[i, j]) else ''

            # Check against patterns
            for field, patterns in HEADER_PATTERNS.items():
                for pattern in patterns:
                    if pattern in val and field not in col_map:
                        col_map[field] = j
                        if header_row is None or i == header_row:
                            header_row = i
                        break

    # Default header row if not found
    if header_row is None:
        header_row = 1

    return header_row, col_map


def safe_float(val) -> Optional[float]:
    """Convert value to float, return None if invalid."""
    if pd.isna(val):
        return None
    try:
        result = float(val)
        return result if result != 0 else 0.0  # Allow 0 for ownership position
    except (ValueError, TypeError):
        return None


def safe_string(val) -> Optional[str]:
    """Convert value to string, return None if empty."""
    if pd.isna(val):
        return None
    s = str(val).strip()
    return s if s and s.lower() not in ('nan', 'none', '') else None


def escape_sql(val) -> str:
    """Escape SQL string."""
    if val is None:
        return ""
    return str(val).replace("'", "''")


def extract_investor_data(df: pd.DataFrame, row_idx: int, entity_code: str, col_map: Dict[str, int]) -> Optional[Dict]:
    """
    Extract investor data from a row in the dashboard.
    Returns dict with all investor details needed for matching and updating.
    """
    def get_val(col_key):
        col_idx = col_map.get(col_key)
        if col_idx is not None and col_idx < df.shape[1]:
            return df.iloc[row_idx, col_idx]
        return None

    # Get investor identifiers
    last_name = safe_string(get_val('last_name'))
    first_name = safe_string(get_val('first_name'))
    entity = safe_string(get_val('entity'))
    certificate = safe_string(get_val('certificates'))

    # Must have at least one identifier
    if not any([last_name, first_name, entity]):
        return None

    # Get share data
    amount_invested = safe_float(get_val('amount_invested'))
    price_per_share = safe_float(get_val('price_per_share'))
    num_shares = safe_float(get_val('shares'))
    ownership_position = safe_float(get_val('ownership'))
    cost_per_share = safe_float(get_val('cost_per_share'))

    # Must have at least some share data
    if amount_invested is None and num_shares is None:
        return None

    # Build investor display name for matching
    if entity and not last_name:
        display_name = entity
    elif last_name and first_name:
        display_name = f"{first_name} {last_name}"
    elif last_name:
        display_name = last_name
    elif first_name:
        display_name = first_name
    else:
        display_name = entity or "Unknown"

    return {
        'row_index': row_idx,
        'entity_code': entity_code,
        'last_name': last_name,
        'first_name': first_name,
        'entity': entity,
        'display_name': display_name,
        'certificate': certificate,
        'amount_invested': amount_invested,
        'price_per_share': price_per_share,
        'num_shares': num_shares,
        'ownership_position': ownership_position,
        'cost_per_share': cost_per_share,
    }


def find_data_rows(df: pd.DataFrame, col_map: Dict[str, int], header_row: int) -> Tuple[int, int]:
    """
    Find the data row range in a sheet.
    Returns (start_row, end_row).
    """
    # Data starts after header
    start_row = header_row + 1

    # Get column indices for checking empty rows
    last_name_col = col_map.get('last_name')
    entity_col = col_map.get('entity')
    first_name_col = col_map.get('first_name')

    # Find end by looking for empty rows in the investor name columns
    end_row = df.shape[0]
    for i in range(start_row, df.shape[0]):
        # Check if all identifier columns are empty
        has_data = False

        if last_name_col is not None and last_name_col < df.shape[1]:
            val = df.iloc[i, last_name_col]
            if pd.notna(val) and str(val).strip():
                has_data = True

        if entity_col is not None and entity_col < df.shape[1]:
            val = df.iloc[i, entity_col]
            if pd.notna(val) and str(val).strip():
                has_data = True

        if first_name_col is not None and first_name_col < df.shape[1]:
            val = df.iloc[i, first_name_col]
            if pd.notna(val) and str(val).strip():
                has_data = True

        if not has_data:
            # Check if the next few rows are also empty (to avoid gaps)
            empty_streak = True
            for check_row in range(i, min(i + 3, df.shape[0])):
                for col in [last_name_col, entity_col, first_name_col]:
                    if col is not None and col < df.shape[1]:
                        val = df.iloc[check_row, col]
                        if pd.notna(val) and str(val).strip():
                            empty_streak = False
                            break
                if not empty_streak:
                    break
            if empty_streak:
                end_row = i
                break

    return start_row, end_row


def extract_sheet(xlsx: pd.ExcelFile, sheet_name: str, entity_code: str) -> List[Dict]:
    """
    Extract all investor data from a single sheet.
    """
    print(f"\n=== Processing: {sheet_name} -> {entity_code} ===")

    try:
        df = pd.read_excel(xlsx, sheet_name=sheet_name, header=None)
    except Exception as e:
        print(f"  ERROR reading sheet: {e}")
        return []

    print(f"  Sheet dimensions: {df.shape[0]} rows x {df.shape[1]} cols")

    # Detect column positions
    header_row, col_map = detect_columns(df)
    print(f"  Header row: {header_row}")
    print(f"  Columns found: {list(col_map.keys())}")

    # Check if we have minimum required columns
    if 'last_name' not in col_map and 'entity' not in col_map and 'first_name' not in col_map:
        print(f"  WARNING: No investor identifier columns found!")
        return []

    start_row, end_row = find_data_rows(df, col_map, header_row)
    print(f"  Data rows: {start_row} to {end_row}")

    records = []
    for i in range(start_row, end_row):
        investor_data = extract_investor_data(df, i, entity_code, col_map)
        if investor_data:
            records.append(investor_data)

    print(f"  Extracted {len(records)} investor records")
    return records


def build_investor_match_condition(rec: Dict, include_amount: bool = True) -> str:
    """
    Build SQL condition to match an investor and subscription.
    Uses multiple strategies for robust matching.
    Returns SQL condition string.
    """
    investor_conditions = []

    last_name = rec.get('last_name')
    first_name = rec.get('first_name')
    entity = rec.get('entity')
    amount = rec.get('amount_invested')

    # Strategy 1: Match by last_name (most reliable for individuals)
    if last_name and len(last_name.strip()) > 1:
        clean_last = escape_sql(last_name.strip().upper())
        investor_conditions.append(f"UPPER(i.last_name) = '{clean_last}'")
        # Also try matching in legal_name for corporate investors
        investor_conditions.append(f"UPPER(i.legal_name) LIKE '%{clean_last}%'")

    # Strategy 2: Match by entity name (for companies)
    if entity and len(entity.strip()) > 3:
        # Skip if entity looks like a vehicle code
        if not entity.startswith('VC') and not entity.startswith('IN'):
            clean_entity = escape_sql(entity.strip().upper())
            investor_conditions.append(f"UPPER(i.legal_name) LIKE '%{clean_entity}%'")

    # Strategy 3: Match by first_name in legal_name (for entities stored as first_name)
    if first_name and len(first_name.strip()) > 3:
        clean_first = escape_sql(first_name.strip().upper())
        investor_conditions.append(f"UPPER(i.legal_name) LIKE '%{clean_first}%'")
        # Also try first_name column if exists
        investor_conditions.append(f"UPPER(i.first_name) = '{clean_first}'")

    if not investor_conditions:
        return "1=0"  # No match possible

    investor_clause = "(" + " OR ".join(investor_conditions) + ")"

    # Add commitment amount for unique subscription matching
    if include_amount and amount and amount > 0:
        # Use a tolerance range for amount matching (±0.01)
        return f"{investor_clause} AND (s.commitment = {amount} OR s.funded_amount = {amount})"
    else:
        return investor_clause


def aggregate_positions_by_investor(records: List[Dict]) -> Dict[str, Dict]:
    """
    Aggregate ownership positions by investor for a vehicle.
    Returns dict: investor_key -> {display_name, total_ownership, match_condition}
    """
    from collections import defaultdict

    investor_data = defaultdict(lambda: {
        'display_name': '',
        'total_ownership': 0.0,
        'records': []
    })

    for rec in records:
        # Create a key based on investor identifiers
        last_name = rec.get('last_name', '').strip().upper() if rec.get('last_name') else ''
        entity = rec.get('entity', '').strip().upper() if rec.get('entity') else ''
        first_name = rec.get('first_name', '').strip().upper() if rec.get('first_name') else ''

        # Use the most specific identifier as key
        if last_name:
            key = f"LAST:{last_name}"
        elif entity and not entity.startswith('VC') and not entity.startswith('IN'):
            key = f"ENTITY:{entity}"
        elif first_name:
            key = f"FIRST:{first_name}"
        else:
            continue  # Skip if no identifier

        investor_data[key]['display_name'] = rec.get('display_name', 'Unknown')
        ownership = rec.get('ownership_position')
        if ownership is not None:
            investor_data[key]['total_ownership'] += ownership
        investor_data[key]['records'].append(rec)

    return dict(investor_data)


def generate_sql(all_records: Dict[str, List[Dict]]) -> List[str]:
    """
    Generate SQL migration statements for all extracted data.
    """
    sql_lines = []

    # Header
    sql_lines.append("-- ============================================")
    sql_lines.append("-- Vehicle Summary Data Migration")
    sql_lines.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_lines.append("-- ============================================")
    sql_lines.append("")

    # Phase 1: Backup queries (as comments)
    sql_lines.append("-- PHASE 1: BACKUP QUERIES (run these first to verify)")
    sql_lines.append("-- Copy results before running updates!")
    sql_lines.append("-- ")
    sql_lines.append("-- SELECT v.entity_code, s.id, s.num_shares, s.price_per_share, s.funded_amount")
    sql_lines.append("-- FROM subscriptions s JOIN vehicles v ON v.id = s.vehicle_id")
    sql_lines.append("-- WHERE v.entity_code IN ('VC106', 'VC109', 'IN110', 'VC121', 'VC125', 'VC128', 'VC141');")
    sql_lines.append("-- ")
    sql_lines.append("-- SELECT v.entity_code, p.id, p.investor_id, p.units")
    sql_lines.append("-- FROM positions p JOIN vehicles v ON v.id = p.vehicle_id")
    sql_lines.append("-- WHERE v.entity_code IN ('VC106', 'VC109', 'IN110', 'VC121', 'VC125', 'VC128', 'VC141');")
    sql_lines.append("")

    # Phase 2: Vehicle currency and status updates
    sql_lines.append("-- ============================================")
    sql_lines.append("-- PHASE 2: Vehicle Currency and Status Updates")
    sql_lines.append("-- ============================================")
    sql_lines.append("")

    for entity_code, currency in CURRENCY_CORRECTIONS.items():
        sql_lines.append(f"-- {entity_code}: Set currency to {currency}")
        sql_lines.append(f"UPDATE vehicles SET currency = '{currency}' WHERE entity_code = '{entity_code}';")
        sql_lines.append("")

    # VC109 exclusion
    sql_lines.append("-- VC109: Mark as CLOSED (excluded per client comment)")
    sql_lines.append("UPDATE vehicles SET status = 'CLOSED' WHERE entity_code = 'VC109';")
    sql_lines.append("")

    # Phase 3: Global Custody position update (VC106)
    sql_lines.append("-- ============================================")
    sql_lines.append("-- PHASE 3: Global Custody Position Update (VC106)")
    sql_lines.append("-- They fully exited - OWNERSHIP POSITION = 0")
    sql_lines.append("-- ============================================")
    sql_lines.append("")
    sql_lines.append("""-- Update Global Custody's position to 0 (they sold all shares)
UPDATE positions
SET units = 0
WHERE investor_id = '35af0245-05fb-4d6c-b17e-64d0d6b180f0'  -- Global Custody & Clearing Limited
  AND vehicle_id = (SELECT id FROM vehicles WHERE entity_code = 'VC106');
""")

    # Phase 4: Per-investor updates
    sql_lines.append("-- ============================================")
    sql_lines.append("-- PHASE 4: Per-Investor Subscription & Position Updates")
    sql_lines.append("-- ============================================")
    sql_lines.append("")

    stats = {
        "total_records": 0,
        "subscription_updates": 0,
        "position_updates": 0,
        "skipped_no_match": 0,
    }

    for entity_code, records in all_records.items():
        if not records:
            continue

        sql_lines.append(f"-- ----------------------------------------")
        sql_lines.append(f"-- {entity_code}: {len(records)} investors")
        sql_lines.append(f"-- ----------------------------------------")
        sql_lines.append("")

        for rec in records:
            stats["total_records"] += 1
            row_idx = rec.get('row_index', '?')
            display_name = rec.get('display_name', 'Unknown')

            # Build match condition
            match_condition = build_investor_match_condition(rec)

            # Get update values
            num_shares = rec.get('num_shares')
            price_per_share = rec.get('price_per_share')
            amount_invested = rec.get('amount_invested')
            ownership = rec.get('ownership_position')

            # Generate subscription update if we have share data
            if num_shares is not None or price_per_share is not None or amount_invested is not None:
                update_parts = []
                if num_shares is not None:
                    update_parts.append(f"num_shares = {num_shares}")
                if price_per_share is not None:
                    update_parts.append(f"price_per_share = {price_per_share}")
                if amount_invested is not None:
                    update_parts.append(f"funded_amount = {amount_invested}")

                if update_parts:
                    sql_lines.append(f"-- Row {row_idx}: {escape_sql(display_name)}")
                    sql_lines.append(f"-- shares: {num_shares}, price: {price_per_share}, amount: {amount_invested}")
                    sql_lines.append(f"""UPDATE subscriptions s
SET {', '.join(update_parts)}
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = '{entity_code}'
  AND ({match_condition});
""")
                    stats["subscription_updates"] += 1

            # Position updates are handled separately after subscription updates
            # (aggregated by investor)

        # Generate aggregated position updates for this vehicle
        aggregated = aggregate_positions_by_investor(records)
        if aggregated:
            sql_lines.append(f"-- Position updates for {entity_code} (aggregated by investor)")
            for investor_key, inv_data in aggregated.items():
                if inv_data['total_ownership'] > 0 or any(r.get('ownership_position') == 0 for r in inv_data['records']):
                    display_name = inv_data['display_name']
                    total_ownership = inv_data['total_ownership']

                    # Build investor match condition from first record
                    first_rec = inv_data['records'][0]
                    investor_condition = build_investor_match_condition(first_rec, include_amount=False)

                    sql_lines.append(f"-- {escape_sql(display_name)}: total ownership = {total_ownership}")
                    sql_lines.append(f"""UPDATE positions p
SET units = {total_ownership}
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = '{entity_code}'
  AND ({investor_condition});
""")
                    stats["position_updates"] += 1

    # Verification queries
    sql_lines.append("-- ============================================")
    sql_lines.append("-- PHASE 5: Verification Queries")
    sql_lines.append("-- ============================================")
    sql_lines.append("")
    sql_lines.append("""-- Compare DB totals vs expected after migration
SELECT
  v.entity_code,
  v.currency,
  v.status,
  COUNT(DISTINCT s.id) as subscription_count,
  SUM(s.num_shares) as total_shares,
  SUM(p.units) as total_position_units
FROM vehicles v
LEFT JOIN subscriptions s ON s.vehicle_id = v.id
LEFT JOIN positions p ON p.vehicle_id = v.id
WHERE v.entity_code IN ('VC106', 'VC109', 'IN110', 'VC121', 'VC125', 'VC128', 'VC141')
GROUP BY v.entity_code, v.currency, v.status
ORDER BY v.entity_code;
""")

    # Summary
    sql_lines.append("-- ============================================")
    sql_lines.append("-- Migration Summary")
    sql_lines.append("-- ============================================")
    sql_lines.append(f"-- Total records processed: {stats['total_records']}")
    sql_lines.append(f"-- Subscription UPDATE statements: {stats['subscription_updates']}")
    sql_lines.append(f"-- Position UPDATE statements: {stats['position_updates']}")
    sql_lines.append(f"-- Currency corrections: {len(CURRENCY_CORRECTIONS)}")
    sql_lines.append(f"-- Status updates: 1 (VC109 -> CLOSED)")
    sql_lines.append(f"-- Special updates: 1 (Global Custody position -> 0)")

    return sql_lines


def main():
    """Main extraction and migration generation."""
    print("=" * 60)
    print("Vehicle Summary Data Migration")
    print("=" * 60)
    print(f"Source: {EXCEL_PATH}")
    print(f"Output SQL: {OUTPUT_SQL}")
    print(f"Output JSON: {OUTPUT_JSON}")
    print("=" * 60)

    # Load Excel file
    print("\nLoading Excel file...")
    xlsx = pd.ExcelFile(EXCEL_PATH)
    available_sheets = xlsx.sheet_names
    print(f"Available sheets: {len(available_sheets)}")
    print(f"Sheets: {available_sheets[:10]}... (showing first 10)")

    # Process target sheets
    all_records = {}

    for sheet_name, entity_code in SHEET_MAPPING.items():
        if sheet_name in available_sheets:
            records = extract_sheet(xlsx, sheet_name, entity_code)
            all_records[entity_code] = records
        else:
            print(f"\nWARNING: Sheet '{sheet_name}' not found!")
            # Try alternate naming
            for alt in available_sheets:
                if entity_code.replace("VC1", "VC").replace("IN1", "JM") in alt or \
                   alt.replace(" ", "") == sheet_name.replace(" ", ""):
                    print(f"  -> Trying alternate: {alt}")
                    records = extract_sheet(xlsx, alt, entity_code)
                    all_records[entity_code] = records
                    break

    # Generate SQL migration
    print("\n" + "=" * 60)
    print("Generating SQL Migration")
    print("=" * 60)

    sql_lines = generate_sql(all_records)

    # Write SQL output
    with open(OUTPUT_SQL, 'w') as f:
        f.write("\n".join(sql_lines))
    print(f"SQL written to: {OUTPUT_SQL}")

    # Write JSON output for verification
    output_data = {
        'extraction_date': datetime.now().isoformat(),
        'source_file': EXCEL_PATH,
        'vehicles': {}
    }

    for entity_code, records in all_records.items():
        output_data['vehicles'][entity_code] = {
            'record_count': len(records),
            'records': records
        }

    with open(OUTPUT_JSON, 'w') as f:
        json.dump(output_data, f, indent=2, default=str)
    print(f"JSON written to: {OUTPUT_JSON}")

    # Summary
    total_records = sum(len(r) for r in all_records.values())
    print(f"\nTotal investors extracted: {total_records}")
    print(f"Vehicles processed: {len(all_records)}")

    return all_records


if __name__ == "__main__":
    main()
