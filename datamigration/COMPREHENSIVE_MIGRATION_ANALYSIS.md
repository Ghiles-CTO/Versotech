# Comprehensive Migration Analysis: Introducers, Partners & Commissions

## Executive Summary

This document provides a complete analysis of:
1. The `introductions` table schema and whether it has all required columns
2. Mapping between dashboard introducer/partner names and database records
3. What needs to be created vs updated
4. The overall migration strategy

---

## Part 1: Schema Analysis

### The `introductions` Table

**Current Schema:**
| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| id | uuid | NO | Primary key |
| introducer_id | uuid | YES | FK to introducers |
| prospect_email | citext | YES | Investor email |
| prospect_investor_id | uuid | YES | FK to investors |
| deal_id | uuid | YES | FK to deals |
| status | text | YES | 'invited', 'allocated', etc. |
| created_at | timestamptz | YES | Record creation |
| introduced_at | date | YES | Introduction date |
| commission_rate_override_bps | integer | YES | Rate override (basis points) |
| notes | text | YES | Free text notes |
| created_by | uuid | YES | FK to users |

**Analysis: Is this schema sufficient?**

The `introductions` table is designed for the **relationship linkage**: introducer → investor → deal

It has ONE `commission_rate_override_bps` field for a simple rate override.

**For the dashboard data, we have MULTIPLE fee structures:**
- Subscription fee % (invested_amount basis)
- Performance fee 1 with threshold 1 (e.g., "0x", "1x")
- Performance fee 2 with threshold 2
- Spread PPS fees
- Management fees

**CONCLUSION:** The `introductions` table IS SUFFICIENT for its purpose (linkage). The detailed fee structures with multiple tiers and thresholds belong in the `introducer_commissions` table, which already has:
- `basis_type`: 'invested_amount', 'performance_fee', 'spread', 'management_fee'
- `rate_bps`: The rate in basis points
- `threshold_multiplier`: For "0x", "1x", "2x" thresholds
- `tier_number`: For fee tier ordering
- `performance_threshold_type`: Threshold calculation method

**No schema changes needed to `introductions` table.**

---

## Part 2: Introducer Name Mapping

### Dashboard Introducers → Database Introducers

| Dashboard Name | Records | DB Match | DB ID | Notes |
|----------------|---------|----------|-------|-------|
| **VERSO BI** | 134 | **MISSING** | - | Needs creation |
| **Terra** | 19 | Terra Financial & Management Services SA | `1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d` | Active |
| **TERRA** | 9 | (same as Terra) | `1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d` | Normalize to "Terra" |
| **TERRA Financial** | 2 | (same as Terra) | `1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d` | Normalize to "Terra" |
| **Elevation** | 11 | **MISSING** | - | Needs creation |
| **Simone** | 10 | Simone Garofalo (Partner) | Partner: `6c70e672-ebe0-424d-8479-d1142ed02bb5` | In PARTNER table, not introducer |
| **Rick** | 9 | **Altras Capital Financing Broker** | `55b67690-c83d-4406-a2b4-935032d22739` | **CONFIRMED** - Notes say "Legacy - Rick" |
| **Enguerrand** | 7 | Enguerrand Elbaz | `736a31b2-b8a6-4a0e-8abe-ed986014d0c4` | Exact match |
| **John** | 6 | **MISSING** | - | Needs creation |
| **Manna Capital** | 5 | **MISSING** | - | Needs creation |
| **Anand Sethia** | 4 | Partner "Anand" related? | - | Check if introducer or partner |
| **AUX** | 4 | AUX Business Support Ltd | `0aebf77c-47a3-4011-abd4-74ee3772d78e` | Exact match |
| **Sandro** | 4 | Sandro Lang | `87571ef2-b05d-4d7d-8095-2992d43b9aa8` | Exact match |
| **Alpha Gaia** | 4 | Alpha Gaia | `bc23b7c7-4253-40c2-889b-97a5044c23d5` | Exact match |
| **Gemera** | 3 | GEMERA Consulting Pte Ltd | `61e01a81-0663-4d4a-9626-fc3a6acb4d63` | Exact match |
| **Julien** | 3 | Julien Machot (Partner) | Partner: `d1e65357-2133-422f-bf30-51eb47d4a615` | In PARTNER table |
| **Gio** | 3 | **Giovanni SALADINO** | `bcaaab40-eef5-4a3c-92d7-101f498489ac` | **CONFIRMED** - Notes say "Legacy - Gio" |
| **Pierre Paumier** | 2 | Pierre Paumier | `41974010-e41d-40a6-9cbf-725618e7e00c` | Exact match |
| **Robin** | 2 | Robin Doble (Partner) | Partner: `52083ca3-c95d-4516-9cdd-0baf916b26be` | In PARTNER table |
| **Omar** | 1 | Omar ADI | `ae4d8764-3c68-4d34-beca-9f4fec4c71a9` | Exact match |
| **Aboud** | 1 | Aboud Khaddam | `3cc51575-6b04-4d46-a1ac-e66630a50e7b` | Exact match |
| **FINSA** | 1 | **MISSING** | - | Needs creation |
| **Stableton+Terra** | 1 | **MISSING** | - | Combo - needs handling |
| **Rick + Andrew** | 1 | **MISSING** | - | Combo - needs handling |
| **Elevation+Rick** | 1 | **MISSING** | - | Combo - needs handling |

### Summary: Introducers

**Existing in DB (exact or close match):** 13
- Terra (30 records combined), Enguerrand (7), AUX (4), Sandro (4), Alpha Gaia (4), Gemera (3), Pierre Paumier (2), Omar (1), Aboud (1)
- Possibly: Rick/Gio → Giovanni SALADINO (12 records combined)

**In Partner table (need to decide handling):** 3
- Simone (10), Julien (3), Robin (2)

**Need to CREATE:** 7
- VERSO BI (134 records!)
- Elevation (11)
- John (6)
- Manna Capital (5)
- FINSA (1)
- Stableton (for combo)
- Anand Sethia (4) - if not partner

**Combo records (need special handling):** 3
- Stableton+Terra, Rick+Andrew, Elevation+Rick

---

## Part 3: Partner Name Mapping

### Dashboard Partners → Database Partners

| Dashboard Name | DB Match | DB ID | Status |
|----------------|----------|-------|--------|
| **Anand** | Anand+Dan (partial) | `00a21cd4-f5ab-4f81-a20a-2c88258f67c6` | Need individual |
| **Anand+Dan** | Anand+Dan | `00a21cd4-f5ab-4f81-a20a-2c88258f67c6` | Exact match |
| **Dan** | Dan | `46474a8f-4374-4fea-94cc-a26798e32696` | Exact match |
| **Daniel Baumslag** | Daniel Baumslag | `f9ce39d3-0aad-41ce-a3b7-956390f795f7` | Exact match |
| **Denis** | Denis | `840071c5-c1ee-4617-a120-6e596d2dc97d` | Introducer table (display_name) |
| **Simone** | Simone Garofalo | `6c70e672-ebe0-424d-8479-d1142ed02bb5` | Exact match |
| **VERSO PARTNER** | **MISSING** | - | Needs creation |

### Summary: Partners

**Existing in DB:** 6
- Anand (via Anand+Dan), Anand+Dan, Dan, Daniel Baumslag, Simone

**Special case:** 1
- Denis - exists in BOTH introducers (Denis Matthey) and has display_name "Denis" in introducers

**Need to CREATE:** 1
- VERSO PARTNER

---

## Part 4: Key Questions to Resolve

### 1. ~~Is "Rick" = "Giovanni SALADINO"?~~ **RESOLVED**
- **Rick** = "Altras Capital Financing Broker" (ID: `55b67690-c83d-4406-a2b4-935032d22739`)
- **Gio** = "Giovanni SALADINO" (ID: `bcaaab40-eef5-4a3c-92d7-101f498489ac`)

Evidence: Existing commission records have notes "Legacy - Rick" for Altras Capital and "Legacy - Gio" for Giovanni SALADINO.

### 2. What to do with people in PARTNER table appearing as introducers?
Dashboard lists Simone (10), Julien (3), Robin (2) as INTRODUCERS but they're in the partners table.
Options:
- A) Create them as introducers too
- B) Treat introducer records for these as partner records
- C) Some other mapping

### 3. How to handle combo records?
"Stableton+Terra", "Rick+Andrew", "Elevation+Rick" - should these:
- A) Create combined introducer entries
- B) Split commission between two introducers
- C) Create one as primary and note the other

### 4. "Anand Sethia" vs "Anand"
Dashboard has "Anand Sethia" in introducers column and "Anand" in partners column. Are these the same person? Should Anand Sethia be added as an introducer?

---

## Part 5: Migration Strategy

### Phase 1: Create Missing Introducers

```sql
-- VERSO BI (most important - 134 records!)
INSERT INTO introducers (display_name, legal_name, status, default_commission_bps)
VALUES ('VERSO BI', 'VERSO Business Intelligence', 'active', 0);

-- Elevation
INSERT INTO introducers (display_name, legal_name, status, default_commission_bps)
VALUES ('Elevation', 'Elevation', 'active', 200);

-- John (need full legal name)
INSERT INTO introducers (display_name, legal_name, status, default_commission_bps)
VALUES ('John', 'John [TBD]', 'active', 200);

-- Manna Capital
INSERT INTO introducers (display_name, legal_name, status, default_commission_bps)
VALUES ('Manna Capital', 'Manna Capital', 'active', 200);

-- FINSA
INSERT INTO introducers (display_name, legal_name, status, default_commission_bps)
VALUES ('FINSA', 'FINSA', 'active', 200);

-- Stableton (for combo records)
INSERT INTO introducers (display_name, legal_name, status, default_commission_bps)
VALUES ('Stableton', 'Stableton', 'active', 200);
```

### Phase 2: Create Missing Partners

```sql
-- VERSO PARTNER
INSERT INTO partners (name, legal_name, type, partner_type, status)
VALUES ('VERSO PARTNER', 'VERSO PARTNER', 'entity', 'strategic', 'active');
```

### Phase 3: Create Introducer Name Mapping Table (for migration use)

```sql
CREATE TEMP TABLE introducer_mapping (
    dashboard_name text PRIMARY KEY,
    introducer_id uuid,
    is_partner boolean DEFAULT false,
    partner_id uuid
);

INSERT INTO introducer_mapping VALUES
-- CONFIRMED MAPPINGS (from existing DB notes)
('Terra', '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', false, null),
('TERRA', '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', false, null),
('TERRA Financial', '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d', false, null),
('Rick', '55b67690-c83d-4406-a2b4-935032d22739', false, null),  -- Altras Capital Financing Broker
('Gio', 'bcaaab40-eef5-4a3c-92d7-101f498489ac', false, null),   -- Giovanni SALADINO
('Enguerrand', '736a31b2-b8a6-4a0e-8abe-ed986014d0c4', false, null),
('AUX', '0aebf77c-47a3-4011-abd4-74ee3772d78e', false, null),
('Sandro', '87571ef2-b05d-4d7d-8095-2992d43b9aa8', false, null),
('Alpha Gaia', 'bc23b7c7-4253-40c2-889b-97a5044c23d5', false, null),
('Gemera', '61e01a81-0663-4d4a-9626-fc3a6acb4d63', false, null),
('Pierre Paumier', '41974010-e41d-40a6-9cbf-725618e7e00c', false, null),
('Omar', 'ae4d8764-3c68-4d34-beca-9f4fec4c71a9', false, null),
('Aboud', '3cc51575-6b04-4d46-a1ac-e66630a50e7b', false, null),
-- Partners acting as introducers (use partner_commissions instead)
('Simone', null, true, '6c70e672-ebe0-424d-8479-d1142ed02bb5'),
('Julien', null, true, 'd1e65357-2133-422f-bf30-51eb47d4a615'),
('Robin', null, true, '52083ca3-c95d-4516-9cdd-0baf916b26be');
-- Note: VERSO BI (134 records!), Elevation, John, Manna Capital, FINSA need to be created first
```

### Phase 4: For Each Dashboard Record

1. **Find/Create Introduction Record**
   - Link introducer_id → investor_id → deal_id
   - Set commission_rate_override_bps if needed

2. **Update Subscription**
   - Set introducer_id on subscription
   - Set introduction_id on subscription

3. **Create Commission Records** (in `introducer_commissions`)
   - One for each fee type with non-zero value:
     - `basis_type='invested_amount'` for subscription fees
     - `basis_type='performance_fee'` with threshold for perf fees
     - `basis_type='spread'` for spread fees
     - `basis_type='management_fee'` for management fees

---

## Part 6: Data Volume Summary

| Category | Count |
|----------|-------|
| Total dashboard records | 470 |
| Unique introducer names | 25 |
| Unique partner names | 7 |
| Existing introducers in DB | 37 |
| Existing partners in DB | 8 |
| Introducers to CREATE | ~7 |
| Partners to CREATE | ~1 |
| Existing introductions | 20 |
| Subscriptions with introducer_id | 36 |

---

## Next Steps

1. **~~Confirm the following with user:~~ MOSTLY RESOLVED**
   - ~~Is "Rick" = "Giovanni SALADINO"?~~ **RESOLVED**: Rick = Altras Capital, Gio = Giovanni SALADINO
   - How to handle Simone/Julien/Robin (partners acting as introducers)?
   - Full legal names for new introducers (John, Elevation, etc.)

2. **Create missing introducers and partners**
   - VERSO BI (134 records - highest priority!)
   - Elevation (11 records)
   - John (6 records)
   - Manna Capital (5 records)
   - FINSA (1 record)
   - Stableton (for combo)
   - VERSO PARTNER (for partners table)

3. **Run investor matching for all 22 vehicles**

4. **Execute migration script:**
   - Create introductions (introducer → investor → deal linkage)
   - Update subscriptions (set introducer_id, introduction_id)
   - Create introducer_commissions for: performance_fee, spread, management_fee
   - Create partner_commissions where applicable

5. **Verify and validate migration**

---

## Appendix: Key Reminders (from user instructions)

**Fee Types for Introducers/Partners:**
- Management fee
- Performance fee (with thresholds like "0x", "1x", "2x")
- Spread

**Note:** "Subscription fees" in the INTRODUCER column of dashboard maps to `basis_type='invested_amount'` in commissions table - this represents the introducer's cut of the investment amount, not a separate fee category.
