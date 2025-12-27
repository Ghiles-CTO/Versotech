-- VC13 Subscription Fees Batch 1/2
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name LIKE '%Barbara and Heinz WINZ%' OR i.legal_name LIKE '%Barbara%WINZ%' OR i.legal_name LIKE '%WINZ%Barbara%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 75000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 75000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Dalinga AG%' OR i.legal_name LIKE '%Dalinga%AG%' OR i.legal_name LIKE '%AG%Dalinga%') AND s.commitment = 150000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Dalinga AG%' OR i.legal_name LIKE '%Dalinga%AG%' OR i.legal_name LIKE '%AG%Dalinga%') AND s.commitment = 15000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Liudmila Romanova and Alexey ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 400000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%' OR i.legal_name LIKE '%IQEQ%TRUST%' OR i.legal_name LIKE '%TRUST%IQEQ%') AND s.commitment = 400000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Andrey GORYAINOV%' OR i.legal_name LIKE '%Andrey%GORYAINOV%' OR i.legal_name LIKE '%GORYAINOV%Andrey%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Liubov and Igor ZINKEVICH%' OR i.legal_name LIKE '%Liubov%ZINKEVICH%' OR i.legal_name LIKE '%ZINKEVICH%Liubov%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Sheila and Kamlesh MADHVANI%' OR i.legal_name LIKE '%Sheila%MADHVANI%' OR i.legal_name LIKE '%MADHVANI%Sheila%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Rosen Invest Holdings Inc%' OR i.legal_name LIKE '%Rosen%Inc%' OR i.legal_name LIKE '%Inc%Rosen%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Beatrice and Marcel KNOPF%' OR i.legal_name LIKE '%Beatrice%KNOPF%' OR i.legal_name LIKE '%KNOPF%Beatrice%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Scott TOMMEY%' OR i.legal_name LIKE '%Scott%TOMMEY%' OR i.legal_name LIKE '%TOMMEY%Scott%') AND s.commitment = 150000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Signet Logistics Ltd%' OR i.legal_name LIKE '%Signet%Ltd%' OR i.legal_name LIKE '%Ltd%Signet%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Erich GRAF%' OR i.legal_name LIKE '%Erich%GRAF%' OR i.legal_name LIKE '%GRAF%Erich%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Shrai and Aparna MADHVANI%' OR i.legal_name LIKE '%Shrai%MADHVANI%' OR i.legal_name LIKE '%MADHVANI%Shrai%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name LIKE '%Ivan DE%' OR i.legal_name LIKE '%Ivan%DE%' OR i.legal_name LIKE '%DE%Ivan%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Bright Phoenix Holdings Ltd%' OR i.legal_name LIKE '%Bright%Ltd%' OR i.legal_name LIKE '%Ltd%Bright%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%TEKAPO Group Limited%' OR i.legal_name LIKE '%TEKAPO%Limited%' OR i.legal_name LIKE '%Limited%TEKAPO%') AND s.commitment = 100000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Philip ALGAR%' OR i.legal_name LIKE '%Philip%ALGAR%' OR i.legal_name LIKE '%ALGAR%Philip%') AND s.commitment = 50000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Sebastian MERIDA%' OR i.legal_name LIKE '%Sebastian%MERIDA%' OR i.legal_name LIKE '%MERIDA%Sebastian%') AND s.commitment = 30000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN%' OR i.legal_name LIKE '%Mrs%SUBRAMANIAN%' OR i.legal_name LIKE '%SUBRAMANIAN%Mrs%') AND s.commitment = 105000.0 THEN 0.04
        WHEN (i.legal_name LIKE '%Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA%' OR i.legal_name LIKE '%Mrs%TANEJA%' OR i.legal_name LIKE '%TANEJA%Mrs%') AND s.commitment = 110000.0 THEN 0.04
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name LIKE '%Barbara and Heinz WINZ%' OR i.legal_name LIKE '%Barbara%WINZ%' OR i.legal_name LIKE '%WINZ%Barbara%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Sandra KOHLER CABIAN%' OR i.legal_name LIKE '%Sandra%CABIAN%' OR i.legal_name LIKE '%CABIAN%Sandra%') AND s.commitment = 75000.0 THEN 1500.0
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 75000.0 THEN 1500.0
        WHEN (i.legal_name LIKE '%Dalinga AG%' OR i.legal_name LIKE '%Dalinga%AG%' OR i.legal_name LIKE '%AG%Dalinga%') AND s.commitment = 150000.0 THEN 6000.0
        WHEN (i.legal_name LIKE '%Dalinga AG%' OR i.legal_name LIKE '%Dalinga%AG%' OR i.legal_name LIKE '%AG%Dalinga%') AND s.commitment = 15000.0 THEN 600.0
        WHEN (i.legal_name LIKE '%Liudmila Romanova and Alexey ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 400000.0 THEN 16000.0
        WHEN (i.legal_name LIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%' OR i.legal_name LIKE '%IQEQ%TRUST%' OR i.legal_name LIKE '%TRUST%IQEQ%') AND s.commitment = 400000.0 THEN 16000.0
        WHEN (i.legal_name LIKE '%Andrey GORYAINOV%' OR i.legal_name LIKE '%Andrey%GORYAINOV%' OR i.legal_name LIKE '%GORYAINOV%Andrey%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Liubov and Igor ZINKEVICH%' OR i.legal_name LIKE '%Liubov%ZINKEVICH%' OR i.legal_name LIKE '%ZINKEVICH%Liubov%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Sheila and Kamlesh MADHVANI%' OR i.legal_name LIKE '%Sheila%MADHVANI%' OR i.legal_name LIKE '%MADHVANI%Sheila%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Rosen Invest Holdings Inc%' OR i.legal_name LIKE '%Rosen%Inc%' OR i.legal_name LIKE '%Inc%Rosen%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 40000.0
        WHEN (i.legal_name LIKE '%Mark HAYWARD%' OR i.legal_name LIKE '%Mark%HAYWARD%' OR i.legal_name LIKE '%HAYWARD%Mark%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Beatrice and Marcel KNOPF%' OR i.legal_name LIKE '%Beatrice%KNOPF%' OR i.legal_name LIKE '%KNOPF%Beatrice%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Scott TOMMEY%' OR i.legal_name LIKE '%Scott%TOMMEY%' OR i.legal_name LIKE '%TOMMEY%Scott%') AND s.commitment = 150000.0 THEN 6000.0
        WHEN (i.legal_name LIKE '%Signet Logistics Ltd%' OR i.legal_name LIKE '%Signet%Ltd%' OR i.legal_name LIKE '%Ltd%Signet%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Erich GRAF%' OR i.legal_name LIKE '%Erich%GRAF%' OR i.legal_name LIKE '%GRAF%Erich%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Shrai and Aparna MADHVANI%' OR i.legal_name LIKE '%Shrai%MADHVANI%' OR i.legal_name LIKE '%MADHVANI%Shrai%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Ivan DE%' OR i.legal_name LIKE '%Ivan%DE%' OR i.legal_name LIKE '%DE%Ivan%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Bright Phoenix Holdings Ltd%' OR i.legal_name LIKE '%Bright%Ltd%' OR i.legal_name LIKE '%Ltd%Bright%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%TEKAPO Group Limited%' OR i.legal_name LIKE '%TEKAPO%Limited%' OR i.legal_name LIKE '%Limited%TEKAPO%') AND s.commitment = 100000.0 THEN 4000.0
        WHEN (i.legal_name LIKE '%Philip ALGAR%' OR i.legal_name LIKE '%Philip%ALGAR%' OR i.legal_name LIKE '%ALGAR%Philip%') AND s.commitment = 50000.0 THEN 2000.0
        WHEN (i.legal_name LIKE '%Sebastian MERIDA%' OR i.legal_name LIKE '%Sebastian%MERIDA%' OR i.legal_name LIKE '%MERIDA%Sebastian%') AND s.commitment = 30000.0 THEN 1200.0
        WHEN (i.legal_name LIKE '%Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN%' OR i.legal_name LIKE '%Mrs%SUBRAMANIAN%' OR i.legal_name LIKE '%SUBRAMANIAN%Mrs%') AND s.commitment = 105000.0 THEN 4200.0
        WHEN (i.legal_name LIKE '%Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA%' OR i.legal_name LIKE '%Mrs%TANEJA%' OR i.legal_name LIKE '%TANEJA%Mrs%') AND s.commitment = 110000.0 THEN 4400.0
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC113';
