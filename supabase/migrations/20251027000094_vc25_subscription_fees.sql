-- VC25 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name ILIKE '%Eric SARASIN%' OR i.legal_name ILIKE '%Eric%SARASIN%' OR i.legal_name ILIKE '%SARASIN%Eric%') AND s.commitment = 250000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%DALINGA HOLDING AG%' OR i.legal_name ILIKE '%DALINGA%AG%' OR i.legal_name ILIKE '%AG%DALINGA%') AND s.commitment = 24993.66 THEN 0.040042
        WHEN (i.legal_name ILIKE '%DALINGA HOLDING AG%' OR i.legal_name ILIKE '%DALINGA%AG%' OR i.legal_name ILIKE '%AG%DALINGA%') AND s.commitment = 4963.28 THEN 0.04
        WHEN (i.legal_name ILIKE '%MA GROUP AG%' OR i.legal_name ILIKE '%MA%AG%' OR i.legal_name ILIKE '%AG%MA%') AND s.commitment = 17900.0 THEN 0.04
        WHEN (i.legal_name ILIKE '%Andrew MEYER%' OR i.legal_name ILIKE '%Andrew%MEYER%' OR i.legal_name ILIKE '%MEYER%Andrew%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Anand RATHI%' OR i.legal_name ILIKE '%Anand%RATHI%' OR i.legal_name ILIKE '%RATHI%Anand%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Serge AURIER%' OR i.legal_name ILIKE '%Serge%AURIER%' OR i.legal_name ILIKE '%AURIER%Serge%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 100000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name ILIKE '%Eric SARASIN%' OR i.legal_name ILIKE '%Eric%SARASIN%' OR i.legal_name ILIKE '%SARASIN%Eric%') AND s.commitment = 250000.0 THEN 5000.0
        WHEN (i.legal_name ILIKE '%DALINGA HOLDING AG%' OR i.legal_name ILIKE '%DALINGA%AG%' OR i.legal_name ILIKE '%AG%DALINGA%') AND s.commitment = 24993.66 THEN 1000.8
        WHEN (i.legal_name ILIKE '%DALINGA HOLDING AG%' OR i.legal_name ILIKE '%DALINGA%AG%' OR i.legal_name ILIKE '%AG%DALINGA%') AND s.commitment = 4963.28 THEN 199.2
        WHEN (i.legal_name ILIKE '%MA GROUP AG%' OR i.legal_name ILIKE '%MA%AG%' OR i.legal_name ILIKE '%AG%MA%') AND s.commitment = 17900.0 THEN 716.0
        WHEN (i.legal_name ILIKE '%Andrew MEYER%' OR i.legal_name ILIKE '%Andrew%MEYER%' OR i.legal_name ILIKE '%MEYER%Andrew%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name ILIKE '%Anand RATHI%' OR i.legal_name ILIKE '%Anand%RATHI%' OR i.legal_name ILIKE '%RATHI%Anand%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name ILIKE '%Serge AURIER%' OR i.legal_name ILIKE '%Serge%AURIER%' OR i.legal_name ILIKE '%AURIER%Serge%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 100000.0 THEN 2000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC125';
