#!/usr/bin/env python3
"""
Generate Position Migration SQL
================================
Reads extracted position data from dashboard and generates SQL to update
positions in the database.

Strategy:
1. For each vehicle with extracted data
2. Sum up the total expected ownership from dashboard
3. Compare with current DB total
4. Generate UPDATE statements when there are differences
"""

import json
from typing import Dict, List, Tuple

# File paths
EXTRACTED_DATA_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/position_data_extracted.json"
OUTPUT_SQL_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/position_migration.sql"
REPORT_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/position_migration_report.md"


def load_extracted_data() -> Dict:
    """Load the extracted position data from JSON."""
    with open(EXTRACTED_DATA_PATH, 'r') as f:
        data = json.load(f)
    return data['vehicles']


def generate_migration_sql(vehicles_data: Dict) -> Tuple[str, str]:
    """Generate SQL migration and report."""

    sql_lines = []
    sql_lines.append("-- Position Migration Script")
    sql_lines.append("-- Generated from VERSO and INNOVATECH dashboards")
    sql_lines.append("-- Updates positions.units based on OWNERSHIP POSITION column")
    sql_lines.append("")
    sql_lines.append("BEGIN;")
    sql_lines.append("")

    report_lines = []
    report_lines.append("# Position Migration Report")
    report_lines.append("")
    report_lines.append("## Summary by Vehicle")
    report_lines.append("")
    report_lines.append("| Vehicle | Records | Total Ownership |")
    report_lines.append("|---------|---------|-----------------|")

    total_vehicles = 0
    total_records = 0

    for entity_code, vehicle_data in sorted(vehicles_data.items()):
        records = vehicle_data.get('records', [])
        if not records:
            continue

        total_ownership = vehicle_data.get('total_ownership', 0)
        record_count = vehicle_data.get('record_count', 0)

        report_lines.append(f"| {entity_code} | {record_count} | {total_ownership:,.0f} |")

        total_vehicles += 1
        total_records += record_count

        # Generate SQL comments for this vehicle
        sql_lines.append(f"-- {entity_code}: {record_count} investors, total ownership: {total_ownership:,.0f}")
        sql_lines.append("")

        # For each investor record, generate an UPDATE statement
        # We'll update based on matching by investor name + amount
        for record in records:
            investor_name = record.get('investor_name', '').replace("'", "''")
            investor_entity = (record.get('investor_entity') or '').replace("'", "''")
            first_name = (record.get('investor_first_name') or '').replace("'", "''")
            last_name = (record.get('investor_last_name') or '').replace("'", "''")
            ownership = record.get('ownership_position', 0) or 0
            amount = record.get('amount_invested', 0) or 0
            num_shares = record.get('num_shares', 0) or 0
            price = record.get('price_per_share')

            if not investor_name:
                continue

            # Generate update statement with match criteria
            # Match by: investor_name OR entity + vehicle
            sql_lines.append(f"-- Investor: {investor_name}, Amount: {amount:,.2f}, Shares: {num_shares:,.0f}, Ownership: {ownership:,.0f}")

            # Build WHERE clause for matching
            if investor_entity:
                match_clause = f"i.legal_name = '{investor_entity}'"
            elif first_name and last_name:
                match_clause = f"(i.first_name ILIKE '{first_name}%' AND i.last_name ILIKE '{last_name}%')"
            else:
                match_clause = f"i.legal_name ILIKE '%{investor_name}%'"

            sql_lines.append(f"""UPDATE positions p
SET units = {ownership}
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = '{entity_code}'
  AND {match_clause};
""")

            # Also update subscriptions if we have share data
            if num_shares > 0:
                price_clause = f", price_per_share = {price}" if price else ""
                sql_lines.append(f"""UPDATE subscriptions s
SET num_shares = {num_shares}{price_clause}
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = '{entity_code}'
  AND {match_clause};
""")

    report_lines.append("")
    report_lines.append(f"**Total Vehicles**: {total_vehicles}")
    report_lines.append(f"**Total Records**: {total_records}")

    sql_lines.append("")
    sql_lines.append("COMMIT;")

    return '\n'.join(sql_lines), '\n'.join(report_lines)


def main():
    print("Generating Position Migration SQL...")

    # Load extracted data
    vehicles_data = load_extracted_data()
    print(f"Loaded data for {len(vehicles_data)} vehicles")

    # Generate SQL
    sql_content, report_content = generate_migration_sql(vehicles_data)

    # Save SQL file
    with open(OUTPUT_SQL_PATH, 'w') as f:
        f.write(sql_content)
    print(f"SQL saved to: {OUTPUT_SQL_PATH}")

    # Save report
    with open(REPORT_PATH, 'w') as f:
        f.write(report_content)
    print(f"Report saved to: {REPORT_PATH}")

    # Print summary
    print("\n" + "=" * 60)
    print("MIGRATION SUMMARY")
    print("=" * 60)

    total_ownership = sum(
        v.get('total_ownership', 0)
        for v in vehicles_data.values()
        if v.get('records')
    )
    total_records = sum(
        v.get('record_count', 0)
        for v in vehicles_data.values()
    )

    print(f"Vehicles with data: {len([v for v in vehicles_data.values() if v.get('records')])}")
    print(f"Total investor records: {total_records}")
    print(f"Total ownership units: {total_ownership:,.0f}")


if __name__ == "__main__":
    main()
