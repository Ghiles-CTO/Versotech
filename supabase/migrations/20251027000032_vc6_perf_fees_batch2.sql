-- VC6 Performance Fees Batch 2/4 - PERCENT ONLY
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%ONC Limited%' OR i.legal_name LIKE '%ONC%Limited%' OR i.legal_name LIKE '%Limited%ONC%') AND s.commitment = 4999999.2 THEN 0.001
        WHEN (i.legal_name LIKE '%Patrick CORR%' OR i.legal_name LIKE '%Patrick%CORR%' OR i.legal_name LIKE '%CORR%Patrick%') AND s.commitment = 500000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Stephen JORDAN%' OR i.legal_name LIKE '%Stephen%JORDAN%' OR i.legal_name LIKE '%JORDAN%Stephen%') AND s.commitment = 160000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%FigTree Family Office Ltd%' OR i.legal_name LIKE '%FigTree%Ltd%' OR i.legal_name LIKE '%Ltd%FigTree%') AND s.commitment = 360000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Oliver WRIGHT%' OR i.legal_name LIKE '%Oliver%WRIGHT%' OR i.legal_name LIKE '%WRIGHT%Oliver%') AND s.commitment = 50000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Emile VAN DEN BOL%' OR i.legal_name LIKE '%Emile%BOL%' OR i.legal_name LIKE '%BOL%Emile%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Mark MATTHEWS%' OR i.legal_name LIKE '%Mark%MATTHEWS%' OR i.legal_name LIKE '%MATTHEWS%Mark%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Matthew HAYCOX%' OR i.legal_name LIKE '%Matthew%HAYCOX%' OR i.legal_name LIKE '%HAYCOX%Matthew%') AND s.commitment = 75000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%John ACKERLEY%' OR i.legal_name LIKE '%John%ACKERLEY%' OR i.legal_name LIKE '%ACKERLEY%John%') AND s.commitment = 50000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Steve MANNING%' OR i.legal_name LIKE '%Steve%MANNING%' OR i.legal_name LIKE '%MANNING%Steve%') AND s.commitment = 50000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Global Custody & Clearing Limited%' OR i.legal_name LIKE '%Global%Limited%' OR i.legal_name LIKE '%Limited%Global%') AND s.commitment = 1414728.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Gregory BROOKS%' OR i.legal_name LIKE '%Gregory%BROOKS%' OR i.legal_name LIKE '%BROOKS%Gregory%') AND s.commitment = 50000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Stephane DAHAN%' OR i.legal_name LIKE '%Stephane%DAHAN%' OR i.legal_name LIKE '%DAHAN%Stephane%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Jean DUTIL%' OR i.legal_name LIKE '%Jean%DUTIL%' OR i.legal_name LIKE '%DUTIL%Jean%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Sudon Carlop Holdings Limited%' OR i.legal_name LIKE '%Sudon%Limited%' OR i.legal_name LIKE '%Limited%Sudon%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Lesli SCHUTTE%' OR i.legal_name LIKE '%Lesli%SCHUTTE%' OR i.legal_name LIKE '%SCHUTTE%Lesli%') AND s.commitment = 50000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Erich GRAF%' OR i.legal_name LIKE '%Erich%GRAF%' OR i.legal_name LIKE '%GRAF%Erich%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%TERRA Financial & Management Services SA%' OR i.legal_name LIKE '%TERRA%SA%' OR i.legal_name LIKE '%SA%TERRA%') AND s.commitment = 30000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%CLOUDSAFE HOLDINGS LTD%' OR i.legal_name LIKE '%CLOUDSAFE%LTD%' OR i.legal_name LIKE '%LTD%CLOUDSAFE%') AND s.commitment = 500000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%David HOLDEN%' OR i.legal_name LIKE '%David%HOLDEN%' OR i.legal_name LIKE '%HOLDEN%David%') AND s.commitment = 150000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Ashish KOTHARI%' OR i.legal_name LIKE '%Ashish%KOTHARI%' OR i.legal_name LIKE '%KOTHARI%Ashish%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Fabien ROTH%' OR i.legal_name LIKE '%Fabien%ROTH%' OR i.legal_name LIKE '%ROTH%Fabien%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Fawad MUKHTAR%' OR i.legal_name LIKE '%Fawad%MUKHTAR%' OR i.legal_name LIKE '%MUKHTAR%Fawad%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%KABELLA LTD%' OR i.legal_name LIKE '%KABELLA%LTD%' OR i.legal_name LIKE '%LTD%KABELLA%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%SOUTH SOUND LTD%' OR i.legal_name LIKE '%SOUTH%LTD%' OR i.legal_name LIKE '%LTD%SOUTH%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Constantin-Octavian PATRASCU%' OR i.legal_name LIKE '%Constantin-Octavian%PATRASCU%' OR i.legal_name LIKE '%PATRASCU%Constantin-Octavian%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Mayuriben JOGANI%' OR i.legal_name LIKE '%Mayuriben%JOGANI%' OR i.legal_name LIKE '%JOGANI%Mayuriben%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%CINCORIA LIMITED%' OR i.legal_name LIKE '%CINCORIA%LIMITED%' OR i.legal_name LIKE '%LIMITED%CINCORIA%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Hayden RUSHTON%' OR i.legal_name LIKE '%Hayden%RUSHTON%' OR i.legal_name LIKE '%RUSHTON%Hayden%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Mrs Nalini Yoga & Mr Aran James WILLETTS%' OR i.legal_name LIKE '%Mrs%WILLETTS%' OR i.legal_name LIKE '%WILLETTS%Mrs%') AND s.commitment = 125000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Emma Graham-Taylor & Gregory SOMMERVILLE%' OR i.legal_name LIKE '%Emma%SOMMERVILLE%' OR i.legal_name LIKE '%SOMMERVILLE%Emma%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Kim LUND%' OR i.legal_name LIKE '%Kim%LUND%' OR i.legal_name LIKE '%LUND%Kim%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Ivan BELGA%' OR i.legal_name LIKE '%Ivan%BELGA%' OR i.legal_name LIKE '%BELGA%Ivan%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Karthic JAYARAMAN%' OR i.legal_name LIKE '%Karthic%JAYARAMAN%' OR i.legal_name LIKE '%JAYARAMAN%Karthic%') AND s.commitment = 400000.0 THEN 0.002
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC106';