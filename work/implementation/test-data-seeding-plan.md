# VERSO Portal - Test Data Seeding Plan (Consolidated)

**Version**: 1.0
**Last Updated**: 2025-12-28
**Status**: Draft - Pending Review

---

## Plan Comparison: Claude vs Codex

| Aspect | Claude's Plan | Codex's Plan | Resolution |
|--------|--------------|--------------|------------|
| **Approach** | Detailed SQL-first | Schema verification-first | ✅ Use Codex's methodical approach with Claude's detailed SQL |
| **Status values** | Assumed (some wrong) | Suggested verification | ✅ Verified against actual DB - use correct values |
| **deal_lawyer_assignments** | Used lawyers.assigned_deals array | Mentioned join table | ✅ Use BOTH (join table + array for fallback) |
| **deal_data_room_access** | Not included | Mentioned for CP clients | ✅ Add data room access rows |
| **Idempotence** | Not addressed | ON CONFLICT DO NOTHING | ✅ Add conflict handling |
| **User creation** | Assumed auth users exist | Explicit auth user creation | ✅ Include auth user creation step |
| **Subscription statuses** | pack_sent, signed, funded | pending, committed, active | ✅ Use actual: pending, committed, active, cancelled |
| **Introduction statuses** | pending, converted, rejected | invited, joined, allocated, lost | ✅ Use actual: invited, joined, allocated, lost |

---

## VERIFIED SCHEMA DATA

### 1. deal_member_role Enum (15 values)
```
investor, co_investor, spouse, advisor, lawyer, banker, introducer, viewer,
verso_staff, partner_investor, introducer_investor, commercial_partner_investor,
commercial_partner_proxy, arranger, partner
```
**Note**: `partner` role EXISTS - no enum update needed for tracking-only partners.

### 2. Subscription Status Values (actual in DB)
```
pending, committed, active, cancelled
```
**Journey mapping**:
- `pending` → Just subscribed, pack not generated/sent
- `committed` → Signed, funding in progress
- `active` → Fully funded and activated
- `cancelled` → Subscription cancelled

### 3. Introduction Status Values (actual in DB)
```
invited, joined, allocated, lost
```
**Journey mapping**:
- `invited` → Introduction submitted, prospect invited
- `joined` → Prospect became investor
- `allocated` → Investor received allocation, commission due
- `lost` → Introduction did not convert

### 4. Fee Event Status Values (actual in DB)
```
accrued, invoiced, paid
```

### 5. Existing Deals with Vehicles (verified)
| Deal ID | Name | Vehicle ID | Vehicle Name |
|---------|------|------------|--------------|
| f2dcb9a8-7914-4bd5-bbd4-02e132762cb8 | Perplexity | 2b95c727-0ec3-446b-8097-66d3c00406c2 | VC207 |
| 7f539a06-b7af-4a80-b975-c8ec62406224 | SpaceX | c045d635-c73c-4840-b6e8-5164057cc05d | VC210 |
| d77fe268-9d52-47f6-9a30-4ccc1669970e | Anthropic | 4e4878c8-c7a8-4798-a26c-323e19f00ca8 | VC215 |
| 5f8c1d8a-960f-4f14-97f3-67e03b346aa4 | OpenAI | 5fd92c13-2d82-4ee5-b4b5-5f532decfe85 | VC206 |
| 880e8400-e29b-41d4-a716-446655440001 | Revolut Secondary | 11111111-1111-1111-1111-111111111111 | VERSO FUND |

### 6. Key Entity IDs (existing)
| Entity | ID | Name |
|--------|-----|------|
| Arranger | eb8f239b-6361-430a-919f-be8b5f3e0e93 | VERSO MANAGEMENT LTD |
| Introducer 1 | 10000000-0000-0000-0000-000000000001 | Atlas Wealth Alliance |
| Introducer 2 | 10000000-0000-0000-0000-000000000002 | Harborview Family Office |
| Legacy Investor A | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa | (existing) |
| Legacy Investor B | bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb | (existing) |

---

## TEST USER DATA DICTIONARY

### Deterministic UUIDs for New Entities

```
Test Users (profiles):
  test-investor     : 00000000-test-user-0001-000000000001
  test-arranger     : 00000000-test-user-0002-000000000002
  test-introducer   : 00000000-test-user-0003-000000000003
  test-partner      : 00000000-test-user-0004-000000000004
  test-cp           : 00000000-test-user-0005-000000000005
  test-lawyer       : 00000000-test-user-0006-000000000006
  test-hybrid       : 00000000-test-user-0007-000000000007

New Investors:
  Test Investor Holdings    : 11111111-test-inv-0001-000000000001
  Test Partner Investments  : 11111111-test-inv-0002-000000000002
  Test CP Own Account       : 11111111-test-inv-0003-000000000003
  Test Hybrid Holdings      : 11111111-test-inv-0004-000000000004

New Partner:
  Meridian Capital Partners : 22222222-test-par-0001-000000000001

New Commercial Partner:
  Pinnacle Wealth Mgmt      : 33333333-test-cp-0001-000000000001

New Lawyer:
  Morrison & Associates     : 44444444-test-law-0001-000000000001

Agreements:
  Introducer Agreement 1    : 55555555-test-agr-0001-000000000001 (active)
  Introducer Agreement 2    : 55555555-test-agr-0002-000000000002 (pending)
  Placement Agreement 1     : 66666666-test-agr-0001-000000000001 (active)

Subscriptions:
  Sub 1 (pending)           : 77777777-test-sub-0001-000000000001
  Sub 2 (committed)         : 77777777-test-sub-0002-000000000002
  Sub 3 (active)            : 77777777-test-sub-0003-000000000003
  Sub 4 (proxy)             : 77777777-test-sub-0004-000000000004
```

---

## MIGRATION PHASES (Ordered for FK Dependencies)

### PHASE 0: Auth Users + Profiles (MANUAL STEP)

**Option A**: Create via Supabase Dashboard
1. Go to Authentication → Users → Create New User
2. Create 7 users with test emails
3. Note down the UUIDs

**Option B**: Use Admin API (if available)
```sql
-- This requires service_role key and direct auth.users access
-- Usually done outside migration
```

**Option C**: Use magic links and have users click them once

**After auth users exist**, profiles are auto-created by trigger. Update them:
```sql
UPDATE profiles SET
  display_name = 'Test Investor',
  role = 'investor'
WHERE id = '00000000-test-user-0001-000000000001';

-- Repeat for each test user with appropriate role:
-- test-investor: role = 'investor'
-- test-arranger: role = 'staff_ops'
-- test-introducer: role = 'investor' (not staff, just introducer persona)
-- test-partner: role = 'investor'
-- test-cp: role = 'investor'
-- test-lawyer: role = 'staff_ops'
-- test-hybrid: role = 'investor'
```

---

### PHASE 1: Core Entities

```sql
-- 1.1 New Investors (for test users)
INSERT INTO investors (id, legal_name, display_name, status, kyc_status, accreditation_status)
VALUES
  ('11111111-test-inv-0001-000000000001', 'Test Investor Holdings Ltd', 'Test Investor Holdings', 'active', 'approved', 'accredited'),
  ('11111111-test-inv-0002-000000000002', 'Test Partner Investments LLC', 'Test Partner Investments', 'active', 'approved', 'accredited'),
  ('11111111-test-inv-0003-000000000003', 'Test CP Own Account SA', 'Test CP Account', 'active', 'approved', 'accredited'),
  ('11111111-test-inv-0004-000000000004', 'Test Hybrid Holdings Ltd', 'Test Hybrid Holdings', 'active', 'approved', 'accredited')
ON CONFLICT (id) DO NOTHING;

-- 1.2 New Partner
INSERT INTO partners (
  id, name, legal_name, type, partner_type, status,
  contact_name, contact_email, kyc_status,
  typical_investment_min, typical_investment_max,
  preferred_sectors, preferred_geographies
) VALUES (
  '22222222-test-par-0001-000000000001',
  'Meridian Capital Partners',
  'Meridian Capital Partners LLC',
  'strategic',
  'introducing',
  'active',
  'Sarah Chen',
  'schen@meridiancapital.com',
  'approved',
  100000, 5000000,
  ARRAY['technology', 'healthcare', 'fintech'],
  ARRAY['USA', 'Europe', 'UK']
) ON CONFLICT (id) DO NOTHING;

-- 1.3 New Commercial Partner
INSERT INTO commercial_partners (
  id, name, legal_name, type, cp_type, status,
  regulatory_status, regulatory_number, jurisdiction,
  contact_name, contact_email, kyc_status, payment_terms
) VALUES (
  '33333333-test-cp-0001-000000000001',
  'Pinnacle Wealth Management',
  'Pinnacle Wealth Management AG',
  'wealth_manager',
  'wealth_manager',
  'active',
  'regulated',
  'FINMA-2024-12345',
  'Switzerland',
  'Hans Mueller',
  'hmueller@pinnaclewm.ch',
  'approved',
  'net_30'
) ON CONFLICT (id) DO NOTHING;

-- 1.4 New Lawyer
INSERT INTO lawyers (
  id, firm_name, display_name, legal_entity_type,
  primary_contact_name, primary_contact_email, primary_contact_phone,
  street_address, city, country,
  specializations, is_active, kyc_status
) VALUES (
  '44444444-test-law-0001-000000000001',
  'Morrison & Associates LLP',
  'Morrison & Associates',
  'llp',
  'James Morrison',
  'jmorrison@morrisonlaw.com',
  '+1-212-555-0100',
  '350 Park Avenue, 25th Floor',
  'New York',
  'USA',
  ARRAY['corporate', 'securities', 'fund_formation', 'private_equity'],
  true,
  'approved'
) ON CONFLICT (id) DO NOTHING;
```

---

### PHASE 2: User-Entity Links (Persona Access)

```sql
-- 2.1 Investor Users
INSERT INTO investor_users (user_id, investor_id, role, is_primary, can_sign)
VALUES
  -- Test Investor
  ('00000000-test-user-0001-000000000001', '11111111-test-inv-0001-000000000001', 'admin', true, true),
  -- Test Partner (hybrid: has investor access too)
  ('00000000-test-user-0004-000000000004', '11111111-test-inv-0002-000000000002', 'admin', true, true),
  -- Test CP (hybrid: has own investment account)
  ('00000000-test-user-0005-000000000005', '11111111-test-inv-0003-000000000003', 'admin', true, true),
  -- Test Hybrid (multi-persona)
  ('00000000-test-user-0007-000000000007', '11111111-test-inv-0004-000000000004', 'admin', true, true)
ON CONFLICT DO NOTHING;

-- 2.2 Arranger Users
INSERT INTO arranger_users (user_id, arranger_id, role, is_primary)
VALUES
  ('00000000-test-user-0002-000000000002', 'eb8f239b-6361-430a-919f-be8b5f3e0e93', 'admin', true)
ON CONFLICT DO NOTHING;

-- 2.3 Introducer Users
INSERT INTO introducer_users (user_id, introducer_id, role, is_primary, can_sign)
VALUES
  -- Test Introducer
  ('00000000-test-user-0003-000000000003', '10000000-0000-0000-0000-000000000001', 'admin', true, true),
  -- Test Hybrid (also an introducer)
  ('00000000-test-user-0007-000000000007', '10000000-0000-0000-0000-000000000002', 'admin', true, true)
ON CONFLICT DO NOTHING;

-- 2.4 Partner Users
INSERT INTO partner_users (user_id, partner_id, role, is_primary, can_sign)
VALUES
  -- Test Partner
  ('00000000-test-user-0004-000000000004', '22222222-test-par-0001-000000000001', 'admin', true, true),
  -- Test Hybrid (also a partner member)
  ('00000000-test-user-0007-000000000007', '22222222-test-par-0001-000000000001', 'member', false, false)
ON CONFLICT DO NOTHING;

-- 2.5 Commercial Partner Users
INSERT INTO commercial_partner_users (user_id, commercial_partner_id, role, is_primary, can_sign, can_execute_for_clients)
VALUES
  ('00000000-test-user-0005-000000000005', '33333333-test-cp-0001-000000000001', 'admin', true, true, true)
ON CONFLICT DO NOTHING;

-- 2.6 Lawyer Users
INSERT INTO lawyer_users (user_id, lawyer_id, role, is_primary)
VALUES
  ('00000000-test-user-0006-000000000006', '44444444-test-law-0001-000000000001', 'partner', true)
ON CONFLICT DO NOTHING;

-- 2.7 Deal Lawyer Assignments (join table for lawyer-deal access)
INSERT INTO deal_lawyer_assignments (id, deal_id, lawyer_id, role, status, assigned_at, created_at)
VALUES
  (gen_random_uuid(), '5f8c1d8a-960f-4f14-97f3-67e03b346aa4', '44444444-test-law-0001-000000000001', 'lead_counsel', 'active', now(), now()),
  (gen_random_uuid(), 'd77fe268-9d52-47f6-9a30-4ccc1669970e', '44444444-test-law-0001-000000000001', 'lead_counsel', 'active', now(), now()),
  (gen_random_uuid(), 'f2dcb9a8-7914-4bd5-bbd4-02e132762cb8', '44444444-test-law-0001-000000000001', 'lead_counsel', 'active', now(), now())
ON CONFLICT DO NOTHING;

-- 2.8 Also update lawyers.assigned_deals array (for fallback queries)
UPDATE lawyers
SET assigned_deals = ARRAY[
  '5f8c1d8a-960f-4f14-97f3-67e03b346aa4',
  'd77fe268-9d52-47f6-9a30-4ccc1669970e',
  'f2dcb9a8-7914-4bd5-bbd4-02e132762cb8'
]::uuid[]
WHERE id = '44444444-test-law-0001-000000000001';

-- 2.9 Fix existing investor_users (from Claude's plan)
UPDATE investor_users
SET is_primary = true, can_sign = true, role = 'admin'
WHERE user_id IN (
  '6071c242-5711-428d-ad74-23b9f949803c',
  '2a833fc7-b307-4485-a4c1-4e5c5a010e74'
);
```

---

### PHASE 3: Agreements (UI-Compatible Statuses)

```sql
-- 3.1 Introducer Agreements
-- Note: UI likely filters on specific statuses. Using 'active' for signed agreements.
INSERT INTO introducer_agreements (
  id, introducer_id, arranger_id, agreement_type, status,
  default_commission_bps, commission_cap_amount, payment_terms,
  territory, deal_types, exclusivity_level,
  effective_date, expiry_date, signed_date, created_by, created_at
) VALUES
  -- ACTIVE agreement (signed, in effect)
  ('55555555-test-agr-0001-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'eb8f239b-6361-430a-919f-be8b5f3e0e93',
   'standard', 'active',
   120, 500000, 'net_30',
   'Global', ARRAY['primary', 'secondary'], 'non_exclusive',
   '2024-01-01', '2025-12-31', '2024-01-01',
   'cb9667d7-3891-419a-a804-98ff17104046', now() - interval '365 days'),
  -- PENDING agreement (awaiting signatures)
  ('55555555-test-agr-0002-000000000002',
   '10000000-0000-0000-0000-000000000002',
   'eb8f239b-6361-430a-919f-be8b5f3e0e93',
   'standard', 'pending_approval',
   150, null, 'net_45',
   'Europe', ARRAY['primary'], 'non_exclusive',
   '2025-01-01', '2026-12-31', null,
   'cb9667d7-3891-419a-a804-98ff17104046', now() - interval '7 days')
ON CONFLICT (id) DO NOTHING;

-- 3.2 Placement Agreements
INSERT INTO placement_agreements (
  id, commercial_partner_id, arranger_id, agreement_type, status,
  default_commission_bps, commission_cap_amount, payment_terms,
  territory, deal_types, exclusivity_level,
  effective_date, expiry_date, signed_date, approved_at,
  created_by, created_at
) VALUES
  -- ACTIVE placement agreement
  ('66666666-test-agr-0001-000000000001',
   '33333333-test-cp-0001-000000000001',
   'eb8f239b-6361-430a-919f-be8b5f3e0e93',
   'placement', 'active',
   150, 1000000, 'net_30',
   'Switzerland, Germany, Austria', ARRAY['primary', 'secondary'], 'semi_exclusive',
   '2024-06-01', '2026-06-01', '2024-06-01', '2024-06-01',
   'cb9667d7-3891-419a-a804-98ff17104046', now() - interval '180 days')
ON CONFLICT (id) DO NOTHING;
```

---

### PHASE 4: Deal Memberships (Journey Stages + Referral Tracking)

```sql
-- 4.1 Test Investor - Various journey stages
INSERT INTO deal_memberships (
  deal_id, user_id, investor_id, role,
  dispatched_at, viewed_at, interest_confirmed_at, nda_signed_at, data_room_granted_at
) VALUES
  -- OpenAI: Full journey complete
  ('5f8c1d8a-960f-4f14-97f3-67e03b346aa4',
   '00000000-test-user-0001-000000000001',
   '11111111-test-inv-0001-000000000001',
   'investor',
   now() - interval '30 days', now() - interval '29 days',
   now() - interval '28 days', now() - interval '27 days', now() - interval '26 days'),
  -- Anthropic: NDA pending
  ('d77fe268-9d52-47f6-9a30-4ccc1669970e',
   '00000000-test-user-0001-000000000001',
   '11111111-test-inv-0001-000000000001',
   'investor',
   now() - interval '7 days', now() - interval '6 days', now() - interval '5 days',
   null, null),
  -- Perplexity: Just dispatched
  ('f2dcb9a8-7914-4bd5-bbd4-02e132762cb8',
   '00000000-test-user-0001-000000000001',
   '11111111-test-inv-0001-000000000001',
   'investor',
   now() - interval '1 day', null, null, null, null)
ON CONFLICT DO NOTHING;

-- 4.2 Partner - Tracking only vs Investor roles
INSERT INTO deal_memberships (
  deal_id, user_id, investor_id, role,
  dispatched_at, viewed_at, interest_confirmed_at, nda_signed_at, data_room_granted_at,
  referred_by_entity_id, referred_by_entity_type
) VALUES
  -- SpaceX: Partner as tracking-only (uses 'partner' role)
  ('7f539a06-b7af-4a80-b975-c8ec62406224',
   '00000000-test-user-0004-000000000004',
   '11111111-test-inv-0002-000000000002',
   'partner',
   now() - interval '14 days', now() - interval '13 days', null, null, null,
   null, null),
  -- OpenAI: Partner as investor (uses 'partner_investor' role)
  ('5f8c1d8a-960f-4f14-97f3-67e03b346aa4',
   '00000000-test-user-0004-000000000004',
   '11111111-test-inv-0002-000000000002',
   'partner_investor',
   now() - interval '20 days', now() - interval '19 days',
   now() - interval '18 days', now() - interval '17 days', now() - interval '16 days',
   '22222222-test-par-0001-000000000001', 'partner')
ON CONFLICT DO NOTHING;

-- 4.3 Commercial Partner - MODE 1 (own investment) vs MODE 2 (proxy)
INSERT INTO deal_memberships (
  deal_id, user_id, investor_id, role,
  dispatched_at, viewed_at, interest_confirmed_at, nda_signed_at, data_room_granted_at
) VALUES
  -- Anthropic: CP as direct investor (MODE 1)
  ('d77fe268-9d52-47f6-9a30-4ccc1669970e',
   '00000000-test-user-0005-000000000005',
   '11111111-test-inv-0003-000000000003',
   'commercial_partner_investor',
   now() - interval '10 days', now() - interval '9 days',
   now() - interval '8 days', now() - interval '7 days', now() - interval '6 days'),
  -- SpaceX: CP as proxy for client (MODE 2)
  ('7f539a06-b7af-4a80-b975-c8ec62406224',
   '00000000-test-user-0005-000000000005',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- Client investor
   'commercial_partner_proxy',
   now() - interval '5 days', now() - interval '4 days',
   now() - interval '3 days', now() - interval '2 days', now() - interval '1 day')
ON CONFLICT DO NOTHING;
```

---

### PHASE 5: Data Room Access

```sql
-- 5.1 Grant data room access for memberships with data_room_granted_at set
INSERT INTO deal_data_room_access (
  id, deal_id, investor_id, granted_at, auto_granted
) VALUES
  -- Test Investor on OpenAI
  (gen_random_uuid(), '5f8c1d8a-960f-4f14-97f3-67e03b346aa4', '11111111-test-inv-0001-000000000001',
   now() - interval '26 days', true),
  -- Partner on OpenAI
  (gen_random_uuid(), '5f8c1d8a-960f-4f14-97f3-67e03b346aa4', '11111111-test-inv-0002-000000000002',
   now() - interval '16 days', true),
  -- CP on Anthropic
  (gen_random_uuid(), 'd77fe268-9d52-47f6-9a30-4ccc1669970e', '11111111-test-inv-0003-000000000003',
   now() - interval '6 days', true),
  -- CP's client on SpaceX (proxy mode)
  (gen_random_uuid(), '7f539a06-b7af-4a80-b975-c8ec62406224', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   now() - interval '1 day', true)
ON CONFLICT DO NOTHING;
```

---

### PHASE 6: Subscriptions (Correct Status Values)

```sql
-- Use actual status values: pending, committed, active, cancelled
-- Journey is tracked via timestamps: pack_generated_at, pack_sent_at, signed_at, funded_at, activated_at

INSERT INTO subscriptions (
  id, investor_id, deal_id, vehicle_id,
  commitment, funded_amount, currency, status,
  subscription_date, pack_generated_at, pack_sent_at, signed_at, funded_at, activated_at
) VALUES
  -- PENDING: Just subscribed, pack not generated
  ('77777777-test-sub-0001-000000000001',
   '11111111-test-inv-0001-000000000001',
   'f2dcb9a8-7914-4bd5-bbd4-02e132762cb8',
   '2b95c727-0ec3-446b-8097-66d3c00406c2',  -- Perplexity vehicle
   250000, 0, 'USD', 'pending',
   now() - interval '1 day', null, null, null, null, null),

  -- COMMITTED: Signed, funding in progress
  ('77777777-test-sub-0002-000000000002',
   '11111111-test-inv-0001-000000000001',
   '7f539a06-b7af-4a80-b975-c8ec62406224',
   'c045d635-c73c-4840-b6e8-5164057cc05d',  -- SpaceX vehicle
   1000000, 500000, 'USD', 'committed',
   now() - interval '20 days', now() - interval '18 days',
   now() - interval '17 days', now() - interval '15 days', null, null),

  -- ACTIVE: Fully funded
  ('77777777-test-sub-0003-000000000003',
   '11111111-test-inv-0001-000000000001',
   '880e8400-e29b-41d4-a716-446655440001',
   '11111111-1111-1111-1111-111111111111',  -- VERSO FUND
   300000, 300000, 'USD', 'active',
   now() - interval '60 days', now() - interval '58 days',
   now() - interval '57 days', now() - interval '55 days',
   now() - interval '50 days', now() - interval '45 days'),

  -- PROXY subscription (CP for client)
  ('77777777-test-sub-0004-000000000004',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  -- Client investor
   '7f539a06-b7af-4a80-b975-c8ec62406224',
   'c045d635-c73c-4840-b6e8-5164057cc05d',
   200000, 200000, 'USD', 'committed',
   now() - interval '5 days', now() - interval '4 days',
   now() - interval '4 days', now() - interval '3 days', now() - interval '1 day', null,
   true, '00000000-test-user-0005-000000000005', '33333333-test-cp-0001-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Fix: The proxy columns need to be added properly
-- Rewrite the proxy subscription with correct column list:
```

```sql
-- Corrected proxy subscription (separate statement with all columns)
INSERT INTO subscriptions (
  id, investor_id, deal_id, vehicle_id,
  commitment, funded_amount, currency, status,
  subscription_date, pack_generated_at, pack_sent_at, signed_at, funded_at,
  submitted_by_proxy, proxy_user_id, proxy_commercial_partner_id
) VALUES (
  '77777777-test-sub-0004-000000000004',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '7f539a06-b7af-4a80-b975-c8ec62406224',
  'c045d635-c73c-4840-b6e8-5164057cc05d',
  200000, 200000, 'USD', 'committed',
  now() - interval '5 days', now() - interval '4 days',
  now() - interval '4 days', now() - interval '3 days', now() - interval '1 day',
  true, '00000000-test-user-0005-000000000005', '33333333-test-cp-0001-000000000001'
) ON CONFLICT (id) DO NOTHING;
```

---

### PHASE 7: CP Client Management

```sql
-- Table columns: id, commercial_partner_id, client_name, client_investor_id,
--   client_email, client_type, is_active, created_at
INSERT INTO commercial_partner_clients (
  id, commercial_partner_id, client_name, client_investor_id, client_email, client_type, is_active, created_at
) VALUES
  -- Active client A
  ('88888888-test-cli-0001-000000000001',
   '33333333-test-cp-0001-000000000001',
   'Legacy Investor A',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'investora@example.com',
   'individual',
   true,
   now() - interval '30 days'),
  -- Active client B
  ('88888888-test-cli-0002-000000000002',
   '33333333-test-cp-0001-000000000001',
   'Legacy Investor B',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'investorb@example.com',
   'individual',
   true,
   now() - interval '7 days'),
  -- Inactive client (historical)
  ('88888888-test-cli-0003-000000000003',
   '33333333-test-cp-0001-000000000001',
   'Former Client Corp',
   '660e8400-e29b-41d4-a716-446655440001',
   'former@example.com',
   'corporate',
   false,
   now() - interval '90 days')
ON CONFLICT (id) DO NOTHING;
```

---

### PHASE 8: Introductions (Correct Status Values)

```sql
-- Use actual status values: invited, joined, allocated, lost
-- Table columns: id, introducer_id, prospect_email, prospect_investor_id, deal_id,
--   status, created_at, introduced_at, commission_rate_override_bps, notes

INSERT INTO introductions (
  id, introducer_id, deal_id, prospect_email, status, notes, created_at
) VALUES
  -- INVITED: Just introduced, pending response
  ('99999999-test-int-0001-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '5f8c1d8a-960f-4f14-97f3-67e03b346aa4',
   'jsmith@example.com',
   'invited',
   'John Smith - HNW prospect, expected $500k',
   now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO introductions (
  id, introducer_id, deal_id, prospect_email, prospect_investor_id,
  status, introduced_at, notes, created_at
) VALUES
  -- JOINED: Became investor
  ('99999999-test-int-0002-000000000002',
   '10000000-0000-0000-0000-000000000001',
   'd77fe268-9d52-47f6-9a30-4ccc1669970e',
   'investora@example.com',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'joined',
   (now() - interval '20 days')::date,
   'Converted with $350k commitment',
   now() - interval '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO introductions (
  id, introducer_id, deal_id, prospect_email, prospect_investor_id,
  status, introduced_at, commission_rate_override_bps, notes, created_at
) VALUES
  -- ALLOCATED: Allocation received, commission earned
  ('99999999-test-int-0003-000000000003',
   '10000000-0000-0000-0000-000000000001',
   '880e8400-e29b-41d4-a716-446655440001',
   'investorb@example.com',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'allocated',
   (now() - interval '50 days')::date,
   120,
   '$200k allocated, commission earned $2,400',
   now() - interval '60 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO introductions (
  id, introducer_id, deal_id, prospect_email, status, notes, created_at
) VALUES
  -- LOST: Did not convert
  ('99999999-test-int-0004-000000000004',
   '10000000-0000-0000-0000-000000000001',
   '7f539a06-b7af-4a80-b975-c8ec62406224',
   'jdoe@example.com',
   'lost',
   'Did not meet accreditation requirements',
   now() - interval '45 days')
ON CONFLICT (id) DO NOTHING;
```

---

### PHASE 9: Portfolio Data

```sql
-- 9.1 Positions
INSERT INTO positions (id, investor_id, vehicle_id, units, cost_basis, last_nav, as_of_date)
VALUES
  ('aaaaaaaa-test-pos-0001-000000000001',
   '11111111-test-inv-0001-000000000001',
   '11111111-1111-1111-1111-111111111111',
   100000, 1000000, 11.25,
   (now() - interval '30 days')::date),
  ('aaaaaaaa-test-pos-0002-000000000002',
   '11111111-test-inv-0001-000000000001',
   '22222222-2222-2222-2222-222222222222',
   50000, 500000, 10.87,
   (now() - interval '30 days')::date)
ON CONFLICT (id) DO NOTHING;

-- 9.2 Fee Events (use actual statuses: accrued, invoiced, paid)
INSERT INTO fee_events (
  id, deal_id, investor_id, fee_type, event_date,
  base_amount, computed_amount, currency, status, rate_bps, notes, created_at
) VALUES
  -- Subscription fee (paid)
  ('bbbbbbbb-test-fee-0001-000000000001',
   '880e8400-e29b-41d4-a716-446655440001',
   '11111111-test-inv-0001-000000000001',
   'subscription', (now() - interval '45 days')::date,
   300000, 15000, 'USD', 'paid', 500,
   'Subscription fee - 5% of $300k', now() - interval '45 days'),
  -- Management fee (invoiced)
  ('bbbbbbbb-test-fee-0002-000000000002',
   '880e8400-e29b-41d4-a716-446655440001',
   '11111111-test-inv-0001-000000000001',
   'management', (now() - interval '30 days')::date,
   300000, 3000, 'USD', 'invoiced', 100,
   'Q4 2024 Management fee - 1% annual', now() - interval '30 days'),
  -- Performance fee (accrued)
  ('bbbbbbbb-test-fee-0003-000000000003',
   '880e8400-e29b-41d4-a716-446655440001',
   '11111111-test-inv-0001-000000000001',
   'performance', (now() - interval '15 days')::date,
   125000, 25000, 'USD', 'accrued', 2000,
   'Performance fee - 20% of $125k gains', now() - interval '15 days')
ON CONFLICT (id) DO NOTHING;

-- 9.3 Cashflows
INSERT INTO cashflows (id, investor_id, vehicle_id, type, amount, date)
VALUES
  ('cccccccc-test-cf-0001-000000000001',
   '11111111-test-inv-0001-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'call', 500000, (now() - interval '90 days')::date),
  ('cccccccc-test-cf-0002-000000000002',
   '11111111-test-inv-0001-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'distribution', 75000, (now() - interval '30 days')::date)
ON CONFLICT (id) DO NOTHING;
```

---

### PHASE 10: Ensure Arranger Linkage

```sql
-- Ensure all deals have arranger_entity_id for arranger dashboard
UPDATE deals
SET arranger_entity_id = 'eb8f239b-6361-430a-919f-be8b5f3e0e93'
WHERE arranger_entity_id IS NULL;
```

---

## VALIDATION CHECKLIST

After applying the migration, run these queries to verify:

```sql
-- 1. Verify personas for each test user
SELECT * FROM get_user_personas('00000000-test-user-0001-000000000001'); -- Should have investor
SELECT * FROM get_user_personas('00000000-test-user-0002-000000000002'); -- Should have arranger
SELECT * FROM get_user_personas('00000000-test-user-0003-000000000003'); -- Should have introducer
SELECT * FROM get_user_personas('00000000-test-user-0004-000000000004'); -- Should have partner + investor
SELECT * FROM get_user_personas('00000000-test-user-0005-000000000005'); -- Should have cp + investor
SELECT * FROM get_user_personas('00000000-test-user-0006-000000000006'); -- Should have lawyer
SELECT * FROM get_user_personas('00000000-test-user-0007-000000000007'); -- Should have investor + introducer + partner

-- 2. Verify introducer dashboard data
SELECT * FROM introducer_agreements WHERE introducer_id = '10000000-0000-0000-0000-000000000001';
SELECT * FROM introductions WHERE introducer_id = '10000000-0000-0000-0000-000000000001';

-- 3. Verify arranger dashboard data
SELECT * FROM deals WHERE arranger_entity_id = 'eb8f239b-6361-430a-919f-be8b5f3e0e93';

-- 4. Verify lawyer dashboard data
SELECT * FROM deal_lawyer_assignments WHERE lawyer_id = '44444444-test-law-0001-000000000001';

-- 5. Verify CP client list
SELECT * FROM commercial_partner_clients WHERE commercial_partner_id = '33333333-test-cp-0001-000000000001';

-- 6. Verify subscriptions with journey timestamps
SELECT id, status, pack_generated_at, pack_sent_at, signed_at, funded_at, activated_at
FROM subscriptions WHERE id LIKE '77777777-test-sub%';
```

---

## OPEN QUESTIONS

1. **Auth user creation**: How do you want to create the 7 test auth users?
   - [ ] Manually via Supabase Dashboard
   - [ ] Via magic links (requires emails to be real)
   - [ ] Via service role insert (if possible)

2. **Target database**:
   - [ ] Development branch
   - [ ] Production (requires extra caution)

3. **Idempotence**: Should we use `ON CONFLICT DO UPDATE` instead of `DO NOTHING` for any tables where we want to refresh data on re-run?

---

## DIFFERENCES FROM ORIGINAL PLANS

### Corrections Made
| Issue | Original (Claude) | Corrected |
|-------|------------------|-----------|
| subscription.status | pack_sent, signed, funded | pending, committed, active, cancelled |
| introduction.status | pending, converted, rejected | invited, joined, allocated, lost |
| Lawyer assignments | Only lawyers.assigned_deals | Both join table + array |
| Data room access | Not included | Added Phase 5 |
| deal_member_role 'partner' | Assumed might not exist | Verified: EXISTS in enum |
| ON CONFLICT handling | Not included | Added to all INSERTs |

### Additions from Codex
- Schema verification step (done above)
- Data dictionary with deterministic UUIDs
- deal_lawyer_assignments table
- deal_data_room_access rows
- Validation checklist queries
- Clear phase ordering for FK dependencies
