-- VC11 Performance Fees Batch 1/2 (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%ROSEN INVEST HOLDINGS INC%' OR i.legal_name LIKE '%ROSEN%INC%' OR i.legal_name LIKE '%INC%ROSEN%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%STRUCTURED ISSUANCE Ltd%' OR i.legal_name LIKE '%STRUCTURED%Ltd%' OR i.legal_name LIKE '%Ltd%STRUCTURED%') AND s.commitment = 250000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%DALINGA HOLDING AG%' OR i.legal_name LIKE '%DALINGA%AG%' OR i.legal_name LIKE '%AG%DALINGA%') AND s.commitment = 115000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Tartrifuge SA%' OR i.legal_name LIKE '%Tartrifuge%SA%' OR i.legal_name LIKE '%SA%Tartrifuge%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%OEP LIMITED (Transfer from AS ADVISORY DWC LLC)%' OR i.legal_name LIKE '%OEP%LLC)%' OR i.legal_name LIKE '%LLC)%OEP%') AND s.commitment = 50000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%David HOLDEN%' OR i.legal_name LIKE '%David%HOLDEN%' OR i.legal_name LIKE '%HOLDEN%David%') AND s.commitment = 200000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%TERRA Financial & Management Services SA%' OR i.legal_name LIKE '%TERRA%SA%' OR i.legal_name LIKE '%SA%TERRA%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Dan Jean BAUMSLAG DUTIL%' OR i.legal_name LIKE '%Dan%DUTIL%' OR i.legal_name LIKE '%DUTIL%Dan%') AND s.commitment = 50000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%Stephane DAHAN%' OR i.legal_name LIKE '%Stephane%DAHAN%' OR i.legal_name LIKE '%DAHAN%Stephane%') AND s.commitment = 75000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Bruce HAWKINS%' OR i.legal_name LIKE '%Bruce%HAWKINS%' OR i.legal_name LIKE '%HAWKINS%Bruce%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%VOLF Trust%' OR i.legal_name LIKE '%VOLF%Trust%' OR i.legal_name LIKE '%Trust%VOLF%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%James BURCH%' OR i.legal_name LIKE '%James%BURCH%' OR i.legal_name LIKE '%BURCH%James%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 200000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC111';