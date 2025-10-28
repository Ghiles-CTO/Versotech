-- Populate VC1 (VC101) with fees and dates from Excel
-- VC1 sheet has 10 rows: 9 for VC1, 1 for VC2

-- Update VC101 subscriptions (9 rows)
UPDATE public.subscriptions s
SET
    contract_date = CASE
        WHEN i.legal_name = 'Vontobel' AND s.commitment = 75065.63 THEN '2020-06-18'
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 310271.25 THEN '2020-06-18'
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 150131.25 THEN '2020-06-18'
        WHEN i.legal_name = 'Lombard Odier' AND s.commitment = 645564.38 THEN '2020-06-18'
        WHEN i.legal_name = 'Julius Bär' AND s.commitment = 200175.00 THEN '2020-06-18'
        WHEN i.legal_name = 'Lombard Odier' AND s.commitment = 90078.75 THEN '2020-06-19'
        WHEN i.legal_name = 'Julien Machot' AND s.commitment = 105500.00 THEN '2020-07-05'
        WHEN i.legal_name = 'Julius Bär' AND s.commitment = 64082.05 THEN '2021-09-24'
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 202926.51 THEN '2021-09-24'
        ELSE s.contract_date
    END,
    subscription_fee_amount = CASE
        WHEN i.legal_name = 'Vontobel' AND s.commitment = 75065.63 THEN 2250.00
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 310271.25 THEN 9300.00
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 150131.25 THEN 4500.00
        WHEN i.legal_name = 'Lombard Odier' AND s.commitment = 645564.38 THEN 19350.00
        WHEN i.legal_name = 'Julius Bär' AND s.commitment = 200175.00 THEN 6000.00
        WHEN i.legal_name = 'Lombard Odier' AND s.commitment = 90078.75 THEN 2700.00
        WHEN i.legal_name = 'Julien Machot' AND s.commitment = 105500.00 THEN 1000.00
        WHEN i.legal_name = 'Julius Bär' AND s.commitment = 64082.05 THEN 0.00
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 202926.51 THEN 0.00
        ELSE s.subscription_fee_amount
    END,
    subscription_fee_percent = CASE
        WHEN i.legal_name = 'Vontobel' AND s.commitment = 75065.63 THEN 0.03
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 310271.25 THEN 0.03
        WHEN i.legal_name = 'Bondpartners' AND s.commitment = 150131.25 THEN 0.03
        WHEN i.legal_name = 'Lombard Odier' AND s.commitment = 645564.38 THEN 0.03
        WHEN i.legal_name = 'Julius Bär' AND s.commitment = 200175.00 THEN 0.03
        WHEN i.legal_name = 'Lombard Odier' AND s.commitment = 90078.75 THEN 0.03
        WHEN i.legal_name = 'Julien Machot' AND s.commitment = 105500.00 THEN 0.01
        ELSE s.subscription_fee_percent
    END,
    opportunity_name = 'Bond Purchase - ISIN CH0506350781'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC101';

-- Update VC102 subscription (1 row from VC1 sheet - cross-vehicle)
UPDATE public.subscriptions s
SET
    contract_date = '2021-09-24',
    subscription_fee_amount = 0.00,
    subscription_fee_percent = 0.00,
    opportunity_name = 'Bond Purchase - Cross from VC1'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC102'
  AND i.legal_name = 'Julien Machot'
  AND s.commitment = 250000.00;

-- Verify the updates
SELECT
    'VC101' as vehicle,
    COUNT(*) as updated_count,
    SUM(s.subscription_fee_amount) as total_fees,
    MIN(s.contract_date) as earliest_date,
    MAX(s.contract_date) as latest_date
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC101'
  AND s.contract_date IS NOT NULL
UNION ALL
SELECT
    'VC102' as vehicle,
    COUNT(*) as updated_count,
    SUM(s.subscription_fee_amount) as total_fees,
    MIN(s.contract_date) as earliest_date,
    MAX(s.contract_date) as latest_date
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC102'
  AND s.contract_date IS NOT NULL
  AND s.investor_id IN (SELECT id FROM public.investors WHERE legal_name = 'Julien Machot')
  AND s.commitment = 250000.00;

COMMENT ON COLUMN public.subscriptions.subscription_fee_amount IS 'Updated from VC1 Excel sheet - includes bond transaction fees';
