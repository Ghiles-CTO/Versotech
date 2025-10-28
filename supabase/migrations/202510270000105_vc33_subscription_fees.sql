-- VC33 Subscription Fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN (i.legal_name ILIKE '%Charles DE BAVIER%' OR i.legal_name ILIKE '%Charles%BAVIER%' OR i.legal_name ILIKE '%BAVIER%Charles%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%' OR i.legal_name ILIKE '%CARTA%LLC%' OR i.legal_name ILIKE '%LLC%CARTA%') AND s.commitment = 100000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Sahejman KAHLON%' OR i.legal_name ILIKE '%Sahejman%KAHLON%' OR i.legal_name ILIKE '%KAHLON%Sahejman%') AND s.commitment = 50000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%777 WALNUT LLC%' OR i.legal_name ILIKE '%777%LLC%' OR i.legal_name ILIKE '%LLC%777%') AND s.commitment = 50000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Marco JERRENTRUP%' OR i.legal_name ILIKE '%Marco%JERRENTRUP%' OR i.legal_name ILIKE '%JERRENTRUP%Marco%') AND s.commitment = 49000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%' OR i.legal_name ILIKE '%ZANDERA%Ltd%' OR i.legal_name ILIKE '%Ltd%ZANDERA%') AND s.commitment = 1000000.0 THEN 0.05
        WHEN (i.legal_name ILIKE '%Jeremy LOWY%' OR i.legal_name ILIKE '%Jeremy%LOWY%' OR i.legal_name ILIKE '%LOWY%Jeremy%') AND s.commitment = 50000.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Tobias JOERN%' OR i.legal_name ILIKE '%Tobias%JOERN%' OR i.legal_name ILIKE '%JOERN%Tobias%') AND s.commitment = 8970.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%René ROSSDEUTSCHER%' OR i.legal_name ILIKE '%René%ROSSDEUTSCHER%' OR i.legal_name ILIKE '%ROSSDEUTSCHER%René%') AND s.commitment = 19435.0 THEN 0.02
        WHEN (i.legal_name ILIKE '%Ellen  STAUDENMAYER%' OR i.legal_name ILIKE '%Ellen%STAUDENMAYER%' OR i.legal_name ILIKE '%STAUDENMAYER%Ellen%') AND s.commitment = 8970.0 THEN 0.02
        ELSE subscription_fee_percent
    END,
    subscription_fee_amount = CASE
        WHEN (i.legal_name ILIKE '%Charles DE BAVIER%' OR i.legal_name ILIKE '%Charles%BAVIER%' OR i.legal_name ILIKE '%BAVIER%Charles%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name ILIKE '%CARTA INVESTMENTS LLC%' OR i.legal_name ILIKE '%CARTA%LLC%' OR i.legal_name ILIKE '%LLC%CARTA%') AND s.commitment = 100000.0 THEN 2000.0
        WHEN (i.legal_name ILIKE '%Sahejman KAHLON%' OR i.legal_name ILIKE '%Sahejman%KAHLON%' OR i.legal_name ILIKE '%KAHLON%Sahejman%') AND s.commitment = 50000.0 THEN 1000.0
        WHEN (i.legal_name ILIKE '%777 WALNUT LLC%' OR i.legal_name ILIKE '%777%LLC%' OR i.legal_name ILIKE '%LLC%777%') AND s.commitment = 50000.0 THEN 1000.0
        WHEN (i.legal_name ILIKE '%Marco JERRENTRUP%' OR i.legal_name ILIKE '%Marco%JERRENTRUP%' OR i.legal_name ILIKE '%JERRENTRUP%Marco%') AND s.commitment = 49000.0 THEN 980.0
        WHEN (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%' OR i.legal_name ILIKE '%ZANDERA%Ltd%' OR i.legal_name ILIKE '%Ltd%ZANDERA%') AND s.commitment = 1000000.0 THEN 50000.0
        WHEN (i.legal_name ILIKE '%Jeremy LOWY%' OR i.legal_name ILIKE '%Jeremy%LOWY%' OR i.legal_name ILIKE '%LOWY%Jeremy%') AND s.commitment = 50000.0 THEN 1000.0
        WHEN (i.legal_name ILIKE '%Tobias JOERN%' OR i.legal_name ILIKE '%Tobias%JOERN%' OR i.legal_name ILIKE '%JOERN%Tobias%') AND s.commitment = 8970.0 THEN 179.4
        WHEN (i.legal_name ILIKE '%René ROSSDEUTSCHER%' OR i.legal_name ILIKE '%René%ROSSDEUTSCHER%' OR i.legal_name ILIKE '%ROSSDEUTSCHER%René%') AND s.commitment = 19435.0 THEN 388.7
        WHEN (i.legal_name ILIKE '%Ellen  STAUDENMAYER%' OR i.legal_name ILIKE '%Ellen%STAUDENMAYER%' OR i.legal_name ILIKE '%STAUDENMAYER%Ellen%') AND s.commitment = 8970.0 THEN 179.4
        ELSE subscription_fee_amount
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC133';
