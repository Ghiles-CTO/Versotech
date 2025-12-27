-- VC6 Performance Fees Batch 1/4 - PERCENT ONLY
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%DALINGA HOLDING AG%' OR i.legal_name LIKE '%DALINGA%AG%' OR i.legal_name LIKE '%AG%DALINGA%') AND s.commitment = 50000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Matteo MARTINI%' OR i.legal_name LIKE '%Matteo%MARTINI%' OR i.legal_name LIKE '%MARTINI%Matteo%') AND s.commitment = 100000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%MA GROUP AG%' OR i.legal_name LIKE '%MA%AG%' OR i.legal_name LIKE '%AG%MA%') AND s.commitment = 30000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%KRANA INVESTMENTS PTE. LTD.%' OR i.legal_name LIKE '%KRANA%LTD.%' OR i.legal_name LIKE '%LTD.%KRANA%') AND s.commitment = 300000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Sandra CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 50000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Dario SCIMONE%' OR i.legal_name LIKE '%Dario%SCIMONE%' OR i.legal_name LIKE '%SCIMONE%Dario%') AND s.commitment = 50000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Elidon Estate Inc%' OR i.legal_name LIKE '%Elidon%Inc%' OR i.legal_name LIKE '%Inc%Elidon%') AND s.commitment = 200000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Adam Smith Singapore Pte Ltd%' OR i.legal_name LIKE '%Adam%Ltd%' OR i.legal_name LIKE '%Ltd%Adam%') AND s.commitment = 25000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Mrs and Mr Beatrice & Marcel KNOPF%' OR i.legal_name LIKE '%Mrs%KNOPF%' OR i.legal_name LIKE '%KNOPF%Mrs%') AND s.commitment = 50000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%VOLF Trust%' OR i.legal_name LIKE '%VOLF%Trust%' OR i.legal_name LIKE '%Trust%VOLF%') AND s.commitment = 250000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Heinz & Barbara WINZ%' OR i.legal_name LIKE '%Heinz%WINZ%' OR i.legal_name LIKE '%WINZ%Heinz%') AND s.commitment = 100000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Sabrina WINZ%' OR i.legal_name LIKE '%Sabrina%WINZ%' OR i.legal_name LIKE '%WINZ%Sabrina%') AND s.commitment = 50000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%ROSEN INVEST HOLDINGS Inc%' OR i.legal_name LIKE '%ROSEN%Inc%' OR i.legal_name LIKE '%Inc%ROSEN%') AND s.commitment = 100000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Mrs & Mr Subbiah  SUBRAMANIAN%' OR i.legal_name LIKE '%Mrs%SUBRAMANIAN%' OR i.legal_name LIKE '%SUBRAMANIAN%Mrs%') AND s.commitment = 155000.0 THEN 0.001
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC106';