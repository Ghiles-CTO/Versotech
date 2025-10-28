-- VC13 Performance Fees Batch 2/3 (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN%' OR i.legal_name LIKE '%Mrs%SUBRAMANIAN%' OR i.legal_name LIKE '%SUBRAMANIAN%Mrs%') AND s.commitment = 105000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA%' OR i.legal_name LIKE '%Mrs%TANEJA%' OR i.legal_name LIKE '%TANEJA%Mrs%') AND s.commitment = 110000.0 THEN 0.2
        WHEN i.legal_name LIKE '%SAFE%' AND s.commitment = 250000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 500000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%' OR i.legal_name LIKE '%SUMMIT%LLC%' OR i.legal_name LIKE '%LLC%SUMMIT%') AND s.commitment = 300000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%NEWBRIDGE FINANCE SPF%' OR i.legal_name LIKE '%NEWBRIDGE%SPF%' OR i.legal_name LIKE '%SPF%NEWBRIDGE%') AND s.commitment = 2800000.0 THEN 0.15
        WHEN (i.legal_name LIKE '%Mayuriben JOGANI%' OR i.legal_name LIKE '%Mayuriben%JOGANI%' OR i.legal_name LIKE '%JOGANI%Mayuriben%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Erwan TAROUILLY%' OR i.legal_name LIKE '%Erwan%TAROUILLY%' OR i.legal_name LIKE '%TAROUILLY%Erwan%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Thierry ULDRY%' OR i.legal_name LIKE '%Thierry%ULDRY%' OR i.legal_name LIKE '%ULDRY%Thierry%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 500000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Jeremie COMEL%' OR i.legal_name LIKE '%Jeremie%COMEL%' OR i.legal_name LIKE '%COMEL%Jeremie%') AND s.commitment = 20000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%' OR i.legal_name LIKE '%Nineteen77%Limited%' OR i.legal_name LIKE '%Limited%Nineteen77%') AND s.commitment = 5999985.41 THEN 0.2
        WHEN (i.legal_name LIKE '%Gielke BURGMANS%' OR i.legal_name LIKE '%Gielke%BURGMANS%' OR i.legal_name LIKE '%BURGMANS%Gielke%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Halim EL MOGHAZI%' OR i.legal_name LIKE '%Halim%MOGHAZI%' OR i.legal_name LIKE '%MOGHAZI%Halim%') AND s.commitment = 26000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%John BARROWMAN%' OR i.legal_name LIKE '%John%BARROWMAN%' OR i.legal_name LIKE '%BARROWMAN%John%') AND s.commitment = 17000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%Tuygan GOKER%' OR i.legal_name LIKE '%Tuygan%GOKER%' OR i.legal_name LIKE '%GOKER%Tuygan%') AND s.commitment = 500000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Hong NGOC LE%' OR i.legal_name LIKE '%Hong%LE%' OR i.legal_name LIKE '%LE%Hong%') AND s.commitment = 10000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%Marco JERRENTRUP%' OR i.legal_name LIKE '%Marco%JERRENTRUP%' OR i.legal_name LIKE '%JERRENTRUP%Marco%') AND s.commitment = 50000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 60000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Denis MATTHEY%' OR i.legal_name LIKE '%Denis%MATTHEY%' OR i.legal_name LIKE '%MATTHEY%Denis%') AND s.commitment = 100000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%Robert DETTMEIJER%' OR i.legal_name LIKE '%Robert%DETTMEIJER%' OR i.legal_name LIKE '%DETTMEIJER%Robert%') AND s.commitment = 25000.0 THEN 0.1
        WHEN (i.legal_name LIKE '%Daniel BAUMSLAG%' OR i.legal_name LIKE '%Daniel%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Daniel%') AND s.commitment = 25000.0 THEN 0.2
        WHEN (i.legal_name LIKE '%SMR3T Capital Pte Ltd%' OR i.legal_name LIKE '%SMR3T%Ltd%' OR i.legal_name LIKE '%Ltd%SMR3T%') AND s.commitment = 100000.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC113';
