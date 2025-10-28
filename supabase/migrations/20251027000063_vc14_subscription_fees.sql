-- VC14 Subscription Fees: 3 rows
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%Revery Capital Limited%' OR i.legal_name LIKE '%Revery%Limited%' OR i.legal_name LIKE '%Limited%Revery%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Prometheus Capital Finance Ltd%' OR i.legal_name LIKE '%Prometheus%Ltd%' OR i.legal_name LIKE '%Ltd%Prometheus%') AND s.commitment = 30000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Manraj SEKHON%' OR i.legal_name LIKE '%Manraj%SEKHON%' OR i.legal_name LIKE '%SEKHON%Manraj%') AND s.commitment = 200000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%Revery Capital Limited%' OR i.legal_name LIKE '%Revery%Limited%' OR i.legal_name LIKE '%Limited%Revery%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Prometheus Capital Finance Ltd%' OR i.legal_name LIKE '%Prometheus%Ltd%' OR i.legal_name LIKE '%Ltd%Prometheus%') AND s.commitment = 30000.0 THEN 600.0
        WHEN (i.legal_name LIKE '%Manraj SEKHON%' OR i.legal_name LIKE '%Manraj%SEKHON%' OR i.legal_name LIKE '%SEKHON%Manraj%') AND s.commitment = 200000.0 THEN 4000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC114';
