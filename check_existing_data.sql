-- Run these queries in Supabase SQL Editor to check existing data

-- 1. Check if staging tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_workbook_runs', 'stg_subscription_summary', 'stg_subscription_lines', 'stg_subscription_tranches', 'subscription_import_results');

-- 2. List all existing vehicles
SELECT id, name, domicile, currency, type, notes
FROM public.vehicles
ORDER BY name;

-- 3. Count existing investors
SELECT COUNT(*) as total_investors, 
       COUNT(CASE WHEN type = 'individual' THEN 1 END) as individuals,
       COUNT(CASE WHEN type = 'entity' THEN 1 END) as entities
FROM public.investors;

-- 4. Check existing subscriptions
SELECT v.name as vehicle_name, 
       COUNT(s.id) as subscription_count,
       SUM(s.commitment) as total_commitment,
       s.currency
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
GROUP BY v.name, s.currency
ORDER BY v.name;

-- 5. Check which vehicles have deals
SELECT v.name as vehicle_name, 
       d.name as deal_name,
       d.id as deal_id,
       d.status as deal_status
FROM public.vehicles v
LEFT JOIN public.deals d ON d.vehicle_id = v.id
ORDER BY v.name;
