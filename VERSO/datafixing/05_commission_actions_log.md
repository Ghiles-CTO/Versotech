# 05 Introducer Commissions — Applied Actions

Applied updates (executed in prod):
- f9e420b2-09d3-4948-b418-d1576305b6c4 | VC133 | Altras Capital Financing Broker | ZANDERA (Holdco) Ltd | fee=invested_amount | rate_bps 25.0→500.0 | amount 2500.0→50000.0
- 7916d691-06d5-402b-8c3c-c262a889a0d8 | VC133 | Altras Capital Financing Broker | ZANDERA (Holdco) Ltd | fee=spread | rate_bps 968.0→1500.0 | amount 96750.0→96750.0

Applied deletes (executed in prod):
- 29 commission_ids deleted (see 05_commission_apply_deletes.sql)

Fishy rows (not applied, needs decision):
- INTRODUCER_NAME_MISMATCH: 9
- NO_CANDIDATES: 9
- AMBIGUOUS: 6
- AMBIGUOUS_RELAXED_INVESTOR: 1

Artifacts:
- VERSO/datafixing/05_commission_apply_updates.sql
- VERSO/datafixing/05_commission_apply_deletes.sql
- VERSO/datafixing/05_commission_fishy_rows.csv

## VC133 Setcap alignment (executed)
- Updated introductions to Setcap: 6090f0ae-cc2f-463e-99b2-205552c4b997, 3dd9354c-02a3-48f1-963c-8dbee021c82c, 106b140d-4391-41d8-b078-04d9d13456dc, 137a6f3e-944f-47e9-bd6f-38f399cc84f8
- Updated commissions to Setcap + corrected amounts/rates:
  - 7d883539-0205-4d10-9c48-55b788a8c3f1 (CARTA invested_amount → 200 bps / 2000)
  - 7bc57935-d0ed-4cf4-87dd-01ced79b722a (CARTA spread → 8500 bps / 5610)
  - 49e3ab62-5a88-4f82-9658-e4ba2d9055b8 (Sahejman invested_amount → 200 bps / 1000)
  - 233a00cc-c4d8-4eaf-872b-3b8d4eca7bbe (Sahejman spread → 8500 bps / 2805)
  - f6d4a880-12cf-4aad-a197-2b66feeaeeb1 (Jeremy invested_amount → 200 bps / 1000)
  - d8591720-8d6d-4e70-b67d-e972f9fc1b3e (Jeremy spread → 8500 bps / 2805)
- Inserted missing 777 WALNUT commissions:
  - b86c4653-833d-4cfc-b4ee-d455111a9085 (invested_amount 200 bps / 1000)
  - 97bc49ee-eef8-4733-811c-686274cff5ed (spread 8500 bps / 2805)
- Updated subscriptions (VC133) to Setcap introducer and linked introductions for CARTA, Sahejman, Jeremy, 777 WALNUT


## VC126 Cloudsafe performance fee (executed)
- Inserted Moore & Moore performance_fee commission (rate_bps 300, amount 0) for Cloudsafe
  - introducer_id: 25bbd020-6cba-4c48-a8be-936c3295f586
  - deal_id: e2d649da-f1e9-49ca-b426-dd8ade244f12
  - investor_id: 76518678-13f1-4a8e-a050-1e0ef6a39d4c
  - introduction_id: fe80eb82-a43e-41c7-9327-14ee20320d47

## Client red‑row overrides (executed)
Applied per client edits even when conflicting with dashboard.
- Created investor: 778 WALNUT LLC
- Created introductions:
  - VC122 Pierre Paumier → LF GROUP SARL
  - VC125 Terra → Eric SARASIN
  - VC125 Pierre Paumier → LF GROUP SARL
  - VC126 Setcap → BSV SPV III LLC
  - VC126 Daniel Baumslag → CLOUDSAFE HOLDINGS LIMITED
  - VC133 Setcap → 778 WALNUT LLC
- Updated Cloudsafe (VC126) commissions to Daniel Baumslag:
  - b057ecc2-8ad8-464d-9b43-f0030604357c performance_fee → 0 bps / 0 USD
  - 6f6c330a-c5fe-419a-8178-37069b41a853 spread → 1375 bps / 12,210 USD
- Inserted new commissions:
  - VC122 LF GROUP SARL (Pierre): invested_amount 200 bps / 1500 USD; performance_fee 500 bps / 0 USD
  - VC125 MA GROUP AG (Terra): performance_fee 200 bps / 0 EUR
  - VC125 Eric SARASIN (Terra): invested_amount 500 bps / 5000 EUR; performance_fee 200 bps / 0 EUR
  - VC125 LF GROUP SARL (Pierre): invested_amount 200 bps / 2000 EUR
  - VC126 BSV SPV III LLC (Setcap): performance_fee 0 bps / 0 USD; spread 290 bps / 31,030 USD
  - VC133 778 WALNUT LLC (Setcap): spread 8,500 bps / 2,805 USD
