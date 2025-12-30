-- Migration: Add related_deal_id column to tasks table
-- Purpose: Enable VERSOSign queries for Lawyers and Arrangers to filter tasks by deal
--
-- This matches the pattern used in:
-- - approvals table (has related_deal_id)
-- - automation_webhook_events table (has related_deal_id)

-- Add the column with foreign key reference
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS related_deal_id uuid REFERENCES deals(id) ON DELETE CASCADE;

-- Create partial index for efficient filtering (only index non-null values)
CREATE INDEX IF NOT EXISTS idx_tasks_related_deal
ON tasks(related_deal_id)
WHERE related_deal_id IS NOT NULL;

-- ============================================================================
-- BACKFILL EXISTING DATA
-- ============================================================================

-- Backfill #1: Tasks directly linked to deals
-- These tasks have related_entity_type = 'deal' and the entity_id IS the deal_id
UPDATE tasks
SET related_deal_id = related_entity_id
WHERE related_entity_type = 'deal'
AND related_deal_id IS NULL;

-- Backfill #2: Tasks linked to signature_requests via subscription path
-- Join through subscriptions to get deal_id
UPDATE tasks t
SET related_deal_id = s.deal_id
FROM signature_requests sr
JOIN subscriptions s ON sr.subscription_id = s.id
WHERE t.related_entity_type = 'signature_request'
AND t.related_entity_id = sr.id
AND t.related_deal_id IS NULL
AND s.deal_id IS NOT NULL;

-- Also backfill signature_requests.deal_id for direct lookups
UPDATE signature_requests sr
SET deal_id = s.deal_id
FROM subscriptions s
WHERE sr.subscription_id = s.id
AND sr.deal_id IS NULL
AND s.deal_id IS NOT NULL;

-- Backfill #3: Tasks linked to subscriptions
-- Get the deal_id from the subscription
UPDATE tasks t
SET related_deal_id = s.deal_id
FROM subscriptions s
WHERE t.related_entity_type = 'subscription'
AND t.related_entity_id = s.id
AND t.related_deal_id IS NULL
AND s.deal_id IS NOT NULL;

-- Backfill #4: Tasks linked to investor_deal_interest
-- Get the deal_id from the investor_deal_interest
UPDATE tasks t
SET related_deal_id = idi.deal_id
FROM investor_deal_interest idi
WHERE t.related_entity_type = 'deal_interest'
AND t.related_entity_id = idi.id
AND t.related_deal_id IS NULL
AND idi.deal_id IS NOT NULL;

-- ============================================================================
-- VERIFICATION (comment showing expected output)
-- ============================================================================
-- After migration, run this query to verify backfill:
--
-- SELECT
--   kind,
--   COUNT(*) as total,
--   COUNT(related_deal_id) as with_deal_id,
--   COUNT(*) - COUNT(related_deal_id) as missing_deal_id
-- FROM tasks
-- WHERE kind IN ('countersignature', 'subscription_pack_signature', 'deal_nda_signature')
-- GROUP BY kind;
