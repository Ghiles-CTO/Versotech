#!/usr/bin/env python3
"""
PROPER EXCEL ANALYSIS - Look at actual data structure
"""

import pandas as pd
import json
from pathlib import Path

def analyze_excel_properly():
    excel_path = Path("docs/VERSO DASHBOARD_V1.0.xlsx")
    
    if not excel_path.exists():
        print(f"Excel file not found: {excel_path}")
        return
    
    print("=== PROPER EXCEL ANALYSIS ===\n")
    
    # Read all sheets
    excel_file = pd.ExcelFile(excel_path)
    print(f"Total sheets: {len(excel_file.sheet_names)}")
    
    # Let's look at a few specific sheets in detail
    sheets_to_analyze = ['Summary', 'JM', 'VC1', 'VC2', 'VC40']
    
    for sheet_name in sheets_to_analyze:
        if sheet_name in excel_file.sheet_names:
            print(f"\n--- DETAILED ANALYSIS: {sheet_name} ---")
            
            # Try different ways to read the sheet
            for header_row in [0, 1, 2, 3]:
                try:
                    df = pd.read_excel(excel_path, sheet_name=sheet_name, header=header_row)
                    print(f"\nTrying header row {header_row}:")
                    print(f"Shape: {df.shape}")
                    print(f"Columns: {list(df.columns)}")
                    
                    # Show first few rows of actual data
                    print(f"\nFirst 5 rows:")
                    print(df.head())
                    
                    # Look for actual data (not NaN)
                    non_empty_rows = df.dropna(how='all')
                    print(f"\nNon-empty rows: {len(non_empty_rows)}")
                    
                    if len(non_empty_rows) > 0:
                        print(f"\nSample non-empty data:")
                        print(non_empty_rows.head(3))
                    
                    # Look for specific patterns
                    if 'Investor' in str(df.columns) or 'investor' in str(df.columns):
                        print(f"\nFound investor-related columns!")
                    
                    if 'Vehicle' in str(df.columns) or 'vehicle' in str(df.columns):
                        print(f"\nFound vehicle-related columns!")
                    
                    if 'Amount' in str(df.columns) or 'amount' in str(df.columns):
                        print(f"\nFound amount-related columns!")
                    
                    print(f"\n" + "="*50)
                    
                except Exception as e:
                    print(f"Error with header row {header_row}: {e}")
                    continue
    
    # Let's also try to read without headers to see raw data
    print(f"\n--- RAW DATA ANALYSIS ---")
    for sheet_name in ['VC40']:  # Focus on VC40 since we know it has data
        try:
            df_raw = pd.read_excel(excel_path, sheet_name=sheet_name, header=None)
            print(f"\n{sheet_name} - Raw data (no headers):")
            print(f"Shape: {df_raw.shape}")
            print(f"\nFirst 10 rows:")
            print(df_raw.head(10))
            
            # Look for patterns in the data
            print(f"\nLooking for data patterns...")
            for i in range(min(5, len(df_raw))):
                row = df_raw.iloc[i]
                non_null_values = row.dropna()
                if len(non_null_values) > 0:
                    print(f"Row {i}: {list(non_null_values)}")
            
        except Exception as e:
            print(f"Error reading {sheet_name}: {e}")

if __name__ == "__main__":
    analyze_excel_properly()
