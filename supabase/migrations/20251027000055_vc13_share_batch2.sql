-- VC13 Share Data Batch 2/3
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%EMPIRE GROUP Limited%' OR i.legal_name LIKE '%EMPIRE%Limited%' OR i.legal_name LIKE '%Limited%EMPIRE%') AND s.commitment = 200000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN%' OR i.legal_name LIKE '%Mrs%SUBRAMANIAN%' OR i.legal_name LIKE '%SUBRAMANIAN%Mrs%') AND s.commitment = 105000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA%' OR i.legal_name LIKE '%Mrs%TANEJA%' OR i.legal_name LIKE '%TANEJA%Mrs%') AND s.commitment = 110000.0 THEN 26.495
        WHEN i.legal_name LIKE '%SAFE%' AND s.commitment = 250000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 500000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%' OR i.legal_name LIKE '%SUMMIT%LLC%' OR i.legal_name LIKE '%LLC%SUMMIT%') AND s.commitment = 300000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%NEWBRIDGE FINANCE SPF%' OR i.legal_name LIKE '%NEWBRIDGE%SPF%' OR i.legal_name LIKE '%SPF%NEWBRIDGE%') AND s.commitment = 2800000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Mayuriben JOGANI%' OR i.legal_name LIKE '%Mayuriben%JOGANI%' OR i.legal_name LIKE '%JOGANI%Mayuriben%') AND s.commitment = 100000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Charles DE BAVIER%' OR i.legal_name LIKE '%Charles%BAVIER%' OR i.legal_name LIKE '%BAVIER%Charles%') AND s.commitment = 200000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Erwan TAROUILLY%' OR i.legal_name LIKE '%Erwan%TAROUILLY%' OR i.legal_name LIKE '%TAROUILLY%Erwan%') AND s.commitment = 100000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Thierry ULDRY%' OR i.legal_name LIKE '%Thierry%ULDRY%' OR i.legal_name LIKE '%ULDRY%Thierry%') AND s.commitment = 100000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 500000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Jeremie COMEL%' OR i.legal_name LIKE '%Jeremie%COMEL%' OR i.legal_name LIKE '%COMEL%Jeremie%') AND s.commitment = 20000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%' OR i.legal_name LIKE '%Nineteen77%Limited%' OR i.legal_name LIKE '%Limited%Nineteen77%') AND s.commitment = 5999985.41 THEN 26.495
        WHEN (i.legal_name LIKE '%Gielke BURGMANS%' OR i.legal_name LIKE '%Gielke%BURGMANS%' OR i.legal_name LIKE '%BURGMANS%Gielke%') AND s.commitment = 100000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Halim EL MOGHAZI%' OR i.legal_name LIKE '%Halim%MOGHAZI%' OR i.legal_name LIKE '%MOGHAZI%Halim%') AND s.commitment = 26000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%John BARROWMAN%' OR i.legal_name LIKE '%John%BARROWMAN%' OR i.legal_name LIKE '%BARROWMAN%John%') AND s.commitment = 17000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Tuygan GOKER%' OR i.legal_name LIKE '%Tuygan%GOKER%' OR i.legal_name LIKE '%GOKER%Tuygan%') AND s.commitment = 500000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Hong NGOC LE%' OR i.legal_name LIKE '%Hong%LE%' OR i.legal_name LIKE '%LE%Hong%') AND s.commitment = 10000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Marco JERRENTRUP%' OR i.legal_name LIKE '%Marco%JERRENTRUP%' OR i.legal_name LIKE '%JERRENTRUP%Marco%') AND s.commitment = 50000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 4160000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 60000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 2124000.0 THEN 26.495
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%EMPIRE GROUP Limited%' OR i.legal_name LIKE '%EMPIRE%Limited%' OR i.legal_name LIKE '%Limited%EMPIRE%') AND s.commitment = 200000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN%' OR i.legal_name LIKE '%Mrs%SUBRAMANIAN%' OR i.legal_name LIKE '%SUBRAMANIAN%Mrs%') AND s.commitment = 105000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA%' OR i.legal_name LIKE '%Mrs%TANEJA%' OR i.legal_name LIKE '%TANEJA%Mrs%') AND s.commitment = 110000.0 THEN 26.8314
        WHEN i.legal_name LIKE '%SAFE%' AND s.commitment = 250000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 500000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%' OR i.legal_name LIKE '%SUMMIT%LLC%' OR i.legal_name LIKE '%LLC%SUMMIT%') AND s.commitment = 300000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%NEWBRIDGE FINANCE SPF%' OR i.legal_name LIKE '%NEWBRIDGE%SPF%' OR i.legal_name LIKE '%SPF%NEWBRIDGE%') AND s.commitment = 2800000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Mayuriben JOGANI%' OR i.legal_name LIKE '%Mayuriben%JOGANI%' OR i.legal_name LIKE '%JOGANI%Mayuriben%') AND s.commitment = 100000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Charles DE BAVIER%' OR i.legal_name LIKE '%Charles%BAVIER%' OR i.legal_name LIKE '%BAVIER%Charles%') AND s.commitment = 200000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Erwan TAROUILLY%' OR i.legal_name LIKE '%Erwan%TAROUILLY%' OR i.legal_name LIKE '%TAROUILLY%Erwan%') AND s.commitment = 100000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Thierry ULDRY%' OR i.legal_name LIKE '%Thierry%ULDRY%' OR i.legal_name LIKE '%ULDRY%Thierry%') AND s.commitment = 100000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 500000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Jeremie COMEL%' OR i.legal_name LIKE '%Jeremie%COMEL%' OR i.legal_name LIKE '%COMEL%Jeremie%') AND s.commitment = 20000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%' OR i.legal_name LIKE '%Nineteen77%Limited%' OR i.legal_name LIKE '%Limited%Nineteen77%') AND s.commitment = 5999985.41 THEN 26.501
        WHEN (i.legal_name LIKE '%Gielke BURGMANS%' OR i.legal_name LIKE '%Gielke%BURGMANS%' OR i.legal_name LIKE '%BURGMANS%Gielke%') AND s.commitment = 100000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Halim EL MOGHAZI%' OR i.legal_name LIKE '%Halim%MOGHAZI%' OR i.legal_name LIKE '%MOGHAZI%Halim%') AND s.commitment = 26000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%John BARROWMAN%' OR i.legal_name LIKE '%John%BARROWMAN%' OR i.legal_name LIKE '%BARROWMAN%John%') AND s.commitment = 17000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Tuygan GOKER%' OR i.legal_name LIKE '%Tuygan%GOKER%' OR i.legal_name LIKE '%GOKER%Tuygan%') AND s.commitment = 500000.0 THEN 26.495
        WHEN (i.legal_name LIKE '%Hong NGOC LE%' OR i.legal_name LIKE '%Hong%LE%' OR i.legal_name LIKE '%LE%Hong%') AND s.commitment = 10000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Marco JERRENTRUP%' OR i.legal_name LIKE '%Marco%JERRENTRUP%' OR i.legal_name LIKE '%JERRENTRUP%Marco%') AND s.commitment = 50000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 42.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 4160000.0 THEN 27.5612
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 60000.0 THEN 26.8314
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 2124000.0 THEN 26.495
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%EMPIRE GROUP Limited%' OR i.legal_name LIKE '%EMPIRE%Limited%' OR i.legal_name LIKE '%Limited%EMPIRE%') AND s.commitment = 200000.0 THEN 7453.0
        WHEN (i.legal_name LIKE '%Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN%' OR i.legal_name LIKE '%Mrs%SUBRAMANIAN%' OR i.legal_name LIKE '%SUBRAMANIAN%Mrs%') AND s.commitment = 105000.0 THEN 3913.0
        WHEN (i.legal_name LIKE '%Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA%' OR i.legal_name LIKE '%Mrs%TANEJA%' OR i.legal_name LIKE '%TANEJA%Mrs%') AND s.commitment = 110000.0 THEN 4099.0
        WHEN i.legal_name LIKE '%SAFE%' AND s.commitment = 250000.0 THEN 9317.0
        WHEN (i.legal_name LIKE '%FRALIS SPF%' OR i.legal_name LIKE '%FRALIS%SPF%' OR i.legal_name LIKE '%SPF%FRALIS%') AND s.commitment = 500000.0 THEN 18634.0
        WHEN (i.legal_name LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%' OR i.legal_name LIKE '%SUMMIT%LLC%' OR i.legal_name LIKE '%LLC%SUMMIT%') AND s.commitment = 300000.0 THEN 11180.0
        WHEN (i.legal_name LIKE '%NEWBRIDGE FINANCE SPF%' OR i.legal_name LIKE '%NEWBRIDGE%SPF%' OR i.legal_name LIKE '%SPF%NEWBRIDGE%') AND s.commitment = 2800000.0 THEN 104355.0
        WHEN (i.legal_name LIKE '%Mayuriben JOGANI%' OR i.legal_name LIKE '%Mayuriben%JOGANI%' OR i.legal_name LIKE '%JOGANI%Mayuriben%') AND s.commitment = 100000.0 THEN 3726.0
        WHEN (i.legal_name LIKE '%Charles DE BAVIER%' OR i.legal_name LIKE '%Charles%BAVIER%' OR i.legal_name LIKE '%BAVIER%Charles%') AND s.commitment = 200000.0 THEN 7453.0
        WHEN (i.legal_name LIKE '%Erwan TAROUILLY%' OR i.legal_name LIKE '%Erwan%TAROUILLY%' OR i.legal_name LIKE '%TAROUILLY%Erwan%') AND s.commitment = 100000.0 THEN 3726.0
        WHEN (i.legal_name LIKE '%Thierry ULDRY%' OR i.legal_name LIKE '%Thierry%ULDRY%' OR i.legal_name LIKE '%ULDRY%Thierry%') AND s.commitment = 100000.0 THEN 3726.0
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 500000.0 THEN 18634.0
        WHEN (i.legal_name LIKE '%Jeremie COMEL%' OR i.legal_name LIKE '%Jeremie%COMEL%' OR i.legal_name LIKE '%COMEL%Jeremie%') AND s.commitment = 20000.0 THEN 745.0
        WHEN (i.legal_name LIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%' OR i.legal_name LIKE '%Nineteen77%Limited%' OR i.legal_name LIKE '%Limited%Nineteen77%') AND s.commitment = 5999985.41 THEN 226406.0
        WHEN (i.legal_name LIKE '%Gielke BURGMANS%' OR i.legal_name LIKE '%Gielke%BURGMANS%' OR i.legal_name LIKE '%BURGMANS%Gielke%') AND s.commitment = 100000.0 THEN 3726.0
        WHEN (i.legal_name LIKE '%Halim EL MOGHAZI%' OR i.legal_name LIKE '%Halim%MOGHAZI%' OR i.legal_name LIKE '%MOGHAZI%Halim%') AND s.commitment = 26000.0 THEN 969.0
        WHEN (i.legal_name LIKE '%John BARROWMAN%' OR i.legal_name LIKE '%John%BARROWMAN%' OR i.legal_name LIKE '%BARROWMAN%John%') AND s.commitment = 17000.0 THEN 633.0
        WHEN (i.legal_name LIKE '%Robin DOBLE%' OR i.legal_name LIKE '%Robin%DOBLE%' OR i.legal_name LIKE '%DOBLE%Robin%') AND s.commitment = 25000.0 THEN 931.0
        WHEN (i.legal_name LIKE '%Tuygan GOKER%' OR i.legal_name LIKE '%Tuygan%GOKER%' OR i.legal_name LIKE '%GOKER%Tuygan%') AND s.commitment = 500000.0 THEN 18871.0
        WHEN (i.legal_name LIKE '%Hong NGOC LE%' OR i.legal_name LIKE '%Hong%LE%' OR i.legal_name LIKE '%LE%Hong%') AND s.commitment = 10000.0 THEN 372.0
        WHEN (i.legal_name LIKE '%Marco JERRENTRUP%' OR i.legal_name LIKE '%Marco%JERRENTRUP%' OR i.legal_name LIKE '%JERRENTRUP%Marco%') AND s.commitment = 50000.0 THEN 1863.0
        WHEN (i.legal_name LIKE '%Zandera (Finco) Limited%' OR i.legal_name LIKE '%Zandera%Limited%' OR i.legal_name LIKE '%Limited%Zandera%') AND s.commitment = 1000000.0 THEN 23809.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 4160000.0 THEN 150937.0
        WHEN (i.legal_name LIKE '%Deyan MIHOV%' OR i.legal_name LIKE '%Deyan%MIHOV%' OR i.legal_name LIKE '%MIHOV%Deyan%') AND s.commitment = 60000.0 THEN 2236.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 2124000.0 THEN 80166.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC113';
