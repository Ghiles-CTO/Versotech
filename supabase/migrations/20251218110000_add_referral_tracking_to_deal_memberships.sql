-- Migration: Add referral tracking to deal_memberships
-- Purpose: Enable Arranger/Partner/Introducer/Commercial Partner reporting
-- by tracking which entity referred each investor to each deal.
--
-- This unblocks Phase 6 features:
--   - Arranger: "My Partners", "My Introducers", "My Commercial Partners" pages
--   - Partner: "Partner Transactions", "Shared Transactions" pages
--   - Introducer: Already has `introductions` table, but this provides consistency
--   - Commercial Partner: "Client Transactions" tracking

-- 1. Add referral tracking columns
ALTER TABLE deal_memberships
ADD COLUMN IF NOT EXISTS referred_by_entity_id uuid,
ADD COLUMN IF NOT EXISTS referred_by_entity_type text;

COMMENT ON COLUMN deal_memberships.referred_by_entity_id IS
  'UUID of the entity (partner, introducer, commercial_partner) that referred this investor to the deal';
COMMENT ON COLUMN deal_memberships.referred_by_entity_type IS
  'Type of referring entity: partner, introducer, commercial_partner';

-- 2. Add check constraint for valid entity types
ALTER TABLE deal_memberships
ADD CONSTRAINT chk_referred_by_entity_type
CHECK (referred_by_entity_type IS NULL OR referred_by_entity_type IN ('partner', 'introducer', 'commercial_partner'));

-- 3. Index for efficient lookups (arranger network queries, partner transaction queries)
CREATE INDEX IF NOT EXISTS idx_deal_memberships_referred_by
ON deal_memberships(referred_by_entity_id, referred_by_entity_type)
WHERE referred_by_entity_id IS NOT NULL;

-- 4. Index for arranger mandate queries (deals by arranger)
CREATE INDEX IF NOT EXISTS idx_deals_arranger_entity_id
ON deals(arranger_entity_id)
WHERE arranger_entity_id IS NOT NULL;

-- ============================================================================
-- QUERY EXAMPLES (for reference, not executed)
-- ============================================================================

-- Arranger's Partners (partners who have referred investors to arranger's deals)
-- SELECT DISTINCT p.*
-- FROM partners p
-- JOIN deal_memberships dm ON dm.referred_by_entity_id = p.id
--   AND dm.referred_by_entity_type = 'partner'
-- JOIN deals d ON d.id = dm.deal_id
-- WHERE d.arranger_entity_id = :arranger_id;

-- Arranger's Introducers
-- SELECT DISTINCT i.*
-- FROM introducers i
-- JOIN deal_memberships dm ON dm.referred_by_entity_id = i.id
--   AND dm.referred_by_entity_type = 'introducer'
-- JOIN deals d ON d.id = dm.deal_id
-- WHERE d.arranger_entity_id = :arranger_id;

-- Arranger's Commercial Partners
-- SELECT DISTINCT cp.*
-- FROM commercial_partners cp
-- JOIN deal_memberships dm ON dm.referred_by_entity_id = cp.id
--   AND dm.referred_by_entity_type = 'commercial_partner'
-- JOIN deals d ON d.id = dm.deal_id
-- WHERE d.arranger_entity_id = :arranger_id;

-- Arranger's Mandates (deals they manage)
-- SELECT d.*
-- FROM deals d
-- WHERE d.arranger_entity_id = :arranger_id;

-- Partner's Transactions (investors they referred)
-- SELECT dm.*, inv.*, d.*
-- FROM deal_memberships dm
-- JOIN investors inv ON inv.id = dm.investor_id
-- JOIN deals d ON d.id = dm.deal_id
-- WHERE dm.referred_by_entity_id = :partner_id
--   AND dm.referred_by_entity_type = 'partner';

-- Partner's Shared Deals (deals where other partners also referred investors)
-- SELECT DISTINCT d.*,
--   array_agg(DISTINCT dm2.referred_by_entity_id) as other_partners
-- FROM deals d
-- JOIN deal_memberships dm ON dm.deal_id = d.id
--   AND dm.referred_by_entity_id = :partner_id
--   AND dm.referred_by_entity_type = 'partner'
-- JOIN deal_memberships dm2 ON dm2.deal_id = d.id
--   AND dm2.referred_by_entity_type = 'partner'
--   AND dm2.referred_by_entity_id != :partner_id
-- GROUP BY d.id;
