-- VC18 Share Data: 7 rows
UPDATE public.subscriptions s
SET
    cost_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 408115.01 THEN 3.42283
        WHEN (i.legal_name LIKE '%VOLF TRUST%' OR i.legal_name LIKE '%VOLF%TRUST%' OR i.legal_name LIKE '%TRUST%VOLF%') AND s.commitment = 250000.0 THEN 3.42283
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOVA & ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 3.42283
        WHEN (i.legal_name LIKE '%SIGNET LOGISTICS Ltd%' OR i.legal_name LIKE '%SIGNET%Ltd%' OR i.legal_name LIKE '%Ltd%SIGNET%') AND s.commitment = 100000.0 THEN 3.42283
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 150000.0 THEN 3.42283
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 258460.0 THEN 3.42283
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 525695.0 THEN 3.42283
        ELSE cost_per_share
    END,
    price_per_share = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 408115.01 THEN 3.42283
        WHEN (i.legal_name LIKE '%VOLF TRUST%' OR i.legal_name LIKE '%VOLF%TRUST%' OR i.legal_name LIKE '%TRUST%VOLF%') AND s.commitment = 250000.0 THEN 32.5
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOVA & ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 32.5
        WHEN (i.legal_name LIKE '%SIGNET LOGISTICS Ltd%' OR i.legal_name LIKE '%SIGNET%Ltd%' OR i.legal_name LIKE '%Ltd%SIGNET%') AND s.commitment = 100000.0 THEN 32.5
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 150000.0 THEN 32.5
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 258460.0 THEN 6.62717
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 525695.0 THEN 6.62717
        ELSE price_per_share
    END,
    num_shares = CASE
        WHEN (i.legal_name LIKE '%Julien MACHOT%' OR i.legal_name LIKE '%Julien%MACHOT%' OR i.legal_name LIKE '%MACHOT%Julien%') AND s.commitment = 408115.01 THEN 119233.0
        WHEN (i.legal_name LIKE '%VOLF TRUST%' OR i.legal_name LIKE '%VOLF%TRUST%' OR i.legal_name LIKE '%TRUST%VOLF%') AND s.commitment = 250000.0 THEN 7692.0
        WHEN (i.legal_name LIKE '%Liudmila and Alexey ROMANOVA & ROMANOV%' OR i.legal_name LIKE '%Liudmila%ROMANOV%' OR i.legal_name LIKE '%ROMANOV%Liudmila%') AND s.commitment = 500000.0 THEN 15384.0
        WHEN (i.legal_name LIKE '%SIGNET LOGISTICS Ltd%' OR i.legal_name LIKE '%SIGNET%Ltd%' OR i.legal_name LIKE '%Ltd%SIGNET%') AND s.commitment = 100000.0 THEN 3076.0
        WHEN (i.legal_name LIKE '%Markus AKERMANN%' OR i.legal_name LIKE '%Markus%AKERMANN%' OR i.legal_name LIKE '%AKERMANN%Markus%') AND s.commitment = 150000.0 THEN 4615.0
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 258460.0 THEN 39000.0
        WHEN (i.legal_name LIKE '%Talal CHAMSI PASHA%' OR i.legal_name LIKE '%Talal%PASHA%' OR i.legal_name LIKE '%PASHA%Talal%') AND s.commitment = 525695.0 THEN 79324.0
        ELSE num_shares
    END,
    spread_per_share = price_per_share - cost_per_share,
    spread_fee_amount = (price_per_share - cost_per_share) * num_shares
FROM public.vehicles v, public.investors i
WHERE s.vehicle_id = v.id
  AND s.investor_id = i.id
  AND v.entity_code = 'VC118';
