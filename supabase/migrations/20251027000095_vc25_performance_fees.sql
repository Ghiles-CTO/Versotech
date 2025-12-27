-- VC25 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%Patrick BIECHELER%' OR i.legal_name ILIKE '%Patrick%BIECHELER%' OR i.legal_name ILIKE '%BIECHELER%Patrick%') AND s.commitment = 30000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%SC STONEA%' OR i.legal_name ILIKE '%SC%STONEA%' OR i.legal_name ILIKE '%STONEA%SC%') AND s.commitment = 100000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Christophe SORAIS%' OR i.legal_name ILIKE '%Christophe%SORAIS%' OR i.legal_name ILIKE '%SORAIS%Christophe%') AND s.commitment = 40000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Alain DECOMBE%' OR i.legal_name ILIKE '%Alain%DECOMBE%' OR i.legal_name ILIKE '%DECOMBE%Alain%') AND s.commitment = 80000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Eric SARASIN%' OR i.legal_name ILIKE '%Eric%SARASIN%' OR i.legal_name ILIKE '%SARASIN%Eric%') AND s.commitment = 250000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%ZEBRA HOLDING%' OR i.legal_name ILIKE '%ZEBRA%HOLDING%' OR i.legal_name ILIKE '%HOLDING%ZEBRA%') AND s.commitment = 20000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Sylvain GARIEL%' OR i.legal_name ILIKE '%Sylvain%GARIEL%' OR i.legal_name ILIKE '%GARIEL%Sylvain%') AND s.commitment = 20000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Benjamin PRESSET%' OR i.legal_name ILIKE '%Benjamin%PRESSET%' OR i.legal_name ILIKE '%PRESSET%Benjamin%') AND s.commitment = 20000.0 THEN 0.1
        WHEN i.legal_name ILIKE '%CAREITAS%' AND s.commitment = 100000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%OEP LTD%' OR i.legal_name ILIKE '%OEP%LTD%' OR i.legal_name ILIKE '%LTD%OEP%') AND s.commitment = 100000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%AS ADVISORY%' OR i.legal_name ILIKE '%AS%ADVISORY%' OR i.legal_name ILIKE '%ADVISORY%AS%') AND s.commitment = 100000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Laurent CREHANGE%' OR i.legal_name ILIKE '%Laurent%CREHANGE%' OR i.legal_name ILIKE '%CREHANGE%Laurent%') AND s.commitment = 10000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Pierre LECOMTE%' OR i.legal_name ILIKE '%Pierre%LECOMTE%' OR i.legal_name ILIKE '%LECOMTE%Pierre%') AND s.commitment = 36000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%ALPHA OMEGA SAS%' OR i.legal_name ILIKE '%ALPHA%SAS%' OR i.legal_name ILIKE '%SAS%ALPHA%') AND s.commitment = 5000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%DALINGA HOLDING AG%' OR i.legal_name ILIKE '%DALINGA%AG%' OR i.legal_name ILIKE '%AG%DALINGA%') AND s.commitment = 24993.66 THEN 0.2
        WHEN (i.legal_name ILIKE '%DALINGA HOLDING AG%' OR i.legal_name ILIKE '%DALINGA%AG%' OR i.legal_name ILIKE '%AG%DALINGA%') AND s.commitment = 4963.28 THEN 0.2
        WHEN (i.legal_name ILIKE '%MA GROUP AG%' OR i.legal_name ILIKE '%MA%AG%' OR i.legal_name ILIKE '%AG%MA%') AND s.commitment = 17900.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Andrew MEYER%' OR i.legal_name ILIKE '%Andrew%MEYER%' OR i.legal_name ILIKE '%MEYER%Andrew%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Thomas YBERT%' OR i.legal_name ILIKE '%Thomas%YBERT%' OR i.legal_name ILIKE '%YBERT%Thomas%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Xavier GODRON%' OR i.legal_name ILIKE '%Xavier%GODRON%' OR i.legal_name ILIKE '%GODRON%Xavier%') AND s.commitment = 20000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Anand RATHI%' OR i.legal_name ILIKE '%Anand%RATHI%' OR i.legal_name ILIKE '%RATHI%Anand%') AND s.commitment = 100000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Dan BAUMSLAG%' OR i.legal_name ILIKE '%Dan%BAUMSLAG%' OR i.legal_name ILIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Serge AURIER%' OR i.legal_name ILIKE '%Serge%AURIER%' OR i.legal_name ILIKE '%AURIER%Serge%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Robin DOBLE%' OR i.legal_name ILIKE '%Robin%DOBLE%' OR i.legal_name ILIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%Eric SARASIN%' OR i.legal_name ILIKE '%Eric%SARASIN%' OR i.legal_name ILIKE '%SARASIN%Eric%') AND s.commitment = 89072.75 THEN 0.1
        WHEN (i.legal_name ILIKE '%Alain DECOMBE%' OR i.legal_name ILIKE '%Alain%DECOMBE%' OR i.legal_name ILIKE '%DECOMBE%Alain%') AND s.commitment = 27000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%SC STONEA%' OR i.legal_name ILIKE '%SC%STONEA%' OR i.legal_name ILIKE '%STONEA%SC%') AND s.commitment = 35000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 100000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC125';
