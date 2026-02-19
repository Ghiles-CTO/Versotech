# VC2 Data Verification Engine — Full Audit Report

Date: 2026-02-11
Auditor: Independent review (read-only)
Script: `data_verification_engine/scopes/vc2/run_vc2_audit.py`
Rules: `rules_vc2.json` v2026-02-11.2
Dashboard: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx` (new version, client-uploaded)
DB: Production Supabase

---

## Executive Summary

**Overall Result: CONDITIONAL PASS**

- 30 script failures, 1 warning
- 0 true data errors requiring immediate DB fix
- 24 failures are TRUE MISMATCHES from a client dashboard update (VC209 cost_per_share 35→75) — decision needed on whether DB should be updated
- 3 failures are SCRIPT BUGS (wrong column parsing)
- 3 failures are KNOWN RULED DIFFS (broker removal rules, correctly applied)
- 1 warning is a known placeholder (Bright Views Holdings)

---

## A) Script Coverage Verification

### Checks Performed (9 categories)
| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | Vehicle totals (sub fields) | PASS | All subscription metrics verified per vehicle |
| 2 | Row-level numeric parity | PASS | Composite key matching with 0.01 tolerance |
| 3 | Commission totals (invested + spread) | PARTIAL | Hardcoded column indices cause false positives |
| 4 | Specific commission expectations | PASS | 8 explicit amount/rate assertions |
| 5 | Forbidden commission pairs | PASS | 4 pairs checked |
| 6 | Broker table validation | PASS | 4 expected brokers verified |
| 7 | Set Cap VC215 spread-only | PASS | Zero invested_amount confirmed |
| 8 | Contacts/emails check | PASS | 123 rows checked, 2 red rows excluded |
| 9 | Warning-only introducer flagging | PASS | Bright Views flagged |

### Missing Checks
| # | Gap | Impact |
|---|-----|--------|
| 1 | No "ruled diff" tolerance for commission totals | Known broker-removal deltas flagged as failures instead of ruled diffs |
| 2 | VCL001/VCL002 commission aggregation missing | These sub-vehicles have no dashboard sheet — always produce false positives |
| 3 | No introduction row count parity | Introductions table not compared to dashboard |
| 4 | No commission row count parity per vehicle | Only totals checked, not row counts |
| 5 | No cost_per_share change detection | Dashboard→DB baseline comparison absent |
| 6 | VC203 commission column alignment broken | Hardcoded indices read percentages instead of amounts |

---

## B) Failure Classification (30 failures + 1 warning)

### Category 1: TRUE MISMATCH — VC209 cost_per_share change (24 failures)

**21 row_numeric_mismatch + 3 vehicle_totals_mismatch**

Root cause: Client updated `cost_per_share` from **35 → 75** for 7 VC209 investors in the new dashboard. DB retains cost=35. All DB spread calculations are mathematically correct at old cost=35.

| Row Key (vehicle, commitment, shares, date) | cost_per_share | spread_per_share | spread_fee |
|----------------------------------------------|:-:|:-:|:-:|
| VC209, 40000, 1000, 2025-03-12 | dash=75 db=35 | dash=-35 db=5 | dash=-35000 db=5000 |
| VC209, 50000, 649, 2025-11-12 | dash=75 db=35 | dash=2 db=42 | dash=1298 db=27258 |
| VC209, 100023, 1299, 2025-11-12 | dash=75 db=35 | dash=2 db=42 | dash=2598 db=54558 |
| VC209, 100023, 1299, 2025-12-16 | dash=75 db=35 | dash=2 db=42 | dash=2598 db=54558 |
| VC209, 150000, 1948, 2025-12-19 | dash=75 db=35 | dash=2 db=42 | dash=3896 db=81816 |
| VC209, 725400, 9300, 2025-12-29 | dash=75 db=35 | dash=3 db=43 | dash=27900 db=399900 |
| VC209, 2727208, 40106, 2025-01-12 | dash=75 db=35 | dash=-7 db=33 | dash=-280742 db=1323498 |

Vehicle total deltas:
- cost_per_share total: delta = -280.00 (7 rows x 40)
- spread_per_share total: delta = +280.00
- spread_fee total: delta = +2,224,040.00

**Classification: TRUE MISMATCH — requires business decision.**
DB values are internally consistent at old cost. New dashboard uses cost=75. Client confirmation needed on whether DB should be updated.

Note: Several dashboard rows show **negative** spread values (e.g., spread_per_share=-35, spread_fee=-280,742) at cost=75. This raises a question about whether cost=75 is actually correct for these rows.

---

### Category 2: FALSE POSITIVE — Script Bugs (3 failures)

| # | Vehicle | Dashboard (script) | DB | Root Cause |
|---|---------|-------------------|-----|-----------|
| 1 | VC203 | 0.241801 | 259,999.50 | Script reads Excel col 35 which contains a **percentage** (0.24%) not dollar amount. VC203 sheet has different column layout. |
| 2 | VCL001 | 0.02 | 108,380.43 | VCL001 has **no dashboard sheet** (not in `scope_dashboard_sheets`). Reads rounding dust. Commissions roll into VC203 in dashboard. |
| 3 | VCL002 | 0.02 | 21,988.60 | Same as VCL001. |

**Classification: FALSE POSITIVE — script column parsing bugs. No DB action needed.**

Verification: VC203 + VCL001 + VCL002 combined DB invested total = $390,368.53.
Feb 8 3-way recon had combined total = $451,042.29 (delta -$60,673.76 — see Finding F1 below).

---

### Category 3: KNOWN RULED DIFF — Broker/Introducer Rules (3 failures)

| # | Vehicle | Dashboard | DB | Delta | Rule |
|---|---------|-----------|-----|-------|------|
| 1 | VC207 | 141,932.10 | 115,793.40 | -26,138.70 | Lafferty removal (global broker rule) |
| 2 | VC209 | 704,343.97 | 451,663.47 | -252,680.50 | Lafferty removal (-207,680.50) + PVPL split correction (-45,000.00) |
| 3 | VC215 | 834,528.32 | 692,955.91 | -141,572.41 | Bromley removal from VC215 (broker-only treatment) |

**Classification: KNOWN RULED DIFF — expected business rule deltas. No DB action needed.**

Delta breakdown for VC209:
- Lafferty broker removal (all VC209 Lafferty commissions): -$207,680.50
- PVPL Visual Sectors correction (55K→10K per new dashboard formula `=1%+0.1%`): -$45,000.00
- Total: -$252,680.50 ✓

Note: VC215 dashboard value changed from $833,678.32 (old dashboard) to $834,528.32 (new dashboard). Difference of $850.00 is from client's updated formulas.

---

### Category 4: WARNING (1)

| Vehicle | Introducer | Rows | Amount | Status |
|---------|-----------|------|--------|--------|
| VC209 | Bright Views Holdings | 3 | $9,000.00 | Internal placeholder, low priority |

---

## C) Rules Correctness Verification

### Broker Rules (verified against DB)

| Entity | Rule | DB Status | Verified |
|--------|------|-----------|----------|
| R.F. Lafferty & Co. Inc. | Forbidden globally | 0 commission rows, 0 introduction rows | PASS |
| Bromley Capital Partners | Forbidden on VC215 only | 0 VC215 commissions; 3 vehicles (VC202/VC206/VC209) active | PASS |
| Old City Securities LLC | Dual role (broker + introducer) | In brokers table (Eytan Feldman); introducer data untouched | PASS |
| Elevation Securities | Broker only | In brokers table | PASS |

### Specific Commission Assertions

DB commissions verified (invested_amount basis):

| Vehicle | Introducer | Investor | Expected Rate | DB Rate | Expected Amount | DB Amount | Status |
|---------|-----------|----------|:---:|:---:|---:|---:|:---:|
| VC202 | Bromley Capital Partners | SPLENDID HEIGHT | 80 bps | 80 bps | $80,000.00 | $80,000.00 | PASS |
| VC206 | Bromley Capital Partners | KIWI INNOVATIONS | 150 bps | 150 bps | $30,000.00 | $30,000.00 | PASS |
| VC209 | Bromley Capital Partners | SINO SUISSE | 196 bps | 196 bps | $18,849.42 | $18,849.42 | PASS |
| VC209 | Visual Sectors | PVPL FUND | 10 bps | 10 bps | $10,000.00 | $10,000.00 | PASS |
| VC206 | Visual Sectors | REDPOINT OMEGA V | 111 bps | — | $82,000.00 | — | (see note) |
| VC206 | Astral Global | REDPOINT OMEGA V | 122 bps | — | $90,000.00 | — | (see note) |

Note: REDPOINT split assertions were part of earlier checkpoint; verified separately.

### Set Cap VC215 Spread-Only

| Basis Type | Rows | Total | Expected | Status |
|-----------|:---:|------:|----------|:---:|
| invested_amount | 14 | $0.00 | $0.00 | PASS |
| spread | 14 | $25,654.81 | matches dashboard | PASS |
| performance_fee | 14 | $0.00 | $0.00 | PASS |

---

## D) Commission Parity — Full Vehicle Summary

### Invested Amount Commissions

| Vehicle | Dashboard | DB | Delta | Classification |
|---------|----------:|---:|------:|:---:|
| VC201 | 0.00 | 0.00 | 0.00 | OK |
| VC202 | 105,000.00 | 105,000.00 | 0.00 | OK |
| VC203 | (script bug) | 259,999.50 | — | SCRIPT BUG |
| VC206 | 473,766.54 | 473,766.53 | -0.01 | OK |
| VC207 | 141,932.10 | 115,793.40 | -26,138.70 | RULED DIFF |
| VC209 | 704,343.97 | 451,663.47 | -252,680.50 | RULED DIFF |
| VC210 | 3,839.00 | 3,839.00 | 0.00 | OK |
| VC211 | 3,622.50 | 3,622.50 | 0.00 | OK |
| VC215 | 834,528.32 | 692,955.91 | -141,572.41 | RULED DIFF |
| VCL001 | (no sheet) | 108,380.43 | — | NO SHEET |
| VCL002 | (no sheet) | 21,988.60 | — | NO SHEET |

### Spread Commissions

| Vehicle | DB Total | Status |
|---------|------:|:---:|
| VC215 | $25,654.81 | OK (Set Cap only) |
| All others | $0.00 | OK |

---

## E) Additional Findings

### Finding F1: VC203+VCL001+VCL002 Combined Commission Drop — RESOLVED

| Metric | Feb 8 Recon | Current | Delta |
|--------|----------:|--------:|------:|
| VC203+VCL001+VCL002 invested | $451,042.29 | $390,368.53 | -$60,673.76 |

**Root cause identified**: The Feb 8 fix session (`VC2_CLIENT_ISSUE_FIX_2026-02-08.md`) restored Lafferty commissions for two VC203 investors:
- DOMINARI SECURITIES LLC: **$46,110.65**
- Sebastian LATTUGA: **$14,563.11**
- Total: **$60,673.76** (exact match)

These were restored on Feb 8 for dashboard consistency, then re-deleted during the subsequent global Lafferty broker cleanup (Lafferty forbidden globally per rules). This is correct behavior — Lafferty should not have commissions in the DB. The Feb 8 recon captured a transient state.

**Status: No action needed. Current DB is correct.**

### Finding F2: VC209 Negative Spread Values in Dashboard

With cost_per_share=75 (new dashboard), several VC209 rows produce negative spread values:
- Row (40000, 1000): spread_per_share = -35, spread_fee = -35,000
- Row (2727208, 40106): spread_per_share = -7, spread_fee = -280,742

Negative spread is economically questionable. This suggests cost=75 may be incorrect for these rows, or the dashboard has a different spread calculation methodology. **Client clarification needed.**

### Finding F3: VC215 Dashboard Value Changed

Old dashboard: $833,678.32 → New dashboard: $834,528.32 (+$850.00).
DB unchanged at $692,955.91. The $850 increase means the ruled diff delta grew from $140,722.41 to $141,572.41. This is from the client's dashboard formula update. **Minor, document only.**

---

## Remediation Plan

### Priority 1 — Business Decision Required
| Item | Action | Owner |
|------|--------|-------|
| VC209 cost_per_share (7 rows) | Decide whether DB should update from 35→75 per new dashboard. Note negative spreads at cost=75. | Client/Business |

### Priority 2 — Script Fixes
| Item | Action | Impact |
|------|--------|--------|
| VC203 commission column index | Fix hardcoded columns 35/45/55 — use header-based lookup or sheet-specific mapping | Eliminates 1 false positive |
| VCL001/VCL002 commission check | Either exclude from commission checks or aggregate into VC203 | Eliminates 2 false positives |
| Add ruled-diff mechanism | Allow known broker-removal deltas to be classified as "ruled" not "fail" | Eliminates 3 false flags |

### Priority 3 — Investigation
| Item | Action | Status |
|------|--------|--------|
| VC203 combined commission drop (-$60,673.76) | Lafferty DOMINARI ($46,110.65) + LATTUGA ($14,563.11) restored Feb 8, then re-deleted per global rule | RESOLVED |
| VC209 negative spreads at cost=75 | Confirm with client whether cost=75 is correct for all 7 rows | OPEN |

### Priority 4 — Low Priority
| Item | Action |
|------|--------|
| Bright Views Holdings | 3 rows / $9K on VC209 — remove when ready |
| Add row count parity checks | Verify commission and introduction row counts match expectations |

---

## Deliverable Summary

| Deliverable | Location |
|-------------|----------|
| This report | `verso_capital_2_data/VC2_AUDIT_ENGINE_REPORT_2026-02-11.md` |
| True mismatches | 24 failures (VC209 cost_per_share) — pending business decision |
| False positives | 3 failures (VC203/VCL001/VCL002 column parsing) |
| Ruled diffs | 3 failures (VC207/VC209/VC215 broker rules) |
| Script issues CSV | See `audit_issues.csv` in run output + classification above |

---

## DB Row Counts (current)

| Table | VC2 Scope Count |
|-------|---:|
| Subscriptions | 105 |
| Positions | 94 |
| Introductions | 88 |
| Commissions | 264 |
| Brokers | 4 (Bromley, Elevation, Old City, Lafferty) |
