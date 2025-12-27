-- VC18 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%VOLF TRUST%' OR i.legal_name LIKE '%VOLF%TRUST%' OR i.legal_name LIKE '%TRUST%VOLF%') AND s.commitment = 250000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOVA & ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%SIGNET LOGISTICS Ltd%' OR i.legal_name LIKE '%SIGNET%Ltd%' OR i.legal_name LIKE '%Ltd%SIGNET%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 150000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 258460.0 THEN 0.1
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 525695.0 THEN 0.1
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC118';
