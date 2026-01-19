#!/usr/bin/env python3
"""
VERSO Dashboard Data Extraction Script v2
==========================================
Extracts introducer and partner (treated as introducers) data from the VERSO Dashboard Excel.
Uses DYNAMIC column detection to handle varying column positions across sheets.

Key rule: ALL partners are treated as introducers.
"""

import pandas as pd
import json
import os
from datetime import datetime
from typing import Optional, Dict, List, Any

# Configuration
EXCEL_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/VERSO DASHBOARD_V1.0.xlsx"
OUTPUT_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/extracted_data_v2.json"

# Target sheets (22 VCs with subscriptions in DB)
# Dashboard sheet name -> DB entity_code
SHEET_MAPPING = {
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

# Known introducer name mappings (dashboard -> DB display_name)
INTRODUCER_MAPPINGS = {
    "Terra": "Terra Financial & Management Services SA",
    "TERRA": "Terra Financial & Management Services SA",
    "TERRA Financial": "Terra Financial & Management Services SA",
    "Rick": "Altras Capital Financing Broker",
    "Gio": "Giovanni SALADINO",
    "Enguerrand": "Enguerrand Elbaz",
    "Sandro": "Sandro Lang",
    "AUX": "AUX Business Support Ltd",
    "Alpha Gaia": "Alpha Gaia",
    "Gemera": "GEMERA Consulting Pte Ltd",
    "Pierre Paumier": "Pierre Paumier",
    "Omar": "Omar ADI",
    "Aboud": "Aboud Khaddam",
}


def safe_float(val) -> Optional[float]:
    """Convert value to float, return None if invalid."""
    if pd.isna(val):
        return None
    try:
        result = float(val)
        return result if result != 0 else None
    except (ValueError, TypeError):
        return None


def safe_string(val) -> Optional[str]:
    """Convert value to string, return None if empty."""
    if pd.isna(val):
        return None
    s = str(val).strip()
    return s if s and s.lower() not in ('nan', 'none', '') else None


def is_nonzero_record(record: Dict) -> bool:
    """Check if record has any non-zero fee values."""
    fee_fields = ['sub_fee_amt', 'perf_fee_1_pct', 'perf_fee_2_pct', 'spread_pps_fees']
    for field in fee_fields:
        val = record.get(field)
        if val is not None and val > 0:
            return True
    return False


def find_section_header(df: pd.DataFrame, search_term: str, exclude_term: str = None) -> tuple:
    """
    Find section header by searching for term in first few rows.
    Returns (col_index, row_index) or (None, None) if not found.
    """
    # Search in first 5 rows, all columns
    for j in range(df.shape[1]):
        for i in range(min(5, df.shape[0])):
            val = str(df.iloc[i, j]).upper() if pd.notna(df.iloc[i, j]) else ''
            if search_term in val:
                if exclude_term and exclude_term in val:
                    continue
                return (j, i)
    return (None, None)


def find_names_column(df: pd.DataFrame, section_col: int, header_row: int) -> Optional[int]:
    """
    Find the Names column near the section header.
    Looks for 'Names', 'Name', or 'BI' header.
    """
    search_range = range(max(0, section_col - 5), min(section_col + 3, df.shape[1]))
    for j in search_range:
        if header_row < df.shape[0]:
            h = str(df.iloc[header_row, j]).lower() if pd.notna(df.iloc[header_row, j]) else ''
            if 'name' in h or h == 'bi':
                return j
    return None


def extract_investor_info(df: pd.DataFrame, row_idx: int) -> Dict:
    """
    Extract investor information from the LEFT side of the sheet.
    Standard column positions (verified from dashboard structure).
    """
    # Standard left-side column positions
    cols = {
        'index': 0,           # Row number/index
        'certificates': 1,    # Certificate ID (e.g., VC13F025)
        'contract_ref': 2,    # Sourcing Contract ref
        'cost_per_share': 3,  # Cost per Share
        'last_name': 6,       # Investor Last Name
        'middle_name': 7,     # Investor Middle Name
        'first_name': 8,      # Investor First Name
        'entity': 9,          # Investor Entity
        'vehicle': 10,        # Vehicle
        'amount_invested': 11,  # Amount invested/commitment
        'price_per_share': 12,  # Price per Share
        'shares': 13,           # Number of shares
        'ownership': 14,        # OWNERSHIP POSITION
        'contract_date': 15,    # Contract Date
    }

    def get_val(col_key):
        col_idx = cols.get(col_key)
        if col_idx is not None and col_idx < df.shape[1]:
            return df.iloc[row_idx, col_idx]
        return None

    return {
        'row_index': row_idx,
        'certificates': safe_string(get_val('certificates')),
        'contract_ref': safe_string(get_val('contract_ref')),
        'investor_last_name': safe_string(get_val('last_name')),
        'investor_middle_name': safe_string(get_val('middle_name')),
        'investor_first_name': safe_string(get_val('first_name')),
        'investor_entity': safe_string(get_val('entity')),
        'amount_invested': safe_float(get_val('amount_invested')),
        'contract_date': safe_string(get_val('contract_date')),
    }


def extract_section_data(df: pd.DataFrame, section_name: str, sheet_name: str) -> List[Dict]:
    """
    Extract data from a section (INTRODUCERS or PARTNERS).
    Uses dynamic column detection.
    """
    records = []

    # Find section header
    if section_name == 'INTRODUCERS':
        section_col, header_row = find_section_header(df, 'INTRODUCER')
    else:
        # For PARTNERS, exclude JM
        section_col, header_row = find_section_header(df, 'PARTNER', exclude_term='JM')

    if section_col is None:
        print(f"  [{section_name}] Section not found in {sheet_name}")
        return records

    print(f"  [{section_name}] Found at col {section_col}, row {header_row}")

    # Header row is typically the row after the section header
    col_header_row = header_row + 1

    # Find Names column
    names_col = find_names_column(df, section_col, col_header_row)
    if names_col is None:
        print(f"  [{section_name}] Names column not found")
        return records

    print(f"  [{section_name}] Names column at {names_col}")

    # Map columns RELATIVE to names_col
    # Structure: Names | Sub% | SubAmt | Perf1% | Thresh1 | Perf2% | Thresh2 | SpreadPPS | SpreadFees
    max_col = df.shape[1] - 1  # Maximum valid column index

    def safe_col(offset):
        """Return column index if within bounds, else None."""
        idx = names_col + offset
        return idx if idx <= max_col else None

    col_map = {
        'names': names_col,
        'sub_fee_pct': safe_col(1),
        'sub_fee_amt': safe_col(2),
        'perf_fee_1_pct': safe_col(3),
        'thresh_1': safe_col(4),
        'perf_fee_2_pct': safe_col(5),
        'thresh_2': safe_col(6),
        'spread_pps': safe_col(7),
        'spread_pps_fees': safe_col(8),  # THIS IS THE AMOUNT, NOT RATE!
    }

    # Print column headers for verification
    print(f"  [{section_name}] Column mapping (header row {col_header_row}):")
    for field, col_idx in col_map.items():
        if col_idx is not None and col_idx < df.shape[1]:
            header_val = df.iloc[col_header_row, col_idx] if col_header_row < df.shape[0] else 'N/A'
            print(f"    {field} (col {col_idx}): {header_val}")
        elif col_idx is None:
            print(f"    {field}: N/A (out of bounds)")

    # Data starts after column headers
    data_start_row = col_header_row + 1

    # Helper to safely get value from column
    def get_cell(row_idx, col_key):
        col_idx = col_map.get(col_key)
        if col_idx is None:
            return None
        return df.iloc[row_idx, col_idx]

    # Extract each row
    for i in range(data_start_row, df.shape[0]):
        name_val = get_cell(i, 'names')
        if pd.isna(name_val) or str(name_val).strip() == '':
            continue

        introducer_name = str(name_val).strip()

        # Get commission data
        record = {
            'row_index': i,
            'introducer_name': introducer_name,
            'source_section': section_name,  # Track where it came from
            'db_introducer_name': INTRODUCER_MAPPINGS.get(introducer_name, introducer_name),

            # Subscription fees
            'sub_fee_pct': safe_float(get_cell(i, 'sub_fee_pct')),
            'sub_fee_amt': safe_float(get_cell(i, 'sub_fee_amt')),

            # Performance fee 1
            'perf_fee_1_pct': safe_float(get_cell(i, 'perf_fee_1_pct')),
            'thresh_1': safe_string(get_cell(i, 'thresh_1')),

            # Performance fee 2
            'perf_fee_2_pct': safe_float(get_cell(i, 'perf_fee_2_pct')),
            'thresh_2': safe_string(get_cell(i, 'thresh_2')),

            # Spread
            'spread_pps': safe_float(get_cell(i, 'spread_pps')),
            'spread_pps_fees': safe_float(get_cell(i, 'spread_pps_fees')),
        }

        # Add investor info from left side of sheet
        investor_info = extract_investor_info(df, i)
        record.update(investor_info)

        # Only include records with non-zero fees
        if is_nonzero_record(record):
            records.append(record)

    return records


def extract_sheet(xlsx: pd.ExcelFile, sheet_name: str) -> Dict:
    """
    Extract all introducer data from a single sheet.
    Combines INTRODUCERS and PARTNERS (all treated as introducers).
    """
    print(f"\n=== Processing sheet: {sheet_name} ===")

    df = pd.read_excel(xlsx, sheet_name=sheet_name, header=None)
    print(f"  Sheet dimensions: {df.shape[0]} rows x {df.shape[1]} cols")

    # Extract from INTRODUCERS section
    intro_records = extract_section_data(df, 'INTRODUCERS', sheet_name)
    print(f"  INTRODUCERS: {len(intro_records)} non-zero records")

    # Extract from PARTNERS section (treated as introducers per user rule)
    partner_records = extract_section_data(df, 'PARTNERS', sheet_name)
    print(f"  PARTNERS (as introducers): {len(partner_records)} non-zero records")

    # Combine all records
    all_records = intro_records + partner_records

    return {
        'sheet_name': sheet_name,
        'db_entity_code': SHEET_MAPPING.get(sheet_name),
        'total_records': len(all_records),
        'intro_count': len(intro_records),
        'partner_count': len(partner_records),
        'records': all_records
    }


def main():
    """Main extraction function."""
    print("=" * 60)
    print("VERSO Dashboard Data Extraction v2")
    print("=" * 60)
    print(f"Excel file: {EXCEL_PATH}")
    print(f"Output file: {OUTPUT_PATH}")
    print(f"Target sheets: {len(SHEET_MAPPING)}")
    print("\nKEY RULE: ALL partners are treated as introducers")
    print("=" * 60)

    # Load Excel file
    print("\nLoading Excel file...")
    xlsx = pd.ExcelFile(EXCEL_PATH)
    available_sheets = xlsx.sheet_names
    print(f"Available sheets: {len(available_sheets)}")

    # Process each target sheet
    results = {}
    total_records = 0
    total_intro = 0
    total_partner = 0
    unique_introducers = set()

    for sheet_name, db_code in SHEET_MAPPING.items():
        if sheet_name in available_sheets:
            sheet_data = extract_sheet(xlsx, sheet_name)
            results[db_code] = sheet_data
            total_records += sheet_data['total_records']
            total_intro += sheet_data['intro_count']
            total_partner += sheet_data['partner_count']

            # Track unique introducer names
            for rec in sheet_data['records']:
                unique_introducers.add(rec['introducer_name'])
        else:
            print(f"\nWARNING: Sheet {sheet_name} not found!")

    # Generate summary
    summary = {
        'extraction_date': datetime.now().isoformat(),
        'excel_file': EXCEL_PATH,
        'sheets_processed': len(results),
        'total_records': total_records,
        'total_from_introducers_section': total_intro,
        'total_from_partners_section': total_partner,
        'unique_introducer_names': sorted(list(unique_introducers)),
        'unique_introducer_count': len(unique_introducers),
    }

    # Print summary
    print("\n" + "=" * 60)
    print("EXTRACTION SUMMARY")
    print("=" * 60)
    print(f"Sheets processed: {summary['sheets_processed']}")
    print(f"Total records extracted: {summary['total_records']}")
    print(f"  - From INTRODUCERS section: {summary['total_from_introducers_section']}")
    print(f"  - From PARTNERS section: {summary['total_from_partners_section']}")
    print(f"Unique introducer names: {summary['unique_introducer_count']}")
    print("\nIntroducers found:")
    for name in summary['unique_introducer_names']:
        print(f"  - {name}")

    # Save results
    output = {
        'summary': summary,
        'data': results
    }

    with open(OUTPUT_PATH, 'w') as f:
        json.dump(output, f, indent=2, default=str)

    print(f"\nResults saved to: {OUTPUT_PATH}")
    print("=" * 60)

    return output


if __name__ == "__main__":
    main()
