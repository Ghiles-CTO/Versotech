-- VC133
 15 investors, total ownership: 2,249
-- ============================================================

-- Charles DE BAVIER: total ownership = 66
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- JASSQ HOLDING LIMITED: total ownership = 200
UPDATE positions p
SET units = 200.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';

-- CARTA INVESTMENTS LLC: total ownership = 66
UPDATE positions p
SET units = 66.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%CARTA INVESTMENTS LLC%';

-- Sahejman Singh KAHLON: total ownership = 33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Sahejman%' AND i.last_name ILIKE '%KAHLON%');

-- 777 WALNUT LLC: total ownership = 33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%777 WALNUT LLC%';

-- Keir Richard BENBOW: total ownership = 35
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Marco JERRENTRUP: total ownership = 35
UPDATE positions p
SET units = 35.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');

-- ZANDERA (Holdco) Ltd: total ownership = 645
UPDATE positions p
SET units = 645.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%ZANDERA (Holdco) Ltd%';

-- Band Capital Limited: total ownership = 358
UPDATE positions p
SET units = 358.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%Band Capital Limited%';

-- Jeremy LOWY: total ownership = 33
UPDATE positions p
SET units = 33.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Jeremy%' AND i.last_name ILIKE '%LOWY%');

-- Tuygan GOKER: total ownership = 716
UPDATE positions p
SET units = 716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- VERSO HOLDINGS: total ownership = 4
UPDATE positions p
SET units = 4.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND i.legal_name ILIKE '%VERSO HOLDINGS%';

-- Tobias JOERN: total ownership = 6
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tobias%' AND i.last_name ILIKE '%JOERN%');

-- René ROSSDEUTSCHER: total ownership = 13
UPDATE positions p
SET units = 13.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%René%' AND i.last_name ILIKE '%ROSSDEUTSCHER%');

-- Ellen STAUDENMAYER: total ownership = 6
UPDATE positions p
SET units = 6.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Ellen%' AND i.last_name ILIKE '%STAUDENMAYER%');



-- VC134
 4 investors, total ownership: 2,536,332
-- ============================================================

-- ISP CH1149139870: total ownership = 1,930,000
UPDATE positions p
SET units = 1930000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';

-- PROGETTO UNO SPA: total ownership = 501,101
UPDATE positions p
SET units = 501101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%PROGETTO UNO SPA%';

-- Stefano CAPRA: total ownership = 100,220
UPDATE positions p
SET units = 100220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Stefano%' AND i.last_name ILIKE '%CAPRA%');

-- Julien MACHOT: total ownership = 5,011
UPDATE positions p
SET units = 5011.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC135
 2 investors, total ownership: 550,000
-- ============================================================

-- Dan BAUMSLAG: total ownership = 400,000
UPDATE positions p
SET units = 400000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');

-- Julien MACHOT: total ownership = 150,000
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC137
 1 investors, total ownership: 50,000
-- ============================================================

-- Julien MACHOT: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC138
 1 investors, total ownership: 20
-- ============================================================

-- Scott FLETCHER: total ownership = 20
UPDATE positions p
SET units = 20.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC138'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');



-- VC140
 3 investors, total ownership: 246,000
-- ============================================================

-- Mrs Beatrice and Mr Marcel KNOPF: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Beatrice and Mr Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Mrs Liubov and Mr Igor ZINKEVICH: total ownership = 96,000
UPDATE positions p
SET units = 96000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Liubov and Mr Igor%' AND i.last_name ILIKE '%ZINKEVICH%');

-- Julien MACHOT: total ownership = 50,000
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC141
 2 investors, total ownership: 150,000
-- ============================================================

-- Julien MACHOT: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Serge AURIER: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');



-- VC143
 3 investors, total ownership: 175,000
-- ============================================================

-- Julien MACHOT: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Deyan D. MIHOV: total ownership = 75,000
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- LF GROUP SARL: total ownership = 100,000
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC143'
  AND i.legal_name ILIKE '%LF GROUP SARL%';


-- ============================================================
-- SUMMARY: 519 position updates
-- ============================================================

COMMIT;