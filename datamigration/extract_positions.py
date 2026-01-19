#!/usr/bin/env python3
"""
Position Data Extraction Script
================================
Extracts per-investor ownership position data from VERSO and INNOVATECH dashboards.

Key columns:
- "Number of shares invested" → subscriptions.num_shares (shares BOUGHT)
- "OWNERSHIP POSITION" → positions.units (shares CURRENTLY OWNED)

Output: JSON with investor details for matching against DB.
"""

import pandas as pd
import json
from datetime import datetime
from typing import Optional, Dict, List

# File paths
VERSO_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/VERSO DASHBOARD_V1.0.xlsx"
INNOVATECH_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/INNOVATECH DASHBOARD_V1.xlsx"
OUTPUT_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/position_data_extracted.json"


def safe_float(val) -> Optional[float]:
    """Convert value to float, return None if invalid."""
    if pd.isna(val):
        return None
    try:
        result = float(val)
        return result
    except (ValueError, TypeError):
        return None


def safe_string(val) -> Optional[str]:
    """Convert value to string, return None if empty."""
    if pd.isna(val):
        return None
    s = str(val).strip()
    return s if s and s.lower() not in ('nan', 'none', '') else None


def find_column_by_header(df: pd.DataFrame, search_term: str, header_rows: List[int] = [0, 1, 2, 3]) -> Optional[int]:
    """Find column index by searching for header term."""
    search_upper = search_term.upper()
    for row_idx in header_rows:
        if row_idx >= df.shape[0]:
            continue
        for col_idx in range(df.shape[1]):
            val = df.iloc[row_idx, col_idx]
            if pd.notna(val) and search_upper in str(val).upper():
                return col_idx
    return None


def find_header_row(df: pd.DataFrame) -> int:
    """Find the row that contains 'Number of shares' header."""
    for row_idx in range(min(10, df.shape[0])):
        for col_idx in range(min(30, df.shape[1])):
            val = df.iloc[row_idx, col_idx]
            if pd.notna(val) and 'NUMBER OF SHARES' in str(val).upper():
                return row_idx
    return 1  # Default


def extract_verso_sheet(xlsx: pd.ExcelFile, sheet_name: str, entity_code: str) -> Dict:
    """Extract position data from a VERSO dashboard sheet."""
    df = pd.read_excel(xlsx, sheet_name=sheet_name, header=None)

    # Find header row dynamically
    header_row = find_header_row(df)
    data_start = header_row + 1

    # Find column positions from header row
    ownership_col = None
    shares_col = None
    price_col = None
    amount_col = None
    last_name_col = None
    first_name_col = None
    middle_name_col = None
    entity_col = None
    cert_col = None

    for col_idx in range(df.shape[1]):
        val = df.iloc[header_row, col_idx]
        if pd.notna(val):
            val_upper = str(val).upper()
            if 'OWNERSHIP' in val_upper:
                ownership_col = col_idx
            elif 'NUMBER OF SHARES' in val_upper:
                shares_col = col_idx
            elif val_upper == 'PRICE PER SHARE':
                price_col = col_idx
            elif 'AMOUNT INVESTED' in val_upper:
                amount_col = col_idx
            elif 'LAST NAME' in val_upper:
                last_name_col = col_idx
            elif 'FIRST NAME' in val_upper:
                first_name_col = col_idx
            elif 'MIDDLE NAME' in val_upper:
                middle_name_col = col_idx
            elif 'INVESTOR ENTITY' in val_upper:
                entity_col = col_idx
            elif 'SOURCING' in val_upper or 'CERTIFICATE' in val_upper:
                cert_col = col_idx

    records = []

    for row_idx in range(data_start, df.shape[0]):
        # Check if row has valid index (column 1 typically)
        index_val = df.iloc[row_idx, 1] if df.shape[1] > 1 else None
        if pd.isna(index_val):
            continue

        # Skip total rows
        if 'TOTAL' in str(index_val).upper():
            continue

        # Try to parse as integer to ensure it's a data row
        try:
            int(index_val)
        except (ValueError, TypeError):
            continue

        # Extract data
        ownership = safe_float(df.iloc[row_idx, ownership_col]) if ownership_col else None
        shares = safe_float(df.iloc[row_idx, shares_col]) if shares_col else None
        price = safe_float(df.iloc[row_idx, price_col]) if price_col else None
        amount = safe_float(df.iloc[row_idx, amount_col]) if amount_col else None

        last_name = safe_string(df.iloc[row_idx, last_name_col]) if last_name_col else None
        first_name = safe_string(df.iloc[row_idx, first_name_col]) if first_name_col else None
        middle_name = safe_string(df.iloc[row_idx, middle_name_col]) if middle_name_col else None
        investor_entity = safe_string(df.iloc[row_idx, entity_col]) if entity_col else None
        certificate = safe_string(df.iloc[row_idx, cert_col]) if cert_col else None

        # Build investor name - prefer entity, else full name
        if investor_entity:
            investor_name = investor_entity
        else:
            name_parts = [p for p in [first_name, middle_name, last_name] if p]
            investor_name = ' '.join(name_parts) if name_parts else None

        if not investor_name and not shares:
            continue

        # If no ownership column or ownership is 0, use shares as ownership (unless truly 0)
        if ownership is None and shares is not None:
            ownership = shares

        records.append({
            'row_index': row_idx,
            'investor_name': investor_name,
            'investor_first_name': first_name,
            'investor_middle_name': middle_name,
            'investor_last_name': last_name,
            'investor_entity': investor_entity,
            'certificate': certificate,
            'amount_invested': amount,
            'price_per_share': price,
            'num_shares': shares,
            'ownership_position': ownership,
        })

    # Calculate totals
    total_shares = sum(r['num_shares'] or 0 for r in records)
    total_ownership = sum(r['ownership_position'] or 0 for r in records)

    return {
        'entity_code': entity_code,
        'sheet_name': sheet_name,
        'header_row': header_row,
        'record_count': len(records),
        'total_shares': total_shares,
        'total_ownership': total_ownership,
        'columns_found': {
            'ownership': ownership_col,
            'shares': shares_col,
            'price': price_col,
            'amount': amount_col,
            'last_name': last_name_col,
            'first_name': first_name_col,
            'entity': entity_col,
        },
        'records': records
    }


def extract_innovatech_sheet(xlsx: pd.ExcelFile, sheet_name: str, entity_code: str) -> Dict:
    """Extract position data from an INNOVATECH dashboard sheet."""
    df = pd.read_excel(xlsx, sheet_name=sheet_name, header=None)

    # INNOVATECH sheets have header at row 1 typically
    header_row = find_header_row(df)
    data_start = header_row + 1

    # Find columns
    ownership_col = None
    shares_col = None
    price_col = None
    amount_col = None
    last_name_col = None
    first_name_col = None
    middle_name_col = None
    entity_col = None
    cert_col = None

    for col_idx in range(df.shape[1]):
        val = df.iloc[header_row, col_idx]
        if pd.notna(val):
            val_upper = str(val).upper()
            if 'OWNERSHIP' in val_upper or val_upper == 'POSITION':
                ownership_col = col_idx
            elif 'NUMBER OF SHARES' in val_upper:
                shares_col = col_idx
            elif val_upper == 'PRICE PER SHARE':
                price_col = col_idx
            elif 'AMOUNT INVESTED' in val_upper:
                amount_col = col_idx
            elif 'LAST NAME' in val_upper:
                last_name_col = col_idx
            elif 'FIRST NAME' in val_upper:
                first_name_col = col_idx
            elif 'MIDDLE NAME' in val_upper:
                middle_name_col = col_idx
            elif 'INVESTOR ENTITY' in val_upper:
                entity_col = col_idx
            elif 'SOURCING' in val_upper:
                cert_col = col_idx

    records = []

    for row_idx in range(data_start, df.shape[0]):
        index_val = df.iloc[row_idx, 1] if df.shape[1] > 1 else None
        if pd.isna(index_val):
            continue

        if 'TOTAL' in str(index_val).upper():
            continue

        try:
            int(index_val)
        except (ValueError, TypeError):
            continue

        ownership = safe_float(df.iloc[row_idx, ownership_col]) if ownership_col else None
        shares = safe_float(df.iloc[row_idx, shares_col]) if shares_col else None
        price = safe_float(df.iloc[row_idx, price_col]) if price_col else None
        amount = safe_float(df.iloc[row_idx, amount_col]) if amount_col else None

        last_name = safe_string(df.iloc[row_idx, last_name_col]) if last_name_col else None
        first_name = safe_string(df.iloc[row_idx, first_name_col]) if first_name_col else None
        middle_name = safe_string(df.iloc[row_idx, middle_name_col]) if middle_name_col else None
        investor_entity = safe_string(df.iloc[row_idx, entity_col]) if entity_col else None
        certificate = safe_string(df.iloc[row_idx, cert_col]) if cert_col else None

        if investor_entity:
            investor_name = investor_entity
        else:
            name_parts = [p for p in [first_name, middle_name, last_name] if p]
            investor_name = ' '.join(name_parts) if name_parts else None

        if not investor_name and not shares:
            continue

        # If no ownership column, use shares as ownership
        if ownership is None and shares is not None:
            ownership = shares

        records.append({
            'row_index': row_idx,
            'investor_name': investor_name,
            'investor_first_name': first_name,
            'investor_middle_name': middle_name,
            'investor_last_name': last_name,
            'investor_entity': investor_entity,
            'certificate': certificate,
            'amount_invested': amount,
            'price_per_share': price,
            'num_shares': shares,
            'ownership_position': ownership,
        })

    total_shares = sum(r['num_shares'] or 0 for r in records)
    total_ownership = sum(r['ownership_position'] or 0 for r in records)

    return {
        'entity_code': entity_code,
        'sheet_name': sheet_name,
        'header_row': header_row,
        'record_count': len(records),
        'total_shares': total_shares,
        'total_ownership': total_ownership,
        'columns_found': {
            'ownership': ownership_col,
            'shares': shares_col,
            'price': price_col,
            'amount': amount_col,
        },
        'records': records
    }


def main():
    print("=" * 60)
    print("Position Data Extraction")
    print("=" * 60)

    results = {}

    # VERSO Dashboard - VC vehicles
    print("\n--- VERSO DASHBOARD ---")
    verso_xlsx = pd.ExcelFile(VERSO_PATH)

    verso_sheets = {
        "VC2": "VC102", "VC3": "VC103", "VC4": "VC104", "VC6": "VC106",
        "VC11": "VC111", "VC12": "VC112", "VC13": "VC113", "VC14": "VC114",
        "VC15": "VC115", "VC16": "VC116", "VC18": "VC118", "VC19": "VC119",
        "VC20": "VC120", "VC21": "VC121", "VC22": "VC122", "VC23": "VC123",
        "VC24": "VC124", "VC25": "VC125", "VC26": "VC126", "VC28": "VC128",
        "VC30": "VC130", "VC31": "VC131", "VC32": "VC132", "VC33": "VC133",
        "VC34": "VC134", "VC35": "VC135", "VC37": "VC137", "VC38": "VC138",
        "VC40": "VC140", "VC41": "VC141", "VC43": "VC143"
    }

    for sheet_name, entity_code in verso_sheets.items():
        if sheet_name in verso_xlsx.sheet_names:
            data = extract_verso_sheet(verso_xlsx, sheet_name, entity_code)
            results[entity_code] = data
            print(f"  {entity_code}: {data['record_count']} records, total ownership: {data['total_ownership']:,.0f}")
        else:
            print(f"  {entity_code}: Sheet {sheet_name} not found")

    # INNOVATECH Dashboard - IN vehicles
    print("\n--- INNOVATECH DASHBOARD ---")
    inno_xlsx = pd.ExcelFile(INNOVATECH_PATH)

    inno_sheets = {
        "IN1": "IN101", "IN2": "IN102", "IN3": "IN103", "IN4": "IN104",
        "IN5": "IN105", "IN6": "IN106", "IN7": "IN107", "IN8": "IN108",
        "IN9": "IN109", "IN10": "IN110", "IN11": "IN111"
    }

    for sheet_name, entity_code in inno_sheets.items():
        if sheet_name in inno_xlsx.sheet_names:
            data = extract_innovatech_sheet(inno_xlsx, sheet_name, entity_code)
            results[entity_code] = data
            print(f"  {entity_code}: {data['record_count']} records, total ownership: {data['total_ownership']:,.0f}")

    # Summary
    print("\n" + "=" * 60)
    print("EXTRACTION SUMMARY")
    print("=" * 60)

    total_vehicles = len(results)
    total_records = sum(r['record_count'] for r in results.values())

    print(f"Vehicles processed: {total_vehicles}")
    print(f"Total investor records: {total_records}")

    # Save output
    output = {
        'extraction_date': datetime.now().isoformat(),
        'vehicles': results
    }

    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nSaved to: {OUTPUT_PATH}")

    return results


if __name__ == "__main__":
    main()
