-- VC123: 1 updates
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC123'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- VC124: 8 updates
UPDATE positions p
SET units = 274636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%JASSQ Holding Limited%';
UPDATE positions p
SET units = 4125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 1749235.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 288716.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 822.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
UPDATE positions p
SET units = 59963.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND (i.first_name ILIKE '%Christine%' AND i.last_name ILIKE '%MASCORT SULLENGER%');
UPDATE positions p
SET units = 86430.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 345721.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC124'
  AND i.legal_name ILIKE '%VERSO Capital Establishment%';

-- VC125: 28 updates
UPDATE positions p
SET units = 2102.0
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
SET units = 761.0
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
SET units = 603.0
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
SET units = 1912.0
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
SET units = 169.0
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
SET units = 564.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND i.legal_name ILIKE '%LF GROUP SARL%';

-- VC126: 33 updates
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LIMITED%';
UPDATE positions p
SET units = 760.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%AS Advisory DWC-LLC%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 7706.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anand%' AND i.last_name ILIKE '%RATHI%');
UPDATE positions p
SET units = 16120.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 770.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%VERSO MANAGEMENT LTD.%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BBQ Opportunity Ventures%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 890.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%FITAIHI Holdings SARL%';
UPDATE positions p
SET units = 6071.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%SC TBC INVEST 3%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN (ANIM X II LP)%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%AURIER%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Garson%' AND i.last_name ILIKE '%LEVY%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mrs Anisha Bansal and Mr Rahul%' AND i.last_name ILIKE '%KARKUN%');
UPDATE positions p
SET units = 1838.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Mathieu%' AND i.last_name ILIKE '%MARIOTTI%');
UPDATE positions p
SET units = 441.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Alexandre%' AND i.last_name ILIKE '%BARBARANELLI%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');
UPDATE positions p
SET units = 367.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Amanda%' AND i.last_name ILIKE '%RYZOWY%');
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ALPHA GAIA CAPITAL FZE%';
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Desmond%' AND i.last_name ILIKE '%CARBERY%');
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Odile and Georges%' AND i.last_name ILIKE '%MRAD and FENERGI%');
UPDATE positions p
SET units = 2469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Georgi%' AND i.last_name ILIKE '%GEORGIEV%');
UPDATE positions p
SET units = 1111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Anatoliy%' AND i.last_name ILIKE '%KOGAN%');
UPDATE positions p
SET units = 4320.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%GESTIO CAPITAL LTD%';
UPDATE positions p
SET units = 111.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (i.first_name ILIKE '%Danielle%' AND i.last_name ILIKE '%BURNS%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%LF GROUP SARL%';
UPDATE positions p
SET units = 10700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%BSV SPV III LLC%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%DRussell Goman RD LLC%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ANIM X II LP%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND i.legal_name ILIKE '%ODIN%';

-- VC128: 3 updates
UPDATE positions p
SET units = 249999.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 71429.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND i.legal_name ILIKE '%OEP Ltd%';
UPDATE positions p
SET units = 35714.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC128'
  AND (i.first_name ILIKE '%Dan%' AND i.last_name ILIKE '%BAUMSLAG%');
