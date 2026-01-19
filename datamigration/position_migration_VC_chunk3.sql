-- VC-series position updates (chunk 3)

-- batch_31_VC130.sql
-- Batch 31: VC130
-- 5 position updates

UPDATE positions p
SET units = 250000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 233748.0
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

-- batch_32_VC131.sql
-- Batch 32: VC131
-- 4 position updates

UPDATE positions p
SET units = 20000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 20000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 12500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 12500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- batch_33_VC132.sql
-- Batch 33: VC132
-- 2 position updates

UPDATE positions p
SET units = 11505.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 16041.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- batch_34_VC133.sql
-- Batch 34: VC133
-- 16 position updates

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
SET units = 369.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 347.0
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

-- batch_35_VC134.sql
-- Batch 35: VC134
-- 5 position updates

UPDATE positions p
SET units = 1900000.0
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
UPDATE positions p
SET units = 30000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC134'
  AND i.legal_name ILIKE '%ISP CH1149139870%';

-- batch_36_VC135.sql
-- Batch 36: VC135
-- 3 position updates

UPDATE positions p
SET units = 400000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 150000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC135'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- batch_37_VC137.sql
-- Batch 37: VC137
-- 2 position updates

UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC137'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- batch_38_VC138.sql
-- Batch 38: VC138
-- 1 position updates

UPDATE positions p
SET units = 20.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC138'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- batch_39_VC140.sql
-- Batch 39: VC140
-- 3 position updates

UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Beatrice and Mr Marcel%' AND i.last_name ILIKE '%KNOPF%');
UPDATE positions p
SET units = 96000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Mrs Liubov and Mr Igor%' AND i.last_name ILIKE '%ZINKEVICH%');
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- batch_40_VC141.sql
-- Batch 40: VC141
-- 2 position updates

UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 75000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC141'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

