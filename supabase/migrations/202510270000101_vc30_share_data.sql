-- VC30 Share Data: 5 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 150000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Scott LIVINGSTONE%' OR i.legal_name ILIKE '%Scott%LIVINGSTONE%' OR i.legal_name ILIKE '%LIVINGSTONE%Scott%') AND s.commitment = 10000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Daniel BAUMSLAG%' OR i.legal_name ILIKE '%Daniel%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Daniel%') AND s.commitment = 35000.0 THEN 1.0
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 150000.0 THEN 11.998
        WHEN (i.legal_name ILIKE '%Scott LIVINGSTONE%' OR i.legal_name ILIKE '%Scott%LIVINGSTONE%' OR i.legal_name ILIKE '%LIVINGSTONE%Scott%') AND s.commitment = 10000.0 THEN 11.998
        WHEN (i.legal_name ILIKE '%Daniel BAUMSLAG%' OR i.legal_name ILIKE '%Daniel%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Daniel%') AND s.commitment = 35000.0 THEN 11.998
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 250000.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 250000.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 150000.0 THEN 12502.0
        WHEN (i.legal_name ILIKE '%Scott LIVINGSTONE%' OR i.legal_name ILIKE '%Scott%LIVINGSTONE%' OR i.legal_name ILIKE '%LIVINGSTONE%Scott%') AND s.commitment = 10000.0 THEN 833.0
        WHEN (i.legal_name ILIKE '%Daniel BAUMSLAG%' OR i.legal_name ILIKE '%Daniel%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Daniel%') AND s.commitment = 35000.0 THEN 2917.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC130';
