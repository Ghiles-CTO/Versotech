-- VC18 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%VOLF TRUST%' OR i.legal_name LIKE '%VOLF%TRUST%' OR i.legal_name LIKE '%TRUST%VOLF%') AND s.commitment = 250000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOVA & ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%SIGNET LOGISTICS Ltd%' OR i.legal_name LIKE '%SIGNET%Ltd%' OR i.legal_name LIKE '%Ltd%SIGNET%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 150000.0 THEN 0.04
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%VOLF TRUST%' OR i.legal_name LIKE '%VOLF%TRUST%' OR i.legal_name LIKE '%TRUST%VOLF%') AND s.commitment = 250000.0 THEN 10000.0
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOVA & ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 20000.0
        WHEN (i.legal_name LIKE '%SIGNET LOGISTICS Ltd%' OR i.legal_name LIKE '%SIGNET%Ltd%' OR i.legal_name LIKE '%Ltd%SIGNET%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 150000.0 THEN 6000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC118';
