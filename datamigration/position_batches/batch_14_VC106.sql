-- Batch 14: VC106
-- 206 position updates

UPDATE positions p
SET units = 7500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Blaine%' AND i.last_name ILIKE '%ROLLINS%');
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurence%' AND i.last_name ILIKE '%CHANG%');
UPDATE positions p
SET units = 5600.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Chang%' AND i.last_name ILIKE '%NGAN%');
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SHEILA and KAMLESH%' AND i.last_name ILIKE '%MADHVANI%');
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%SAMIR%' AND i.last_name ILIKE '%KOHI%');
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sheikh%' AND i.last_name ILIKE '%AL SABAH%');
UPDATE positions p
SET units = 5555.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Han%' AND i.last_name ILIKE '%CHIH-HENG%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rajiv%' AND i.last_name ILIKE '%AGARWALA%');
UPDATE positions p
SET units = 1756.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daphne%' AND i.last_name ILIKE '%CHANDRA%');
UPDATE positions p
SET units = 9167.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Daryl%' AND i.last_name ILIKE '%YONGJIE%');
UPDATE positions p
SET units = 1388.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ekkawat%' AND i.last_name ILIKE '%SAE-JEE%');
UPDATE positions p
SET units = 4448.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Tan%' AND i.last_name ILIKE '%GEOK%');
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DALINGA HOLDING AG%';
UPDATE positions p
SET units = 5025.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matteo%' AND i.last_name ILIKE '%MARTINI%');
UPDATE positions p
SET units = 11904.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%AS ADVISORY DWC-LLC%';
UPDATE positions p
SET units = 1507.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MA GROUP AG%';
UPDATE positions p
SET units = 13698.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KRANA INVESTMENTS PTE. LTD.%';
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Johann%' AND i.last_name ILIKE '%AKERMANN%');
UPDATE positions p
SET units = 2512.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%CABIAN%');
UPDATE positions p
SET units = 2392.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dario%' AND i.last_name ILIKE '%SCIMONE%');
UPDATE positions p
SET units = 8880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OFBR Trust%';
UPDATE positions p
SET units = 9132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Elidon Estate Inc%';
UPDATE positions p
SET units = 1141.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Adam Smith Singapore Pte Ltd%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr Beatrice & Marcel%' AND i.last_name ILIKE '%KNOPF%');
UPDATE positions p
SET units = 11101.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%VOLF Trust%';
UPDATE positions p
SET units = 6500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bahama Global Towers Limited%';
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CAUSE FIRST Holdings Ltd%';
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Heinz & Barbara%' AND i.last_name ILIKE '%WINZ%');
UPDATE positions p
SET units = 2220.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sabrina%' AND i.last_name ILIKE '%WINZ%');
UPDATE positions p
SET units = 2272.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs and Mr%' AND i.last_name ILIKE '%KARKUN%');
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Craig%' AND i.last_name ILIKE '%BROWN%');
UPDATE positions p
SET units = 32631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TRUE INVESTMENTS 4 LLC%';
UPDATE positions p
SET units = 4440.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ROSEN INVEST HOLDINGS Inc%';
UPDATE positions p
SET units = 6733.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs & Mr Subbiah%' AND i.last_name ILIKE '%SUBRAMANIAN%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JIMENEZ TRADING INC%';
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 10526.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 1842.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 5263.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%PANT Investments Inc%';
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 2631.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 1315.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LEE RAND GROUP%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 4252.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Hedgebay Securities LLC%';
UPDATE positions p
SET units = 212585.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%ONC Limited%';
UPDATE positions p
SET units = 12700.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mohammed%' AND i.last_name ILIKE '%AL ABBASI%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Patrick%' AND i.last_name ILIKE '%CORR%');
UPDATE positions p
SET units = 6802.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephen%' AND i.last_name ILIKE '%JORDAN%');
UPDATE positions p
SET units = 15306.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%FigTree Family Office Ltd%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Oliver%' AND i.last_name ILIKE '%WRIGHT%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emile%' AND i.last_name ILIKE '%VAN DEN BOL%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Matthew%' AND i.last_name ILIKE '%HAYCOX%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%ACKERLEY%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Steve%' AND i.last_name ILIKE '%MANNING%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Global Custody & Clearing Limited%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Gregory%' AND i.last_name ILIKE '%BROOKS%');
UPDATE positions p
SET units = 38881.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Innovatech 1%';
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Stephane%' AND i.last_name ILIKE '%DAHAN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jean%' AND i.last_name ILIKE '%DUTIL%');
UPDATE positions p
SET units = 6550.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Barnaby%' AND i.last_name ILIKE '%MOORE%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Sudon Carlop Holdings Limited%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lesli%' AND i.last_name ILIKE '%SCHUTTE%');
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Manraj%' AND i.last_name ILIKE '%SEKHON%');
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%IQEQ (Switzerland) Limited As Trustee of the Raycat Investment Trust%';
UPDATE positions p
SET units = 425.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Serge%' AND i.last_name ILIKE '%RICHARD%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');
UPDATE positions p
SET units = 1332.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERRA Financial & Management Services SA%';
UPDATE positions p
SET units = 7227.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shana%' AND i.last_name ILIKE '%NUSSBERGER%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%JASSQ HOLDING LIMITED%';
UPDATE positions p
SET units = 25000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';
UPDATE positions p
SET units = 7000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%INNOSIGHT VENTURES Pte Ltd%';
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GORILLA PE Inc%';
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CLOUDSAFE HOLDINGS LTD%';
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%HOLDEN%');
UPDATE positions p
SET units = 32195.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 10000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imrat%' AND i.last_name ILIKE '%HAYAT%');
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%BACHELIER%');
UPDATE positions p
SET units = 452.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Talal%' AND i.last_name ILIKE '%PASHA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ashish%' AND i.last_name ILIKE '%KOTHARI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fabien%' AND i.last_name ILIKE '%ROTH%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Fawad%' AND i.last_name ILIKE '%MUKHTAR%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%KABELLA LTD%';
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SOUTH SOUND LTD%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Constantin-Octavian%' AND i.last_name ILIKE '%PATRASCU%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%CINCORIA LIMITED%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hayden%' AND i.last_name ILIKE '%RUSHTON%');
UPDATE positions p
SET units = 5314.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Mrs Nalini Yoga & Mr Aran James%' AND i.last_name ILIKE '%WILLETTS%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Emma Graham-Taylor & Gregory%' AND i.last_name ILIKE '%SOMMERVILLE%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rabin D. and Dolly%' AND i.last_name ILIKE '%LAI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kim%' AND i.last_name ILIKE '%LUND%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%BELGA%');
UPDATE positions p
SET units = 12755.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Ayman%' AND i.last_name ILIKE '%JOMAA%');
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Karthic%' AND i.last_name ILIKE '%JAYARAMAN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Imran%' AND i.last_name ILIKE '%HAKIM%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Kenilworth Ltd%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Adil%' AND i.last_name ILIKE '%KHAWAJA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bharat%' AND i.last_name ILIKE '%JATANIA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Lubna%' AND i.last_name ILIKE '%QUNASH%');
UPDATE positions p
SET units = 198193.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 2674.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 1546.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 1980.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 5291.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 160.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 5502.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 640.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bank SYZ AG%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Limited%';
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Michel%' AND i.last_name ILIKE '%GUERIN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');
UPDATE positions p
SET units = 6377.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Swip Holdings Ltd%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Phaena Advisory Ltd%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bhikhu%' AND i.last_name ILIKE '%PATEL%');
UPDATE positions p
SET units = 31887.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vijaykumar%' AND i.last_name ILIKE '%PATEL%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%POTASSIUM Capital%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Aatif%' AND i.last_name ILIKE '%HASSAN%');
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kevin%' AND i.last_name ILIKE '%WILTSHIRE%');
UPDATE positions p
SET units = 20391.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GTV Partners SA%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%LENN Participations SARL%';
UPDATE positions p
SET units = 19132.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%WEALTH TRAIN LIMITED%';
UPDATE positions p
SET units = 3863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Anke%' AND i.last_name ILIKE '%RICE%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%TERSANE INTERNATIONAL LTD%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Brahma Finance (BVI) Ltd%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%James%' AND i.last_name ILIKE '%HARTSHORN%');
UPDATE positions p
SET units = 14880.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Cyrus%' AND i.last_name ILIKE '%ALAMOUTI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Darius%' AND i.last_name ILIKE '%ALAMOUTI%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kaveh%' AND i.last_name ILIKE '%ALAMOUTI%');
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Caspian Enterprises Limited%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Rensburg Client Nominees Limited A/c CLT%';
UPDATE positions p
SET units = 17006.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%DCMS Holdings Limited%';
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GELIGA LIMITED%';
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%SARASIN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Damien%' AND i.last_name ILIKE '%KRAUSER%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Eric%' AND i.last_name ILIKE '%LE SEIGNEUR%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%REVERY CAPITAL Limited%';
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Maria Christina%' AND i.last_name ILIKE '%CHANDRIS%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Dimitri%' AND i.last_name ILIKE '%CHANDRIS%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Nicki%' AND i.last_name ILIKE '%ASQUITH%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Isabella%' AND i.last_name ILIKE '%CHANDRIS%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Martin%' AND i.last_name ILIKE '%AVETISYAN%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Herve%' AND i.last_name ILIKE '%STEIMES%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%SERRA%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Frederic%' AND i.last_name ILIKE '%SAMAMA%');
UPDATE positions p
SET units = 23870.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Laurent%' AND i.last_name ILIKE '%CUDRE-MAUROUX%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Georges%' AND i.last_name ILIKE '%CYTRON%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Rosario%' AND i.last_name ILIKE '%RIENZO%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Raphael%' AND i.last_name ILIKE '%GHESQUIERES%');
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Guillaume%' AND i.last_name ILIKE '%SAMAMA%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%David%' AND i.last_name ILIKE '%ROSSIER%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%MARSAULT INTERNATIONAL LTD%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Bernard%' AND i.last_name ILIKE '%DUFAURE%');
UPDATE positions p
SET units = 27636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Murat Cem and Mehmet Can%' AND i.last_name ILIKE '%GOKER%');
UPDATE positions p
SET units = 21258.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');
UPDATE positions p
SET units = 25510.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Vasily%' AND i.last_name ILIKE '%SUKHOTIN%');
UPDATE positions p
SET units = 8503.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%RIVA%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%CYROT%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Hossien%' AND i.last_name ILIKE '%JAVID%');
UPDATE positions p
SET units = 850.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kamyar%' AND i.last_name ILIKE '%BADII%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Shaham%' AND i.last_name ILIKE '%SOLOUKI%');
UPDATE positions p
SET units = 1062.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Kian%' AND i.last_name ILIKE '%JAVID%');
UPDATE positions p
SET units = 2125.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Salman%' AND i.last_name ILIKE '%HUSSAIN%');
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Juan%' AND i.last_name ILIKE '%TONELLI BANFI%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%GREENLEAF%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 12279%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34658%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 34924%';
UPDATE positions p
SET units = 10629.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36003%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36749%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 36957%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80738%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80772%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80775%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80776%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80840%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80862%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80873%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80890%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 80910%';
UPDATE positions p
SET units = 4251.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 81022%';
UPDATE positions p
SET units = 42517.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%Banco BTG Pactual S.A. Client 515%';
UPDATE positions p
SET units = 23384.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%RLABS HOLDINGS LTD%';
UPDATE positions p
SET units = 29761.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%OLD HILL INVESTMENT GROUP LLC%';
UPDATE positions p
SET units = 3188.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Samuel%' AND i.last_name ILIKE '%GRANDCHAMP%');
UPDATE positions p
SET units = 4078.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Luiz%' AND i.last_name ILIKE '%FONTES WILLIAMS%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 38827.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 20947.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND i.legal_name ILIKE '%STABLETON (ALTERNATIVE ISSUANCE)%';
UPDATE positions p
SET units = 3636.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC106'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');