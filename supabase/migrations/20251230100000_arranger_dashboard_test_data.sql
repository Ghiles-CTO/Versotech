-- Test data for Arranger Dashboard visualization
-- This creates realistic data for an arranger to see on their dashboard
-- Run this AFTER having at least one arranger and some deals in the system

DO $$
DECLARE
  v_arranger_id uuid;
  v_deal_id uuid;
  v_deal_ids uuid[];
  v_sub record;
BEGIN
  -- Get first active arranger
  SELECT id INTO v_arranger_id
  FROM arranger_entities
  WHERE status = 'active'
  LIMIT 1;

  IF v_arranger_id IS NULL THEN
    RAISE NOTICE 'No active arranger found, skipping test data creation';
    RETURN;
  END IF;

  -- Get all deals assigned to this arranger
  SELECT array_agg(id) INTO v_deal_ids
  FROM deals
  WHERE arranger_entity_id = v_arranger_id;

  IF v_deal_ids IS NULL OR array_length(v_deal_ids, 1) IS NULL THEN
    RAISE NOTICE 'No deals found for arranger %, skipping test data', v_arranger_id;
    RETURN;
  END IF;

  RAISE NOTICE 'Creating test data for arranger % with % deals', v_arranger_id, array_length(v_deal_ids, 1);

  -- Update existing subscriptions with realistic funding data
  -- This ensures we have varied funding statuses for the escrow metrics
  FOR v_sub IN
    SELECT id, commitment, status
    FROM subscriptions
    WHERE deal_id = ANY(v_deal_ids)
    AND status IN ('committed', 'partially_funded', 'active', 'signed')
  LOOP
    -- Randomly assign funding levels
    UPDATE subscriptions
    SET
      funded_amount = CASE
        WHEN random() < 0.25 THEN commitment  -- 25% fully funded
        WHEN random() < 0.50 THEN commitment * 0.75  -- 25% 75% funded
        WHEN random() < 0.75 THEN commitment * 0.5   -- 25% 50% funded
        ELSE commitment * 0.25  -- 25% 25% funded
      END,
      outstanding_amount = commitment - funded_amount,
      status = CASE
        WHEN funded_amount >= commitment THEN 'active'
        WHEN funded_amount > 0 THEN 'partially_funded'
        ELSE 'committed'
      END
    WHERE id = v_sub.id;
  END LOOP;

  -- Create fee events for this arranger if none exist
  -- This ensures the fee pipeline shows realistic data
  INSERT INTO fee_events (
    id,
    deal_id,
    investor_id,
    payee_arranger_id,
    computed_amount,
    base_amount,
    rate_bps,
    status,
    fee_type,
    event_date,
    currency,
    created_at
  )
  SELECT
    gen_random_uuid(),
    s.deal_id,
    s.investor_id,
    v_arranger_id,
    s.commitment * 0.02,  -- 2% subscription fee
    s.commitment,
    200,  -- 2% = 200 basis points
    (ARRAY['accrued', 'invoiced', 'paid'])[floor(random() * 3 + 1)]::fee_event_status_enum,
    'subscription'::fee_component_kind_enum,
    CURRENT_DATE - (random() * 30)::int,
    'USD',
    now()
  FROM subscriptions s
  WHERE s.deal_id = ANY(v_deal_ids)
    AND s.status IN ('committed', 'partially_funded', 'active')
    AND NOT EXISTS (
      SELECT 1 FROM fee_events fe
      WHERE fe.deal_id = s.deal_id
        AND fe.investor_id = s.investor_id
        AND fe.payee_arranger_id = v_arranger_id
        AND fe.fee_type = 'subscription'
    )
  LIMIT 15;

  -- Also add some management fees for variety
  INSERT INTO fee_events (
    id,
    deal_id,
    investor_id,
    payee_arranger_id,
    computed_amount,
    base_amount,
    rate_bps,
    status,
    fee_type,
    event_date,
    currency,
    created_at
  )
  SELECT
    gen_random_uuid(),
    s.deal_id,
    s.investor_id,
    v_arranger_id,
    s.commitment * 0.015,  -- 1.5% management fee
    s.commitment,
    150,
    (ARRAY['accrued', 'invoiced'])[floor(random() * 2 + 1)]::fee_event_status_enum,
    'management'::fee_component_kind_enum,
    CURRENT_DATE - (random() * 60)::int,
    'USD',
    now()
  FROM subscriptions s
  WHERE s.deal_id = ANY(v_deal_ids)
    AND s.status IN ('active')
    AND NOT EXISTS (
      SELECT 1 FROM fee_events fe
      WHERE fe.deal_id = s.deal_id
        AND fe.investor_id = s.investor_id
        AND fe.payee_arranger_id = v_arranger_id
        AND fe.fee_type = 'management'
    )
  LIMIT 5;

  -- Update some subscriptions to have signed_at this month for the "Signed This Month" metric
  UPDATE subscriptions
  SET signed_at = CURRENT_TIMESTAMP - (random() * interval '20 days')
  WHERE deal_id = ANY(v_deal_ids)
    AND status IN ('committed', 'partially_funded', 'active')
    AND signed_at IS NULL
    AND random() < 0.4;  -- 40% of eligible subscriptions

  RAISE NOTICE 'Test data created successfully for arranger %', v_arranger_id;
END $$;

-- Summary query to verify the test data (optional - comment out in production)
-- SELECT
--   ae.legal_name as arranger,
--   COUNT(DISTINCT d.id) as deals,
--   COUNT(DISTINCT s.id) as subscriptions,
--   SUM(s.commitment) as total_commitment,
--   SUM(s.funded_amount) as total_funded,
--   COUNT(DISTINCT fe.id) as fee_events
-- FROM arranger_entities ae
-- LEFT JOIN deals d ON d.arranger_entity_id = ae.id
-- LEFT JOIN subscriptions s ON s.deal_id = d.id
-- LEFT JOIN fee_events fe ON fe.payee_arranger_id = ae.id
-- WHERE ae.status = 'active'
-- GROUP BY ae.id, ae.legal_name;
