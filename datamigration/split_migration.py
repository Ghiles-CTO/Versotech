#!/usr/bin/env python3
"""
Split migration SQL into vehicle-specific batches.
"""

import re
import os

INPUT_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/migration_complete_v2.sql"
OUTPUT_DIR = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/batches"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Read full SQL
with open(INPUT_FILE, 'r') as f:
    content = f.read()

# Split by vehicle section
sections = re.split(r'-- =+\n-- (VC\d+):', content)

# Process sections
batch_num = 1
for i in range(1, len(sections), 2):
    if i+1 < len(sections):
        vehicle = sections[i]
        sql = sections[i+1]

        # Extract just INSERT statements
        inserts = []
        for line in sql.split('\n'):
            if line.strip():
                inserts.append(line)

        # Join back
        batch_sql = '\n'.join(inserts)

        # Write batch file
        batch_file = f"{OUTPUT_DIR}/batch_{batch_num:02d}_{vehicle}.sql"
        with open(batch_file, 'w') as f:
            f.write(f"-- Batch {batch_num}: {vehicle}\n")
            f.write(batch_sql)

        print(f"Created: {batch_file}")
        batch_num += 1

print(f"\nTotal batches: {batch_num - 1}")
