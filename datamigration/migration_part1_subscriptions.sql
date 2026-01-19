-- Part 1: Update subscriptions with introducer_id
-- Total unique vehicle-introducer combinations: 27

-- VC102 - 1 investors
UPDATE subscriptions s
SET introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC102'
  AND (UPPER(i.last_name) = 'LF GROUP SARL')
  AND s.introducer_id IS NULL;

-- VC106 - 3 investors
UPDATE subscriptions s
SET introducer_id = 'a2a0b0a1-817a-4039-bcbf-160b84f51567'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'AGARWALA' OR UPPER(i.last_name) = 'ROLLINS' OR UPPER(i.last_name) = 'CHANG')
  AND s.introducer_id IS NULL;

-- VC106 - 79 investors
UPDATE subscriptions s
SET introducer_id = '98fdce26-5a61-486e-a450-8e13dd4cfbf4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'QUNASH' OR UPPER(i.last_name) = 'BELGA' OR UPPER(i.last_name) = 'DAHAN' OR UPPER(i.last_name) = 'FONTES WILLIAMS' OR UPPER(i.last_name) = 'KHAWAJA' OR UPPER(i.last_name) = 'SAMAMA' OR UPPER(i.last_name) = 'DUFAURE' OR UPPER(i.last_name) = 'HASSAN' OR UPPER(i.last_name) = 'TONELLI BANFI' OR UPPER(i.last_name) = 'NGAN' OR UPPER(i.last_name) = 'CYTRON' OR UPPER(i.last_name) = 'SERRA' OR UPPER(i.last_name) = 'RUSHTON' OR UPPER(i.last_name) = 'GUERIN' OR UPPER(i.last_name) = 'GHESQUIERES' OR UPPER(i.last_name) = 'KOHI' OR UPPER(i.last_name) = 'JORDAN' OR UPPER(i.last_name) = 'HOLDEN' OR UPPER(i.last_name) = 'WILLETTS' OR UPPER(i.last_name) = 'SUKHOTIN' OR UPPER(i.last_name) = 'GRAF' OR UPPER(i.last_name) = 'VAN DEN BOL' OR UPPER(i.last_name) = '(ANTON)' OR UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.last_name) = 'ACKERLEY' OR UPPER(i.last_name) = 'EVANS' OR UPPER(i.last_name) = 'SOMMERVILLE' OR UPPER(i.last_name) = 'LUND' OR UPPER(i.last_name) = 'GEOK' OR UPPER(i.last_name) = 'CORR' OR UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.last_name) = 'YONGJIE' OR UPPER(i.last_name) = 'KRAUSER' OR UPPER(i.last_name) = 'BADII' OR UPPER(i.last_name) = 'BROWN' OR UPPER(i.last_name) = 'KARKUN' OR UPPER(i.last_name) = 'RIKHYE' OR UPPER(i.last_name) = 'CHANDRA' OR UPPER(i.last_name) = 'RIENZO' OR UPPER(i.last_name) = 'JATANIA' OR UPPER(i.last_name) = 'DUTIL' OR UPPER(i.last_name) = 'NUSSBERGER' OR UPPER(i.last_name) = 'ALAMOUTI' OR UPPER(i.last_name) = 'SHAH' OR UPPER(i.last_name) = 'JAVID' OR UPPER(i.last_name) = 'LE SEIGNEUR' OR UPPER(i.last_name) = 'HARIA' OR UPPER(i.last_name) = 'HAYAT' OR UPPER(i.last_name) = 'JAYARAMAN' OR UPPER(i.last_name) = 'GOKER' OR UPPER(i.last_name) = 'CHIH-HENG' OR UPPER(i.last_name) = 'SCIMONE' OR UPPER(i.last_name) = 'BROOKS' OR UPPER(i.last_name) = 'SEKHON' OR UPPER(i.last_name) = 'SAE-JEE' OR UPPER(i.last_name) = 'CABIAN' OR UPPER(i.last_name) = 'AL ABBASI' OR UPPER(i.last_name) = 'HAYCOX' OR UPPER(i.last_name) = 'SOLOUKI' OR UPPER(i.last_name) = 'MUKHTAR' OR UPPER(i.last_name) = 'KOTHARI' OR UPPER(i.last_name) = 'MARTINI' OR UPPER(i.last_name) = 'MANNING' OR UPPER(i.last_name) = 'LAI' OR UPPER(i.last_name) = 'ROSSIER' OR UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.last_name) = 'HAKIM' OR UPPER(i.last_name) = 'SAHLI' OR UPPER(i.last_name) = 'WRIGHT' OR UPPER(i.last_name) = 'JOMAA' OR UPPER(i.last_name) = 'PATEL' OR UPPER(i.last_name) = 'PATRASCU' OR UPPER(i.last_name) = 'JOGANI' OR UPPER(i.last_name) = 'HUSSAIN' OR UPPER(i.last_name) = 'SCHUTTE' OR UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.last_name) = 'STEIMES' OR UPPER(i.last_name) = 'SUBRAMANIAN' OR UPPER(i.last_name) = 'CUDRE-MAUROUX')
  AND s.introducer_id IS NULL;

-- VC106 - 1 investors
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (UPPER(i.last_name) = 'KNOPF')
  AND s.introducer_id IS NULL;

-- VC111 - 2 investors
UPDATE subscriptions s
SET introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'ROSEN INVEST HOLDINGS INC' OR UPPER(i.last_name) = 'BRIGHT PHOENIX HOLDINGS LTD')
  AND s.introducer_id IS NULL;

-- VC111 - 1 investors
UPDATE subscriptions s
SET introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'STRUCTURED ISSUANCE LTD')
  AND s.introducer_id IS NULL;

-- VC111 - 4 investors
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'MARKUS' OR UPPER(i.last_name) = 'DALINGA HOLDING AG' OR UPPER(i.last_name) = 'VOLF TRUST' OR UPPER(i.last_name) = 'TARTRIFUGE SA')
  AND s.introducer_id IS NULL;

-- VC111 - 4 investors
UPDATE subscriptions s
SET introducer_id = '0aebf77c-47a3-4011-abd4-74ee3772d78e'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'BRUNO' OR UPPER(i.last_name) = 'FINALMA SUISSE SA' OR UPPER(i.last_name) = 'MONFIN LTD' OR UPPER(i.last_name) = 'ATTILIO')
  AND s.introducer_id IS NULL;

-- VC111 - 1 investors
UPDATE subscriptions s
SET introducer_id = '8964a91a-eb92-4f65-aa47-750c417cd499'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'BENSKYLA AG')
  AND s.introducer_id IS NULL;

-- VC111 - 2 investors
UPDATE subscriptions s
SET introducer_id = 'e0e79380-89ef-457b-a45c-0c9bef2cbf01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'WYMO FINANCE LIMITED' OR UPPER(i.last_name) = 'HASSBRO INVESTMENTS LIMITED')
  AND s.introducer_id IS NULL;

-- VC111 - 1 investors
UPDATE subscriptions s
SET introducer_id = '4d17ec21-5eeb-4957-9a50-992f731ebd56'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC111'
  AND (UPPER(i.last_name) = 'ZANDERA (FINCO) LIMITED')
  AND s.introducer_id IS NULL;

-- VC112 - 1 investors
UPDATE subscriptions s
SET introducer_id = '5a765445-bee7-4716-96f6-e2e2ca0329c7'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC112'
  AND (UPPER(i.last_name) = 'ANTONIO ALBERTO')
  AND s.introducer_id IS NULL;

-- VC113 - 9 investors
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'WINZ' OR UPPER(i.last_name) = 'KNOPF' OR UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.last_name) = 'DE' OR UPPER(i.last_name) = 'ALGAR' OR UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.last_name) = 'GORYAINOV' OR UPPER(i.last_name) = 'GRAF')
  AND s.introducer_id IS NULL;

-- VC113 - 3 investors
UPDATE subscriptions s
SET introducer_id = '55b67690-c83d-4406-a2b4-935032d22739'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.last_name) = 'TOMMEY' OR UPPER(i.last_name) = 'HAYWARD')
  AND s.introducer_id IS NULL;

-- VC113 - 4 investors
UPDATE subscriptions s
SET introducer_id = '736a31b2-b8a6-4a0e-8abe-ed986014d0c4'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'COMEL' OR UPPER(i.last_name) = 'EL MOGHAZI' OR UPPER(i.last_name) = 'MERIDA' OR UPPER(i.last_name) = 'ULDRY')
  AND s.introducer_id IS NULL;

-- VC113 - 2 investors
UPDATE subscriptions s
SET introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN' OR UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA')
  AND s.introducer_id IS NULL;

-- VC113 - 1 investors
UPDATE subscriptions s
SET introducer_id = 'ae4d8764-3c68-4d34-beca-9f4fec4c71a9'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MOHAMMED')
  AND s.introducer_id IS NULL;

-- VC113 - 2 investors
UPDATE subscriptions s
SET introducer_id = '6147711e-310e-45ec-8892-ac072e25c3b0'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (UPPER(i.last_name) = 'MEYER' OR UPPER(i.last_name) = 'SHAH')
  AND s.introducer_id IS NULL;

-- VC118 - 2 investors
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC118'
  AND (UPPER(i.last_name) = 'VOLF TRUST' OR UPPER(i.last_name) = 'SIGNET LOGISTICS LTD')
  AND s.introducer_id IS NULL;

-- VC125 - 2 investors
UPDATE subscriptions s
SET introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC125'
  AND (UPPER(i.last_name) = 'DALINGA HOLDING AG' OR UPPER(i.last_name) = 'MA GROUP AG')
  AND s.introducer_id IS NULL;

-- VC126 - 1 investors
UPDATE subscriptions s
SET introducer_id = '19b4ce66-494a-41e0-8221-14b230d0c5f2'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'CLOUDSAFE HOLDINGS LIMITED')
  AND s.introducer_id IS NULL;

-- VC126 - 4 investors
UPDATE subscriptions s
SET introducer_id = '6c63f6f1-d916-4275-8ea8-b951e333bc64'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'SC TBC INVEST 3' OR UPPER(i.last_name) = 'ODIN (ANIM X II LP)' OR UPPER(i.last_name) = 'DRUSSELL GOMAN RD LLC' OR UPPER(i.last_name) = 'BRANDON')
  AND s.introducer_id IS NULL;

-- VC126 - 2 investors
UPDATE subscriptions s
SET introducer_id = 'bc23b7c7-4253-40c2-889b-97a5044c23d5'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'ABOU' OR UPPER(i.last_name) = 'ALPHA GAIA CAPITAL FZE')
  AND s.introducer_id IS NULL;

-- VC126 - 1 investors
UPDATE subscriptions s
SET introducer_id = '41974010-e41d-40a6-9cbf-725618e7e00c'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'LF GROUP SARL')
  AND s.introducer_id IS NULL;

-- VC126 - 3 investors
UPDATE subscriptions s
SET introducer_id = 'b661243f-e6b4-41f1-b239-de4b197a689a'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC126'
  AND (UPPER(i.last_name) = 'AS ADVISORY DWC-LLC' OR UPPER(i.last_name) = 'GESTIO CAPITAL LTD' OR UPPER(i.last_name) = 'OEP LTD')
  AND s.introducer_id IS NULL;

-- VC133 - 6 investors
UPDATE subscriptions s
SET introducer_id = 'faace30d-09ed-4974-a609-38dba914ce01'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = 'BAND CAPITAL LIMITED' OR UPPER(i.last_name) = 'SINGH' OR UPPER(i.last_name) = 'JASSQ HOLDING LIMITED' OR UPPER(i.last_name) = '777 WALNUT LLC' OR UPPER(i.last_name) = 'CARTA INVESTMENTS LLC' OR UPPER(i.last_name) = 'RICHARD')
  AND s.introducer_id IS NULL;

-- VC133 - 1 investors
UPDATE subscriptions s
SET introducer_id = '1e77ff44-332a-4939-83f9-acf96c851f72'
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC133'
  AND (UPPER(i.last_name) = 'ZANDERA (HOLDCO) LTD')
  AND s.introducer_id IS NULL;
