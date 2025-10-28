-- Populate VC2 (VC102) with dates and fees from Excel
-- VC2 sheet has 7 rows for VC2 (+ 1 cross-vehicle from VC1 already populated)

UPDATE public.subscriptions s
SET
    contract_date = CASE
        WHEN i.legal_name = 'Julien Machot' AND s.commitment = 3.00 THEN '2019-09-20'
        WHEN i.legal_name = 'Julien Machot' AND s.commitment = 150000.00 AND s.subscription_number = 100055 THEN '2019-07-12'
        WHEN i.legal_name = 'Julien Machot' AND s.commitment = 150000.00 AND s.subscription_number = 100106 THEN '2020-02-28'
        WHEN i.legal_name = 'Julien Machot' AND s.commitment = 150000.00 AND s.subscription_number = 100109 THEN '2020-09-28'
        WHEN i.legal_name = 'LF GROUP SARL' AND s.commitment = 50000.00 THEN '2024-04-15'
        WHEN i.legal_name = 'Pierre PAUMIER' AND s.commitment = 25000.00 THEN '2024-04-15'
        WHEN i.legal_name = 'KRISTINA & CHENG-LIN SUTKAITYTE & HSU' AND s.commitment = 50000.00 THEN '2024-11-21'
        ELSE s.contract_date
    END,
    subscription_fee_amount = CASE
        WHEN i.legal_name = 'LF GROUP SARL' AND s.commitment = 50000.00 THEN 1000.00
        ELSE COALESCE(s.subscription_fee_amount, 0)
    END,
    subscription_fee_percent = CASE
        WHEN i.legal_name = 'LF GROUP SARL' AND s.commitment = 50000.00 THEN 0.02
        ELSE s.subscription_fee_percent
    END,
    opportunity_name = 'ISDC'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC102'
  AND s.opportunity_name IS NULL; -- Don't overwrite the VC1 cross-vehicle row

-- Verify the updates
SELECT
    i.legal_name as investor,
    s.commitment,
    s.contract_date,
    s.subscription_fee_amount as fees,
    s.subscription_fee_percent as fee_pct,
    s.opportunity_name
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
JOIN public.investors i ON i.id = s.investor_id
WHERE v.entity_code = 'VC102'
ORDER BY s.contract_date NULLS LAST, s.commitment DESC;