# Subscription Data Cleanup Action Plan
**Date:** 2025-10-24
**Status:** READY FOR EXECUTION
**Risk Level:** HIGH (507 subscriptions to be deleted and replaced)

## Executive Summary

**We fucked up - Confirmed.** The database has 507 subscriptions that don't fully match the CSV source of truth (636 subscriptions). Analysis shows:

- **129 subscriptions missing** from database (20.3% data loss)
- **5 orphaned subscriptions** in database but NOT in CSV (need decision)
- **9 vehicle codes missing** from database (cannot import their subscriptions)
- **Data imported yesterday (Oct 24)** appears to be incomplete/partial run

**Recommended Action:** Nuclear cleanup - delete all 507, re-import all 636 from CSV.

---

## Key Findings

### 1. CSV is Source of Truth (636 subscriptions)

**Top vehicles by subscription count in CSV:**
```
VC6:  218 subscriptions  → Database VC106: 171 subs  [-47 missing]
VC13: 76 subscriptions   → Database VC113: 59 subs   [-17 missing]
VC11: 37 subscriptions   → Database VC111: 31 subs   [-6 missing]
VC3:  35 subscriptions   → Database VC103: 30 subs   [-5 missing]
VC4:  34 subscriptions   → Database VC104: 20 subs   [-14 missing]
VC26: 34 subscriptions   → Database VC126: 28 subs   [-6 missing]
VC25: 34 subscriptions   → Database VC125: 33 subs   [-1 missing]
VC12: 24 subscriptions   → Database VC112: 22 subs   [-2 missing]
```

**Note:** CSV actually has 218 for VC6 (not 217 as initially counted).

### 2. Orphaned Database Subscriptions (NOT in CSV)

#### VC135 (2 subscriptions) - NO CSV SOURCE
```
Investor: MEYRIN ACQUISITION
- Subscription 1: CHF 400,000 | Effective: 2022-03-29
- Subscription 2: CHF 400,000 | Effective: 2023-03-29
Created: 2025-10-24 16:08:08 (yesterday's import)
```

**Status:** VC35 does NOT exist in CSV (verified with grep)
**Decision Needed:** Keep or delete? Appears to be duplicate/test data.

#### VC204 (3 subscriptions) - AMBIGUOUS SOURCE
```
Investor: VERSO X
- Subscription 1: USD 100,000 | Effective: 2022-06-14
- Subscription 2: USD 96,000  | Effective: 2022-06-14
- Subscription 3: USD 50,000  | Effective: 2022-06-29
Created: 2025-10-24 16:08:08 (yesterday's import)
```

**Status:** VC204 is VERSO Capital 2 Series 204 (different entity from Series 1)
**Question:** Is this separate from VC4 or duplicate data?

### 3. Missing Database Vehicles (9 codes)

**CSV has these vehicles, but database doesn't:**
```
VC5  → Should be VC105  (VERSO Capital 1 SCSP Series 105)
VC15 → Should be VC115  (VERSO Capital 1 SCSP Series 115)
VC19 → Should be VC119  (VERSO Capital 1 SCSP Series 119)
VC21 → Should be VC121  (VERSO Capital 1 SCSP Series 121)
VC23 → Should be VC123  (VERSO Capital 1 SCSP Series 123)
VC29 → Should be VC129  (VERSO Capital 1 SCSP Series 129)
VC32 → Should be VC132  (VERSO Capital 1 SCSP Series 132)
VC37 → Should be VC137  (VERSO Capital 1 SCSP Series 137)
VC42 → Should be VC142  (VERSO Capital 1 SCSP Series 142)
```

**Impact:** Cannot import subscriptions for these vehicles (foreign key constraint).
**Action Needed:** Create these 9 vehicle records before re-import.

---

## Decisions Needed from User

### Decision 1: VC135 (MEYRIN ACQUISITION - 2 subs)
**Options:**
- A) Delete (NOT in CSV, likely test/duplicate data)
- B) Keep (legitimate manual entry)

**Recommendation:** DELETE - created yesterday during failed import, not in CSV source.

### Decision 2: VC204 (VERSO X - 3 subs)
**Options:**
- A) Series 2 is separate entity, keep these subscriptions
- B) Series 2 is duplicate/error, delete these subscriptions
- C) These belong in VC104 (Series 1), move them before cleanup

**Recommendation:** Need your guidance - is Series 2 (VC201-VC218) a real entity or planning placeholder?

### Decision 3: Cleanup Approach
**Option A: Nuclear (RECOMMENDED)**
- Delete ALL 507 subscriptions for VC101-VC143
- Delete ALL 5 subscriptions for VC135, VC204
- Create 9 missing vehicles
- Re-import all 636 from CSV
- **Pro:** Clean slate, CSV is source of truth
- **Con:** Loses any legitimate manual entries (if they exist)

**Option B: Surgical**
- Keep subscriptions that match CSV rows
- Delete only extras/orphans
- Add missing 129 subscriptions
- **Pro:** Preserves some existing data
- **Con:** Complex reconciliation, high error risk, unclear which 507 are "correct"

**Recommendation:** Nuclear - CSV is source of truth, yesterday's import was incomplete.

### Decision 4: Timing
**Options:**
- A) Do cleanup NOW before continuing with database redesign
- B) Do cleanup AFTER implementing database redesign (subscription_number column)
- C) Combine cleanup WITH redesign Phase 1

**Recommendation:** NOW - this IS Phase 1 of DATABASE_REDESIGN_PLANNING_IMPORTANT.md

---

## Proposed Action Plan (Nuclear Approach)

### Step 1: Backup Current State (5 minutes)
```sql
-- Create backup table
CREATE TABLE subscriptions_backup_20251024 AS
SELECT * FROM subscriptions
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC%');

-- Verify backup
SELECT COUNT(*) FROM subscriptions_backup_20251024;
-- Should return 510 (507 + 3 from VC204)
```

### Step 2: Create Missing Vehicles (30 minutes)

**⚠️ BLOCKER:** Need actual vehicle names from Excel source.

**Temporary approach - use pattern naming:**
```sql
INSERT INTO vehicles (id, name, entity_code, entity_type, status, created_at)
VALUES
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 105', 'VC105', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 115', 'VC115', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 119', 'VC119', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 121', 'VC121', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 123', 'VC123', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 129', 'VC129', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 132', 'VC132', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 137', 'VC137', 'fund', 'active', NOW()),
    (gen_random_uuid(), 'VERSO Capital 1 SCSP Series 142', 'VC142', 'fund', 'active', NOW());

-- Verify creation
SELECT entity_code, name FROM vehicles
WHERE entity_code IN ('VC105', 'VC115', 'VC119', 'VC121', 'VC123', 'VC129', 'VC132', 'VC137', 'VC142')
ORDER BY entity_code;
```

**Better approach:** Extract actual names from original Excel file.

### Step 3: Delete All Subscriptions (10 minutes)

```sql
BEGIN;

-- Delete entity_investor links first (foreign key)
DELETE FROM entity_investors
WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE entity_code LIKE 'VC%'
);

-- Capture count for verification
SELECT COUNT(*) as deleted_links FROM entity_investors
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC%');
-- Should return 0

-- Delete all subscriptions
DELETE FROM subscriptions
WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE entity_code LIKE 'VC%'
);

-- Verify deletion
SELECT COUNT(*) FROM subscriptions
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC%');
-- Should return 0

COMMIT;  -- Only if verification passes
```

### Step 4: Update config.dev.json (20 minutes)

Create complete mapping for all 38 CSV vehicle codes:

```python
# Python script to generate config from database
import json

# Query database for vehicle IDs
vehicles_query = """
SELECT entity_code, id, name
FROM vehicles
WHERE entity_code LIKE 'VC1%' OR entity_code LIKE 'VC2%'
ORDER BY entity_code
"""

# Build mapping: VC1 → VC101, VC6 → VC106, etc.
config = {}
for row in query_result:
    # Extract base code: VC101 → VC1
    base_code = row['entity_code'].replace('VC1', 'VC').replace('VC2', 'VC')
    if base_code.startswith('VC') and len(base_code) <= 4:
        config[base_code] = {
            "vehicle_id": row['id'],
            "vehicle_name": row['name'],
            "skip": False
        }

# Save to config.dev.json
with open('subscription_migration/config.dev.json', 'w') as f:
    json.dump(config, f, indent=2)
```

**Manual verification required:** Ensure all 38 CSV codes have valid vehicle_id.

### Step 5: Apply Idempotency Guard (Already Done)

Code from DATABASE_REDESIGN_PLANNING_IMPORTANT.md:
- Fingerprint check: investor + vehicle + commitment + date
- Skip if exact match exists
- Prevents duplicate imports on rerun

### Step 6: Run Import from CSV (1-2 hours)

```bash
cd subscription_migration
python -m main --csv="../docs/workbook_exports/master_subscription_rows_final.csv" --config="config.dev.json"
```

**Expected output:**
```
Processing 636 subscription rows...
Created: 636
Skipped: 0
Errors: 0
```

### Step 7: Verification (15 minutes)

```sql
-- Count total subscriptions
SELECT COUNT(*) as total_subscriptions
FROM subscriptions
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC1%');
-- Should return 636

-- Count by vehicle (compare with CSV)
SELECT
    v.entity_code,
    v.name,
    COUNT(s.id) as subscription_count,
    SUM(s.commitment) as total_commitment
FROM vehicles v
LEFT JOIN subscriptions s ON v.id = s.vehicle_id
WHERE v.entity_code LIKE 'VC1%'
GROUP BY v.entity_code, v.name
ORDER BY subscription_count DESC;

-- Top should be:
-- VC106: 218 subscriptions (VC6 in CSV)
-- VC113: 76 subscriptions (VC13 in CSV)
-- VC111: 37 subscriptions (VC11 in CSV)

-- Check for any subscriptions without entity_investor link
SELECT COUNT(*) as missing_links
FROM subscriptions s
WHERE s.vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC1%')
  AND NOT EXISTS (
      SELECT 1 FROM entity_investors ei
      WHERE ei.subscription_id = s.id
  );
-- Should return 0 (trigger should auto-create links)
```

### Step 8: Cleanup Junk Investors (30 minutes)

From original context: 390 junk investors remain from failed Oct 22 migration.

```sql
-- Find investors with NO subscriptions and NO entity_investor links
SELECT
    i.id,
    i.legal_name,
    i.created_at,
    (SELECT COUNT(*) FROM subscriptions WHERE investor_id = i.id) as sub_count,
    (SELECT COUNT(*) FROM entity_investors WHERE investor_id = i.id) as link_count
FROM investors i
WHERE created_at::date = '2025-10-22'
  AND NOT EXISTS (SELECT 1 FROM subscriptions WHERE investor_id = i.id)
  AND NOT EXISTS (SELECT 1 FROM entity_investors WHERE investor_id = i.id);

-- Delete junk investors
DELETE FROM investors
WHERE created_at::date = '2025-10-22'
  AND NOT EXISTS (SELECT 1 FROM subscriptions WHERE investor_id = i.id)
  AND NOT EXISTS (SELECT 1 FROM entity_investors WHERE investor_id = i.id);

-- Verify deletion
SELECT COUNT(*) FROM investors WHERE created_at::date = '2025-10-22';
-- Should be much smaller (only those with valid subscriptions)
```

---

## Rollback Plan (If Something Goes Wrong)

### Rollback Step 1: Restore from Backup
```sql
BEGIN;

-- Delete any new subscriptions
DELETE FROM subscriptions
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC%');

-- Restore from backup
INSERT INTO subscriptions
SELECT * FROM subscriptions_backup_20251024;

-- Verify restoration
SELECT COUNT(*) FROM subscriptions
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE entity_code LIKE 'VC%');
-- Should return 510

COMMIT;
```

### Rollback Step 2: Delete Created Vehicles (if needed)
```sql
DELETE FROM vehicles
WHERE entity_code IN ('VC105', 'VC115', 'VC119', 'VC121', 'VC123', 'VC129', 'VC132', 'VC137', 'VC142');
```

---

## Post-Cleanup: Continue Database Redesign

After successful cleanup, proceed with DATABASE_REDESIGN_PLANNING_IMPORTANT.md:

### Phase 2: Database Schema Changes
- Add subscription_number column
- Add unique constraint (investor_id, vehicle_id, subscription_number)
- Add trigger to auto-set subscription_number
- Fix entity_investor trigger (DO NOTHING on conflict)

### Phase 3: Investors Page Implementation
- Create unified investors page (profiles + subscriptions)
- Allow multiple subscriptions per investor-vehicle
- Display total_commitment (already works!)

---

## Risk Assessment

### High Risk Areas:
1. **VC135 & VC204 decision** - wrong choice could lose legitimate data
2. **Missing vehicle names** - generic names may not match actual fund names
3. **Import script bugs** - old bugs could cause same failure again
4. **Trigger conflicts** - entity_investor trigger may interfere with bulk import

### Mitigation:
- Backup everything before deletion ✅
- User confirms decisions before execution ✅
- Apply all bug fixes from DATABASE_REDESIGN_PLANNING ✅
- Test import on small subset first ⚠️ (recommended)

### Success Criteria:
- ✅ 636 subscriptions in database (matches CSV)
- ✅ VC106 has 218 subscriptions (not 171)
- ✅ All subscriptions have entity_investor links
- ✅ No junk investors remaining
- ✅ All vehicle codes have proper mapping

---

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | User decisions (VC135, VC204, approach) | 10 min |
| 2 | Backup current state | 5 min |
| 3 | Create missing vehicles | 30 min |
| 4 | Delete all subscriptions | 10 min |
| 5 | Update config.dev.json | 20 min |
| 6 | Run import from CSV | 1-2 hours |
| 7 | Verification queries | 15 min |
| 8 | Cleanup junk investors | 30 min |
| **Total** | | **3-4 hours** |

---

## Next Steps - AWAITING USER INPUT

**I need you to decide:**

1. **VC135 (MEYRIN ACQUISITION, 2 subs):** Delete or keep?
   - Recommendation: DELETE

2. **VC204 (VERSO X, 3 subs):** Is Series 2 separate or duplicate?
   - Recommendation: Need your guidance

3. **Cleanup approach:** Nuclear or surgical?
   - Recommendation: NUCLEAR

4. **Missing vehicle names:** Use generic names or extract from Excel?
   - Recommendation: Extract from Excel for accuracy

5. **Execute now:** Ready to proceed with cleanup?
   - Recommendation: YES - this is Phase 1 of database redesign

**Once you confirm these decisions, I will:**
1. Create the 9 missing vehicles
2. Execute nuclear cleanup
3. Update config.dev.json
4. Run re-import from CSV
5. Verify 636 subscriptions

**Waiting for your confirmation to proceed.**
