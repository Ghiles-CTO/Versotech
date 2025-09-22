-- VERSO Holdings Portal - Complete Deal Extension Migration
-- Master script to apply all deal-related database changes
-- Run this on your Supabase database AFTER the base schema.sql

-- ==========================================================================
-- MIGRATION: Deal Extension v1.0
-- Based on changes.md specification
-- ==========================================================================

-- First, apply the new table schema
\i deals-extension-schema.sql

-- Then, alter existing tables
\i existing-table-alterations.sql

-- Apply RLS policies for new tables
\i deals-extension-rls.sql

-- Finally, create database functions
\i deals-extension-functions.sql

-- ==========================================================================
-- VERIFICATION QUERIES
-- ==========================================================================

-- Verify all new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'deals', 'deal_memberships', 'invite_links',
    'introducers', 'introductions', 'introducer_commissions',
    'share_sources', 'share_lots', 'reservations', 'reservation_lot_items',
    'allocations', 'allocation_lot_items', 'deal_commitments', 'approvals',
    'fee_plans', 'fee_components', 'investor_terms', 'term_sheets',
    'doc_templates', 'doc_packages', 'doc_package_items', 'esign_envelopes',
    'fee_events', 'invoices', 'invoice_lines', 'payments', 
    'bank_transactions', 'reconciliations'
  )
ORDER BY table_name;

-- Verify RLS is enabled on new tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
  AND tablename LIKE '%deal%' OR tablename LIKE '%share%' OR tablename LIKE '%fee%' 
    OR tablename LIKE '%invoice%' OR tablename LIKE '%introduc%'
ORDER BY tablename;

-- Verify functions were created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'fn_%'
ORDER BY routine_name;

-- Check for any constraint violations or issues
SELECT 
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN (
    'deals', 'deal_memberships', 'share_lots', 'reservations', 
    'allocations', 'fee_plans', 'investor_terms'
  )
ORDER BY table_name, constraint_type;
