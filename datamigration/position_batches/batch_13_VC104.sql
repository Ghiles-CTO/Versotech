-- Batch 13: VC104
-- 33 position updates

UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTEY%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 4250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%Aufore%');
UPDATE positions p
SET units = 42285.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%NextGen%';
UPDATE positions p
SET units = 44423.00004
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Cité Gestion%';
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Arboris%';
UPDATE positions p
SET units = 25505.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%APM%';
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%Tarouilly%');
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Theo%' AND i.last_name ILIKE '%Costa%');
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Divya%' AND i.last_name ILIKE '%Bagrecha%');
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%Reis%');
UPDATE positions p
SET units = 2975.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Ramez%' AND i.last_name ILIKE '%Mecataff%');
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%Roy%');
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre-Henri%' AND i.last_name ILIKE '%Froidevaux%');
UPDATE positions p
SET units = 5315.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sofiane%' AND i.last_name ILIKE '%Zaiem%');
UPDATE positions p
SET units = 2000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jean-Pierre%' AND i.last_name ILIKE '%Bettin%');
UPDATE positions p
SET units = 6376.999957
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Arnaud%' AND i.last_name ILIKE '%Wattiez%');
UPDATE positions p
SET units = 5325.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%Krauser%');
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%SFRD0%';
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Lombard Odier (HOF)%';
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (BAR)%';
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (FIR)%';
UPDATE positions p
SET units = 2125.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (HOF)%';
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Rainer%' AND i.last_name ILIKE '%Buchecker%');
UPDATE positions p
SET units = 12753.47532
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marwan%' AND i.last_name ILIKE '%Al Abedin%');
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jonathan%' AND i.last_name ILIKE '%Menoud%');
UPDATE positions p
SET units = 7129.000128
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marc%' AND i.last_name ILIKE '%Zafrany%');
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Philippe%' AND i.last_name ILIKE '%Houman%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');