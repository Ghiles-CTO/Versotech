# Introducer/Partner Data Migration Summary

**Date:** 2026-01-16
**Source:** VERSO DASHBOARD_V1.0.xlsx
**Target:** Supabase Production Database

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Extracted Records | 280 |
| - From INTRODUCERS section | 251 |
| - From PARTNERS section | 29 |
| Unique Introducer Names | 28 |
| New Introducers Created | 17 |
| Subscriptions Updated | 168 |
| Commissions Created | 126 |
| Match Rate | 33.8% |

---

## Introducer Commissions Created

| Introducer | Commissions | Total Amount | Fee Types |
|------------|-------------|--------------|-----------|
| VERSO BI | 80 | $530,751.00 | spread |
| Terra | 15 | $17,957.14 | invested_amount, performance_fee, spread |
| Enguerrand | 7 | $71,520.00 | invested_amount |
| Elevation | 4 | $18,568.20 | invested_amount |
| Sandro | 4 | $8,300.00 | invested_amount |
| Manna Capital | 3 | $40,000.00 | spread |
| Alpha Gaia | 3 | $6,000.00 | invested_amount |
| Simone | 3 | $6.00 | spread |
| Robin | 2 | $6,000.00 | invested_amount |
| AUX | 2 | $3,400.00 | invested_amount |
| Rick | 2 | $23,000.00 | invested_amount |
| Anand | 1 | $0.00 | performance_fee |
| **Total** | **126** | **$725,502.34** | |

---

## Commission Breakdown by Type

| Basis Type | Count | Total Amount | Avg Rate (bps) |
|------------|-------|--------------|----------------|
| spread | 87 | $580,757.00 | 149 |
| invested_amount | 29 | $144,745.34 | 200 |
| performance_fee | 10 | $0.00 | 230 |

---

## Vehicle-Level Match Rates

| Vehicle | Total Subs | With Introducer | Match % | Notes |
|---------|------------|-----------------|---------|-------|
| VC106 | 214 | 92 | 43.0% | Primary VC with most data |
| VC113 | 73 | 34 | 46.6% | Good match rate |
| VC126 | 32 | 17 | 53.1% | Best match rate |
| VC111 | 37 | 14 | 37.8% | |
| VC133 | 16 | 5 | 31.3% | |
| VC125 | 34 | 3 | 8.8% | Low - needs investigation |
| VC118 | 7 | 2 | 28.6% | |
| VC102 | 7 | 1 | 14.3% | |
| VC112 | 25 | 0 | 0.0% | Failed - name extraction issue |
| VC114 | 4 | 0 | 0.0% | No extracted records |
| VC121 | 2 | 0 | 0.0% | No extracted records |
| VC122 | 10 | 0 | 0.0% | No extracted records |
| VC123 | 1 | 0 | 0.0% | No extracted records |
| VC124 | 11 | 0 | 0.0% | No extracted records |
| VC128 | 4 | 0 | 0.0% | No extracted records |
| VC130 | 5 | 0 | 0.0% | No extracted records |
| VC131 | 4 | 0 | 0.0% | No extracted records |
| VC132 | 2 | 0 | 0.0% | No extracted records |
| VC138 | 1 | 0 | 0.0% | No extracted records |
| VC140 | 3 | 0 | 0.0% | No extracted records |
| VC141 | 2 | 0 | 0.0% | No extracted records |
| VC143 | 3 | 0 | 0.0% | No extracted records |

---

## New Introducers Created (17 total)

### From INTRODUCERS Section (14)
- VERSO BI (138 records)
- Elevation (11 records)
- Simone (10 records)
- John (7 records)
- Manna Capital (5 records)
- Anand Sethia (4 records)
- Julien (3 records)
- Robin (2 records)
- FINSA (1 record)
- Stableton+Terra (1 record)
- Rick + Andrew (1 record)
- Elevation+Rick (1 record)

### From PARTNERS Section (3) - Treated as Introducers
- Anand (20 records)
- Dan (8 records)
- Anand+Dan (1 record)

---

## Spot Checks Verified

### NGAN Record (VC106)
| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| Introducer | VERSO BI | VERSO BI | PASS |
| Investor | Chang NGAN | Chang NGAN | PASS |
| Basis Type | spread | spread | PASS |
| Rate | 90 bps | 90 bps | PASS |
| Amount | $5,040.00 | $5,040.00 | PASS |

### WINZ Record (VC113)
| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| Introducer | Terra | Terra | PASS |
| Investor | Barbara and Heinz WINZ | Barbara and Heinz WINZ | PASS |
| Basis Type | performance_fee | performance_fee | PASS |
| Rate | 200 bps | 200 bps | PASS |

---

## Known Issues

### 1. Records with Missing Investor Last Name
Some vehicles had records where investor_last_name was null in extraction:
- VC106: 54/146 records
- VC111: 22/25 records
- VC112: 2/3 records
- VC126: 29/31 records
- VC133: 18/21 records

**Cause:** Variable column positions in Excel sheets. The investor info columns (left side) vary across sheets.

### 2. Vehicles with 0% Match Rate
Multiple vehicles (VC112, VC114, VC121-VC124, VC128, VC130-VC132, VC138, VC140-VC143) had 0 matches.

**Reason:** Either:
- No records extracted from dashboard for those vehicles
- Name matching failed due to null/incorrect investor identifiers

---

## Files Generated

1. `extract_dashboard_v2.py` - Python extraction script with dynamic column detection
2. `extracted_data_v2.json` - Correctly extracted 280 records
3. `generate_batch_migration.py` - SQL generation script
4. `migration_part1_subscriptions.sql` - Subscription update statements
5. `migration_part2_commissions.sql` - Commission insert statements

---

## Applied Migrations

1. `create_missing_introducers_for_migration` - Created 17 new introducers
2. `introducer_migration_part1_subscriptions` - Updated 168 subscriptions
3. `introducer_migration_part2_vc106_commissions` - VC106 spread fees
4. `introducer_migration_part2_vc113_commissions_v2` - VC113 subscription/performance fees
5. `introducer_migration_part2_remaining_vehicles` - VC111, VC118, VC125, VC126, VC133

---

## Recommendations for Remaining Data

1. **Manual Review Required:** 329 subscriptions still without introducer assignment need manual review against the original Excel dashboard.

2. **Name Standardization:** Consider standardizing investor names in the database to match Excel format for better future matching.

3. **Column Position Mapping:** For vehicles with 0% match, manually verify column positions in each sheet and create targeted extraction scripts.

4. **Data Validation:** Compare total fee amounts against business records to validate migration accuracy.
