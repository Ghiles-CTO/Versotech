-- VC113
 64 investors, total ownership: 879,091
-- ============================================================

-- Julien MACHOT: total ownership = 283,952
UPDATE positions p
SET units = 283952.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Julien%' AND i.last_name ILIKE '%MACHOT%');

-- Barbara and Heinz WINZ: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Barbara and Heinz%' AND i.last_name ILIKE '%WINZ%');

-- Sandra KOHLER CABIAN: total ownership = 2,795
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sandra%' AND i.last_name ILIKE '%KOHLER CABIAN%');

-- Markus AKERMANN: total ownership = 2,795
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Markus%' AND i.last_name ILIKE '%AKERMANN%');

-- Dalinga AG: total ownership = 6,149
UPDATE positions p
SET units = 6149.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Dalinga AG%';

-- Liudmila Romanova and Alexey ROMANOV: total ownership = 14,907
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liudmila Romanova and Alexey%' AND i.last_name ILIKE '%ROMANOV%');

-- IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST: total ownership = 14,907
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%';

-- Andrey GORYAINOV: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrey%' AND i.last_name ILIKE '%GORYAINOV%');

-- Liubov and Igor ZINKEVICH: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Liubov and Igor%' AND i.last_name ILIKE '%ZINKEVICH%');

-- Sheila and Kamlesh MADHVANI: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheila and Kamlesh%' AND i.last_name ILIKE '%MADHVANI%');

-- Rosen Invest Holdings Inc: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Rosen Invest Holdings Inc%';

-- Zandera (Finco) Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Finco) Limited%';

-- Mark HAYWARD: total ownership = 3,250
UPDATE positions p
SET units = 3250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%HAYWARD%');

-- Beatrice and Marcel KNOPF: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Beatrice and Marcel%' AND i.last_name ILIKE '%KNOPF%');

-- Scott Ikott TOMMEY: total ownership = 3,750
UPDATE positions p
SET units = 3750.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%TOMMEY%');

-- Gershon KOH: total ownership = 7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gershon%' AND i.last_name ILIKE '%KOH%');

-- Signet Logistics Ltd: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Signet Logistics Ltd%';

-- Erich GRAF: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erich%' AND i.last_name ILIKE '%GRAF%');

-- Shrai and Aparna MADHVANI: total ownership = 2,500
UPDATE positions p
SET units = 2500.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Shrai and Aparna%' AND i.last_name ILIKE '%MADHVANI%');

-- Ivan DE: total ownership = 1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Ivan%' AND i.last_name ILIKE '%DE%');

-- Bright Phoenix Holdings Ltd: total ownership = 3,773
UPDATE positions p
SET units = 3773.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Bright Phoenix Holdings Ltd%';

-- TEKAPO Group Limited: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%TEKAPO Group Limited%';

-- Philip ALGAR: total ownership = 1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Philip%' AND i.last_name ILIKE '%ALGAR%');

-- Sebastian MERIDA: total ownership = 1,118
UPDATE positions p
SET units = 1118.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sebastian%' AND i.last_name ILIKE '%MERIDA%');

-- EMPIRE GROUP Limited: total ownership = 7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%EMPIRE GROUP Limited%';

-- Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN: total ownership = 3,913
UPDATE positions p
SET units = 3913.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Nilakantan & Mr Subbiah%' AND i.last_name ILIKE '%MAHESWARI & SUBRAMANIAN%');

-- Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA: total ownership = 4,099
UPDATE positions p
SET units = 4099.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mrs Rosario Teresa & Mr Deepak%' AND i.last_name ILIKE '%HIQUIANA-TANEJA & TANEJA%');

-- SAFE: total ownership = 9,317
UPDATE positions p
SET units = 9317.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SAFE%';

-- FRALIS SPF: total ownership = 33,249
UPDATE positions p
SET units = 33249.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%FRALIS SPF%';

-- SUMMIT INVESTMENT HOLDINGS LLC: total ownership = 11,180
UPDATE positions p
SET units = 11180.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SUMMIT INVESTMENT HOLDINGS LLC%';

-- NEWBRIDGE FINANCE SPF: total ownership = 104,355
UPDATE positions p
SET units = 104355.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%NEWBRIDGE FINANCE SPF%';

-- Mayuriben Chetan K. JOGANI: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mayuriben%' AND i.last_name ILIKE '%JOGANI%');

-- Charles DE BAVIER: total ownership = 7,453
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Charles%' AND i.last_name ILIKE '%DE BAVIER%');

-- Erwan TAROUILLY: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Erwan%' AND i.last_name ILIKE '%TAROUILLY%');

-- Thierry ULDRY: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Thierry%' AND i.last_name ILIKE '%ULDRY%');

-- Scott FLETCHER: total ownership = 18,634
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Scott%' AND i.last_name ILIKE '%FLETCHER%');

-- Jeremie COMEL: total ownership = 745
UPDATE positions p
SET units = 745.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Jeremie%' AND i.last_name ILIKE '%COMEL%');

-- Nineteen77 Global Multi-Strategy Alpha Master Limited: total ownership = 75,469
UPDATE positions p
SET units = 75469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Nineteen77 Global Multi-Strategy Alpha Master Limited%';

-- Gielke Jan BURGMANS: total ownership = 3,726
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Gielke%' AND i.last_name ILIKE '%BURGMANS%');

-- Halim EL MOGHAZI: total ownership = 969
UPDATE positions p
SET units = 969.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Halim%' AND i.last_name ILIKE '%EL MOGHAZI%');

-- John BARROWMAN: total ownership = 633
UPDATE positions p
SET units = 633.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%John%' AND i.last_name ILIKE '%BARROWMAN%');

-- Robin DOBLE: total ownership = 931
UPDATE positions p
SET units = 931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robin%' AND i.last_name ILIKE '%DOBLE%');

-- Tuygan GOKER: total ownership = 18,871
UPDATE positions p
SET units = 18871.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Tuygan%' AND i.last_name ILIKE '%GOKER%');

-- Hong Bao NGOC LE: total ownership = 372
UPDATE positions p
SET units = 372.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Hong%' AND i.last_name ILIKE '%NGOC LE%');

-- Marco JERRENTRUP: total ownership = 1,863
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Marco%' AND i.last_name ILIKE '%JERRENTRUP%');

-- Deyan D MIHOV: total ownership = 5,590
UPDATE positions p
SET units = 5590.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Deyan%' AND i.last_name ILIKE '%MIHOV%');

-- Denis MATTHEY: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Denis%' AND i.last_name ILIKE '%MATTHEY%');

-- Robert Jan DETTMEIJER: total ownership = 3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Robert%' AND i.last_name ILIKE '%DETTMEIJER%');

-- Daniel BAUMSLAG: total ownership = 3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Daniel%' AND i.last_name ILIKE '%BAUMSLAG%');

-- SMR3T Capital Pte Ltd: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%SMR3T Capital Pte Ltd%';

-- CLOUD IN HEAVEN SAS: total ownership = 3,653
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%CLOUD IN HEAVEN SAS%';

-- Majid MOHAMMED: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid%' AND i.last_name ILIKE '%MOHAMMED%');

-- AS ADVISORY DWC LLC: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%AS ADVISORY DWC LLC%';

-- OEP Ltd: total ownership = 14,615
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%OEP Ltd%';

-- PETRATECH: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%PETRATECH%';

-- Benjamin POURRAT: total ownership = 481
UPDATE positions p
SET units = 481.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Benjamin%' AND i.last_name ILIKE '%POURRAT%');

-- Mark MATTHEWS: total ownership = 1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mark%' AND i.last_name ILIKE '%MATTHEWS%');

-- Zandera (Holdco) Limited: total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND i.legal_name ILIKE '%Zandera (Holdco) Limited%';

-- Majid (VOIDED) KADDOUMI (VOIDED): total ownership = 0
UPDATE positions p
SET units = 0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Majid (VOIDED)%' AND i.last_name ILIKE '%KADDOUMI (VOIDED)%');

-- Sheikh Yousef AL SABAH: total ownership = 1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Sheikh Yousef%' AND i.last_name ILIKE '%AL SABAH%');

-- Andrew MEYER: total ownership = 6,779
UPDATE positions p
SET units = 6779.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Andrew%' AND i.last_name ILIKE '%MEYER%');

-- Abhie Shreyas SHAH: total ownership = 3,389
UPDATE positions p
SET units = 3389.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Abhie%' AND i.last_name ILIKE '%SHAH%');

-- Keir BENBOW: total ownership = 1,694
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Keir%' AND i.last_name ILIKE '%BENBOW%');

-- Mickael RYAN: total ownership = 75,943
UPDATE positions p
SET units = 75943.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND (i.first_name ILIKE '%Mickael%' AND i.last_name ILIKE '%RYAN%');


