-- =============================================================================
-- Phase 1: Multi-User Entity Infrastructure Migration
-- Applied: December 18, 2025 via Supabase Management API
-- This file documents the schema changes that were applied directly
-- =============================================================================

-- NOTE: This migration was already applied to the production database via
-- the Supabase Management API on December 18, 2025. This file serves as
-- documentation and version control for the changes.

-- =============================================================================
-- 1. USER_ROLE ENUM EXTENSION
-- =============================================================================
-- Added values: arranger, introducer, partner, commercial_partner, lawyer, ceo
-- Full enum: investor, staff_admin, staff_ops, staff_rm, arranger, introducer,
--            partner, commercial_partner, lawyer, ceo

-- =============================================================================
-- 2. DEAL_MEMBER_ROLE ENUM EXTENSION
-- =============================================================================
-- Added values: partner_investor, introducer_investor, commercial_partner_investor,
--               commercial_partner_proxy
-- Full enum: investor, co_investor, spouse, advisor, lawyer, banker, introducer,
--            viewer, verso_staff, partner_investor, introducer_investor,
--            commercial_partner_investor, commercial_partner_proxy

-- =============================================================================
-- 3. INVESTOR_USERS TABLE ENHANCEMENT
-- =============================================================================
-- Added columns: role, is_primary, can_sign, created_at, created_by

-- =============================================================================
-- 4. DEAL_MEMBERSHIPS JOURNEY TRACKING COLUMNS
-- =============================================================================
-- Added columns: dispatched_at, viewed_at, interest_confirmed_at,
--                nda_signed_at, data_room_granted_at

-- =============================================================================
-- 5. SUBSCRIPTIONS PACK TRACKING COLUMNS
-- =============================================================================
-- Added columns: pack_generated_at, pack_sent_at, signed_at, funded_at, activated_at

-- =============================================================================
-- 6. NEW ENTITY TABLES (Three-Table Pattern)
-- =============================================================================

-- Partners: partners + partner_users + partner_members
-- Commercial Partners: commercial_partners + commercial_partner_users + commercial_partner_members
-- Lawyers: lawyers + lawyer_users + lawyer_members
-- Introducers: introducer_users + introducer_members (core table existed)
-- Arrangers: arranger_users + arranger_members (core table existed)

-- =============================================================================
-- 7. SUPPORTING TABLES
-- =============================================================================
-- commercial_partner_clients (proxy mode support)
-- placement_agreements (commercial partner agreements)
-- introducer_agreements (introducer fee agreements)
-- companies (deal companies/startups)
-- company_valuations (valuation history)

-- =============================================================================
-- 8. FUNCTIONS
-- =============================================================================
-- get_user_personas(p_user_id uuid) - Returns all personas for a user
-- get_investor_journey_stage(p_deal_id uuid, p_investor_id uuid) - Returns 10-stage journey

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- To verify tables exist:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public'
-- AND tablename IN ('partners', 'partner_users', 'commercial_partners', 'lawyers');

-- To verify enum values:
-- SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
-- WHERE t.typname = 'user_role' ORDER BY enumsortorder;

-- To test persona function:
-- SELECT * FROM get_user_personas('user-uuid-here');

-- To test journey function:
-- SELECT * FROM get_investor_journey_stage('deal-uuid', 'investor-uuid');
