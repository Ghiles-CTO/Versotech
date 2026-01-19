#!/usr/bin/env python3
"""
Extract individual UPDATE statements from the SQL file for batch execution.
Outputs statements in batches of 50 that can be executed via Supabase MCP.
"""

import re

def main():
    with open('fix_aggregated_positions.sql', 'r') as f:
        content = f.read()

    # Split into individual UPDATE statements
    # Each statement starts with "UPDATE positions p" and ends with ";"
    pattern = r'(UPDATE positions p[\s\S]*?;)'
    statements = re.findall(pattern, content)

    print(f"Found {len(statements)} UPDATE statements")

    # Create batches of 50 statements each
    batch_size = 50
    batches = []

    for i in range(0, len(statements), batch_size):
        batch = statements[i:i+batch_size]
        batch_sql = '\n'.join(batch)
        batches.append(batch_sql)

    print(f"Created {len(batches)} batches of up to {batch_size} statements each")

    # Write each batch to a separate file
    for i, batch in enumerate(batches):
        filename = f'batch_{i+1:02d}.sql'
        with open(filename, 'w') as f:
            f.write(batch)
        print(f"Wrote {filename}")

    # Also write combined SQL for reference
    combined = '\n'.join(statements)
    with open('all_updates.sql', 'w') as f:
        f.write(combined)
    print("Wrote all_updates.sql")

if __name__ == '__main__':
    main()
