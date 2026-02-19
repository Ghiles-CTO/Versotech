# VC106 (VC6) Reconciliation Notes — 2026-02-02

Source of truth used **in this pass**
- Dashboard CSV: `dashboardreconciliations/VERSO DASHBOARD_V1.0.xlsx - VC6.csv`
- Production DB (Supabase MCP: versotech-prod)

Scope of this pass
- Re-summed *all numeric columns* in VC6 and compared against totals row (row 224)
- Verified row counts (active vs zero ownership)
- Verified production DB counts for subscriptions/positions
- Verified commissions exist + totals by introducer
- Confirmed **partners are introducers** (no partner roles used in introducers table)

---

## VC6 CSV structure (used for sums)
- Header row: **row 3**
- Data rows: **rows 4–223**
- Totals row: **row 224**
- Summary rows: **226–227** (percent summaries, not sums)

Row counts
- Indexed rows (Index 1–208): **208**
- Rows with numbers but **blank Index**: **11** (still part of data block)
- Total data rows summed: **220**

Ownership row counts (from CSV)
- Active rows (OWNERSHIP POSITION > 0): **197**
- Zero ownership rows: **21**
- Missing ownership cells: **2**

---

## Totals row vs sum of rows (VC6)

Columns with totals in row 224: **11 columns**

**Matches (within $0.01):**
- Amount invested
- Number of shares invested
- Ownership position
- Spread PPS Fees (overall)
- Subscription fees (overall) — off by $0.01 (rounding)
- Partner subscription fees
- BI subscription fees — off by $0.01 (rounding)
- BI spread fees

**Mismatches:**
1) **Performance fees 1**
   - Sum of rows: **2,025.00**
   - Totals row: **5.85%**
   - This is a **% column**; totals row is not a sum. Not a data error.

2) **BD fees**
   - Sum of rows: **$70,603.09**
   - Totals row: **$75,884.07**
   - Diff: **$5,280.98**
   - Recalc from Amount × BD % for all 13 BD‑fee rows → **$70,603.09**
   - **Conclusion:** totals row is incorrect; row data is internally consistent.

3) **Partner spread (column 52)**
   - Sum of rows: **$2,076,818.62**
   - Totals row: **$2,076,818.56**
   - Diff: **$0.06** (rounding)

---

## Partner spread “missing row” (VC6)
The difference in partner spread totals was caused by **row 80**:
- Row 80 has **Partner blank** but contains **Partner spread = $29,930.56**
- If Partner is NOT forward‑filled, this row is excluded → totals are short
- Forward‑fill Partner down to row 80 resolves it

Result with forward‑fill:
- VERSO PARTNER spread = **$2,068,621.78** (dashboard target)
- DB shows **$2,068,621.84** (2‑decimal rounding)

---

## Explicit dashboard row checks (VC6)
- Row 148: Brahma Finance (BVI) Ltd
  - Partner: VERSO PARTNER
  - Subscription fee %: 1.00%
  - Subscription fee: $2,500.00
  - Partner spread: $13,392.54
  - All values used in DB commission rebuild

- Row 80: missing Partner → must be treated as VERSO PARTNER

---

## Production DB verification (VC106)

Vehicle / Deal
- Vehicle ID (VC106): `ba584abd-ea2b-4a3f-893a-c7e0999f4039`
- Deal ID: `07eff085-9f1d-4e02-b1e2-d717817503f1`

Subscriptions / Positions
- Subscriptions (VC106): **197**
- Positions (VC106): **177**
- Positions with units = 0: **0**
- Subscriptions missing position: **0**

Commissions (by introducer)
- VERSO PARTNER
  - invested_amount: **$98,546.81**
  - spread: **$2,068,621.84**
  - performance_fee: **$0.00**
- VERSO BI
  - invested_amount: **$409,788.94**
  - spread: **$3,175,841.19**
  - performance_fee: **$0.00**
- Simone
  - spread: **$8,196.78**
- Manna Capital
  - spread: **$40,000.00**
- Terra Financial & Management Services SA
  - spread: **$19,981.50**
- Setcap
  - spread: **$1,013,655.50**

Introductions
- Commissions missing introduction_id: **0**

Introducer roles
- No “partner” role in `introducers` table (count = 0)
- Partners + BI are stored as **introducers** only

---

## Key conclusions from this reconciliation pass
1) **Dashboard row data is internally consistent.**
2) The **BD fees totals row is wrong** (row-level data sums to $70,603.09).
3) Partner spread mismatch is due to **row 80 Partner blank** (needs forward‑fill).
4) Production DB now matches dashboard **row‑level data** for VC106:
   - counts match (197 subscriptions)
   - positions exist (no zero units)
   - commissions exist + match row-level totals

---

## SQL checks executed (Production)
- Subscriptions/positions counts:
  - `select count(*) from subscriptions where vehicle_id='ba584abd-ea2b-4a3f-893a-c7e0999f4039';`
  - `select count(*) from positions where vehicle_id='ba584abd-ea2b-4a3f-893a-c7e0999f4039';`
  - `select count(*) from positions where vehicle_id='ba584abd-ea2b-4a3f-893a-c7e0999f4039' and coalesce(units,0)=0;`
  - `select count(*) from subscriptions s left join positions p on p.investor_id=s.investor_id and p.vehicle_id=s.vehicle_id where s.vehicle_id='ba584abd-ea2b-4a3f-893a-c7e0999f4039' and p.id is null;`
- Commission totals by introducer:
  - `select i.display_name, ic.basis_type, count(*), sum(ic.accrual_amount) ... where ic.deal_id='07eff085-9f1d-4e02-b1e2-d717817503f1' group by 1,2;`

---

## Notes / risks
- The only mismatches found are **dashboard totals row formulas**, not row data.
- The partner spread total depends on **forward‑filling Partner column**.
- If totals row is required to match, the dashboard itself must be corrected.

---

## Orphaned commissions (expected; do NOT delete)

These commission rows correspond to dashboard rows where **OWNERSHIP POSITION = 0**.

Per the agreed rule: **subscriptions/positions are removed but commissions remain**.

So these are **expected** and should be kept.


Zero-ownership rows in VC6 (count = 21):

- Row 30: Julien MACHOT | amount $ 82,917.00 | spread $ - | sub fee $ -
- Row 31: VERSO GROUP | amount $ 82,917.00 | spread $ - | sub fee $ -
- Row 32: Julien MACHOT | amount $ 2,240.00 | spread $ - | sub fee $ -
- Row 33: VERSO GROUP | amount $ 2,240.00 | spread $ - | sub fee $ -
- Row 45: JIMENEZ TRADING INC | amount $ 5,000,352.00 | spread $ 2,023,952.00 | sub fee $ -
- Row 54: Julien MACHOT | amount $ 349,344.00 | spread $ - | sub fee $ -
- Row 55: VERSO GROUP | amount $ 349,344.00 | spread $ - | sub fee $ -
- Row 71: Global Custody & Clearing Limited | amount $ 1,414,728.00 | spread $ 452,328.00 | sub fee $ 28,294.56
- Row 77: Julien MACHOT | amount $ 34,000.00 | spread $ - | sub fee $ -
- Row 89: GORILLA PE Inc | amount $ 14,999,997.60 | spread $ 3,520,407.60 | sub fee $ -
- Row 95: Julien MACHOT | amount $ 24,736.00 | spread $ - | sub fee $ -
- Row 96: VERSO GROUP | amount $ 24,736.00 | spread $ - | sub fee $ -
- Row 97: Julien MACHOT | amount $ 31,680.00 | spread $ - | sub fee $ -
- Row 98: VERSO GROUP | amount $ 31,680.00 | spread $ - | sub fee $ -
- Row 99: Julien MACHOT | amount $ 74,074.00 | spread $ - | sub fee $ -
- Row 100: VERSO GROUP | amount $ 74,074.00 | spread $ - | sub fee $ -
- Row 186: Charles RIVA | amount $ 500,000.00 | spread $ 138,602.16 | sub fee $ -
- Row 194: GREENLEAF | amount $ 1,549,144.80 | spread $ 429,439.80 | sub fee $ -
- Row 216: Julien MACHOT | amount $ - | spread $ - | sub fee $ -
- Row 219: STABLETON (ALTERNATIVE ISSUANCE) | amount $ 4,163,030.12 | spread $ 852,300.62 | sub fee $ -
- Row 221:  | amount  | spread $ - | sub fee $ -
---

## Fixes applied (2026-02-02)

### Database updates (VC106 subscriptions)
Filled missing **BD fee** and **FINRA fee** amounts for 12 subscriptions (active rows) to match dashboard VC6:

- Craig BROWN → BD 5,000; FINRA 5,000
- TRUE INVESTMENTS 4 LLC → BD 12,399.78
- Imrat HAYAT → BD 7,356; FINRA 7,356
- Hossien JAVID → BD 1,499.40
- Kamyar BADII → BD 599.76
- Shaham SOLOUKI → BD 1,499.40
- Kian JAVID → BD 749.35
- Salman HUSSAIN → BD 1,499.40
- Hedgebay Securities LLC → FINRA 3,018.92, 754.02, 754.02, 754.02

Post-fix totals (VC106 subscriptions):
- BD Fee Amount = **70,603.09**
- FINRA Fee Amount = **57,636.98**

### Regenerated client files (VC106-only)
- `dashboardreconciliations/06_Full_Subscription_Data_VC106.xlsx`
  - Totals now match dashboard active rows (commitment, shares, subscription fees, spread, BD, FINRA)
- `dashboardreconciliations/05_Introducer_Commissions_VC106.xlsx`
  - Totals now match DB (VERSO PARTNER, VERSO BI, Simone, Manna, Terra, Setcap)

Verification (after fix):
- Dashboard active rows: 197
- 06 VC106 rows: 197
- Commitment: 45,363,968.32
- Shares: 2,005,322
- Subscription fees: 593,099.80
- Spread fees: 10,051,471.42
- BD fees: 70,603.09
- FINRA fees: 57,636.98


## 2026-02-02 Hedgebay split (VC106)
- Replaced investor **Hedgebay Securities LLC** with four individual investors per VC6 dashboard rows.
- New investors (type=individual): Aaron RIKHYE, Lakin HARIA, Sheetal HARIA, Tapan SHAH.
- Subscriptions re-linked by commitment/shares/date:
  - Aaron RIKHYE: 100,007.04 / 4,252 / 2021-03-06
  - Lakin HARIA: 24,978.24 / 1,062 / 2021-03-09
  - Sheetal HARIA: 24,978.24 / 1,062 / 2021-03-05
  - Tapan SHAH: 24,978.24 / 1,062 / 2021-03-05
- Positions split to units: 4,252 / 1,062 / 1,062 / 1,062 (total 7,438).
- Commissions re-linked by accrual amount:
  - 8,716.60 → Aaron
  - 2,177.10 ×3 → Lakin / Sheetal / Tapan
  - 0.00 ×4 → one per investor
- Old Hedgebay investor record deleted after relinking all references.
