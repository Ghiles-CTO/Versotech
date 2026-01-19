#!/usr/bin/env python3
"""
Generate Aggregated Position Migration SQL
==========================================
Reads extracted position data and aggregates by investor before generating SQL.
This handles cases where investors have multiple tranches that should be summed.
"""

import json
from collections import defaultdict

# File paths
EXTRACTED_DATA_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/position_data_extracted.json"
OUTPUT_SQL_PATH = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/position_migration_aggregated.sql"


def normalize_name(name):
    if not name:
        return ''
    return str(name).replace("'", "''")


def generate_investor_match_clause(investor_key):
    """Generate SQL WHERE clause for matching investor."""
    entity, first, last = investor_key

    if entity:
        return f"i.legal_name ILIKE '%{normalize_name(entity)}%'"
    elif first and last:
        return f"(i.first_name ILIKE '%{normalize_name(first)}%' AND i.last_name ILIKE '%{normalize_name(last)}%')"
    elif last:
        return f"i.last_name ILIKE '%{normalize_name(last)}%'"
    return None


def main():
    # Load extracted data
    with open(EXTRACTED_DATA_PATH, 'r') as f:
        data = json.load(f)

    vehicles = data['vehicles']

    sql_lines = []
    sql_lines.append("-- Aggregated Position Migration SQL")
    sql_lines.append("-- Updates positions.units based on dashboard OWNERSHIP POSITION values")
    sql_lines.append("-- Investors with multiple tranches have been summed")
    sql_lines.append("")
    sql_lines.append("BEGIN;")
    sql_lines.append("")

    total_updates = 0

    for entity_code in sorted(vehicles.keys()):
        vehicle_data = vehicles[entity_code]
        records = vehicle_data.get('records', [])

        if not records:
            continue

        # Aggregate by investor
        investor_totals = defaultdict(lambda: {'ownership': 0, 'shares': 0, 'name': ''})

        for record in records:
            entity = record.get('investor_entity')
            first = record.get('investor_first_name')
            last = record.get('investor_last_name')

            # Create a key for grouping
            investor_key = (entity, first, last)

            ownership = record.get('ownership_position', 0) or 0
            shares = record.get('num_shares', 0) or 0
            name = record.get('investor_name', '')

            investor_totals[investor_key]['ownership'] += ownership
            investor_totals[investor_key]['shares'] += shares
            investor_totals[investor_key]['name'] = name

        total_ownership = sum(v['ownership'] for v in investor_totals.values())

        sql_lines.append(f"-- ============================================================")
        sql_lines.append(f"-- {entity_code}: {len(investor_totals)} investors, total ownership: {total_ownership:,.0f}")
        sql_lines.append(f"-- ============================================================")
        sql_lines.append("")

        for investor_key, totals in investor_totals.items():
            ownership = totals['ownership']
            name = totals['name']

            match_clause = generate_investor_match_clause(investor_key)
            if not match_clause:
                sql_lines.append(f"-- SKIPPED: Could not match investor '{name}'")
                continue

            total_updates += 1

            sql_lines.append(f"-- {name}: total ownership = {ownership:,.0f}")
            sql_lines.append(f"""UPDATE positions p
SET units = {ownership}
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = '{entity_code}'
  AND {match_clause};
""")

        sql_lines.append("")

    sql_lines.append("-- ============================================================")
    sql_lines.append(f"-- SUMMARY: {total_updates} position updates")
    sql_lines.append("-- ============================================================")
    sql_lines.append("")
    sql_lines.append("COMMIT;")

    # Save
    with open(OUTPUT_SQL_PATH, 'w') as f:
        f.write('\n'.join(sql_lines))

    print(f"Generated {total_updates} aggregated position updates")
    print(f"Saved to: {OUTPUT_SQL_PATH}")


if __name__ == "__main__":
    main()
