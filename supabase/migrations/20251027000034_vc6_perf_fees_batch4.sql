-- VC6 Performance Fees Batch 4/4 - PERCENT ONLY
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name LIKE '%Frederic SAMAMA%' OR i.legal_name LIKE '%Frederic%SAMAMA%' OR i.legal_name LIKE '%SAMAMA%Frederic%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Denis MATTHEY%' OR i.legal_name LIKE '%Denis%MATTHEY%' OR i.legal_name LIKE '%MATTHEY%Denis%') AND s.commitment = 561423.0 THEN 0.001
        WHEN (i.legal_name LIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%' OR i.legal_name LIKE '%SWISS%TRUST%' OR i.legal_name LIKE '%TRUST%SWISS%') AND s.commitment = 500000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Laurent CUDRE-MAUROUX%' OR i.legal_name LIKE '%Laurent%CUDRE-MAUROUX%' OR i.legal_name LIKE '%CUDRE-MAUROUX%Laurent%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Georges CYTRON%' OR i.legal_name LIKE '%Georges%CYTRON%' OR i.legal_name LIKE '%CYTRON%Georges%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Rosario RIENZO%' OR i.legal_name LIKE '%Rosario%RIENZO%' OR i.legal_name LIKE '%RIENZO%Rosario%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Raphael GHESQUIERES%' OR i.legal_name LIKE '%Raphael%GHESQUIERES%' OR i.legal_name LIKE '%GHESQUIERES%Raphael%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Guillaume SAMAMA%' OR i.legal_name LIKE '%Guillaume%SAMAMA%' OR i.legal_name LIKE '%SAMAMA%Guillaume%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%David ROSSIER%' OR i.legal_name LIKE '%David%ROSSIER%' OR i.legal_name LIKE '%ROSSIER%David%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%MARSAULT INTERNATIONAL LTD%' OR i.legal_name LIKE '%MARSAULT%LTD%' OR i.legal_name LIKE '%LTD%MARSAULT%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Bernard DUFAURE%' OR i.legal_name LIKE '%Bernard%DUFAURE%' OR i.legal_name LIKE '%DUFAURE%Bernard%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Scott FLETCHER%' OR i.legal_name LIKE '%Scott%FLETCHER%' OR i.legal_name LIKE '%FLETCHER%Scott%') AND s.commitment = 500000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Charles DE BAVIER%' OR i.legal_name LIKE '%Charles%BAVIER%' OR i.legal_name LIKE '%BAVIER%Charles%') AND s.commitment = 200000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Charles RIVA%' OR i.legal_name LIKE '%Charles%RIVA%' OR i.legal_name LIKE '%RIVA%Charles%') AND s.commitment = 500000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Jeremie CYROT%' OR i.legal_name LIKE '%Jeremie%CYROT%' OR i.legal_name LIKE '%CYROT%Jeremie%') AND s.commitment = 250000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Juan TONELLI BANFI%' OR i.legal_name LIKE '%Juan%BANFI%' OR i.legal_name LIKE '%BANFI%Juan%') AND s.commitment = 250000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 12279%' OR i.legal_name LIKE '%Banco%12279%' OR i.legal_name LIKE '%12279%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34658%' OR i.legal_name LIKE '%Banco%34658%' OR i.legal_name LIKE '%34658%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34924%' OR i.legal_name LIKE '%Banco%34924%' OR i.legal_name LIKE '%34924%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36003%' OR i.legal_name LIKE '%Banco%36003%' OR i.legal_name LIKE '%36003%Banco%') AND s.commitment = 250000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36749%' OR i.legal_name LIKE '%Banco%36749%' OR i.legal_name LIKE '%36749%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36957%' OR i.legal_name LIKE '%Banco%36957%' OR i.legal_name LIKE '%36957%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80738%' OR i.legal_name LIKE '%Banco%80738%' OR i.legal_name LIKE '%80738%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80772%' OR i.legal_name LIKE '%Banco%80772%' OR i.legal_name LIKE '%80772%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80775%' OR i.legal_name LIKE '%Banco%80775%' OR i.legal_name LIKE '%80775%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80776%' OR i.legal_name LIKE '%Banco%80776%' OR i.legal_name LIKE '%80776%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80840%' OR i.legal_name LIKE '%Banco%80840%' OR i.legal_name LIKE '%80840%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80862%' OR i.legal_name LIKE '%Banco%80862%' OR i.legal_name LIKE '%80862%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80873%' OR i.legal_name LIKE '%Banco%80873%' OR i.legal_name LIKE '%80873%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80890%' OR i.legal_name LIKE '%Banco%80890%' OR i.legal_name LIKE '%80890%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80910%' OR i.legal_name LIKE '%Banco%80910%' OR i.legal_name LIKE '%80910%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 81022%' OR i.legal_name LIKE '%Banco%81022%' OR i.legal_name LIKE '%81022%Banco%') AND s.commitment = 100000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%Banco BTG Pactual S.A. Client 515%' OR i.legal_name LIKE '%Banco%515%' OR i.legal_name LIKE '%515%Banco%') AND s.commitment = 1000000.0 THEN 0.002
        WHEN (i.legal_name LIKE '%RLABS HOLDINGS LTD%' OR i.legal_name LIKE '%RLABS%LTD%' OR i.legal_name LIKE '%LTD%RLABS%') AND s.commitment = 550000.0 THEN 0.001
        WHEN (i.legal_name LIKE '%Samuel GRANDCHAMP%' OR i.legal_name LIKE '%Samuel%GRANDCHAMP%' OR i.legal_name LIKE '%GRANDCHAMP%Samuel%') AND s.commitment = 75000.0 THEN 0.002
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC106';