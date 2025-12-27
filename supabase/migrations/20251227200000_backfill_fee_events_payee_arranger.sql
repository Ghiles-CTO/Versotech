-- Migration: Backfill payee_arranger_id on existing fee_events
-- This one-time migration populates the arranger link for historical fee events

-- Step 1: Update fee_events from fee_plans.created_by_arranger_id
-- (via fee_component → fee_plan relationship)
UPDATE fee_events fe
SET payee_arranger_id = fp.created_by_arranger_id
FROM fee_components fc
JOIN fee_plans fp ON fc.fee_plan_id = fp.id
WHERE fe.fee_component_id = fc.id
  AND fe.payee_arranger_id IS NULL
  AND fp.created_by_arranger_id IS NOT NULL;

-- Step 2: Update remaining fee_events from deals.arranger_entity_id
UPDATE fee_events fe
SET payee_arranger_id = d.arranger_entity_id
FROM deals d
WHERE fe.deal_id = d.id
  AND fe.payee_arranger_id IS NULL
  AND d.arranger_entity_id IS NOT NULL;

-- Log how many were updated (for verification)
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM fee_events
  WHERE payee_arranger_id IS NOT NULL;

  RAISE NOTICE 'Fee events with payee_arranger_id set: %', updated_count;
END $$;
