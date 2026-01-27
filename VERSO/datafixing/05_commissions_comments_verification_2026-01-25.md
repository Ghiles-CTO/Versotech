# 05 Introducer Commissions — Comment Checks (2026-01-25)

Source file checked:
- `VERSO/datafixing/05_Introducer_Commissions_FD comments.xlsx`

Rules applied:
- Red fill rows = client-corrected values (must exist in DB).
- Strikethrough rows = remove from DB.

## Findings
### Red fill rows
All red-only rows are now present in DB after matching with normalized names and rates.

### Strikethrough rows
These 5 commissions were still present in DB and were removed:

1) `c1ae8485-6c17-4dab-9b54-7c4f424a9642`
   - VC125 / Terra Financial & Management Services SA → MA GROUP AG
   - performance_fee, rate_bps 200, amount 0 (EUR)

2) `ed855a7c-7e9e-4ea8-928b-4bf20e6e80f6`
   - VC125 / Terra Financial & Management Services SA → Eric SARASIN
   - performance_fee, rate_bps 200, amount 0 (EUR)

3) `3e07ca53-4493-415b-a1a4-5ca4fe6f1334`
   - VC125 / Pierre Paumier → LF GROUP SARL
   - invested_amount, rate_bps 200, amount 2000 (EUR)

4) `c0618f7a-e8cc-4e3e-a974-e21cd5287ac4`
   - VC133 / Rick (Altras) → Charles DE BAVIER
   - invested_amount, rate_bps 0, amount 0 (USD)

5) `7c594d0f-a11e-4733-8a6f-c118c146f7a8`
   - VC133 / Rick (Altras) → Marco JERRENTRUP
   - invested_amount, rate_bps 0, amount 0 (USD)

## Status
All comment-based adjustments from the file are now reflected in the database.
