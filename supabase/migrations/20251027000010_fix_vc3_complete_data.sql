-- Fix VC3 (VC103) - Add ALL missing fields
-- This migration adds: price/cost per share, num shares, spread fees, performance fees
-- Previous migration only had opportunity names and dates

-- Update ALL VC103 rows with basic share data (cost, price, num_shares)
-- Using a temp table approach for complex multi-row updates

CREATE TEMP TABLE vc3_updates AS
SELECT
    s.id as subscription_id,
    CASE
        -- Row-by-row mapping based on investor + amount
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' AND s.commitment = 120000 THEN 0.043
        WHEN i.legal_name = 'Denis MATTHEY' AND s.commitment = 100000 THEN 0.043
        WHEN i.legal_name = 'MONTEREY HOLDING Co Inc' AND s.commitment = 100000 THEN 0.043
        WHEN i.legal_name = 'Ryan KUANG' AND s.commitment = 100000 THEN 0.043
        WHEN i.legal_name = 'Gershon KOH' AND s.commitment = 50000 THEN 0.043
        WHEN i.legal_name = 'ATTAR Mohammed' AND s.commitment = 40000 THEN 0.043
        WHEN i.legal_name = 'Serge AURIER' AND s.commitment = 50000 THEN 0.043
        WHEN i.legal_name = 'AL SABAH Sheikh' AND s.commitment = 50000 THEN 0.043
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment = 33217.50 THEN 0.043
        WHEN i.legal_name = 'Daniel BAUMSLAG' AND s.commitment = 50000 THEN 0.043
        WHEN i.legal_name = 'AS ADVISORY DWC LLC' AND s.commitment = 50000 THEN 0.043
        WHEN i.legal_name = 'OEP Ltd' AND s.commitment = 50000 THEN 0.043
        WHEN i.legal_name = 'YONGJIE Daryl' AND s.commitment = 30000 THEN 0.043
        WHEN i.legal_name = 'NGAN Chang' AND s.commitment = 25080 THEN 0.043
        WHEN i.legal_name = 'VEGINVEST' AND s.commitment = 500000 THEN 0.043
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment IN (75000, 106400, 27000, 50000, 24989.90, 150000, 50000.02) THEN 0.043
        WHEN i.legal_name = 'AL SABAH Sheikh' AND s.commitment = 10000 THEN 0.043
        ELSE 0.043
    END as cost_per_share,
    CASE
        -- Price per share (sometimes same as cost, sometimes has spread)
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' AND s.commitment = 120000 THEN 0.044
        WHEN i.legal_name = 'Denis MATTHEY' AND s.commitment = 100000 THEN 0.044
        WHEN i.legal_name = 'Gershon KOH' AND s.commitment = 50000 THEN 0.044
        WHEN i.legal_name = 'ATTAR Mohammed' AND s.commitment = 40000 THEN 0.044
        WHEN i.legal_name = 'YONGJIE Daryl' AND s.commitment = 30000 THEN 0.044
        WHEN i.legal_name = 'NGAN Chang' AND s.commitment = 25080 THEN 0.044
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment IN (75000, 106400, 27000) THEN 0.03959
        ELSE 0.043  -- Most have no spread
    END as price_per_share,
    -- Calculate num_shares as commitment / cost_per_share
    ROUND(s.commitment / 0.043) as num_shares
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
JOIN public.investors i ON i.id = s.investor_id
WHERE v.entity_code = 'VC103';

-- Apply the updates
UPDATE public.subscriptions s
SET
    cost_per_share = u.cost_per_share,
    price_per_share = u.price_per_share,
    num_shares = u.num_shares,
    spread_per_share = u.price_per_share - u.cost_per_share,
    spread_fee_amount = (u.price_per_share - u.cost_per_share) * u.num_shares
FROM vc3_updates u
WHERE s.id = u.subscription_id;

-- Now update performance fees for rows that have them
UPDATE public.subscriptions s
SET
    performance_fee_tier1_percent = CASE
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' THEN 0.20
        WHEN i.legal_name = 'Denis MATTHEY' THEN 0.10
        WHEN i.legal_name = 'Gershon KOH' THEN 0.10
        WHEN i.legal_name = 'ATTAR Mohammed' THEN 0.20
        WHEN i.legal_name = 'Serge AURIER' THEN 0.20
        WHEN i.legal_name = 'AL SABAH Sheikh' AND s.commitment = 50000 THEN 0.20
        WHEN i.legal_name = 'Daniel BAUMSLAG' THEN 0.20
        WHEN i.legal_name = 'AS ADVISORY DWC LLC' THEN 0.20
        WHEN i.legal_name = 'OEP Ltd' THEN 0.20
        WHEN i.legal_name = 'YONGJIE Daryl' THEN 0.20
        WHEN i.legal_name = 'NGAN Chang' THEN 0.20
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment IN (24989.90, 150000, 50000, 33217.50) THEN 1.0
        ELSE NULL
    END,
    performance_fee_tier1_threshold = CASE
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' THEN 0
        WHEN i.legal_name = 'Denis MATTHEY' THEN 0
        WHEN i.legal_name = 'Gershon KOH' THEN 0
        WHEN i.legal_name = 'ATTAR Mohammed' THEN 0
        WHEN i.legal_name = 'Serge AURIER' THEN 0
        WHEN i.legal_name = 'AL SABAH Sheikh' AND s.commitment = 50000 THEN 0
        WHEN i.legal_name = 'Daniel BAUMSLAG' THEN 0
        WHEN i.legal_name = 'AS ADVISORY DWC LLC' THEN 0
        WHEN i.legal_name = 'OEP Ltd' THEN 0
        WHEN i.legal_name = 'YONGJIE Daryl' THEN 0
        WHEN i.legal_name = 'NGAN Chang' THEN 0
        WHEN i.legal_name LIKE '%Julien%Machot%' AND s.commitment IN (24989.90, 150000, 50000, 33217.50) THEN 0
        ELSE NULL
    END,
    performance_fee_tier2_percent = CASE
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' THEN 0.30
        WHEN i.legal_name = 'Denis MATTHEY' THEN 0.15
        ELSE NULL
    END,
    performance_fee_tier2_threshold = CASE
        WHEN i.legal_name LIKE '%MOHAMMAD%Majid%' THEN 10
        WHEN i.legal_name = 'Denis MATTHEY' THEN 10
        ELSE NULL
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC103';

-- Drop temp table
DROP TABLE vc3_updates;

-- Verify
SELECT
    COUNT(*) as total_rows,
    COUNT(CASE WHEN cost_per_share IS NOT NULL THEN 1 END) as has_cost,
    COUNT(CASE WHEN price_per_share IS NOT NULL THEN 1 END) as has_price,
    COUNT(CASE WHEN num_shares IS NOT NULL THEN 1 END) as has_shares,
    COUNT(CASE WHEN spread_fee_amount > 0 THEN 1 END) as has_spread_fees,
    COUNT(CASE WHEN performance_fee_tier1_percent IS NOT NULL THEN 1 END) as has_perf_fees
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC103';
