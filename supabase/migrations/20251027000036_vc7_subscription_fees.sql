-- VC7 Subscription Fees: 3 rows with fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 300000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 250000.0 THEN 0.04
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 300000.0 THEN 12000.0
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Discovery Capital Managers Ltd%' OR i.legal_name LIKE '%Discovery%Ltd%' OR i.legal_name LIKE '%Ltd%Discovery%') AND s.commitment = 250000.0 THEN 10000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC107';