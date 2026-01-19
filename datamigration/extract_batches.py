#!/usr/bin/env python3
"""
Extract INSERT statements into batch files for execution.
"""

import re
import os

INPUT_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/migration_complete_v2.sql"
OUTPUT_DIR = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/batches"
BATCH_SIZE = 20  # Number of INSERT statements per batch

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Read file
with open(INPUT_FILE, 'r') as f:
    content = f.read()

# Extract all INSERT statements with their comments
# Pattern: optional comment line + INSERT ... LIMIT 1;
pattern = r'(-- Row \d+:.*?\n)?(INSERT INTO introducer_commissions.*?LIMIT 1;)'
matches = re.findall(pattern, content, re.DOTALL)

print(f"Found {len(matches)} INSERT statements")

# Split into batches
batch_num = 1
for i in range(0, len(matches), BATCH_SIZE):
    batch = matches[i:i+BATCH_SIZE]

    # Build batch SQL
    batch_sql = f"-- Batch {batch_num}: Statements {i+1} to {min(i+BATCH_SIZE, len(matches))}\n\n"
    for comment, insert in batch:
        if comment:
            batch_sql += comment
        batch_sql += insert + "\n\n"

    # Write batch file
    batch_file = f"{OUTPUT_DIR}/batch_{batch_num:02d}.sql"
    with open(batch_file, 'w') as f:
        f.write(batch_sql)

    print(f"Created: batch_{batch_num:02d}.sql ({len(batch)} statements)")
    batch_num += 1

print(f"\nTotal batches: {batch_num - 1}")
