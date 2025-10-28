-- Fix VC104 (VC4) - Add ALL missing fields
-- This migration adds: price per share, num shares, performance fees
-- VC4 = JUST WARRANTS - no cost basis, no spread fees

-- Update share pricing and performance fees
UPDATE public.subscriptions s
SET
    price_per_share = CASE
        WHEN i.legal_name LIKE '%Gershon KOH%' AND s.commitment = 1500000.0 THEN 10.7816
        WHEN i.legal_name LIKE '%Denis MATTEY%' AND s.commitment = 750000.0 THEN 10.7816
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 250000.0 THEN 10.7816
        WHEN i.legal_name LIKE '%Daniel Aufore%' AND s.commitment = 99972.75 THEN 23.523
        WHEN i.legal_name LIKE '%NextGen%' AND s.commitment = 994670.06 THEN 23.523
        WHEN i.legal_name LIKE '%Cité Gestion%' AND s.commitment = 1044962.23 THEN 23.523
        WHEN i.legal_name LIKE '%Arboris%' AND s.commitment = 99996.27 THEN 23.523
        WHEN i.legal_name LIKE '%APM%' AND s.commitment = 599954.12 THEN 23.523
        WHEN i.legal_name LIKE '%Erwan Tarouilly%' AND s.commitment = 199945.5 THEN 23.523
        WHEN i.legal_name LIKE '%Theo Costa%' AND s.commitment = 99996.27 THEN 23.523
        WHEN i.legal_name LIKE '%Divya Bagrecha%' AND s.commitment = 250002.44 THEN 23.523
        WHEN i.legal_name LIKE '%Sebastian Reis%' AND s.commitment = 250002.44 THEN 23.523
        WHEN i.legal_name LIKE '%Ramez Mecataff%' AND s.commitment = 69980.93 THEN 23.523
        WHEN i.legal_name LIKE '%Pierre  Roy%' AND s.commitment = 99996.27 THEN 23.523
        WHEN i.legal_name LIKE '%Pierre-Henri Froidevaux%' AND s.commitment = 99996.27 THEN 23.523
        WHEN i.legal_name LIKE '%Sofiane Zaiem%' AND s.commitment = 125024.75 THEN 23.523
        WHEN i.legal_name LIKE '%Jean-Pierre Bettin%' AND s.commitment = 47046.0 THEN 23.523
        WHEN i.legal_name LIKE '%Arnaud Wattiez%' AND s.commitment = 150006.17 THEN 23.523
        WHEN i.legal_name LIKE '%Damien Krauser%' AND s.commitment = 125259.98 THEN 23.523
        WHEN i.legal_name LIKE '%SFRD0%' AND s.commitment = 99996.27 THEN 23.523
        WHEN i.legal_name LIKE '%Lombard Odier (HOF)%' AND s.commitment = 39989.1 THEN 23.523
        WHEN i.legal_name LIKE '%Banque Gonet (BAR)%' AND s.commitment = 39989.1 THEN 23.523
        WHEN i.legal_name LIKE '%Banque Gonet (FIR)%' AND s.commitment = 50009.9 THEN 23.523
        WHEN i.legal_name LIKE '%Banque Gonet (HOF)%' AND s.commitment = 49986.38 THEN 23.523
        WHEN i.legal_name LIKE '%Rainer Buchecker%' AND s.commitment = 199945.5 THEN 23.523
        WHEN i.legal_name LIKE '%Marwan Al Abedin%' AND s.commitment = 300000.0 THEN 23.523
        WHEN i.legal_name LIKE '%Jonathan Menoud%' AND s.commitment = 50009.9 THEN 23.523
        WHEN i.legal_name LIKE '%Marc  Zafrany%' AND s.commitment = 167695.47 THEN 23.523
        WHEN i.legal_name LIKE '%Philippe Houman%' AND s.commitment = 99996.27 THEN 23.523
        ELSE NULL
    END,
    num_shares = CASE
        WHEN i.legal_name LIKE '%Gershon KOH%' AND s.commitment = 1500000.0 THEN 139126.0
        WHEN i.legal_name LIKE '%Denis MATTEY%' AND s.commitment = 750000.0 THEN 69563.0
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 250000.0 THEN 23187.0
        WHEN i.legal_name LIKE '%Daniel Aufore%' AND s.commitment = 99972.75 THEN 4250.0
        WHEN i.legal_name LIKE '%NextGen%' AND s.commitment = 994670.06 THEN 42285.00021
        WHEN i.legal_name LIKE '%Cité Gestion%' AND s.commitment = 1044962.23 THEN 44423.00004
        WHEN i.legal_name LIKE '%Arboris%' AND s.commitment = 99996.27 THEN 4250.999872
        WHEN i.legal_name LIKE '%APM%' AND s.commitment = 599954.12 THEN 25505.00021
        WHEN i.legal_name LIKE '%Erwan Tarouilly%' AND s.commitment = 199945.5 THEN 8500.0
        WHEN i.legal_name LIKE '%Theo Costa%' AND s.commitment = 99996.27 THEN 4250.999872
        WHEN i.legal_name LIKE '%Divya Bagrecha%' AND s.commitment = 250002.44 THEN 10627.99983
        WHEN i.legal_name LIKE '%Sebastian Reis%' AND s.commitment = 250002.44 THEN 10627.99983
        WHEN i.legal_name LIKE '%Ramez Mecataff%' AND s.commitment = 69980.93 THEN 2975.000213
        WHEN i.legal_name LIKE '%Pierre  Roy%' AND s.commitment = 99996.27 THEN 4250.999872
        WHEN i.legal_name LIKE '%Pierre-Henri Froidevaux%' AND s.commitment = 99996.27 THEN 4250.999872
        WHEN i.legal_name LIKE '%Sofiane Zaiem%' AND s.commitment = 125024.75 THEN 5315.000213
        WHEN i.legal_name LIKE '%Jean-Pierre Bettin%' AND s.commitment = 47046.0 THEN 2000.0
        WHEN i.legal_name LIKE '%Arnaud Wattiez%' AND s.commitment = 150006.17 THEN 6376.999957
        WHEN i.legal_name LIKE '%Damien Krauser%' AND s.commitment = 125259.98 THEN 5325.000213
        WHEN i.legal_name LIKE '%SFRD0%' AND s.commitment = 99996.27 THEN 4250.999872
        WHEN i.legal_name LIKE '%Lombard Odier (HOF)%' AND s.commitment = 39989.1 THEN 1700.0
        WHEN i.legal_name LIKE '%Banque Gonet (BAR)%' AND s.commitment = 39989.1 THEN 1700.0
        WHEN i.legal_name LIKE '%Banque Gonet (FIR)%' AND s.commitment = 50009.9 THEN 2126.000085
        WHEN i.legal_name LIKE '%Banque Gonet (HOF)%' AND s.commitment = 49986.38 THEN 2125.000213
        WHEN i.legal_name LIKE '%Rainer Buchecker%' AND s.commitment = 199945.5 THEN 8500.0
        WHEN i.legal_name LIKE '%Marwan Al Abedin%' AND s.commitment = 300000.0 THEN 12753.47532
        WHEN i.legal_name LIKE '%Jonathan Menoud%' AND s.commitment = 50009.9 THEN 2126.000085
        WHEN i.legal_name LIKE '%Marc  Zafrany%' AND s.commitment = 167695.47 THEN 7129.000128
        WHEN i.legal_name LIKE '%Philippe Houman%' AND s.commitment = 99996.27 THEN 4250.999872
        ELSE NULL
    END,
    performance_fee_tier1_percent = CASE
        WHEN i.legal_name LIKE '%Gershon KOH%' AND s.commitment = 1500000.0 THEN 0.5
        WHEN i.legal_name LIKE '%Denis MATTEY%' AND s.commitment = 750000.0 THEN 0.25
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 250000.0 THEN 0.25
        WHEN i.legal_name LIKE '%Daniel Aufore%' AND s.commitment = 99972.75 THEN 0.2
        WHEN i.legal_name LIKE '%NextGen%' AND s.commitment = 994670.06 THEN 0.2
        WHEN i.legal_name LIKE '%Cité Gestion%' AND s.commitment = 1044962.23 THEN 0.2
        WHEN i.legal_name LIKE '%Arboris%' AND s.commitment = 99996.27 THEN 0.2
        WHEN i.legal_name LIKE '%APM%' AND s.commitment = 599954.12 THEN 0.2
        WHEN i.legal_name LIKE '%Erwan Tarouilly%' AND s.commitment = 199945.5 THEN 0.2
        WHEN i.legal_name LIKE '%Theo Costa%' AND s.commitment = 99996.27 THEN 0.2
        WHEN i.legal_name LIKE '%Divya Bagrecha%' AND s.commitment = 250002.44 THEN 0.2
        WHEN i.legal_name LIKE '%Sebastian Reis%' AND s.commitment = 250002.44 THEN 0.2
        WHEN i.legal_name LIKE '%Ramez Mecataff%' AND s.commitment = 69980.93 THEN 0.2
        WHEN i.legal_name LIKE '%Pierre  Roy%' AND s.commitment = 99996.27 THEN 0.2
        WHEN i.legal_name LIKE '%Pierre-Henri Froidevaux%' AND s.commitment = 99996.27 THEN 0.2
        WHEN i.legal_name LIKE '%Sofiane Zaiem%' AND s.commitment = 125024.75 THEN 0.2
        WHEN i.legal_name LIKE '%Jean-Pierre Bettin%' AND s.commitment = 47046.0 THEN 0.2
        WHEN i.legal_name LIKE '%Arnaud Wattiez%' AND s.commitment = 150006.17 THEN 0.2
        WHEN i.legal_name LIKE '%Damien Krauser%' AND s.commitment = 125259.98 THEN 0.2
        WHEN i.legal_name LIKE '%SFRD0%' AND s.commitment = 99996.27 THEN 0.2
        WHEN i.legal_name LIKE '%Lombard Odier (HOF)%' AND s.commitment = 39989.1 THEN 0.2
        WHEN i.legal_name LIKE '%Banque Gonet (BAR)%' AND s.commitment = 39989.1 THEN 0.2
        WHEN i.legal_name LIKE '%Banque Gonet (FIR)%' AND s.commitment = 50009.9 THEN 0.2
        WHEN i.legal_name LIKE '%Banque Gonet (HOF)%' AND s.commitment = 49986.38 THEN 0.2
        WHEN i.legal_name LIKE '%Rainer Buchecker%' AND s.commitment = 199945.5 THEN 0.2
        WHEN i.legal_name LIKE '%Marwan Al Abedin%' AND s.commitment = 300000.0 THEN 0.2
        WHEN i.legal_name LIKE '%Jonathan Menoud%' AND s.commitment = 50009.9 THEN 0.2
        WHEN i.legal_name LIKE '%Marc  Zafrany%' AND s.commitment = 167695.47 THEN 0.2
        WHEN i.legal_name LIKE '%Philippe Houman%' AND s.commitment = 99996.27 THEN 0.2
        ELSE NULL
    END,
    performance_fee_tier1_threshold = CASE
        WHEN i.legal_name LIKE '%Gershon KOH%' AND s.commitment = 1500000.0 THEN 0
        WHEN i.legal_name LIKE '%Denis MATTEY%' AND s.commitment = 750000.0 THEN 0
        WHEN i.legal_name LIKE '%Julien MACHOT%' AND s.commitment = 250000.0 THEN 0
        WHEN i.legal_name LIKE '%Daniel Aufore%' AND s.commitment = 99972.75 THEN 0
        WHEN i.legal_name LIKE '%NextGen%' AND s.commitment = 994670.06 THEN 0
        WHEN i.legal_name LIKE '%Cité Gestion%' AND s.commitment = 1044962.23 THEN 0
        WHEN i.legal_name LIKE '%Arboris%' AND s.commitment = 99996.27 THEN 0
        WHEN i.legal_name LIKE '%APM%' AND s.commitment = 599954.12 THEN 0
        WHEN i.legal_name LIKE '%Erwan Tarouilly%' AND s.commitment = 199945.5 THEN 0
        WHEN i.legal_name LIKE '%Theo Costa%' AND s.commitment = 99996.27 THEN 0
        WHEN i.legal_name LIKE '%Divya Bagrecha%' AND s.commitment = 250002.44 THEN 0
        WHEN i.legal_name LIKE '%Sebastian Reis%' AND s.commitment = 250002.44 THEN 0
        WHEN i.legal_name LIKE '%Ramez Mecataff%' AND s.commitment = 69980.93 THEN 0
        WHEN i.legal_name LIKE '%Pierre  Roy%' AND s.commitment = 99996.27 THEN 0
        WHEN i.legal_name LIKE '%Pierre-Henri Froidevaux%' AND s.commitment = 99996.27 THEN 0
        WHEN i.legal_name LIKE '%Sofiane Zaiem%' AND s.commitment = 125024.75 THEN 0
        WHEN i.legal_name LIKE '%Jean-Pierre Bettin%' AND s.commitment = 47046.0 THEN 0
        WHEN i.legal_name LIKE '%Arnaud Wattiez%' AND s.commitment = 150006.17 THEN 0
        WHEN i.legal_name LIKE '%Damien Krauser%' AND s.commitment = 125259.98 THEN 0
        WHEN i.legal_name LIKE '%SFRD0%' AND s.commitment = 99996.27 THEN 0
        WHEN i.legal_name LIKE '%Lombard Odier (HOF)%' AND s.commitment = 39989.1 THEN 0
        WHEN i.legal_name LIKE '%Banque Gonet (BAR)%' AND s.commitment = 39989.1 THEN 0
        WHEN i.legal_name LIKE '%Banque Gonet (FIR)%' AND s.commitment = 50009.9 THEN 0
        WHEN i.legal_name LIKE '%Banque Gonet (HOF)%' AND s.commitment = 49986.38 THEN 0
        WHEN i.legal_name LIKE '%Rainer Buchecker%' AND s.commitment = 199945.5 THEN 0
        WHEN i.legal_name LIKE '%Marwan Al Abedin%' AND s.commitment = 300000.0 THEN 0
        WHEN i.legal_name LIKE '%Jonathan Menoud%' AND s.commitment = 50009.9 THEN 0
        WHEN i.legal_name LIKE '%Marc  Zafrany%' AND s.commitment = 167695.47 THEN 0
        WHEN i.legal_name LIKE '%Philippe Houman%' AND s.commitment = 99996.27 THEN 0
        ELSE NULL
    END
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC104';

-- Verify
SELECT
    COUNT(*) as total_rows,
    COUNT(CASE WHEN price_per_share IS NOT NULL THEN 1 END) as has_price,
    COUNT(CASE WHEN num_shares IS NOT NULL THEN 1 END) as has_shares,
    COUNT(CASE WHEN performance_fee_tier1_percent IS NOT NULL THEN 1 END) as has_perf_tier1
FROM public.subscriptions s
JOIN public.vehicles v ON v.id = s.vehicle_id
WHERE v.entity_code = 'VC104';
