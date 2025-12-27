-- VC40 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%Mrs Beatrice and Mr Marcel KNOPF%' OR i.legal_name ILIKE '%Mrs%KNOPF%' OR i.legal_name ILIKE '%KNOPF%Mrs%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Mrs Liubov and Mr Igor ZINKEVICH%' OR i.legal_name ILIKE '%Mrs%ZINKEVICH%' OR i.legal_name ILIKE '%ZINKEVICH%Mrs%') AND s.commitment = 96000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC140';
