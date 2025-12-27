-- VC33 Performance Fees (PERCENT ONLY)
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN (i.legal_name ILIKE '%JASSQ HOLDING LIMITED%' OR i.legal_name ILIKE '%JASSQ%LIMITED%' OR i.legal_name ILIKE '%LIMITED%JASSQ%') AND s.commitment = 279000.0 THEN 0.1
        WHEN (i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%' OR i.legal_name ILIKE '%ZANDERA%Ltd%' OR i.legal_name ILIKE '%Ltd%ZANDERA%') AND s.commitment = 1000000.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Tobias JOERN%' OR i.legal_name ILIKE '%Tobias%JOERN%' OR i.legal_name ILIKE '%JOERN%Tobias%') AND s.commitment = 8970.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%René ROSSDEUTSCHER%' OR i.legal_name ILIKE '%René%ROSSDEUTSCHER%' OR i.legal_name ILIKE '%ROSSDEUTSCHER%René%') AND s.commitment = 19435.0 THEN 0.2
        WHEN (i.legal_name ILIKE '%Ellen  STAUDENMAYER%' OR i.legal_name ILIKE '%Ellen%STAUDENMAYER%' OR i.legal_name ILIKE '%STAUDENMAYER%Ellen%') AND s.commitment = 8970.0 THEN 0.2
        ELSE performance_fee_tier1_percent
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC133';
