# VFD Changes Applied — Summary for Client

Scope: review of **all red‑marked edits** in the VFD file and alignment to the Production database.

## Changes applied
- **Name corrections from strikethroughs** (kept the un‑struck part):
  - OEP LIMITED (Transfer from AS ADVISORY DWC LLC) → **OEP LIMITED**
  - INNOVATECH COMPARTMENT 8 Anand SETHA → **Anand SETHA**
  - OEP Ltd Julien MACHOT → **Julien MACHOT** (2 subscriptions)
  - Setcap Anand RATHI → **Anand RATHI** (2 subscriptions)
  - ZANDERA (Holdco) Ltd Michael RYAN → **Michael RYAN**

- **Row removed (strikethrough row):**
  - VC132 Julien MACHOT (commitment 16,041.99) — subscription + position deleted; commissions kept.

- **Numeric adjustments (red fields):**
  - IN111 Boris IPPOLITOV: **price per share set to 290.48**
  - VC111 Julien MACHOT: **current position set to 260,000**

- **Currency correction:**
  - VC124 Julien MACHOT (commitment 50,000 and 2,500) **currency set to GBP**

## Items reviewed and intentionally left as‑is
- **Bank SYZ (VC106):** per‑row positions in VFD sum to **215,986** which matches the aggregated DB position. Fee fields are blank in the dashboard, so DB remains NULL.
- **VC122 funded amount:** VFD shows NULL; DB keeps **funded = commitment** (per instruction).
- **Hedgebay + Lee Rand (VC106):** remain split into **individual investors** as previously agreed.
- **VERSO GROUP zero row (VC106):** zero‑value row is not in DB (expected).

## Currency validation
- Direct DB check against VFD values shows **no currency mismatches** after the GBP correction above.

