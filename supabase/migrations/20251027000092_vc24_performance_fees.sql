-- VC24 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 181800.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 250000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Dan BAUMSLAG%' OR i.legal_name ILIKE '%Dan%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Dan%') AND s.commitment = 9971.2 THEN 0.1
        WHEN (i.legal_name ILIKE '%Christine MASCORT SULLENGER%' OR i.legal_name ILIKE '%Christine%SULLENGER%' OR i.legal_name ILIKE '%SULLENGER%Christine%') AND s.commitment = 40000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 7510.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 2500.0 THEN 0.05
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 50000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 8352.5 THEN 0.1
        WHEN (i.legal_name ILIKE '%VERSO Capital Establishment%' OR i.legal_name ILIKE '%VERSO%Establishment%' OR i.legal_name ILIKE '%Establishment%VERSO%') AND s.commitment = 10000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Christine MASCORT SULLENGER%' OR i.legal_name ILIKE '%Christine%SULLENGER%' OR i.legal_name ILIKE '%SULLENGER%Christine%') AND s.commitment = 1639.0 THEN 0.1
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC124';
