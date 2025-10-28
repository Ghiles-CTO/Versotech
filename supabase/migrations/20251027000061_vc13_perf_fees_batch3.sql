-- VC13 Performance Fees Batch 3/3 (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%CLOUD IN HEAVEN SAS%' OR i.legal_name LIKE '%CLOUD%SAS%' OR i.legal_name LIKE '%SAS%CLOUD%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%Majid MOHAMMED%' OR i.legal_name LIKE '%Majid%MOHAMMED%' OR i.legal_name LIKE '%MOHAMMED%Majid%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%AS ADVISORY DWC LLC%' OR i.legal_name LIKE '%AS%LLC%' OR i.legal_name LIKE '%LLC%AS%') AND s.commitment = 100000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 100000.0 THEN 0.1
        WHEN i.legal_name LIKE '%PETRATECH%' AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Benjamin POURRAT%' OR i.legal_name LIKE '%Benjamin%POURRAT%' OR i.legal_name LIKE '%POURRAT%Benjamin%') AND s.commitment = 12755.1 THEN 0.1
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 80000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 500000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Sheikh Yousef AL SABAH%' OR i.legal_name LIKE '%Sheikh%SABAH%' OR i.legal_name LIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Andrew MEYER%' OR i.legal_name LIKE '%Andrew%MEYER%' OR i.legal_name LIKE '%MEYER%Andrew%') AND s.commitment = 200000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Abhie SHAH%' OR i.legal_name LIKE '%Abhie%SHAH%' OR i.legal_name LIKE '%SHAH%Abhie%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 90000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Zandera (Holdco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 600000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC113';
