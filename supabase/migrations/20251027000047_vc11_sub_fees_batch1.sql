-- VC11 Subscription Fees Batch 1/2
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%ROSEN INVEST HOLDINGS INC%' OR i.legal_name LIKE '%ROSEN%INC%' OR i.legal_name LIKE '%INC%ROSEN%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%STRUCTURED ISSUANCE Ltd%' OR i.legal_name LIKE '%STRUCTURED%Ltd%' OR i.legal_name LIKE '%Ltd%STRUCTURED%') AND s.commitment = 250000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%DALINGA HOLDING AG%' OR i.legal_name LIKE '%DALINGA%AG%' OR i.legal_name LIKE '%AG%DALINGA%') AND s.commitment = 115000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Tartrifuge SA%' OR i.legal_name LIKE '%Tartrifuge%SA%' OR i.legal_name LIKE '%SA%Tartrifuge%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%David HOLDEN%' OR i.legal_name LIKE '%David%HOLDEN%' OR i.legal_name LIKE '%HOLDEN%David%') AND s.commitment = 200000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%TERRA Financial & Management Services SA%' OR i.legal_name LIKE '%TERRA%SA%' OR i.legal_name LIKE '%SA%TERRA%') AND s.commitment = 50000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Stephane DAHAN%' OR i.legal_name LIKE '%Stephane%DAHAN%' OR i.legal_name LIKE '%DAHAN%Stephane%') AND s.commitment = 75000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Bruce HAWKINS%' OR i.legal_name LIKE '%Bruce%HAWKINS%' OR i.legal_name LIKE '%HAWKINS%Bruce%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%VOLF Trust%' OR i.legal_name LIKE '%VOLF%Trust%' OR i.legal_name LIKE '%Trust%VOLF%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%James BURCH%' OR i.legal_name LIKE '%James%BURCH%' OR i.legal_name LIKE '%BURCH%James%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 200000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Johann AKERMANN%' OR i.legal_name LIKE '%Johann%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Johann%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Erich GRAF%' OR i.legal_name LIKE '%Erich%GRAF%' OR i.legal_name LIKE '%GRAF%Erich%') AND s.commitment = 100000.0 THEN 0.04
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%ROSEN INVEST HOLDINGS INC%' OR i.legal_name LIKE '%ROSEN%INC%' OR i.legal_name LIKE '%INC%ROSEN%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%STRUCTURED ISSUANCE Ltd%' OR i.legal_name LIKE '%STRUCTURED%Ltd%' OR i.legal_name LIKE '%Ltd%STRUCTURED%') AND s.commitment = 250000.0 THEN 10000.0
        WHEN (i.legal_name LIKE '%DALINGA HOLDING AG%' OR i.legal_name LIKE '%DALINGA%AG%' OR i.legal_name LIKE '%AG%DALINGA%') AND s.commitment = 115000.0 THEN 4600.0
        WHEN (i.legal_name LIKE '%Tartrifuge SA%' OR i.legal_name LIKE '%Tartrifuge%SA%' OR i.legal_name LIKE '%SA%Tartrifuge%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%David HOLDEN%' OR i.legal_name LIKE '%David%HOLDEN%' OR i.legal_name LIKE '%HOLDEN%David%') AND s.commitment = 200000.0 THEN 8000.0
        WHEN (i.legal_name LIKE '%TERRA Financial & Management Services SA%' OR i.legal_name LIKE '%TERRA%SA%' OR i.legal_name LIKE '%SA%TERRA%') AND s.commitment = 50000.0 THEN 1000.0
        WHEN (i.legal_name LIKE '%Stephane DAHAN%' OR i.legal_name LIKE '%Stephane%DAHAN%' OR i.legal_name LIKE '%DAHAN%Stephane%') AND s.commitment = 75000.0 THEN 3000.0
        WHEN (i.legal_name LIKE '%Bruce HAWKINS%' OR i.legal_name LIKE '%Bruce%HAWKINS%' OR i.legal_name LIKE '%HAWKINS%Bruce%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%VOLF Trust%' OR i.legal_name LIKE '%VOLF%Trust%' OR i.legal_name LIKE '%Trust%VOLF%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%James BURCH%' OR i.legal_name LIKE '%James%BURCH%' OR i.legal_name LIKE '%BURCH%James%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 200000.0 THEN 8000.0
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Johann AKERMANN%' OR i.legal_name LIKE '%Johann%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Johann%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Erich GRAF%' OR i.legal_name LIKE '%Erich%GRAF%' OR i.legal_name LIKE '%GRAF%Erich%') AND s.commitment = 100000.0 THEN 4000.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC111';