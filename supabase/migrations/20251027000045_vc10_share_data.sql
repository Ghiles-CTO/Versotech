-- VC10 Share Data: 1 row
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%MHA CAPITAL, LLC%' OR i.legal_name LIKE '%MHA%LLC%' OR i.legal_name LIKE '%LLC%MHA%') AND s.commitment = 5142798.0 THEN 13.5
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%MHA CAPITAL, LLC%' OR i.legal_name LIKE '%MHA%LLC%' OR i.legal_name LIKE '%LLC%MHA%') AND s.commitment = 5142798.0 THEN 18.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%MHA CAPITAL, LLC%' OR i.legal_name LIKE '%MHA%LLC%' OR i.legal_name LIKE '%LLC%MHA%') AND s.commitment = 5142798.0 THEN 285711.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC110';