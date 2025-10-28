-- VC8 Performance Fees: 1 row with performance fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%ISP Securities Ltd%' OR i.legal_name LIKE '%ISP%Ltd%' OR i.legal_name LIKE '%Ltd%ISP%') AND s.commitment = 627177.6 THEN 0.25
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC108';