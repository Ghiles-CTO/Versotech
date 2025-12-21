-- ============================================================================
-- VERSO HOLDINGS DATABASE SCHEMA DUMP
-- Generated: 2024-12-21
-- Purpose: Schema verification for Codex audit review
-- Source: Production Supabase database (project: ipguxdssecfexudnvtia)
-- Method: Direct SQL queries via mcp__supabase__execute_sql
-- ============================================================================
--
-- VERIFICATION SUMMARY:
-- - Total tables in public schema: 112
-- - Total migrations applied: 254
-- - All Phase 2 tables: EXIST
-- - All Phase 2 RPCs: EXIST
-- - All deal_member_role enum values: EXIST (14 values)
-- - All journey tracking columns: EXIST
-- - All subscription pack columns: EXIST
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: CRITICAL PHASE 2 TABLES - FULL DDL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLE: signature_requests (29 columns)
-- Purpose: Track e-signature requests for documents
-- ----------------------------------------------------------------------------
CREATE TABLE public.signature_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    subscription_id uuid REFERENCES public.subscriptions(id),
    document_id uuid REFERENCES public.documents(id),
    signer_email text NOT NULL,
    signer_name text,
    status text DEFAULT 'pending'::text NOT NULL,
    provider text DEFAULT 'dropbox_sign'::text,
    provider_signature_id text,
    provider_request_id text,
    signed_at timestamp with time zone,
    declined_at timestamp with time zone,
    decline_reason text,
    expires_at timestamp with time zone,
    reminder_sent_at timestamp with time zone,
    signing_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    investor_id uuid REFERENCES public.investors(id),
    signer_role text,
    document_type text,
    workflow_run_id text,
    member_id uuid REFERENCES public.investor_members(id),
    is_primary_signer boolean DEFAULT false,
    signing_order integer,
    deal_id uuid REFERENCES public.deals(id),
    pack_id uuid,
    request_type text DEFAULT 'subscription'::text
);

COMMENT ON TABLE public.signature_requests IS 'Tracks e-signature requests for subscription documents';
COMMENT ON COLUMN public.signature_requests.deal_id IS 'Links signature request to a deal (added in Phase 2)';
COMMENT ON COLUMN public.signature_requests.member_id IS 'Links to investor_members for multi-signatory support';

-- ----------------------------------------------------------------------------
-- TABLE: investor_members (27 columns)
-- Purpose: Track directors, shareholders, beneficial owners, and signatories
-- ----------------------------------------------------------------------------
CREATE TABLE public.investor_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    investor_id uuid NOT NULL REFERENCES public.investors(id),
    full_name text NOT NULL,
    role text NOT NULL, -- director, shareholder, beneficial_owner, authorized_signatory, officer, partner, other
    role_title text,
    email text,
    phone text,
    residential_street text,
    residential_city text,
    residential_state text,
    residential_postal_code text,
    residential_country text,
    nationality text,
    id_type text, -- passport, national_id, drivers_license, other
    id_number text,
    id_expiry_date date,
    ownership_percentage numeric(5,2),
    is_beneficial_owner boolean DEFAULT false,
    is_signatory boolean DEFAULT false,
    can_sign boolean DEFAULT false,
    signature_specimen_url text,
    signature_specimen_uploaded_at timestamp with time zone,
    effective_from date,
    effective_to date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.investor_members IS 'Tracks entity members: directors, shareholders, beneficial owners, authorized signatories';
COMMENT ON COLUMN public.investor_members.is_signatory IS 'Whether this member is an authorized signatory for the investor entity';
COMMENT ON COLUMN public.investor_members.can_sign IS 'Whether this member can sign documents on behalf of the entity';
COMMENT ON COLUMN public.investor_members.signature_specimen_url IS 'URL to uploaded signature specimen image';

-- ----------------------------------------------------------------------------
-- TABLE: deal_data_room_access (11 columns)
-- Purpose: Track investor access to deal data rooms with expiry
-- ----------------------------------------------------------------------------
CREATE TABLE public.deal_data_room_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    deal_id uuid NOT NULL REFERENCES public.deals(id),
    investor_id uuid NOT NULL REFERENCES public.investors(id),
    granted_at timestamp with time zone DEFAULT now(),
    granted_by uuid REFERENCES auth.users(id),
    expires_at timestamp with time zone NOT NULL,
    extended_at timestamp with time zone,
    extended_by uuid REFERENCES auth.users(id),
    extension_count integer DEFAULT 0,
    revoked_at timestamp with time zone,
    revoked_by uuid REFERENCES auth.users(id),
    UNIQUE(deal_id, investor_id)
);

COMMENT ON TABLE public.deal_data_room_access IS 'Tracks investor access to deal data rooms with 7-day expiry and extension capability';

-- ----------------------------------------------------------------------------
-- TABLE: investor_deal_interest (10 columns)
-- Purpose: Track investor expressions of interest in deals
-- ----------------------------------------------------------------------------
CREATE TABLE public.investor_deal_interest (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    investor_id uuid NOT NULL REFERENCES public.investors(id),
    deal_id uuid NOT NULL REFERENCES public.deals(id),
    expressed_at timestamp with time zone DEFAULT now(),
    expressed_by uuid REFERENCES auth.users(id),
    indicative_amount numeric(18,2),
    notes text,
    status text DEFAULT 'interested'::text, -- interested, converted, withdrawn
    converted_at timestamp with time zone,
    withdrawn_at timestamp with time zone,
    UNIQUE(investor_id, deal_id)
);

COMMENT ON TABLE public.investor_deal_interest IS 'Tracks investor expressions of interest in deals';

-- ----------------------------------------------------------------------------
-- TABLE: deal_signatory_ndas (9 columns)
-- Purpose: Track NDA signatures by individual signatories
-- ----------------------------------------------------------------------------
CREATE TABLE public.deal_signatory_ndas (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    deal_id uuid NOT NULL REFERENCES public.deals(id),
    investor_id uuid NOT NULL REFERENCES public.investors(id),
    member_id uuid NOT NULL REFERENCES public.investor_members(id),
    signature_request_id uuid REFERENCES public.signature_requests(id),
    signed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    UNIQUE(deal_id, investor_id, member_id)
);

COMMENT ON TABLE public.deal_signatory_ndas IS 'Tracks NDA signatures by individual signatories for multi-signatory investors';

-- ----------------------------------------------------------------------------
-- TABLE: deal_memberships (14 columns) - Journey Tracking Columns
-- Purpose: Links users to deals with journey tracking
-- ----------------------------------------------------------------------------
-- Note: This table already existed, but Phase 2 added journey tracking columns
-- Showing only the key columns for verification:

-- All journey tracking columns that exist in deal_memberships:
-- 1. id (uuid, PK)
-- 2. deal_id (uuid, FK to deals)
-- 3. user_id (uuid, FK to auth.users)
-- 4. investor_id (uuid, FK to investors)
-- 5. role (deal_member_role enum)
-- 6. dispatched_at (timestamptz) -- When deal was dispatched to this member
-- 7. viewed_at (timestamptz) -- When member first viewed the deal
-- 8. interest_confirmed_at (timestamptz) -- When member confirmed interest
-- 9. nda_signed_at (timestamptz) -- When NDA was signed
-- 10. data_room_granted_at (timestamptz) -- When data room access was granted
-- 11. created_at (timestamptz)
-- 12. updated_at (timestamptz)
-- 13. invited_by (uuid)
-- 14. referring_partner_id (uuid) -- Added for referral tracking

-- Verification query result for deal_memberships columns:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'deal_memberships';
-- Result: id, deal_id, user_id, investor_id, role, dispatched_at, viewed_at,
--         interest_confirmed_at, nda_signed_at, data_room_granted_at, created_at,
--         updated_at, invited_by, referring_partner_id

-- ----------------------------------------------------------------------------
-- TABLE: subscriptions - Pack Workflow Columns
-- Purpose: Investor commitments to vehicles with subscription pack tracking
-- ----------------------------------------------------------------------------
-- Note: Phase 2 added several columns for subscription pack workflow
-- Key columns verified to exist:

-- Pack workflow columns in subscriptions table:
-- 1. deal_id (uuid, FK to deals) -- Links subscription to originating deal
-- 2. funded_amount (numeric) -- Actual funded amount
-- 3. pack_generated_at (timestamptz) -- When subscription pack was generated
-- 4. pack_sent_at (timestamptz) -- When pack was sent to investor
-- 5. signed_at (timestamptz) -- When pack was signed
-- 6. funded_at (timestamptz) -- When funding was received
-- 7. activated_at (timestamptz) -- When subscription was activated

-- Verification query result:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'subscriptions'
-- AND column_name IN ('deal_id', 'funded_amount', 'pack_generated_at', 'pack_sent_at', 'signed_at', 'funded_at', 'activated_at');
-- Result: deal_id, funded_amount, pack_generated_at, pack_sent_at, signed_at, funded_at, activated_at
-- (All 7 columns exist)


-- ============================================================================
-- SECTION 2: PHASE 2 RPCs (FUNCTIONS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FUNCTION: get_user_personas(p_user_id uuid)
-- Purpose: Returns all personas (roles) a user has across the platform
-- Returns: investor_id, partner_id, introducer_id, arranger_id, lawyer_id,
--          commercial_partner_id, investor_name, partner_name, etc.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_personas(p_user_id uuid)
RETURNS TABLE (
    investor_id uuid,
    investor_name text,
    investor_logo_url text,
    partner_id uuid,
    partner_name text,
    partner_logo_url text,
    introducer_id uuid,
    introducer_name text,
    introducer_logo_url text,
    arranger_id uuid,
    arranger_name text,
    arranger_logo_url text,
    lawyer_id uuid,
    lawyer_name text,
    lawyer_logo_url text,
    commercial_partner_id uuid,
    commercial_partner_name text,
    commercial_partner_logo_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Investor persona
        iu.investor_id,
        i.name AS investor_name,
        i.logo_url AS investor_logo_url,
        -- Partner persona
        pu.partner_id,
        p.name AS partner_name,
        p.logo_url AS partner_logo_url,
        -- Introducer persona
        intu.introducer_id,
        intr.name AS introducer_name,
        intr.logo_url AS introducer_logo_url,
        -- Arranger persona
        au.arranger_id,
        a.name AS arranger_name,
        a.logo_url AS arranger_logo_url,
        -- Lawyer persona
        lu.lawyer_id,
        l.name AS lawyer_name,
        l.logo_url AS lawyer_logo_url,
        -- Commercial Partner persona
        cpu.commercial_partner_id,
        cp.name AS commercial_partner_name,
        cp.logo_url AS commercial_partner_logo_url
    FROM (SELECT p_user_id AS user_id) AS u
    LEFT JOIN investor_users iu ON iu.user_id = u.user_id
    LEFT JOIN investors i ON i.id = iu.investor_id
    LEFT JOIN partner_users pu ON pu.user_id = u.user_id
    LEFT JOIN partners p ON p.id = pu.partner_id
    LEFT JOIN introducer_users intu ON intu.user_id = u.user_id
    LEFT JOIN introducers intr ON intr.id = intu.introducer_id
    LEFT JOIN arranger_users au ON au.user_id = u.user_id
    LEFT JOIN arrangers a ON a.id = au.arranger_id
    LEFT JOIN lawyer_users lu ON lu.user_id = u.user_id
    LEFT JOIN lawyers l ON l.id = lu.lawyer_id
    LEFT JOIN commercial_partner_users cpu ON cpu.user_id = u.user_id
    LEFT JOIN commercial_partners cp ON cp.id = cpu.commercial_partner_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_personas IS 'Returns all personas (investor, partner, introducer, arranger, lawyer, commercial_partner) for a user with names and logos';

-- ----------------------------------------------------------------------------
-- FUNCTION: check_all_signatories_signed(p_deal_id uuid, p_investor_id uuid)
-- Purpose: Check if all required signatories have signed the NDA for a deal
-- Returns: all_signed (boolean), total_required (int), total_signed (int)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_all_signatories_signed(
    p_deal_id uuid,
    p_investor_id uuid
)
RETURNS TABLE (
    all_signed boolean,
    total_required integer,
    total_signed integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_required integer;
    v_total_signed integer;
BEGIN
    -- Count required signatories (members marked as is_signatory or can_sign)
    SELECT COUNT(*) INTO v_total_required
    FROM investor_members
    WHERE investor_id = p_investor_id
      AND is_active = true
      AND (is_signatory = true OR can_sign = true);

    -- Count signed NDAs
    SELECT COUNT(*) INTO v_total_signed
    FROM deal_signatory_ndas
    WHERE deal_id = p_deal_id
      AND investor_id = p_investor_id
      AND signed_at IS NOT NULL;

    RETURN QUERY SELECT
        (v_total_signed >= v_total_required AND v_total_required > 0) AS all_signed,
        v_total_required AS total_required,
        v_total_signed AS total_signed;
END;
$$;

COMMENT ON FUNCTION public.check_all_signatories_signed IS 'Checks if all required signatories have signed the NDA for a deal/investor combination';


-- ============================================================================
-- SECTION 3: ENUMS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUM: deal_member_role (14 values)
-- Purpose: Defines roles for deal membership
-- ----------------------------------------------------------------------------
-- Verification query:
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.deal_member_role'::regtype ORDER BY enumsortorder;

CREATE TYPE public.deal_member_role AS ENUM (
    'investor',
    'co_investor',
    'spouse',
    'advisor',
    'lawyer',
    'banker',
    'introducer',
    'viewer',
    'verso_staff',
    'partner_investor',          -- Added in Phase 2
    'introducer_investor',       -- Added in Phase 2
    'commercial_partner_investor', -- Added in Phase 2
    'commercial_partner_proxy',  -- Added in Phase 2
    'arranger'                   -- Added in Phase 2
);

COMMENT ON TYPE public.deal_member_role IS 'Roles for deal membership including Phase 2 partner/introducer/CP/arranger roles';


-- ============================================================================
-- SECTION 4: ALL TABLES IN PUBLIC SCHEMA (112 total)
-- ============================================================================
-- Query: SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Tables list (alphabetical):
-- 1. activity_feeds
-- 2. allocations
-- 3. approval_actions
-- 4. approval_histories
-- 5. approval_notes
-- 6. approvals
-- 7. arranger_users
-- 8. arrangers
-- 9. audit_logs
-- 10. bank_accounts
-- 11. capital_calls
-- 12. capital_transactions
-- 13. client_transactions
-- 14. commercial_partner_users
-- 15. commercial_partners
-- 16. conversation_messages
-- 17. conversation_participants
-- 18. conversations
-- 19. currencies
-- 20. data_room_access
-- 21. deal_data_room_access
-- 22. deal_documents
-- 23. deal_folders
-- 24. deal_memberships
-- 25. deal_signatory_ndas
-- 26. deal_vehicles
-- 27. deals
-- 28. distribution_line_items
-- 29. distributions
-- 30. document_access_logs
-- 31. document_delivery_logs
-- 32. document_publish_schedules
-- 33. documents
-- 34. email_attachments
-- 35. email_audit
-- 36. email_templates
-- 37. emails
-- 38. entity_contacts
-- 39. entity_documents
-- 40. escrow_accounts
-- 41. fee_components
-- 42. fee_events
-- 43. fee_types
-- 44. fees
-- 45. fund_structures
-- 46. holdings
-- 47. introducer_commissions
-- 48. introducer_deals
-- 49. introducer_investors
-- 50. introducer_users
-- 51. introducers
-- 52. investor_deal_interest
-- 53. investor_documents
-- 54. investor_members
-- 55. investor_users
-- 56. investor_vehicles
-- 57. investors
-- 58. invoice_line_items
-- 59. invoices
-- 60. kyc_document_reviews
-- 61. kyc_documents
-- 62. kyc_review_notes
-- 63. kyc_submissions
-- 64. lawyer_users
-- 65. lawyers
-- 66. lead_sources
-- 67. logs
-- 68. management_fee_calculations
-- 69. message_read_status
-- 70. messages
-- 71. notifications
-- 72. onboarding_checklist_items
-- 73. onboarding_checklists
-- 74. opportunities
-- 75. partner_users
-- 76. partners
-- 77. payment_transactions
-- 78. performance_fees
-- 79. portfolio_companies
-- 80. positions
-- 81. profiles
-- 82. reconciliation_batches
-- 83. reconciliation_items
-- 84. report_configurations
-- 85. report_executions
-- 86. reservations
-- 87. share_prices
-- 88. shares
-- 89. signature_requests
-- 90. signing_workflow_locks
-- 91. staff_profiles
-- 92. subscription_documents
-- 93. subscription_fees
-- 94. subscriptions
-- 95. system_settings
-- 96. task_assignments
-- 97. task_attachments
-- 98. task_categories
-- 99. task_comments
-- 100. task_templates
-- 101. tasks
-- 102. transaction_reconciliations
-- 103. transactions
-- 104. user_notifications
-- 105. user_preferences
-- 106. user_sessions
-- 107. valuation_history
-- 108. valuations
-- 109. vehicle_documents
-- 110. vehicle_valuations
-- 111. vehicles
-- 112. workflow_executions


-- ============================================================================
-- SECTION 5: PERSONA LINK TABLES (for multi-persona support)
-- ============================================================================

-- All persona link tables exist:
-- 1. investor_users (user_id -> investor_id)
-- 2. partner_users (user_id -> partner_id)
-- 3. introducer_users (user_id -> introducer_id)
-- 4. arranger_users (user_id -> arranger_id)
-- 5. lawyer_users (user_id -> lawyer_id)
-- 6. commercial_partner_users (user_id -> commercial_partner_id)


-- ============================================================================
-- SECTION 6: MIGRATIONS APPLIED
-- ============================================================================
-- Query: SELECT COUNT(*) FROM supabase_migrations.schema_migrations;
-- Result: 254 migrations applied

-- Recent migrations (last 10):
-- 20251220224926_add_arranger_role_to_enum
-- 20251219152240_add_deal_id_to_signature_requests
-- 20251218110000_add_referral_tracking_to_deal_memberships
-- 20251218100000_fix_get_user_personas_add_logos
-- 20251218000000_phase1_multiuser_entity_infrastructure
-- ... and 249 more


-- ============================================================================
-- SECTION 7: VERIFICATION QUERIES (run these to verify)
-- ============================================================================

-- Verify Phase 2 tables exist:
SELECT
    'signature_requests' AS table_name,
    to_regclass('public.signature_requests') IS NOT NULL AS exists
UNION ALL
SELECT 'investor_members', to_regclass('public.investor_members') IS NOT NULL
UNION ALL
SELECT 'deal_data_room_access', to_regclass('public.deal_data_room_access') IS NOT NULL
UNION ALL
SELECT 'investor_deal_interest', to_regclass('public.investor_deal_interest') IS NOT NULL
UNION ALL
SELECT 'deal_signatory_ndas', to_regclass('public.deal_signatory_ndas') IS NOT NULL;
-- Expected result: All true

-- Verify RPCs exist:
SELECT
    'get_user_personas' AS function_name,
    to_regprocedure('public.get_user_personas(uuid)') IS NOT NULL AS exists
UNION ALL
SELECT
    'check_all_signatories_signed',
    to_regprocedure('public.check_all_signatories_signed(uuid, uuid)') IS NOT NULL;
-- Expected result: All true

-- Verify deal_member_role enum values:
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'public.deal_member_role'::regtype
ORDER BY enumsortorder;
-- Expected result: 14 values including partner_investor, commercial_partner_proxy, arranger

-- Count all tables:
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';
-- Expected result: 112

-- Count migrations:
SELECT COUNT(*) FROM supabase_migrations.schema_migrations;
-- Expected result: 254


-- ============================================================================
-- END OF SCHEMA DUMP
-- ============================================================================
