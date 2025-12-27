-- VC28 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 0.1
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC128';
