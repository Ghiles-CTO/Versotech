#!/bin/bash

BASELINE="supabase/migrations/00000000000000_baseline.sql"

# Function to extract table schema
extract_table() {
    local table_name=$1
    local start_line=$(grep -n "CREATE TABLE.*\"public\".\"$table_name\"" "$BASELINE" | cut -d: -f1)
    
    if [ -z "$start_line" ]; then
        echo "Table $table_name not found"
        return
    fi
    
    echo "=== $table_name (starting at line $start_line) ==="
    
    # Extract from CREATE TABLE to the next CREATE TABLE or ALTER TABLE OWNER
    awk -v start="$start_line" 'NR >= start && /^CREATE TABLE/ { found=1 } found { print; if (/^);$/) exit }' "$BASELINE"
    echo ""
}

# Extract each table
for table in activity_feed allocations capital_calls cashflows deals distributions fee_events investor_users performance_snapshots positions profiles subscriptions valuations vehicles; do
    extract_table "$table"
done
