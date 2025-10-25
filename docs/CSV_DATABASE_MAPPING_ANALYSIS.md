# CSV to Database Vehicle Code Mapping Analysis
**Date:** 2025-10-24
**Status:** CRITICAL MISMATCH IDENTIFIED

## Executive Summary

**Problem:** The CSV contains 636 subscriptions across 38 vehicles (VC1-VC43), but the database has 507 subscriptions across 52 vehicles (VC101-VC218). There is a systematic pattern mismatch that needs cleanup.

**Pattern Discovered:**
- CSV uses base codes: `VC1`, `VC6`, `VC11`, etc. (single or double digit)
- Database uses Series codes: `VC101`, `VC106`, `VC111`, etc. (triple digit with "10" prefix)
- Some database vehicles use `VC201-VC218` (Series 2)

**Impact:**
- 507 subscriptions in database may not match CSV source of truth
- Cannot verify data integrity without proper mapping
- Risk of data loss or duplication if not handled correctly

---

## Complete Vehicle Code Mapping

### CSV Vehicle Codes (38 unique codes)
```
VC1, VC2, VC3, VC4, VC5, VC6, VC7, VC8, VC9, VC10,
VC11, VC12, VC13, VC14, VC15, VC18, VC19, VC20,
VC21, VC22, VC23, VC24, VC25, VC26, VC28, VC29,
VC30, VC31, VC32, VC33, VC34, VC37, VC38, VC40,
VC41, VC42, VC43
```

**Missing from CSV sequence:** VC16, VC17, VC27, VC35, VC36, VC39

### Database Vehicle Codes (52 vehicles)

#### VERSO Capital 1 SCSP Series (VC101-VC143)
```
VC101 (8 subs)    - Maps to CSV: VC1
VC102 (7 subs)    - Maps to CSV: VC2
VC103 (30 subs)   - Maps to CSV: VC3
VC104 (20 subs)   - Maps to CSV: VC4
VC106 (171 subs)  - Maps to CSV: VC6  ⚠️ HIGHEST SUBSCRIPTION COUNT
VC107 (4 subs)    - Maps to CSV: VC7
VC108 (1 sub)     - Maps to CSV: VC8
VC109 (9 subs)    - Maps to CSV: VC9
VC110 (0 subs)    - Maps to CSV: VC10
VC111 (31 subs)   - Maps to CSV: VC11
VC112 (22 subs)   - Maps to CSV: VC12
VC113 (59 subs)   - Maps to CSV: VC13
VC114 (4 subs)    - Maps to CSV: VC14
VC116 (0 subs)    - Maps to CSV: VC16 ❌ NOT IN CSV
VC118 (7 subs)    - Maps to CSV: VC18
VC120 (0 subs)    - Maps to CSV: VC20
VC122 (10 subs)   - Maps to CSV: VC22
VC124 (11 subs)   - Maps to CSV: VC24
VC125 (33 subs)   - Maps to CSV: VC25
VC126 (28 subs)   - Maps to CSV: VC26
VC128 (3 subs)    - Maps to CSV: VC28
VC130 (5 subs)    - Maps to CSV: VC30
VC131 (2 subs)    - Maps to CSV: VC31
VC133 (14 subs)   - Maps to CSV: VC33
VC134 (4 subs)    - Maps to CSV: VC34
VC135 (2 subs)    - Maps to CSV: VC35 ❌ NOT IN CSV
VC138 (0 subs)    - Maps to CSV: VC38
VC140 (0 subs)    - Maps to CSV: VC40
VC141 (1 sub)     - Maps to CSV: VC41
VC143 (3 subs)    - Maps to CSV: VC43
```

#### VERSO Capital 2 SCSP Series (VC201-VC218)
```
VC201 (0 subs)    - Maps to CSV: VC1? ⚠️ AMBIGUOUS
VC202 (0 subs)    - Maps to CSV: VC2? ⚠️ AMBIGUOUS
VC203 (0 subs)    - Maps to CSV: VC3? ⚠️ AMBIGUOUS
VC204 (3 subs)    - Maps to CSV: VC4? ⚠️ AMBIGUOUS
VC205-VC218 (0 subs each) - Future vehicles, not in CSV
```

#### VERSO Capital LLC Series (VCL001-VCL004)
```
VCL001 (0 subs)   - Not in CSV
VCL002 (0 subs)   - Not in CSV
VCL003 (0 subs)   - Not in CSV
VCL004 (0 subs)   - Not in CSV
```

---

## Critical Mismatches Identified

### 1. Missing Database Vehicles for CSV Codes

**CSV codes WITHOUT corresponding Series 101-143 vehicles:**
```
VC5  → VC105 ❌ MISSING (CSV has data, database vehicle doesn't exist)
VC15 → VC115 ❌ MISSING
VC19 → VC119 ❌ MISSING
VC21 → VC121 ❌ MISSING
VC23 → VC123 ❌ MISSING
VC29 → VC129 ❌ MISSING
VC32 → VC132 ❌ MISSING
VC37 → VC137 ❌ MISSING
VC42 → VC142 ❌ MISSING
```

**Impact:** 9 CSV vehicle codes have NO corresponding database vehicle. Their subscriptions cannot be imported!

### 2. Database Vehicles NOT in CSV

**Database codes WITHOUT CSV source:**
```
VC116 (0 subs)  - Maps to VC16 which is NOT in CSV
VC135 (2 subs)  - Maps to VC35 which is NOT in CSV ⚠️ HAS SUBSCRIPTIONS!
```

**Impact:** VC135 has 2 subscriptions but no CSV source. These may be legitimate or orphaned data.

### 3. Series 2 Ambiguity

**Database has VC201-VC218 (VERSO Capital 2 SCSP)**
- Only VC204 has subscriptions (3 subs)
- Unclear if VC204 maps to CSV VC4 or is separate Series 2 vehicle
- Need clarification on Series 1 vs Series 2 strategy

---

## Subscription Count Analysis

### CSV Data Distribution (636 total subscriptions)
```
Top vehicles by subscription count:
VC6:  217 subscriptions  → Database VC106: 171 subs ⚠️ -46 missing
VC13: 76 subscriptions   → Database VC113: 59 subs  ⚠️ -17 missing
VC3:  39 subscriptions   → Database VC103: 30 subs  ⚠️ -9 missing
VC11: 37 subscriptions   → Database VC111: 31 subs  ⚠️ -6 missing
VC25: 33 subscriptions   → Database VC125: 33 subs  ✅ MATCH!
VC26: 28 subscriptions   → Database VC126: 28 subs  ✅ MATCH!
```

### Database Subscription Distribution (507 total)
```
Top vehicles by subscription count:
VC106: 171 subs  (maps to CSV VC6: 217)   - Missing 46 subscriptions
VC113: 59 subs   (maps to CSV VC13: 76)   - Missing 17 subscriptions
VC125: 33 subs   (maps to CSV VC25: 33)   - Perfect match
VC111: 31 subs   (maps to CSV VC11: 37)   - Missing 6 subscriptions
VC103: 30 subs   (maps to CSV VC3: 39)    - Missing 9 subscriptions
```

**Total Discrepancy:**
- CSV: 636 subscriptions
- Database: 507 subscriptions
- **Missing: 129 subscriptions (20.3% data loss)**

---

## Root Cause Analysis

### What Went Wrong?

1. **Incomplete Migration:** Previous import did not process all CSV rows
   - VC106 should have 217 subs but only has 171 (-46 missing)
   - VC113 should have 76 subs but only has 59 (-17 missing)
   - Total: 129 subscriptions never imported

2. **Missing Vehicle Records:** 9 CSV vehicles have no database equivalent
   - VC5, VC15, VC19, VC21, VC23, VC29, VC32, VC37, VC42
   - Their subscriptions could not be imported (vehicle_id foreign key constraint)

3. **Orphaned Data:** VC135 has 2 subscriptions but no CSV source
   - May be manual entries or test data
   - Need to verify legitimacy before cleanup

4. **Series 2 Confusion:** VC201-VC218 exist but unclear purpose
   - Only VC204 has data (3 subs)
   - May overlap with Series 1 (is VC204 same as VC104?)

---

## Cleanup Strategy

### Phase 1: Data Verification (DO THIS FIRST)

**Step 1.1: Verify VC135 Subscriptions**
```sql
-- Check who these 2 subscriptions belong to
SELECT
    s.id,
    s.investor_id,
    i.legal_name,
    s.commitment,
    s.effective_date,
    s.created_at
FROM subscriptions s
LEFT JOIN investors i ON s.investor_id = i.id
WHERE s.vehicle_id = (
    SELECT id FROM vehicles WHERE entity_code = 'VC135'
);
```

**Action:** Determine if these are legitimate or test data to be removed.

**Step 1.2: Verify VC204 Subscriptions**
```sql
-- Check Series 2 vehicle subscriptions
SELECT
    s.id,
    s.investor_id,
    i.legal_name,
    s.commitment,
    s.effective_date
FROM subscriptions s
LEFT JOIN investors i ON s.investor_id = i.id
WHERE s.vehicle_id = (
    SELECT id FROM vehicles WHERE entity_code = 'VC204'
);
```

**Action:** Determine if VC204 is duplicate of VC104 or separate Series 2 vehicle.

**Step 1.3: Get Full CSV Count by Vehicle**
```bash
# Count subscriptions per vehicle code in CSV
awk -F, 'NR>1 {print $3}' master_subscription_rows_final.csv | sort | uniq -c | sort -rn
```

### Phase 2: Create Missing Vehicles

**Create database vehicles for 9 missing CSV codes:**

```sql
-- Template for creating missing vehicles
-- Need to determine actual vehicle names from Excel source
INSERT INTO vehicles (name, entity_code, entity_type, status, created_at)
VALUES
    ('VERSO Capital 1 SCSP Series 105', 'VC105', 'fund', 'active', NOW()),  -- VC5
    ('VERSO Capital 1 SCSP Series 115', 'VC115', 'fund', 'active', NOW()),  -- VC15
    ('VERSO Capital 1 SCSP Series 119', 'VC119', 'fund', 'active', NOW()),  -- VC19
    ('VERSO Capital 1 SCSP Series 121', 'VC121', 'fund', 'active', NOW()),  -- VC21
    ('VERSO Capital 1 SCSP Series 123', 'VC123', 'fund', 'active', NOW()),  -- VC23
    ('VERSO Capital 1 SCSP Series 129', 'VC129', 'fund', 'active', NOW()),  -- VC29
    ('VERSO Capital 1 SCSP Series 132', 'VC132', 'fund', 'active', NOW()),  -- VC32
    ('VERSO Capital 1 SCSP Series 137', 'VC137', 'fund', 'active', NOW()),  -- VC37
    ('VERSO Capital 1 SCSP Series 142', 'VC142', 'fund', 'active', NOW()); -- VC42
```

**⚠️ BLOCKER:** Need actual vehicle names from Excel source before creating these.

### Phase 3: Delete Incorrect Database Data

**Option A: Nuclear - Delete ALL 507 subscriptions and start fresh**
```sql
-- WARNING: This will delete ALL subscriptions
-- Run verification queries first!

BEGIN;

-- Delete all entity_investor links
DELETE FROM entity_investors
WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE entity_code LIKE 'VC1%'
);

-- Delete all subscriptions
DELETE FROM subscriptions
WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE entity_code LIKE 'VC1%'
);

-- Verify deletion
SELECT COUNT(*) FROM subscriptions
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC1%');
-- Should return 0

COMMIT;  -- Only run if verification passes
```

**Option B: Surgical - Keep matching subscriptions, delete extras**
- More complex: requires matching CSV rows to database rows
- Risk of missing matches due to data entry variations
- Recommended only if database has valuable manual entries

**Recommendation:** Use Option A (nuclear) because:
1. CSV is source of truth (636 rows)
2. Database is missing 129 subscriptions (incomplete)
3. Unclear which 507 rows in database are "correct"
4. Cleaner to start fresh than reconcile partial data

### Phase 4: Re-import from CSV

**Use existing subscription_migration scripts with fixes:**

1. **Update config.dev.json with proper mapping:**
```json
{
    "VC1": {"vehicle_id": "471ce5a0-4f02-479b-9050-b0360f9667b2", "skip": false},
    "VC2": {"vehicle_id": "2f2267e2-13a2-4927-a20f-0c5c369db608", "skip": false},
    "VC3": {"vehicle_id": "6fdabfaf-9c40-40ab-a558-11e9f8d0c44f", "skip": false},
    "VC4": {"vehicle_id": "65909db2-d2c7-4edb-8dee-200666649595", "skip": false},
    "VC5": {"vehicle_id": "TO_BE_CREATED", "skip": false},
    "VC6": {"vehicle_id": "ba584abd-ea2b-4a3f-893a-c7e0999f4039", "skip": false},
    ... (continue for all 38 CSV codes)
}
```

2. **Apply idempotency guard from DATABASE_REDESIGN_PLANNING_IMPORTANT.md**
3. **Run import for all 636 subscriptions**
4. **Verify total:**
```sql
SELECT COUNT(*) FROM subscriptions
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC1%');
-- Should return 636
```

---

## Questions for User

### Critical Decisions Needed:

1. **VC135 (2 subscriptions):**
   - Not in CSV - are these legitimate or test data?
   - Keep or delete?

2. **VC204 (3 subscriptions):**
   - Is this separate from VC104, or duplicate?
   - Series 2 strategy - are VC201-VC218 real vehicles or planning placeholders?

3. **Missing vehicles (VC5, VC15, VC19, etc.):**
   - Need actual vehicle names from Excel source
   - Should these be created, or does CSV have incorrect codes?

4. **Cleanup approach:**
   - Nuclear (delete all 507, re-import 636) - RECOMMENDED
   - Surgical (keep matching, delete extras) - Higher risk

5. **Migration timing:**
   - Do this now, or continue with DATABASE_REDESIGN_PLANNING first?
   - Cleanup is Phase 1 of that plan, so timing aligns

---

## Recommended Action Plan

### Immediate Next Steps:

1. **Run verification queries** (VC135, VC204)
2. **User confirms:** Nuclear vs Surgical approach
3. **User provides:** Vehicle names for 9 missing codes
4. **Create missing vehicles** (VC105, VC115, etc.)
5. **Delete all subscriptions** for Series 101-143
6. **Update config.dev.json** with complete mapping
7. **Re-import from CSV** using fixed scripts
8. **Verify 636 total subscriptions**
9. **Continue with DATABASE_REDESIGN_PLANNING Phase 2**

### Timeline:
- Verification: 30 minutes
- Vehicle creation: 1 hour (need names)
- Cleanup + Re-import: 2 hours
- Total: 3-4 hours

### Risk Assessment:
- **High Risk:** Surgical approach (may miss data)
- **Low Risk:** Nuclear approach (CSV is source of truth)
- **Rollback:** Keep SQL backup before deletion

---

## Appendix: SQL Queries for Verification

### Count subscriptions by vehicle
```sql
SELECT
    v.entity_code,
    v.name,
    COUNT(s.id) as subscription_count,
    SUM(s.commitment) as total_commitment
FROM vehicles v
LEFT JOIN subscriptions s ON v.id = s.vehicle_id
WHERE v.entity_code LIKE 'VC1%'
GROUP BY v.entity_code, v.name
ORDER BY v.entity_code;
```

### Find subscriptions without CSV source
```sql
-- Vehicles with data but not in CSV
SELECT
    v.entity_code,
    COUNT(s.id) as subscription_count
FROM vehicles v
LEFT JOIN subscriptions s ON v.id = s.vehicle_id
WHERE v.entity_code IN ('VC116', 'VC135')
GROUP BY v.entity_code;
```

### Check for duplicate investors across vehicles
```sql
SELECT
    i.legal_name,
    COUNT(DISTINCT s.vehicle_id) as vehicle_count,
    COUNT(s.id) as total_subscriptions,
    SUM(s.commitment) as total_commitment
FROM subscriptions s
JOIN investors i ON s.investor_id = i.id
WHERE s.vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC1%')
GROUP BY i.legal_name
HAVING COUNT(DISTINCT s.vehicle_id) > 1
ORDER BY vehicle_count DESC;
```
