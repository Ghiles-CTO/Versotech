-- VC22 Share Data: 10 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        -- No cost_per_share data
        ELSE cost_per_share
    END,
    price_per_share = CASE
        -- No price_per_share data
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 100000.0 THEN 249525.0
        WHEN (i.legal_name ILIKE '%Anke RICE%' OR i.legal_name ILIKE '%Anke%RICE%' OR i.legal_name ILIKE '%RICE%Anke%') AND s.commitment = 60000.0 THEN 95949.0
        WHEN (i.legal_name ILIKE '%INNOVATECH COMPARTMENT 8%' OR i.legal_name ILIKE '%INNOVATECH%8%' OR i.legal_name ILIKE '%8%INNOVATECH%') AND s.commitment = 25000.0 THEN 39978.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 99999.65 THEN 159915.0
        WHEN (i.legal_name ILIKE '%Erich GRAF%' OR i.legal_name ILIKE '%Erich%GRAF%' OR i.legal_name ILIKE '%GRAF%Erich%') AND s.commitment = 99999.65 THEN 159915.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC122';
