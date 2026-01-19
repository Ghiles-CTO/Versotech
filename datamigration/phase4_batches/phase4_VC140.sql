-- Phase 4: VC140 Updates
-- 6 UPDATE statements


-- Row 2: Mrs Beatrice and Mr Marcel KNOPF
-- shares: 100000.0, price: 1.0, amount: 100000.0
UPDATE subscriptions s
SET num_shares = 100000.0, price_per_share = 1.0, funded_amount = 100000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%MRS BEATRICE AND MR MARCEL%' OR UPPER(i.first_name) = 'MRS BEATRICE AND MR MARCEL') AND (s.commitment = 100000.0 OR s.funded_amount = 100000.0));

-- Row 3: Mrs Liubov and Mr Igor ZINKEVICH
-- shares: 96000.0, price: 1.0, amount: 96000.0
UPDATE subscriptions s
SET num_shares = 96000.0, price_per_share = 1.0, funded_amount = 96000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%MRS LIUBOV AND MR IGOR%' OR UPPER(i.first_name) = 'MRS LIUBOV AND MR IGOR') AND (s.commitment = 96000.0 OR s.funded_amount = 96000.0));

-- Row 4: Julien MACHOT
-- shares: 50000.0, price: 1.0, amount: 50000.0
UPDATE subscriptions s
SET num_shares = 50000.0, price_per_share = 1.0, funded_amount = 50000.0
FROM investors i, vehicles v
WHERE s.investor_id = i.id
  AND s.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN') AND (s.commitment = 50000.0 OR s.funded_amount = 50000.0));

-- Position updates for VC140 (aggregated by investor)
-- Mrs Beatrice and Mr Marcel KNOPF: total ownership = 100000.0
UPDATE positions p
SET units = 100000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'KNOPF' OR UPPER(i.legal_name) LIKE '%KNOPF%' OR UPPER(i.legal_name) LIKE '%MRS BEATRICE AND MR MARCEL%' OR UPPER(i.first_name) = 'MRS BEATRICE AND MR MARCEL'));

-- Mrs Liubov and Mr Igor ZINKEVICH: total ownership = 96000.0
UPDATE positions p
SET units = 96000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'ZINKEVICH' OR UPPER(i.legal_name) LIKE '%ZINKEVICH%' OR UPPER(i.legal_name) LIKE '%MRS LIUBOV AND MR IGOR%' OR UPPER(i.first_name) = 'MRS LIUBOV AND MR IGOR'));

-- Julien MACHOT: total ownership = 50000.0
UPDATE positions p
SET units = 50000.0
FROM investors i, vehicles v
WHERE p.investor_id = i.id
  AND p.vehicle_id = v.id
  AND v.entity_code = 'VC140'
  AND ((UPPER(i.last_name) = 'MACHOT' OR UPPER(i.legal_name) LIKE '%MACHOT%' OR UPPER(i.legal_name) LIKE '%JULIEN%' OR UPPER(i.first_name) = 'JULIEN'));
