-- Batch 28: VC125
-- 34 position updates

UPDATE positions p
SET units = 1075.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 169.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%BIECHELER%');
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%SC STONEA%';
UPDATE positions p
SET units = 225.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Christophe%' AND i.last_name ILIKE '%SORAIS%');
UPDATE positions p
SET units = 451.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Alain%' AND i.last_name ILIKE '%DECOMBE%');
UPDATE positions p
SET units = 2398.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%TELEGRAPH HILL CAPITAL%';
UPDATE positions p
SET units = 1410.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ZEBRA HOLDING%';
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Sylvain%' AND i.last_name ILIKE '%GARIEL%');
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%PRESSET%');
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%CAREITAS%';
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%OEP LTD%';
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%AS ADVISORY%';
UPDATE positions p
SET units = 56.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CREHANGE%');
UPDATE positions p
SET units = 203.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Pierre%' AND i.last_name ILIKE '%LECOMTE%');
UPDATE positions p
SET units = 28.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%ALPHA OMEGA SAS%';
UPDATE positions p
SET units = 1410.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';
UPDATE positions p
SET units = 28.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';
UPDATE positions p
SET units = 100.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%MA GROUP AG%';
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Thomas%' AND i.last_name ILIKE '%YBERT%');
UPDATE positions p
SET units = 112.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Xavier%' AND i.last_name ILIKE '%GODRON%');
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 282.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');
UPDATE positions p
SET units = 979.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');
UPDATE positions p
SET units = 1415.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%GOOD PROTEIN FUND VCC%';
UPDATE positions p
SET units = 502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');
UPDATE positions p
SET units = 152.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Alain%' AND i.last_name ILIKE '%DECOMBE%');
UPDATE positions p
SET units = 197.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%SC STONEA%';
UPDATE positions p
SET units = 48.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%LF GROUP SARL%';