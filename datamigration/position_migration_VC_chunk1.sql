-- VC-series position updates (chunk 1)

-- batch_11_VC102.sql
-- Batch 11: VC102
-- 7 position updates

UPDATE positions p
SET units = 3000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND i.legal_name ILIKE '%LF GROUP SARL%';
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%PAUMIER%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (i.first_name ILIKE '%KRISTINA & CHENG-LIN%' AND i.last_name ILIKE '%SUTKAITYTE & HSU%');

-- batch_12_VC103.sql
-- Batch 12: VC103
-- 33 position updates

UPDATE positions p
SET units = 2727272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%Medtronic Office%';
UPDATE positions p
SET units = 2272727.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%MONTEREY HOLDING Co Inc%';
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Ryan%' AND i.last_name ILIKE '%KUANG%');
UPDATE positions p
SET units = 1136363.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');
UPDATE positions p
SET units = 909090.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%ATTAR%');
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');
UPDATE positions p
SET units = 772500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 1162791.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 681818.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');
UPDATE positions p
SET units = 570000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');
UPDATE positions p
SET units = 11627906.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%VEGINVEST%';
UPDATE positions p
SET units = 1894417.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 252589.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 757767.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 1515534.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 1894419.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 2474418.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 627907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 626000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 1162791.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 928571.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%MONTEREY HOLDING Co Inc%';
UPDATE positions p
SET units = 2325581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Ryan%' AND i.last_name ILIKE '%KUANG%');
UPDATE positions p
SET units = 11627906.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%VEGINVEST%';

-- batch_13_VC104.sql
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

-- batch_14_VC106.sql
-- Batch 14: VC106
-- 206 position updates

UPDATE positions p
SET units = 7500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');
UPDATE positions p
SET units = 5600.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SHEILA and KAMLESH%' AND i.last_name ILIKE '%MADHVANI%');
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SAMIR%' AND i.last_name ILIKE '%KOHI%');
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');
UPDATE positions p
SET units = 5555.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Han%' AND i.last_name ILIKE '%CHIH-HENG%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rajiv%' AND i.last_name ILIKE '%AGARWALA%');
UPDATE positions p
SET units = 1756.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daphne%' AND i.last_name ILIKE '%CHANDRA%');
UPDATE positions p
SET units = 9167.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');
UPDATE positions p
SET units = 1388.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ekkawat%' AND i.last_name ILIKE '%SAE-JEE%');
UPDATE positions p
SET units = 4448.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Tan%' AND i.last_name ILIKE '%GEOK%');
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';
UPDATE positions p
SET units = 5025.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matteo%' AND i.last_name ILIKE '%MARTINI%');
UPDATE positions p
SET units = 11904.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';
UPDATE positions p
SET units = 1507.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MA GROUP AG%';
UPDATE positions p
SET units = 13698.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KRANA INVESTMENTS PTE. LTD.%';
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%CABIAN%');
UPDATE positions p
SET units = 2392.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dario%' AND i.last_name ILIKE '%SCIMONE%');
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OFBR Trust%';
UPDATE positions p
SET units = 9132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Elidon Estate Inc%';
UPDATE positions p
SET units = 1141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Adam Smith Singapore Pte Ltd%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr Beatrice & Marcel%' AND i.last_name ILIKE '%KNOPF%');
UPDATE positions p
SET units = 11101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%VOLF Trust%';
UPDATE positions p
SET units = 6500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bahama Global Towers Limited%';
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CAUSE FIRST Holdings Ltd%';
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Heinz & Barbara%' AND i.last_name ILIKE '%WINZ%');
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sabrina%' AND i.last_name ILIKE '%WINZ%');
UPDATE positions p
SET units = 2272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr%' AND i.last_name ILIKE '%KARKUN%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Craig%' AND i.last_name ILIKE '%BROWN%');
UPDATE positions p
SET units = 32631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TRUE INVESTMENTS 4 LLC%';
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS Inc%';
UPDATE positions p
SET units = 6733.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs & Mr Subbiah%' AND i.last_name ILIKE '%SUBRAMANIAN%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JIMENEZ TRADING INC%';
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 10526.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 1842.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 5263.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%PANT Investments Inc%';
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 4252.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 212585.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ONC Limited%';
UPDATE positions p
SET units = 12700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%AL ABBASI%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%CORR%');
UPDATE positions p
SET units = 6802.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephen%' AND i.last_name ILIKE '%JORDAN%');
UPDATE positions p
SET units = 15306.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%FigTree Family Office Ltd%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Oliver%' AND i.last_name ILIKE '%WRIGHT%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emile%' AND i.last_name ILIKE '%VAN DEN BOL%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matthew%' AND i.last_name ILIKE '%HAYCOX%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%ACKERLEY%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Steve%' AND i.last_name ILIKE '%MANNING%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Global Custody & Clearing Limited%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Gregory%' AND i.last_name ILIKE '%BROOKS%');
UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Innovatech 1%';
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jean%' AND i.last_name ILIKE '%DUTIL%');
UPDATE positions p
SET units = 6550.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Barnaby%' AND i.last_name ILIKE '%MOORE%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Sudon Carlop Holdings Limited%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lesli%' AND i.last_name ILIKE '%SCHUTTE%');
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust%';
UPDATE positions p
SET units = 425.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%RICHARD%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');
UPDATE positions p
SET units = 1332.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';
UPDATE positions p
SET units = 7227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shana%' AND i.last_name ILIKE '%NUSSBERGER%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';
UPDATE positions p
SET units = 7000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GORILLA PE Inc%';
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%';
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');
UPDATE positions p
SET units = 32195.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imrat%' AND i.last_name ILIKE '%HAYAT%');
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%BACHELIER%');
UPDATE positions p
SET units = 452.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%PASHA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ashish%' AND i.last_name ILIKE '%KOTHARI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fabien%' AND i.last_name ILIKE '%ROTH%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fawad%' AND i.last_name ILIKE '%MUKHTAR%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KABELLA LTD%';
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SOUTH SOUND LTD%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Constantin-Octavian%' AND i.last_name ILIKE '%PATRASCU%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CINCORIA LIMITED%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hayden%' AND i.last_name ILIKE '%RUSHTON%');
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs Nalini Yoga & Mr Aran James%' AND i.last_name ILIKE '%WILLETTS%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emma Graham-Taylor & Gregory%' AND i.last_name ILIKE '%SOMMERVILLE%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rabin D. and Dolly%' AND i.last_name ILIKE '%LAI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kim%' AND i.last_name ILIKE '%LUND%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%BELGA%');
UPDATE positions p
SET units = 12755.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ayman%' AND i.last_name ILIKE '%JOMAA%');
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Karthic%' AND i.last_name ILIKE '%JAYARAMAN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imran%' AND i.last_name ILIKE '%HAKIM%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Kenilworth Ltd%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Adil%' AND i.last_name ILIKE '%KHAWAJA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bharat%' AND i.last_name ILIKE '%JATANIA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lubna%' AND i.last_name ILIKE '%QUNASH%');
UPDATE positions p
SET units = 198193.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 2674.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 1546.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 1980.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 5291.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 160.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 5502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 640.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Limited%';
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Michel%' AND i.last_name ILIKE '%GUERIN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Swip Holdings Ltd%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Phaena Advisory Ltd%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bhikhu%' AND i.last_name ILIKE '%PATEL%');
UPDATE positions p
SET units = 31887.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vijaykumar%' AND i.last_name ILIKE '%PATEL%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%POTASSIUM Capital%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Aatif%' AND i.last_name ILIKE '%HASSAN%');
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kevin%' AND i.last_name ILIKE '%WILTSHIRE%');
UPDATE positions p
SET units = 20391.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GTV Partners SA%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LENN Participations SARL%';
UPDATE positions p
SET units = 19132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%WEALTH TRAIN LIMITED%';
UPDATE positions p
SET units = 3863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERSANE INTERNATIONAL LTD%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Brahma Finance (BVI) Ltd%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%HARTSHORN%');
UPDATE positions p
SET units = 14880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Cyrus%' AND i.last_name ILIKE '%ALAMOUTI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Darius%' AND i.last_name ILIKE '%ALAMOUTI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kaveh%' AND i.last_name ILIKE '%ALAMOUTI%');
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Caspian Enterprises Limited%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Rensburg Client Nominees Limited A/c CLT%';
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DCMS Holdings Limited%';
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GELIGA LIMITED%';
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%REVERY CAPITAL Limited%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Maria Christina%' AND i.last_name ILIKE '%CHANDRIS%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dimitri%' AND i.last_name ILIKE '%CHANDRIS%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Nicki%' AND i.last_name ILIKE '%ASQUITH%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Isabella%' AND i.last_name ILIKE '%CHANDRIS%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Martin%' AND i.last_name ILIKE '%AVETISYAN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Herve%' AND i.last_name ILIKE '%STEIMES%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%SERRA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Frederic%' AND i.last_name ILIKE '%SAMAMA%');
UPDATE positions p
SET units = 23870.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CUDRE-MAUROUX%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Georges%' AND i.last_name ILIKE '%CYTRON%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rosario%' AND i.last_name ILIKE '%RIENZO%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Raphael%' AND i.last_name ILIKE '%GHESQUIERES%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Guillaume%' AND i.last_name ILIKE '%SAMAMA%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%ROSSIER%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bernard%' AND i.last_name ILIKE '%DUFAURE%');
UPDATE positions p
SET units = 27636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 25510.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vasily%' AND i.last_name ILIKE '%SUKHOTIN%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%RIVA%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%CYROT%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hossien%' AND i.last_name ILIKE '%JAVID%');
UPDATE positions p
SET units = 850.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kamyar%' AND i.last_name ILIKE '%BADII%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shaham%' AND i.last_name ILIKE '%SOLOUKI%');
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kian%' AND i.last_name ILIKE '%JAVID%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Salman%' AND i.last_name ILIKE '%HUSSAIN%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Juan%' AND i.last_name ILIKE '%TONELLI BANFI%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GREENLEAF%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%';
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%';
UPDATE positions p
SET units = 23384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%RLABS HOLDINGS LTD%';
UPDATE positions p
SET units = 29761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OLD HILL INVESTMENT GROUP LLC%';
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Samuel%' AND i.last_name ILIKE '%GRANDCHAMP%');
UPDATE positions p
SET units = 4078.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Luiz%' AND i.last_name ILIKE '%FONTES WILLIAMS%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 38827.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 20947.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%STABLETON (ALTERNATIVE ISSUANCE)%';
UPDATE positions p
SET units = 3636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- batch_15_VC111.sql
-- Batch 15: VC111
-- 38 position updates

UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS INC%';
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%STRUCTURED ISSUANCE Ltd%';
UPDATE positions p
SET units = 115000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Tartrifuge SA%';
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%OEP LIMITED
(Transfer from AS ADVISORY DWC LLC)%';
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan
Jean%' AND i.last_name ILIKE '%BAUMSLAG
DUTIL%');
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Bruce%' AND i.last_name ILIKE '%HAWKINS%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%VOLF Trust%';
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%BURCH%');
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Alberto%' AND i.last_name ILIKE '%RAVANO%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%FINALMA SUISSE SA%';
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%MONFIN LTD%';
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings LTD%';
UPDATE positions p
SET units = 70000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Antonio%' AND i.last_name ILIKE '%PERONACE%');
UPDATE positions p
SET units = 260000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BRAHMA FINANCE%';
UPDATE positions p
SET units = 600000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%GTV Partners SA%';
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BenSkyla AG%';
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Peter%' AND i.last_name ILIKE '%HOGLAND%');
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%HASSBRO Investments Limited%';
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Vladimir%' AND i.last_name ILIKE '%GUSEV%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Vladimir%' AND i.last_name ILIKE '%GUSEV%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%LPP Investment Holdings Ltd%';
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');

-- batch_16_VC112.sql
-- Batch 16: VC112
-- 25 position updates

UPDATE positions p
SET units = 393220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 100704.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 201409.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');
UPDATE positions p
SET units = 50352.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 151057.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 470783.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 22472.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 16370.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 16370.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%';
UPDATE positions p
SET units = 85128.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 13096.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');
UPDATE positions p
SET units = 12038.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%';
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%REVERY Capital Limited%';
UPDATE positions p
SET units = 8186.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');
UPDATE positions p
SET units = 40931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOV%');
UPDATE positions p
SET units = 1227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%ROAD%');
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Giovanni%' AND i.last_name ILIKE '%ALBERTINI%');
UPDATE positions p
SET units = 43797.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 236185.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%VERSO X%';
UPDATE positions p
SET units = 61.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 100.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 3.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 21972.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- batch_17_VC113.sql
-- Batch 17: VC113
-- 80 position updates

UPDATE positions p
SET units = 72131.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Barbara and Heinz%' AND i.last_name ILIKE '%WINZ%');
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');
UPDATE positions p
SET units = 5590.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Dalinga AG%';
UPDATE positions p
SET units = 559.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Dalinga AG%';
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liudmila Romanova and Alexey%' AND i.last_name ILIKE '%ROMANOV%');
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%';
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrey%' AND i.last_name ILIKE '%GORYAINOV%');
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liubov and Igor%' AND i.last_name ILIKE '%ZINKEVICH%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheila and Kamlesh%' AND i.last_name ILIKE '%MADHVANI%');
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Rosen Invest Holdings Inc%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';
UPDATE positions p
SET units = 1250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%HAYWARD%');
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');
UPDATE positions p
SET units = 3750.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%TOMMEY%');
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Signet Logistics Ltd%';
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Shrai and Aparna%' AND i.last_name ILIKE '%MADHVANI%');
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%DE%');
UPDATE positions p
SET units = 3773.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Ltd%';
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%TEKAPO Group Limited%';
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Philip%' AND i.last_name ILIKE '%ALGAR%');
UPDATE positions p
SET units = 1118.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%MERIDA%');
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%EMPIRE GROUP Limited%';
UPDATE positions p
SET units = 3913.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Nilakantan & Mr Subbiah%' AND i.last_name ILIKE '%MAHESWARI & SUBRAMANIAN%');
UPDATE positions p
SET units = 4099.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Rosario Teresa & Mr Deepak%' AND i.last_name ILIKE '%HIQUIANA-TANEJA & TANEJA%');
UPDATE positions p
SET units = 9317.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SAFE%';
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%FRALIS SPF%';
UPDATE positions p
SET units = 11180.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SUMMIT INVESTMENT HOLDINGS LLC%';
UPDATE positions p
SET units = 104355.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%NEWBRIDGE FINANCE SPF%';
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%TAROUILLY%');
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Thierry%' AND i.last_name ILIKE '%ULDRY%');
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 745.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%COMEL%');
UPDATE positions p
SET units = 75469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%';
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gielke%' AND i.last_name ILIKE '%BURGMANS%');
UPDATE positions p
SET units = 969.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Halim%' AND i.last_name ILIKE '%EL MOGHAZI%');
UPDATE positions p
SET units = 633.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');
UPDATE positions p
SET units = 931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');
UPDATE positions p
SET units = 18871.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 372.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Hong%' AND i.last_name ILIKE '%NGOC LE%');
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';
UPDATE positions p
SET units = 76398.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 2236.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');
UPDATE positions p
SET units = 35301.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SMR3T Capital Pte Ltd%';
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%CLOUD IN HEAVEN SAS%';
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid%' AND i.last_name ILIKE '%MOHAMMED%');
UPDATE positions p
SET units = 3661.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%PETRATECH%';
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%FRALIS SPF%';
UPDATE positions p
SET units = 481.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%POURRAT%');
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 74539.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 2000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%HAYWARD%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid (VOIDED)%' AND i.last_name ILIKE '%KADDOUMI (VOIDED)%');
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');
UPDATE positions p
SET units = 6779.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');
UPDATE positions p
SET units = 3389.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Abhie%' AND i.last_name ILIKE '%SHAH%');
UPDATE positions p
SET units = 3354.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';
UPDATE positions p
SET units = 7307.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');
UPDATE positions p
SET units = 23809.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');
UPDATE positions p
SET units = 12500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');
UPDATE positions p
SET units = 14634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');

-- batch_18_VC114.sql
-- Batch 18: VC114
-- 4 position updates

UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Revery Capital Limited%';
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Prometheus Capital Finance Ltd%';
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');

-- batch_19_VC115.sql
-- Batch 19: VC115
-- 1 position updates

UPDATE positions p
SET units = 715.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC115'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- batch_20_VC116.sql
-- Batch 20: VC116
-- 6 position updates

UPDATE positions p
SET units = 10562.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 33820.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 45205.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND i.legal_name ILIKE '%VERSO X%';

