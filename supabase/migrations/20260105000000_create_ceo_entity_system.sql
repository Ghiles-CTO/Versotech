-- =============================================================================
-- Migration: Create CEO Entity System
-- Date: January 5, 2026
-- Purpose: Implement CEO as an entity (Verso Capital) with multiple users
--          following existing entity patterns (investors, arrangers, etc.)
-- =============================================================================

-- =============================================================================
-- STEP 1: Create ceo_entity table (stores Verso Capital company info)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ceo_entity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core identity
  legal_name TEXT NOT NULL,
  display_name TEXT,

  -- Registration info
  registration_number TEXT,
  tax_id TEXT,

  -- Address
  registered_address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Branding
  logo_url TEXT,

  -- Flexible metadata (beneficial owners, insurance, etc.)
  metadata JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

-- Ensure only ONE row can ever exist (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS ceo_entity_singleton ON ceo_entity ((true));

COMMENT ON TABLE ceo_entity IS 'Stores the CEO entity (Verso Capital) company information. Only ONE row should ever exist.';

-- =============================================================================
-- STEP 2: Create ceo_users table (members of Verso Capital)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ceo_users (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  can_sign BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  title TEXT,  -- Their title at Verso Capital (CEO, COO, CFO, etc.)
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Only one primary user allowed
CREATE UNIQUE INDEX IF NOT EXISTS ceo_users_single_primary ON ceo_users (is_primary) WHERE is_primary = true;

COMMENT ON TABLE ceo_users IS 'Junction table linking users to the CEO entity (Verso Capital). Users here have CEO portal access.';
COMMENT ON COLUMN ceo_users.role IS 'User role: admin (full access), member (standard access), viewer (read-only)';
COMMENT ON COLUMN ceo_users.can_sign IS 'Whether this user can sign documents on behalf of Verso Capital';
COMMENT ON COLUMN ceo_users.is_primary IS 'Primary contact for the CEO entity (only one allowed)';
COMMENT ON COLUMN ceo_users.title IS 'User title at Verso Capital (e.g., CEO, COO, CFO)';

-- =============================================================================
-- STEP 3: Enable RLS and create policies
-- =============================================================================

ALTER TABLE ceo_entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_users ENABLE ROW LEVEL SECURITY;

-- CEO Entity policies
-- SELECT: Any CEO user can view
CREATE POLICY "ceo_entity_select" ON ceo_entity FOR SELECT
USING (
  EXISTS (SELECT 1 FROM ceo_users WHERE user_id = auth.uid())
);

-- UPDATE: Any CEO admin can update
CREATE POLICY "ceo_entity_update" ON ceo_entity FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM ceo_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- INSERT: Service role only (handled via migration)
CREATE POLICY "ceo_entity_insert" ON ceo_entity FOR INSERT
WITH CHECK (false);  -- No direct inserts allowed

-- DELETE: Never allowed
CREATE POLICY "ceo_entity_delete" ON ceo_entity FOR DELETE
USING (false);

-- CEO Users policies
-- SELECT: Any CEO user can view all members
CREATE POLICY "ceo_users_select" ON ceo_users FOR SELECT
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid())
);

-- INSERT: Any CEO admin can invite new members
CREATE POLICY "ceo_users_insert" ON ceo_users FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

-- UPDATE: Any CEO admin can update members
CREATE POLICY "ceo_users_update" ON ceo_users FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
);

-- DELETE: Any CEO admin can remove members (except themselves)
CREATE POLICY "ceo_users_delete" ON ceo_users FOR DELETE
USING (
  EXISTS (SELECT 1 FROM ceo_users cu WHERE cu.user_id = auth.uid() AND cu.role = 'admin')
  AND user_id != auth.uid()  -- Can't remove yourself
);

-- =============================================================================
-- STEP 4: Seed Verso Capital entity
-- =============================================================================

INSERT INTO ceo_entity (legal_name, display_name, country, status)
VALUES ('Verso Capital', 'Verso Capital', 'Luxembourg', 'active')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 5: Migrate existing CEO user (Julian) from profiles.role to ceo_users
-- =============================================================================

-- Insert any existing CEO users into ceo_users table
INSERT INTO ceo_users (user_id, role, can_sign, is_primary, title)
SELECT
  id as user_id,
  'admin' as role,
  true as can_sign,
  true as is_primary,
  'CEO' as title
FROM profiles
WHERE role = 'ceo'
ON CONFLICT (user_id) DO NOTHING;

-- Also migrate staff_admin users who should have CEO access
-- They get admin role but not primary and not can_sign by default
INSERT INTO ceo_users (user_id, role, can_sign, is_primary, title)
SELECT
  id as user_id,
  'admin' as role,
  false as can_sign,
  false as is_primary,
  title as title
FROM profiles
WHERE role = 'staff_admin'
  AND id NOT IN (SELECT user_id FROM ceo_users)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- STEP 6: Update get_user_personas() to include CEO from ceo_users
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_user_personas(uuid);

CREATE OR REPLACE FUNCTION public.get_user_personas(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  persona_type text,
  entity_id uuid,
  entity_name text,
  entity_logo_url text,
  role_in_entity text,
  is_primary boolean,
  can_sign boolean,
  can_execute_for_clients boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY

  -- ==========================================================================
  -- CEO (from ceo_users + ceo_entity) - NEW!
  -- ==========================================================================
  SELECT
    'ceo'::text,
    ce.id,
    ce.display_name,
    ce.logo_url,
    cu.role,
    cu.is_primary,
    cu.can_sign,
    false
  FROM ceo_users cu
  CROSS JOIN ceo_entity ce  -- Only ONE row, so CROSS JOIN works
  WHERE cu.user_id = p_user_id

  UNION ALL

  -- ==========================================================================
  -- Staff (non-CEO staff roles only: staff_ops, staff_rm)
  -- NOTE: We keep staff persona for non-CEO staff roles
  -- ==========================================================================
  SELECT
    'staff'::text,
    p.id,
    p.display_name,
    p.avatar_url,
    p.role::text,
    true,
    false,
    false
  FROM profiles p
  WHERE p.id = p_user_id
    AND p.role IN ('staff_ops', 'staff_rm')
    -- Exclude ceo and staff_admin - they now use ceo_users table
    AND p.role NOT IN ('ceo', 'staff_admin')

  UNION ALL

  -- ==========================================================================
  -- Investors
  -- ==========================================================================
  SELECT
    'investor'::text,
    iu.investor_id,
    i.display_name,
    i.logo_url,
    COALESCE(iu.role, 'member'),
    COALESCE(iu.is_primary, false),
    COALESCE(iu.can_sign, false),
    false
  FROM investor_users iu
  JOIN investors i ON i.id = iu.investor_id
  WHERE iu.user_id = p_user_id

  UNION ALL

  -- ==========================================================================
  -- Arrangers
  -- ==========================================================================
  SELECT
    'arranger'::text,
    au.arranger_id,
    ae.legal_name,
    ae.logo_url,
    au.role,
    au.is_primary,
    false,
    false
  FROM arranger_users au
  JOIN arranger_entities ae ON ae.id = au.arranger_id
  WHERE au.user_id = p_user_id

  UNION ALL

  -- ==========================================================================
  -- Introducers
  -- ==========================================================================
  SELECT
    'introducer'::text,
    iu.introducer_id,
    intr.legal_name,
    intr.logo_url,
    iu.role,
    iu.is_primary,
    COALESCE(iu.can_sign, false),
    false
  FROM introducer_users iu
  JOIN introducers intr ON intr.id = iu.introducer_id
  WHERE iu.user_id = p_user_id

  UNION ALL

  -- ==========================================================================
  -- Partners
  -- ==========================================================================
  SELECT
    'partner'::text,
    pu.partner_id,
    COALESCE(pa.name, pa.legal_name),
    pa.logo_url,
    pu.role,
    pu.is_primary,
    COALESCE(pu.can_sign, false),
    false
  FROM partner_users pu
  JOIN partners pa ON pa.id = pu.partner_id
  WHERE pu.user_id = p_user_id

  UNION ALL

  -- ==========================================================================
  -- Commercial Partners
  -- ==========================================================================
  SELECT
    'commercial_partner'::text,
    cpu.commercial_partner_id,
    COALESCE(cp.name, cp.legal_name),
    cp.logo_url,
    cpu.role,
    cpu.is_primary,
    COALESCE(cpu.can_sign, false),
    COALESCE(cpu.can_execute_for_clients, false)
  FROM commercial_partner_users cpu
  JOIN commercial_partners cp ON cp.id = cpu.commercial_partner_id
  WHERE cpu.user_id = p_user_id

  UNION ALL

  -- ==========================================================================
  -- Lawyers
  -- ==========================================================================
  SELECT
    'lawyer'::text,
    lu.lawyer_id,
    l.display_name,
    l.logo_url,
    lu.role,
    lu.is_primary,
    false,
    false
  FROM lawyer_users lu
  JOIN lawyers l ON l.id = lu.lawyer_id
  WHERE lu.user_id = p_user_id;
END;
$function$;

COMMENT ON FUNCTION public.get_user_personas(uuid) IS
'Returns all personas (roles) for a given user ID. Each row represents a different
entity the user has access to.

UPDATED: CEO is now a separate persona type (not staff). CEO users are stored in
ceo_users table, linked to the single ceo_entity row (Verso Capital).

Returns:
- persona_type: ceo, staff, investor, arranger, introducer, partner, commercial_partner, lawyer
- entity_id: UUID of the entity
- entity_name: Display name of the entity
- entity_logo_url: URL to entity logo for branding (nullable)
- role_in_entity: User role within that entity (admin, member, viewer, etc.)
- is_primary: Whether this is the user primary entity of this type
- can_sign: Whether user can sign documents for this entity
- can_execute_for_clients: For commercial partners, whether user can act on behalf of clients';

-- =============================================================================
-- STEP 7: Create updated_at trigger for ceo_entity
-- =============================================================================

CREATE OR REPLACE FUNCTION update_ceo_entity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ceo_entity_updated_at ON ceo_entity;
CREATE TRIGGER ceo_entity_updated_at
  BEFORE UPDATE ON ceo_entity
  FOR EACH ROW
  EXECUTE FUNCTION update_ceo_entity_updated_at();
