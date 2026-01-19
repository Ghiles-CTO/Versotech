#!/usr/bin/env python3
"""
Generate 06_Full_Subscription_Data.xlsx from database.
Uses positions.units distributed proportionally across subscriptions.

The document includes one row per subscription with shares distributed
proportionally based on commitment ratio.

Note: Some positions exist without corresponding subscriptions (transfers,
historical data). These are not included in this document as it focuses
on subscription data specifically.
"""

import json
import pandas as pd
from datetime import datetime
import os

def main():
    # Load data from the extracted JSON
    with open("/tmp/subscription_data.json", "r") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} subscription records")

    # Create DataFrame
    df = pd.DataFrame(data)

    # Convert numeric columns
    df["Commitment"] = pd.to_numeric(df["Commitment"], errors="coerce")
    df["Funded Amount"] = pd.to_numeric(df["Funded Amount"], errors="coerce")
    df["Shares"] = pd.to_numeric(df["Shares"], errors="coerce")

    # Convert Contract Date to datetime, handle nulls
    df["Contract Date"] = pd.to_datetime(df["Contract Date"], errors="coerce")

    # Sort by Entity Code, then Investor Name, then Contract Date
    df = df.sort_values(["Entity Code", "Investor Name", "Contract Date"])

    # Calculate totals for TOTALS row
    totals = {
        "Entity Code": "TOTALS",
        "Investor Name": "",
        "Investor Type": "",
        "Commitment": df["Commitment"].sum(),
        "Funded Amount": df["Funded Amount"].sum(),
        "Shares": df["Shares"].sum(),
        "Contract Date": None
    }

    # Append totals row
    df = pd.concat([df, pd.DataFrame([totals])], ignore_index=True)

    print(f"\nDocument Summary:")
    print(f"  Total records: {len(df) - 1} (plus TOTALS row)")
    print(f"  Total Commitment: ${totals['Commitment']:,.2f}")
    print(f"  Total Funded Amount: ${totals['Funded Amount']:,.2f}")
    print(f"  Total Shares: {totals['Shares']:,.2f}")

    # Save to Excel
    output_path = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/06_Full_Subscription_Data_REGENERATED.xlsx"

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Subscription Data", index=False)

        # Get workbook and worksheet for formatting
        workbook = writer.book
        worksheet = writer.sheets["Subscription Data"]

        # Adjust column widths
        column_widths = {
            "A": 15,  # Entity Code
            "B": 50,  # Investor Name
            "C": 15,  # Investor Type
            "D": 18,  # Commitment
            "E": 18,  # Funded Amount
            "F": 15,  # Shares
            "G": 15,  # Contract Date
        }

        for col, width in column_widths.items():
            worksheet.column_dimensions[col].width = width

        # Apply number formatting
        from openpyxl.styles import numbers

        for row in range(2, len(df) + 2):  # Skip header row
            # Currency format for Commitment and Funded Amount
            worksheet[f"D{row}"].number_format = '#,##0.00'
            worksheet[f"E{row}"].number_format = '#,##0.00'
            # Number format for Shares
            worksheet[f"F{row}"].number_format = '#,##0.00'
            # Date format for Contract Date
            if worksheet[f"G{row}"].value:
                worksheet[f"G{row}"].number_format = 'YYYY-MM-DD'

    print(f"\nSaved to: {output_path}")

    # Print verification by entity
    print("\n" + "=" * 70)
    print("VERIFICATION BY ENTITY CODE")
    print("=" * 70)

    df_data = df[df["Entity Code"] != "TOTALS"]
    by_entity = df_data.groupby("Entity Code").agg({
        "Commitment": "sum",
        "Funded Amount": "sum",
        "Shares": "sum",
        "Investor Name": "count"
    }).rename(columns={"Investor Name": "Record Count"})

    print(by_entity.to_string())
    print("=" * 70)

if __name__ == "__main__":
    main()
