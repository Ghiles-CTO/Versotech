-- VC43 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%Deyan MIHOV%' OR i.legal_name ILIKE '%Deyan%MIHOV%' OR i.legal_name ILIKE '%MIHOV%Deyan%') AND s.commitment = 75000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 100000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC143';
