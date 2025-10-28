-- VC6 Performance Fees Batch 3/4 - PERCENT ONLY
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%Imran HAKIM%' OR i.legal_name LIKE '%Imran%HAKIM%' OR i.legal_name LIKE '%HAKIM%Imran%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Kenilworth Ltd%' OR i.legal_name LIKE '%Kenilworth%Ltd%' OR i.legal_name LIKE '%Ltd%Kenilworth%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Adil KHAWAJA%' OR i.legal_name LIKE '%Adil%KHAWAJA%' OR i.legal_name LIKE '%KHAWAJA%Adil%') AND s.commitment = 250000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Bharat JATANIA%' OR i.legal_name LIKE '%Bharat%JATANIA%' OR i.legal_name LIKE '%JATANIA%Bharat%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Lubna QUNASH%' OR i.legal_name LIKE '%Lubna%QUNASH%' OR i.legal_name LIKE '%QUNASH%Lubna%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 4661508.64 THEN 0.001
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 62892.48 THEN 0.001
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 36361.92 THEN 0.001
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 46569.6 THEN 0.001
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 124444.32 THEN 0.001
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 3763.2 THEN 0.001
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 129407.04 THEN 0.001
        WHEN (i.legal_name LIKE '%Bank SYZ AG%' OR i.legal_name LIKE '%Bank%AG%' OR i.legal_name LIKE '%AG%Bank%') AND s.commitment = 15052.8 THEN 0.001
        WHEN (i.legal_name LIKE '%Damien KRAUSER%' OR i.legal_name LIKE '%Damien%KRAUSER%' OR i.legal_name LIKE '%KRAUSER%Damien%') AND s.commitment = 50000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Bright Phoenix Holdings Limited%' OR i.legal_name LIKE '%Bright%Limited%' OR i.legal_name LIKE '%Limited%Bright%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Michel GUERIN%' OR i.legal_name LIKE '%Michel%GUERIN%' OR i.legal_name LIKE '%GUERIN%Michel%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Eric LE SEIGNEUR%' OR i.legal_name LIKE '%Eric%SEIGNEUR%' OR i.legal_name LIKE '%SEIGNEUR%Eric%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Phaena Advisory Ltd%' OR i.legal_name LIKE '%Phaena%Ltd%' OR i.legal_name LIKE '%Ltd%Phaena%') AND s.commitment = 50000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%POTASSIUM Capital%' OR i.legal_name LIKE '%POTASSIUM%Capital%' OR i.legal_name LIKE '%Capital%POTASSIUM%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Aatif HASSAN%' OR i.legal_name LIKE '%Aatif%HASSAN%' OR i.legal_name LIKE '%HASSAN%Aatif%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Kevin WILTSHIRE%' OR i.legal_name LIKE '%Kevin%WILTSHIRE%' OR i.legal_name LIKE '%WILTSHIRE%Kevin%') AND s.commitment = 75000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%GTV Partners SA%' OR i.legal_name LIKE '%GTV%SA%' OR i.legal_name LIKE '%SA%GTV%') AND s.commitment = 500000.0 THEN 0.0015
        WHEN (i.legal_name LIKE '%LENN Participations SARL%' OR i.legal_name LIKE '%LENN%SARL%' OR i.legal_name LIKE '%SARL%LENN%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%WEALTH TRAIN LIMITED%' OR i.legal_name LIKE '%WEALTH%LIMITED%' OR i.legal_name LIKE '%LIMITED%WEALTH%') AND s.commitment = 450000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%TERSANE INTERNATIONAL LTD%' OR i.legal_name LIKE '%TERSANE%LTD%' OR i.legal_name LIKE '%LTD%TERSANE%') AND s.commitment = 250000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Brahma Finance (BVI) Ltd%' OR i.legal_name LIKE '%Brahma%Ltd%' OR i.legal_name LIKE '%Ltd%Brahma%') AND s.commitment = 250000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%James HARTSHORN%' OR i.legal_name LIKE '%James%HARTSHORN%' OR i.legal_name LIKE '%HARTSHORN%James%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Eric SARASIN%' OR i.legal_name LIKE '%Eric%SARASIN%' OR i.legal_name LIKE '%SARASIN%Eric%') AND s.commitment = 500000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Damien KRAUSER%' OR i.legal_name LIKE '%Damien%KRAUSER%' OR i.legal_name LIKE '%KRAUSER%Damien%') AND s.commitment = 100000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Eric LE SEIGNEUR%' OR i.legal_name LIKE '%Eric%SEIGNEUR%' OR i.legal_name LIKE '%SEIGNEUR%Eric%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 50000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Herve STEIMES%' OR i.legal_name LIKE '%Herve%STEIMES%' OR i.legal_name LIKE '%STEIMES%Herve%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Julien SERRA%' OR i.legal_name LIKE '%Julien%SERRA%' OR i.legal_name LIKE '%SERRA%Julien%') AND s.commitment = 100000.0 THEN 0.002
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC106';