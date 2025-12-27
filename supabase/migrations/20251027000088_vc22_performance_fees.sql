-- VC22 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%AS ADVISORY DWC LLC%' OR i.legal_name ILIKE '%AS%LLC%' OR i.legal_name ILIKE '%LLC%AS%') AND s.commitment = 100000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Deyan MIHOV%' OR i.legal_name ILIKE '%Deyan%MIHOV%' OR i.legal_name ILIKE '%MIHOV%Deyan%') AND s.commitment = 75000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Sheikh AL SABAH%' OR i.legal_name ILIKE '%Sheikh%SABAH%' OR i.legal_name ILIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Anke RICE%' OR i.legal_name ILIKE '%Anke%RICE%' OR i.legal_name ILIKE '%RICE%Anke%') AND s.commitment = 60000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%VERSO CAPITAL ESTABLISHMENT%' OR i.legal_name ILIKE '%VERSO%ESTABLISHMENT%' OR i.legal_name ILIKE '%ESTABLISHMENT%VERSO%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%INNOVATECH COMPARTMENT 8%' OR i.legal_name ILIKE '%INNOVATECH%8%' OR i.legal_name ILIKE '%8%INNOVATECH%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Erich GRAF%' OR i.legal_name ILIKE '%Erich%GRAF%' OR i.legal_name ILIKE '%GRAF%Erich%') AND s.commitment = 99999.65 THEN 0.2
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 75000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC122';
