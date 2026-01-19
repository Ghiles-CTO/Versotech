-- Phase 4: VC113 Updates
-- 143 UPDATE statements


-- Row 2: Julien MACHOT
-- shares: 75485.0, price: 26.495, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 75485.0, price_per_share = 26.495, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Row 3: Barbara and Heinz WINZ
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%WINZ%' OR UPPER(i.legal_name) LIKE '%BARBARA AND HEINZ%' OR UPPER(i.first_name) = 'BARBARA AND HEINZ') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 4: Sandra KOHLER CABIAN
-- shares: 2795.0, price: 26.8314, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 2795.0, price_per_share = 26.8314, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 5: Markus AKERMANN
-- shares: 2795.0, price: 26.8314, amount: 75000.0
UPDATE subscriptions s
SET num_shares = 2795.0, price_per_share = 26.8314, funded_amount = 75000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS') AND (s.commitment = 75000.0 OR s.funded_amount = 75000.0));

-- Row 6: Dalinga AG
-- shares: 5590.0, price: 26.8314, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 5590.0, price_per_share = 26.8314, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA AG%') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 7: Dalinga AG
-- shares: 559.0, price: 26.8314, amount: 15000.0
UPDATE subscriptions s
SET num_shares = 559.0, price_per_share = 26.8314, funded_amount = 15000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA AG%') AND (s.commitment = 15000.0 OR s.funded_amount = 15000.0));

-- Row 8: Liudmila Romanova and Alexey ROMANOV
-- shares: 14907.0, price: 26.8314, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 14907.0, price_per_share = 26.8314, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA ROMANOVA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA ROMANOVA AND ALEXEY') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 9: IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST
-- shares: 14907.0, price: 26.8314, amount: 400000.0
UPDATE subscriptions s
SET num_shares = 14907.0, price_per_share = 26.8314, funded_amount = 400000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%') AND (s.commitment = 400000.0 OR s.funded_amount = 400000.0));

-- Row 10: Andrey GORYAINOV
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GORYAINOV' OR UPPER(i.legal_name) LIKE '%GORYAINOV%' OR UPPER(i.legal_name) LIKE '%ANDREY%' OR UPPER(i.first_name) = 'ANDREY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 11: Liubov and Igor ZINKEVICH
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%LIUBOV AND IGOR%' OR UPPER(i.first_name) = 'LIUBOV AND IGOR') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 12: Sheila and Kamlesh MADHVANI
-- shares: 2500.0, price: 40.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 40.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%' OR UPPER(i.first_name) = 'SHEILA AND KAMLESH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 13: Rosen Invest Holdings Inc
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 14: Zandera (Finco) Limited
-- shares: 25000.0, price: 40.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 40.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 15: Mark HAYWARD
-- shares: 1250.0, price: 40.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1250.0, price_per_share = 40.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%HAYWARD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 16: Beatrice and Marcel KNOPF
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 17: Scott TOMMEY
-- shares: 3750.0, price: 40.0, amount: 150000.0
UPDATE subscriptions s
SET num_shares = 3750.0, price_per_share = 40.0, funded_amount = 150000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TOMMEY' OR UPPER(i.legal_name) LIKE '%TOMMEY%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 150000.0 OR s.funded_amount = 150000.0));

-- Row 18: Gershon KOH
-- shares: 7453.0, price: 26.8314, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 7453.0, price_per_share = 26.8314, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 19: Signet Logistics Ltd
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 20: Erich GRAF
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 21: Shrai and Aparna MADHVANI
-- shares: 2500.0, price: 40.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 2500.0, price_per_share = 40.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHRAI AND APARNA%' OR UPPER(i.first_name) = 'SHRAI AND APARNA') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 22: Ivan DE
-- shares: 1863.0, price: 26.8314, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1863.0, price_per_share = 26.8314, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE' OR UPPER(i.legal_name) LIKE '%DE%' OR UPPER(i.legal_name) LIKE '%IVAN%' OR UPPER(i.first_name) = 'IVAN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 23: Bright Phoenix Holdings Ltd
-- shares: 3773.0, price: 26.501, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3773.0, price_per_share = 26.501, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 24: TEKAPO Group Limited
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%TEKAPO GROUP LIMITED%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 25: Philip ALGAR
-- shares: 1863.0, price: 26.8314, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1863.0, price_per_share = 26.8314, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ALGAR' OR UPPER(i.legal_name) LIKE '%ALGAR%' OR UPPER(i.legal_name) LIKE '%PHILIP%' OR UPPER(i.first_name) = 'PHILIP') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 26: Sebastian MERIDA
-- shares: 1118.0, price: 26.8314, amount: 30000.0
UPDATE subscriptions s
SET num_shares = 1118.0, price_per_share = 26.8314, funded_amount = 30000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MERIDA' OR UPPER(i.legal_name) LIKE '%MERIDA%' OR UPPER(i.legal_name) LIKE '%SEBASTIAN%' OR UPPER(i.first_name) = 'SEBASTIAN') AND (s.commitment = 30000.0 OR s.funded_amount = 30000.0));

-- Row 27: EMPIRE GROUP Limited
-- shares: 7453.0, price: 26.8314, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 7453.0, price_per_share = 26.8314, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%EMPIRE GROUP LIMITED%') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 28: Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN
-- shares: 3913.0, price: 26.8314, amount: 105000.0
UPDATE subscriptions s
SET num_shares = 3913.0, price_per_share = 26.8314, funded_amount = 105000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%MAHESWARI & SUBRAMANIAN%' OR UPPER(i.legal_name) LIKE '%MRS NILAKANTAN & MR SUBBIAH%' OR UPPER(i.first_name) = 'MRS NILAKANTAN & MR SUBBIAH') AND (s.commitment = 105000.0 OR s.funded_amount = 105000.0));

-- Row 29: Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA
-- shares: 4099.0, price: 26.8314, amount: 110000.0
UPDATE subscriptions s
SET num_shares = 4099.0, price_per_share = 26.8314, funded_amount = 110000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA' OR UPPER(i.legal_name) LIKE '%HIQUIANA-TANEJA & TANEJA%' OR UPPER(i.legal_name) LIKE '%MRS ROSARIO TERESA & MR DEEPAK%' OR UPPER(i.first_name) = 'MRS ROSARIO TERESA & MR DEEPAK') AND (s.commitment = 110000.0 OR s.funded_amount = 110000.0));

-- Row 30: SAFE
-- shares: 9317.0, price: 26.8314, amount: 250000.0
UPDATE subscriptions s
SET num_shares = 9317.0, price_per_share = 26.8314, funded_amount = 250000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SAFE%') AND (s.commitment = 250000.0 OR s.funded_amount = 250000.0));

-- Row 31: FRALIS SPF
-- shares: 18634.0, price: 26.8314, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 18634.0, price_per_share = 26.8314, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%FRALIS SPF%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 32: SUMMIT INVESTMENT HOLDINGS LLC
-- shares: 11180.0, price: 26.8314, amount: 300000.0
UPDATE subscriptions s
SET num_shares = 11180.0, price_per_share = 26.8314, funded_amount = 300000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%') AND (s.commitment = 300000.0 OR s.funded_amount = 300000.0));

-- Row 33: NEWBRIDGE FINANCE SPF
-- shares: 104355.0, price: 26.8314, amount: 2800000.0
UPDATE subscriptions s
SET num_shares = 104355.0, price_per_share = 26.8314, funded_amount = 2800000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NEWBRIDGE FINANCE SPF%') AND (s.commitment = 2800000.0 OR s.funded_amount = 2800000.0));

-- Row 34: Mayuriben JOGANI
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%JOGANI%' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%' OR UPPER(i.first_name) = 'MAYURIBEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 35: Charles DE BAVIER
-- shares: 7453.0, price: 26.8314, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 7453.0, price_per_share = 26.8314, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 36: Erwan TAROUILLY
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TAROUILLY' OR UPPER(i.legal_name) LIKE '%TAROUILLY%' OR UPPER(i.legal_name) LIKE '%ERWAN%' OR UPPER(i.first_name) = 'ERWAN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 37: Thierry ULDRY
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ULDRY' OR UPPER(i.legal_name) LIKE '%ULDRY%' OR UPPER(i.legal_name) LIKE '%THIERRY%' OR UPPER(i.first_name) = 'THIERRY') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 38: Scott FLETCHER
-- shares: 18634.0, price: 26.8314, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 18634.0, price_per_share = 26.8314, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 39: Jeremie COMEL
-- shares: 745.0, price: 26.8314, amount: 20000.0
UPDATE subscriptions s
SET num_shares = 745.0, price_per_share = 26.8314, funded_amount = 20000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'COMEL' OR UPPER(i.legal_name) LIKE '%COMEL%' OR UPPER(i.legal_name) LIKE '%JEREMIE%' OR UPPER(i.first_name) = 'JEREMIE') AND (s.commitment = 20000.0 OR s.funded_amount = 20000.0));

-- Row 40: Nineteen77 Global Multi-Strategy Alpha Master Limited
-- shares: 226406.0, price: 26.501, amount: 5999985.41
UPDATE subscriptions s
SET num_shares = 226406.0, price_per_share = 26.501, funded_amount = 5999985.41
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NINETEEN77 GLOBAL MULTI-STRATEGY ALPHA MASTER LIMITED%') AND (s.commitment = 5999985.41 OR s.funded_amount = 5999985.41));

-- Row 41: Gielke BURGMANS
-- shares: 3726.0, price: 26.8314, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3726.0, price_per_share = 26.8314, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BURGMANS' OR UPPER(i.legal_name) LIKE '%BURGMANS%' OR UPPER(i.legal_name) LIKE '%GIELKE%' OR UPPER(i.first_name) = 'GIELKE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 42: Halim EL MOGHAZI
-- shares: 969.0, price: 26.8314, amount: 26000.0
UPDATE subscriptions s
SET num_shares = 969.0, price_per_share = 26.8314, funded_amount = 26000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'EL MOGHAZI' OR UPPER(i.legal_name) LIKE '%EL MOGHAZI%' OR UPPER(i.legal_name) LIKE '%HALIM%' OR UPPER(i.first_name) = 'HALIM') AND (s.commitment = 26000.0 OR s.funded_amount = 26000.0));

-- Row 43: John BARROWMAN
-- shares: 633.0, price: 26.8314, amount: 17000.0
UPDATE subscriptions s
SET num_shares = 633.0, price_per_share = 26.8314, funded_amount = 17000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BARROWMAN' OR UPPER(i.legal_name) LIKE '%BARROWMAN%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN') AND (s.commitment = 17000.0 OR s.funded_amount = 17000.0));

-- Row 44: Robin DOBLE
-- shares: 931.0, price: 26.8314, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 931.0, price_per_share = 26.8314, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DOBLE' OR UPPER(i.legal_name) LIKE '%DOBLE%' OR UPPER(i.legal_name) LIKE '%ROBIN%' OR UPPER(i.first_name) = 'ROBIN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 45: Tuygan GOKER
-- shares: 18871.0, price: 26.495, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 18871.0, price_per_share = 26.495, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 46: Hong NGOC LE
-- shares: 372.0, price: 26.8314, amount: 10000.0
UPDATE subscriptions s
SET num_shares = 372.0, price_per_share = 26.8314, funded_amount = 10000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'NGOC LE' OR UPPER(i.legal_name) LIKE '%NGOC LE%' OR UPPER(i.legal_name) LIKE '%HONG%' OR UPPER(i.first_name) = 'HONG') AND (s.commitment = 10000.0 OR s.funded_amount = 10000.0));

-- Row 47: Marco JERRENTRUP
-- shares: 1863.0, price: 26.8314, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1863.0, price_per_share = 26.8314, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JERRENTRUP' OR UPPER(i.legal_name) LIKE '%JERRENTRUP%' OR UPPER(i.legal_name) LIKE '%MARCO%' OR UPPER(i.first_name) = 'MARCO') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 48: Zandera (Finco) Limited
-- shares: 23809.0, price: 42.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 23809.0, price_per_share = 42.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 49: Julien MACHOT
-- shares: 150937.0, price: 27.5612, amount: 4160000.0
UPDATE subscriptions s
SET num_shares = 150937.0, price_per_share = 27.5612, funded_amount = 4160000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 4160000.0 OR s.funded_amount = 4160000.0));

-- Row 50: Deyan MIHOV
-- shares: 2236.0, price: 26.8314, amount: 60000.0
UPDATE subscriptions s
SET num_shares = 2236.0, price_per_share = 26.8314, funded_amount = 60000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN') AND (s.commitment = 60000.0 OR s.funded_amount = 60000.0));

-- Row 51: Julien MACHOT
-- shares: 80166.0, price: 26.495, amount: 2124000.0
UPDATE subscriptions s
SET num_shares = 80166.0, price_per_share = 26.495, funded_amount = 2124000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 2124000.0 OR s.funded_amount = 2124000.0));

-- Row 52: Julien MACHOT
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 53: Denis MATTHEY
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 54: Robert DETTMEIJER
-- shares: 3653.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3653.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 55: Daniel BAUMSLAG
-- shares: 3653.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3653.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 56: SMR3T Capital Pte Ltd
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SMR3T CAPITAL PTE LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 57: CLOUD IN HEAVEN SAS
-- shares: 3653.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3653.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%CLOUD IN HEAVEN SAS%') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 58: Majid MOHAMMED
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MOHAMMED' OR UPPER(i.legal_name) LIKE '%MOHAMMED%' OR UPPER(i.legal_name) LIKE '%MAJID%' OR UPPER(i.first_name) = 'MAJID') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 59: Julien MACHOT
-- shares: 3661.0, price: 6.842, amount: 25000.0
UPDATE subscriptions s
SET num_shares = 3661.0, price_per_share = 6.842, funded_amount = 25000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 25000.0 OR s.funded_amount = 25000.0));

-- Row 60: AS ADVISORY DWC LLC
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY DWC LLC%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 61: OEP Ltd
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 62: PETRATECH
-- shares: 7307.0, price: 6.842, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 7307.0, price_per_share = 6.842, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%PETRATECH%') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 63: FRALIS SPF
-- shares: 14615.0, price: 6.842, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 14615.0, price_per_share = 6.842, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%FRALIS SPF%') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 64: Benjamin POURRAT
-- shares: 481.0, price: 26.495, amount: 12755.1
UPDATE subscriptions s
SET num_shares = 481.0, price_per_share = 26.495, funded_amount = 12755.1
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'POURRAT' OR UPPER(i.legal_name) LIKE '%POURRAT%' OR UPPER(i.legal_name) LIKE '%BENJAMIN%' OR UPPER(i.first_name) = 'BENJAMIN') AND (s.commitment = 12755.1 OR s.funded_amount = 12755.1));

-- Row 65: Mark MATTHEWS
-- shares: 1694.0, price: 29.5, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1694.0, price_per_share = 29.5, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 66: Scott FLETCHER
-- shares: 74539.0, price: 26.8314, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 74539.0, price_per_share = 26.8314, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Row 67: Julien MACHOT
-- shares: 74539.0, price: 26.8314, amount: 2000000.0
UPDATE subscriptions s
SET num_shares = 74539.0, price_per_share = 26.8314, funded_amount = 2000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 2000000.0 OR s.funded_amount = 2000000.0));

-- Row 68: Mark HAYWARD
-- shares: 2000.0, price: 40.0, amount: 80000.0
UPDATE subscriptions s
SET num_shares = 2000.0, price_per_share = 40.0, funded_amount = 80000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%HAYWARD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK') AND (s.commitment = 80000.0 OR s.funded_amount = 80000.0));

-- Row 69: Zandera (Holdco) Limited
-- shares: 12500.0, price: 40.0, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 40.0, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 70: Majid (VOIDED) KADDOUMI (VOIDED)
-- shares: 0.0, price: 26.8314, amount: 0.0
UPDATE subscriptions s
SET num_shares = 0.0, price_per_share = 26.8314, funded_amount = 0.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KADDOUMI (VOIDED)' OR UPPER(i.legal_name) LIKE '%KADDOUMI (VOIDED)%' OR UPPER(i.legal_name) LIKE '%MAJID (VOIDED)%' OR UPPER(i.first_name) = 'MAJID (VOIDED)'));

-- Row 71: Sheikh Yousef AL SABAH
-- shares: 1694.0, price: 29.5, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1694.0, price_per_share = 29.5, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 72: Andrew MEYER
-- shares: 6779.0, price: 29.5, amount: 200000.0
UPDATE subscriptions s
SET num_shares = 6779.0, price_per_share = 29.5, funded_amount = 200000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%MEYER%' OR UPPER(i.legal_name) LIKE '%ANDREW%' OR UPPER(i.first_name) = 'ANDREW') AND (s.commitment = 200000.0 OR s.funded_amount = 200000.0));

-- Row 73: Abhie SHAH
-- shares: 3389.0, price: 29.5, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 3389.0, price_per_share = 29.5, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%SHAH%' OR UPPER(i.legal_name) LIKE '%ABHIE%' OR UPPER(i.first_name) = 'ABHIE') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 74: Deyan MIHOV
-- shares: 3354.0, price: 26.8314, amount: 90000.0
UPDATE subscriptions s
SET num_shares = 3354.0, price_per_share = 26.8314, funded_amount = 90000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN') AND (s.commitment = 90000.0 OR s.funded_amount = 90000.0));

-- Row 75: Zandera (Holdco) Limited
-- shares: 14634.0, price: 41.0, amount: 600000.0
UPDATE subscriptions s
SET num_shares = 14634.0, price_per_share = 41.0, funded_amount = 600000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%') AND (s.commitment = 600000.0 OR s.funded_amount = 600000.0));

-- Row 76: Julien MACHOT
-- shares: 7307.0, price: 6.842, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 7307.0, price_per_share = 6.842, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 77: Keir BENBOW
-- shares: 1694.0, price: 29.5, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 1694.0, price_per_share = 29.5, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Row 78: Mickael RYAN
-- shares: 25000.0, price: 40.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 25000.0, price_per_share = 40.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 79: Mickael RYAN
-- shares: 23809.0, price: 42.0, amount: 1000000.0
UPDATE subscriptions s
SET num_shares = 23809.0, price_per_share = 42.0, funded_amount = 1000000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 1000000.0 OR s.funded_amount = 1000000.0));

-- Row 80: Mickael RYAN
-- shares: 12500.0, price: 40.0, amount: 500000.0
UPDATE subscriptions s
SET num_shares = 12500.0, price_per_share = 40.0, funded_amount = 500000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 500000.0 OR s.funded_amount = 500000.0));

-- Row 81: Mickael RYAN
-- shares: 14634.0, price: 41.0, amount: 600000.0
UPDATE subscriptions s
SET num_shares = 14634.0, price_per_share = 41.0, funded_amount = 600000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL') AND (s.commitment = 600000.0 OR s.funded_amount = 600000.0));

-- Position updates for VC113 (aggregated by investor)
-- Julien MACHOT: total ownership = 283952.0
UPDATE positions p
SET units = 283952.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));

-- Barbara and Heinz WINZ: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'WINZ' OR UPPER(i.legal_name) LIKE '%WINZ%' OR UPPER(i.legal_name) LIKE '%BARBARA AND HEINZ%' OR UPPER(i.first_name) = 'BARBARA AND HEINZ'));

-- Sandra KOHLER CABIAN: total ownership = 2795.0
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOHLER CABIAN' OR UPPER(i.legal_name) LIKE '%KOHLER CABIAN%' OR UPPER(i.legal_name) LIKE '%SANDRA%' OR UPPER(i.first_name) = 'SANDRA'));

-- Markus AKERMANN: total ownership = 2795.0
UPDATE positions p
SET units = 2795.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AKERMANN' OR UPPER(i.legal_name) LIKE '%AKERMANN%' OR UPPER(i.legal_name) LIKE '%MARKUS%' OR UPPER(i.first_name) = 'MARKUS'));

-- Dalinga AG: total ownership = 6149.0
UPDATE positions p
SET units = 6149.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%DALINGA AG%'));

-- Liudmila Romanova and Alexey ROMANOV: total ownership = 14907.0
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ROMANOV' OR UPPER(i.legal_name) LIKE '%ROMANOV%' OR UPPER(i.legal_name) LIKE '%LIUDMILA ROMANOVA AND ALEXEY%' OR UPPER(i.first_name) = 'LIUDMILA ROMANOVA AND ALEXEY'));

-- IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST: total ownership = 14907.0
UPDATE positions p
SET units = 14907.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%IQEQ (SWITZERLAND) LIMITED ATO RAYCAT INVESTMENT TRUST%'));

-- Andrey GORYAINOV: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GORYAINOV' OR UPPER(i.legal_name) LIKE '%GORYAINOV%' OR UPPER(i.legal_name) LIKE '%ANDREY%' OR UPPER(i.first_name) = 'ANDREY'));

-- Liubov and Igor ZINKEVICH: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%LIUBOV AND IGOR%' OR UPPER(i.first_name) = 'LIUBOV AND IGOR'));

-- Shrai and Aparna MADHVANI: total ownership = 5000.0
UPDATE positions p
SET units = 5000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MADHVANI' OR UPPER(i.legal_name) LIKE '%MADHVANI%' OR UPPER(i.legal_name) LIKE '%SHEILA AND KAMLESH%' OR UPPER(i.first_name) = 'SHEILA AND KAMLESH'));

-- Rosen Invest Holdings Inc: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ROSEN INVEST HOLDINGS INC%'));

-- Zandera (Finco) Limited: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (FINCO) LIMITED%'));

-- Mark HAYWARD: total ownership = 3250.0
UPDATE positions p
SET units = 3250.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HAYWARD' OR UPPER(i.legal_name) LIKE '%HAYWARD%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK'));

-- Beatrice and Marcel KNOPF: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%BEATRICE AND MARCEL%' OR UPPER(i.first_name) = 'BEATRICE AND MARCEL'));

-- Scott TOMMEY: total ownership = 3750.0
UPDATE positions p
SET units = 3750.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TOMMEY' OR UPPER(i.legal_name) LIKE '%TOMMEY%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Gershon KOH: total ownership = 7453.0
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KOH' OR UPPER(i.legal_name) LIKE '%KOH%' OR UPPER(i.legal_name) LIKE '%GERSHON%' OR UPPER(i.first_name) = 'GERSHON'));

-- Signet Logistics Ltd: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SIGNET LOGISTICS LTD%'));

-- Erich GRAF: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GRAF' OR UPPER(i.legal_name) LIKE '%GRAF%' OR UPPER(i.legal_name) LIKE '%ERICH%' OR UPPER(i.first_name) = 'ERICH'));

-- Ivan DE: total ownership = 1863.0
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE' OR UPPER(i.legal_name) LIKE '%DE%' OR UPPER(i.legal_name) LIKE '%IVAN%' OR UPPER(i.first_name) = 'IVAN'));

-- Bright Phoenix Holdings Ltd: total ownership = 3773.0
UPDATE positions p
SET units = 3773.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%BRIGHT PHOENIX HOLDINGS LTD%'));

-- TEKAPO Group Limited: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%TEKAPO GROUP LIMITED%'));

-- Philip ALGAR: total ownership = 1863.0
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ALGAR' OR UPPER(i.legal_name) LIKE '%ALGAR%' OR UPPER(i.legal_name) LIKE '%PHILIP%' OR UPPER(i.first_name) = 'PHILIP'));

-- Sebastian MERIDA: total ownership = 1118.0
UPDATE positions p
SET units = 1118.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MERIDA' OR UPPER(i.legal_name) LIKE '%MERIDA%' OR UPPER(i.legal_name) LIKE '%SEBASTIAN%' OR UPPER(i.first_name) = 'SEBASTIAN'));

-- EMPIRE GROUP Limited: total ownership = 7453.0
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%EMPIRE GROUP LIMITED%'));

-- Mrs Nilakantan & Mr Subbiah MAHESWARI & SUBRAMANIAN: total ownership = 3913.0
UPDATE positions p
SET units = 3913.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MAHESWARI & SUBRAMANIAN' OR UPPER(i.legal_name) LIKE '%MAHESWARI & SUBRAMANIAN%' OR UPPER(i.legal_name) LIKE '%MRS NILAKANTAN & MR SUBBIAH%' OR UPPER(i.first_name) = 'MRS NILAKANTAN & MR SUBBIAH'));

-- Mrs Rosario Teresa & Mr Deepak HIQUIANA-TANEJA & TANEJA: total ownership = 4099.0
UPDATE positions p
SET units = 4099.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'HIQUIANA-TANEJA & TANEJA' OR UPPER(i.legal_name) LIKE '%HIQUIANA-TANEJA & TANEJA%' OR UPPER(i.legal_name) LIKE '%MRS ROSARIO TERESA & MR DEEPAK%' OR UPPER(i.first_name) = 'MRS ROSARIO TERESA & MR DEEPAK'));

-- SAFE: total ownership = 9317.0
UPDATE positions p
SET units = 9317.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SAFE%'));

-- FRALIS SPF: total ownership = 33249.0
UPDATE positions p
SET units = 33249.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%FRALIS SPF%'));

-- SUMMIT INVESTMENT HOLDINGS LLC: total ownership = 11180.0
UPDATE positions p
SET units = 11180.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SUMMIT INVESTMENT HOLDINGS LLC%'));

-- NEWBRIDGE FINANCE SPF: total ownership = 104355.0
UPDATE positions p
SET units = 104355.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NEWBRIDGE FINANCE SPF%'));

-- Mayuriben JOGANI: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JOGANI' OR UPPER(i.legal_name) LIKE '%JOGANI%' OR UPPER(i.legal_name) LIKE '%MAYURIBEN%' OR UPPER(i.first_name) = 'MAYURIBEN'));

-- Charles DE BAVIER: total ownership = 7453.0
UPDATE positions p
SET units = 7453.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DE BAVIER' OR UPPER(i.legal_name) LIKE '%DE BAVIER%' OR UPPER(i.legal_name) LIKE '%CHARLES%' OR UPPER(i.first_name) = 'CHARLES'));

-- Erwan TAROUILLY: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'TAROUILLY' OR UPPER(i.legal_name) LIKE '%TAROUILLY%' OR UPPER(i.legal_name) LIKE '%ERWAN%' OR UPPER(i.first_name) = 'ERWAN'));

-- Thierry ULDRY: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'ULDRY' OR UPPER(i.legal_name) LIKE '%ULDRY%' OR UPPER(i.legal_name) LIKE '%THIERRY%' OR UPPER(i.first_name) = 'THIERRY'));

-- Scott FLETCHER: total ownership = 18634.0
UPDATE positions p
SET units = 18634.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'FLETCHER' OR UPPER(i.legal_name) LIKE '%FLETCHER%' OR UPPER(i.legal_name) LIKE '%SCOTT%' OR UPPER(i.first_name) = 'SCOTT'));

-- Jeremie COMEL: total ownership = 745.0
UPDATE positions p
SET units = 745.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'COMEL' OR UPPER(i.legal_name) LIKE '%COMEL%' OR UPPER(i.legal_name) LIKE '%JEREMIE%' OR UPPER(i.first_name) = 'JEREMIE'));

-- Nineteen77 Global Multi-Strategy Alpha Master Limited: total ownership = 75469.0
UPDATE positions p
SET units = 75469.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%NINETEEN77 GLOBAL MULTI-STRATEGY ALPHA MASTER LIMITED%'));

-- Gielke BURGMANS: total ownership = 3726.0
UPDATE positions p
SET units = 3726.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BURGMANS' OR UPPER(i.legal_name) LIKE '%BURGMANS%' OR UPPER(i.legal_name) LIKE '%GIELKE%' OR UPPER(i.first_name) = 'GIELKE'));

-- Halim EL MOGHAZI: total ownership = 969.0
UPDATE positions p
SET units = 969.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'EL MOGHAZI' OR UPPER(i.legal_name) LIKE '%EL MOGHAZI%' OR UPPER(i.legal_name) LIKE '%HALIM%' OR UPPER(i.first_name) = 'HALIM'));

-- John BARROWMAN: total ownership = 633.0
UPDATE positions p
SET units = 633.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BARROWMAN' OR UPPER(i.legal_name) LIKE '%BARROWMAN%' OR UPPER(i.legal_name) LIKE '%JOHN%' OR UPPER(i.first_name) = 'JOHN'));

-- Robin DOBLE: total ownership = 931.0
UPDATE positions p
SET units = 931.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DOBLE' OR UPPER(i.legal_name) LIKE '%DOBLE%' OR UPPER(i.legal_name) LIKE '%ROBIN%' OR UPPER(i.first_name) = 'ROBIN'));

-- Tuygan GOKER: total ownership = 18871.0
UPDATE positions p
SET units = 18871.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'GOKER' OR UPPER(i.legal_name) LIKE '%GOKER%' OR UPPER(i.legal_name) LIKE '%TUYGAN%' OR UPPER(i.first_name) = 'TUYGAN'));

-- Hong NGOC LE: total ownership = 372.0
UPDATE positions p
SET units = 372.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'NGOC LE' OR UPPER(i.legal_name) LIKE '%NGOC LE%' OR UPPER(i.legal_name) LIKE '%HONG%' OR UPPER(i.first_name) = 'HONG'));

-- Marco JERRENTRUP: total ownership = 1863.0
UPDATE positions p
SET units = 1863.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'JERRENTRUP' OR UPPER(i.legal_name) LIKE '%JERRENTRUP%' OR UPPER(i.legal_name) LIKE '%MARCO%' OR UPPER(i.first_name) = 'MARCO'));

-- Deyan MIHOV: total ownership = 5590.0
UPDATE positions p
SET units = 5590.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MIHOV' OR UPPER(i.legal_name) LIKE '%MIHOV%' OR UPPER(i.legal_name) LIKE '%DEYAN%' OR UPPER(i.first_name) = 'DEYAN'));

-- Denis MATTHEY: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEY' OR UPPER(i.legal_name) LIKE '%MATTHEY%' OR UPPER(i.legal_name) LIKE '%DENIS%' OR UPPER(i.first_name) = 'DENIS'));

-- Robert DETTMEIJER: total ownership = 3653.0
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'DETTMEIJER' OR UPPER(i.legal_name) LIKE '%DETTMEIJER%' OR UPPER(i.legal_name) LIKE '%ROBERT%' OR UPPER(i.first_name) = 'ROBERT'));

-- Daniel BAUMSLAG: total ownership = 3653.0
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BAUMSLAG' OR UPPER(i.legal_name) LIKE '%BAUMSLAG%' OR UPPER(i.legal_name) LIKE '%DANIEL%' OR UPPER(i.first_name) = 'DANIEL'));

-- SMR3T Capital Pte Ltd: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%SMR3T CAPITAL PTE LTD%'));

-- CLOUD IN HEAVEN SAS: total ownership = 3653.0
UPDATE positions p
SET units = 3653.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%CLOUD IN HEAVEN SAS%'));

-- Majid MOHAMMED: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MOHAMMED' OR UPPER(i.legal_name) LIKE '%MOHAMMED%' OR UPPER(i.legal_name) LIKE '%MAJID%' OR UPPER(i.first_name) = 'MAJID'));

-- AS ADVISORY DWC LLC: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%AS ADVISORY DWC LLC%'));

-- OEP Ltd: total ownership = 14615.0
UPDATE positions p
SET units = 14615.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%OEP LTD%'));

-- PETRATECH: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%PETRATECH%'));

-- Benjamin POURRAT: total ownership = 481.0
UPDATE positions p
SET units = 481.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'POURRAT' OR UPPER(i.legal_name) LIKE '%POURRAT%' OR UPPER(i.legal_name) LIKE '%BENJAMIN%' OR UPPER(i.first_name) = 'BENJAMIN'));

-- Mark MATTHEWS: total ownership = 1694.0
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MATTHEWS' OR UPPER(i.legal_name) LIKE '%MATTHEWS%' OR UPPER(i.legal_name) LIKE '%MARK%' OR UPPER(i.first_name) = 'MARK'));

-- Zandera (Holdco) Limited: total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.legal_name) LIKE '%ZANDERA (HOLDCO) LIMITED%'));

-- Majid (VOIDED) KADDOUMI (VOIDED): total ownership = 0.0
UPDATE positions p
SET units = 0.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'KADDOUMI (VOIDED)' OR UPPER(i.legal_name) LIKE '%KADDOUMI (VOIDED)%' OR UPPER(i.legal_name) LIKE '%MAJID (VOIDED)%' OR UPPER(i.first_name) = 'MAJID (VOIDED)'));

-- Sheikh Yousef AL SABAH: total ownership = 1694.0
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'AL SABAH' OR UPPER(i.legal_name) LIKE '%AL SABAH%' OR UPPER(i.legal_name) LIKE '%SHEIKH YOUSEF%' OR UPPER(i.first_name) = 'SHEIKH YOUSEF'));

-- Andrew MEYER: total ownership = 6779.0
UPDATE positions p
SET units = 6779.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'MEYER' OR UPPER(i.legal_name) LIKE '%MEYER%' OR UPPER(i.legal_name) LIKE '%ANDREW%' OR UPPER(i.first_name) = 'ANDREW'));

-- Abhie SHAH: total ownership = 3389.0
UPDATE positions p
SET units = 3389.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'SHAH' OR UPPER(i.legal_name) LIKE '%SHAH%' OR UPPER(i.legal_name) LIKE '%ABHIE%' OR UPPER(i.first_name) = 'ABHIE'));

-- Keir BENBOW: total ownership = 1694.0
UPDATE positions p
SET units = 1694.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'BENBOW' OR UPPER(i.legal_name) LIKE '%BENBOW%' OR UPPER(i.legal_name) LIKE '%KEIR%' OR UPPER(i.first_name) = 'KEIR'));

-- Mickael RYAN: total ownership = 75943.0
UPDATE positions p
SET units = 75943.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC113'
  AND ((UPPER(i.last_name) = 'RYAN' OR UPPER(i.legal_name) LIKE '%RYAN%' OR UPPER(i.legal_name) LIKE '%MICKAEL%' OR UPPER(i.first_name) = 'MICKAEL'));
