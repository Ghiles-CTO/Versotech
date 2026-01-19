# INTRODUCER_COMMISSIONS - COLUMN GAP ANALYSIS

## SCHEMA REQUIREMENTS

```sql
-- From DB schema
CREATE TABLE introducer_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_id uuid,           -- FK to introducers
  investor_id uuid,             -- FK to investors (CRITICAL GAP)
  deal_id uuid,                 -- FK to deals
  basis_type text,              -- 'invested_amount', 'performance_fee', 'spread', 'management_fee'
  rate_bps integer NOT NULL,    -- REQUIRED: rate in basis points
  accrual_amount numeric NOT NULL, -- REQUIRED: fee amount
  base_amount numeric,          -- investment amount
  currency text DEFAULT 'USD',
  status text DEFAULT 'accrued',
  ...
);
```

---

## WHAT WE HAVE (Dashboard Extraction)

| Dashboard Column | Sample Value | Maps To |
|-----------------|--------------|---------|
| introducer_name | "Terra" | introducer_id (via name lookup) |
| investor_identifier | "WINZ" | investor_id (NEEDS MATCHING) |
| vehicle | "VC113" | deal_id (via vehicle→deal lookup) |
| sub_fee_pct | 0.02 | rate_bps (× 10000 = 200) |
| sub_fee_amt | 2000 | accrual_amount |
| amount | 100000 | base_amount |
| perf_fee_1 | 200 | separate commission record |
| spread_pps_fees | 0.9 | separate commission record |

---

## CRITICAL GAP: investor_id

### The Problem
- Dashboard has: `investor_identifier` = "WINZ", "AKERMANN", "DALINGA HOLDING AG"
- DB needs: `investor_id` = UUID like "0ba0fbe1-9833-477e-9ee5-7690ef0fe97a"

### The Solution: Matching Query
```sql
-- Match dashboard investor name to DB investor UUID
SELECT inv.id as investor_id
FROM subscriptions s
JOIN vehicles v ON v.id = s.vehicle_id
JOIN investors inv ON inv.id = s.investor_id
WHERE v.entity_code = 'VC113'  -- from dashboard.vehicle
  AND (
    UPPER(inv.last_name) = UPPER('WINZ')  -- for individuals
    OR UPPER(inv.legal_name) = UPPER('WINZ')  -- for entities
  )
LIMIT 1;
```

### Match Verification Results

| Dashboard Name | Vehicle | DB Match | investor_id |
|---------------|---------|----------|-------------|
| WINZ | VC113 | Barbara and Heinz WINZ | 0ba0fbe1-... |
| AKERMANN | VC113 | Markus AKERMANN | 077277ca-... |
| KOHLER CABIAN | VC111 | Sandra KOHLER CABIAN | 996ec13d-... |
| DALINGA HOLDING AG | VC113 | Dalinga AG (different!) | b65f05da-... |

### Matching Complexity
- **Individuals**: Match by `last_name` (usually works)
- **Entities**: Match by `legal_name` (case-insensitive, may have variations)
- **Multiple subscriptions**: Same investor may have multiple subscriptions in a vehicle
- **Name variations**: "DALINGA HOLDING AG" vs "Dalinga AG"

---

## FEE TYPES → MULTIPLE COMMISSION RECORDS

Each dashboard record may create **MULTIPLE** commission records:

| Fee Column | basis_type | Records with Data |
|-----------|------------|-------------------|
| sub_fee_amt | invested_amount | 292 |
| perf_fee_1 | performance_fee | 297 |
| perf_fee_2 | performance_fee | 0 |
| spread_pps_fees | spread | 301 |

**TOTAL COMMISSION RECORDS TO CREATE: 890** (not 311!)

---

## COMPLETE IMPORT WORKFLOW

### Step 1: Create Missing Introducers (10 + 2)
```sql
INSERT INTO introducers (display_name, legal_name, status)
VALUES ('VERSO BI', 'VERSO BI', 'active'),
       ('VERSO PARTNER', 'VERSO PARTNER', 'active'),
       ('Anand', 'Anand', 'active'),
       ...
```

### Step 2: Build Introducer Lookup Map
```python
introducer_map = {
    'Terra': '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',
    'TERRA': '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d',  # alias
    'VERSO BI': '<new_uuid>',
    ...
}
```

### Step 3: Build Deal Lookup Map
```python
deal_map = {
    'VC102': 'ba9c45e0-4299-4762-b8ad-5a3f619fa4fb',
    'VC106': '07eff085-9f1d-4e02-b1e2-d717817503f1',
    'VC111': '9a8c133e-fad0-4e5a-8118-24225a0bef68',
    'VC112': 'c4a16193-8f6b-43e8-b664-caeb46d0de85',
    'VC113': '1e4061bd-6e36-4298-8e98-9fd55ab6a448',
    'VC118': '5e244c1d-847b-492f-ba7c-d35b5e2bb957',
    'VC125': 'f73d625c-dc39-4829-919e-327dd5bdae07',
    'VC126': 'e2d649da-f1e9-49ca-b426-dd8ade244f12',
    'VC133': '750e0559-a10a-48eb-9593-106329bf9f53'
}
```

### Step 4: Match Investors (CRITICAL)
For each dashboard record:
```python
# Query to find investor_id
investor_id = execute_sql("""
    SELECT inv.id
    FROM subscriptions s
    JOIN vehicles v ON v.id = s.vehicle_id
    JOIN investors inv ON inv.id = s.investor_id
    WHERE v.entity_code = %(vehicle)s
      AND (UPPER(inv.last_name) = UPPER(%(name)s)
           OR UPPER(inv.legal_name) ILIKE UPPER('%%' || %(name)s || '%%'))
    LIMIT 1
""", {'vehicle': record['vehicle'], 'name': record['investor_identifier']})
```

### Step 5: Update Subscriptions with introducer_id
```sql
UPDATE subscriptions s
SET introducer_id = '<introducer_uuid>'
FROM vehicles v, investors inv
WHERE s.vehicle_id = v.id
  AND s.investor_id = inv.id
  AND v.entity_code = 'VC113'
  AND UPPER(inv.last_name) = 'WINZ';
```

### Step 6: Create Commission Records
For each fee type with value > 0:
```sql
INSERT INTO introducer_commissions
  (introducer_id, investor_id, deal_id, basis_type, rate_bps, accrual_amount, base_amount, status)
VALUES (
  '<introducer_uuid>',
  '<investor_uuid>',  -- from Step 4 matching
  '<deal_uuid>',      -- from deal_map
  'invested_amount',  -- or 'performance_fee', 'spread'
  200,                -- sub_fee_pct * 10000
  2000.00,            -- sub_fee_amt
  100000.00,          -- amount
  'accrued'
);
```

---

## REQUIRED BEFORE IMPORT

1. **Confirm VERSO BI / VERSO PARTNER handling** - CREATE as introducers ✓ (user confirmed)

2. **Run investor matching dry-run** - Verify match rate before bulk update

3. **Handle unmatched records** - What to do if investor name doesn't match?
   - Skip the record?
   - Create placeholder?
   - Flag for manual review?

4. **De-duplication check** - Some commission records may already exist

---

## SUMMARY

| Item | Status |
|------|--------|
| Required columns (rate_bps, accrual_amount) | HAVE |
| introducer_id | HAVE (via name lookup) |
| deal_id | HAVE (via vehicle mapping) |
| **investor_id** | **NEED MATCHING** |
| Multiple fee types | HAVE (890 total records) |
