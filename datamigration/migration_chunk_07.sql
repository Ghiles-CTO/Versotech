-- VC125
 28 investors, total ownership: 16,088
-- ============================================================

-- Julien MACHOT: total ownership = 2,102
UPDATE positions p
SET units = 2102.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Patrick BIECHELER: total ownership = 169
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%BIECHELER%');

-- SC STONEA: total ownership = 761
UPDATE positions p
SET units = 761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%SC STONEA%';

-- Christophe SORAIS: total ownership = 225
UPDATE positions p
SET units = 225.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Christophe%' AND i.last_name ILIKE '%SORAIS%');

-- Alain DECOMBE: total ownership = 603
UPDATE positions p
SET units = 603.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Alain%' AND i.last_name ILIKE '%DECOMBE%');

-- TELEGRAPH HILL CAPITAL: total ownership = 2,398
UPDATE positions p
SET units = 2398.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%TELEGRAPH HILL CAPITAL%';

-- Eric SARASIN: total ownership = 1,912
UPDATE positions p
SET units = 1912.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');

-- ZEBRA HOLDING: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ZEBRA HOLDING%';

-- Sylvain GARIEL: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Sylvain%' AND i.last_name ILIKE '%GARIEL%');

-- Benjamin PRESSET: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%PRESSET%');

-- CAREITAS: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%CAREITAS%';

-- OEP LTD: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%OEP LTD%';

-- AS ADVISORY: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%AS ADVISORY%';

-- Laurent CREHANGE: total ownership = 56
UPDATE positions p
SET units = 56.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CREHANGE%');

-- Pierre LECOMTE: total ownership = 203
UPDATE positions p
SET units = 203.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%LECOMTE%');

-- ALPHA OMEGA SAS: total ownership = 28
UPDATE positions p
SET units = 28.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ALPHA OMEGA SAS%';

-- GOOD PROTEIN FUND VCC: total ownership = 1,410
UPDATE positions p
SET units = 1410.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';

-- DALINGA HOLDING AG: total ownership = 169
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- MA GROUP AG: total ownership = 100
UPDATE positions p
SET units = 100.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%MA GROUP AG%';

-- Andrew MEYER: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');

-- Thomas YBERT: total ownership = 141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Thomas%' AND i.last_name ILIKE '%YBERT%');

-- Xavier GODRON: total ownership = 112
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Xavier%' AND i.last_name ILIKE '%GODRON%');

-- Anand RATHI: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');

-- Dan BAUMSLAG: total ownership = 141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Serge AURIER: total ownership = 282
UPDATE positions p
SET units = 282.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- Robin DOBLE: total ownership = 141
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- GOOD PROTEIN FUND VCC: total ownership = 1,415
UPDATE positions p
SET units = 1415.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';

-- LF GROUP SARL: total ownership = 564
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%LF GROUP SARL%';


