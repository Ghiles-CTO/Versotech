-- VC24 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 181800.0 THEN 0.04
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 250000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 181800.0 THEN 7272.0
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 250000.0 THEN 5000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC124';
