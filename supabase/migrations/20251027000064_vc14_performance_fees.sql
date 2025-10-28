-- VC14 Performance Fees: 2 rows (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%Prometheus Capital Finance Ltd%' OR i.legal_name LIKE '%Prometheus%Ltd%' OR i.legal_name LIKE '%Ltd%Prometheus%') AND s.commitment = 30000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Manraj SEKHON%' OR i.legal_name LIKE '%Manraj%SEKHON%' OR i.legal_name LIKE '%SEKHON%Manraj%') AND s.commitment = 200000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC114';
