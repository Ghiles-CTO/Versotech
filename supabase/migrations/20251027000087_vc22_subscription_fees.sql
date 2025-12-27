-- VC22 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name ILIKE '%Deyan MIHOV%' OR i.legal_name ILIKE '%Deyan%MIHOV%' OR i.legal_name ILIKE '%MIHOV%Deyan%') AND s.commitment = 75000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Sheikh AL SABAH%' OR i.legal_name ILIKE '%Sheikh%SABAH%' OR i.legal_name ILIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Anke RICE%' OR i.legal_name ILIKE '%Anke%RICE%' OR i.legal_name ILIKE '%RICE%Anke%') AND s.commitment = 60000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Erich GRAF%' OR i.legal_name ILIKE '%Erich%GRAF%' OR i.legal_name ILIKE '%GRAF%Erich%') AND s.commitment = 99999.65 THEN 0.02
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 75000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name ILIKE '%Deyan MIHOV%' OR i.legal_name ILIKE '%Deyan%MIHOV%' OR i.legal_name ILIKE '%MIHOV%Deyan%') AND s.commitment = 75000.0 THEN 1500.0
        WHEN (i.legal_name ILIKE '%Sheikh AL SABAH%' OR i.legal_name ILIKE '%Sheikh%SABAH%' OR i.legal_name ILIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 1000.0
        WHEN (i.legal_name ILIKE '%Anke RICE%' OR i.legal_name ILIKE '%Anke%RICE%' OR i.legal_name ILIKE '%RICE%Anke%') AND s.commitment = 60000.0 THEN 1200.0
        WHEN (i.legal_name ILIKE '%Erich GRAF%' OR i.legal_name ILIKE '%Erich%GRAF%' OR i.legal_name ILIKE '%GRAF%Erich%') AND s.commitment = 99999.65 THEN 1999.993
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 75000.0 THEN 1500.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC122';
