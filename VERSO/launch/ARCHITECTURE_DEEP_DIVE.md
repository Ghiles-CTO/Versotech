# Versotech Architecture Deep Dive

## Overview

This document captures **technical architecture insights** discovered during comprehensive E2E testing. It focuses on how the systems connect, data flows, and critical implementation patterns.

---

## CORE DATA MODELS

### 1. Subscription Lifecycle States

```
pending → committed → funded → active
                 ↓
            rejected (dead end)
```

| Status | Meaning | Trigger |
|--------|---------|---------|
| `pending` | Submission received | `POST /api/deals/[id]/subscriptions` |
| `committed` | Investor has signed | All investor signatures complete |
| `funded` | Money in escrow | Lawyer confirms via cashflow entry |
| `active` | Deal closed, position created | Term sheet close date OR manual trigger |

**Critical:** Status transitions require both signature completion AND explicit triggers.

### 2. Document Status Flow

```
draft → final → pending_signature → partially_signed → signed → published
```

| Status | Meaning |
|--------|---------|
| `draft` | Being created/edited |
| `final` | Ready for signatures |
| `pending_signature` | Sent for signing |
| `partially_signed` | Some but not all signatures |
| `signed` | All signatures complete |
| `published` | Visible to intended parties |

### 3. Commission Lifecycle

```
accrued → invoice_requested → invoice_submitted → invoiced → paid
                                     ↓
                                 rejected (can resubmit)
```

**Three separate tables handle commissions:**
- `introducer_commissions` - For introducers (referral fees)
- `partner_commissions` - For partners (co-investment fees)
- `commercial_partner_commissions` - For commercial partners (placement fees)

---

## SIGNATURE SYSTEM ARCHITECTURE

### Multi-Signatory Pattern

The platform uses a **sequential multi-party signature** pattern where order matters:

```
Party B (CEO/Issuer) → Party A (Investor) → Party C (Arranger)
     FIRST                 SECOND               THIRD
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `signature_requests` | Individual signature tasks |
| `subscription_documents` | Documents requiring signatures |
| `subscription_signatories` | Who must sign for each party |

### Signature Request Fields

```sql
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY,
  subscription_id UUID,
  document_id UUID,
  document_type TEXT, -- 'nda', 'subscription', 'placement_agreement', 'introducer_agreement'
  signer_email TEXT,
  signer_name TEXT,
  party_type TEXT,    -- 'party_a', 'party_b', 'party_c'
  status TEXT,        -- 'pending', 'signed', 'declined'
  deal_id UUID,
  investor_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Signature Completion Flow

The real webhook handler is at `/api/signature/complete/route.ts`:

```
VERSOSign Webhook → Verify HMAC-SHA256 → Update signature_requests.status
                                              ↓
                                    Check if all parties signed
                                              ↓
                              Call handleSubscriptionCompletion()
                                              ↓
                              Update subscription.status to 'committed'
                                              ↓
                              Update document.status to 'published'
```

**Critical Pattern:** The webhook handler calls `checkAndPublishSubscriptionDocument()` which:
1. Checks if all signature requests for a document are complete
2. Updates `subscription_documents.status` to `'published'`
3. Triggers downstream workflows

---

## VEHICLE & ARRANGER RELATIONSHIP

### Key Insight: Arranger is Vehicle-Level, Not Deal-Level

```
Vehicle (Fund)
├── arranger_entity_id → Arranger Entity
├── Deal 1
├── Deal 2
└── Deal 3
```

The `arranger_entity_id` is stored on the **vehicle** record, not individual deals. This means:
- All deals under a vehicle share the same arranger
- Fee plans link to the vehicle's arranger context
- Commissions flow through the vehicle's arrangement

### Database Schema

```sql
-- Vehicles own the arranger relationship
CREATE TABLE vehicles (
  id UUID PRIMARY KEY,
  name TEXT,
  arranger_entity_id UUID REFERENCES arranger_entities(id),
  ...
);

-- Deals belong to vehicles
CREATE TABLE deals (
  id UUID PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  name TEXT,
  status TEXT, -- 'draft', 'open', 'closed'
  ...
);
```

---

## DEAL CLOSE MECHANICS

### What Triggers Deal Close?

Two mechanisms:

1. **Term Sheet Close Date** (Automatic)
   - When `deal_fee_structures.completion_date` is reached
   - Background job checks and triggers `handleDealClose()`

2. **Manual Close** (Explicit)
   - Button in deal admin UI
   - Calls same `handleDealClose()` function

### What Deal Close Does

```
handleDealClose()
├── Update all 'funded' subscriptions → 'active'
├── Create positions in portfolio
├── Calculate and accrue commissions
│   ├── For each introducer with active agreement
│   ├── For each partner with accepted fee plan
│   └── For each commercial partner with signed placement agreement
└── Trigger certificate generation workflow
```

### What Deal Status Change Does NOT Do

Changing deal status from "Open" to "Closed" via the Edit Deal modal does **not**:
- Automatically activate subscriptions
- Generate certificates
- Accrue commissions

This is intentional - the term sheet close date is the real trigger.

---

## FEE PLAN ARCHITECTURE

### Fee Plans Are Deal-Specific

Fee plans are NOT templates - they are agreements for a **specific deal**:

```sql
CREATE TABLE fee_plans (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES deals(id), -- Required!
  entity_type TEXT, -- 'introducer', 'partner', 'commercial_partner'
  entity_id UUID,
  status TEXT, -- 'draft', 'sent', 'accepted', 'rejected'
  ...
);
```

### Fee Components

```sql
CREATE TABLE fee_plan_components (
  id UUID PRIMARY KEY,
  fee_plan_id UUID REFERENCES fee_plans(id),
  fee_type TEXT, -- 'subscription', 'management', 'performance', 'bd_fee', 'flat', 'other'
  payment_schedule TEXT, -- 'upfront', 'recurring', 'on_demand'
  rate_bps INTEGER, -- Basis points (100 = 1%)
  flat_amount DECIMAL,
  ...
);
```

### Commission Calculation

On deal close:
```javascript
commission = funded_amount × (rate_bps / 10000)
```

Example: 200 bps on $100,000 = $2,000 commission

---

## RECONCILIATION & PORTFOLIO

### Position Data Model

```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  investor_id UUID,
  vehicle_id UUID,
  units DECIMAL,
  cost_basis DECIMAL,
  last_nav DECIMAL,
  contributed_capital DECIMAL,
  unfunded_commitment DECIMAL,
  ...
);
```

### NAV Tracking

- `last_nav` = Current unit value
- `cost_basis` = Total invested
- Portfolio value = `units × last_nav`

### Cashflows

Capital activity is tracked via cashflows:

```sql
CREATE TABLE cashflows (
  id UUID PRIMARY KEY,
  subscription_id UUID,
  cashflow_type TEXT, -- 'contribution', 'distribution', 'fee', 'return_of_capital'
  amount DECIMAL,
  date DATE,
  ...
);
```

**Critical:** Contributed/Unfunded values are managed in the **Reconciliation** page, not auto-calculated from subscriptions.

---

## DOCUMENT GENERATION SYSTEM

### VERSOSign Integration

The platform uses VERSOSign (internal e-signature system):

1. **Document Template** → PDF with signature placeholders
2. **Generate Document** → Create instance with data merged
3. **Send for Signature** → Create `signature_requests` records
4. **Webhook Callback** → `/api/signature/complete` updates status

### Signature Placement

```
Left Position → Party A (usually investor/first signer)
Right Position → Party B (usually issuer/countersigner)
Third Position → Party C (if applicable)
```

### Certificate Generation

Certificates are triggered by n8n workflow, NOT directly by the app:

```
Subscription activated → n8n receives webhook → Generates certificate PDF →
→ Sends for CEO signature → Sends for lawyer signature →
→ Uploads completed certificate → Updates subscription
```

---

## API PATTERNS

### Authentication Flow

```typescript
// Every authenticated route
const authSupabase = await createClient()
const { user, error } = await getAuthenticatedUser(authSupabase)

if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Staff Check Pattern

```typescript
const isStaff = await isStaffUser(authSupabase, user)
if (!isStaff) {
  return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
}
```

### Service Client for Admin Operations

```typescript
// Bypasses RLS - use carefully!
const supabase = createServiceClient()
```

---

## PERSONA CONTEXT

### How Personas Work

Users can have multiple personas. The active persona determines:
- What dashboard they see
- What actions they can take
- What data they have access to

```sql
-- User-to-persona mapping
CREATE TABLE user_personas (
  user_id UUID REFERENCES auth.users(id),
  persona TEXT, -- 'investor', 'staff', 'arranger', 'introducer', etc.
  entity_id UUID, -- Optional linked entity
  is_active BOOLEAN
);
```

### Persona-Based Routing

- `/versotech_main/` - Main portal (all personas)
- `/versotech_admin/` - Admin portal (staff only)
- Dashboard content varies by active persona

---

## KEY FILES REFERENCE

| Purpose | File Path |
|---------|-----------|
| Signature webhook | `/src/app/api/signature/complete/route.ts` |
| Deal close handler | `/src/lib/deals/deal-close-handler.ts` |
| Certificate trigger | `/src/lib/deals/certificate-trigger.ts` |
| Fee calculations | `/src/lib/fees/` |
| Portfolio dashboard | `/src/components/portfolio/portfolio-dashboard.tsx` |
| Subscription flow | `/src/components/subscriptions/` |
| Commission management | `/src/app/(main)/versotech_main/my-commissions/` |
| Reconciliation | `/src/app/(main)/versotech_main/reconciliations/` |

---

## TESTING NOTES

### Test Endpoints to Clean Up

The following test endpoints were created during E2E testing and should be removed:

```
/src/app/api/test/complete-signature/route.ts  - DELETE
/src/app/api/test/set-arranger/route.ts        - DELETE
/src/app/api/test/reset-signatures/route.ts    - DELETE
```

### Automation Limitations

Native HTML date inputs (`<input type="date">`) don't work well with character-by-character automation. The date picker implementation is correct - it's an automation tool limitation.

---

## SUMMARY

The Versotech architecture follows these key principles:

1. **Sequential state machines** - Subscriptions and documents progress through defined states
2. **Multi-party signatures** - Strict ordering (B → A → C) with webhook-driven completion
3. **Vehicle-centric organization** - Arrangers and deals organized under vehicles
4. **Deal-specific fee plans** - Not templates, but actual agreements per deal
5. **Separate commission tables** - Three parallel systems for different partner types
6. **Webhook-driven workflows** - n8n handles complex orchestration like certificate generation
7. **RLS-based security** - Row Level Security with explicit persona checking

---

*Document generated: January 2026*
*Based on E2E testing of the complete investment lifecycle*
