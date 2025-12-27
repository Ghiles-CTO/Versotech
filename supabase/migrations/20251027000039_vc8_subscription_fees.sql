-- VC8 Subscription Fees: 1 row with fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%ISP Securities Ltd%' OR i.legal_name LIKE '%ISP%Ltd%' OR i.legal_name LIKE '%Ltd%ISP%') AND s.commitment = 627177.6 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%ISP Securities Ltd%' OR i.legal_name LIKE '%ISP%Ltd%' OR i.legal_name LIKE '%Ltd%ISP%') AND s.commitment = 627177.6 THEN 12543.552
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC108';