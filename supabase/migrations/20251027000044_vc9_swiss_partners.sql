-- VC9 Missing Row: SWISS PARTNERS (row 17)
UPDATE public.subscriptions s
SET
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%SWISS PARTNERS%' OR i.legal_name LIKE '%SWISS%PARTNERS%' OR i.legal_name LIKE '%PARTNERS%SWISS%') AND s.commitment = 125001.22 THEN 23.523
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%SWISS PARTNERS%' OR i.legal_name LIKE '%SWISS%PARTNERS%' OR i.legal_name LIKE '%PARTNERS%SWISS%') AND s.commitment = 125001.22 THEN 5314.0
        ELSE num_shares
    END,
    spread_per_share = COALESCE(price_per_share - cost_per_share, 0),
    spread_fee_amount = COALESCE((price_per_share - cost_per_share) * num_shares, 0),
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%SWISS PARTNERS%' OR i.legal_name LIKE '%SWISS%PARTNERS%' OR i.legal_name LIKE '%PARTNERS%SWISS%') AND s.commitment = 125001.22 THEN 0.03
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%SWISS PARTNERS%' OR i.legal_name LIKE '%SWISS%PARTNERS%' OR i.legal_name LIKE '%PARTNERS%SWISS%') AND s.commitment = 125001.22 THEN 3750.0366
        ELSE subscription_fee_amount
    END,
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%SWISS PARTNERS%' OR i.legal_name LIKE '%SWISS%PARTNERS%' OR i.legal_name LIKE '%PARTNERS%SWISS%') AND s.commitment = 125001.22 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC109';
