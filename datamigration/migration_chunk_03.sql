-- VC106
 184 investors, total ownership: 1,953,065
-- ============================================================

-- Blaine ROLLINS: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');

-- Laurence CHANG: total ownership = 7,500
UPDATE positions p
SET units = 7500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');

-- Chang Yong NGAN: total ownership = 5,600
UPDATE positions p
SET units = 5600.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');

-- SHEILA and KAMLESH MADHVANI: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SHEILA and KAMLESH%' AND i.last_name ILIKE '%MADHVANI%');

-- SAMIR KOHI: total ownership = 5,000
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SAMIR%' AND i.last_name ILIKE '%KOHI%');

-- Sheikh Yousef AL SABAH: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');

-- Han CHIH-HENG: total ownership = 5,555
UPDATE positions p
SET units = 5555.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Han%' AND i.last_name ILIKE '%CHIH-HENG%');

-- Rajiv AGARWALA: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rajiv%' AND i.last_name ILIKE '%AGARWALA%');

-- Daphne Marie CHANDRA: total ownership = 1,756
UPDATE positions p
SET units = 1756.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daphne%' AND i.last_name ILIKE '%CHANDRA%');

-- Daryl PAK YONGJIE: total ownership = 9,167
UPDATE positions p
SET units = 9167.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');

-- Ekkawat SAE-JEE: total ownership = 1,388
UPDATE positions p
SET units = 1388.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ekkawat%' AND i.last_name ILIKE '%SAE-JEE%');

-- Tan Sor GEOK: total ownership = 4,448
UPDATE positions p
SET units = 4448.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Tan%' AND i.last_name ILIKE '%GEOK%');

-- DALINGA HOLDING AG: total ownership = 2,512
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';

-- Matteo Massimo MARTINI: total ownership = 5,025
UPDATE positions p
SET units = 5025.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matteo%' AND i.last_name ILIKE '%MARTINI%');

-- AS ADVISORY DWC-LLC: total ownership = 11,904
UPDATE positions p
SET units = 11904.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';

-- MA GROUP AG: total ownership = 1,507
UPDATE positions p
SET units = 1507.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MA GROUP AG%';

-- KRANA INVESTMENTS PTE. LTD.: total ownership = 13,698
UPDATE positions p
SET units = 13698.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KRANA INVESTMENTS PTE. LTD.%';

-- Johann Markus AKERMANN: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');

-- Sandra KOHLER CABIAN: total ownership = 2,512
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%CABIAN%');

-- Dario SCIMONE: total ownership = 2,392
UPDATE positions p
SET units = 2392.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dario%' AND i.last_name ILIKE '%SCIMONE%');

-- OFBR Trust: total ownership = 8,880
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OFBR Trust%';

-- Elidon Estate Inc: total ownership = 9,132
UPDATE positions p
SET units = 9132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Elidon Estate Inc%';

-- Adam Smith Singapore Pte Ltd: total ownership = 1,141
UPDATE positions p
SET units = 1141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Adam Smith Singapore Pte Ltd%';

-- Julien MACHOT: total ownership = 95,605
UPDATE positions p
SET units = 95605.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Mrs and Mr Beatrice & Marcel KNOPF: total ownership = 2,220
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr Beatrice & Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- VOLF Trust: total ownership = 11,101
UPDATE positions p
SET units = 11101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%VOLF Trust%';

-- Bahama Global Towers Limited: total ownership = 6,500
UPDATE positions p
SET units = 6500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bahama Global Towers Limited%';

-- CAUSE FIRST Holdings Ltd: total ownership = 4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CAUSE FIRST Holdings Ltd%';

-- Heinz & Barbara WINZ: total ownership = 4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Heinz & Barbara%' AND i.last_name ILIKE '%WINZ%');

-- Sabrina WINZ: total ownership = 2,220
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sabrina%' AND i.last_name ILIKE '%WINZ%');

-- Mrs and Mr KARKUN: total ownership = 2,272
UPDATE positions p
SET units = 2272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr%' AND i.last_name ILIKE '%KARKUN%');

-- Craig BROWN: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Craig%' AND i.last_name ILIKE '%BROWN%');

-- TRUE INVESTMENTS 4 LLC: total ownership = 32,631
UPDATE positions p
SET units = 32631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TRUE INVESTMENTS 4 LLC%';

-- ROSEN INVEST HOLDINGS Inc: total ownership = 4,440
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS Inc%';

-- Mrs & Mr Subbiah SUBRAMANIAN: total ownership = 6,733
UPDATE positions p
SET units = 6733.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs & Mr Subbiah%' AND i.last_name ILIKE '%SUBRAMANIAN%');

-- JIMENEZ TRADING INC: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JIMENEZ TRADING INC%';

-- LEE RAND GROUP: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 1,315
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 10,526
UPDATE positions p
SET units = 10526.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 1,842
UPDATE positions p
SET units = 1842.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- PANT Investments Inc: total ownership = 5,263
UPDATE positions p
SET units = 5263.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%PANT Investments Inc%';

-- LEE RAND GROUP: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 2,631
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- LEE RAND GROUP: total ownership = 1,315
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';

-- Hedgebay Securities LLC: total ownership = 4,252
UPDATE positions p
SET units = 4252.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- Hedgebay Securities LLC: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';

-- ONC Limited: total ownership = 212,585
UPDATE positions p
SET units = 212585.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ONC Limited%';

-- Mohammed Abdulaziz AL ABBASI: total ownership = 12,700
UPDATE positions p
SET units = 12700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%AL ABBASI%');

-- Patrick CORR: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%CORR%');

-- Stephen JORDAN: total ownership = 6,802
UPDATE positions p
SET units = 6802.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephen%' AND i.last_name ILIKE '%JORDAN%');

-- FigTree Family Office Ltd: total ownership = 15,306
UPDATE positions p
SET units = 15306.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%FigTree Family Office Ltd%';

-- Oliver WRIGHT: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Oliver%' AND i.last_name ILIKE '%WRIGHT%');

-- Emile VAN DEN BOL: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emile%' AND i.last_name ILIKE '%VAN DEN BOL%');

-- Mark MATTHEWS: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Matthew HAYCOX: total ownership = 3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matthew%' AND i.last_name ILIKE '%HAYCOX%');

-- John ACKERLEY: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%ACKERLEY%');

-- Steve J MANNING: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Steve%' AND i.last_name ILIKE '%MANNING%');

-- Global Custody & Clearing Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Global Custody & Clearing Limited%';

-- Gregory BROOKS: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Gregory%' AND i.last_name ILIKE '%BROOKS%');

-- Innovatech 1: total ownership = 38,881
UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Innovatech 1%';

-- Stephane DAHAN: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');

-- Jean DUTIL: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jean%' AND i.last_name ILIKE '%DUTIL%');

-- Barnaby John MOORE: total ownership = 6,550
UPDATE positions p
SET units = 6550.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Barnaby%' AND i.last_name ILIKE '%MOORE%');

-- Sudon Carlop Holdings Limited: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Sudon Carlop Holdings Limited%';

-- Lesli Ann SCHUTTE: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lesli%' AND i.last_name ILIKE '%SCHUTTE%');

-- Manraj Singh SEKHON: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');

-- IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust%';

-- Serge RICHARD: total ownership = 425
UPDATE positions p
SET units = 425.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%RICHARD%');

-- Erich GRAF: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- TERRA Financial & Management Services SA: total ownership = 1,332
UPDATE positions p
SET units = 1332.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';

-- Shana NUSSBERGER: total ownership = 7,227
UPDATE positions p
SET units = 7227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shana%' AND i.last_name ILIKE '%NUSSBERGER%');

-- JASSQ HOLDING LIMITED: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';

-- INNOSIGHT VENTURES Pte Ltd: total ownership = 32,000
UPDATE positions p
SET units = 32000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';

-- GORILLA PE Inc: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GORILLA PE Inc%';

-- CLOUDSAFE HOLDINGS LTD: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%';

-- David HOLDEN: total ownership = 6,377
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');

-- Imrat HAYAT: total ownership = 10,000
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imrat%' AND i.last_name ILIKE '%HAYAT%');

-- David BACHELIER: total ownership = 5,314
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%BACHELIER%');

-- Talal Chamsi PASHA: total ownership = 452
UPDATE positions p
SET units = 452.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%PASHA%');

-- Ashish KOTHARI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ashish%' AND i.last_name ILIKE '%KOTHARI%');

-- Fabien ROTH: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fabien%' AND i.last_name ILIKE '%ROTH%');

-- Fawad MUKHTAR: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fawad%' AND i.last_name ILIKE '%MUKHTAR%');

-- KABELLA LTD: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KABELLA LTD%';

-- SOUTH SOUND LTD: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SOUTH SOUND LTD%';

-- Constantin-Octavian PATRASCU: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Constantin-Octavian%' AND i.last_name ILIKE '%PATRASCU%');

-- Mayuriben Chetan Kumar JOGANI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');

-- CINCORIA LIMITED: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CINCORIA LIMITED%';

-- Hayden RUSHTON: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hayden%' AND i.last_name ILIKE '%RUSHTON%');

-- Mrs Nalini Yoga & Mr Aran James WILLETTS: total ownership = 5,314
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs Nalini Yoga & Mr Aran James%' AND i.last_name ILIKE '%WILLETTS%');

-- Emma Graham-Taylor & Gregory SOMMERVILLE: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emma Graham-Taylor & Gregory%' AND i.last_name ILIKE '%SOMMERVILLE%');

-- Rabin D. and Dolly LAI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rabin D. and Dolly%' AND i.last_name ILIKE '%LAI%');

-- Kim LUND: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kim%' AND i.last_name ILIKE '%LUND%');

-- Ivan BELGA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%BELGA%');

-- Ayman JOMAA: total ownership = 12,755
UPDATE positions p
SET units = 12755.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ayman%' AND i.last_name ILIKE '%JOMAA%');

-- Karthic JAYARAMAN: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Karthic%' AND i.last_name ILIKE '%JAYARAMAN%');

-- Imran HAKIM: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imran%' AND i.last_name ILIKE '%HAKIM%');

-- Kenilworth Ltd: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Kenilworth Ltd%';

-- Adil Arshed KHAWAJA: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Adil%' AND i.last_name ILIKE '%KHAWAJA%');

-- Bharat Kumar JATANIA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bharat%' AND i.last_name ILIKE '%JATANIA%');

-- Lubna M. A. QUNASH: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lubna%' AND i.last_name ILIKE '%QUNASH%');

-- Bank SYZ AG: total ownership = 215,986
UPDATE positions p
SET units = 215986.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';

-- Damien KRAUSER: total ownership = 6,376
UPDATE positions p
SET units = 6376.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');

-- Bright Phoenix Holdings Limited: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Limited%';

-- Michel Louis GUERIN: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Michel%' AND i.last_name ILIKE '%GUERIN%');

-- Eric Pascal LE SEIGNEUR: total ownership = 8,502
UPDATE positions p
SET units = 8502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');

-- Swip Holdings Ltd: total ownership = 6,377
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Swip Holdings Ltd%';

-- Phaena Advisory Ltd: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Phaena Advisory Ltd%';

-- Bhikhu C. K. PATEL: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bhikhu%' AND i.last_name ILIKE '%PATEL%');

-- Vijaykumar C. K. PATEL: total ownership = 31,887
UPDATE positions p
SET units = 31887.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vijaykumar%' AND i.last_name ILIKE '%PATEL%');

-- POTASSIUM Capital: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%POTASSIUM Capital%';

-- Aatif N. HASSAN: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Aatif%' AND i.last_name ILIKE '%HASSAN%');

-- Kevin FOSTER WILTSHIRE: total ownership = 3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kevin%' AND i.last_name ILIKE '%WILTSHIRE%');

-- GTV Partners SA: total ownership = 20,391
UPDATE positions p
SET units = 20391.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GTV Partners SA%';

-- LENN Participations SARL: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LENN Participations SARL%';

-- WEALTH TRAIN LIMITED: total ownership = 19,132
UPDATE positions p
SET units = 19132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%WEALTH TRAIN LIMITED%';

-- Anke Skoludek RICE: total ownership = 3,863
UPDATE positions p
SET units = 3863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');

-- TERSANE INTERNATIONAL LTD: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERSANE INTERNATIONAL LTD%';

-- Brahma Finance (BVI) Ltd: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Brahma Finance (BVI) Ltd%';

-- James A. HARTSHORN: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%HARTSHORN%');

-- Murat Cem and Mehmet Can GOKER: total ownership = 42,516
UPDATE positions p
SET units = 42516.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');

-- Cyrus ALAMOUTI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Cyrus%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Darius ALAMOUTI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Darius%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Kaveh ALAMOUTI: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kaveh%' AND i.last_name ILIKE '%ALAMOUTI%');

-- Caspian Enterprises Limited: total ownership = 42,517
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Caspian Enterprises Limited%';

-- Rensburg Client Nominees Limited A/c CLT: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Rensburg Client Nominees Limited A/c CLT%';

-- DCMS Holdings Limited: total ownership = 17,006
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DCMS Holdings Limited%';

-- GELIGA LIMITED: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GELIGA LIMITED%';

-- Eric SARASIN: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');

-- Scott FLETCHER: total ownership = 42,516
UPDATE positions p
SET units = 42516.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- REVERY CAPITAL Limited: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%REVERY CAPITAL Limited%';

-- Sandra KOHLER CABIAN: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Maria Christina CHANDRIS: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Maria Christina%' AND i.last_name ILIKE '%CHANDRIS%');

-- Dimitri CHANDRIS: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dimitri%' AND i.last_name ILIKE '%CHANDRIS%');

-- Nicki ASQUITH: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Nicki%' AND i.last_name ILIKE '%ASQUITH%');

-- Isabella CHANDRIS: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Isabella%' AND i.last_name ILIKE '%CHANDRIS%');

-- Martin AVETISYAN: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Martin%' AND i.last_name ILIKE '%AVETISYAN%');

-- Herve STEIMES: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Herve%' AND i.last_name ILIKE '%STEIMES%');

-- Julien SERRA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%SERRA%');

-- Frederic SAMAMA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Frederic%' AND i.last_name ILIKE '%SAMAMA%');

-- Denis MATTHEY: total ownership = 23,870
UPDATE positions p
SET units = 23870.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST: total ownership = 21,258
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%';

-- Laurent CUDRE-MAUROUX: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CUDRE-MAUROUX%');

-- Georges Sylvain CYTRON: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Georges%' AND i.last_name ILIKE '%CYTRON%');

-- Rosario RIENZO: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rosario%' AND i.last_name ILIKE '%RIENZO%');

-- Raphael GHESQUIERES: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Raphael%' AND i.last_name ILIKE '%GHESQUIERES%');

-- Guillaume SAMAMA: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Guillaume%' AND i.last_name ILIKE '%SAMAMA%');

-- David Jean ROSSIER: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%ROSSIER%');

-- MARSAULT INTERNATIONAL LTD: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%';

-- Bernard Henri DUFAURE: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bernard%' AND i.last_name ILIKE '%DUFAURE%');

-- Vasily SUKHOTIN: total ownership = 25,510
UPDATE positions p
SET units = 25510.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vasily%' AND i.last_name ILIKE '%SUKHOTIN%');

-- Charles DE BAVIER: total ownership = 8,503
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- Charles RIVA: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%RIVA%');

-- Jeremie CYROT: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%CYROT%');

-- Hossien Hakimi JAVID: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hossien%' AND i.last_name ILIKE '%JAVID%');

-- Kamyar BADII: total ownership = 850
UPDATE positions p
SET units = 850.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kamyar%' AND i.last_name ILIKE '%BADII%');

-- Shaham SOLOUKI: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shaham%' AND i.last_name ILIKE '%SOLOUKI%');

-- Kian Mohammad Hakimi JAVID: total ownership = 1,062
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kian%' AND i.last_name ILIKE '%JAVID%');

-- Salman Raza HUSSAIN: total ownership = 2,125
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Salman%' AND i.last_name ILIKE '%HUSSAIN%');

-- Juan TONELLI BANFI: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Juan%' AND i.last_name ILIKE '%TONELLI BANFI%');

-- GREENLEAF: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GREENLEAF%';

-- Banco BTG Pactual S.A. Client 12279: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%';

-- Banco BTG Pactual S.A. Client 34658: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%';

-- Banco BTG Pactual S.A. Client 34924: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%';

-- Banco BTG Pactual S.A. Client 36003: total ownership = 10,629
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%';

-- Banco BTG Pactual S.A. Client 36749: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%';

-- Banco BTG Pactual S.A. Client 36957: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%';

-- Banco BTG Pactual S.A. Client 80738: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%';

-- Banco BTG Pactual S.A. Client 80772: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%';

-- Banco BTG Pactual S.A. Client 80775: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%';

-- Banco BTG Pactual S.A. Client 80776: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%';

-- Banco BTG Pactual S.A. Client 80840: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%';

-- Banco BTG Pactual S.A. Client 80862: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%';

-- Banco BTG Pactual S.A. Client 80873: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%';

-- Banco BTG Pactual S.A. Client 80890: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%';

-- Banco BTG Pactual S.A. Client 80910: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%';

-- Banco BTG Pactual S.A. Client 81022: total ownership = 4,251
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%';

-- Banco BTG Pactual S.A. Client 515: total ownership = 42,517
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%';

-- RLABS HOLDINGS LTD: total ownership = 23,384
UPDATE positions p
SET units = 23384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%RLABS HOLDINGS LTD%';

-- OLD HILL INVESTMENT GROUP LLC: total ownership = 29,761
UPDATE positions p
SET units = 29761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OLD HILL INVESTMENT GROUP LLC%';

-- Samuel GRANDCHAMP: total ownership = 3,188
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Samuel%' AND i.last_name ILIKE '%GRANDCHAMP%');

-- Luiz Eduardo FONTES WILLIAMS: total ownership = 4,078
UPDATE positions p
SET units = 4078.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Luiz%' AND i.last_name ILIKE '%FONTES WILLIAMS%');

-- STABLETON (ALTERNATIVE ISSUANCE): total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%STABLETON (ALTERNATIVE ISSUANCE)%';


