-- VC24 Share Data: 11 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        -- No cost_per_share data
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 181800.0 THEN 12.12
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 12.12
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 250000.0 THEN 12.12
        WHEN (i.legal_name ILIKE '%Dan BAUMSLAG%' OR i.legal_name ILIKE '%Dan%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Dan%') AND s.commitment = 9971.2 THEN 12.12
        WHEN (i.legal_name ILIKE '%Christine MASCORT SULLENGER%' OR i.legal_name ILIKE '%Christine%SULLENGER%' OR i.legal_name ILIKE '%SULLENGER%Christine%') AND s.commitment = 40000.0 THEN 12.12
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 7510.0 THEN 0.02893
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 2500.0 THEN 0.02893
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 50000.0 THEN 0.02893
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 8352.5 THEN 0.02893
        WHEN (i.legal_name ILIKE '%VERSO Capital Establishment%' OR i.legal_name ILIKE '%VERSO%Establishment%' OR i.legal_name ILIKE '%Establishment%VERSO%') AND s.commitment = 10000.0 THEN 0.02893
        WHEN (i.legal_name ILIKE '%Christine MASCORT SULLENGER%' OR i.legal_name ILIKE '%Christine%SULLENGER%' OR i.legal_name ILIKE '%SULLENGER%Christine%') AND s.commitment = 1639.0 THEN 0.02893
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 181800.0 THEN 15000.0
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 4125.0
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 250000.0 THEN 20627.0
        WHEN (i.legal_name ILIKE '%Dan BAUMSLAG%' OR i.legal_name ILIKE '%Dan%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Dan%') AND s.commitment = 9971.2 THEN 822.0
        WHEN (i.legal_name ILIKE '%Christine MASCORT SULLENGER%' OR i.legal_name ILIKE '%Christine%SULLENGER%' OR i.legal_name ILIKE '%SULLENGER%Christine%') AND s.commitment = 40000.0 THEN 3300.0
        WHEN (i.legal_name ILIKE '%JASSQ Holding Limited%' OR i.legal_name ILIKE '%JASSQ%Limited%' OR i.legal_name ILIKE '%Limited%JASSQ%') AND s.commitment = 7510.0 THEN 259636.0
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 2500.0 THEN 86430.0
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 50000.0 THEN 1728608.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 8352.5 THEN 288716.0
        WHEN (i.legal_name ILIKE '%VERSO Capital Establishment%' OR i.legal_name ILIKE '%VERSO%Establishment%' OR i.legal_name ILIKE '%Establishment%VERSO%') AND s.commitment = 10000.0 THEN 345721.0
        WHEN (i.legal_name ILIKE '%Christine MASCORT SULLENGER%' OR i.legal_name ILIKE '%Christine%SULLENGER%' OR i.legal_name ILIKE '%SULLENGER%Christine%') AND s.commitment = 1639.0 THEN 56663.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC124';
