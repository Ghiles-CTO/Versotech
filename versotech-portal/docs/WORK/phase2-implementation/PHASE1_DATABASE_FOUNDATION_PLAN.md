# Phase 1: Database Foundation Plan
## Multi-User Entity Infrastructure (REVISED)

**Version:** 2.0
**Created:** 2025-12-17
**Revised:** 2025-12-18
**Status:** READY FOR IMPLEMENTATION

---

## Executive Summary

This plan details the database migrations required to enable **multi-user-per-entity** support across ALL persona types in the VERSO platform. Currently, only `investors` implements this pattern correctly (investors + investor_users + investor_members).

**ALL external personas that need portal access MUST follow the SAME pattern:**
```
{entity} + {entity}_users + {entity}_members
```

| Entity | Core Table | Users Table | Members Table |
|--------|-----------|-------------|---------------|
| Investor | `investors` | `investor_users` | `investor_members` |
| Arranger | `arranger_entities` (exists) | `arranger_users` | `arranger_members` |
| Introducer | `introducers` | `introducer_users` | `introducer_members` |
| Partner | `partners` (new) | `partner_users` | `partner_members` |
| Commercial Partner | `commercial_partners` (new) | `commercial_partner_users` | `commercial_partner_members` |
| Lawyer | `lawyers` (new) | `lawyer_users` | `lawyer_members` |

**CEO stays as `profiles.role = 'ceo'`** - CEO is internal VERSO management, not an external counterparty.

---

## Pattern Explanation

### Three-Table Pattern (Gold Standard from `investors`)

```
┌─────────────────────┐
│    {entity}         │  Core entity table
│  (investors)        │  - Business info (name, address, KYC)
│                     │  - Type field (individual/entity/institutional)
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│   {entity}_users    │  WHO CAN LOGIN
│  (investor_users)   │  - Links profiles (auth users) to entities
│                     │  - One user can link to multiple entities
│                     │  - Multiple users can link to one entity
└─────────────────────┘

┌─────────────────────┐
│  {entity}_members   │  PERSONNEL/COMPLIANCE
│ (investor_members)  │  - Directors, UBOs, signatories
│                     │  - NOT login users (no user_id FK)
│                     │  - `is_signatory` determines signing rights
└─────────────────────┘
```

### Existing `investor_users` Structure
```sql
CREATE TABLE investor_users (
    investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (investor_id, user_id)
);
```

### Existing `investor_members` Structure
```sql
CREATE TABLE investor_members (
    id uuid PRIMARY KEY,
    investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    role text NOT NULL,  -- director, shareholder, beneficial_owner, authorized_signatory, etc.
    email text,
    phone text,
    residential_street text,
    residential_city text,
    -- ... address fields
    ownership_percentage numeric(5,2),
    is_beneficial_owner boolean DEFAULT false,
    is_signatory boolean DEFAULT false,  -- Can sign documents
    is_active boolean DEFAULT true,
    created_at timestamptz,
    created_by uuid REFERENCES profiles(id)
);
```

---

## Current State Analysis

### Working Pattern (Gold Standard)
| Table | Status | Notes |
|-------|--------|-------|
| `investors` | ✅ Working | Core entity table with type field |
| `investor_users` | ✅ Working | Multi-user linking |
| `investor_members` | ✅ Working | Personnel/compliance tracking |

### Broken or Missing Patterns
| Persona | Core Table | Users Table | Members Table | Action Needed |
|---------|-----------|-------------|---------------|---------------|
| **Arranger** | `arranger_entities` ✅ | ❌ Missing | ❌ Missing | Add both |
| **Introducer** | `introducers` ✅ | ❌ Has broken `user_id` column | ❌ Missing | Create proper tables |
| **Partner** | ❌ Nothing exists | ❌ Nothing | ❌ Nothing | Build all 3 |
| **Commercial Partner** | ❌ Nothing exists | ❌ Nothing | ❌ Nothing | Build all 3 |
| **Lawyer** | ❌ Nothing exists | ❌ Nothing | ❌ Nothing | Build all 3 |

### Current Enums
```sql
-- user_role: Used for portal access control
CREATE TYPE user_role AS ENUM ('investor', 'staff_admin', 'staff_ops', 'staff_rm');

-- deal_member_role: Used for deal-level permissions
CREATE TYPE deal_member_role AS ENUM (
    'investor', 'co_investor', 'spouse', 'advisor',
    'lawyer', 'banker', 'introducer', 'viewer', 'verso_staff'
);
```

---

## Migration Plan Overview

| # | Migration | Tables | Priority |
|---|-----------|--------|----------|
| 1 | `arranger_users` + `arranger_members` | 2 new | HIGH |
| 2 | `introducer_users` + `introducer_members` + data migration | 2 new | HIGH |
| 3 | `partners` + `partner_users` + `partner_members` | 3 new | HIGH |
| 4 | `commercial_partners` + `commercial_partner_users` + `commercial_partner_members` | 3 new | HIGH |
| 5 | `lawyers` + `lawyer_users` + `lawyer_members` | 3 new | HIGH |
| 6 | Update `user_role` enum | - | MEDIUM |
| 7 | `get_user_personas()` function | - | MEDIUM |
| 8 | `commercial_partner_clients` (proxy mode) | 1 new | MEDIUM |
| 9 | `placement_agreements` + `introducer_agreements` | 2 new | MEDIUM |
| 10 | `deal_memberships` role enum + journey tracking | - | HIGH |
| 11 | `companies` infrastructure | 4 new | MEDIUM |
| 12 | `deals.stock_type` column | - | LOW |
| 13 | `pack_generated_at` column | - | LOW |

---

## Migration 1: Arranger Users and Members

**File:** `20251218000001_create_arranger_users_members.sql`

### Existing arranger_entities Structure
```sql
-- Already exists with these columns:
arranger_entities (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    type text CHECK (type IN ('bank', 'broker', 'asset_manager', 'other')),
    regulatory_status text,
    regulatory_number text,
    jurisdiction text,
    contact_name text,
    contact_email text,
    contact_phone text,
    website text,
    address_line_1 text,
    address_line_2 text,
    city text,
    postal_code text,
    country text,
    notes text,
    status text DEFAULT 'active',
    created_at timestamp DEFAULT now(),
    created_by uuid REFERENCES profiles(id),
    updated_at timestamp DEFAULT now()
);
```

### Migration SQL

```sql
-- =============================================================================
-- Migration: Create arranger_users + arranger_members tables
-- =============================================================================

-- 1. Create arranger_users linking table (WHO CAN LOGIN)
CREATE TABLE IF NOT EXISTS arranger_users (
    arranger_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

    PRIMARY KEY (arranger_id, user_id),

    CONSTRAINT arranger_users_arranger_fk
        FOREIGN KEY (arranger_id) REFERENCES arranger_entities(id) ON DELETE CASCADE,
    CONSTRAINT arranger_users_user_fk
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,

    CONSTRAINT arranger_users_role_check
        CHECK (role IN ('admin', 'member', 'viewer'))
);

-- 2. Create arranger_members table (PERSONNEL/COMPLIANCE - follows investor_members pattern)
CREATE TABLE IF NOT EXISTS arranger_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    arranger_id uuid NOT NULL,

    -- Basic info
    full_name text NOT NULL,
    role text NOT NULL,
    role_title text,
    email text,
    phone text,

    -- Address
    residential_street text,
    residential_city text,
    residential_state text,
    residential_postal_code text,
    residential_country text,

    -- Identity
    nationality text,
    id_type text CHECK (id_type IN ('passport', 'national_id', 'drivers_license', 'other')),
    id_number text,
    id_expiry_date date,

    -- Role details
    ownership_percentage numeric(5,2),
    is_beneficial_owner boolean NOT NULL DEFAULT false,
    is_signatory boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,

    -- Dates
    effective_from date,
    effective_to date,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT arranger_members_arranger_fk
        FOREIGN KEY (arranger_id) REFERENCES arranger_entities(id) ON DELETE CASCADE,

    CONSTRAINT arranger_members_role_check
        CHECK (role IN ('director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'officer', 'partner', 'other'))
);

-- 3. Create indexes
CREATE INDEX idx_arranger_users_user_id ON arranger_users(user_id);
CREATE INDEX idx_arranger_users_arranger_id ON arranger_users(arranger_id);
CREATE INDEX idx_arranger_members_arranger_id ON arranger_members(arranger_id);
CREATE INDEX idx_arranger_members_active ON arranger_members(arranger_id) WHERE is_active = true;
CREATE INDEX idx_arranger_members_signatory ON arranger_members(arranger_id) WHERE is_signatory = true;

-- 4. Enable RLS
ALTER TABLE arranger_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arranger_members ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for arranger_users

-- Arrangers can see their own memberships
CREATE POLICY "arranger_users_self_select" ON arranger_users
    FOR SELECT USING (user_id = auth.uid());

-- Arrangers with admin role can manage their entity's users
CREATE POLICY "arranger_users_admin_manage" ON arranger_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM arranger_users au
            WHERE au.arranger_id = arranger_users.arranger_id
            AND au.user_id = auth.uid()
            AND au.role = 'admin'
        )
    );

-- Staff can manage all arranger users
CREATE POLICY "arranger_users_staff_all" ON arranger_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 6. RLS Policies for arranger_members

-- Arrangers can see their own entity's members
CREATE POLICY "arranger_members_self_select" ON arranger_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM arranger_users au
            WHERE au.arranger_id = arranger_members.arranger_id
            AND au.user_id = auth.uid()
        )
    );

-- Arrangers with admin role can manage their entity's members
CREATE POLICY "arranger_members_admin_manage" ON arranger_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM arranger_users au
            WHERE au.arranger_id = arranger_members.arranger_id
            AND au.user_id = auth.uid()
            AND au.role = 'admin'
        )
    );

-- Staff can manage all arranger members
CREATE POLICY "arranger_members_staff_all" ON arranger_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 7. Update arranger_entities RLS to use linking table
DROP POLICY IF EXISTS "arranger_entities_self" ON arranger_entities;

CREATE POLICY "arranger_entities_self_via_users" ON arranger_entities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM arranger_users au
            WHERE au.arranger_id = arranger_entities.id
            AND au.user_id = auth.uid()
        )
    );

-- 8. Updated_at trigger for arranger_members
CREATE OR REPLACE FUNCTION update_arranger_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER arranger_members_updated_at
    BEFORE UPDATE ON arranger_members
    FOR EACH ROW EXECUTE FUNCTION update_arranger_members_updated_at();

-- 9. Comments
COMMENT ON TABLE arranger_users IS
    'Links multiple users to arranger entities. WHO CAN LOGIN as this arranger.';
COMMENT ON TABLE arranger_members IS
    'Personnel/compliance tracking for arranger entities. Directors, UBOs, signatories.';
```

---

## Migration 2: Introducer Users and Members

**File:** `20251218000002_create_introducer_users_members.sql`

### Current introducers.user_id Analysis
- Column is nullable
- Most records have `user_id = NULL` or pointing to `biz@ghiless.com`
- Never actively used in codebase (API routes don't reference it)
- RLS policy `introducers_self` uses it but is effectively broken

### Migration SQL

```sql
-- =============================================================================
-- Migration: Create introducer_users + introducer_members tables
-- =============================================================================

-- 1. Create introducer_users linking table (WHO CAN LOGIN)
CREATE TABLE IF NOT EXISTS introducer_users (
    introducer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'contact',
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

    PRIMARY KEY (introducer_id, user_id),

    CONSTRAINT introducer_users_introducer_fk
        FOREIGN KEY (introducer_id) REFERENCES introducers(id) ON DELETE CASCADE,
    CONSTRAINT introducer_users_user_fk
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,

    CONSTRAINT introducer_users_role_check
        CHECK (role IN ('admin', 'contact', 'payment_contact', 'legal_contact'))
);

-- 2. Create introducer_members table (PERSONNEL/COMPLIANCE)
CREATE TABLE IF NOT EXISTS introducer_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    introducer_id uuid NOT NULL,

    -- Basic info
    full_name text NOT NULL,
    role text NOT NULL,
    role_title text,
    email text,
    phone text,

    -- Address
    residential_street text,
    residential_city text,
    residential_state text,
    residential_postal_code text,
    residential_country text,

    -- Identity
    nationality text,
    id_type text CHECK (id_type IN ('passport', 'national_id', 'drivers_license', 'other')),
    id_number text,
    id_expiry_date date,

    -- Role details
    ownership_percentage numeric(5,2),
    is_beneficial_owner boolean NOT NULL DEFAULT false,
    is_signatory boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,

    -- Dates
    effective_from date,
    effective_to date,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT introducer_members_introducer_fk
        FOREIGN KEY (introducer_id) REFERENCES introducers(id) ON DELETE CASCADE,

    CONSTRAINT introducer_members_role_check
        CHECK (role IN ('director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'officer', 'partner', 'other'))
);

-- 3. Create indexes
CREATE INDEX idx_introducer_users_user_id ON introducer_users(user_id);
CREATE INDEX idx_introducer_users_introducer_id ON introducer_users(introducer_id);
CREATE INDEX idx_introducer_members_introducer_id ON introducer_members(introducer_id);
CREATE INDEX idx_introducer_members_active ON introducer_members(introducer_id) WHERE is_active = true;
CREATE INDEX idx_introducer_members_signatory ON introducer_members(introducer_id) WHERE is_signatory = true;

-- 4. Enable RLS
ALTER TABLE introducer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE introducer_members ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for introducer_users

CREATE POLICY "introducer_users_self_select" ON introducer_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "introducer_users_admin_manage" ON introducer_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM introducer_users iu
            WHERE iu.introducer_id = introducer_users.introducer_id
            AND iu.user_id = auth.uid()
            AND iu.role = 'admin'
        )
    );

CREATE POLICY "introducer_users_staff_all" ON introducer_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 6. RLS Policies for introducer_members

CREATE POLICY "introducer_members_self_select" ON introducer_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM introducer_users iu
            WHERE iu.introducer_id = introducer_members.introducer_id
            AND iu.user_id = auth.uid()
        )
    );

CREATE POLICY "introducer_members_admin_manage" ON introducer_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM introducer_users iu
            WHERE iu.introducer_id = introducer_members.introducer_id
            AND iu.user_id = auth.uid()
            AND iu.role = 'admin'
        )
    );

CREATE POLICY "introducer_members_staff_all" ON introducer_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 7. Migrate existing data from introducers.user_id
INSERT INTO introducer_users (introducer_id, user_id, role, is_primary)
SELECT
    i.id AS introducer_id,
    i.user_id AS user_id,
    'admin' AS role,
    true AS is_primary
FROM introducers i
WHERE i.user_id IS NOT NULL
ON CONFLICT (introducer_id, user_id) DO NOTHING;

-- 8. Update introducers RLS to use linking table
DROP POLICY IF EXISTS "introducers_self" ON introducers;

CREATE POLICY "introducers_self_via_users" ON introducers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM introducer_users iu
            WHERE iu.introducer_id = introducers.id
            AND iu.user_id = auth.uid()
        )
    );

-- 9. Updated_at trigger for introducer_members
CREATE OR REPLACE FUNCTION update_introducer_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER introducer_members_updated_at
    BEFORE UPDATE ON introducer_members
    FOR EACH ROW EXECUTE FUNCTION update_introducer_members_updated_at();

-- 10. Comments
COMMENT ON TABLE introducer_users IS
    'Links multiple users to introducers. WHO CAN LOGIN as this introducer.';
COMMENT ON TABLE introducer_members IS
    'Personnel/compliance tracking for introducer entities. Directors, UBOs, signatories.';

-- NOTE: Old introducers.user_id column is left in place for now.
-- Can be removed in follow-up migration after verification.
```

---

## Migration 3: Partners Infrastructure (NEW)

**File:** `20251218000003_create_partners_infrastructure.sql`

### Migration SQL

```sql
-- =============================================================================
-- Migration: Create partners infrastructure (3 tables: partners, partner_users, partner_members)
-- =============================================================================

-- 1. Create partners table (core entity - follows investors pattern)
CREATE TABLE IF NOT EXISTS partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name text NOT NULL,
    legal_name text,
    type text NOT NULL CHECK (type IN ('individual', 'entity', 'institutional')),

    -- Partner classification
    partner_type text NOT NULL CHECK (partner_type IN ('co_investor', 'syndicate', 'strategic', 'institutional', 'other')),

    -- Status
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    accreditation_status text CHECK (accreditation_status IN ('accredited', 'qualified_purchaser', 'institutional', 'pending', 'none')),

    -- Contact info
    contact_name text,
    contact_email text,
    contact_phone text,
    website text,

    -- Address
    address_line_1 text,
    address_line_2 text,
    city text,
    postal_code text,
    country text,

    -- Investment preferences
    typical_investment_min numeric,
    typical_investment_max numeric,
    preferred_sectors text[],
    preferred_geographies text[],

    -- Relationship
    relationship_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    notes text,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create partner_users linking table (WHO CAN LOGIN)
CREATE TABLE IF NOT EXISTS partner_users (
    partner_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    is_primary boolean NOT NULL DEFAULT false,
    can_sign boolean NOT NULL DEFAULT false,  -- Whether this user can sign documents for the partner
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

    PRIMARY KEY (partner_id, user_id),

    CONSTRAINT partner_users_partner_fk
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    CONSTRAINT partner_users_user_fk
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,

    CONSTRAINT partner_users_role_check
        CHECK (role IN ('admin', 'member', 'viewer'))
);

COMMENT ON COLUMN partner_users.can_sign IS
    'Whether this user can sign documents (NDA, subscription pack, etc.) on behalf of the partner entity.';

-- 3. Create partner_members table (PERSONNEL/COMPLIANCE)
CREATE TABLE IF NOT EXISTS partner_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id uuid NOT NULL,

    -- Basic info
    full_name text NOT NULL,
    role text NOT NULL,
    role_title text,
    email text,
    phone text,

    -- Address
    residential_street text,
    residential_city text,
    residential_state text,
    residential_postal_code text,
    residential_country text,

    -- Identity
    nationality text,
    id_type text CHECK (id_type IN ('passport', 'national_id', 'drivers_license', 'other')),
    id_number text,
    id_expiry_date date,

    -- Role details
    ownership_percentage numeric(5,2),
    is_beneficial_owner boolean NOT NULL DEFAULT false,
    is_signatory boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,

    -- Dates
    effective_from date,
    effective_to date,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT partner_members_partner_fk
        FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,

    CONSTRAINT partner_members_role_check
        CHECK (role IN ('director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'officer', 'partner', 'other'))
);

-- 4. Create indexes
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_partner_type ON partners(partner_type);
CREATE INDEX idx_partner_users_user_id ON partner_users(user_id);
CREATE INDEX idx_partner_users_partner_id ON partner_users(partner_id);
CREATE INDEX idx_partner_members_partner_id ON partner_members(partner_id);
CREATE INDEX idx_partner_members_active ON partner_members(partner_id) WHERE is_active = true;
CREATE INDEX idx_partner_members_signatory ON partner_members(partner_id) WHERE is_signatory = true;

-- 5. Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_members ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for partners

CREATE POLICY "partners_self_via_users" ON partners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM partner_users pu
            WHERE pu.partner_id = partners.id
            AND pu.user_id = auth.uid()
        )
    );

CREATE POLICY "partners_staff_all" ON partners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 7. RLS Policies for partner_users

CREATE POLICY "partner_users_self_select" ON partner_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "partner_users_admin_manage" ON partner_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM partner_users pu
            WHERE pu.partner_id = partner_users.partner_id
            AND pu.user_id = auth.uid()
            AND pu.role = 'admin'
        )
    );

CREATE POLICY "partner_users_staff_all" ON partner_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 8. RLS Policies for partner_members

CREATE POLICY "partner_members_self_select" ON partner_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM partner_users pu
            WHERE pu.partner_id = partner_members.partner_id
            AND pu.user_id = auth.uid()
        )
    );

CREATE POLICY "partner_members_admin_manage" ON partner_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM partner_users pu
            WHERE pu.partner_id = partner_members.partner_id
            AND pu.user_id = auth.uid()
            AND pu.role = 'admin'
        )
    );

CREATE POLICY "partner_members_staff_all" ON partner_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 9. Updated_at triggers
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_partners_updated_at();

CREATE OR REPLACE FUNCTION update_partner_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partner_members_updated_at
    BEFORE UPDATE ON partner_members
    FOR EACH ROW EXECUTE FUNCTION update_partner_members_updated_at();

-- 10. Comments
COMMENT ON TABLE partners IS
    'Partner organizations (co-investors, syndicates, strategic partners). Follows investors pattern.';
COMMENT ON TABLE partner_users IS
    'Links multiple users to partner entities. WHO CAN LOGIN as this partner.';
COMMENT ON TABLE partner_members IS
    'Personnel/compliance tracking for partner entities. Directors, UBOs, signatories.';
```

---

## Migration 4: Commercial Partners Infrastructure (NEW)

**File:** `20251218000004_create_commercial_partners_infrastructure.sql`

### Migration SQL

```sql
-- =============================================================================
-- Migration: Create commercial_partners infrastructure (3 tables)
-- =============================================================================

-- 1. Create commercial_partners table (core entity)
CREATE TABLE IF NOT EXISTS commercial_partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name text NOT NULL,
    legal_name text,
    type text NOT NULL CHECK (type IN ('individual', 'entity', 'institutional')),

    -- Commercial partner classification
    cp_type text NOT NULL CHECK (cp_type IN ('placement_agent', 'distributor', 'wealth_manager', 'family_office', 'bank', 'other')),

    -- Status
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

    -- Regulatory
    regulatory_status text,
    regulatory_number text,
    jurisdiction text,

    -- Contact info
    contact_name text,
    contact_email text,
    contact_phone text,
    website text,

    -- Address
    address_line_1 text,
    address_line_2 text,
    city text,
    postal_code text,
    country text,

    -- Commercial terms
    payment_terms text,
    contract_start_date date,
    contract_end_date date,
    contract_document_id uuid,  -- Will reference documents(id) later

    -- Relationship
    account_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    notes text,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create commercial_partner_users linking table (WHO CAN LOGIN)
CREATE TABLE IF NOT EXISTS commercial_partner_users (
    commercial_partner_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'contact',
    is_primary boolean NOT NULL DEFAULT false,
    can_execute_for_clients boolean NOT NULL DEFAULT false,  -- Whether this user can act in proxy mode
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

    PRIMARY KEY (commercial_partner_id, user_id),

    CONSTRAINT commercial_partner_users_cp_fk
        FOREIGN KEY (commercial_partner_id) REFERENCES commercial_partners(id) ON DELETE CASCADE,
    CONSTRAINT commercial_partner_users_user_fk
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,

    CONSTRAINT commercial_partner_users_role_check
        CHECK (role IN ('admin', 'contact', 'billing_contact', 'technical_contact'))
);

COMMENT ON COLUMN commercial_partner_users.can_execute_for_clients IS
    'Whether this user can sign documents and execute transactions on behalf of clients (proxy mode).';

-- 3. Create commercial_partner_members table (PERSONNEL/COMPLIANCE)
CREATE TABLE IF NOT EXISTS commercial_partner_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    commercial_partner_id uuid NOT NULL,

    -- Basic info
    full_name text NOT NULL,
    role text NOT NULL,
    role_title text,
    email text,
    phone text,

    -- Address
    residential_street text,
    residential_city text,
    residential_state text,
    residential_postal_code text,
    residential_country text,

    -- Identity
    nationality text,
    id_type text CHECK (id_type IN ('passport', 'national_id', 'drivers_license', 'other')),
    id_number text,
    id_expiry_date date,

    -- Role details
    ownership_percentage numeric(5,2),
    is_beneficial_owner boolean NOT NULL DEFAULT false,
    is_signatory boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,

    -- Dates
    effective_from date,
    effective_to date,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT commercial_partner_members_cp_fk
        FOREIGN KEY (commercial_partner_id) REFERENCES commercial_partners(id) ON DELETE CASCADE,

    CONSTRAINT commercial_partner_members_role_check
        CHECK (role IN ('director', 'shareholder', 'beneficial_owner', 'authorized_signatory', 'officer', 'partner', 'other'))
);

-- 4. Create indexes
CREATE INDEX idx_commercial_partners_status ON commercial_partners(status);
CREATE INDEX idx_commercial_partners_type ON commercial_partners(type);
CREATE INDEX idx_commercial_partners_cp_type ON commercial_partners(cp_type);
CREATE INDEX idx_commercial_partner_users_user_id ON commercial_partner_users(user_id);
CREATE INDEX idx_commercial_partner_users_cp_id ON commercial_partner_users(commercial_partner_id);
CREATE INDEX idx_commercial_partner_members_cp_id ON commercial_partner_members(commercial_partner_id);
CREATE INDEX idx_commercial_partner_members_active ON commercial_partner_members(commercial_partner_id) WHERE is_active = true;
CREATE INDEX idx_commercial_partner_members_signatory ON commercial_partner_members(commercial_partner_id) WHERE is_signatory = true;

-- 5. Enable RLS
ALTER TABLE commercial_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_partner_members ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for commercial_partners

CREATE POLICY "commercial_partners_self_via_users" ON commercial_partners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.commercial_partner_id = commercial_partners.id
            AND cpu.user_id = auth.uid()
        )
    );

CREATE POLICY "commercial_partners_staff_all" ON commercial_partners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 7. RLS Policies for commercial_partner_users

CREATE POLICY "commercial_partner_users_self_select" ON commercial_partner_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "commercial_partner_users_admin_manage" ON commercial_partner_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.commercial_partner_id = commercial_partner_users.commercial_partner_id
            AND cpu.user_id = auth.uid()
            AND cpu.role = 'admin'
        )
    );

CREATE POLICY "commercial_partner_users_staff_all" ON commercial_partner_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 8. RLS Policies for commercial_partner_members

CREATE POLICY "commercial_partner_members_self_select" ON commercial_partner_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.commercial_partner_id = commercial_partner_members.commercial_partner_id
            AND cpu.user_id = auth.uid()
        )
    );

CREATE POLICY "commercial_partner_members_admin_manage" ON commercial_partner_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.commercial_partner_id = commercial_partner_members.commercial_partner_id
            AND cpu.user_id = auth.uid()
            AND cpu.role = 'admin'
        )
    );

CREATE POLICY "commercial_partner_members_staff_all" ON commercial_partner_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 9. Updated_at triggers
CREATE OR REPLACE FUNCTION update_commercial_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commercial_partners_updated_at
    BEFORE UPDATE ON commercial_partners
    FOR EACH ROW EXECUTE FUNCTION update_commercial_partners_updated_at();

CREATE OR REPLACE FUNCTION update_commercial_partner_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commercial_partner_members_updated_at
    BEFORE UPDATE ON commercial_partner_members
    FOR EACH ROW EXECUTE FUNCTION update_commercial_partner_members_updated_at();

-- 10. Comments
COMMENT ON TABLE commercial_partners IS
    'Commercial partner organizations (placement agents, distributors, wealth managers). Follows investors pattern.';
COMMENT ON TABLE commercial_partner_users IS
    'Links multiple users to commercial partner entities. WHO CAN LOGIN as this commercial partner.';
COMMENT ON TABLE commercial_partner_members IS
    'Personnel/compliance tracking for commercial partner entities. Directors, UBOs, signatories.';
```

---

## Migration 5: Lawyers Infrastructure (NEW)

**File:** `20251218000005_create_lawyers_infrastructure.sql`

### Migration SQL

```sql
-- =============================================================================
-- Migration: Create lawyers infrastructure (3 tables: lawyers, lawyer_users, lawyer_members)
-- =============================================================================

-- 1. Create lawyers table (core entity - follows investors pattern)
CREATE TABLE IF NOT EXISTS lawyers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    name text NOT NULL,  -- Firm name or individual name
    legal_name text,
    type text NOT NULL CHECK (type IN ('individual', 'firm')),

    -- Classification
    lawyer_type text NOT NULL CHECK (lawyer_type IN ('law_firm', 'solo_practitioner', 'in_house', 'notary', 'other')),

    -- Status
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

    -- Regulatory
    bar_admission text,  -- Bar association details
    bar_number text,
    jurisdiction text,

    -- Contact info
    contact_name text,  -- Primary contact at firm
    contact_email text,
    contact_phone text,
    website text,

    -- Address
    address_line_1 text,
    address_line_2 text,
    city text,
    postal_code text,
    country text,

    -- Practice areas
    practice_areas text[],  -- ['corporate', 'securities', 'private_equity', etc.]

    -- Relationship
    account_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    notes text,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create lawyer_users linking table (WHO CAN LOGIN)
CREATE TABLE IF NOT EXISTS lawyer_users (
    lawyer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

    PRIMARY KEY (lawyer_id, user_id),

    CONSTRAINT lawyer_users_lawyer_fk
        FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    CONSTRAINT lawyer_users_user_fk
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,

    CONSTRAINT lawyer_users_role_check
        CHECK (role IN ('partner', 'associate', 'paralegal', 'admin', 'viewer'))
);

-- 3. Create lawyer_members table (PERSONNEL/COMPLIANCE)
CREATE TABLE IF NOT EXISTS lawyer_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lawyer_id uuid NOT NULL,

    -- Basic info
    full_name text NOT NULL,
    role text NOT NULL,
    role_title text,  -- e.g., 'Senior Partner', 'Associate', 'Paralegal'
    email text,
    phone text,

    -- Address
    residential_street text,
    residential_city text,
    residential_state text,
    residential_postal_code text,
    residential_country text,

    -- Bar admission (for individual lawyers)
    bar_admission text,
    bar_number text,
    bar_jurisdiction text,

    -- Role details
    ownership_percentage numeric(5,2),  -- For law firm partners
    is_beneficial_owner boolean NOT NULL DEFAULT false,
    is_signatory boolean NOT NULL DEFAULT false,  -- Can sign on behalf of firm
    is_active boolean NOT NULL DEFAULT true,

    -- Dates
    effective_from date,
    effective_to date,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT lawyer_members_lawyer_fk
        FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,

    CONSTRAINT lawyer_members_role_check
        CHECK (role IN ('partner', 'equity_partner', 'associate', 'paralegal', 'other'))
);

-- 4. Create indexes
CREATE INDEX idx_lawyers_status ON lawyers(status);
CREATE INDEX idx_lawyers_type ON lawyers(type);
CREATE INDEX idx_lawyers_lawyer_type ON lawyers(lawyer_type);
CREATE INDEX idx_lawyers_jurisdiction ON lawyers(jurisdiction);
CREATE INDEX idx_lawyer_users_user_id ON lawyer_users(user_id);
CREATE INDEX idx_lawyer_users_lawyer_id ON lawyer_users(lawyer_id);
CREATE INDEX idx_lawyer_members_lawyer_id ON lawyer_members(lawyer_id);
CREATE INDEX idx_lawyer_members_active ON lawyer_members(lawyer_id) WHERE is_active = true;
CREATE INDEX idx_lawyer_members_signatory ON lawyer_members(lawyer_id) WHERE is_signatory = true;

-- 5. Enable RLS
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_members ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for lawyers

-- Lawyers can see their own entity
CREATE POLICY "lawyers_self_via_users" ON lawyers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lawyer_users lu
            WHERE lu.lawyer_id = lawyers.id
            AND lu.user_id = auth.uid()
        )
    );

-- Lawyers can see lawyers assigned to their deals
CREATE POLICY "lawyers_via_deal" ON lawyers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deal_memberships dm
            JOIN investor_users iu ON iu.user_id = dm.user_id
            WHERE dm.deal_id IN (
                SELECT dm2.deal_id FROM deal_memberships dm2
                JOIN lawyer_users lu ON lu.user_id = dm2.user_id
                WHERE lu.lawyer_id = lawyers.id
            )
            AND iu.user_id = auth.uid()
        )
    );

-- Staff can manage all
CREATE POLICY "lawyers_staff_all" ON lawyers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 7. RLS Policies for lawyer_users

CREATE POLICY "lawyer_users_self_select" ON lawyer_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "lawyer_users_admin_manage" ON lawyer_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lawyer_users lu
            WHERE lu.lawyer_id = lawyer_users.lawyer_id
            AND lu.user_id = auth.uid()
            AND lu.role IN ('partner', 'admin')
        )
    );

CREATE POLICY "lawyer_users_staff_all" ON lawyer_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 8. RLS Policies for lawyer_members

CREATE POLICY "lawyer_members_self_select" ON lawyer_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lawyer_users lu
            WHERE lu.lawyer_id = lawyer_members.lawyer_id
            AND lu.user_id = auth.uid()
        )
    );

CREATE POLICY "lawyer_members_admin_manage" ON lawyer_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lawyer_users lu
            WHERE lu.lawyer_id = lawyer_members.lawyer_id
            AND lu.user_id = auth.uid()
            AND lu.role IN ('partner', 'admin')
        )
    );

CREATE POLICY "lawyer_members_staff_all" ON lawyer_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 9. Updated_at triggers
CREATE OR REPLACE FUNCTION update_lawyers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lawyers_updated_at
    BEFORE UPDATE ON lawyers
    FOR EACH ROW EXECUTE FUNCTION update_lawyers_updated_at();

CREATE OR REPLACE FUNCTION update_lawyer_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lawyer_members_updated_at
    BEFORE UPDATE ON lawyer_members
    FOR EACH ROW EXECUTE FUNCTION update_lawyer_members_updated_at();

-- 10. Comments
COMMENT ON TABLE lawyers IS
    'Law firms and individual lawyers. Used for deal-level legal representation and escrow management.';
COMMENT ON TABLE lawyer_users IS
    'Links multiple users to lawyer entities. WHO CAN LOGIN as this lawyer/firm.';
COMMENT ON TABLE lawyer_members IS
    'Personnel tracking for law firms. Partners, associates, paralegals.';
```

---

## Migration 6: Update user_role Enum

**File:** `20251218000006_update_user_role_enum.sql`

> **ℹ️ Design Decision: Legacy Staff Roles Intentionally Kept**
>
> This migration **adds** new roles but does **NOT** migrate existing staff users.
> - `staff_admin`, `staff_ops`, `staff_rm` remain valid and functional
> - The `ceo` role is for **new** CEO user accounts or **manual** promotions
> - Existing staff accounts continue working with their current roles
> - Full staff role consolidation is planned for a **future phase**
>
> **Why?** Changing roles for existing users could break permissions mid-deployment.
> The `get_user_personas()` function handles both legacy AND new role patterns.

```sql
-- =============================================================================
-- Migration: Extend user_role enum with new persona types
-- NO DATA MIGRATION - Legacy staff roles intentionally preserved
-- =============================================================================

-- NOTE: PostgreSQL doesn't allow easy enum modification in transactions.
-- We need to add values one at a time.

-- Add 'arranger' role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'arranger';

-- Add 'introducer' role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'introducer';

-- Add 'partner' role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

-- Add 'commercial_partner' role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'commercial_partner';

-- Add 'lawyer' role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lawyer';

-- Add 'ceo' role (for VERSO CEO user stories)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ceo';

-- Result: user_role now has these values:
-- LEGACY (kept for backwards compatibility, deprecate in Phase 2):
--   'staff_admin', 'staff_ops', 'staff_rm'
-- ACTIVE:
--   'investor', 'ceo', 'arranger', 'introducer', 'partner', 'commercial_partner', 'lawyer'
--
-- NOTE: Persona detection should use linking tables (investor_users, partner_users, etc.),
-- NOT profiles.role. The profiles.role field is becoming legacy except for 'ceo'.

COMMENT ON TYPE user_role IS
    'User persona types. LEGACY: staff_admin/staff_ops/staff_rm (kept for backwards compat).
     ACTIVE: investor, ceo, arranger, introducer, partner, commercial_partner, lawyer.
     Prefer detecting personas via linking tables (investor_users, etc.) not this field.';
```

---

## Migration 7: Persona Detection Function

**File:** `20251218000007_create_persona_detection_function.sql`

```sql
-- =============================================================================
-- Migration: Create persona detection function
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_personas(p_user_id uuid)
RETURNS TABLE (
    persona_type text,
    entity_id uuid,
    entity_name text,
    role text,
    is_primary boolean
) AS $$
BEGIN
    -- Investors
    RETURN QUERY
    SELECT
        'investor'::text,
        iu.investor_id,
        COALESCE(i.legal_name, i.display_name),
        'member'::text,
        true
    FROM investor_users iu
    JOIN investors i ON iu.investor_id = i.id
    WHERE iu.user_id = p_user_id;

    -- Arrangers
    RETURN QUERY
    SELECT
        'arranger'::text,
        au.arranger_id,
        ae.name,
        au.role,
        au.is_primary
    FROM arranger_users au
    JOIN arranger_entities ae ON au.arranger_id = ae.id
    WHERE au.user_id = p_user_id;

    -- Introducers
    RETURN QUERY
    SELECT
        'introducer'::text,
        iu.introducer_id,
        COALESCE(i.legal_name, i.name),
        iu.role,
        iu.is_primary
    FROM introducer_users iu
    JOIN introducers i ON iu.introducer_id = i.id
    WHERE iu.user_id = p_user_id;

    -- Partners
    RETURN QUERY
    SELECT
        'partner'::text,
        pu.partner_id,
        COALESCE(pe.legal_name, pe.name),
        pu.role,
        pu.is_primary
    FROM partner_users pu
    JOIN partners pe ON pu.partner_id = pe.id
    WHERE pu.user_id = p_user_id;

    -- Commercial Partners
    RETURN QUERY
    SELECT
        'commercial_partner'::text,
        cpu.commercial_partner_id,
        COALESCE(cpe.legal_name, cpe.name),
        cpu.role,
        cpu.is_primary
    FROM commercial_partner_users cpu
    JOIN commercial_partners cpe ON cpu.commercial_partner_id = cpe.id
    WHERE cpu.user_id = p_user_id;

    -- Lawyers
    RETURN QUERY
    SELECT
        'lawyer'::text,
        lu.lawyer_id,
        COALESCE(l.legal_name, l.name),
        lu.role,
        lu.is_primary
    FROM lawyer_users lu
    JOIN lawyers l ON lu.lawyer_id = l.id
    WHERE lu.user_id = p_user_id;

    -- Deal member roles (for context-specific access)
    RETURN QUERY
    SELECT
        'deal_member_' || dm.role::text,
        dm.deal_id,
        d.title,
        dm.role::text,
        false
    FROM deal_memberships dm
    JOIN deals d ON dm.deal_id = d.id
    WHERE dm.user_id = p_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_personas IS
    'Returns all personas/entities a user belongs to across all linking tables.
     Used for persona detection and portal routing.';

GRANT EXECUTE ON FUNCTION get_user_personas TO authenticated;
```

---

## Migration 8: Commercial Partner Proxy Mode

**File:** `20251218000008_create_commercial_partner_clients.sql`

```sql
-- =============================================================================
-- Migration: Create commercial partner proxy mode infrastructure
-- =============================================================================

-- 1. Create commercial_partner_clients table for tracking proxy relationships
CREATE TABLE IF NOT EXISTS commercial_partner_clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who is the proxy (Commercial Partner)
    commercial_partner_id uuid NOT NULL,

    -- Who is executing for this client (must have can_execute_for_clients = true)
    acting_user_id uuid,  -- The CP user assigned to handle this client dispatch

    -- Who is the client
    client_name text NOT NULL,  -- May be new/unknown investor
    client_investor_id uuid,     -- If client is existing investor (nullable)

    -- Context
    created_for_deal_id uuid NOT NULL,  -- Which deal this proxy was created for

    -- Contact info (for unknown clients)
    client_email text,
    client_phone text,
    client_address text,

    -- Status tracking
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Foreign keys
    CONSTRAINT commercial_partner_clients_cp_fk
        FOREIGN KEY (commercial_partner_id) REFERENCES commercial_partners(id) ON DELETE CASCADE,
    CONSTRAINT commercial_partner_clients_acting_user_fk
        FOREIGN KEY (acting_user_id) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT commercial_partner_clients_investor_fk
        FOREIGN KEY (client_investor_id) REFERENCES investors(id) ON DELETE SET NULL,
    CONSTRAINT commercial_partner_clients_deal_fk
        FOREIGN KEY (created_for_deal_id) REFERENCES deals(id) ON DELETE CASCADE
);

COMMENT ON COLUMN commercial_partner_clients.acting_user_id IS
    'The CP user assigned to handle this client dispatch. Must have can_execute_for_clients = true.';

-- 2. Create indexes
CREATE INDEX idx_cp_clients_commercial_partner ON commercial_partner_clients(commercial_partner_id);
CREATE INDEX idx_cp_clients_acting_user ON commercial_partner_clients(acting_user_id);
CREATE INDEX idx_cp_clients_investor ON commercial_partner_clients(client_investor_id);
CREATE INDEX idx_cp_clients_deal ON commercial_partner_clients(created_for_deal_id);
CREATE INDEX idx_cp_clients_status ON commercial_partner_clients(status);

-- 3. Enable RLS
ALTER TABLE commercial_partner_clients ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Commercial Partners can see their own clients
CREATE POLICY "commercial_partner_clients_self" ON commercial_partner_clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.commercial_partner_id = commercial_partner_clients.commercial_partner_id
            AND cpu.user_id = auth.uid()
        )
    );

-- Commercial Partners with admin role can manage their clients
CREATE POLICY "commercial_partner_clients_admin_manage" ON commercial_partner_clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.commercial_partner_id = commercial_partner_clients.commercial_partner_id
            AND cpu.user_id = auth.uid()
            AND cpu.role = 'admin'
        )
    );

-- Staff can manage all proxy clients
CREATE POLICY "commercial_partner_clients_staff_all" ON commercial_partner_clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION update_cp_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER commercial_partner_clients_updated_at
    BEFORE UPDATE ON commercial_partner_clients
    FOR EACH ROW EXECUTE FUNCTION update_cp_clients_updated_at();

-- 6. Validate acting_user has proxy permission
CREATE OR REPLACE FUNCTION validate_cp_acting_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.acting_user_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.user_id = NEW.acting_user_id
            AND cpu.commercial_partner_id = NEW.commercial_partner_id
            AND cpu.can_execute_for_clients = true
        ) THEN
            RAISE EXCEPTION 'Acting user must be a Commercial Partner member with can_execute_for_clients = true';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_valid_cp_acting_user
    BEFORE INSERT OR UPDATE ON commercial_partner_clients
    FOR EACH ROW EXECUTE FUNCTION validate_cp_acting_user();

-- 7. Comment
COMMENT ON TABLE commercial_partner_clients IS
    'Tracks proxy relationships for Commercial Partners acting on behalf of clients (MODE 2).
     When a Commercial Partner submits a subscription for a client, this table links the CP to the client.
     The acting_user_id tracks WHO is handling this client dispatch (must have can_execute_for_clients = true).';
```

---

## Migration 9: Placement and Introducer Agreements

**File:** `20251218000009_create_agreement_tables.sql`

```sql
-- =============================================================================
-- Migration: Create agreement tracking tables
-- =============================================================================

-- 1. Placement Agreements (Commercial Partners)
CREATE TABLE IF NOT EXISTS placement_agreements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who is the Commercial Partner
    commercial_partner_id uuid NOT NULL,

    -- Agreement details
    title text NOT NULL DEFAULT 'Placement Agreement',
    description text,

    -- Document link
    document_id uuid,  -- REFERENCES documents(id) - deferred

    -- Terms
    fee_structure jsonb,  -- Flexible structure for fee terms
    effective_date date NOT NULL,
    expiry_date date,     -- NULL = no expiry

    -- Status
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated')),
    signed_at timestamptz,
    signed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Foreign keys
    CONSTRAINT placement_agreements_cp_fk
        FOREIGN KEY (commercial_partner_id) REFERENCES commercial_partners(id) ON DELETE CASCADE
);

-- 2. Introducer Agreements (REQUIRED before introducing)
CREATE TABLE IF NOT EXISTS introducer_agreements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who is the Introducer
    introducer_id uuid NOT NULL,

    -- Agreement details
    title text NOT NULL DEFAULT 'Introducer Fee Agreement',
    description text,

    -- Document link
    document_id uuid,  -- REFERENCES documents(id) - deferred

    -- Fee terms
    commission_rate numeric(5,4),      -- e.g., 0.0100 = 1%
    commission_type text CHECK (commission_type IN ('percentage', 'flat_fee', 'tiered')),
    commission_details jsonb,           -- Flexible structure for complex fee arrangements

    -- Validity
    effective_date date NOT NULL,
    expiry_date date,

    -- Status
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'expired', 'terminated')),
    signed_at timestamptz,
    signed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Foreign keys
    CONSTRAINT introducer_agreements_introducer_fk
        FOREIGN KEY (introducer_id) REFERENCES introducers(id) ON DELETE CASCADE
);

-- 3. Create indexes
CREATE INDEX idx_placement_agreements_cp ON placement_agreements(commercial_partner_id);
CREATE INDEX idx_placement_agreements_status ON placement_agreements(status);
CREATE INDEX idx_introducer_agreements_introducer ON introducer_agreements(introducer_id);
CREATE INDEX idx_introducer_agreements_status ON introducer_agreements(status);

-- 4. Enable RLS
ALTER TABLE placement_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE introducer_agreements ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for placement_agreements

-- Commercial Partners can see their own agreements
CREATE POLICY "placement_agreements_self" ON placement_agreements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM commercial_partner_users cpu
            WHERE cpu.commercial_partner_id = placement_agreements.commercial_partner_id
            AND cpu.user_id = auth.uid()
        )
    );

-- Staff can manage all
CREATE POLICY "placement_agreements_staff_all" ON placement_agreements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 6. RLS Policies for introducer_agreements

-- Introducers can see their own agreements
CREATE POLICY "introducer_agreements_self" ON introducer_agreements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM introducer_users iu
            WHERE iu.introducer_id = introducer_agreements.introducer_id
            AND iu.user_id = auth.uid()
        )
    );

-- Staff can manage all
CREATE POLICY "introducer_agreements_staff_all" ON introducer_agreements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 7. Updated_at triggers
CREATE OR REPLACE FUNCTION update_placement_agreements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placement_agreements_updated_at
    BEFORE UPDATE ON placement_agreements
    FOR EACH ROW EXECUTE FUNCTION update_placement_agreements_updated_at();

CREATE OR REPLACE FUNCTION update_introducer_agreements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER introducer_agreements_updated_at
    BEFORE UPDATE ON introducer_agreements
    FOR EACH ROW EXECUTE FUNCTION update_introducer_agreements_updated_at();

-- 8. Comments
COMMENT ON TABLE placement_agreements IS
    'Formal institutional agreements with Commercial Partners defining placement terms.';

COMMENT ON TABLE introducer_agreements IS
    'Fee agreements with Introducers. REQUIRED before introducer can make introductions.
     Check status = active before allowing introduction functionality.';

-- 9. Helper function to check if introducer has active agreement
CREATE OR REPLACE FUNCTION has_active_introducer_agreement(p_introducer_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM introducer_agreements
        WHERE introducer_id = p_introducer_id
        AND status = 'active'
        AND (expiry_date IS NULL OR expiry_date > CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_active_introducer_agreement IS
    'Returns true if introducer has an active (non-expired) agreement. Use to block introductions.';

GRANT EXECUTE ON FUNCTION has_active_introducer_agreement TO authenticated;
```

---

## Migration 10: Deal Memberships Role Enum & Journey Tracking

**File:** `20251218000010_update_deal_memberships.sql`

```sql
-- =============================================================================
-- Migration: Update deal_memberships for conditional access and journey tracking
-- =============================================================================

-- 1. Add new roles to deal_member_role enum
-- (PostgreSQL enums require adding values one at a time)

-- Partner with investor access for specific deal
ALTER TYPE deal_member_role ADD VALUE IF NOT EXISTS 'partner_investor';

-- Introducer with investor access for specific deal
ALTER TYPE deal_member_role ADD VALUE IF NOT EXISTS 'introducer_investor';

-- Commercial Partner direct investment (MODE 1)
ALTER TYPE deal_member_role ADD VALUE IF NOT EXISTS 'commercial_partner_investor';

-- Commercial Partner proxy mode (MODE 2 - on behalf of client)
ALTER TYPE deal_member_role ADD VALUE IF NOT EXISTS 'commercial_partner_proxy';

-- Commercial Partner tracking only (no invest/proxy access)
ALTER TYPE deal_member_role ADD VALUE IF NOT EXISTS 'commercial_partner';

-- Partner tracking only (no investor access)
ALTER TYPE deal_member_role ADD VALUE IF NOT EXISTS 'partner';

-- Arranger role (when arranger is involved in deal)
ALTER TYPE deal_member_role ADD VALUE IF NOT EXISTS 'arranger';

-- Comment on updated enum
COMMENT ON TYPE deal_member_role IS
    'Roles for deal membership.
     investor/co_investor/spouse = standard investors
     partner_investor/introducer_investor/commercial_partner_investor = hybrid personas with investor access FOR THIS DEAL
     commercial_partner_proxy = acting on behalf of client
     partner/introducer/commercial_partner/arranger = tracking only (no investment access)
     lawyer/banker/advisor/viewer/verso_staff = other roles';

-- 2. Add journey tracking columns

-- When IO was dispatched to investor (NULL = investor found deal on their own)
ALTER TABLE deal_memberships
ADD COLUMN IF NOT EXISTS received_at timestamptz;

COMMENT ON COLUMN deal_memberships.received_at IS
    'When Investment Opportunity was dispatched to this user. NULL if user found deal independently.';

-- When investor first viewed deal detail page
ALTER TABLE deal_memberships
ADD COLUMN IF NOT EXISTS first_viewed_at timestamptz;

COMMENT ON COLUMN deal_memberships.first_viewed_at IS
    'When user first viewed this deal detail page. Used for journey tracking Stage 2 (Viewed).';

-- 3. Create index for journey queries
CREATE INDEX IF NOT EXISTS idx_deal_memberships_received_at
    ON deal_memberships(received_at) WHERE received_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deal_memberships_viewed_at
    ON deal_memberships(first_viewed_at) WHERE first_viewed_at IS NOT NULL;

-- 4. Backfill received_at and first_viewed_at from existing data
-- This ensures historical dispatches render correctly in the journey UI

-- Backfill received_at from invited_at (when the IO was dispatched)
UPDATE deal_memberships
SET received_at = invited_at
WHERE received_at IS NULL
  AND invited_at IS NOT NULL;

-- Backfill first_viewed_at from accepted_at (when user accepted = viewed the deal)
-- Fall back to invited_at if accepted_at is NULL but invited_at exists
UPDATE deal_memberships
SET first_viewed_at = COALESCE(accepted_at, invited_at)
WHERE first_viewed_at IS NULL
  AND (accepted_at IS NOT NULL OR invited_at IS NOT NULL);

-- Report backfill results
DO $$
DECLARE
    received_count integer;
    viewed_count integer;
BEGIN
    SELECT COUNT(*) INTO received_count FROM deal_memberships WHERE received_at IS NOT NULL;
    SELECT COUNT(*) INTO viewed_count FROM deal_memberships WHERE first_viewed_at IS NOT NULL;
    RAISE NOTICE 'Backfill complete: % memberships with received_at, % with first_viewed_at', received_count, viewed_count;
END $$;

-- 5. Function to check if user has investor access to a specific deal
CREATE OR REPLACE FUNCTION has_deal_investor_access(p_user_id uuid, p_deal_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM deal_memberships dm
        WHERE dm.user_id = p_user_id
        AND dm.deal_id = p_deal_id
        AND dm.role IN (
            'investor',
            'co_investor',
            'spouse',
            'partner_investor',
            'introducer_investor',
            'commercial_partner_investor',
            'commercial_partner_proxy'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_deal_investor_access IS
    'Returns true if user can invest in this specific deal.
     Hybrid personas (partner, introducer, commercial_partner) need explicit _investor or _proxy role.';

GRANT EXECUTE ON FUNCTION has_deal_investor_access TO authenticated;

-- 5. Function to auto-create deal membership for direct subscribers
CREATE OR REPLACE FUNCTION ensure_deal_membership_for_subscriber()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed for new subscriptions
    IF TG_OP = 'INSERT' THEN
        -- Check if deal_membership already exists
        IF NOT EXISTS (
            SELECT 1 FROM deal_memberships dm
            WHERE dm.deal_id = NEW.deal_id
            AND dm.user_id = NEW.created_by
        ) THEN
            -- Create membership with viewed timestamp (they viewed to subscribe)
            INSERT INTO deal_memberships (deal_id, user_id, role, first_viewed_at, invited_at, accepted_at)
            VALUES (
                NEW.deal_id,
                NEW.created_by,
                'investor',
                NEW.submitted_at,  -- They viewed at subscription time
                now(),
                now()
            )
            ON CONFLICT (deal_id, user_id) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to deal_subscription_submissions
DROP TRIGGER IF EXISTS ensure_deal_membership_on_subscribe ON deal_subscription_submissions;
CREATE TRIGGER ensure_deal_membership_on_subscribe
    AFTER INSERT ON deal_subscription_submissions
    FOR EACH ROW EXECUTE FUNCTION ensure_deal_membership_for_subscriber();

COMMENT ON FUNCTION ensure_deal_membership_for_subscriber IS
    'Auto-creates deal_membership when investor subscribes directly without prior dispatch.
     Sets first_viewed_at to subscription time, leaves received_at NULL (not dispatched).';
```

---

## Migration 11: Companies Infrastructure

**File:** `20251218000011_create_companies_infrastructure.sql`

> ⚠️ **WARNING: Empty Tables by Design**
> This migration creates empty tables. Company data must be backfilled from the `vehicles` table
> in a SEPARATE migration/script BEFORE any UI expects `company_id` to be populated.
> The backfill script should:
> 1. Create company records from unique vehicle company data
> 2. Migrate stakeholders/directors/valuations from vehicles to company tables
> 3. Update `vehicles.company_id` to link to the new company records
>
> **UI must handle `company_id = NULL` gracefully until backfill is complete.**

```sql
-- =============================================================================
-- Migration: Create companies infrastructure (separate from vehicles)
-- ⚠️ IMPORTANT: This creates EMPTY tables. Data backfill is a SEPARATE task.
-- See migration documentation for backfill requirements.
-- =============================================================================

-- 1. Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    legal_name text NOT NULL,
    trading_name text,
    company_type text CHECK (company_type IN ('limited', 'llc', 'plc', 'partnership', 'trust', 'foundation', 'other')),

    -- Registration
    registration_number text,
    registration_country text NOT NULL,
    registration_date date,

    -- Address (domicile)
    address_line_1 text,
    address_line_2 text,
    city text,
    state_province text,
    postal_code text,
    country text,

    -- Branding
    logo_url text,
    website text,

    -- Status
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dissolved')),

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Link vehicles to companies
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id) ON DELETE SET NULL;

COMMENT ON COLUMN vehicles.company_id IS
    'The underlying company for this vehicle. Vehicles are investment structures; companies are legal entities.';

-- 3. Create company_stakeholders table
CREATE TABLE IF NOT EXISTS company_stakeholders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Stakeholder info
    name text NOT NULL,
    role text NOT NULL CHECK (role IN ('shareholder', 'beneficial_owner', 'investor', 'partner', 'other')),
    ownership_percentage numeric(5,2),

    -- Contact
    email text,
    phone text,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create company_directors table
CREATE TABLE IF NOT EXISTS company_directors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Director info
    full_name text NOT NULL,
    title text,

    -- Contact
    email text,
    phone text,

    -- Term
    appointed_date date,
    resigned_date date,
    is_active boolean NOT NULL DEFAULT true,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Create company_valuations table
CREATE TABLE IF NOT EXISTS company_valuations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Valuation details
    valuation_date date NOT NULL,
    valuation_amount numeric(18,2) NOT NULL,
    currency text NOT NULL DEFAULT 'USD',
    valuation_method text,

    -- Source
    source text,
    source_document_id uuid,

    -- Audit
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- 6. Create indexes
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_country ON companies(registration_country);
CREATE INDEX idx_vehicles_company ON vehicles(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_company_stakeholders_company ON company_stakeholders(company_id);
CREATE INDEX idx_company_directors_company ON company_directors(company_id);
CREATE INDEX idx_company_directors_active ON company_directors(company_id) WHERE is_active = true;
CREATE INDEX idx_company_valuations_company ON company_valuations(company_id);
CREATE INDEX idx_company_valuations_date ON company_valuations(valuation_date DESC);

-- 7. Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_valuations ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for companies

-- Investors can see companies for vehicles they're invested in (existing subscriptions)
CREATE POLICY "companies_investor_via_subscription" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vehicles v
            JOIN subscriptions s ON s.vehicle_id = v.id
            JOIN investor_users iu ON iu.investor_id = s.investor_id
            WHERE v.company_id = companies.id
            AND iu.user_id = auth.uid()
        )
    );

-- Deal members can see companies during evaluation (BEFORE subscribing)
-- This allows investors, partners, commercial partners etc. to view company info
-- on deal detail pages before they commit capital
CREATE POLICY "companies_deal_member_read" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vehicles v
            JOIN deals d ON d.vehicle_id = v.id
            JOIN deal_memberships dm ON dm.deal_id = d.id
            WHERE v.company_id = companies.id
            AND dm.user_id = auth.uid()
        )
    );

-- Staff can manage all
CREATE POLICY "companies_staff_all" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- 9. Simplified policies for related tables

-- Staff can manage all company-related tables
CREATE POLICY "company_stakeholders_staff_all" ON company_stakeholders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

CREATE POLICY "company_directors_staff_all" ON company_directors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

CREATE POLICY "company_valuations_staff_all" ON company_valuations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('staff_admin', 'staff_ops', 'staff_rm', 'ceo')
        )
    );

-- Deal members can read company details during evaluation
CREATE POLICY "company_stakeholders_deal_member_read" ON company_stakeholders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies c
            JOIN vehicles v ON v.company_id = c.id
            JOIN deals d ON d.vehicle_id = v.id
            JOIN deal_memberships dm ON dm.deal_id = d.id
            WHERE c.id = company_stakeholders.company_id
            AND dm.user_id = auth.uid()
        )
    );

CREATE POLICY "company_directors_deal_member_read" ON company_directors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies c
            JOIN vehicles v ON v.company_id = c.id
            JOIN deals d ON d.vehicle_id = v.id
            JOIN deal_memberships dm ON dm.deal_id = d.id
            WHERE c.id = company_directors.company_id
            AND dm.user_id = auth.uid()
        )
    );

CREATE POLICY "company_valuations_deal_member_read" ON company_valuations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies c
            JOIN vehicles v ON v.company_id = c.id
            JOIN deals d ON d.vehicle_id = v.id
            JOIN deal_memberships dm ON dm.deal_id = d.id
            WHERE c.id = company_valuations.company_id
            AND dm.user_id = auth.uid()
        )
    );

-- 10. Updated_at trigger for companies
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_companies_updated_at();

-- 11. Comments
COMMENT ON TABLE companies IS
    'Legal entities that own investment structures (vehicles). Separated from vehicles for proper modeling.';
COMMENT ON TABLE company_stakeholders IS
    'Shareholders and beneficial owners of companies.';
COMMENT ON TABLE company_directors IS
    'Board directors of companies.';
COMMENT ON TABLE company_valuations IS
    'Historical valuations of companies.';
```

---

## Migration 12: Deals Table Updates

**File:** `20251218000012_update_deals_table.sql`

```sql
-- =============================================================================
-- Migration: Update deals table with stock_type
-- =============================================================================

-- 1. Add stock_type field
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS stock_type text;

-- Add check constraint for valid values
ALTER TABLE deals
DROP CONSTRAINT IF EXISTS deals_stock_type_check;

ALTER TABLE deals
ADD CONSTRAINT deals_stock_type_check
CHECK (stock_type IS NULL OR stock_type IN (
    'common_stock',
    'preferred_stock',
    'series_a',
    'series_b',
    'series_c',
    'convertible_note',
    'safe',
    'bond',
    'unit',
    'limited_partnership',
    'other'
));

COMMENT ON COLUMN deals.stock_type IS
    'Type of stock/security being offered: common_stock, preferred_stock, series_a/b/c, convertible_note, safe, bond, unit, limited_partnership, other';

-- 2. Create index for stock_type queries
CREATE INDEX IF NOT EXISTS idx_deals_stock_type ON deals(stock_type) WHERE stock_type IS NOT NULL;

-- 3. Make vehicle_id NOT NULL (all existing deals already have vehicle_id)
-- First verify no NULL values exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM deals WHERE vehicle_id IS NULL) THEN
        RAISE EXCEPTION 'Cannot add NOT NULL constraint: some deals have NULL vehicle_id';
    END IF;
END $$;

-- Add NOT NULL constraint
ALTER TABLE deals
ALTER COLUMN vehicle_id SET NOT NULL;

COMMENT ON COLUMN deals.vehicle_id IS
    'The vehicle/fund this deal belongs to. Required for all deals.';
```

---

## Migration 13: Subscription Pack Tracking

**File:** `20251218000013_add_pack_generated_timestamp.sql`

```sql
-- =============================================================================
-- Migration: Add subscription pack generation tracking
-- =============================================================================

-- 1. Add pack_generated_at column
ALTER TABLE deal_subscription_submissions
ADD COLUMN IF NOT EXISTS pack_generated_at timestamptz;

COMMENT ON COLUMN deal_subscription_submissions.pack_generated_at IS
    'When the subscription pack PDF was generated. Stage 6 of 10-stage investor journey.';

-- 2. Create index for journey queries
CREATE INDEX IF NOT EXISTS idx_subscription_pack_generated
    ON deal_subscription_submissions(pack_generated_at) WHERE pack_generated_at IS NOT NULL;

-- 3. Function to get investor journey status for a deal
-- FIXES from Codex review:
--   1. Added ORDER BY to membership query (prevents random results)
--   2. Added deal_id filter to NDA count (via documents.deal_id)
--   3. Fixed Stage 8 to count ALL subscription signatories (like NDA check)
--   4. Fixed Stage 4/5 skip logic: skip if LATER stage is completed (not just adjacent)
CREATE OR REPLACE FUNCTION get_investor_deal_journey(
    p_investor_id uuid,
    p_deal_id uuid
)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    membership_record RECORD;
    interest_record RECORD;
    nda_signed_count integer;
    subscription_signed_count integer;
    signatory_count integer;
    data_room_access RECORD;
    submission_record RECORD;
    pack_sent_at timestamptz;
    subscription_record RECORD;
    -- Skip logic: true if investor has progressed beyond NDA/data room stages
    has_progressed_past_early_stages boolean;
BEGIN
    -- Get deal membership (Stage 1: Received, Stage 2: Viewed)
    -- FIX: Added ORDER BY created_at ASC to get earliest membership consistently
    SELECT dm.received_at, dm.first_viewed_at, dm.role
    INTO membership_record
    FROM deal_memberships dm
    JOIN investor_users iu ON iu.user_id = dm.user_id
    WHERE dm.deal_id = p_deal_id
    AND iu.investor_id = p_investor_id
    ORDER BY dm.invited_at ASC NULLS LAST
    LIMIT 1;

    -- Get interest (Stage 3: Interest Confirmed)
    SELECT idi.submitted_at, idi.status
    INTO interest_record
    FROM investor_deal_interest idi
    WHERE idi.deal_id = p_deal_id
    AND idi.investor_id = p_investor_id
    ORDER BY idi.submitted_at DESC
    LIMIT 1;

    -- Count signatories for this investor
    SELECT COUNT(*) INTO signatory_count
    FROM investor_members im
    WHERE im.investor_id = p_investor_id
    AND im.role = 'authorized_signatory'
    AND im.is_active = true;

    -- If no signatories defined, assume 1 (the investor themselves)
    IF signatory_count = 0 THEN
        signatory_count := 1;
    END IF;

    -- Count signed NDAs FOR THIS DEAL (Stage 4: NDA Signed)
    -- FIX: Filter by deal_id via documents table
    SELECT COUNT(*) INTO nda_signed_count
    FROM signature_requests sr
    JOIN documents d ON d.id = sr.document_id
    WHERE sr.investor_id = p_investor_id
    AND sr.document_type = 'nda'
    AND sr.status = 'signed'
    AND d.deal_id = p_deal_id;

    -- Get data room access (Stage 5: Data Room Access)
    SELECT dra.granted_at, dra.expires_at, dra.revoked_at
    INTO data_room_access
    FROM deal_data_room_access dra
    WHERE dra.deal_id = p_deal_id
    AND dra.investor_id = p_investor_id
    ORDER BY dra.granted_at DESC
    LIMIT 1;

    -- Get subscription submission (Stage 6: Pack Generated)
    SELECT dss.pack_generated_at, dss.status, dss.submitted_at, dss.id
    INTO submission_record
    FROM deal_subscription_submissions dss
    WHERE dss.deal_id = p_deal_id
    AND dss.investor_id = p_investor_id
    ORDER BY dss.submitted_at DESC
    LIMIT 1;

    -- Get pack sent timestamp (Stage 7: Pack Sent)
    -- First email_sent_at from any signature request for this submission
    SELECT MIN(sr.email_sent_at) INTO pack_sent_at
    FROM signature_requests sr
    WHERE sr.investor_id = p_investor_id
    AND sr.document_type = 'subscription'
    AND sr.subscription_id IN (
        SELECT s.id FROM subscriptions s
        JOIN deals d ON d.vehicle_id = s.vehicle_id
        WHERE d.id = p_deal_id AND s.investor_id = p_investor_id
    );

    -- Count signed subscription requests FOR THIS DEAL (Stage 8: Signed)
    -- FIX: Count ALL signatories, not just most recent
    SELECT COUNT(*) INTO subscription_signed_count
    FROM signature_requests sr
    WHERE sr.investor_id = p_investor_id
    AND sr.document_type = 'subscription'
    AND sr.status = 'signed'
    AND sr.subscription_id IN (
        SELECT s.id FROM subscriptions s
        JOIN deals d ON d.vehicle_id = s.vehicle_id
        WHERE d.id = p_deal_id AND s.investor_id = p_investor_id
    );

    -- Get subscription (Stage 9: Funded, Stage 10: Active)
    SELECT s.funded_amount, s.status, s.committed_at
    INTO subscription_record
    FROM subscriptions s
    WHERE s.investor_id = p_investor_id
    AND EXISTS (
        SELECT 1 FROM deals d
        WHERE d.id = p_deal_id
        AND d.vehicle_id = s.vehicle_id
    )
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- Determine if investor has progressed past early stages (4: NDA, 5: Data Room)
    -- This is used for skip logic: if a later stage is completed, earlier stages are "skipped" not "pending"
    -- Later stages: pack generated (6), pack sent (7), signed (8), funded (9), active (10)
    has_progressed_past_early_stages := (
        submission_record.pack_generated_at IS NOT NULL OR  -- Stage 6
        pack_sent_at IS NOT NULL OR                         -- Stage 7
        subscription_signed_count > 0 OR                    -- Stage 8 (partial or complete)
        COALESCE(subscription_record.funded_amount, 0) > 0 OR  -- Stage 9
        subscription_record.status = 'active'               -- Stage 10
    );

    -- Build result JSON
    result = jsonb_build_object(
        'stage_1_received', jsonb_build_object(
            'completed', membership_record.received_at IS NOT NULL,
            'timestamp', membership_record.received_at,
            'skipped', membership_record.received_at IS NULL
        ),
        'stage_2_viewed', jsonb_build_object(
            'completed', membership_record.first_viewed_at IS NOT NULL,
            'timestamp', membership_record.first_viewed_at
        ),
        'stage_3_interest', jsonb_build_object(
            'completed', interest_record.status = 'approved',
            'timestamp', interest_record.submitted_at,
            'status', interest_record.status,
            'skipped', interest_record IS NULL
        ),
        'stage_4_nda_signed', jsonb_build_object(
            'completed', nda_signed_count >= signatory_count,
            'signed_count', nda_signed_count,
            'total_signatories', signatory_count,
            -- FIX: Skip if NDA not signed but investor has progressed to later stages
            'skipped', nda_signed_count = 0 AND (
                data_room_access.granted_at IS NOT NULL OR  -- Got data room without NDA
                has_progressed_past_early_stages            -- Or bypassed entirely
            )
        ),
        'stage_5_data_room', jsonb_build_object(
            'completed', data_room_access.granted_at IS NOT NULL AND data_room_access.revoked_at IS NULL,
            'granted_at', data_room_access.granted_at,
            'expires_at', data_room_access.expires_at,
            -- FIX: Skip if no data room access but investor has progressed to later stages
            'skipped', data_room_access.granted_at IS NULL AND has_progressed_past_early_stages
        ),
        'stage_6_pack_generated', jsonb_build_object(
            'completed', submission_record.pack_generated_at IS NOT NULL,
            'timestamp', submission_record.pack_generated_at
        ),
        'stage_7_pack_sent', jsonb_build_object(
            'completed', pack_sent_at IS NOT NULL,
            'timestamp', pack_sent_at
        ),
        'stage_8_signed', jsonb_build_object(
            'completed', subscription_signed_count >= signatory_count,
            'signed_count', subscription_signed_count,
            'total_signatories', signatory_count
        ),
        'stage_9_funded', jsonb_build_object(
            'completed', COALESCE(subscription_record.funded_amount, 0) > 0,
            'funded_amount', subscription_record.funded_amount
        ),
        'stage_10_active', jsonb_build_object(
            'completed', subscription_record.status = 'active',
            'status', subscription_record.status
        )
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_investor_deal_journey IS
    'Returns JSON with completion status for all 10 stages of investor journey.
     Stages: Received → Viewed → Interest → NDA → Data Room → Pack Gen → Pack Sent → Signed → Funded → Active';

GRANT EXECUTE ON FUNCTION get_investor_deal_journey TO authenticated;
```

---

## Migration 14: KYC Document Type Enum Cleanup

**File:** `20251218000014_cleanup_kyc_document_types.sql`

```sql
-- =============================================================================
-- Migration: Clean up KYC document type enum
-- Per base plan: Remove NDA, DNC (investment docs, not KYC)
-- Rename utility_bill → proof_of_address
-- Rename questionnaire → suitability_questionnaire (compliance, not KYC)
-- =============================================================================

-- NOTE: PostgreSQL doesn't allow easy removal of enum values.
-- Strategy: Create new enum, migrate data, drop old enum, rename new enum.

-- 1. Check current enum values
-- Current: kyc_document_type (if exists) or text field

-- 2. Create new clean enum
CREATE TYPE kyc_document_type_v2 AS ENUM (
    -- Identity documents
    'passport',
    'national_id',
    'drivers_license',

    -- Entity documents
    'incorporation_certificate',
    'memorandum_of_association',
    'articles_of_association',
    'register_of_members',
    'register_of_directors',
    'certificate_of_good_standing',
    'certificate_of_incumbency',

    -- Address verification (renamed from utility_bill)
    'proof_of_address',

    -- Financial documents
    'bank_statement',
    'bank_confirmation',
    'wire_instructions',

    -- Tax documents
    'tax_id_certificate',
    'w9_form',
    'w8_form',

    -- Other KYC docs
    'power_of_attorney',
    'resolution',
    'other'
);

COMMENT ON TYPE kyc_document_type_v2 IS
    'Document types for KYC verification. Does NOT include:
     - NDA/DNC (investment documents, use document.type)
     - Questionnaire (compliance document, use compliance_document_type)';

-- 3. Create compliance document type enum for questionnaires
CREATE TYPE compliance_document_type AS ENUM (
    'suitability_questionnaire',
    'accreditation_certificate',
    'risk_acknowledgment',
    'aml_declaration',
    'pep_declaration',
    'source_of_funds',
    'source_of_wealth',
    'other'
);

COMMENT ON TYPE compliance_document_type IS
    'Document types for compliance/suitability verification (separate from KYC identity docs).';

-- 4. Migration notes:
-- If kyc_submissions or investor_documents uses the old enum:
--   a. Add new column with new enum type
--   b. Migrate data (map utility_bill → proof_of_address, questionnaire → suitability_questionnaire)
--   c. Drop old column
--   d. Rename new column

-- Example migration for a hypothetical kyc_documents table:
-- ALTER TABLE kyc_documents ADD COLUMN document_type_new kyc_document_type_v2;
-- UPDATE kyc_documents SET document_type_new =
--     CASE document_type::text
--         WHEN 'utility_bill' THEN 'proof_of_address'::kyc_document_type_v2
--         WHEN 'nda' THEN NULL  -- Will need to handle differently
--         WHEN 'dnc' THEN NULL  -- Will need to handle differently
--         WHEN 'questionnaire' THEN NULL  -- Move to compliance table
--         ELSE document_type::text::kyc_document_type_v2
--     END;
-- ALTER TABLE kyc_documents DROP COLUMN document_type;
-- ALTER TABLE kyc_documents RENAME COLUMN document_type_new TO document_type;

-- 5. Add CHECK constraints to prevent NEW records from using deprecated values
-- Using NOT VALID so existing bad data doesn't cause migration failure
-- Full data cleanup and constraint validation will be handled in Phase 4

-- Block investment document types in KYC submissions (they belong in documents table)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'kyc_doc_type_no_investment_docs'
    ) THEN
        -- Only add if kyc_submissions table exists and has document_type column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'kyc_submissions' AND column_name = 'document_type'
        ) THEN
            -- NOT VALID means existing rows are NOT checked, only new inserts/updates
            -- This prevents migration failure if existing records have nda/dnc values
            ALTER TABLE kyc_submissions
            ADD CONSTRAINT kyc_doc_type_no_investment_docs CHECK (
                document_type IS NULL OR
                document_type NOT IN ('nda', 'dnc', 'subscription_pack', 'subscription_agreement')
            ) NOT VALID;
        END IF;
    END IF;
END $$;

-- Note: Constraint is NOT VALID - existing rows may contain blocked values
-- Phase 4 will:
--   1. Clean up existing nda/dnc/subscription_* records (move to documents table)
--   2. Validate the constraint: ALTER TABLE kyc_submissions VALIDATE CONSTRAINT kyc_doc_type_no_investment_docs;

COMMENT ON CONSTRAINT kyc_doc_type_no_investment_docs ON kyc_submissions IS
    'Prevents investment document types (nda, dnc, subscription_*) from being stored in KYC submissions.
     NOT VALID: existing bad data allowed until Phase 4 cleanup. Validates on new inserts/updates only.';
```

---

## Summary Table

| # | Migration | New Tables | New Columns | Functions | RLS Policies |
|---|-----------|-----------|-------------|-----------|--------------|
| 1 | Arranger users/members | `arranger_users`, `arranger_members` | - | 1 trigger | 7 |
| 2 | Introducer users/members | `introducer_users`, `introducer_members` | - | 1 trigger | 7 |
| 3 | Partners infrastructure | `partners`, `partner_users`, `partner_members` | - | 2 triggers | 9 |
| 4 | Commercial Partners | `commercial_partners`, `commercial_partner_users`, `commercial_partner_members` | - | 2 triggers | 9 |
| 5 | Lawyers infrastructure | `lawyers`, `lawyer_users`, `lawyer_members` | - | 2 triggers | 10 |
| 6 | user_role enum | - | - | - | - |
| 7 | get_user_personas | - | - | `get_user_personas` | - |
| 8 | CP proxy mode | `commercial_partner_clients` | - | 2 triggers | 3 |
| 9 | Agreements | `placement_agreements`, `introducer_agreements` | - | 2 triggers, `has_active_introducer_agreement` | 4 |
| 10 | Deal memberships | - | `received_at`, `first_viewed_at` + backfill | `has_deal_investor_access`, `ensure_deal_membership_for_subscriber` | - |
| 11 | Companies | `companies`, `company_stakeholders`, `company_directors`, `company_valuations` | `vehicles.company_id` | 1 trigger | 9 |
| 12 | Deals updates | - | `deals.stock_type`, `deals.vehicle_id` NOT NULL | - | - |
| 13 | Pack tracking | - | `pack_generated_at` | `get_investor_deal_journey` | - |
| 14 | KYC enum cleanup | - | - | CHECK constraint | - |

### PHASE 1 TOTALS

| Category | Count |
|----------|-------|
| **Migrations** | 14 |
| **New Tables** | 19 |
| **New Columns** | 6 |
| **New Enums** | 2 (`kyc_document_type_v2`, `compliance_document_type`) |
| **New Functions** | 8 |
| **New Triggers** | 13 |
| **New RLS Policies** | 58+ |
| **New Indexes** | 50+ |

---

## Entity Pattern Summary

After Phase 1, all external personas follow the same 3-table pattern:

| Entity | Core Table | Users Table | Members Table | Status |
|--------|-----------|-------------|---------------|--------|
| Investor | `investors` | `investor_users` | `investor_members` | ✅ EXISTS |
| Arranger | `arranger_entities` | `arranger_users` | `arranger_members` | ✅ MIGRATION 1 |
| Introducer | `introducers` | `introducer_users` | `introducer_members` | ✅ MIGRATION 2 |
| Partner | `partners` | `partner_users` | `partner_members` | ✅ MIGRATION 3 |
| Commercial Partner | `commercial_partners` | `commercial_partner_users` | `commercial_partner_members` | ✅ MIGRATION 4 |
| Lawyer | `lawyers` | `lawyer_users` | `lawyer_members` | ✅ MIGRATION 5 |

**CEO remains as `profiles.role = 'ceo'`** - internal VERSO management, not external counterparty.

---

## Testing Checklist

### Database Verification
- [ ] All 14 migrations apply without errors
- [ ] All tables have RLS enabled
- [ ] All foreign keys have proper ON DELETE behavior
- [ ] Indexes are created for performance
- [ ] All functions work correctly
- [ ] TypeScript types regenerated after migrations

### Pattern Verification
- [ ] Each persona type has core table + _users + _members
- [ ] `get_user_personas()` returns all persona types correctly
- [ ] RLS policies allow self-access via _users table
- [ ] RLS policies allow staff full access

### Journey Tracking
- [ ] `received_at` is set when IO is dispatched
- [ ] `first_viewed_at` is set on first deal view
- [ ] `get_investor_deal_journey()` returns all 10 stages

---

## Post-Migration Steps

### Type Regeneration (Required)
After all migrations are applied, regenerate TypeScript types:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://ipguxdssecfexudnvtia.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="[key]" \
npx supabase gen types typescript --project-id ipguxdssecfexudnvtia \
> versotech-portal/src/types/supabase.ts
```

Or use MCP tool:
```
mcp__supabase__generate_typescript_types()
```

This ensures all new tables, columns, and enums are available in the TypeScript types.

---

## Next Steps After Phase 1

1. **Phase 2:** Create UI for managing new entity types in Staff Portal
2. **Phase 3:** Create portal access for arrangers, introducers, partners, lawyers
3. **Phase 4:** Implement persona-switching UI for multi-persona users
4. **Phase 5:** Add audit logging for all new entity operations
