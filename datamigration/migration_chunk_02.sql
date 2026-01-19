-- VC103
 15 investors, total ownership: 60,001,270
-- ============================================================

-- Medtronic Office: total ownership = 2,727,272
UPDATE positions p
SET units = 2727272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%Medtronic Office%';

-- Denis MATTHEY: total ownership = 2,272,727
UPDATE positions p
SET units = 2272727.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- MONTEREY HOLDING Co Inc: total ownership = 4,651,162
UPDATE positions p
SET units = 4651162.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%MONTEREY HOLDING Co Inc%';

-- Ryan KUANG: total ownership = 4,651,162
UPDATE positions p
SET units = 4651162.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Ryan%' AND i.last_name ILIKE '%KUANG%');

-- Gershon KOH: total ownership = 1,136,363
UPDATE positions p
SET units = 1136363.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Mohammed Saddik ATTAR: total ownership = 909,090
UPDATE positions p
SET units = 909090.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%ATTAR%');

-- Serge AURIER: total ownership = 2,450,581
UPDATE positions p
SET units = 2450581.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Sheikh Yousef AL SABAH: total ownership = 1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Julien MACHOT: total ownership = 12,044,122
UPDATE positions p
SET units = 12044122.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Daniel BAUMSLAG: total ownership = 1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');

-- AS ADVISORY DWC-LLC: total ownership = 1,162,791
UPDATE positions p
SET units = 1162791.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';

-- OEP Ltd: total ownership = 1,162,790
UPDATE positions p
SET units = 1162790.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Daryl PAK YONGJIE: total ownership = 681,818
UPDATE positions p
SET units = 681818.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');

-- Chang Yong NGAN: total ownership = 570,000
UPDATE positions p
SET units = 570000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');

-- VEGINVEST: total ownership = 23,255,812
UPDATE positions p
SET units = 23255812.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC103'
  AND i.legal_name ILIKE '%VEGINVEST%';



-- VC104
 29 investors, total ownership: 231,876
-- ============================================================

-- Gershon KOH: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Denis MATTEY: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTEY%');

-- Julien MACHOT: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Daniel Aufore: total ownership = 4,250
UPDATE positions p
SET units = 4250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%Aufore%');

-- NextGen: total ownership = 42,285
UPDATE positions p
SET units = 42285.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%NextGen%';

-- Cité Gestion: total ownership = 44,423
UPDATE positions p
SET units = 44423.00004
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Cité Gestion%';

-- Arboris: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Arboris%';

-- APM: total ownership = 25,505
UPDATE positions p
SET units = 25505.00021
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%APM%';

-- Erwan Tarouilly: total ownership = 8,500
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%Tarouilly%');

-- Theo Costa: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Theo%' AND i.last_name ILIKE '%Costa%');

-- Divya Bagrecha: total ownership = 10,628
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Divya%' AND i.last_name ILIKE '%Bagrecha%');

-- Sebastian Reis: total ownership = 10,628
UPDATE positions p
SET units = 10627.99983
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%Reis%');

-- Ramez Mecataff: total ownership = 2,975
UPDATE positions p
SET units = 2975.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Ramez%' AND i.last_name ILIKE '%Mecataff%');

-- Pierre Roy: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%Roy%');

-- Pierre-Henri Froidevaux: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Pierre-Henri%' AND i.last_name ILIKE '%Froidevaux%');

-- Sofiane Zaiem: total ownership = 5,315
UPDATE positions p
SET units = 5315.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Sofiane%' AND i.last_name ILIKE '%Zaiem%');

-- Jean-Pierre Bettin: total ownership = 2,000
UPDATE positions p
SET units = 2000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jean-Pierre%' AND i.last_name ILIKE '%Bettin%');

-- Arnaud Wattiez: total ownership = 6,377
UPDATE positions p
SET units = 6376.999957
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Arnaud%' AND i.last_name ILIKE '%Wattiez%');

-- Damien Krauser: total ownership = 5,325
UPDATE positions p
SET units = 5325.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%Krauser%');

-- SFRD0: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%SFRD0%';

-- Lombard Odier (HOF): total ownership = 1,700
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Lombard Odier (HOF)%';

-- Banque Gonet (BAR): total ownership = 1,700
UPDATE positions p
SET units = 1700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (BAR)%';

-- Banque Gonet (FIR): total ownership = 2,126
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (FIR)%';

-- Banque Gonet (HOF): total ownership = 2,125
UPDATE positions p
SET units = 2125.000213
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND i.legal_name ILIKE '%Banque Gonet (HOF)%';

-- Rainer Buchecker: total ownership = 8,500
UPDATE positions p
SET units = 8500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Rainer%' AND i.last_name ILIKE '%Buchecker%');

-- Marwan Al Abedin: total ownership = 12,753
UPDATE positions p
SET units = 12753.47532
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marwan%' AND i.last_name ILIKE '%Al Abedin%');

-- Jonathan Menoud: total ownership = 2,126
UPDATE positions p
SET units = 2126.000085
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Jonathan%' AND i.last_name ILIKE '%Menoud%');

-- Marc Zafrany: total ownership = 7,129
UPDATE positions p
SET units = 7129.000128
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Marc%' AND i.last_name ILIKE '%Zafrany%');

-- Philippe Houman: total ownership = 4,251
UPDATE positions p
SET units = 4250.999872
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC104'
  AND (i.first_name ILIKE '%Philippe%' AND i.last_name ILIKE '%Houman%');


