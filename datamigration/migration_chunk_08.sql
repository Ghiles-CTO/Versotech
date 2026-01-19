-- VC126
 33 investors, total ownership: 66,254
-- ============================================================

-- CLOUDSAFE HOLDINGS LIMITED: total ownership = 8,880
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%';

-- AS Advisory DWC-LLC: total ownership = 760
UPDATE positions p
SET units = 760.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%AS Advisory DWC-LLC%';

-- Scott FLETCHER: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Anand RATHI: total ownership = 7,706
UPDATE positions p
SET units = 7706.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');

-- Tuygan GOKER: total ownership = 16,120
UPDATE positions p
SET units = 16120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Julien MACHOT: total ownership = 770
UPDATE positions p
SET units = 770.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VERSO MANAGEMENT LTD.: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%VERSO MANAGEMENT LTD.%';

-- BBQ Opportunity Ventures: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BBQ Opportunity Ventures%';

-- OEP Ltd: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- FITAIHI Holdings SARL: total ownership = 890
UPDATE positions p
SET units = 890.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%FITAIHI Holdings SARL%';

-- SC TBC INVEST 3: total ownership = 6,071
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%SC TBC INVEST 3%';

-- ODIN (ANIM X II LP): total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN (ANIM X II LP)%';

-- Serge AURIER: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');

-- John BARROWMAN: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');

-- DRussell Goman RD LLC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';

-- Garson Brandon LEVY: total ownership = 367
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Garson%' AND i.last_name ILIKE '%LEVY%');

-- Mrs Anisha Bansal and Mr Rahul KARKUN: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mrs Anisha Bansal and Mr Rahul%' AND i.last_name ILIKE '%KARKUN%');

-- Mathieu MARIOTTI: total ownership = 1,838
UPDATE positions p
SET units = 1838.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mathieu%' AND i.last_name ILIKE '%MARIOTTI%');

-- Alexandre BARBARANELLI: total ownership = 441
UPDATE positions p
SET units = 441.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Alexandre%' AND i.last_name ILIKE '%BARBARANELLI%');

-- Keir BENBOW: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Amanda RYZOWY: total ownership = 367
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Amanda%' AND i.last_name ILIKE '%RYZOWY%');

-- ALPHA GAIA CAPITAL FZE: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ALPHA GAIA CAPITAL FZE%';

-- Desmond CARBERY: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Desmond%' AND i.last_name ILIKE '%CARBERY%');

-- Odile and Georges Abou MRAD and FENERGI: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Odile and Georges%' AND i.last_name ILIKE '%MRAD and FENERGI%');

-- Georgi GEORGIEV: total ownership = 2,469
UPDATE positions p
SET units = 2469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Georgi%' AND i.last_name ILIKE '%GEORGIEV%');

-- Anatoliy KOGAN: total ownership = 1,111
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anatoliy%' AND i.last_name ILIKE '%KOGAN%');

-- GESTIO CAPITAL LTD: total ownership = 4,320
UPDATE positions p
SET units = 4320.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%GESTIO CAPITAL LTD%';

-- Danielle BURNS: total ownership = 111
UPDATE positions p
SET units = 111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Danielle%' AND i.last_name ILIKE '%BURNS%');

-- LF GROUP SARL: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%LF GROUP SARL%';

-- BSV SPV III LLC: total ownership = 10,700
UPDATE positions p
SET units = 10700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BSV SPV III LLC%';

-- DRussell Goman RD LLC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';

-- ANIM X II LP: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ANIM X II LP%';

-- ODIN: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN%';



-- VC128
 3 investors, total ownership: 357,142
-- ============================================================

-- Julien MACHOT: total ownership = 249,999
UPDATE positions p
SET units = 249999.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- OEP Ltd: total ownership = 71,429
UPDATE positions p
SET units = 71429.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- Dan BAUMSLAG: total ownership = 35,714
UPDATE positions p
SET units = 35714.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');



-- VC130
 4 investors, total ownership: 500,000
-- ============================================================

-- Julien MACHOT: total ownership = 483,748
UPDATE positions p
SET units = 483748.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Tuygan GOKER: total ownership = 12,502
UPDATE positions p
SET units = 12502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Scott LIVINGSTONE: total ownership = 833
UPDATE positions p
SET units = 833.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%LIVINGSTONE%');

-- Daniel BAUMSLAG: total ownership = 2,917
UPDATE positions p
SET units = 2917.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC130'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');



-- VC131
 1 investors, total ownership: 65,000
-- ============================================================

-- Julien MACHOT: total ownership = 65,000
UPDATE positions p
SET units = 65000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC131'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');



-- VC132
 1 investors, total ownership: 27,546
-- ============================================================

-- Julien MACHOT: total ownership = 27,546
UPDATE positions p
SET units = 27546.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC132'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');


