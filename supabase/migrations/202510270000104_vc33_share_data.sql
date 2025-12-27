-- VC33 Share Data: 16 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name ILIKE '%Charles DE BAVIER%' OR i.legal_name ILIKE '%Charles%BAVIER%' OR i.legal_name ILIKE '%BAVIER%Charles%') AND s.commitment = 100000.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%' OR i.legal_name ILIKE '%JASSQ%LIMITED%' OR i.legal_name ILIKE '%LIMITED%JASSQ%') AND s.commitment = 279000.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%' OR i.legal_name ILIKE '%CARTA%LLC%' OR i.legal_name ILIKE '%LLC%CARTA%') AND s.commitment = 100000.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%Sahejman KAHLON%' OR i.legal_name ILIKE '%Sahejman%KAHLON%' OR i.legal_name ILIKE '%KAHLON%Sahejman%') AND s.commitment = 50000.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%777 WALNUT LLC%' OR i.legal_name ILIKE '%777%LLC%' OR i.legal_name ILIKE '%LLC%777%') AND s.commitment = 50000.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%Keir BENBOW%' OR i.legal_name ILIKE '%Keir%BENBOW%' OR i.legal_name ILIKE '%BENBOW%Keir%') AND s.commitment = 48825.0 THEN 1275.0
        WHEN (i.legal_name ILIKE '%Marco JERRENTRUP%' OR i.legal_name ILIKE '%Marco%JERRENTRUP%' OR i.legal_name ILIKE '%JERRENTRUP%Marco%') AND s.commitment = 49000.0 THEN 1275.0
        WHEN (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%' OR i.legal_name ILIKE '%ZANDERA%Ltd%' OR i.legal_name ILIKE '%Ltd%ZANDERA%') AND s.commitment = 1000000.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%Band Capital Limited%' OR i.legal_name ILIKE '%Band%Limited%' OR i.legal_name ILIKE '%Limited%Band%') AND s.commitment = 499410.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%Jeremy LOWY%' OR i.legal_name ILIKE '%Jeremy%LOWY%' OR i.legal_name ILIKE '%LOWY%Jeremy%') AND s.commitment = 50000.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 514755.0 THEN 1300.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 484065.0 THEN 811.2521326
        WHEN (i.legal_name ILIKE '%VERSO HOLDINGS%' OR i.legal_name ILIKE '%VERSO%HOLDINGS%' OR i.legal_name ILIKE '%HOLDINGS%VERSO%') AND s.commitment = 3200.0 THEN 773.69
        WHEN (i.legal_name ILIKE '%Tobias JOERN%' OR i.legal_name ILIKE '%Tobias%JOERN%' OR i.legal_name ILIKE '%JOERN%Tobias%') AND s.commitment = 8970.0 THEN 773.69
        WHEN (i.legal_name ILIKE '%René ROSSDEUTSCHER%' OR i.legal_name ILIKE '%René%ROSSDEUTSCHER%' OR i.legal_name ILIKE '%ROSSDEUTSCHER%René%') AND s.commitment = 19435.0 THEN 773.69
        WHEN (i.legal_name ILIKE '%Ellen  STAUDENMAYER%' OR i.legal_name ILIKE '%Ellen%STAUDENMAYER%' OR i.legal_name ILIKE '%STAUDENMAYER%Ellen%') AND s.commitment = 8970.0 THEN 773.69
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name ILIKE '%Charles DE BAVIER%' OR i.legal_name ILIKE '%Charles%BAVIER%' OR i.legal_name ILIKE '%BAVIER%Charles%') AND s.commitment = 100000.0 THEN 1495.0
        WHEN (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%' OR i.legal_name ILIKE '%JASSQ%LIMITED%' OR i.legal_name ILIKE '%LIMITED%JASSQ%') AND s.commitment = 279000.0 THEN 1395.0
        WHEN (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%' OR i.legal_name ILIKE '%CARTA%LLC%' OR i.legal_name ILIKE '%LLC%CARTA%') AND s.commitment = 100000.0 THEN 1495.0
        WHEN (i.legal_name ILIKE '%Sahejman KAHLON%' OR i.legal_name ILIKE '%Sahejman%KAHLON%' OR i.legal_name ILIKE '%KAHLON%Sahejman%') AND s.commitment = 50000.0 THEN 1495.0
        WHEN (i.legal_name ILIKE '%777 WALNUT LLC%' OR i.legal_name ILIKE '%777%LLC%' OR i.legal_name ILIKE '%LLC%777%') AND s.commitment = 50000.0 THEN 1495.0
        WHEN (i.legal_name ILIKE '%Keir BENBOW%' OR i.legal_name ILIKE '%Keir%BENBOW%' OR i.legal_name ILIKE '%BENBOW%Keir%') AND s.commitment = 48825.0 THEN 1395.0
        WHEN (i.legal_name ILIKE '%Marco JERRENTRUP%' OR i.legal_name ILIKE '%Marco%JERRENTRUP%' OR i.legal_name ILIKE '%JERRENTRUP%Marco%') AND s.commitment = 49000.0 THEN 1395.0
        WHEN (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%' OR i.legal_name ILIKE '%ZANDERA%Ltd%' OR i.legal_name ILIKE '%Ltd%ZANDERA%') AND s.commitment = 1000000.0 THEN 1550.0
        WHEN (i.legal_name ILIKE '%Band Capital Limited%' OR i.legal_name ILIKE '%Band%Limited%' OR i.legal_name ILIKE '%Limited%Band%') AND s.commitment = 499410.0 THEN 1395.0
        WHEN (i.legal_name ILIKE '%Jeremy LOWY%' OR i.legal_name ILIKE '%Jeremy%LOWY%' OR i.legal_name ILIKE '%LOWY%Jeremy%') AND s.commitment = 50000.0 THEN 1495.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 514755.0 THEN 1395.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 484065.0 THEN 1395.0
        WHEN (i.legal_name ILIKE '%VERSO HOLDINGS%' OR i.legal_name ILIKE '%VERSO%HOLDINGS%' OR i.legal_name ILIKE '%HOLDINGS%VERSO%') AND s.commitment = 3200.0 THEN 800.0
        WHEN (i.legal_name ILIKE '%Tobias JOERN%' OR i.legal_name ILIKE '%Tobias%JOERN%' OR i.legal_name ILIKE '%JOERN%Tobias%') AND s.commitment = 8970.0 THEN 1495.0
        WHEN (i.legal_name ILIKE '%René ROSSDEUTSCHER%' OR i.legal_name ILIKE '%René%ROSSDEUTSCHER%' OR i.legal_name ILIKE '%ROSSDEUTSCHER%René%') AND s.commitment = 19435.0 THEN 1495.0
        WHEN (i.legal_name ILIKE '%Ellen  STAUDENMAYER%' OR i.legal_name ILIKE '%Ellen%STAUDENMAYER%' OR i.legal_name ILIKE '%STAUDENMAYER%Ellen%') AND s.commitment = 8970.0 THEN 1495.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%Charles DE BAVIER%' OR i.legal_name ILIKE '%Charles%BAVIER%' OR i.legal_name ILIKE '%BAVIER%Charles%') AND s.commitment = 100000.0 THEN 66.0
        WHEN (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%' OR i.legal_name ILIKE '%JASSQ%LIMITED%' OR i.legal_name ILIKE '%LIMITED%JASSQ%') AND s.commitment = 279000.0 THEN 200.0
        WHEN (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%' OR i.legal_name ILIKE '%CARTA%LLC%' OR i.legal_name ILIKE '%LLC%CARTA%') AND s.commitment = 100000.0 THEN 66.0
        WHEN (i.legal_name ILIKE '%Sahejman KAHLON%' OR i.legal_name ILIKE '%Sahejman%KAHLON%' OR i.legal_name ILIKE '%KAHLON%Sahejman%') AND s.commitment = 50000.0 THEN 33.0
        WHEN (i.legal_name ILIKE '%777 WALNUT LLC%' OR i.legal_name ILIKE '%777%LLC%' OR i.legal_name ILIKE '%LLC%777%') AND s.commitment = 50000.0 THEN 33.0
        WHEN (i.legal_name ILIKE '%Keir BENBOW%' OR i.legal_name ILIKE '%Keir%BENBOW%' OR i.legal_name ILIKE '%BENBOW%Keir%') AND s.commitment = 48825.0 THEN 35.0
        WHEN (i.legal_name ILIKE '%Marco JERRENTRUP%' OR i.legal_name ILIKE '%Marco%JERRENTRUP%' OR i.legal_name ILIKE '%JERRENTRUP%Marco%') AND s.commitment = 49000.0 THEN 35.0
        WHEN (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%' OR i.legal_name ILIKE '%ZANDERA%Ltd%' OR i.legal_name ILIKE '%Ltd%ZANDERA%') AND s.commitment = 1000000.0 THEN 645.0
        WHEN (i.legal_name ILIKE '%Band Capital Limited%' OR i.legal_name ILIKE '%Band%Limited%' OR i.legal_name ILIKE '%Limited%Band%') AND s.commitment = 499410.0 THEN 358.0
        WHEN (i.legal_name ILIKE '%Jeremy LOWY%' OR i.legal_name ILIKE '%Jeremy%LOWY%' OR i.legal_name ILIKE '%LOWY%Jeremy%') AND s.commitment = 50000.0 THEN 33.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 514755.0 THEN 369.0
        WHEN (i.legal_name ILIKE '%Tuygan GOKER%' OR i.legal_name ILIKE '%Tuygan%GOKER%' OR i.legal_name ILIKE '%GOKER%Tuygan%') AND s.commitment = 484065.0 THEN 347.0
        WHEN (i.legal_name ILIKE '%VERSO HOLDINGS%' OR i.legal_name ILIKE '%VERSO%HOLDINGS%' OR i.legal_name ILIKE '%HOLDINGS%VERSO%') AND s.commitment = 3200.0 THEN 4.0
        WHEN (i.legal_name ILIKE '%Tobias JOERN%' OR i.legal_name ILIKE '%Tobias%JOERN%' OR i.legal_name ILIKE '%JOERN%Tobias%') AND s.commitment = 8970.0 THEN 6.0
        WHEN (i.legal_name ILIKE '%René ROSSDEUTSCHER%' OR i.legal_name ILIKE '%René%ROSSDEUTSCHER%' OR i.legal_name ILIKE '%ROSSDEUTSCHER%René%') AND s.commitment = 19435.0 THEN 13.0
        WHEN (i.legal_name ILIKE '%Ellen  STAUDENMAYER%' OR i.legal_name ILIKE '%Ellen%STAUDENMAYER%' OR i.legal_name ILIKE '%STAUDENMAYER%Ellen%') AND s.commitment = 8970.0 THEN 6.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC133';
