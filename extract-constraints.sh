#!/bin/bash

BASELINE="supabase/migrations/00000000000000_baseline.sql"

echo "=== PRIMARY KEYS ==="
grep -E "ALTER TABLE.*\"(activity_feed|allocations|capital_calls|cashflows|deals|distributions|fee_events|investor_users|performance_snapshots|positions|profiles|subscriptions|valuations|vehicles)\".*ADD CONSTRAINT.*PRIMARY KEY" "$BASELINE"

echo -e "\n=== FOREIGN KEYS ==="
grep -E "ALTER TABLE.*\"(activity_feed|allocations|capital_calls|cashflows|deals|distributions|fee_events|investor_users|performance_snapshots|positions|profiles|subscriptions|valuations|vehicles)\".*FOREIGN KEY" "$BASELINE"

echo -e "\n=== UNIQUE CONSTRAINTS ==="
grep -E "ALTER TABLE.*\"(activity_feed|allocations|capital_calls|cashflows|deals|distributions|fee_events|investor_users|performance_snapshots|positions|profiles|subscriptions|valuations|vehicles)\".*UNIQUE" "$BASELINE"

echo -e "\n=== INDEXES ==="
grep -E "CREATE.*INDEX.*ON.*\"(activity_feed|allocations|capital_calls|cashflows|deals|distributions|fee_events|investor_users|performance_snapshots|positions|profiles|subscriptions|valuations|vehicles)\"" "$BASELINE"
