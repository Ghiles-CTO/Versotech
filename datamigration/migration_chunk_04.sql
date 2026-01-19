-- VC111
 35 investors, total ownership: 6,750,000
-- ============================================================

-- Julien MACHOT: total ownership = 410,000
UPDATE positions p
SET units = 410000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Dan BAUMSLAG: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- ROSEN INVEST HOLDINGS INC: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS INC%';

-- STRUCTURED ISSUANCE Ltd: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%STRUCTURED ISSUANCE Ltd%';

-- DALINGA HOLDING AG: total ownership = 115,000
UPDATE positions p
SET units = 115000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- Tartrifuge SA: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Tartrifuge SA%';

-- OEP LIMITED
(Transfer from AS ADVISORY DWC LLC): total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%OEP LIMITED
(Transfer from AS ADVISORY DWC LLC)%';

-- David HOLDEN: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- TERRA Financial & Management Services SA: total ownership = 80,000
UPDATE positions p
SET units = 80000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';

-- Dan
Jean BAUMSLAG
DUTIL: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Dan
Jean%' AND i.last_name ILIKE '%BAUMSLAG
DUTIL%');

-- Stephane DAHAN: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');

-- Bruce HAWKINS: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Bruce%' AND i.last_name ILIKE '%HAWKINS%');

-- VOLF Trust: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%VOLF Trust%';

-- James BURCH: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%BURCH%');

-- Mark MATTHEWS: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Sandra KOHLER CABIAN: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Johann Markus AKERMANN: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');

-- Erich GRAF: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- Alberto Attilio RAVANO: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Alberto%' AND i.last_name ILIKE '%RAVANO%');

-- FINALMA SUISSE SA: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%FINALMA SUISSE SA%';

-- MONFIN LTD: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%MONFIN LTD%';

-- Bright Phoenix Holdings LTD: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings LTD%';

-- Antonio Bruno PERONACE: total ownership = 70,000
UPDATE positions p
SET units = 70000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Antonio%' AND i.last_name ILIKE '%PERONACE%');

-- BRAHMA FINANCE: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BRAHMA FINANCE%';

-- GTV Partners SA: total ownership = 600,000
UPDATE positions p
SET units = 600000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%GTV Partners SA%';

-- Denis MATTHEY: total ownership = 1,000,000
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- Beatrice and Marcel KNOPF: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- BenSkyla AG: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%BenSkyla AG%';

-- Peter HOGLAND: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Peter%' AND i.last_name ILIKE '%HOGLAND%');

-- Wymo Finance Limited: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Wymo Finance Limited%';

-- HASSBRO Investments Limited: total ownership = 250,000
UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%HASSBRO Investments Limited%';

-- Vladimir GUSEV: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Vladimir%' AND i.last_name ILIKE '%GUSEV%');

-- Zandera (Finco) Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';

-- LPP Investment Holdings Ltd: total ownership = 1,000,000
UPDATE positions p
SET units = 1000000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND i.legal_name ILIKE '%LPP Investment Holdings Ltd%';

-- Mickael RYAN: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');



-- VC112
 14 investors, total ownership: 1,959,129
-- ============================================================

-- Julien MACHOT: total ownership = 1,166,621
UPDATE positions p
SET units = 1166621.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- OEP Ltd: total ownership = 133,445
UPDATE positions p
SET units = 133445.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Gershon KOH: total ownership = 201,409
UPDATE positions p
SET units = 201409.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Dan BAUMSLAG: total ownership = 66,722
UPDATE positions p
SET units = 66722.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- IQEQ (Switzerland) Ltd ATO Raycat Investment Trust: total ownership = 28,408
UPDATE positions p
SET units = 28408.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Ltd ATO Raycat Investment Trust%';

-- Robert Jan DETTMEIJER: total ownership = 13,096
UPDATE positions p
SET units = 13096.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');

-- REVERY Capital Limited: total ownership = 32,741
UPDATE positions p
SET units = 32741.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%REVERY Capital Limited%';

-- Beatrice and Marcel KNOPF: total ownership = 8,186
UPDATE positions p
SET units = 8186.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Liudmila and Alexey ROMANOV: total ownership = 40,931
UPDATE positions p
SET units = 40931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOV%');

-- Tom ROAD: total ownership = 1,227
UPDATE positions p
SET units = 1227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Tom%' AND i.last_name ILIKE '%ROAD%');

-- Sheikh Yousef AL SABAH: total ownership = 4,093
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');

-- Giovanni Antonio Alberto ALBERTINI: total ownership = 4,093
UPDATE positions p
SET units = 4093.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (i.first_name ILIKE '%Giovanni%' AND i.last_name ILIKE '%ALBERTINI%');

-- VERSO X: total ownership = 236,185
UPDATE positions p
SET units = 236185.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%VERSO X%';

-- OEP Ltd: total ownership = 21,972
UPDATE positions p
SET units = 21972.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND i.legal_name ILIKE '%OEP Ltd%';


