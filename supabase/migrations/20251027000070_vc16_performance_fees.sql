-- VC16 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 0.1
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC116';
