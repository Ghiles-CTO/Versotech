-- VC12 Share Data: ALL 24 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 0.3972
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Gershon KOH%' OR i.legal_name LIKE '%Gershon%KOH%' OR i.legal_name LIKE '%KOH%Gershon%') AND s.commitment = 100000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 75000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%' OR i.legal_name LIKE '%IQEQ%Trust%' OR i.legal_name LIKE '%Trust%IQEQ%') AND s.commitment = 25000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 130000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%Robert DETTMEIJER%' OR i.legal_name LIKE '%Robert%DETTMEIJER%' OR i.legal_name LIKE '%DETTMEIJER%Robert%') AND s.commitment = 20000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%' OR i.legal_name LIKE '%IQEQ%Trust%' OR i.legal_name LIKE '%Trust%IQEQ%') AND s.commitment = 125000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%REVERY Capital Limited%' OR i.legal_name LIKE '%REVERY%Limited%' OR i.legal_name LIKE '%Limited%REVERY%') AND s.commitment = 50000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Beatrice and Marcel KNOPF%' OR i.legal_name LIKE '%Beatrice%KNOPF%' OR i.legal_name LIKE '%KNOPF%Beatrice%') AND s.commitment = 100000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Tom ROAD%' OR i.legal_name LIKE '%Tom%ROAD%' OR i.legal_name LIKE '%ROAD%Tom%') AND s.commitment = 15000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Sheikh Yousef AL SABAH%' OR i.legal_name LIKE '%Sheikh%SABAH%' OR i.legal_name LIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Giovanni ALBERTINI%' OR i.legal_name LIKE '%Giovanni%ALBERTINI%' OR i.legal_name LIKE '%ALBERTINI%Giovanni%') AND s.commitment = 50000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 535000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%VERSO X%' OR i.legal_name LIKE '%VERSO%X%' OR i.legal_name LIKE '%X%VERSO%') AND s.commitment = 371109.0 THEN 0.3972
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 24.5 THEN 0.3972
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 50.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 6.0 THEN 1.5271
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 0.3972
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Gershon KOH%' OR i.legal_name LIKE '%Gershon%KOH%' OR i.legal_name LIKE '%KOH%Gershon%') AND s.commitment = 100000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 75000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 4.45 THEN 0.00010012600126
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%' OR i.legal_name LIKE '%IQEQ%Trust%' OR i.legal_name LIKE '%Trust%IQEQ%') AND s.commitment = 25000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 130000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%Robert DETTMEIJER%' OR i.legal_name LIKE '%Robert%DETTMEIJER%' OR i.legal_name LIKE '%DETTMEIJER%Robert%') AND s.commitment = 20000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%' OR i.legal_name LIKE '%IQEQ%Trust%' OR i.legal_name LIKE '%Trust%IQEQ%') AND s.commitment = 125000.0 THEN 1.0
        WHEN (i.legal_name LIKE '%REVERY Capital Limited%' OR i.legal_name LIKE '%REVERY%Limited%' OR i.legal_name LIKE '%Limited%REVERY%') AND s.commitment = 50000.0 THEN 1.5271
        WHEN (i.legal_name LIKE '%Beatrice and Marcel KNOPF%' OR i.legal_name LIKE '%Beatrice%KNOPF%' OR i.legal_name LIKE '%KNOPF%Beatrice%') AND s.commitment = 100000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Tom ROAD%' OR i.legal_name LIKE '%Tom%ROAD%' OR i.legal_name LIKE '%ROAD%Tom%') AND s.commitment = 15000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Sheikh Yousef AL SABAH%' OR i.legal_name LIKE '%Sheikh%SABAH%' OR i.legal_name LIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Giovanni ALBERTINI%' OR i.legal_name LIKE '%Giovanni%ALBERTINI%' OR i.legal_name LIKE '%ALBERTINI%Giovanni%') AND s.commitment = 50000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 535000.0 THEN 12.2154
        WHEN (i.legal_name LIKE '%VERSO X%' OR i.legal_name LIKE '%VERSO%X%' OR i.legal_name LIKE '%X%VERSO%') AND s.commitment = 371109.0 THEN 1.57126
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 24.5 THEN 0.3972
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 50.0 THEN 0.4965
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 6.0 THEN 1.5271
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 629405.0
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 100704.0
        WHEN (i.legal_name LIKE '%Gershon KOH%' OR i.legal_name LIKE '%Gershon%KOH%' OR i.legal_name LIKE '%KOH%Gershon%') AND s.commitment = 100000.0 THEN 201409.0
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 50352.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 75000.0 THEN 151057.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 250000.0 THEN 503524.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 4.45 THEN 44444.0
        WHEN (i.legal_name LIKE '%Dan BAUMSLAG%' OR i.legal_name LIKE '%Dan%BAUMSLAG%' OR i.legal_name LIKE '%BAUMSLAG%Dan%') AND s.commitment = 25000.0 THEN 16370.0
        WHEN (i.legal_name LIKE '%OEP Ltd%' OR i.legal_name LIKE '%OEP%Ltd%' OR i.legal_name LIKE '%Ltd%OEP%') AND s.commitment = 50000.0 THEN 32741.0
        WHEN (i.legal_name LIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%' OR i.legal_name LIKE '%IQEQ%Trust%' OR i.legal_name LIKE '%Trust%IQEQ%') AND s.commitment = 25000.0 THEN 16370.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 130000.0 THEN 85128.0
        WHEN (i.legal_name LIKE '%Robert DETTMEIJER%' OR i.legal_name LIKE '%Robert%DETTMEIJER%' OR i.legal_name LIKE '%DETTMEIJER%Robert%') AND s.commitment = 20000.0 THEN 13096.0
        WHEN (i.legal_name LIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%' OR i.legal_name LIKE '%IQEQ%Trust%' OR i.legal_name LIKE '%Trust%IQEQ%') AND s.commitment = 125000.0 THEN 12038.0
        WHEN (i.legal_name LIKE '%REVERY Capital Limited%' OR i.legal_name LIKE '%REVERY%Limited%' OR i.legal_name LIKE '%Limited%REVERY%') AND s.commitment = 50000.0 THEN 32741.0
        WHEN (i.legal_name LIKE '%Beatrice and Marcel KNOPF%' OR i.legal_name LIKE '%Beatrice%KNOPF%' OR i.legal_name LIKE '%KNOPF%Beatrice%') AND s.commitment = 100000.0 THEN 8186.0
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 40931.0
        WHEN (i.legal_name LIKE '%Tom ROAD%' OR i.legal_name LIKE '%Tom%ROAD%' OR i.legal_name LIKE '%ROAD%Tom%') AND s.commitment = 15000.0 THEN 1227.0
        WHEN (i.legal_name LIKE '%Sheikh Yousef AL SABAH%' OR i.legal_name LIKE '%Sheikh%SABAH%' OR i.legal_name LIKE '%SABAH%Sheikh%') AND s.commitment = 50000.0 THEN 4093.0
        WHEN (i.legal_name LIKE '%Giovanni ALBERTINI%' OR i.legal_name LIKE '%Giovanni%ALBERTINI%' OR i.legal_name LIKE '%ALBERTINI%Giovanni%') AND s.commitment = 50000.0 THEN 4093.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 535000.0 THEN 43797.0
        WHEN (i.legal_name LIKE '%VERSO X%' OR i.legal_name LIKE '%VERSO%X%' OR i.legal_name LIKE '%X%VERSO%') AND s.commitment = 371109.0 THEN 236185.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 24.5 THEN 61.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 50.0 THEN 100.0
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 6.0 THEN 3.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC112';
