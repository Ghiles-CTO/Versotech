#!/usr/bin/env python3
"""
Generate Introducer Commissions Excel Report
============================================
Generates 05_Introducer_Commissions.xlsx with Entity Code column from database.

Columns:
- Entity Code (vehicle code)
- Introducer
- Investor
- Fee Type (basis_type)
- Rate (bps)
- Rate (%)
- Commission Amount
- Currency
"""

import json
from datetime import datetime
import pandas as pd
import os

# File paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(SCRIPT_DIR, "commission_data_export.json")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "05_Introducer_Commissions.xlsx")


def load_commission_data(input_path: str) -> list:
    """Load commission data from JSON export file."""
    with open(input_path, 'r') as f:
        data = json.load(f)
    return data

def generate_excel(data: list, output_path: str):
    """Generate Excel file from data."""
    # Create DataFrame with proper column names
    df = pd.DataFrame(data)

    # Rename columns for Excel headers
    df = df.rename(columns={
        'entity_code': 'Entity Code',
        'introducer': 'Introducer',
        'investor': 'Investor',
        'fee_type': 'Fee Type',
        'rate_bps': 'Rate (bps)',
        'rate_pct': 'Rate (%)',
        'commission_amount': 'Commission Amount',
        'currency': 'Currency'
    })

    # Reorder columns
    columns = ['Entity Code', 'Introducer', 'Investor', 'Fee Type', 'Rate (bps)', 'Rate (%)', 'Commission Amount', 'Currency']
    df = df[columns]

    # Write to Excel
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Introducer Commissions', index=False)

    print(f"Generated: {output_path}")
    print(f"Total records: {len(df)}")
    print(f"\nRecords by Entity Code:")
    print(df.groupby('Entity Code').size().to_string())

def main():
    """Main function."""
    print("=" * 60)
    print("Generating Introducer Commissions Excel Report")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("=" * 60)

    try:
        # Load data from JSON
        print(f"\nLoading data from: {INPUT_PATH}")
        data = load_commission_data(INPUT_PATH)
        print(f"Loaded {len(data)} records")

        # Generate Excel
        print("\nGenerating Excel file...")
        generate_excel(data, OUTPUT_PATH)

        print("\n" + "=" * 60)
        print("SUCCESS: Excel file generated with Entity Code column")
        print("=" * 60)

    except Exception as e:
        print(f"\nERROR: {e}")
        raise

if __name__ == "__main__":
    main()
