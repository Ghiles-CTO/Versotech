-- VC26 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%' OR i.legal_name ILIKE '%CLOUDSAFE%LIMITED%' OR i.legal_name ILIKE '%LIMITED%CLOUDSAFE%') AND s.commitment = 600000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Serge AURIER%' OR i.legal_name ILIKE '%Serge%AURIER%' OR i.legal_name ILIKE '%AURIER%Serge%') AND s.commitment = 50000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Mathieu MARIOTTI%' OR i.legal_name ILIKE '%Mathieu%MARIOTTI%' OR i.legal_name ILIKE '%MARIOTTI%Mathieu%') AND s.commitment = 125000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Alexandre BARBARANELLI%' OR i.legal_name ILIKE '%Alexandre%BARBARANELLI%' OR i.legal_name ILIKE '%BARBARANELLI%Alexandre%') AND s.commitment = 30000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Keir BENBOW%' OR i.legal_name ILIKE '%Keir%BENBOW%' OR i.legal_name ILIKE '%BENBOW%Keir%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%GESTIO CAPITAL LTD%' OR i.legal_name ILIKE '%GESTIO%LTD%' OR i.legal_name ILIKE '%LTD%GESTIO%') AND s.commitment = 350000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 200000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%' OR i.legal_name ILIKE '%CLOUDSAFE%LIMITED%' OR i.legal_name ILIKE '%LIMITED%CLOUDSAFE%') AND s.commitment = 600000.0 THEN 12000.0
        WHEN (i.legal_name ILIKE '%Serge AURIER%' OR i.legal_name ILIKE '%Serge%AURIER%' OR i.legal_name ILIKE '%AURIER%Serge%') AND s.commitment = 50000.0 THEN 1000.0
        WHEN (i.legal_name ILIKE '%Mathieu MARIOTTI%' OR i.legal_name ILIKE '%Mathieu%MARIOTTI%' OR i.legal_name ILIKE '%MARIOTTI%Mathieu%') AND s.commitment = 125000.0 THEN 2500.0
        WHEN (i.legal_name ILIKE '%Alexandre BARBARANELLI%' OR i.legal_name ILIKE '%Alexandre%BARBARANELLI%' OR i.legal_name ILIKE '%BARBARANELLI%Alexandre%') AND s.commitment = 30000.0 THEN 600.0
        WHEN (i.legal_name ILIKE '%Keir BENBOW%' OR i.legal_name ILIKE '%Keir%BENBOW%' OR i.legal_name ILIKE '%BENBOW%Keir%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name ILIKE '%GESTIO CAPITAL LTD%' OR i.legal_name ILIKE '%GESTIO%LTD%' OR i.legal_name ILIKE '%LTD%GESTIO%') AND s.commitment = 350000.0 THEN 7000.0
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 200000.0 THEN 4000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC126';
