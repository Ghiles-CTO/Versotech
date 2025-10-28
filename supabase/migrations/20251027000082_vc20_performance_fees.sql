-- VC20 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%FRALIS SA SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 150000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Gershon KOH%' OR i.legal_name LIKE '%Gershon%KOH%' OR i.legal_name LIKE '%KOH%Gershon%') AND s.commitment = 200000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 75000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 75000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC120';
