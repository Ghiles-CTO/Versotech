-- VC28 Share Data: 3 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 125000.0 THEN 0.7
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 0.7
        WHEN (i.legal_name ILIKE '%Dan BAUMSLAG%' OR i.legal_name ILIKE '%Dan%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 0.7
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 125000.0 THEN 0.7
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 0.7
        WHEN (i.legal_name ILIKE '%Dan BAUMSLAG%' OR i.legal_name ILIKE '%Dan%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 0.7
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 125000.0 THEN 178571.0
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 142857.0
        WHEN (i.legal_name ILIKE '%Dan BAUMSLAG%' OR i.legal_name ILIKE '%Dan%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 35714.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC128';
