-- VC13 Subscription Fees Batch 2/2
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN i.legal_name LIKE '%SAFE%' AND s.commitment = 250000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 500000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%' OR i.legal_name LIKE '%SUMMIT%LLC%' OR i.legal_name LIKE '%LLC%SUMMIT%') AND s.commitment = 300000.0 THEN 0.01
        WHEN (i.legal_name LIKE '%NEWBRIDGE FINANCE SPF%' OR i.legal_name LIKE '%NEWBRIDGE%SPF%' OR i.legal_name LIKE '%SPF%NEWBRIDGE%') AND s.commitment = 2800000.0 THEN 0.01
        WHEN (i.legal_name LIKE '%Mayuriben JOGANI%' OR i.legal_name LIKE '%Mayuriben%JOGANI%' OR i.legal_name LIKE '%JOGANI%Mayuriben%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Charles DE BAVIER%' OR i.legal_name LIKE '%Charles%BAVIER%' OR i.legal_name LIKE '%BAVIER%Charles%') AND s.commitment = 200000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Erwan TAROUILLY%' OR i.legal_name LIKE '%Erwan%TAROUILLY%' OR i.legal_name LIKE '%TAROUILLY%Erwan%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Thierry ULDRY%' OR i.legal_name LIKE '%Thierry%ULDRY%' OR i.legal_name LIKE '%ULDRY%Thierry%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 500000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Jeremie COMEL%' OR i.legal_name LIKE '%Jeremie%COMEL%' OR i.legal_name LIKE '%COMEL%Jeremie%') AND s.commitment = 20000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Gielke BURGMANS%' OR i.legal_name LIKE '%Gielke%BURGMANS%' OR i.legal_name LIKE '%BURGMANS%Gielke%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Halim EL MOGHAZI%' OR i.legal_name LIKE '%Halim%MOGHAZI%' OR i.legal_name LIKE '%MOGHAZI%Halim%') AND s.commitment = 26000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Hong NGOC LE%' OR i.legal_name LIKE '%Hong%LE%' OR i.legal_name LIKE '%LE%Hong%') AND s.commitment = 10000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Marco JERRENTRUP%' OR i.legal_name LIKE '%Marco%JERRENTRUP%' OR i.legal_name LIKE '%JERRENTRUP%Marco%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 60000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 80000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 500000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Andrew MEYER%' OR i.legal_name LIKE '%Andrew%MEYER%' OR i.legal_name LIKE '%MEYER%Andrew%') AND s.commitment = 200000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Abhie SHAH%' OR i.legal_name LIKE '%Abhie%SHAH%' OR i.legal_name LIKE '%SHAH%Abhie%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 90000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 600000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Keir BENBOW%' OR i.legal_name LIKE '%Keir%BENBOW%' OR i.legal_name LIKE '%BENBOW%Keir%') AND s.commitment = 50000.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN i.legal_name LIKE '%SAFE%' AND s.commitment = 250000.0 THEN 10000.0
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 500000.0 THEN 10000.0
        WHEN (i.legal_name LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%' OR i.legal_name LIKE '%SUMMIT%LLC%' OR i.legal_name LIKE '%LLC%SUMMIT%') AND s.commitment = 300000.0 THEN 3000.0
        WHEN (i.legal_name LIKE '%NEWBRIDGE FINANCE SPF%' OR i.legal_name LIKE '%NEWBRIDGE%SPF%' OR i.legal_name LIKE '%SPF%NEWBRIDGE%') AND s.commitment = 2800000.0 THEN 28000.0
        WHEN (i.legal_name LIKE '%Mayuriben JOGANI%' OR i.legal_name LIKE '%Mayuriben%JOGANI%' OR i.legal_name LIKE '%JOGANI%Mayuriben%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Charles DE BAVIER%' OR i.legal_name LIKE '%Charles%BAVIER%' OR i.legal_name LIKE '%BAVIER%Charles%') AND s.commitment = 200000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Erwan TAROUILLY%' OR i.legal_name LIKE '%Erwan%TAROUILLY%' OR i.legal_name LIKE '%TAROUILLY%Erwan%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Thierry ULDRY%' OR i.legal_name LIKE '%Thierry%ULDRY%' OR i.legal_name LIKE '%ULDRY%Thierry%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 500000.0 THEN 20000.0
        WHEN (i.legal_name LIKE '%Jeremie COMEL%' OR i.legal_name LIKE '%Jeremie%COMEL%' OR i.legal_name LIKE '%COMEL%Jeremie%') AND s.commitment = 20000.0 THEN 800.0
        WHEN (i.legal_name LIKE '%Gielke BURGMANS%' OR i.legal_name LIKE '%Gielke%BURGMANS%' OR i.legal_name LIKE '%BURGMANS%Gielke%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Halim EL MOGHAZI%' OR i.legal_name LIKE '%Halim%MOGHAZI%' OR i.legal_name LIKE '%MOGHAZI%Halim%') AND s.commitment = 26000.0 THEN 1040.0
        WHEN (i.legal_name LIKE '%Hong NGOC LE%' OR i.legal_name LIKE '%Hong%LE%' OR i.legal_name LIKE '%LE%Hong%') AND s.commitment = 10000.0 THEN 400.0
        WHEN (i.legal_name LIKE '%Marco JERRENTRUP%' OR i.legal_name LIKE '%Marco%JERRENTRUP%' OR i.legal_name LIKE '%JERRENTRUP%Marco%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 40000.0
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 60000.0 THEN 2400.0
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 80000.0 THEN 3200.0
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 500000.0 THEN 20000.0
        WHEN (i.legal_name LIKE '%Andrew MEYER%' OR i.legal_name LIKE '%Andrew%MEYER%' OR i.legal_name LIKE '%MEYER%Andrew%') AND s.commitment = 200000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Abhie SHAH%' OR i.legal_name LIKE '%Abhie%SHAH%' OR i.legal_name LIKE '%SHAH%Abhie%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 90000.0 THEN 3600.0
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 600000.0 THEN 24000.0
        WHEN (i.legal_name LIKE '%Keir BENBOW%' OR i.legal_name LIKE '%Keir%BENBOW%' OR i.legal_name LIKE '%BENBOW%Keir%') AND s.commitment = 50000.0 THEN 1000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC113';
