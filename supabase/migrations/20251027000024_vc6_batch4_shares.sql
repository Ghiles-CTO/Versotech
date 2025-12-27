-- VC6 Batch 4/4: Share data
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN i.legal_name LIKE '%Frederic SAMAMA%' AND s.commitment = 100000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Denis MATTHEY%' AND s.commitment = 561423.0 THEN 21.0
        WHEN i.legal_name LIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%' AND s.commitment = 500000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Laurent CUDRE-MAUROUX%' AND s.commitment = 100000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Georges CYTRON%' AND s.commitment = 100000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Rosario RIENZO%' AND s.commitment = 200000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Raphael GHESQUIERES%' AND s.commitment = 100000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Guillaume SAMAMA%' AND s.commitment = 100000.0 THEN 21.0
        WHEN i.legal_name LIKE '%David ROSSIER%' AND s.commitment = 200000.0 THEN 21.0
        WHEN i.legal_name LIKE '%MARSAULT INTERNATIONAL LTD%' AND s.commitment = 200000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Bernard DUFAURE%' AND s.commitment = 100000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Murat Cem and Mehmet Can GOKER%' AND s.commitment = 650000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Scott FLETCHER%' AND s.commitment = 500000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Vasily SUKHOTIN%' AND s.commitment = 600000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Charles DE BAVIER%' AND s.commitment = 200000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Charles RIVA%' AND s.commitment = 500000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Jeremie CYROT%' AND s.commitment = 250000.0 THEN 21.0
        WHEN i.legal_name LIKE '%Hossien JAVID%' AND s.commitment = 49980.0 THEN 19.5
        WHEN i.legal_name LIKE '%Kamyar BADII%' AND s.commitment = 19992.0 THEN 19.5
        WHEN i.legal_name LIKE '%Shaham SOLOUKI%' AND s.commitment = 49980.0 THEN 19.5
        WHEN i.legal_name LIKE '%Kian JAVID%' AND s.commitment = 24978.24 THEN 19.5
        WHEN i.legal_name LIKE '%Salman HUSSAIN%' AND s.commitment = 49980.0 THEN 19.5
        WHEN i.legal_name LIKE '%Juan TONELLI BANFI%' AND s.commitment = 250000.0 THEN 19.5
        WHEN i.legal_name LIKE '%GREENLEAF%' AND s.commitment = 1549144.8 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 12279%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34658%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34924%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36003%' AND s.commitment = 250000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36749%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36957%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80738%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80772%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80775%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80776%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80840%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80862%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80873%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80890%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80910%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 81022%' AND s.commitment = 100000.0 THEN 19.5
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 515%' AND s.commitment = 1000000.0 THEN 19.5
        WHEN i.legal_name LIKE '%RLABS HOLDINGS LTD%' AND s.commitment = 550000.0 THEN 21.0
        WHEN i.legal_name LIKE '%OLD HILL INVESTMENT GROUP LLC%' AND s.commitment = 700000.0 THEN 19.5
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN i.legal_name LIKE '%Frederic SAMAMA%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Denis MATTHEY%' AND s.commitment = 561423.0 THEN 23.52
        WHEN i.legal_name LIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%' AND s.commitment = 500000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Laurent CUDRE-MAUROUX%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Georges CYTRON%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Rosario RIENZO%' AND s.commitment = 200000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Raphael GHESQUIERES%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Guillaume SAMAMA%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%David ROSSIER%' AND s.commitment = 200000.0 THEN 23.52
        WHEN i.legal_name LIKE '%MARSAULT INTERNATIONAL LTD%' AND s.commitment = 200000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Bernard DUFAURE%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Murat Cem and Mehmet Can GOKER%' AND s.commitment = 650000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Scott FLETCHER%' AND s.commitment = 500000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Vasily SUKHOTIN%' AND s.commitment = 600000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Charles DE BAVIER%' AND s.commitment = 200000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Charles RIVA%' AND s.commitment = 500000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Jeremie CYROT%' AND s.commitment = 250000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Hossien JAVID%' AND s.commitment = 49980.0 THEN 23.52
        WHEN i.legal_name LIKE '%Kamyar BADII%' AND s.commitment = 19992.0 THEN 23.52
        WHEN i.legal_name LIKE '%Shaham SOLOUKI%' AND s.commitment = 49980.0 THEN 23.52
        WHEN i.legal_name LIKE '%Kian JAVID%' AND s.commitment = 24978.24 THEN 23.52
        WHEN i.legal_name LIKE '%Salman HUSSAIN%' AND s.commitment = 49980.0 THEN 23.52
        WHEN i.legal_name LIKE '%Juan TONELLI BANFI%' AND s.commitment = 250000.0 THEN 23.52
        WHEN i.legal_name LIKE '%GREENLEAF%' AND s.commitment = 1549144.8 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 12279%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34658%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34924%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36003%' AND s.commitment = 250000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36749%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36957%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80738%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80772%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80775%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80776%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80840%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80862%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80873%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80890%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80910%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 81022%' AND s.commitment = 100000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 515%' AND s.commitment = 1000000.0 THEN 23.52
        WHEN i.legal_name LIKE '%RLABS HOLDINGS LTD%' AND s.commitment = 550000.0 THEN 23.52
        WHEN i.legal_name LIKE '%OLD HILL INVESTMENT GROUP LLC%' AND s.commitment = 700000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Samuel GRANDCHAMP%' AND s.commitment = 75000.0 THEN 23.52
        WHEN i.legal_name LIKE '%Luiz FONTES WILLIAMS%' AND s.commitment = 100000.0 THEN 24.52
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 434863.0 THEN 11.2
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 234607.0 THEN 11.2
        WHEN i.legal_name LIKE '%STABLETON (ALTERNATIVE ISSUANCE)%' AND s.commitment = 4163030.12 THEN 24.52
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 70902.0 THEN 19.5
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN i.legal_name LIKE '%Frederic SAMAMA%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Denis MATTHEY%' AND s.commitment = 561423.0 THEN 23870.0
        WHEN i.legal_name LIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%' AND s.commitment = 500000.0 THEN 21258.0
        WHEN i.legal_name LIKE '%Laurent CUDRE-MAUROUX%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Georges CYTRON%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Rosario RIENZO%' AND s.commitment = 200000.0 THEN 8503.0
        WHEN i.legal_name LIKE '%Raphael GHESQUIERES%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Guillaume SAMAMA%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%David ROSSIER%' AND s.commitment = 200000.0 THEN 8503.0
        WHEN i.legal_name LIKE '%MARSAULT INTERNATIONAL LTD%' AND s.commitment = 200000.0 THEN 8503.0
        WHEN i.legal_name LIKE '%Bernard DUFAURE%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Murat Cem and Mehmet Can GOKER%' AND s.commitment = 650000.0 THEN 27636.0
        WHEN i.legal_name LIKE '%Scott FLETCHER%' AND s.commitment = 500000.0 THEN 21258.0
        WHEN i.legal_name LIKE '%Vasily SUKHOTIN%' AND s.commitment = 600000.0 THEN 25510.0
        WHEN i.legal_name LIKE '%Charles DE BAVIER%' AND s.commitment = 200000.0 THEN 8503.0
        WHEN i.legal_name LIKE '%Charles RIVA%' AND s.commitment = 500000.0 THEN 21258.0
        WHEN i.legal_name LIKE '%Jeremie CYROT%' AND s.commitment = 250000.0 THEN 10629.0
        WHEN i.legal_name LIKE '%Hossien JAVID%' AND s.commitment = 49980.0 THEN 2125.0
        WHEN i.legal_name LIKE '%Kamyar BADII%' AND s.commitment = 19992.0 THEN 850.0
        WHEN i.legal_name LIKE '%Shaham SOLOUKI%' AND s.commitment = 49980.0 THEN 2125.0
        WHEN i.legal_name LIKE '%Kian JAVID%' AND s.commitment = 24978.24 THEN 1062.0
        WHEN i.legal_name LIKE '%Salman HUSSAIN%' AND s.commitment = 49980.0 THEN 2125.0
        WHEN i.legal_name LIKE '%Juan TONELLI BANFI%' AND s.commitment = 250000.0 THEN 10629.0
        WHEN i.legal_name LIKE '%GREENLEAF%' AND s.commitment = 1549144.8 THEN 65865.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 12279%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34658%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 34924%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36003%' AND s.commitment = 250000.0 THEN 10629.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36749%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 36957%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80738%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80772%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80775%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80776%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80840%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80862%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80873%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80890%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 80910%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 81022%' AND s.commitment = 100000.0 THEN 4251.0
        WHEN i.legal_name LIKE '%Banco BTG Pactual S.A. Client 515%' AND s.commitment = 1000000.0 THEN 42517.0
        WHEN i.legal_name LIKE '%RLABS HOLDINGS LTD%' AND s.commitment = 550000.0 THEN 23384.0
        WHEN i.legal_name LIKE '%OLD HILL INVESTMENT GROUP LLC%' AND s.commitment = 700000.0 THEN 29761.0
        WHEN i.legal_name LIKE '%Samuel GRANDCHAMP%' AND s.commitment = 75000.0 THEN 3188.0
        WHEN i.legal_name LIKE '%Luiz FONTES WILLIAMS%' AND s.commitment = 100000.0 THEN 4078.0
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 434863.0 THEN 38827.0
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 234607.0 THEN 20947.0
        WHEN i.legal_name LIKE '%STABLETON (ALTERNATIVE ISSUANCE)%' AND s.commitment = 4163030.12 THEN 169781.0
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 70902.0 THEN 3636.0
        ELSE num_shares
    END,
    spread_per_share = CASE
        WHEN cost_per_share IS NOT NULL AND price_per_share IS NOT NULL THEN price_per_share - cost_per_share
        ELSE spread_per_share
    END,
    spread_fee_amount = CASE
        WHEN cost_per_share IS NOT NULL AND price_per_share IS NOT NULL AND num_shares IS NOT NULL
            THEN (price_per_share - cost_per_share) * num_shares
        ELSE spread_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC106';
