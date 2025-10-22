#!/usr/bin/env python3
"""
Count VC vehicles in Excel file
"""

import pandas as pd
from pathlib import Path

def count_vc_vehicles():
    excel_path = Path("docs/VERSO DASHBOARD_V1.0.xlsx")
    
    if not excel_path.exists():
        print(f"Excel file not found: {excel_path}")
        return
    
    print("=== COUNTING VC VEHICLES ===\n")
    
    # Read all sheets
    excel_file = pd.ExcelFile(excel_path)
    
    # Count VC sheets
    vc_sheets = [sheet for sheet in excel_file.sheet_names if sheet.startswith('VC')]
    
    print(f"Total VC sheets found: {len(vc_sheets)}")
    print(f"VC sheets: {sorted(vc_sheets)}")
    
    # Also check for other vehicle-related sheets
    other_vehicle_sheets = [sheet for sheet in excel_file.sheet_names 
                           if not sheet.startswith('VC') and 
                           not sheet.startswith('2022') and 
                           not sheet.startswith('Sheet') and 
                           sheet not in ['Summary', 'JM']]
    
    print(f"\nOther vehicle-related sheets: {other_vehicle_sheets}")
    
    # Check what's in each VC sheet
    print(f"\n=== VC SHEET ANALYSIS ===")
    for vc_sheet in sorted(vc_sheets)[:10]:  # Show first 10
        try:
            # Try to read with header row 1
            df = pd.read_excel(excel_path, sheet_name=vc_sheet, header=1)
            
            # Look for vehicle column
            vehicle_cols = [col for col in df.columns if 'vehicle' in col.lower()]
            
            if vehicle_cols:
                vehicles = df[vehicle_cols[0]].dropna().unique()
                print(f"{vc_sheet}: {len(vehicles)} unique vehicles - {list(vehicles)}")
            else:
                print(f"{vc_sheet}: No vehicle column found")
                
        except Exception as e:
            print(f"{vc_sheet}: Error reading - {e}")
    
    print(f"\n=== SUMMARY ===")
    print(f"VC sheets: {len(vc_sheets)}")
    print(f"Other vehicle sheets: {len(other_vehicle_sheets)}")
    print(f"Total vehicle-related sheets: {len(vc_sheets) + len(other_vehicle_sheets)}")

if __name__ == "__main__":
    count_vc_vehicles()
