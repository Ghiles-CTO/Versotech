-- VC114
 4 investors, total ownership: 530,000
-- ============================================================

-- Julien MACHOT: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Revery Capital Limited: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Revery Capital Limited%';

-- Prometheus Capital Finance Ltd: total ownership = 30,000
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND i.legal_name ILIKE '%Prometheus Capital Finance Ltd%';

-- Manraj Singh SEKHON: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC114'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');



-- VC115
 1 investors, total ownership: 715
-- ============================================================

-- Julien MACHOT: total ownership = 715
UPDATE positions p
SET units = 715.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC115'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC116
 4 investors, total ownership: 132,825
-- ============================================================

-- Julien MACHOT: total ownership = 89,587
UPDATE positions p
SET units = 89587.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Robin DOBLE: total ownership = 21,619
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Dan BAUMSLAG: total ownership = 21,619
UPDATE positions p
SET units = 21619.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- VERSO X: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC116'
  AND i.legal_name ILIKE '%VERSO X%';



-- VC118
 6 investors, total ownership: 150,000
-- ============================================================

-- Julien MACHOT: total ownership = 909
UPDATE positions p
SET units = 909.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VOLF TRUST: total ownership = 7,692
UPDATE positions p
SET units = 7692.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%VOLF TRUST%';

-- Liudmila and Alexey ROMANOVA & ROMANOV: total ownership = 15,384
UPDATE positions p
SET units = 15384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Liudmila and Alexey%' AND i.last_name ILIKE '%ROMANOVA & ROMANOV%');

-- SIGNET LOGISTICS Ltd: total ownership = 3,076
UPDATE positions p
SET units = 3076.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND i.legal_name ILIKE '%SIGNET LOGISTICS Ltd%';

-- Markus AKERMANN: total ownership = 4,615
UPDATE positions p
SET units = 4615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');

-- Talal CHAMSI PASHA: total ownership = 118,324
UPDATE positions p
SET units = 118324.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%CHAMSI PASHA%');



-- VC119
 1 investors, total ownership: 7,343
-- ============================================================

-- Julien MACHOT: total ownership = 7,343
UPDATE positions p
SET units = 7343.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC119'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC120
 4 investors, total ownership: 500,000
-- ============================================================

-- FRALIS SA SPF: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND i.legal_name ILIKE '%FRALIS SA SPF%';

-- Gershon KOH: total ownership = 200,000
UPDATE positions p
SET units = 200000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Sandra KOHLER CABIAN: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Markus AKERMANN: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC120'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');



-- VC121
 1 investors, total ownership: 172,413
-- ============================================================

-- Julien MACHOT: total ownership = 172,413
UPDATE positions p
SET units = 172413.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC121'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC122
 9 investors, total ownership: 409,440
-- ============================================================

-- Julien MACHOT: total ownership = 113,598
UPDATE positions p
SET units = 113598.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- AS ADVISORY DWC LLC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';

-- Deyan D MIHOV: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- Sheikh Yousef AL SABAH: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Anke Skoludek RICE: total ownership = 95,949
UPDATE positions p
SET units = 95949.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');

-- VERSO CAPITAL ESTABLISHMENT: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%VERSO CAPITAL ESTABLISHMENT%';

-- INNOVATECH COMPARTMENT 8: total ownership = 39,978
UPDATE positions p
SET units = 39978.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%INNOVATECH COMPARTMENT 8%';

-- Erich GRAF: total ownership = 159,915
UPDATE positions p
SET units = 159915.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- LF GROUP SARL: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC122'
  AND i.legal_name ILIKE '%LF GROUP SARL%';



-- VC123
 1 investors, total ownership: 100,000
-- ============================================================

-- Julien MACHOT: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC123'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC124
 8 investors, total ownership: 2,809,648
-- ============================================================

-- JASSQ Holding Limited: total ownership = 274,636
UPDATE positions p
SET units = 274636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%JASSQ Holding Limited%';

-- OEP Ltd: total ownership = 4,125
UPDATE positions p
SET units = 4125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Scott FLETCHER: total ownership = 1,749,235
UPDATE positions p
SET units = 1749235.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Julien MACHOT: total ownership = 288,716
UPDATE positions p
SET units = 288716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Dan BAUMSLAG: total ownership = 822
UPDATE positions p
SET units = 822.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Christine MASCORT SULLENGER: total ownership = 59,963
UPDATE positions p
SET units = 59963.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Christine%' AND i.last_name ILIKE '%MASCORT SULLENGER%');

-- OEP Ltd: total ownership = 86,430
UPDATE positions p
SET units = 86430.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- VERSO Capital Establishment: total ownership = 345,721
UPDATE positions p
SET units = 345721.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%VERSO Capital Establishment%';


