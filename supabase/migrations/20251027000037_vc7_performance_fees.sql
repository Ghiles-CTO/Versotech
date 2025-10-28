-- VC7 Performance Fees: 3 rows with performance fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 300000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 250000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC107';