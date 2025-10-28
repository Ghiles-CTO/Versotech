-- VC14 Share Data: 4 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 530000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Revery Capital Limited%' OR i.legal_name LIKE '%Revery%Limited%' OR i.legal_name LIKE '%Limited%Revery%') AND s.commitment = 100000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Prometheus Capital Finance Ltd%' OR i.legal_name LIKE '%Prometheus%Ltd%' OR i.legal_name LIKE '%Ltd%Prometheus%') AND s.commitment = 30000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Manraj SEKHON%' OR i.legal_name LIKE '%Manraj%SEKHON%' OR i.legal_name LIKE '%SEKHON%Manraj%') AND s.commitment = 200000.0 THEN 1.0
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 530000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Revery Capital Limited%' OR i.legal_name LIKE '%Revery%Limited%' OR i.legal_name LIKE '%Limited%Revery%') AND s.commitment = 100000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Prometheus Capital Finance Ltd%' OR i.legal_name LIKE '%Prometheus%Ltd%' OR i.legal_name LIKE '%Ltd%Prometheus%') AND s.commitment = 30000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%Manraj SEKHON%' OR i.legal_name LIKE '%Manraj%SEKHON%' OR i.legal_name LIKE '%SEKHON%Manraj%') AND s.commitment = 200000.0 THEN 1.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 530000.0 THEN 530000.0
        WHEN (i.legal_name LIKE '%Revery Capital Limited%' OR i.legal_name LIKE '%Revery%Limited%' OR i.legal_name LIKE '%Limited%Revery%') AND s.commitment = 100000.0 THEN 100000.0
        WHEN (i.legal_name LIKE '%Prometheus Capital Finance Ltd%' OR i.legal_name LIKE '%Prometheus%Ltd%' OR i.legal_name LIKE '%Ltd%Prometheus%') AND s.commitment = 30000.0 THEN 30000.0
        WHEN (i.legal_name LIKE '%Manraj SEKHON%' OR i.legal_name LIKE '%Manraj%SEKHON%' OR i.legal_name LIKE '%SEKHON%Manraj%') AND s.commitment = 200000.0 THEN 200000.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC114';
