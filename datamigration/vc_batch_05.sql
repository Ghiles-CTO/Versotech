-- VC130: 4 updates
UPDATE positions p
SET units = 483748.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 12502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 833.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%LIVINGSTONE%');
UPDATE positions p
SET units = 2917.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');

-- VC131: 1 updates
UPDATE positions p
SET units = 65000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VC132: 1 updates
UPDATE positions p
SET units = 27546.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VC133: 15 updates
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');
UPDATE positions p
SET units = 200.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%CARTA INVESTMENTS LLC%';
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Sahejman%' AND i.last_name ILIKE '%KAHLON%');
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%777 WALNUT LLC%';
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');
UPDATE positions p
SET units = 645.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%';
UPDATE positions p
SET units = 358.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%Band Capital Limited%';
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Jeremy%' AND i.last_name ILIKE '%LOWY%');
UPDATE positions p
SET units = 716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 4.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%VERSO HOLDINGS%';
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tobias%' AND i.last_name ILIKE '%JOERN%');
UPDATE positions p
SET units = 13.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%René%' AND i.last_name ILIKE '%ROSSDEUTSCHER%');
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Ellen%' AND i.last_name ILIKE '%STAUDENMAYER%');

-- VC134: 4 updates
UPDATE positions p
SET units = 1930000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';
UPDATE positions p
SET units = 501101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%PROGETTO UNO SPA%';
UPDATE positions p
SET units = 100220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Stefano%' AND i.last_name ILIKE '%CAPRA%');
UPDATE positions p
SET units = 5011.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
