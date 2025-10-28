-- Fix VC2 (VC102) - Add ALL missing fields
-- This migration adds: price/cost per share, num shares, subscription fees

-- Update ALL VC102 rows with share data
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 3.00 THEN 0.001
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2019-07-12' THEN 300.0
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2020-02-28' THEN 300.0
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2020-09-28' THEN 1.0
        WHEN i.legal_name = 'LF GROUP SARL' THEN 1.0
        WHEN i.legal_name = 'Pierre PAUMIER' THEN 1.0
        WHEN i.legal_name = 'KRISTINA & CHENG-LIN SUTKAITYTE & HSU' THEN 1.0
        ELSE NULL
    END,
    price_per_share = CASE
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 3.00 THEN 0.001
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2019-07-12' THEN 300.0
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2020-02-28' THEN 300.0
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2020-09-28' THEN 1.0
        WHEN i.legal_name = 'LF GROUP SARL' THEN 1.0
        WHEN i.legal_name = 'Pierre PAUMIER' THEN 1.0
        WHEN i.legal_name = 'KRISTINA & CHENG-LIN SUTKAITYTE & HSU' THEN 1.0
        ELSE NULL
    END,
    num_shares = CASE
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 3.00 THEN 3000
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2019-07-12' THEN 500
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2020-02-28' THEN 500
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.contract_date = '2020-09-28' THEN 150000
        WHEN i.legal_name = 'LF GROUP SARL' THEN 50000
        WHEN i.legal_name = 'Pierre PAUMIER' THEN 25000
        WHEN i.legal_name = 'KRISTINA & CHENG-LIN SUTKAITYTE & HSU' THEN 50000
        ELSE NULL
    END,
    subscription_fee_percent = CASE
        WHEN i.legal_name = 'LF GROUP SARL' THEN 0.02
        ELSE 0
    END,
    subscription_fee_amount = CASE
        WHEN i.legal_name = 'LF GROUP SARL' THEN 1000.0
        ELSE 0
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC102';

-- Verify
SELECT
    COUNT(*) as total_rows,
    COUNT(CASE WHEN cost_per_share IS NOT NULL THEN 1 END) as has_cost,
    COUNT(CASE WHEN price_per_share IS NOT NULL THEN 1 END) as has_price,
    COUNT(CASE WHEN num_shares IS NOT NULL THEN 1 END) as has_shares,
    COUNT(CASE WHEN subscription_fee_amount > 0 THEN 1 END) as has_sub_fees
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC102';
