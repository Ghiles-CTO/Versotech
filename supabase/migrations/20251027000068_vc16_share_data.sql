-- VC16 Share Data: 5 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 200000.0 THEN 0.7392
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 0.7392
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 1.13067
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 1.13067
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 99999.85 THEN 1.13067
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 200000.0 THEN 0.7392
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 0.7392
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 1.15638
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 1.15638
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 99999.85 THEN 1.13067
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 200000.0 THEN 270562.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 25000.0 THEN 33820.0
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 21619.0
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 21619.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 99999.85 THEN 88443.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC116';
