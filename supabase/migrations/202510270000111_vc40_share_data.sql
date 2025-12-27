-- VC40 Share Data: 3 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name ILIKE '%Mrs Beatrice and Mr Marcel KNOPF%' OR i.legal_name ILIKE '%Mrs%KNOPF%' OR i.legal_name ILIKE '%KNOPF%Mrs%') AND s.commitment = 100000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Mrs Liubov and Mr Igor ZINKEVICH%' OR i.legal_name ILIKE '%Mrs%ZINKEVICH%' OR i.legal_name ILIKE '%ZINKEVICH%Mrs%') AND s.commitment = 96000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 50000.0 THEN 1.0
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name ILIKE '%Mrs Beatrice and Mr Marcel KNOPF%' OR i.legal_name ILIKE '%Mrs%KNOPF%' OR i.legal_name ILIKE '%KNOPF%Mrs%') AND s.commitment = 100000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Mrs Liubov and Mr Igor ZINKEVICH%' OR i.legal_name ILIKE '%Mrs%ZINKEVICH%' OR i.legal_name ILIKE '%ZINKEVICH%Mrs%') AND s.commitment = 96000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 50000.0 THEN 1.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%Mrs Beatrice and Mr Marcel KNOPF%' OR i.legal_name ILIKE '%Mrs%KNOPF%' OR i.legal_name ILIKE '%KNOPF%Mrs%') AND s.commitment = 100000.0 THEN 100000.0
        WHEN (i.legal_name ILIKE '%Mrs Liubov and Mr Igor ZINKEVICH%' OR i.legal_name ILIKE '%Mrs%ZINKEVICH%' OR i.legal_name ILIKE '%ZINKEVICH%Mrs%') AND s.commitment = 96000.0 THEN 96000.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 50000.0 THEN 50000.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC140';
