#!/usr/bin/env python3
"""
COMPREHENSIVE ANALYSIS OF VERSO DASHBOARD EXCEL FILE
Analyze the actual Excel file to understand the complete data structure
"""

import pandas as pd
import json
from pathlib import Path
from collections import defaultdict
import re

def analyze_excel_comprehensive():
    excel_path = Path("docs/VERSO DASHBOARD_V1.0.xlsx")
    
    if not excel_path.exists():
        print(f"Excel file not found: {excel_path}")
        return
    
    print("=== COMPREHENSIVE VERSO DASHBOARD ANALYSIS ===\n")
    
    # Read all sheets
    excel_file = pd.ExcelFile(excel_path)
    print(f"Total sheets: {len(excel_file.sheet_names)}")
    print(f"Sheet names: {excel_file.sheet_names}\n")
    
    # Analysis results
    analysis_results = {
        "total_sheets": len(excel_file.sheet_names),
        "sheet_names": excel_file.sheet_names,
        "sheets_analysis": {},
        "all_vehicles": set(),
        "all_investors": set(),
        "all_subscriptions": [],
        "total_commitment": 0,
        "currency_breakdown": defaultdict(float)
    }
    
    # Analyze each sheet
    for sheet_name in excel_file.sheet_names:
        print(f"--- Analyzing Sheet: {sheet_name} ---")
        
        try:
            # Read sheet with different strategies
            df = None
            
            # Try reading with different header rows
            for header_row in [0, 1, 2, 3]:
                try:
                    df = pd.read_excel(excel_path, sheet_name=sheet_name, header=header_row)
                    if len(df.columns) > 5:  # Reasonable number of columns
                        print(f"   Using header row {header_row}")
                        break
                except:
                    continue
            
            if df is None or len(df.columns) < 3:
                print(f"   Skipping - insufficient data")
                continue
                
            print(f"   Rows: {len(df)}")
            print(f"   Columns: {list(df.columns)}")
            
            # Analyze this sheet
            sheet_analysis = analyze_sheet_structure(df, sheet_name)
            analysis_results["sheets_analysis"][sheet_name] = sheet_analysis
            
            # Extract vehicles, investors, subscriptions
            vehicles = extract_vehicles(df, sheet_name)
            investors = extract_investors(df, sheet_name)
            subscriptions = extract_subscriptions(df, sheet_name)
            
            analysis_results["all_vehicles"].update(vehicles)
            analysis_results["all_investors"].update(investors)
            analysis_results["all_subscriptions"].extend(subscriptions)
            
            # Calculate totals
            for sub in subscriptions:
                if sub.get("amount"):
                    analysis_results["total_commitment"] += sub["amount"]
                    analysis_results["currency_breakdown"][sub.get("currency", "USD")] += sub["amount"]
            
            print(f"   Vehicles found: {len(vehicles)}")
            print(f"   Investors found: {len(investors)}")
            print(f"   Subscriptions found: {len(subscriptions)}")
            
        except Exception as e:
            print(f"   Error analyzing sheet: {e}")
        
        print()
    
    # Convert sets to lists for JSON serialization
    analysis_results["all_vehicles"] = sorted(list(analysis_results["all_vehicles"]))
    analysis_results["all_investors"] = sorted(list(analysis_results["all_investors"]))
    
    # Print comprehensive summary
    print("=== COMPREHENSIVE SUMMARY ===")
    print(f"Total sheets analyzed: {len(analysis_results['sheets_analysis'])}")
    print(f"Total unique vehicles: {len(analysis_results['all_vehicles'])}")
    print(f"Total unique investors: {len(analysis_results['all_investors'])}")
    print(f"Total subscriptions: {len(analysis_results['all_subscriptions'])}")
    print(f"Total commitment: ${analysis_results['total_commitment']:,.2f}")
    
    print(f"\nCurrency breakdown:")
    for currency, amount in analysis_results["currency_breakdown"].items():
        print(f"  {currency}: ${amount:,.2f}")
    
    print(f"\nVehicles found:")
    for vehicle in analysis_results["all_vehicles"]:
        print(f"  - {vehicle}")
    
    print(f"\nInvestors found:")
    for investor in analysis_results["all_investors"]:
        print(f"  - {investor}")
    
    # Save detailed analysis
    with open("comprehensive_analysis.json", "w") as f:
        json.dump(analysis_results, f, indent=2, default=str)
    
    print(f"\nDetailed analysis saved to: comprehensive_analysis.json")
    
    return analysis_results

def analyze_sheet_structure(df, sheet_name):
    """Analyze the structure of a specific sheet"""
    analysis = {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": list(df.columns),
        "data_types": {},
        "sample_data": {}
    }
    
    # Analyze column data types
    for col in df.columns:
        non_null_values = df[col].dropna()
        if len(non_null_values) > 0:
            analysis["data_types"][col] = str(non_null_values.iloc[0].__class__.__name__)
            analysis["sample_data"][col] = non_null_values.iloc[0] if len(non_null_values) > 0 else None
    
    return analysis

def extract_vehicles(df, sheet_name):
    """Extract vehicle information from sheet"""
    vehicles = set()
    
    # Look for vehicle-related columns
    vehicle_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['vehicle', 'fund', 'vc', 'company', 'name'])]
    
    for col in vehicle_columns:
        values = df[col].dropna().unique()
        for value in values:
            if isinstance(value, str) and len(value.strip()) > 0:
                vehicles.add(value.strip())
    
    # Add sheet name as vehicle if it looks like a vehicle code
    if re.match(r'VC\d+', sheet_name) or sheet_name in ['VEGINVEST', 'JM']:
        vehicles.add(sheet_name)
    
    return vehicles

def extract_investors(df, sheet_name):
    """Extract investor information from sheet"""
    investors = set()
    
    # Look for investor-related columns
    investor_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['investor', 'client', 'name', 'entity', 'individual'])]
    
    for col in investor_columns:
        values = df[col].dropna().unique()
        for value in values:
            if isinstance(value, str) and len(value.strip()) > 0:
                investors.add(value.strip())
    
    return investors

def extract_subscriptions(df, sheet_name):
    """Extract subscription information from sheet"""
    subscriptions = []
    
    # Look for amount-related columns
    amount_columns = [col for col in df.columns if any(keyword in col.lower() for keyword in ['amount', 'commitment', 'value', 'investment', 'subscription'])]
    
    for col in amount_columns:
        values = df[col].dropna()
        for value in values:
            try:
                amount = float(value)
                if amount > 0:
                    subscriptions.append({
                        "sheet": sheet_name,
                        "column": col,
                        "amount": amount,
                        "currency": "USD"  # Default, will be refined
                    })
            except:
                continue
    
    return subscriptions

if __name__ == "__main__":
    analyze_excel_comprehensive()
