-- =============================================================================
-- Migration: Fix get_user_personas() - Add entity_logo_url column
-- Date: December 18, 2025
-- Purpose: Add logo_url to entity tables that are missing it, and extend
--          get_user_personas() function to return entity_logo_url
-- =============================================================================

-- Step 1: Add logo_url columns to tables that don't have them
-- =============================================================================

-- Investors table - add logo_url
ALTER TABLE investors ADD COLUMN IF NOT EXISTS logo_url text;
COMMENT ON COLUMN investors.logo_url IS 'URL to investor entity logo for portal branding';

-- Arranger entities table - add logo_url
ALTER TABLE arranger_entities ADD COLUMN IF NOT EXISTS logo_url text;
COMMENT ON COLUMN arranger_entities.logo_url IS 'URL to arranger entity logo for portal branding';

-- Partners table - add logo_url
ALTER TABLE partners ADD COLUMN IF NOT EXISTS logo_url text;
COMMENT ON COLUMN partners.logo_url IS 'URL to partner entity logo for portal branding';

-- Commercial Partners table - add logo_url
ALTER TABLE commercial_partners ADD COLUMN IF NOT EXISTS logo_url text;
COMMENT ON COLUMN commercial_partners.logo_url IS 'URL to commercial partner entity logo for portal branding';

-- Introducers table - add logo_url
ALTER TABLE introducers ADD COLUMN IF NOT EXISTS logo_url text;
COMMENT ON COLUMN introducers.logo_url IS 'URL to introducer entity logo for portal branding';

-- Step 2: Drop and recreate get_user_personas() with logo_url
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_user_personas(uuid);

CREATE OR REPLACE FUNCTION public.get_user_personas(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  persona_type text,
  entity_id uuid,
  entity_name text,
  entity_logo_url text,  -- NEW: Logo URL for persona switcher
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

  -- Staff/CEO (from profiles.role)
  -- NOTE: persona_type is 'staff', use role_in_entity to distinguish CEO from other staff
  SELECT
    'staff'::text,
    p.id,
    p.display_name,
    p.avatar_url,  -- Use avatar_url as logo for staff
    p.role::text,  -- This contains 'ceo', 'staff_admin', etc.
    true,
    false,
    false
  FROM profiles p
  WHERE p.id = p_user_id
    AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')

  UNION ALL

  -- Investors (has logo_url)
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

  -- Arrangers (has logo_url on arranger_entities)
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

  -- Introducers (now has logo_url)
  SELECT
    'introducer'::text,
    iu.introducer_id,
    intr.legal_name,
    intr.logo_url,  -- NOW AVAILABLE
    iu.role,
    iu.is_primary,
    COALESCE(iu.can_sign, false),
    false
  FROM introducer_users iu
  JOIN introducers intr ON intr.id = iu.introducer_id
  WHERE iu.user_id = p_user_id

  UNION ALL

  -- Partners (now has logo_url)
  SELECT
    'partner'::text,
    pu.partner_id,
    COALESCE(pa.name, pa.legal_name),
    pa.logo_url,  -- NOW AVAILABLE
    pu.role,
    pu.is_primary,
    COALESCE(pu.can_sign, false),
    false
  FROM partner_users pu
  JOIN partners pa ON pa.id = pu.partner_id
  WHERE pu.user_id = p_user_id

  UNION ALL

  -- Commercial Partners (now has logo_url)
  SELECT
    'commercial_partner'::text,
    cpu.commercial_partner_id,
    COALESCE(cp.name, cp.legal_name),
    cp.logo_url,  -- NOW AVAILABLE
    cpu.role,
    cpu.is_primary,
    COALESCE(cpu.can_sign, false),
    COALESCE(cpu.can_execute_for_clients, false)
  FROM commercial_partner_users cpu
  JOIN commercial_partners cp ON cp.id = cpu.commercial_partner_id
  WHERE cpu.user_id = p_user_id

  UNION ALL

  -- Lawyers (has logo_url)
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

-- Step 3: Add comment documenting the function
-- =============================================================================

COMMENT ON FUNCTION public.get_user_personas(uuid) IS
'Returns all personas (roles) for a given user ID. Each row represents a different
entity the user has access to.

IMPORTANT: For CEO detection, check persona_type=''staff'' AND role_in_entity=''ceo''.
The function returns ''staff'' as persona_type for all staff roles (ceo, staff_admin,
staff_ops, staff_rm). The actual role is in the role_in_entity column.

Returns:
- persona_type: staff, investor, arranger, introducer, partner, commercial_partner, lawyer
- entity_id: UUID of the entity (or profile ID for staff)
- entity_name: Display name of the entity
- entity_logo_url: URL to entity logo for branding (nullable)
- role_in_entity: User''s role within that entity (admin, member, ceo, etc.)
- is_primary: Whether this is the user''s primary entity of this type
- can_sign: Whether user can sign documents for this entity
- can_execute_for_clients: For commercial partners, whether user can act on behalf of clients';
