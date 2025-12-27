-- VC26 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%' OR i.legal_name ILIKE '%CLOUDSAFE%LIMITED%' OR i.legal_name ILIKE '%LIMITED%CLOUDSAFE%') AND s.commitment = 600000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%AS Advisory DWC-LLC%' OR i.legal_name ILIKE '%AS%DWC-LLC%' OR i.legal_name ILIKE '%DWC-LLC%AS%') AND s.commitment = 50000.0 THEN 0.05
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 1250000.0 THEN 0.05
        WHEN (i.legal_name ILIKE '%Scott FLETCHER%' OR i.legal_name ILIKE '%Scott%FLETCHER%' OR i.legal_name ILIKE '%FLETCHER%Scott%') AND s.commitment = 250000.0 THEN 0.05
        WHEN (i.legal_name ILIKE '%Anand RATHI%' OR i.legal_name ILIKE '%Anand%RATHI%' OR i.legal_name ILIKE '%RATHI%Anand%') AND s.commitment = 250000.0 THEN 0.025
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 1000000.0 THEN 0.05
        WHEN (i.legal_name ILIKE '%OEP Ltd%' OR i.legal_name ILIKE '%OEP%Ltd%' OR i.legal_name ILIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 0.05
        WHEN (i.legal_name ILIKE '%FITAIHI Holdings SARL%' OR i.legal_name ILIKE '%FITAIHI%SARL%' OR i.legal_name ILIKE '%SARL%FITAIHI%') AND s.commitment = 64500.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%SC TBC INVEST 3%' OR i.legal_name ILIKE '%SC%3%' OR i.legal_name ILIKE '%3%SC%') AND s.commitment = 595000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%ODIN (ANIM X II LP)%' OR i.legal_name ILIKE '%ODIN%LP)%' OR i.legal_name ILIKE '%LP)%ODIN%') AND s.commitment = 380000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Serge AURIER%' OR i.legal_name ILIKE '%Serge%AURIER%' OR i.legal_name ILIKE '%AURIER%Serge%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%John BARROWMAN%' OR i.legal_name ILIKE '%John%BARROWMAN%' OR i.legal_name ILIKE '%BARROWMAN%John%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Anand RATHI%' OR i.legal_name ILIKE '%Anand%RATHI%' OR i.legal_name ILIKE '%RATHI%Anand%') AND s.commitment = 250000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%DRussell Goman RD LLC%' OR i.legal_name ILIKE '%DRussell%LLC%' OR i.legal_name ILIKE '%LLC%DRussell%') AND s.commitment = 25000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Garson LEVY%' OR i.legal_name ILIKE '%Garson%LEVY%' OR i.legal_name ILIKE '%LEVY%Garson%') AND s.commitment = 25000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Mrs Anisha Bansal and Mr Rahul KARKUN%' OR i.legal_name ILIKE '%Mrs%KARKUN%' OR i.legal_name ILIKE '%KARKUN%Mrs%') AND s.commitment = 25000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Mathieu MARIOTTI%' OR i.legal_name ILIKE '%Mathieu%MARIOTTI%' OR i.legal_name ILIKE '%MARIOTTI%Mathieu%') AND s.commitment = 125000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Alexandre BARBARANELLI%' OR i.legal_name ILIKE '%Alexandre%BARBARANELLI%' OR i.legal_name ILIKE '%BARBARANELLI%Alexandre%') AND s.commitment = 30000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Keir BENBOW%' OR i.legal_name ILIKE '%Keir%BENBOW%' OR i.legal_name ILIKE '%BENBOW%Keir%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Amanda RYZOWY%' OR i.legal_name ILIKE '%Amanda%RYZOWY%' OR i.legal_name ILIKE '%RYZOWY%Amanda%') AND s.commitment = 25000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%ALPHA GAIA CAPITAL FZE%' OR i.legal_name ILIKE '%ALPHA%FZE%' OR i.legal_name ILIKE '%FZE%ALPHA%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Desmond CARBERY%' OR i.legal_name ILIKE '%Desmond%CARBERY%' OR i.legal_name ILIKE '%CARBERY%Desmond%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Odile and Georges MRAD and FENERGI%' OR i.legal_name ILIKE '%Odile%FENERGI%' OR i.legal_name ILIKE '%FENERGI%Odile%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Georgi GEORGIEV%' OR i.legal_name ILIKE '%Georgi%GEORGIEV%' OR i.legal_name ILIKE '%GEORGIEV%Georgi%') AND s.commitment = 200000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Anatoliy KOGAN%' OR i.legal_name ILIKE '%Anatoliy%KOGAN%' OR i.legal_name ILIKE '%KOGAN%Anatoliy%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%GESTIO CAPITAL LTD%' OR i.legal_name ILIKE '%GESTIO%LTD%' OR i.legal_name ILIKE '%LTD%GESTIO%') AND s.commitment = 350000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Danielle BURNS%' OR i.legal_name ILIKE '%Danielle%BURNS%' OR i.legal_name ILIKE '%BURNS%Danielle%') AND s.commitment = 10000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%LF GROUP SARL%' OR i.legal_name ILIKE '%LF%SARL%' OR i.legal_name ILIKE '%SARL%LF%') AND s.commitment = 200000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%BSV SPV III LLC%' OR i.legal_name ILIKE '%BSV%LLC%' OR i.legal_name ILIKE '%LLC%BSV%') AND s.commitment = 984400.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%ODIN (ANIM X II LP)%' OR i.legal_name ILIKE '%ODIN%LP)%' OR i.legal_name ILIKE '%LP)%ODIN%') AND s.commitment = 261331.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC126';
