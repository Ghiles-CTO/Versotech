#!/usr/bin/env python3
"""
Extract Phase 4 updates from the generated SQL file, grouped by vehicle.
Output as separate SQL files for batch execution.
"""

import re
import os

INPUT_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/vehicle_summary_migration.sql"
OUTPUT_DIR = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/phase4_batches"

def extract_phase4_by_vehicle():
    """Extract Phase 4 updates grouped by vehicle."""

    with open(INPUT_FILE, 'r') as f:
        content = f.read()

    # Find Phase 4 section
    phase4_start = content.find("PHASE 4: Per-Investor")
    phase5_start = content.find("PHASE 5: Verification")

    if phase4_start == -1 or phase5_start == -1:
        print("Could not find Phase 4 section")
        return {}

    phase4_content = content[phase4_start:phase5_start]

    # Split by vehicle sections
    vehicle_pattern = r'-- -{40,}\n-- (VC\d+|IN\d+): \d+ investors\n-- -{40,}'

    vehicles = {}
    current_vehicle = None
    current_statements = []

    lines = phase4_content.split('\n')

    for line in lines:
        # Check for vehicle header
        match = re.match(r'-- (VC\d+|IN\d+): \d+ investors', line)
        if match:
            # Save previous vehicle
            if current_vehicle and current_statements:
                vehicles[current_vehicle] = '\n'.join(current_statements)
            current_vehicle = match.group(1)
            current_statements = []
            continue

        # Skip separator lines
        if re.match(r'-- -{30,}', line):
            continue

        # Add statement lines
        if current_vehicle:
            current_statements.append(line)

    # Save last vehicle
    if current_vehicle and current_statements:
        vehicles[current_vehicle] = '\n'.join(current_statements)

    return vehicles


def main():
    print("Extracting Phase 4 updates by vehicle...")

    vehicles = extract_phase4_by_vehicle()

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Found {len(vehicles)} vehicles with updates")

    # Write separate files for each vehicle
    for vehicle_code, sql_content in vehicles.items():
        output_file = os.path.join(OUTPUT_DIR, f"phase4_{vehicle_code}.sql")

        # Count UPDATE statements
        update_count = sql_content.count('UPDATE ')

        with open(output_file, 'w') as f:
            f.write(f"-- Phase 4: {vehicle_code} Updates\n")
            f.write(f"-- {update_count} UPDATE statements\n\n")
            f.write(sql_content)

        print(f"  {vehicle_code}: {update_count} updates -> {output_file}")

    # Create combined file
    combined_file = os.path.join(OUTPUT_DIR, "phase4_all.sql")
    with open(combined_file, 'w') as f:
        f.write("-- Phase 4: All Subscription & Position Updates\n")
        f.write(f"-- Total vehicles: {len(vehicles)}\n\n")

        for vehicle_code, sql_content in vehicles.items():
            f.write(f"\n-- === {vehicle_code} ===\n")
            f.write(sql_content)
            f.write("\n")

    print(f"\nCombined file: {combined_file}")


if __name__ == "__main__":
    main()
