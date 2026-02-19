# VFD Red-Row Review & DB Changes (VC06) — 2026-02-04

Source file: `dashboardreconciliations/06_Full_Subscription_Data_VFD.xlsx`
Scope: **full red rows only** (non‑currency fields)

## Red rows detected (full‑row red)
`61–68, 228, 383–387, 469, 485`

## Changes applied to DB
1. **Deyan MIHOV rename**
   - DB investor name updated to **Deyan D MIHOV** (legal_name + display_name).

2. **ZANDERA (Holdco) rename + type**
   - DB investor **ZANDERA (Holdco) Ltd** renamed to **ZANDERA (Holdco) Ltd Michael RYAN** (legal_name + display_name).
   - Investor `type` set to **individual** to match VFD.

## Rows reviewed — decisions
### Bank SYZ AG (rows 61–68)
- VFD has per‑row **Current Position** values (160, 640, 1546, 1980, 2674, 5291, 5502, 198193).
- **Sum = 215,986** (verified) which matches the **aggregated** DB position for Bank SYZ.
- VFD shows **Performance Fee Tier1 = 0.1** and **BD/FINRA = 0**, but **dashboard has those blank**. DB keeps **NULL**.
- **Decision:** No DB updates for fee fields or positions (reporting mismatch only).

### VC106 VERSO GROUP (row 228)
- VFD row is all‑zero (Commitment = 0, Shares = 0).
- DB has **no** subscription for this row (already removed).
- **Decision:** No DB changes required.

### VC122 funded‑amount rows (383, 385–387)
- VFD has **Funded Amount = NULL**, DB has **Funded = Commitment**.
- **Decision:** No DB change (per instruction: funded equals commitment in DB).

### VC132 Julien MACHOT (row 469)
- Row is **strikethrough** in VFD (full row).
- DB still has this subscription.
- **Decision:** **Deleted in DB** (subscription + position removed; commissions remain).

### VC133 ZANDERA row (row 485)
- VFD name: **ZANDERA (Holdco) Ltd Michael RYAN** (Investor Type: individual).
- DB name was **ZANDERA (Holdco) Ltd** (type entity).
- **Decision:** **Updated DB name + type** (see changes above).

---
If you want the VC132 strikethrough row removed in DB, confirm and I’ll delete subscription + position.

## Partial‑strikethrough renames applied
- VC111: "OEP LIMITED (Transfer from AS ADVISORY DWC LLC)" -> **OEP LIMITED**
- VC122: "INNOVATECH COMPARTMENT 8 Anand SETHA" -> **Anand SETHA**
- VC124: "OEP Ltd Julien MACHOT" -> **Julien MACHOT** (2 subscriptions)
- VC126: "Setcap Anand RATHI" -> **Anand RATHI** (2 subscriptions)
- VC133: "ZANDERA (Holdco) Ltd Michael RYAN" -> **Michael RYAN**

Note: These are derived from partial strikethrough runs inside the VFD investor name cells.

## Additional red‑field fixes (non‑currency)
- IN111 Boris IPPOLITOV: price_per_share set to **290.48** (was 290).
- VC111 Julien MACHOT: **position kept at 410,000** (sum of two dashboard rows: 150,000 + 260,000).  
  The red cell (260,000) is **one subscription**; DB position is aggregated across subscriptions, so total is correct.

## Hedgebay + Lee Rand (VC106)
- VFD shows group/entity names, DB keeps **individual investors** (per your instruction).
- Logged as **expected differences**, no DB changes made.

## Non‑red field mismatches (post‑red fixes)
- 182 mismatches remain when comparing **non‑red** cells only.
- These are almost entirely fee fields where VFD shows 0/0.2/etc and DB is NULL (not marked red, so no DB change).
- Top columns: Performance Fee Tier 1 (%), BD Fee (%/Amount), FINRA Fee Shares/Amount, Subscription Fee (%/Amount).
- If you want DB forced to 0 for these, confirm and I can update.

## Currency fixes
- VC124 Julien MACHOT subscriptions (commitment 50,000 and 2,500; shares 4,125 and 86,430) currency set to **GBP** (was USD).

## Currency comparison
- All currencies now match VFD (0 mismatches).
- Updated regenerated file rows 395–396 (VC124 Julien MACHOT) to GBP to reflect DB fix.
- One no‑match row remains: VC106 VERSO GROUP zero row (no subscription in DB, expected).

## Direct DB currency check (from VFD values)
- Ran 5 SQL chunks joining VFD rows to DB subscriptions by entity_code + commitment + shares + contract_date.
- **No currency mismatches** for existing subscriptions.
- Only two rows returned because **no subscription exists** in DB:
  - Row 228 (VC106 VERSO GROUP, zero row)
  - Row 469 (VC132 Julien MACHOT, deleted per strikethrough)

## Correction (positions)
- VC111 Julien MACHOT: confirmed **410,000** is correct (aggregated position). No further change required.
