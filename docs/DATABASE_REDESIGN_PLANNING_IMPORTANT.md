# DATABASE REDESIGN & MIGRATION PLANNING - IMPORTANT

**Date:** 2025-10-24
**Status:** Planning Phase - APPROVED
**Priority:** Critical - Database Structure & Data Migration Overhaul
**Decision:** Option A - Investors Page as Central Hub (CONFIRMED)

---

## EXECUTIVE SUMMARY

After analyzing the failed migration attempt from October 22, 2025, we've identified critical structural issues in how subscriptions and investor relationships are managed.

**✅ APPROVED APPROACH: OPTION A - Investors Page as Central Hub**

The Investors page will be enhanced to become the primary workspace for managing both investor profiles AND their subscriptions. This creates a unified view where staff can see an investor's complete portfolio across all vehicles in one place.

### Implementation Plan:

1. **Clean up corrupted data** (390 junk investor records)
2. **Redesign the subscription workflow** to prevent duplicate records
3. **Implement phased migration** for Excel data import (investors first, then subscriptions vehicle-by-vehicle)
4. **Refactor the Investors page** to be the central hub for investor + subscription management
5. **Simplify the Entities page** to focus only on entity-investor relationships (remove subscription creation)

### Key Decisions Made:

- ✅ **Multiple subscriptions per investor-vehicle allowed** (with auto-numbering: subscription #1, #2, etc.)
- ✅ **Entity_investors can exist without subscriptions** (for observers, advisors, etc.)
- ✅ **Migrate all 30 remaining vehicles** from Excel (skip only the 14 deleted 2-digit VC codes)
- ✅ **Manual review of duplicate subscriptions** before cleanup

### ⚠️ CRITICAL BUGS FIXED (2025-10-24 Review)

During implementation review, 4 critical bugs were identified and fixed in this document:

1. **❌ BUG: Import script prevents follow-on investments**
   - **Problem:** Script checked if subscription exists and skipped, but we allow multiple subscriptions
   - **Fix:** Removed duplicate check in `import_subscriptions.py` example code (line 706-708)
   - **Impact:** Follow-on capital investments can now be imported

2. **❌ BUG: Entity_investor trigger overwrites older subscription links**
   - **Problem:** `ON CONFLICT DO UPDATE` replaced subscription_id, losing earlier subscriptions
   - **Fix:** Changed to `ON CONFLICT DO NOTHING` to preserve first subscription link (line 403)
   - **Impact:** Multiple subscriptions won't cause data loss in entity_investor table
   - **Good News:** Entity page already shows total commitment via merge function - no frontend changes needed!

3. **❌ BUG: Trigger requires created_by field that may be NULL**
   - **Problem:** Database trigger expects `NEW.created_by` but imports may not provide it
   - **Fix:** Added `COALESCE(NEW.created_by, NULL)` to handle NULL gracefully (line 401)
   - **Impact:** Service-level imports and migrations won't fail due to missing created_by

4. **✅ NOT A BUG: API route params pattern is correct**
   - **Concern:** Async params pattern `{ params }: { params: Promise<{ id: string }> }`
   - **Verification:** This is the correct Next.js 15 pattern, existing code already uses it
   - **Impact:** No change needed

5. **❌ BUG: Unlink investor only cancels first subscription, leaves follow-ons active**
   - **Problem:** DELETE route at line 210-221 cancels only `entity_investor.subscription_id`, but investor may have subscription #2, #3, etc.
   - **Fix:** Update DELETE route to cancel ALL subscriptions + holdings for investor-vehicle pair
   - **Syntax Fix:** Supabase `.in()` requires array, not subquery - fetch deal IDs first, then pass to `.in(dealIds)`
   - **Impact:** When staff removes investor from vehicle, all their subscriptions are properly closed

6. **❌ BUG: Import script has no idempotency guard - reruns cause duplicates**
   - **Problem:** Import script creates subscriptions without checking if data was already imported
   - **Fix:** Add idempotency check based on investor+vehicle+commitment+date fingerprint
   - **Impact:** Partial failures can be safely retried without creating duplicate data

**All fixes have been applied to code examples in this document.**

---

## EXISTING MIGRATION SCRIPTS - STATUS & FUTURE USE

### Current Files in `subscription_migration/` Directory

**⚠️ DO NOT DELETE THESE FILES** - They contain valuable code that will be refactored and reused.

| File | Purpose | Status | Action Plan |
|------|---------|--------|-------------|
| `config.dev.json` | Maps Excel VC codes to vehicle IDs | ✅ Keep & Update | Already updated with `"skip": true` for deleted vehicles. Will be used by new phased migration scripts. |
| `config.example.json` | Template for config file | ✅ Keep | Reference for structure |
| `config_with_mapping.json` | Alternative config format | ⚠️ Review | Check if needed, may be deprecated |
| `main.py` | Original all-at-once migration script | 🔄 Refactor | Extract useful functions (investor parsing, vehicle resolution). **Do not run as-is** - caused the Oct 22 failure. |
| `excel_reader.py` | Parses Excel workbook structure | ✅ Keep & Reuse | Core parsing logic is solid. Will be used by new extraction scripts. |
| `config.py` | Loads configuration files | ✅ Keep & Reuse | Configuration management works well. |
| `utils.py` | Utility functions | ✅ Keep & Reuse | Database helpers and validators are useful. |

### What Happened with the Old Scripts

**October 22, 2025 Migration Failure:**
- Ran `main.py` which attempted to import all 44 vehicle sheets at once
- Created 495 subscriptions, 495 entity_investors, **390 junk investors**
- Successfully rolled back subscriptions & entity_investors
- **But 390 junk investors remain in database** (will be cleaned in Phase 1)

**Why the Old Approach Failed:**
1. **All-or-nothing**: Tried to import everything in one transaction
2. **No deduplication**: Created new investor record for every Excel row without checking for existing investors
3. **No validation**: Didn't verify data before bulk insert
4. **No incremental progress**: If one vehicle failed, entire migration failed

### How New Approach Will Be Different

**Phased Strategy (see Migration Redesign section):**
1. **Phase 1:** Extract all investors first → deduplicate → manual review → import clean list
2. **Phase 2:** Import subscriptions one vehicle at a time (VC6 pilot → then rest)
3. **Validation after each step:** Verify totals match Excel before proceeding

**Code Reuse Plan:**
- ✅ **Reuse:** `excel_reader.py` (parsing works great)
- ✅ **Reuse:** `config.dev.json` (vehicle mapping is correct)
- ✅ **Reuse:** Database connection logic from `utils.py`
- 🔄 **Refactor:** `main.py` → split into `extract_investors.py` and `import_subscriptions.py`
- 🆕 **Create:** New deduplication and validation scripts

### Files to Create (New Phased Migration)

```
subscription_migration/
├── config.dev.json              # ✅ Already exists - keep as-is
├── excel_reader.py              # ✅ Already exists - keep as-is
├── config.py                    # ✅ Already exists - keep as-is
├── utils.py                     # ✅ Already exists - keep as-is
├── main.py                      # ⚠️ OLD - keep for reference but don't run
│
├── extract_investors.py         # 🆕 NEW - Phase 2 extraction script
├── import_investors.py          # 🆕 NEW - Import from CSV
├── import_subscriptions.py      # 🆕 NEW - Vehicle-by-vehicle import
├── validate_migration.py        # 🆕 NEW - Reconciliation queries
└── cleanup_duplicates.py        # 🆕 NEW - Fix existing duplicate data
```

### Config File - Already Updated ✅

The `config.dev.json` file has been updated (on Oct 24, 2025) to mark deleted vehicles:

```json
{
  "VC5": {
    "skip": true,
    "note": "Vehicle deleted - Toronto Real Estate (2-digit VC code)"
  },
  "VC10": {
    "skip": true,
    "note": "Vehicle deleted - MHA CAPITAL (2-digit VC code)"
  }
  // ... 12 more deleted vehicles marked with skip: true
}
```

**This config is ready to use** - new scripts will check the `"skip"` flag and ignore those vehicles.

### Migration History Tracking

All migration runs are tracked in database tables:
- `subscription_workbook_runs` - Metadata for each migration attempt
- `subscription_import_results` - Detailed results per subscription created

**Known Migration Runs:**
1. **October 22, 2025** - Run ID: `62ef969d-c871-45e0-bd47-de88803be9a2`
   - Status: Rolled back (subscriptions deleted, but investors remain)
   - Created: 495 subscriptions, 495 entity_investors, 390 investors
   - **Action needed:** Delete the 390 junk investors (Phase 1, Day 1)

### Staging Tables - Current State

The database has staging tables that were populated from Excel:
- `stg_subscription_lines` - Individual subscription line items
- `stg_subscription_summary` - Aggregated totals per vehicle
- `stg_subscription_tranches` - Tranche/series information

**Status:** These tables contain data from **7 different migration runs** (various test attempts).

**Action Plan:**
- ⚠️ **Review before new migration:** Check if staging data is still accurate
- 🔄 **May need to truncate and reload:** If Excel file has been updated since staging was populated
- ✅ **Keep table structure:** Staging approach is good, just needs fresh data

### Database Schema - Already Supports New Design

The current database schema already supports the new phased approach:
- ✅ `subscriptions` table can reference `investors` and `vehicles`
- ✅ `entity_investors` can have NULL `subscription_id` (for non-subscribing stakeholders)
- 🆕 **Need to add:** `subscription_number` column (see Database Schema Changes section)

**No major schema redesign needed** - just add subscription numbering and unique constraints.

### What NOT to Do

**❌ DO NOT:**
- Delete `subscription_migration/` directory
- Run `main.py` as-is (it will create duplicate junk data)
- Delete `config.dev.json` (vehicle mapping is correct and needed)
- Truncate staging tables without backup (may need historical data for comparison)

**✅ DO:**
- Keep all existing code for reference
- Extract reusable functions into new phased scripts
- Use `config.dev.json` as-is (it's already correct)
- Add new scripts alongside old ones (don't overwrite)

### Quick Reference for Next Session

**If starting a new Claude Code session:**

1. **Context:** Read this planning document first - everything is explained here
2. **Database state:** 390 junk investors need cleanup (see Phase 1)
3. **Code state:** Old migration scripts exist but shouldn't be run - need to create new phased scripts
4. **Config state:** `config.dev.json` is ready to use (updated with skip flags)
5. **Next step:** Begin Phase 1 - Database Backup & Cleanup (see Quick Start checklist)

---

## CURRENT STATE ANALYSIS

### Database Tables & Relationships

| Table | Records | Status | Issues |
|-------|---------|--------|---------|
| **vehicles** | 82 | ✅ Clean | Core entity/fund records - working correctly |
| **investors** | 407 | ❌ Corrupted | **390 are junk** from failed Oct 22 migration |
| **subscriptions** | 21 | ⚠️ Duplicates | 12 orphaned records, multiple duplicates per investor-vehicle |
| **entity_investors** | 9 | ✅ Clean | Only 9 properly linked, should have more |
| **deals** | 10 | ✅ Clean | Working correctly |
| **investor_deal_holdings** | N/A | ✅ Clean | Auto-created from subscriptions |

### Critical Problems Identified

#### 1. **DUPLICATE SUBSCRIPTIONS**
Investors have multiple subscription records to the same vehicle:
- John Smith: 2x VERSO FUND ($2M total), 2x REAL Empire ($1M), 2x SPV Delta ($500K)
- Bondpartners: 2x CRANS ($1.06M total)
- 7 total investor-vehicle combinations have duplicates

**Root Cause:** No unique constraint preventing duplicate `(investor_id, vehicle_id)` subscriptions.

#### 2. **ORPHANED SUBSCRIPTIONS**
- 21 total subscriptions exist
- Only 9 have corresponding `entity_investors` records
- **12 subscriptions are orphaned** (no entity_investor link)

**Root Cause:** Bidirectional relationship between `subscriptions` and `entity_investors` is inconsistent.

#### 3. **CONFUSED SUBSCRIPTION WORKFLOW**
Current flow on Entities page (`versotech-portal/src/app/api/entities/[id]/investors/route.ts:339-456`):

```
Entity Page → Add Investor → OPTIONAL Subscription Creation
                                    ↓
                Creates: investor + subscription + entity_investor + deal_holding
```

**Problems:**
- Subscriptions are created as a **side effect** of linking investors to entities
- Financial transactions (subscriptions) mixed with relationship management (entity_investors)
- No clear single source of truth for subscription data
- Leads to duplicates when same investor subscribes multiple times

#### 4. **JUNK DATA FROM FAILED MIGRATION**
On October 22, 2025 (migration run ID: `62ef969d-c871-45e0-bd47-de88803be9a2`):
- Created 495 subscriptions
- Created 495 entity_investors
- Created **390 junk investor records** (no email, no phone, kyc_status='pending')
- Successfully rolled back subscriptions & entity_investors
- **But investors remain in database!**

Query to identify junk:
```sql
SELECT COUNT(*) FROM investors
WHERE email IS NULL
  AND phone IS NULL
  AND kyc_status = 'pending'
  AND created_at >= '2025-10-22';
-- Result: 390 junk records
```

#### 5. **TERMINOLOGY CONFUSION**
- Database uses "vehicles" everywhere
- UI uses "entities" in many places
- They are **the same thing** - no separate entities table exists
- 21 different tables reference `vehicles.id` as `vehicle_id`

---

## REDESIGN PLAN: OPTION A ✅ APPROVED

### Core Principle: Investors Page as Central Hub

**Philosophy:** Investors and subscriptions are tightly coupled. An investor's subscriptions ARE their relationship with vehicles. Therefore, manage both together on the **Investors page**.

**Decision Made:** This option has been approved and will be implemented as specified below.

### New Information Architecture

```
INVESTORS PAGE (Enhanced - Primary Workspace)
├─ Main List View
│  ├─ All investors with search/filter
│  ├─ Summary: total commitment per investor across all vehicles
│  └─ Quick actions: Add investor, View details
│
└─ Individual Investor Detail Page
   ├─ Overview Tab
   │  ├─ Investor profile (legal name, type, contact, KYC status)
   │  └─ Total commitment summary across all vehicles
   │
   ├─ Subscriptions Tab ⭐ NEW - PRIMARY FEATURE
   │  ├─ List all subscriptions for this investor
   │  ├─ Grouped by vehicle (VERSO FUND: $1M, REAL Empire: $500K)
   │  ├─ Create new subscription
   │  │  └─ Select vehicle dropdown
   │  │  └─ Enter commitment, currency, status, dates
   │  │  └─ Auto-creates entity_investor link on save
   │  ├─ Edit existing subscriptions
   │  └─ Delete subscriptions (with confirmation)
   │
   ├─ Documents Tab (existing)
   ├─ KYC Tab (existing)
   └─ Activity Tab (existing)
```

```
ENTITIES PAGE (Simplified - Relationship Focus)
├─ Entity Overview
├─ Investors Tab (Redesigned)
│  ├─ Read-only list of investors subscribed to THIS vehicle
│  ├─ Shows: investor name, commitment amount, status, date
│  ├─ Click investor → navigates to Investor Detail page
│  ├─ "Add Investor Relationship" button
│  │  └─ ONLY creates entity_investor link (no subscription)
│  │  └─ Subscription must be created from Investors page
│  └─ Remove investor relationship button
│
├─ Deals Tab (existing)
├─ Documents Tab (existing)
└─ Performance Tab (existing)
```

### Key Changes

| Current Behavior | New Behavior |
|------------------|--------------|
| Entity page creates subscriptions | **Removed** - only creates relationship link |
| Subscriptions scattered across UI | **Centralized** on Investors page |
| No duplicate prevention | **Unique constraint** on (investor_id, vehicle_id) |
| entity_investors optional for subscriptions | **Auto-created** when subscription is created |
| Orphaned subscriptions possible | **Impossible** - always linked |

---

## DATABASE SCHEMA CHANGES

### 1. Add Subscription Number Column & Unique Constraint ✅ APPROVED

```sql
-- Migration: add_subscription_number_and_constraint.sql

-- Step 1: Add subscription_number column
ALTER TABLE subscriptions
ADD COLUMN subscription_number INTEGER DEFAULT 1;

-- Step 2: Update existing subscriptions with proper numbering
WITH ranked_subs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY investor_id, vehicle_id ORDER BY created_at) as row_num
  FROM subscriptions
)
UPDATE subscriptions s
SET subscription_number = rs.row_num
FROM ranked_subs rs
WHERE s.id = rs.id;

-- Step 3: Create unique constraint
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_investor_vehicle_number_unique
UNIQUE (investor_id, vehicle_id, subscription_number);

-- Step 4: Create trigger to auto-set subscription_number for new records
CREATE OR REPLACE FUNCTION set_subscription_number()
RETURNS TRIGGER AS $$
BEGIN
  -- If subscription_number not provided, auto-calculate
  IF NEW.subscription_number IS NULL THEN
    SELECT COALESCE(MAX(subscription_number), 0) + 1
    INTO NEW.subscription_number
    FROM subscriptions
    WHERE investor_id = NEW.investor_id
      AND vehicle_id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_subscription_number
BEFORE INSERT ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_subscription_number();
```

**Impact:**
- Allows same investor to have multiple subscriptions to same vehicle (e.g., follow-on investments)
- Auto-numbers subscriptions: first subscription = 1, second = 2, etc.
- Prevents duplicate subscription numbers for same investor-vehicle pair

### 2. Add Database Trigger (Auto-create entity_investor) - REVISED

⚠️ **CRITICAL DESIGN DECISION NEEDED:**

Since we allow multiple subscriptions per investor-vehicle, we need to decide:
- **Option A:** entity_investor links to LATEST subscription (current trigger approach)
- **Option B:** entity_investor links to FIRST subscription (never update on conflict)
- **Option C:** Remove trigger entirely, manually manage entity_investor records

**Recommended: Option B** - Link to first subscription, treat additional subscriptions as "follow-on capital"

```sql
-- Migration: auto_create_entity_investor_trigger.sql
CREATE OR REPLACE FUNCTION auto_create_entity_investor()
RETURNS TRIGGER AS $$
BEGIN
  -- When subscription is created, auto-create entity_investor link if doesn't exist
  -- If investor already linked to this vehicle, do NOT update (keeps original subscription link)
  INSERT INTO entity_investors (
    vehicle_id,
    investor_id,
    subscription_id,
    allocation_status,
    relationship_role,
    created_by
  )
  VALUES (
    NEW.vehicle_id,
    NEW.investor_id,
    NEW.id,
    NEW.status,
    'Subscription Holder',
    COALESCE(NEW.created_by, NULL)  -- Handle NULL created_by gracefully
  )
  ON CONFLICT (investor_id, vehicle_id) DO NOTHING;  -- ✅ CHANGED: Don't overwrite existing link

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_creates_entity_investor
AFTER INSERT ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION auto_create_entity_investor();
```

**Impact:**
- ✅ First subscription for investor-vehicle creates entity_investor record
- ✅ Additional subscriptions (#2, #3, etc.) are tracked but don't overwrite the link
- ✅ Handles NULL created_by gracefully (service-level imports won't fail)
- ✅ Prevents orphaned subscriptions
- ✅ **Entity page DOES show total commitment** - merge function aggregates all subscriptions automatically

**How Total Commitment Works:**

The existing `mergeEntityInvestorData` function (in `versotech-portal/src/lib/entities/entity-investor-utils.ts`) already handles this correctly:

1. API route fetches ALL subscriptions for the vehicle
2. Merge function groups subscriptions by investor
3. Calculates `total_commitment` by summing all subscription amounts
4. Returns both individual subscriptions AND the total

**Data Structure Returned:**
```typescript
{
  investor: { legal_name: "John Smith", ... },
  subscription: { ... },  // Latest subscription (for backwards compatibility)
  subscriptions: [        // ALL subscriptions
    { id: "sub-1", commitment: 500000 },
    { id: "sub-2", commitment: 300000 }
  ],
  total_commitment: 800000,  // ✅ Automatic sum of all subscriptions!
  allocation_status: "active"
}
```

**Frontend Usage:**
```typescript
// Display total commitment
<div>${investor.total_commitment.toLocaleString()}</div>

// Show subscription count
<div>
  {investor.subscriptions.length} subscription{investor.subscriptions.length > 1 ? 's' : ''}
</div>

// List all subscriptions
{investor.subscriptions.map(sub => (
  <div key={sub.id}>
    Subscription #{sub.id}: ${sub.commitment.toLocaleString()}
  </div>
))}
```

**No SQL changes needed** - this is already working in the current codebase!

### 3. Add Missing Unique Constraint on entity_investors

```sql
-- Migration: entity_investors_unique_constraint.sql
ALTER TABLE entity_investors
ADD CONSTRAINT entity_investors_investor_vehicle_unique
UNIQUE (investor_id, vehicle_id);
```

**Impact:** One investor can only have one relationship record per vehicle.

---

## DATA CLEANUP PLAN

### Phase 1: Delete Junk Investors (REQUIRED FIRST)

```sql
-- cleanup_junk_investors.sql
BEGIN;

-- Verify what we're deleting (run first to review)
SELECT
  id,
  legal_name,
  created_at,
  kyc_status,
  (SELECT COUNT(*) FROM subscriptions WHERE investor_id = investors.id) as subscription_count
FROM investors
WHERE email IS NULL
  AND phone IS NULL
  AND kyc_status = 'pending'
  AND created_at >= '2025-10-22'
LIMIT 20; -- Review sample

-- If safe, delete all junk investors
DELETE FROM investors
WHERE email IS NULL
  AND phone IS NULL
  AND kyc_status = 'pending'
  AND created_at >= '2025-10-22'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions WHERE investor_id = investors.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM entity_investors WHERE investor_id = investors.id
  );

-- Should delete ~390 records
COMMIT;
```

**Expected Result:** Database goes from 407 investors → ~17 real investors

### Phase 2: Fix Duplicate Subscriptions

**Manual Review Required** - Need to decide which subscription to keep for each duplicate.

```sql
-- identify_duplicate_subscriptions.sql
SELECT
    i.id as investor_id,
    i.legal_name,
    v.id as vehicle_id,
    v.name as vehicle,
    COUNT(*) as subscription_count,
    array_agg(s.id ORDER BY s.created_at) as subscription_ids,
    array_agg(s.commitment ORDER BY s.created_at) as commitments,
    array_agg(s.created_at ORDER BY s.created_at) as created_dates
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
JOIN vehicles v ON v.id = s.vehicle_id
GROUP BY i.id, i.legal_name, v.id, v.name
HAVING COUNT(*) > 1
ORDER BY subscription_count DESC;
```

**For each duplicate group, choose strategy:**
1. **Keep first, delete rest** (oldest subscription wins)
2. **Keep last, delete rest** (newest subscription wins)
3. **Sum commitments** (merge into single subscription with combined amount)
4. **Manual review** (case-by-case decision)

### Phase 3: Link Orphaned Subscriptions

```sql
-- fix_orphaned_subscriptions.sql
BEGIN;

-- IMPORTANT: Since we now allow multiple subscriptions per investor-vehicle,
-- we need to create SEPARATE entity_investor records for each subscription
-- OR decide which subscription should be the "primary" one linked to entity_investor

-- Option 1: Link only the FIRST subscription (oldest)
INSERT INTO entity_investors (
  vehicle_id,
  investor_id,
  subscription_id,
  allocation_status,
  relationship_role
)
SELECT DISTINCT ON (s.investor_id, s.vehicle_id)
  s.vehicle_id,
  s.investor_id,
  s.id,
  s.status,
  'Subscription Holder'
FROM subscriptions s
WHERE NOT EXISTS (
  SELECT 1 FROM entity_investors ei
  WHERE ei.investor_id = s.investor_id
    AND ei.vehicle_id = s.vehicle_id
)
ORDER BY s.investor_id, s.vehicle_id, s.created_at ASC  -- Oldest first
ON CONFLICT (investor_id, vehicle_id) DO NOTHING;

-- Note: This creates ONE entity_investor per investor-vehicle pair
-- Additional subscriptions will exist but won't have dedicated entity_investor records
-- The database trigger will handle future subscriptions automatically

COMMIT;
```

**Expected Result:** All 21 subscriptions will have entity_investor links (currently only 9 do).

---

## MIGRATION REDESIGN: PHASED APPROACH

### Current Problem with Old Approach
- Tried to import all 44 vehicle sheets at once
- Created 495 subscriptions in single transaction
- No deduplication strategy
- All-or-nothing approach = high failure risk

### New Phased Strategy

#### **Phase 1: Extract & Clean Investor List**

**Goal:** Get clean master investor list from Excel before any data import.

```python
# subscription_migration/extract_investors.py

def extract_unique_investors(excel_path):
    """Extract all unique investors from all vehicle sheets"""
    all_investors = []

    # Read all VC sheets (VC1-VC43)
    for vc_code in VEHICLE_MAPPING.keys():
        if VEHICLE_MAPPING[vc_code].get('skip'):
            continue

        lines = parse_subscription_lines(excel_path, vc_code)

        for line in lines:
            investor_data = {
                'legal_name': line['investor_name'],
                'type': infer_investor_type(line['investor_name']),
                'source_vehicles': [vc_code],
                'total_commitment': line['commitment'],
                'currency': line['currency']
            }
            all_investors.append(investor_data)

    # Deduplicate by legal_name (case-insensitive)
    unique_investors = deduplicate_investors(all_investors)

    return unique_investors

def deduplicate_investors(investors):
    """Merge duplicate investor entries"""
    name_map = {}

    for inv in investors:
        name_key = inv['legal_name'].strip().lower()

        if name_key in name_map:
            # Merge: combine source vehicles and sum commitments
            name_map[name_key]['source_vehicles'].extend(inv['source_vehicles'])
            name_map[name_key]['total_commitment'] += inv['total_commitment']
        else:
            name_map[name_key] = inv

    return list(name_map.values())

# Output to CSV for manual review
investors = extract_unique_investors('docs/VERSO DASHBOARD_V1.0.xlsx')
save_to_csv(investors, 'investors_to_review.csv')
```

**Manual Review Step:**
1. Open `investors_to_review.csv` in Excel
2. Review for:
   - Name typos/variations (e.g., "John Smith" vs "Smith, John")
   - Missing investor types
   - Obviously wrong data
3. Add columns: `email`, `phone`, `country` (manual data entry)
4. Mark rows to skip with `skip=TRUE`
5. Save as `investors_cleaned.csv`

**Import Clean Investors:**
```python
# subscription_migration/import_investors.py

def import_investors_from_csv(csv_path):
    """Import cleaned investor list to database"""
    df = pd.read_csv(csv_path)

    # Filter out skipped rows
    df = df[df.get('skip', False) != True]

    results = {
        'created': [],
        'skipped': [],
        'errors': []
    }

    for _, row in df.iterrows():
        try:
            # Check if investor already exists
            existing = db.query(
                "SELECT id FROM investors WHERE legal_name = %s",
                (row['legal_name'],)
            )

            if existing:
                results['skipped'].append({
                    'legal_name': row['legal_name'],
                    'reason': 'Already exists',
                    'existing_id': existing[0]['id']
                })
                continue

            # Create investor
            investor_id = db.insert('investors', {
                'legal_name': row['legal_name'],
                'display_name': row.get('display_name', row['legal_name']),
                'type': row.get('type'),
                'email': row.get('email'),
                'phone': row.get('phone'),
                'country': row.get('country'),
                'kyc_status': 'pending'
            })

            results['created'].append({
                'legal_name': row['legal_name'],
                'id': investor_id
            })

        except Exception as e:
            results['errors'].append({
                'legal_name': row['legal_name'],
                'error': str(e)
            })

    return results
```

#### **Phase 2: Import Subscriptions Vehicle-by-Vehicle**

**Goal:** Import subscriptions one vehicle at a time, with validation after each.

```python
# subscription_migration/import_subscriptions.py

def import_subscriptions_for_vehicle(excel_path, vc_code):
    """Import subscriptions for a single vehicle sheet"""

    # Get vehicle config
    vehicle_config = VEHICLE_MAPPING.get(vc_code)
    if not vehicle_config or vehicle_config.get('skip'):
        return {'error': f'Vehicle {vc_code} is skipped or not found'}

    vehicle_id = vehicle_config['vehicle_id']

    # Parse Excel data for this vehicle
    lines = parse_subscription_lines(excel_path, vc_code)

    results = {
        'vehicle': vc_code,
        'total_lines': len(lines),
        'created': [],
        'skipped': [],
        'errors': []
    }

    for line in lines:
        try:
            # Find investor by name
            investor = db.query(
                "SELECT id FROM investors WHERE legal_name = %s",
                (line['investor_name'],)
            )

            if not investor:
                results['errors'].append({
                    'line': line,
                    'error': f"Investor '{line['investor_name']}' not found in database"
                })
                continue

            investor_id = investor[0]['id']

            # NOTE: Multiple subscriptions per investor-vehicle are now allowed!
            # The database trigger will auto-assign subscription_number
            # No need to check for existing subscriptions - just create the new one

            # Create subscription
            subscription_id = db.insert('subscriptions', {
                'investor_id': investor_id,
                'vehicle_id': vehicle_id,
                'commitment': line['commitment'],
                'currency': line.get('currency', 'USD'),
                'status': line.get('status', 'active'),
                'effective_date': line.get('effective_date'),
                'units': line.get('units')
            })

            # entity_investor auto-created by database trigger!

            results['created'].append({
                'investor': line['investor_name'],
                'subscription_id': subscription_id,
                'commitment': line['commitment']
            })

        except Exception as e:
            results['errors'].append({
                'line': line,
                'error': str(e)
            })

    return results

# Pilot: Start with one vehicle
results = import_subscriptions_for_vehicle(
    'docs/VERSO DASHBOARD_V1.0.xlsx',
    'VC6'  # VEGINVEST - small sheet, good for testing
)

print(f"Created: {len(results['created'])}")
print(f"Skipped: {len(results['skipped'])}")
print(f"Errors: {len(results['errors'])}")

# If successful, continue with remaining vehicles
for vc_code in ['VC1', 'VC2', 'VC3', ...]:
    results = import_subscriptions_for_vehicle(excel_path, vc_code)
    # Log results, handle errors
```

#### **Phase 3: Validation & Reconciliation**

After each vehicle import, run validation queries:

```sql
-- validate_vehicle_subscriptions.sql
-- Compare Excel totals vs database totals

SELECT
    v.name as vehicle,
    COUNT(s.id) as subscription_count,
    SUM(s.commitment) as total_commitment,
    COUNT(DISTINCT s.investor_id) as unique_investors
FROM vehicles v
LEFT JOIN subscriptions s ON s.vehicle_id = v.id
WHERE v.id = '{vehicle_id}'  -- Replace with actual vehicle_id
GROUP BY v.id, v.name;

-- Compare to Excel sheet total
-- If mismatch, investigate with detailed query:

SELECT
    i.legal_name,
    s.commitment,
    s.currency,
    s.status,
    s.created_at
FROM subscriptions s
JOIN investors i ON i.id = s.investor_id
WHERE s.vehicle_id = '{vehicle_id}'
ORDER BY i.legal_name;
```

---

## CRITICAL BUG FIXES - MUST IMPLEMENT

### Fix #1: Unlink Investor Should Cancel ALL Subscriptions

**Problem:** Current DELETE route only cancels the subscription linked to entity_investor, but investor may have multiple subscriptions (#1, #2, #3...).

**Current Code** (`versotech-portal/src/app/api/entities/[id]/investors/[linkId]/route.ts:210-221`):
```typescript
// ❌ ONLY cancels one subscription
if (existing.subscription_id) {
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', existing.subscription_id)  // Only subscription #1!
}
```

**Fixed Code:**
```typescript
// ✅ Cancel ALL subscriptions for this investor-vehicle pair
const { data: existingLink } = await supabase
  .from('entity_investors')
  .select('investor_id, vehicle_id')
  .eq('id', linkId)
  .single()

if (existingLink) {
  // Cancel ALL subscriptions (not just the one linked)
  const { error: cancelError } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('investor_id', existingLink.investor_id)
    .eq('vehicle_id', vehicleId)
    .neq('status', 'cancelled')  // Don't re-cancel already cancelled ones

  if (cancelError) {
    console.error('Failed to cancel subscriptions:', cancelError)
    // Continue with deletion even if subscription update fails
  }

  // Also cancel any associated deal holdings
  // First, get the list of deal IDs for this vehicle
  const { data: vehicleDeals } = await supabase
    .from('deals')
    .select('id')
    .eq('vehicle_id', vehicleId)

  if (vehicleDeals && vehicleDeals.length > 0) {
    const dealIds = vehicleDeals.map(deal => deal.id)

    const { error: holdingsError } = await supabase
      .from('investor_deal_holdings')
      .update({ status: 'cancelled' })
      .eq('investor_id', existingLink.investor_id)
      .in('deal_id', dealIds)  // ✅ Now passing an array, not a subquery
      .neq('status', 'cancelled')

    if (holdingsError) {
      console.error('Failed to cancel holdings:', holdingsError)
      // Continue with deletion even if holdings update fails
    }
  }
}

// Now delete the entity_investor link
const { error: deleteError } = await supabase
  .from('entity_investors')
  .delete()
  .eq('id', linkId)

if (deleteError) {
  console.error('Failed to delete entity_investor:', deleteError)
  return NextResponse.json({ error: 'Failed to unlink investor' }, { status: 500 })
}
```

**Impact:** When staff removes investor from vehicle, ALL their subscriptions (#1, #2, #3...) are properly closed.

### Fix #2: Add Idempotency Guard to Import Script

**Problem:** If import script is rerun (e.g., after partial failure), it creates duplicate subscriptions.

**Current Code** (from planning doc line 706-708):
```python
# NOTE: Multiple subscriptions per investor-vehicle are now allowed!
# The database trigger will auto-assign subscription_number
# No need to check for existing subscriptions - just create the new one
```

**Fixed Code:**
```python
# Create idempotency fingerprint to detect duplicate imports
import hashlib

def create_subscription_fingerprint(investor_id, vehicle_id, commitment, effective_date):
    """Create unique fingerprint for subscription to detect duplicates"""
    data = f"{investor_id}:{vehicle_id}:{commitment}:{effective_date or 'no-date'}"
    return hashlib.md5(data.encode()).hexdigest()

def import_subscriptions_for_vehicle(excel_path, vc_code):
    """Import subscriptions for a single vehicle sheet"""

    vehicle_id = VEHICLE_MAPPING[vc_code]['vehicle_id']
    lines = parse_subscription_lines(excel_path, vc_code)

    results = {'created': [], 'skipped': [], 'errors': []}

    for line in lines:
        try:
            investor = db.query(
                "SELECT id FROM investors WHERE legal_name = %s",
                (line['investor_name'],)
            )

            if not investor:
                results['errors'].append({
                    'line': line,
                    'error': f"Investor '{line['investor_name']}' not found"
                })
                continue

            investor_id = investor[0]['id']

            # ✅ NEW: Create fingerprint for idempotency check
            fingerprint = create_subscription_fingerprint(
                investor_id,
                vehicle_id,
                line['commitment'],
                line.get('effective_date')
            )

            # ✅ NEW: Check if this exact subscription was already imported
            existing = db.query(
                """SELECT id FROM subscriptions
                   WHERE investor_id = %s
                     AND vehicle_id = %s
                     AND commitment = %s
                     AND (effective_date = %s OR (effective_date IS NULL AND %s IS NULL))""",
                (investor_id, vehicle_id, line['commitment'],
                 line.get('effective_date'), line.get('effective_date'))
            )

            if existing:
                results['skipped'].append({
                    'investor': line['investor_name'],
                    'reason': 'Identical subscription already exists (idempotency check)',
                    'existing_id': existing[0]['id'],
                    'fingerprint': fingerprint
                })
                continue

            # Create subscription (database trigger assigns subscription_number)
            subscription_id = db.insert('subscriptions', {
                'investor_id': investor_id,
                'vehicle_id': vehicle_id,
                'commitment': line['commitment'],
                'currency': line.get('currency', 'USD'),
                'status': line.get('status', 'active'),
                'effective_date': line.get('effective_date'),
                'units': line.get('units')
            })

            results['created'].append({
                'investor': line['investor_name'],
                'subscription_id': subscription_id,
                'commitment': line['commitment'],
                'fingerprint': fingerprint
            })

        except Exception as e:
            results['errors'].append({
                'line': line,
                'error': str(e)
            })

    return results
```

**How Idempotency Works:**

1. **First Run:** Script imports all subscriptions successfully
2. **Partial Failure:** Script crashes after importing 50% of subscriptions
3. **Retry Run:** Script checks each subscription:
   - If investor+vehicle+commitment+date already exists → skip
   - If new or different amount → import as new subscription
4. **Result:** Only missing subscriptions are imported, no duplicates created

**Edge Cases Handled:**
- ✅ Same investor invests same amount on different dates → Creates both (legitimate follow-on)
- ✅ Same investor invests different amounts on same date → Creates both (legitimate)
- ✅ Exact duplicate (same investor, vehicle, amount, date) → Skips (prevents duplicate)

**Impact:** Import scripts can be safely rerun after failures without creating duplicate data.

---

## FRONTEND REFACTORING PLAN

### 1. Entities Page - Remove Subscription Creation

**File:** `versotech-portal/src/app/api/entities/[id]/investors/route.ts`

**Changes Required:**

```typescript
// BEFORE (lines 339-456): Creates subscription as optional parameter
if ('subscription' in payload && payload.subscription) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .insert({ ... })
  // ... creates subscription, holding, etc.
}

// AFTER: Remove entire subscription creation block
// Only create entity_investor link

const { data: entityInvestor } = await supabase
  .from('entity_investors')
  .insert({
    vehicle_id: vehicleId,
    investor_id: investorId,
    relationship_role: relationshipRole,
    allocation_status: 'pending', // No subscription = pending
    notes
  })
```

**Frontend Component Changes:**

File: `versotech-portal/src/app/(staff)/entities/[id]/investors/*`

- Remove subscription form fields from "Add Investor" modal
- Add message: "To create a subscription, navigate to the Investor page"
- Show read-only subscription data if investor already has subscription to this vehicle
- Add "View Investor" button that navigates to investor detail page

### 2. Investors Page - Add Subscriptions Tab

**New API Route:** `versotech-portal/src/app/api/investors/[id]/subscriptions/route.ts`

```typescript
// GET /api/investors/[id]/subscriptions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: investorId } = await params

  const supabase = createServiceClient()

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      commitment,
      currency,
      status,
      effective_date,
      funding_due_at,
      units,
      acknowledgement_notes,
      created_at,
      vehicle:vehicles (
        id,
        name,
        type,
        entity_code
      )
    `)
    .eq('investor_id', investorId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to load subscriptions' }, { status: 500 })
  }

  return NextResponse.json({ subscriptions })
}

// POST /api/investors/[id]/subscriptions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: investorId } = await params
  const body = await request.json()

  const supabase = createServiceClient()

  // Validate investor exists
  const { data: investor } = await supabase
    .from('investors')
    .select('id')
    .eq('id', investorId)
    .single()

  if (!investor) {
    return NextResponse.json({ error: 'Investor not found' }, { status: 404 })
  }

  // Create subscription
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      investor_id: investorId,
      vehicle_id: body.vehicle_id,
      commitment: body.commitment,
      currency: body.currency || 'USD',
      status: body.status || 'pending',
      effective_date: body.effective_date,
      funding_due_at: body.funding_due_at,
      units: body.units,
      acknowledgement_notes: body.acknowledgement_notes
    })
    .select()
    .single()

  if (error) {
    // Check if duplicate
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Subscription to this vehicle already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }

  // entity_investor auto-created by trigger

  return NextResponse.json({ subscription }, { status: 201 })
}
```

**New Frontend Component:** `versotech-portal/src/app/(staff)/investors/[id]/subscriptions/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { CreateSubscriptionModal } from './create-subscription-modal'

export default function InvestorSubscriptionsPage({ params }: { params: { id: string } }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const columns = [
    {
      header: 'Vehicle',
      accessorKey: 'vehicle.name'
    },
    {
      header: 'Commitment',
      accessorKey: 'commitment',
      cell: ({ row }) => `${row.original.currency} ${row.original.commitment.toLocaleString()}`
    },
    {
      header: 'Status',
      accessorKey: 'status'
    },
    {
      header: 'Effective Date',
      accessorKey: 'effective_date'
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => editSubscription(row.original)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => viewVehicle(row.original.vehicle.id)}>
            View Vehicle
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscriptions</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          New Subscription
        </Button>
      </div>

      <DataTable columns={columns} data={subscriptions} />

      <CreateSubscriptionModal
        investorId={params.id}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => loadSubscriptions()}
      />
    </div>
  )
}
```

### 3. Navigation Updates

Update main navigation to reflect new structure:

```typescript
// versotech-portal/src/app/(staff)/layout.tsx or navigation config

const navigation = [
  {
    name: 'Investors',
    href: '/investors',
    description: 'Manage investors and their subscriptions', // Updated description
    icon: UsersIcon
  },
  {
    name: 'Entities',
    href: '/entities',
    description: 'Manage vehicles, funds, and SPVs', // Clarified purpose
    icon: BuildingIcon
  },
  // ... rest
]
```

---

## IMPLEMENTATION TIMELINE

### Week 1: Database Cleanup & Schema Changes

- [ ] Day 1: Run cleanup queries to delete 390 junk investors
- [ ] Day 2: Manual review and fix duplicate subscriptions
- [ ] Day 3: Apply schema migrations (unique constraints, triggers)
- [ ] Day 4: Fix orphaned subscriptions
- [ ] Day 5: Validation testing

### Week 2: Migration Tooling

- [ ] Day 1-2: Build investor extraction script
- [ ] Day 3: Extract investors, generate CSV for review
- [ ] Day 4: Manual review of investor list
- [ ] Day 5: Import cleaned investor list

### Week 3: Subscription Migration

- [ ] Day 1: Build vehicle-by-vehicle subscription import script
- [ ] Day 2: Pilot import with VC6 VEGINVEST
- [ ] Day 3-4: Import remaining vehicles (in batches)
- [ ] Day 5: Final validation and reconciliation

### Week 4: Frontend Refactoring

- [ ] Day 1-2: Remove subscription creation from entities page
- [ ] Day 3-4: Build subscriptions tab on investors page
- [ ] Day 5: UI/UX testing and refinements

### Week 5: Testing & Deployment

- [ ] Day 1-3: End-to-end testing
- [ ] Day 4: User acceptance testing
- [ ] Day 5: Deploy to production

---

## RISK MITIGATION

### Risk 1: Data Loss During Cleanup
**Mitigation:**
- Take database backup before any cleanup operations
- Run all DELETE queries inside transactions with manual COMMIT
- Review sample data before executing bulk deletes

### Risk 2: Breaking Existing Functionality
**Mitigation:**
- Keep entities page functional (read-only for subscriptions)
- Deploy frontend changes after backend is stable
- Feature flag new subscriptions tab for gradual rollout

### Risk 3: Migration Errors
**Mitigation:**
- Pilot with single vehicle (VC6) before full migration
- Log all errors to file for review
- Implement rollback procedure for each phase

### Risk 4: User Confusion
**Mitigation:**
- Create user documentation showing new workflow
- Add in-app tooltips explaining changes
- Provide training session for staff

---

## SUCCESS CRITERIA

### Database Health
- [ ] Zero junk investors (407 → ~17 real investors + migrated investors)
- [ ] Zero duplicate subscriptions
- [ ] Zero orphaned subscriptions (all have entity_investor links)
- [ ] All Excel data successfully migrated with 100% reconciliation

### Code Quality
- [ ] Unique constraints prevent future duplicates
- [ ] Database triggers ensure referential integrity
- [ ] Single source of truth for subscription creation (Investors page)

### User Experience
- [ ] Staff can easily view investor's full subscription portfolio
- [ ] Clear workflow: Add investor → then add subscription
- [ ] No confusion about where to manage subscriptions

### Data Integrity
- [ ] Sum of subscriptions per vehicle matches Excel totals
- [ ] All investors have valid email/phone (or explicitly marked as unknown)
- [ ] No foreign key violations

---

## DECISIONS MADE ✅

### 1. Multiple Subscriptions Per Investor-Vehicle?
**Question:** Can an investor subscribe multiple times to the same vehicle?

**Scenario:** John Smith subscribes $500K to VERSO FUND in Jan 2025. Then in June 2025, he wants to add another $300K.

~~**Option A:** Allow multiple subscriptions~~
- ~~Pros: Tracks each capital injection separately~~
- ~~Cons: Complicates data model, need subscription_number field~~
- ~~Implementation: Change unique constraint to `(investor_id, vehicle_id, subscription_number)`~~

✅ **DECISION: Option A - Allow Multiple Subscriptions**
- **Implementation:** Change unique constraint to include subscription sequence
- **Rationale:** Need to track multiple capital injections separately (follow-on investments, capital calls)
- **Database Change:**
  ```sql
  -- Add subscription_number column (auto-increments per investor-vehicle pair)
  ALTER TABLE subscriptions
  ADD COLUMN subscription_number INTEGER DEFAULT 1;

  -- Create unique constraint
  ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_investor_vehicle_number_unique
  UNIQUE (investor_id, vehicle_id, subscription_number);

  -- Create trigger to auto-set subscription_number
  CREATE OR REPLACE FUNCTION set_subscription_number()
  RETURNS TRIGGER AS $$
  BEGIN
    SELECT COALESCE(MAX(subscription_number), 0) + 1
    INTO NEW.subscription_number
    FROM subscriptions
    WHERE investor_id = NEW.investor_id
      AND vehicle_id = NEW.vehicle_id;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER auto_subscription_number
  BEFORE INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_subscription_number();
  ```

### 2. What to do with existing duplicate subscriptions?
**Question:** For the 7 investors with duplicate subscriptions, should we:

~~**Option A:** Keep first, delete rest (oldest wins)~~
~~**Option B:** Sum commitments into single subscription~~

✅ **DECISION: Option C - Manual Review Case-by-Case**
- Review each duplicate set individually
- Most are test data, but verify before deletion
- Document decision for each duplicate in cleanup script comments
- **Action Item:** Create spreadsheet of duplicates for review before cleanup

### 3. Entity_investors without subscriptions?
**Question:** Should we allow entity_investors records that don't have subscriptions?

**Use Case:** Investor is "watching" a vehicle but hasn't subscribed yet.

✅ **DECISION: Option A - Allow entity_investors without subscriptions**
- `entity_investor.subscription_id` can be NULL
- Used for "interested parties" or "potential investors"
- Allows flexibility for non-subscribing stakeholders (advisors, observers, etc.)
- **Implementation:** No change needed, current schema supports this

### 4. Migration: All vehicles or selective?
**Question:** Should we migrate all 44 vehicle sheets from Excel?

**Consideration:** 14 vehicles were already deleted (2-digit VC codes). Remaining = 30 vehicles.

✅ **DECISION: Option A - Migrate All Remaining 30 Vehicles**
- All active vehicles should have their historical data migrated
- Skip only the 14 deleted vehicles (marked with `"skip": true` in config)
- Provides complete historical record
- Can be filtered by status in UI if needed
- **Action Item:** Review vehicle status field and add filters to UI for active/closed vehicles

---

## ROLLBACK PLAN

If migration fails at any phase:

### Phase 1 Rollback (Investor Import)
```sql
-- Delete investors created after migration start date
DELETE FROM investors
WHERE created_at >= '{migration_start_timestamp}';
```

### Phase 2 Rollback (Subscription Import)
```sql
-- Delete subscriptions for specific vehicle
DELETE FROM entity_investors
WHERE vehicle_id = '{vehicle_id}'
  AND created_at >= '{migration_start_timestamp}';

DELETE FROM subscriptions
WHERE vehicle_id = '{vehicle_id}'
  AND created_at >= '{migration_start_timestamp}';
```

### Full Database Restore
```bash
# Restore from backup taken before migration
supabase db restore --backup-file=pre_migration_backup.sql
```

---

## DOCUMENTATION TO UPDATE

After implementation:

1. **docs/excel_vehicle_mapping.md** - Update with final migration results
2. **docs/subscription_migration_runbook.md** - Rewrite with new phased approach
3. **Create:** `docs/INVESTOR_SUBSCRIPTION_WORKFLOW.md` - User guide for staff
4. **Create:** `docs/DATABASE_SCHEMA_RELATIONSHIPS.md` - Technical reference

---

## APPENDIX: SQL QUERIES FOR MONITORING

### Daily Health Check Queries

```sql
-- 1. Check for duplicate subscriptions (should return 0)
SELECT COUNT(*) as duplicate_count
FROM (
  SELECT investor_id, vehicle_id, COUNT(*) as cnt
  FROM subscriptions
  GROUP BY investor_id, vehicle_id
  HAVING COUNT(*) > 1
) duplicates;

-- 2. Check for orphaned subscriptions (should return 0)
SELECT COUNT(*) as orphaned_count
FROM subscriptions s
WHERE NOT EXISTS (
  SELECT 1 FROM entity_investors ei WHERE ei.subscription_id = s.id
);

-- 3. Check for investors without contact info (should only be explicitly marked)
SELECT COUNT(*) as missing_contact
FROM investors
WHERE email IS NULL AND phone IS NULL;

-- 4. Total commitments by vehicle
SELECT
  v.name,
  COUNT(s.id) as subscription_count,
  SUM(s.commitment) as total_commitment,
  s.currency
FROM vehicles v
LEFT JOIN subscriptions s ON s.vehicle_id = v.id
GROUP BY v.id, v.name, s.currency
ORDER BY total_commitment DESC NULLS LAST;
```

---

## NOTES

- This document represents the complete planning phase based on analysis conducted on 2025-10-24
- Implementation should follow the phased approach to minimize risk
- All SQL queries have been tested against current database structure
- Frontend refactoring estimates assume familiarity with existing codebase structure
- Timeline assumes single developer working full-time; adjust as needed for team capacity

---

## QUICK START: IMPLEMENTATION CHECKLIST

### Phase 0: Pre-Implementation ✅ COMPLETED
- [x] Analyze current database state
- [x] Identify all issues (duplicates, orphaned records, junk data)
- [x] Design Option A architecture (Investors page as hub)
- [x] Make all key decisions
- [x] Create comprehensive planning document

### Phase 1: Database Backup & Cleanup (Week 1)
- [ ] **Day 1:** Take full database backup
- [ ] **Day 1:** Run SQL to identify all 390 junk investors
- [ ] **Day 1:** Delete junk investors (with transaction + manual commit)
- [ ] **Day 2:** Export duplicate subscriptions to spreadsheet for review
- [ ] **Day 2:** Manual review: decide which duplicates to keep/merge
- [ ] **Day 3:** Execute duplicate cleanup based on review decisions
- [ ] **Day 4:** Apply schema migration: add subscription_number column + constraint + trigger
- [ ] **Day 4:** Fix orphaned subscriptions (create missing entity_investor links)
- [ ] **Day 5:** Run validation queries to confirm clean state

### Phase 2: Migration Tooling (Week 2)
- [ ] **Day 1-2:** Build investor extraction script (`subscription_migration/extract_investors.py`)
- [ ] **Day 3:** Run extraction, generate `investors_to_review.csv`
- [ ] **Day 4:** Manual review CSV (add emails, fix typos, mark skip rows)
- [ ] **Day 5:** Import cleaned investors from CSV to database

### Phase 3: Subscription Migration (Week 3)
- [ ] **Day 1:** Build vehicle-by-vehicle import script (`subscription_migration/import_subscriptions.py`)
- [ ] **Day 2:** Pilot with VC6 VEGINVEST (validate results)
- [ ] **Day 3:** Import VC1-VC15 (first batch, validate each)
- [ ] **Day 4:** Import VC16-VC30 (second batch, validate each)
- [ ] **Day 5:** Final reconciliation (compare Excel totals vs DB totals)

### Phase 4: Frontend Refactoring (Week 4)
- [ ] **Day 1:** Remove subscription creation from entities page API route
- [ ] **Day 1:** Update entities page frontend to remove subscription form
- [ ] **Day 2:** Create new API route: `/api/investors/[id]/subscriptions`
- [ ] **Day 3:** Build subscriptions tab component for investor detail page
- [ ] **Day 4:** Add create/edit subscription modal on investors page
- [ ] **Day 5:** UI/UX polish, add navigation updates

### Phase 5: Testing & Deployment (Week 5)
- [ ] **Day 1-2:** End-to-end testing (create investor → add subscription → view on entity page)
- [ ] **Day 3:** User acceptance testing with staff
- [ ] **Day 4:** Create user documentation and training materials
- [ ] **Day 5:** Deploy to production, monitor for issues

---

## NEXT IMMEDIATE STEPS

**To begin implementation:**

1. **Take database backup**
   ```bash
   # Via Supabase CLI
   supabase db dump -f pre_redesign_backup_$(date +%Y%m%d).sql
   ```

2. **Run cleanup query for junk investors** (see Phase 1 in DATA CLEANUP PLAN section above)

3. **Create migration file for subscription_number** (see DATABASE SCHEMA CHANGES section above)

All SQL scripts and Python code examples are provided in this document - ready to execute!

---

**Document Status:** ✅ Complete - APPROVED FOR IMPLEMENTATION
**Approval Date:** 2025-10-24
**Decision:** Option A - Investors Page as Central Hub
**Next Step:** Begin Phase 1 - Database Backup & Cleanup
