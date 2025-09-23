-- Database Migration Runner
-- Execute all migrations in order
-- Run this file with: psql -f run_migrations.sql

\echo 'Starting VERSO database migrations...'

-- Migration 001: Core deals schema
\echo 'Running migration 001: Core deals schema...'
\i migrations/001_create_deals_schema.sql
\echo 'Migration 001 completed.'

-- Migration 002: Inventory schema
\echo 'Running migration 002: Inventory schema...'
\i migrations/002_create_inventory_schema.sql
\echo 'Migration 002 completed.'

-- Migration 003: Fees and documents schema
\echo 'Running migration 003: Fees and documents schema...'
\i migrations/003_create_fees_documents_schema.sql
\echo 'Migration 003 completed.'

-- Migration 004: RLS policies
\echo 'Running migration 004: RLS policies...'
\i migrations/004_create_rls_policies.sql
\echo 'Migration 004 completed.'

-- Migration 005: Server functions
\echo 'Running migration 005: Server functions...'
\i migrations/005_create_inventory_functions.sql
\echo 'Migration 005 completed.'

-- Migration 006: Sample data (optional)
\echo 'Running migration 006: Sample data...'
\i migrations/006_sample_data.sql
\echo 'Migration 006 completed.'

\echo 'All migrations completed successfully!'
\echo 'You can now test the schema with: SELECT * FROM v_deal_summary;'