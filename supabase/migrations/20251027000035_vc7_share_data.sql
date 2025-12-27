-- VC7 Share Data: ALL 4 rows from VC7 sheet
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 300000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 50000.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 3942.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 250000.0 THEN 13.5
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 300000.0 THEN 20.9
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 50000.0 THEN 22.52
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 3942.0 THEN 13.5
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 250000.0 THEN 26.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 300000.0 THEN 14354.0
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 50000.0 THEN 2220.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 3942.0 THEN 292.0
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 250000.0 THEN 9615.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC107';