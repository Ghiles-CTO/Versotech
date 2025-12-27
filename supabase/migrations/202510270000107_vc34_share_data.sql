-- VC34 Share Data: 4 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name ILIKE '%ISP CH1149139870%' OR i.legal_name ILIKE '%ISP%CH1149139870%' OR i.legal_name ILIKE '%CH1149139870%ISP%') AND s.commitment = 1900000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%PROGETTO UNO SPA%' OR i.legal_name ILIKE '%PROGETTO%SPA%' OR i.legal_name ILIKE '%SPA%PROGETTO%') AND s.commitment = 500000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Stefano CAPRA%' OR i.legal_name ILIKE '%Stefano%CAPRA%' OR i.legal_name ILIKE '%CAPRA%Stefano%') AND s.commitment = 100000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 5000.0 THEN 1.0
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name ILIKE '%ISP CH1149139870%' OR i.legal_name ILIKE '%ISP%CH1149139870%' OR i.legal_name ILIKE '%CH1149139870%ISP%') AND s.commitment = 1900000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%PROGETTO UNO SPA%' OR i.legal_name ILIKE '%PROGETTO%SPA%' OR i.legal_name ILIKE '%SPA%PROGETTO%') AND s.commitment = 500000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Stefano CAPRA%' OR i.legal_name ILIKE '%Stefano%CAPRA%' OR i.legal_name ILIKE '%CAPRA%Stefano%') AND s.commitment = 100000.0 THEN 1.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 5000.0 THEN 1.0
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name ILIKE '%ISP CH1149139870%' OR i.legal_name ILIKE '%ISP%CH1149139870%' OR i.legal_name ILIKE '%CH1149139870%ISP%') AND s.commitment = 1900000.0 THEN 1900000.0
        WHEN (i.legal_name ILIKE '%PROGETTO UNO SPA%' OR i.legal_name ILIKE '%PROGETTO%SPA%' OR i.legal_name ILIKE '%SPA%PROGETTO%') AND s.commitment = 500000.0 THEN 501101.0
        WHEN (i.legal_name ILIKE '%Stefano CAPRA%' OR i.legal_name ILIKE '%Stefano%CAPRA%' OR i.legal_name ILIKE '%CAPRA%Stefano%') AND s.commitment = 100000.0 THEN 100220.0
        WHEN (i.legal_name ILIKE '%Julien MACHOT%' OR i.legal_name ILIKE '%Julien%MACHOT%' OR i.legal_name ILIKE '%MACHOT%Julien%') AND s.commitment = 5000.0 THEN 5011.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC134';
