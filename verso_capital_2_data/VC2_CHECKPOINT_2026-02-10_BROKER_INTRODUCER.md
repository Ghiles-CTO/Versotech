# VC2 Checkpoint (2026-02-10)

Scope: broker/introducer cleanup, commission corrections, and split fixes applied to production DB.

---

## 1) Broker vs Introducer Rules

### Current brokers table
| Broker | Contact | Email |
|--------|---------|-------|
| Bromley Capital Partners | Xiaoxiao Yin | xyin@bromleypartners.com |
| Elevation Securities | — | scarter@elevationsecurities.com |
| Old City Securities LLC | Eytan Feldman | eytan@oldcitycapital.com |
| R. F. Lafferty & Co. Inc. | Joseph Gelet | jgelet@vccross.com |

### R. F. Lafferty & Co. Inc. — BROKER (all vehicles)
- Removed from `introducers` table entirely
- 0 commission rows, 0 introduction rows in DB
- Was present in: VC203, VC207, VC209 (dashboard)
- Treatment: all Lafferty commissions deleted; paired introducers adjusted (see Section 3)

### Old City Securities LLC — DUAL ROLE
- Added to `brokers` table (broker contact: Eytan Feldman)
- Introducer data in `introducers` table left untouched (introducer contact: Christine Healey)
- No commissions removed or modified

### Bromley Capital Partners — DUAL ROLE
- **VC215 only**: treated as BROKER. All Bromley commission rows removed. Paired introducers (Infinyte Club, Renaissance, Hottinger AG) kept their original shares only.
- **VC202, VC206, VC209**: treated as legitimate INTRODUCER with commissions.
- Contact: Xiaoxiao Yin, xyin@bromleypartners.com (same contact in all vehicles)
- Re-created in `introducers` table (id: `ec36ff03-3af0-4330-ac7e-301d0a15b78c`)

---

## 2) Bromley Introducer Commissions (re-added)

| Vehicle | Investor | Rate (bps) | Amount | Base |
|---------|----------|-----------|--------|------|
| VC202 | SPLENDID HEIGHT HOLDINGS LIMITED | 80 | $80,000.00 | $9,999,751.16 |
| VC206 | KIWI INNOVATIONS LIMITED | 150 | $30,000.00 | $2,000,000.00 |
| VC209 | SINO SUISSE LLC | 196 | $18,849.42 | $960,000.00 |

Each investor has 3 basis_type rows (invested_amount, spread, performance_fee). Only invested_amount has non-zero values.
3 introduction rows created (status: `allocated`).

Dashboard source formulas:
- VC202: `=2%*40%+0.00001995%` = 0.80% (fee rounds to $80,000.00)
- VC206: flat `0.015` = 1.50%
- VC209: `=3%*66.7%/K3*942000` = 1.96%

---

## 3) Split and Amount Corrections

### VC206 — REDPOINT OMEGA V, L.P. (unequal split fixed)
- Dashboard formula: `=1.10863054575835%+1.21678962339331%`
- Was: equal split $86,000 / $86,000 (233 bps each)
- Now:
  - Visual Sectors: 111 bps, $82,000.00
  - Astral Global Limited: 122 bps, $90,000.00
  - Total: $172,000.00 (unchanged)

### VC209 — PVPL FUND LLC SERIES 3 (Lafferty removal + split correction)
- Dashboard formula: `=1%+0.1%` (Lafferty 1% + Visual Sectors 0.1%)
- Was: Visual Sectors $55,000 at 110 bps (half of old combined 1.1%)
- Incorrectly set to: $110,000 at 110 bps (full amount — wrong, assumed no split)
- Now corrected to: Visual Sectors **10 bps, $10,000.00** on $10,000,000.00 base
- Lafferty's 1% ($100,000) is removed, not transferred

### VC203 — EVERLASTING HOLDINGS LLC (unchanged, previously correct)
- Sakal Advisory, LLC: 50 bps, $5,000.00
- Astral Global Limited: 100 bps, $10,000.00
- Total: $15,000.00

---

## 4) VC215 — Set Cap (Anand) Status

Set Cap is a **spread-only partner** in VC215. This is correct per dashboard.
- invested_amount: 14 rows, all $0.00 (0 bps) — correct, dashboard shows 0.00% sub fees for Anand
- spread: 14 rows, sum $25,654.81 — matches dashboard spread PPS fees
- performance_fee: 14 rows, all $0.00

No changes needed for Set Cap.

---

## 5) Other Introducer Status (unchanged)

### Old City Securities LLC — DUAL ROLE (same as Bromley)
- **Broker**: added to `brokers` table (id: `ae1a61b0-123a-493c-bed0-ca4247211e2c`)
  - Contact: Eytan Feldman, eytan@oldcitycapital.com
- **Introducer**: active in `introducers` table (unchanged, no data modified)
  - Contact: Christine Healey, christine@healeypreipo.com
  - Commission rows: 6, total: $52,500.00
  - Introduction rows: 2
  - Vehicles: VC203 only
- Two distinct contacts in client file — broker contact vs introducer contact

### Bright Views Holdings — INTERNAL PLACEHOLDER
- Commission rows: 3 (all Jamel CHANDOUL, $3,000 each = $9,000)
- Introduction rows: 1
- Not a real introducer; migration artifact

### R. F. Lafferty & Co. Inc. — FULLY REMOVED
- 0 rows in `introducers`, 0 commissions, 0 introductions
- Dashboard/export files still reference the name (file cleanup pending)

---

## 6) Remaining Open Items

1. **Client export file** (`VERSO Capital 2 SCSp - Subscriptions and Introducers.xlsx`) still contains Lafferty names in VC203 — needs file update
2. **Dashboard file** still references Lafferty in VC203/VC207/VC209 and Bromley in VC215 — source spreadsheet, may need manual note
3. **VC206 REDPOINT OMEGA ASSOCIATES V, LLC** — solo Visual Sectors row at 3123 bps / $60,000 on $192,117.22 — not touched, verify if correct
4. **Bright Views Holdings** — 3 residual rows ($9,000) for Jamel CHANDOUL — low priority cleanup
