# VFD Review Findings (06_Full_Subscription_Data_VFD.xlsx)

## Scope
- File reviewed: `dashboardreconciliations/06_Full_Subscription_Data_VFD.xlsx`
- No DB changes performed.

## Strikethrough (remove)
- **Row 469** (VC132 / Julien MACHOT / AIRSPEEDER SAFE Bridge) is strikethrough → remove.

## VC106 – Key findings from VFD

### 1) Bank SYZ rows (to be excluded from launch)
Rows **61–68** are **Bank SYZ AG**:
- **Commitment total:** 5,080,000.00
- **Shares total:** 215,986
- **Spread fee total:** 848,340.72
- Current Position cells are formulas (`=+Gxx`); should be treated as Shares.

### 2) Investor name corrections flagged (colored Investor Name)
Rows with colored **Investor Name** in VC106:
- **Bank SYZ AG** (rows 61–68)
- **Hedgebay Securities LLC** (rows 120–123) → should be split into individuals: Aaron RIKHYE, Lakin HARIA, Sheetal HARIA, Tapan SHAH
- **LEE RAND GROUP** (rows 158–164) → should be split into individuals (per previous rule)
- **VERSO GROUP** (row 228)

### 3) Funded Amount = 0 (colored)
VC106 rows where **Funded Amount** is colored and equals **0** (needs review):
- Row 38 – Anisha Bansal and Rahul KARKUN
- Row 69 – Barbara and Heinz WINZ
- Row 71 – Beatrice and Marcel KNOPF
- Row 106 – Eric LE SEIGNEUR
- Row 120 – Hedgebay Securities LLC
- Row 159 – LEE RAND GROUP
- Row 161 – LEE RAND GROUP
- Row 163 – LEE RAND GROUP
- Row 184 – Nilakantan MAHESWARI & Subbiah SUBRAMANIAN
- Row 185 – OEP Ltd
- Row 209 – Scott FLETCHER
- Row 228 – VERSO GROUP

### 4) VERSO GROUP row appears zeroed in VFD
- **Row 228** has Commitment/Funded/Shares/Position = 0 in VFD.
- **DB has** VERSO GROUP = 90,940 commitment / 4,547 shares (contract 2021‑05‑17).
- This row explains the **gap** between VFD totals and DB totals.

## VC106 Totals (VFD vs DB)
**DB totals (VC106):**
- Commitment: 45,363,968.32
- Shares: 2,005,322
- Position units: 1,969,517
- Sub fee: 593,099.8112
- Spread fee: 10,051,471.41785
- BD fee: 70,603.09
- FINRA fee: 57,636.98

**VFD totals (VC106):**
- Commitment: 45,273,028.32 **(‑90,940)**
- Shares: 2,000,775 **(‑4,547)**
- Position (using Shares for formula rows): 1,969,517 **(match)**
- Sub fee: 593,099.8112 **(match)**
- Spread fee: 10,051,471.41785 **(match)**
- FINRA fee: 57,636.98 **(match)**
- **BD fee: 0.80** (does not match DB; appears mostly blank in VFD)

## Row 148 (VC106)
Row 148 (Karthic JAYARAMAN) in VFD:
- Commitment 400,000 / Shares 17,006 / Sub fee 8,000 / Spread fee 68,364.12
- Contract date: 2021‑04‑20

---
Next: confirm which of the above corrections should be applied to Production (no changes made yet).
