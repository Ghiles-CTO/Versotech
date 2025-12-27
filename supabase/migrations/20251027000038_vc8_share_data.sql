-- VC8 Share Data: 1 row from VC8 sheet
UPDATE public.subscriptions s
SET
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%ISP Securities Ltd%' OR i.legal_name LIKE '%ISP%Ltd%' OR i.legal_name LIKE '%Ltd%ISP%') AND s.commitment = 627177.6 THEN 2613.24
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%ISP Securities Ltd%' OR i.legal_name LIKE '%ISP%Ltd%' OR i.legal_name LIKE '%Ltd%ISP%') AND s.commitment = 627177.6 THEN 240.0
        ELSE num_shares
    END,
    spread_per_share = COALESCE(price_per_share - cost_per_share, 0),
    spread_fee_amount = COALESCE((price_per_share - cost_per_share) * num_shares, 0)
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC108';