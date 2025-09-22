-- VERSO Holdings Portal - Existing Table Alterations  
-- Based on changes.md specification section 2
-- Run this AFTER the base schema.sql and deals-extension-schema.sql

-- ==========================================================================
-- 2) Data Model – Alterations to Existing Tables
-- ==========================================================================

-- 1. DOCUMENTS – add deal scoping & keep PRD semantics.
-- Why: Docs should be visible to deal participants (e.g., lawyers) even if they're not part of the investor entity/vehicle.
ALTER TABLE documents ADD COLUMN deal_id uuid REFERENCES deals(id);
CREATE INDEX ON documents (deal_id, type);

-- 2. CONVERSATIONS/MESSAGES – allow chat scoping to a deal.
ALTER TABLE conversations ADD COLUMN deal_id uuid REFERENCES deals(id);
CREATE INDEX ON conversations (deal_id, type);

-- 3. REQUEST_TICKETS – allow "Ask/Request" to be deal-specific (e.g., "please review John's Revolut commitment").
ALTER TABLE request_tickets ADD COLUMN deal_id uuid REFERENCES deals(id);
CREATE INDEX ON request_tickets (deal_id, status);

-- 4. POSITIONS – no schema change required; will be updated from allocations on settle; 
-- optional future table position_lots if per-lot cost basis is required.
-- (No changes needed for positions table as noted in spec)

-- Comments for documentation
COMMENT ON COLUMN documents.deal_id IS 'Optional deal scoping for documents - enables deal participant access';
COMMENT ON COLUMN conversations.deal_id IS 'Optional deal scoping for conversations - enables deal-specific chat';
COMMENT ON COLUMN request_tickets.deal_id IS 'Optional deal scoping for requests - enables deal-specific support tickets';
