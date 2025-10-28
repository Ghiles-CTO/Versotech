-- Fix VC1 (VC101) - Add ALL missing fields for bonds
-- VC1 is bonds, not shares, so populate subscription fees instead

-- Update all 9 VC101 bond subscriptions with subscription fees
UPDATE public.subscriptions s
SET
    subscription_fee_percent = CASE
        WHEN s.commitment = 75065.63 THEN 0.03
        WHEN s.commitment = 310271.25 THEN 0.03
        WHEN s.commitment = 150131.25 THEN 0.03
        WHEN s.commitment = 645564.38 THEN 0.03
        WHEN s.commitment = 200175.00 THEN 0.03
        WHEN s.commitment = 90078.75 THEN 0.03
        WHEN s.commitment = 105500.00 THEN 0.01
        WHEN s.commitment = 64082.05 THEN 0.00
        WHEN s.commitment = 202926.51 THEN 0.00
        ELSE 0
    END,
    subscription_fee_amount = CASE
        WHEN s.commitment = 75065.63 THEN 2250.0
        WHEN s.commitment = 310271.25 THEN 9300.0
        WHEN s.commitment = 150131.25 THEN 4500.0
        WHEN s.commitment = 645564.38 THEN 19350.0
        WHEN s.commitment = 200175.00 THEN 6000.0
        WHEN s.commitment = 90078.75 THEN 2700.0
        WHEN s.commitment = 105500.00 THEN 1000.0
        WHEN s.commitment = 64082.05 THEN 0
        WHEN s.commitment = 202926.51 THEN 0
        ELSE 0
    END
FROM public.vehicles v
WHERE s.vehicle_id = v.id
  AND v.entity_code = 'VC101';

-- Verify
SELECT
    COUNT(*) as total_rows,
    COUNT(CASE WHEN subscription_fee_percent > 0 THEN 1 END) as has_sub_fee_pct,
    COUNT(CASE WHEN subscription_fee_amount > 0 THEN 1 END) as has_sub_fee_amt,
    SUM(subscription_fee_amount) as total_sub_fees
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC101';
