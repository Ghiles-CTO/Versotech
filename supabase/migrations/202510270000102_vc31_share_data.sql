-- VC31 Share Data: 4 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 25000.0 THEN 1.25
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 1.25
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 12500.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 12500.0 THEN 1.0
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 25000.0 THEN 1.25
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 1.25
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 12500.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 12500.0 THEN 1.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 25000.0 THEN 20000.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 20000.0
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 12500.0 THEN 12500.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 12500.0 THEN 12500.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC131';
