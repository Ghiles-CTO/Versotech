-- Populate VC3 sheet data (VC103, VC104, VC105, VC106, VC107)
-- VC3 sheet has 34 non-zero rows: 30 for VC3, 1 each for VC4/VC5/VC6/VC7

-- Update VC103 subscriptions (30 rows)
-- Note: Some investors have multiple subscriptions, using subscription_number to differentiate
UPDATE public.subscriptions s
SET
    contract_date = CASE
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' AND s.commitment = 120000.00 THEN '2020-11-10'
        WHEN i.legal_name = 'Denis MATTHEY' AND s.commitment = 100000.00 THEN '2020-11-17'
        WHEN i.legal_name = 'MONTEREY HOLDING Co Inc' AND s.commitment = 100000.00 AND s.subscription_number = (
            SELECT MIN(subscription_number) FROM public.subscriptions
            WHERE vehicle_id = s.vehicle_id AND investor_id = s.investor_id AND commitment = 100000.00
        ) THEN '2021-01-09'
        WHEN i.legal_name = 'Ryan KUANG' AND s.commitment = 100000.00 AND s.subscription_number = (
            SELECT MIN(subscription_number) FROM public.subscriptions
            WHERE vehicle_id = s.vehicle_id AND investor_id = s.investor_id AND commitment = 100000.00
        ) THEN '2021-01-09'
        WHEN i.legal_name = 'Gershon KOH' AND s.commitment = 50000.00 THEN '2020-11-15'
        WHEN i.legal_name = 'ATTAR Mohammed' AND s.commitment = 40000.00 THEN '2020-11-18'
        WHEN i.legal_name = 'Serge AURIER' AND s.commitment = 50000.00 AND s.subscription_number = (
            SELECT MIN(subscription_number) FROM public.subscriptions
            WHERE vehicle_id = s.vehicle_id AND investor_id = s.investor_id AND commitment = 50000.00
        ) THEN '2020-12-08'
        WHEN i.legal_name = 'AL SABAH Sheikh' AND s.commitment = 50000.00 THEN '2021-01-06'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 33217.50 THEN '2021-12-31'
        WHEN i.legal_name = 'Daniel BAUMSLAG' AND s.commitment = 50000.00 THEN '2021-01-09'
        WHEN i.legal_name = 'AS ADVISORY DWC LLC' AND s.commitment = 50000.00 THEN '2020-12-27'
        WHEN i.legal_name = 'OEP Ltd' AND s.commitment = 50000.00 THEN '2021-04-30'
        WHEN i.legal_name = 'YONGJIE Daryl' AND s.commitment = 30000.00 THEN '2021-02-02'
        WHEN i.legal_name = 'NGAN Chang' AND s.commitment = 25080.00 THEN '2021-02-23'
        WHEN i.legal_name = 'VEGINVEST' AND s.commitment = 500000.00 THEN '2021-01-09'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 75000.00 THEN '2020-08-06'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 106400.00 THEN '2021-01-09'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 27000.00 THEN '2021-04-14'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 50000.00 THEN '2021-11-11'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 24989.90 THEN '2019-05-13'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.subscription_number = (
            SELECT MIN(subscription_number) FROM public.subscriptions
            WHERE vehicle_id = s.vehicle_id AND investor_id = s.investor_id AND commitment = 150000.00
        ) THEN '2021-11-02'
        WHEN i.legal_name = 'Serge AURIER' AND s.commitment = 50000.00 AND s.subscription_number = (
            SELECT MAX(subscription_number) FROM public.subscriptions
            WHERE vehicle_id = s.vehicle_id AND investor_id = s.investor_id AND commitment = 50000.00
            AND subscription_number > (SELECT MIN(subscription_number) FROM public.subscriptions
                WHERE vehicle_id = s.vehicle_id AND investor_id = s.investor_id AND commitment = 50000.00)
        ) THEN '2022-07-03'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 150000.00 AND s.subscription_number = (
            SELECT MAX(subscription_number) FROM public.subscriptions
            WHERE vehicle_id = s.vehicle_id AND investor_id = s.investor_id AND commitment = 150000.00
        ) THEN '2022-06-14'
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 50000.02 THEN '2022-09-12'
        WHEN i.legal_name = 'Serge AURIER' AND s.commitment = 75000.00 THEN '2024-01-16'
        WHEN i.legal_name = 'AL SABAH Sheikh' AND s.commitment = 10000.00 THEN '2023-06-27'
        ELSE s.contract_date
    END,
    subscription_fee_amount = CASE
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' AND s.commitment = 120000.00 THEN 2400.00
        ELSE COALESCE(s.subscription_fee_amount, 0)
    END,
    subscription_fee_percent = CASE
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' AND s.commitment = 120000.00 THEN 0.02
        ELSE s.subscription_fee_percent
    END,
    opportunity_name = 'NITRO'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC103';

-- Update VC104 cross-vehicle subscription (1 row from VC3 sheet)
UPDATE public.subscriptions s
SET
    contract_date = '2020-06-15',
    opportunity_name = 'NITRO'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC104'
  AND i.legal_name LIKE '%Julien%Machot%'
  AND s.commitment = 10000.00;

-- Update VC105 cross-vehicle subscription (1 row from VC3 sheet)
UPDATE public.subscriptions s
SET
    contract_date = '2020-09-21',
    opportunity_name = 'NITRO'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC105'
  AND i.legal_name LIKE '%Julien%Machot%'
  AND s.commitment = 30000.00;

-- Update VC106 cross-vehicle subscription (1 row from VC3 sheet)
UPDATE public.subscriptions s
SET
    contract_date = '2020-09-30',
    opportunity_name = 'NITRO'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC106'
  AND i.legal_name LIKE '%Julien%Machot%'
  AND s.commitment = 60000.00;

-- Update VC107 cross-vehicle subscription (1 row from VC3 sheet)
UPDATE public.subscriptions s
SET
    contract_date = '2021-04-14',
    opportunity_name = 'NITRO'
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC107'
  AND i.legal_name LIKE '%Julien%Machot%'
  AND s.commitment = 75000.05;

-- Verify the updates
SELECT
    v.entity_code as vehicle,
    COUNT(*) as updated_count,
    SUM(s.subscription_fee_amount) as total_fees,
    COUNT(CASE WHEN s.contract_date IS NOT NULL THEN 1 END) as with_dates
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code IN ('VC103', 'VC104', 'VC105', 'VC106', 'VC107')
  AND s.opportunity_name = 'NITRO'
GROUP BY v.entity_code
ORDER BY v.entity_code;
