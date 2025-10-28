-- VC20 Share Data: 4 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%FRALIS SA SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 150000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Gershon KOH%' OR i.legal_name LIKE '%Gershon%KOH%' OR i.legal_name LIKE '%KOH%Gershon%') AND s.commitment = 200000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 75000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 75000.0 THEN 1.0
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%FRALIS SA SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 150000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Gershon KOH%' OR i.legal_name LIKE '%Gershon%KOH%' OR i.legal_name LIKE '%KOH%Gershon%') AND s.commitment = 200000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 75000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 75000.0 THEN 1.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%FRALIS SA SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 150000.0 THEN 150000.0
        WHEN (i.legal_name LIKE '%Gershon KOH%' OR i.legal_name LIKE '%Gershon%KOH%' OR i.legal_name LIKE '%KOH%Gershon%') AND s.commitment = 200000.0 THEN 200000.0
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 75000.0 THEN 75000.0
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 75000.0 THEN 75000.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC120';
