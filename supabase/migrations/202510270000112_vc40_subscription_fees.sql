-- VC40 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name ILIKE '%Mrs Beatrice and Mr Marcel KNOPF%' OR i.legal_name ILIKE '%Mrs%KNOPF%' OR i.legal_name ILIKE '%KNOPF%Mrs%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name ILIKE '%Mrs Liubov and Mr Igor ZINKEVICH%' OR i.legal_name ILIKE '%Mrs%ZINKEVICH%' OR i.legal_name ILIKE '%ZINKEVICH%Mrs%') AND s.commitment = 96000.0 THEN 0.04166666
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name ILIKE '%Mrs Beatrice and Mr Marcel KNOPF%' OR i.legal_name ILIKE '%Mrs%KNOPF%' OR i.legal_name ILIKE '%KNOPF%Mrs%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name ILIKE '%Mrs Liubov and Mr Igor ZINKEVICH%' OR i.legal_name ILIKE '%Mrs%ZINKEVICH%' OR i.legal_name ILIKE '%ZINKEVICH%Mrs%') AND s.commitment = 96000.0 THEN 3999.99936
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC140';
