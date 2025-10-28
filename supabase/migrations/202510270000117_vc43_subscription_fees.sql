-- VC43 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name ILIKE '%Deyan MIHOV%' OR i.legal_name ILIKE '%Deyan%MIHOV%' OR i.legal_name ILIKE '%MIHOV%Deyan%') AND s.commitment = 75000.0 THEN 0.04
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 100000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name ILIKE '%Deyan MIHOV%' OR i.legal_name ILIKE '%Deyan%MIHOV%' OR i.legal_name ILIKE '%MIHOV%Deyan%') AND s.commitment = 75000.0 THEN 3000.0
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 100000.0 THEN 2000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC143';
