# Commercial Partner Implementation Plan

**User Type:** Commercial Partner
**Current Completion:** 45% (Audit-Verified: December 24, 2025)
**Target Completion:** 95%
**Estimated Hours:** 28 hours
**Last Audit:** December 24, 2025 - Deep Surgical Audit Complete

---

## ⚠️ CRITICAL AUDIT FINDINGS

### Showstopper Issues:

1. **No way to add clients to system** (MODE 2 cannot function)
   - `commercial_partner_clients` table exists but no CRUD API
   - No UI to add/edit/delete clients
   - Without clients, proxy mode is unusable

2. **No way to sign placement agreements**
   - Agreements can be viewed but not signed
   - No VersaSign integration for placement agreements
   - No `/api/placement-agreements/[id]/sign` endpoint

3. **No CP-specific dashboard**
   - Uses generic PersonaDashboard
   - Cannot see: placement agreement status, own investments, client transactions, client AUM, pending commissions

4. **MODE 1 (direct investment) not clearly implemented in UI**
   - Role `commercial_partner_investor` exists
   - But no distinct UI flow for CP investing own money vs. proxy mode

### What DOES Work:

| Feature | Status | Evidence |
|---------|--------|----------|
| Proxy Mode Banner | ✓ 100% | `proxy-mode-banner.tsx` (166 lines) |
| Proxy Mode Context | ✓ 100% | `proxy-mode-context.tsx` (68 lines) |
| Proxy Subscribe API | ✓ 85% | `/api/commercial-partners/proxy-subscribe` (280 lines) |
| Client Transactions View | ✓ 100% | `/versotech_main/client-transactions` |
| Placement Agreements View | ✓ 100% | `/versotech_main/placement-agreements` (view only) |

---

## 1. WHO IS THE COMMERCIAL PARTNER?

The Commercial Partner is an institutional partner (bank, wealth manager, family office) that can act on behalf of clients. From user stories (Section 7.Commercial Partner, 111 rows):

**Business Role:**
- **CAN invest their OWN money** (MODE 1: Direct Investment)
- **CAN act on behalf of clients** (MODE 2: Proxy Mode)
- Signs Placement Agreements with VERSO
- Tracks transactions for their clients
- Executes (signs) documents on behalf of clients

**TWO DISTINCT MODES:**

**MODE 1: Direct Investment**
- Commercial Partner invests their own capital
- Same as investor journey
- Requires `deal_memberships.role = 'commercial_partner_investor'`

**MODE 2: Proxy Mode (On Behalf of Client XXX)**
- CEO dispatches IO with "on behalf of Client XXX"
- Client may be known (existing investor) or unknown (new)
- Commercial Partner handles ENTIRE flow FOR Client
- Documents show Client as investing party
- Commercial Partner signs but client is investor of record
- Requires `deal_memberships.role = 'commercial_partner_proxy'`

**Key Distinction from Partner:**
- Commercial Partner CAN execute on behalf of clients (Partner CANNOT)
- Commercial Partner has Placement Agreements (formal institutional)
- Different legal/regulatory relationship

---

## 2. WHAT ALREADY EXISTS

### 2.1 Database (100% COMPLETE ✓)

**Tables (All Verified via Supabase MCP):**

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `commercial_partners` | id, name, legal_name, cp_type, status, kyc_status, logo_url | Full schema |
| `commercial_partner_users` | user_id, cp_id, role, is_primary, **can_execute_for_clients**, can_sign | Proxy capability flag exists |
| `commercial_partner_members` | id, cp_id, full_name, role, is_signatory, is_beneficial_owner | Entity members |
| `commercial_partner_clients` | id, cp_id, **client_name**, client_investor_id, client_email, client_type, is_active | Client linking exists |
| `placement_agreements` | id, cp_id, agreement_type, signed_date, effective_date, **status**, default_commission_bps | Complete structure |
| `subscriptions` | **submitted_by_proxy**, **proxy_user_id**, **proxy_commercial_partner_id**, proxy_authorization_doc_id | Proxy fields present |

**deal_memberships.role ENUM (Verified):**
- `commercial_partner` - Tracking only
- `commercial_partner_investor` - Direct investment (MODE 1)
- `commercial_partner_proxy` - On behalf of client (MODE 2)

### 2.2 Pages (Verified - December 24, 2025)

| Route | Status | Notes |
|-------|--------|-------|
| `/versotech_main/dashboard` | GENERIC | Uses PersonaDashboard, NO CP-specific metrics |
| `/versotech_main/opportunities` | BUILT | For investor access, proxy banner NOT integrated |
| `/versotech_main/portfolio` | BUILT | For own investments (MODE 1) |
| `/versotech_main/client-transactions` | ✓ BUILT | Track client transactions, view clients |
| `/versotech_main/client-transactions/manage` | ✗ MISSING | Add/edit clients NOT implemented |
| `/versotech_main/placement-agreements` | ✓ VIEW ONLY | View all agreements, filter/search - **NO signing** |
| `/versotech_main/placement-agreements/[id]` | ✗ MISSING | Detail page with sign action |
| `/versotech_main/commercial-partners/[id]` | EMPTY DIR | No page.tsx found |
| `/versotech_main/my-commercial-partners` | ✓ BUILT | Arranger view of their CPs |
| `/versotech_main/profile` | BUILT | Profile |
| `/versotech_main/documents` | BUILT | Documents |
| `/versotech_main/inbox` | BUILT | Notifications |
| `/versotech_main/versosign` | BUILT | Signature queue |

### 2.3 API Routes (Verified)

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/commercial-partners/proxy-subscribe` | POST | ✓ BUILT | Creates subscription FOR client, sets proxy fields, validates CP role and client KYC |
| `/api/commercial-partners/proxy-subscribe` | GET | ⚠️ PARTIAL | Returns clients but queries `investors.commercial_partner_id` - may need verification |
| `/api/admin/commercial-partners` | * | ✓ BUILT | Admin CRUD |
| `/api/admin/commercial-partners/[id]` | * | ✓ BUILT | Single CP get/update |
| `/api/commercial-partners/me/clients` | GET | ✗ MISSING | List clients for current CP |
| `/api/commercial-partners/me/clients` | POST | ✗ MISSING | Add new client |
| `/api/commercial-partners/me/clients/[id]` | PATCH | ✗ MISSING | Update client |
| `/api/commercial-partners/me/clients/[id]` | DELETE | ✗ MISSING | Soft delete client |
| `/api/placement-agreements` | GET | ✗ MISSING | List agreements for CP |
| `/api/placement-agreements` | POST | ✗ MISSING | Create agreement (CEO/Arranger) |
| `/api/placement-agreements/[id]` | GET | ✗ MISSING | Get single agreement |
| `/api/placement-agreements/[id]/sign` | POST | ✗ MISSING | Create signature request |
| `src/lib/commercial-partner/can-invest.ts` | - | ✗ MISSING | No access check utility |

### 2.4 Components (Verified)

| Component | Status | LOC | Notes |
|-----------|--------|-----|-------|
| `proxy-mode-banner.tsx` | ✓ BUILT | 166 | Shows "Acting on behalf of: [Client]", client selector, exit button |
| `proxy-mode-context.tsx` | ✓ BUILT | 68 | `useProxyMode()` hook, sessionStorage persistence |
| `index.ts` | ✓ BUILT | 3 | Exports |
| `client-form.tsx` | ✗ MISSING | - | Add/edit client form |
| `client-list.tsx` | ✗ MISSING | - | Display client list |
| `cp-dashboard.tsx` | ✗ MISSING | - | CP-specific dashboard |
| `placement-agreement-detail.tsx` | ✗ MISSING | - | Agreement detail + signing UI |

### 2.4 Navigation

**Configured in `persona-sidebar.tsx`:**
```typescript
commercial_partner: [
  { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard },
  { name: 'Opportunities', href: '/versotech_main/opportunities', icon: TrendingUp },
  { name: 'Client Transactions', href: '/versotech_main/client-transactions', icon: Users },
  { name: 'Placement Agreements', href: '/versotech_main/placement-agreements', icon: FileText },
]
```

---

## 3. WHAT'S MISSING

### 3.1 Proxy Mode UI (MODE 2)

**User Stories (Section 7.6):**
- Commercial Partner acts on behalf of clients
- Documents show client as investing party

**What's Needed:**
- "Acting on behalf of: [Client Name]" banner when in proxy mode
- Client selector when deal is dispatched for proxy
- Subscription submitted shows client as investor
- Documents generated with client details

### 3.2 Client Management UI

**Current State:**
- `commercial_partner_clients` table exists
- No UI to manage clients

**What's Needed:**
- View list of clients
- Add new client (name, contact info)
- Link client to existing investor (if known)

### 3.3 Placement Agreement CRUD

**User Stories (Section 7.6.2, Rows 80-89):**

| Row | Story | Status |
|-----|-------|--------|
| 80 | Display Placement Fee Summary dispatched to me | PARTIAL |
| 81 | V2: View reminders to approve Placement Agreement | MISSING |
| 82 | View reminders to sign Placement Agreement | MISSING |
| 83 | V2: Approve Placement Agreement | MISSING |
| 84 | Sign Placement Agreement | MISSING |
| 85 | Receive notification agreement signed | MISSING |
| 86 | V2: Reject Placement Agreement | DEFERRED |
| 87 | V2: Receive notification agreement rejected | DEFERRED |
| 88 | Display list of Placement Agreements | PARTIAL |
| 89 | View details of selected agreement | PARTIAL |

**Note:** Some features marked V2 in user stories - implement signing for MVP.

### 3.4 Conditional Investor Access

**Same pattern as Partner/Introducer:**
- Check `deal_memberships.role`
- `commercial_partner_investor` → MODE 1 (direct)
- `commercial_partner_proxy` → MODE 2 (on behalf)
- `commercial_partner` → Tracking only

### 3.5 Commercial Partner Dashboard

**Required Metrics:**
- Placement agreement status
- Own investments (MODE 1)
- Client transactions (MODE 2)
- Total client AUM
- Pending commissions

---

## 4. IMPLEMENTATION TASKS

### Task 1: Proxy Mode Banner and Context (4 hours)

**Files to Create:**

```
src/components/commercial-partner/proxy-mode-banner.tsx
src/contexts/proxy-mode-context.tsx (MAY ALREADY EXIST)
```

**Files to Modify:**

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
```

**Proxy Mode Context:**
```typescript
// Check if user is in proxy mode for this deal
const { data: membership } = await supabase
  .from('deal_memberships')
  .select('role, referred_by_entity_id, commercial_partner_clients(*)')
  .eq('user_id', userId)
  .eq('deal_id', dealId)
  .single();

if (membership?.role === 'commercial_partner_proxy') {
  // Load client info
  const client = membership.commercial_partner_clients;
  // Set proxy mode context
}
```

**Proxy Mode Banner:**
```tsx
// Shows at top of opportunity detail page
<div className="bg-blue-50 border-l-4 border-blue-500 p-4">
  <div className="flex items-center">
    <Users className="h-5 w-5 text-blue-500 mr-2" />
    <span className="font-medium">
      Acting on behalf of: {clientName}
    </span>
  </div>
</div>
```

### Task 2: Client Management UI (6 hours)

**Files to Create:**

```
src/app/(main)/versotech_main/client-transactions/manage/page.tsx
src/app/api/commercial-partners/me/clients/route.ts
src/app/api/commercial-partners/me/clients/[id]/route.ts
src/components/commercial-partner/client-form.tsx
src/components/commercial-partner/client-list.tsx
```

**API Routes:**
```typescript
// GET /api/commercial-partners/me/clients
// Returns clients linked to current CP

// POST /api/commercial-partners/me/clients
// Body: {
//   client_name: string,
//   contact_email?: string,
//   contact_phone?: string,
//   linked_investor_id?: string  // If client is known investor
// }

// PATCH /api/commercial-partners/me/clients/[id]
// Update client info

// DELETE /api/commercial-partners/me/clients/[id]
// Remove client (soft delete)
```

**Client List:**
- Shows all clients for this CP
- Columns: Name, Contact, Linked Investor, Created Date
- Actions: Edit, View Transactions

**Add Client Form:**
- Client name (required)
- Contact email
- Contact phone
- "Link to existing investor" search (optional)

### Task 3: Conditional Investor Access Check (4 hours)

**Files to Create:**

```
src/lib/commercial-partner/can-invest.ts
```

**Files to Modify:**

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
```

**Check Function:**
```typescript
// lib/commercial-partner/can-invest.ts
interface CPAccessResult {
  canInvest: boolean;
  mode: 'direct' | 'proxy' | 'tracking' | null;
  clientId?: string;
  clientName?: string;
}

export async function checkCPDealAccess(
  userId: string,
  dealId: string
): Promise<CPAccessResult> {
  const { data } = await supabase
    .from('deal_memberships')
    .select(`
      role,
      commercial_partner_clients(id, client_name)
    `)
    .eq('user_id', userId)
    .eq('deal_id', dealId)
    .single();
  
  if (!data) {
    return { canInvest: false, mode: null };
  }
  
  switch (data.role) {
    case 'commercial_partner_investor':
      return { canInvest: true, mode: 'direct' };
    case 'commercial_partner_proxy':
      return {
        canInvest: true,
        mode: 'proxy',
        clientId: data.commercial_partner_clients?.id,
        clientName: data.commercial_partner_clients?.client_name
      };
    default:
      return { canInvest: false, mode: 'tracking' };
  }
}
```

### Task 4: Proxy Mode Subscription Flow (6 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
src/app/api/commercial-partners/proxy-subscribe/route.ts
```

**Proxy Subscription UI:**
- When in proxy mode, subscription form shows:
  - Client name (pre-filled, read-only)
  - Investment amount (CP enters)
  - Submit creates subscription FOR CLIENT

**Document Generation:**
- Subscription pack shows CLIENT as investor
- Client's name and details in document
- Commercial Partner signs but on behalf of client

### Task 5: Placement Agreement CRUD (6 hours)

**Files to Create:**

```
src/app/api/placement-agreements/route.ts
src/app/api/placement-agreements/[id]/route.ts
src/app/api/placement-agreements/[id]/sign/route.ts
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx
src/components/commercial-partner/placement-agreement-detail.tsx
```

**API Routes:**
```typescript
// GET /api/placement-agreements
// Returns placement agreements for current CP

// GET /api/placement-agreements/[id]
// Get single agreement detail

// POST /api/placement-agreements (CEO/Arranger only)
// Create new placement agreement

// POST /api/placement-agreements/[id]/sign
// Create signature request via VersaSign
```

**Agreement Detail Page:**
- Shows agreement terms
- Status: pending_signature, active, expired
- Sign button if pending

### Task 6: Wire Investor Journey for MODE 1 (4 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
```

**MODE 1 Flow:**
- Same as investor journey
- When `commercial_partner_investor`:
  - Show full investor journey (NDA, Subscribe, Sign, Fund)
  - Subscription is for CP's own account
  - Normal document generation

### Task 7: Commercial Partner Dashboard (4 hours)

**Files to Create:**

```
src/components/dashboard/cp-dashboard.tsx
```

**Metrics to Show:**

| Metric | Query |
|--------|-------|
| Placement Agreement | `placement_agreements` status |
| Own Investments (MODE 1) | `subscriptions` WHERE investor_id = CP's investor |
| Client Transactions (MODE 2) | `subscriptions` WHERE via proxy |
| Total Client AUM | SUM of client subscriptions |
| Pending Commissions | `fee_events` WHERE status='pending' |

**Data Cards:**
- "Placement Agreement: Active" or "Sign Agreement"
- "2 Own Investments" - MODE 1
- "15 Client Transactions" - MODE 2
- "$5M Client AUM"
- "$100K Pending Commissions"

---

## 5. USER STORIES COVERAGE CHECK

### Will Be Implemented

| Section | Stories | Task |
|---------|---------|------|
| 7.2 My opportunities | Rows 15-46 | Task 3, 6 (conditional) |
| 7.3 My Investments | Rows 47-51 | Uses investor journey |
| 7.5 My Investment Sales | Rows 66-70 | Uses investor resale |
| 7.6.1 View My Transactions | Rows 71-79 | Existing + enhancements |
| 7.6.2 My Placement Agreements | Rows 80-89 | Task 5 |
| 7.6.3 My Transactions tracking | Rows 90-95 | Existing notifications |
| 7.6.4 My Transactions Reporting | Rows 96-102 | Existing reports |

### Deferred

| Section | Stories | Reason |
|---------|---------|--------|
| 7.3.6-7.3.7 Conversion/Redemption | Rows 52-62 | Post-launch |
| 7.7 GDPR | Rows 103-112 | See CEO plan |

---

## 6. TESTING CHECKLIST

### Commercial Partner Flow Tests

- [ ] Login as CP → CP dashboard shows
- [ ] Dashboard shows correct metrics
- [ ] Navigate to Placement Agreements → See agreements
- [ ] Sign placement agreement → VersaSign flow works
- [ ] Navigate to Client Transactions → See clients

### MODE 1 (Direct Investment) Tests

- [ ] Deal dispatched as `commercial_partner_investor` → Full investor journey
- [ ] Submit subscription → For CP's own account
- [ ] Sign subscription pack → Normal flow
- [ ] Investment appears in CP's portfolio

### MODE 2 (Proxy Mode) Tests

- [ ] Deal dispatched as `commercial_partner_proxy` → Proxy banner shows
- [ ] Banner shows "Acting on behalf of: [Client Name]"
- [ ] Submit subscription → Shows client as investor
- [ ] Documents generated with client details
- [ ] CP signs but client is investor of record
- [ ] Transaction appears in Client Transactions

### Client Management Tests

- [ ] Navigate to Client Management → See client list
- [ ] Add new client → Success
- [ ] Link client to existing investor → Works
- [ ] Edit client info → Changes saved

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- VersaSign (BUILT)
- Investor journey components (BUILT)
- Proxy subscribe API (BUILT - needs enhancement)

**Blocks Other Features:**
- Client must exist before proxy mode dispatch

---

## 8. FILES SUMMARY

### To Create (14 files)

```
src/components/commercial-partner/proxy-mode-banner.tsx
src/app/(main)/versotech_main/client-transactions/manage/page.tsx
src/app/api/commercial-partners/me/clients/route.ts
src/app/api/commercial-partners/me/clients/[id]/route.ts
src/components/commercial-partner/client-form.tsx
src/components/commercial-partner/client-list.tsx
src/lib/commercial-partner/can-invest.ts

src/app/api/placement-agreements/route.ts
src/app/api/placement-agreements/[id]/route.ts
src/app/api/placement-agreements/[id]/sign/route.ts
src/app/(main)/versotech_main/placement-agreements/[id]/page.tsx
src/components/commercial-partner/placement-agreement-detail.tsx

src/components/dashboard/cp-dashboard.tsx
```

### To Modify (3 files)

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
  - Add CP mode detection
  - Show proxy banner when MODE 2
  - Conditional investor actions

src/app/api/commercial-partners/proxy-subscribe/route.ts
  - Enhance to use client context properly
  - Generate documents with client details

src/contexts/proxy-mode-context.tsx (if exists, or create)
  - Proxy mode state management
```

---

## 9. ACCEPTANCE CRITERIA

1. **Proxy Mode UI:**
   - [ ] Banner shows "Acting on behalf of: [Client]" when MODE 2
   - [ ] Banner visible throughout opportunity detail
   - [ ] Clear distinction from MODE 1 (own investment)

2. **Client Management:**
   - [ ] CP can view list of their clients
   - [ ] CP can add new client
   - [ ] CP can link client to existing investor
   - [ ] CP can edit client info

3. **MODE 1 (Direct Investment):**
   - [ ] Full investor journey available
   - [ ] Subscription for CP's own account
   - [ ] Normal document generation
   - [ ] Investment in CP's portfolio

4. **MODE 2 (Proxy Mode):**
   - [ ] Subscription submitted shows client as investor
   - [ ] Documents generated with client details
   - [ ] CP signs on behalf of client
   - [ ] Transaction tracked in Client Transactions

5. **Placement Agreements:**
   - [ ] CP can view placement agreements
   - [ ] CP can sign via VersaSign
   - [ ] Agreement status updates correctly

6. **Dashboard:**
   - [ ] Shows placement agreement status
   - [ ] Shows own investments count (MODE 1)
   - [ ] Shows client transactions count (MODE 2)
   - [ ] Shows client AUM
   - [ ] Shows pending commissions

---

## 10. FEATURE TRUTH TABLE (Audit-Verified)

| Feature | Planned | Exists | Working | Priority |
|---------|---------|--------|---------|----------|
| Database schema (all tables) | ✓ | ✓ | ✓ | - |
| Proxy Mode Banner | ✓ | ✓ | ✓ | - |
| Proxy Mode Context | ✓ | ✓ | ✓ | - |
| Proxy Subscribe API POST | ✓ | ✓ | ✓ | - |
| Proxy Subscribe API GET | ✓ | ✓ | PARTIAL | - |
| Client Transactions View | ✓ | ✓ | ✓ | - |
| Placement Agreements View | ✓ | ✓ | ✓ | - |
| **Client Add Form** | **✓** | **✗** | **✗** | **P0** |
| **Client CRUD API** | **✓** | **✗** | **✗** | **P0** |
| **Placement Agreement Signing** | **✓** | **✗** | **✗** | **P0** |
| Placement Agreement Detail Page | ✓ | ✗ | ✗ | P0 |
| CP Dashboard | ✓ | ✗ | ✗ | P1 |
| Can-Invest Utility | ✓ | ✗ | ✗ | P1 |
| MODE 1 UI Clarity | ✓ | PARTIAL | PARTIAL | P1 |
| MODE 2 Deal Flow Integration | ✓ | PARTIAL | PARTIAL | P1 |

---

## 11. COMPLETION BREAKDOWN

| Component | Completion | Notes |
|-----------|------------|-------|
| Database | 100% | All tables, enums, relationships exist |
| API Routes (6 needed) | 25% | proxy-subscribe only |
| UI Components (14 needed) | 21% | 3 of 14 built |
| Mode Logic | 50% | MODE 2 works, MODE 1 unclear |
| Integration | 30% | Proxy banner exists but not in deal flow |

**TRUE FUNCTIONAL COMPLETION: 45%**

---

## 12. DEPLOYMENT READINESS CHECKLIST

### ✓ WORKING (Can Deploy)
- [x] Proxy mode banner exists and displays
- [x] Proxy subscribe API creates subscriptions correctly
- [x] Client transactions page loads
- [x] Placement agreements can be viewed
- [x] Database schema complete

### ✗ BLOCKING (Cannot Deploy)
- [ ] **No way to ADD clients** - `commercial_partner_clients` table created but never populated via UI
- [ ] **No way to MANAGE clients** - no CRUD endpoints
- [ ] **No way to SIGN agreements** - placement agreements are view-only
- [ ] **No CP dashboard** - generic persona dashboard used
- [ ] **No agreement detail page** - can view list but not individual agreements
- [ ] **MODE 1 undefined** - no clear UI for CP direct investment

---

## 13. DEVELOPER-READY IMPLEMENTATION CODE

### 13.1 Client Management CRUD API

**File: `src/app/api/commercial-partners/me/clients/route.ts`**

```typescript
/**
 * Commercial Partner Client Management
 * GET - List clients for current CP
 * POST - Add new client
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createClientSchema = z.object({
  client_name: z.string().min(2),
  client_email: z.string().email().optional(),
  client_phone: z.string().optional(),
  linked_investor_id: z.string().uuid().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get CP ID
    const { data: cpUser } = await supabase
      .from('commercial_partner_users')
      .select('commercial_partner_id')
      .eq('user_id', user.id)
      .single();

    if (!cpUser) {
      return NextResponse.json({ error: 'Not a commercial partner' }, { status: 403 });
    }

    // Get clients
    const { data: clients, error } = await supabase
      .from('commercial_partner_clients')
      .select(`
        *,
        investor:investors(id, display_name)
      `)
      .eq('commercial_partner_id', cpUser.commercial_partner_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    return NextResponse.json({ data: clients || [] });

  } catch (error) {
    console.error('Clients GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cpUser } = await supabase
      .from('commercial_partner_users')
      .select('commercial_partner_id')
      .eq('user_id', user.id)
      .single();

    if (!cpUser) {
      return NextResponse.json({ error: 'Not a commercial partner' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createClientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 });
    }

    // Create client
    const { data: client, error } = await supabase
      .from('commercial_partner_clients')
      .insert({
        commercial_partner_id: cpUser.commercial_partner_id,
        ...validation.data,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create client:', error);
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      event_type: 'client_management',
      action: 'created',
      entity_type: 'commercial_partner_client',
      entity_id: client.id,
      actor_id: user.id,
      action_details: {
        client_name: validation.data.client_name,
        commercial_partner_id: cpUser.commercial_partner_id
      },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ data: client }, { status: 201 });

  } catch (error) {
    console.error('Client POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 13.2 Client Form Component

**File: `src/components/commercial-partner/client-form.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ClientFormProps {
  onSuccess?: () => void
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Client name is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/commercial-partners/me/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: name,
          client_email: email || undefined,
          client_phone: phone || undefined,
          notes: notes || undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create client')
      }

      toast.success('Client added successfully')
      setOpen(false)
      setName('')
      setEmail('')
      setPhone('')
      setNotes('')
      onSuccess?.()
    } catch (error) {
      console.error('Create client error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the client..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 13.3 CP Dashboard Component

**File: `src/components/dashboard/cp-dashboard.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, DollarSign, FileText, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DashboardMetrics {
  agreementStatus: 'none' | 'pending' | 'active'
  agreementId?: string
  clientCount: number
  ownInvestments: number
  proxyInvestments: number
  clientAUM: number
  pendingCommissions: number
}

export function CPDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    agreementStatus: 'none',
    clientCount: 0,
    ownInvestments: 0,
    proxyInvestments: 0,
    clientAUM: 0,
    pendingCommissions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get CP ID
      const { data: cpUser } = await supabase
        .from('commercial_partner_users')
        .select('commercial_partner_id')
        .eq('user_id', user.id)
        .single()

      if (!cpUser) {
        setLoading(false)
        return
      }

      // Check placement agreement
      const { data: agreement } = await supabase
        .from('placement_agreements')
        .select('id, status')
        .eq('commercial_partner_id', cpUser.commercial_partner_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Fetch metrics in parallel
      const [clients, ownSubs, proxySubs, feeEvents] = await Promise.all([
        supabase
          .from('commercial_partner_clients')
          .select('id', { count: 'exact', head: true })
          .eq('commercial_partner_id', cpUser.commercial_partner_id),
        // Own investments (MODE 1)
        supabase
          .from('deal_memberships')
          .select('deal_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('role', 'commercial_partner_investor'),
        // Proxy investments (MODE 2)
        supabase
          .from('subscriptions')
          .select('id, commitment')
          .eq('proxy_commercial_partner_id', cpUser.commercial_partner_id),
        // Pending fees
        supabase
          .from('fee_events')
          .select('computed_amount')
          .eq('commercial_partner_id', cpUser.commercial_partner_id)
          .eq('status', 'accrued')
      ])

      const proxySubsData = proxySubs.data || []
      const clientAUM = proxySubsData.reduce((sum, s) => sum + (s.commitment || 0), 0)
      const pendingComm = (feeEvents.data || []).reduce((sum, f) => sum + (f.computed_amount || 0), 0)

      setMetrics({
        agreementStatus: agreement?.status || 'none',
        agreementId: agreement?.id,
        clientCount: clients.count || 0,
        ownInvestments: ownSubs.count || 0,
        proxyInvestments: proxySubsData.length,
        clientAUM,
        pendingCommissions: pendingComm
      })
      setLoading(false)
    }

    fetchMetrics()
  }, [])

  const showAgreementWarning = metrics.agreementStatus !== 'active'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commercial Partner Dashboard</h1>
        <p className="text-muted-foreground">Manage your investments and client portfolios</p>
      </div>

      {showAgreementWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Placement Agreement Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {metrics.agreementStatus === 'none' && 'You need a placement agreement to manage client investments.'}
              {metrics.agreementStatus === 'pending' && 'Your placement agreement is pending signature.'}
            </span>
            {metrics.agreementId && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/versotech_main/placement-agreements/${metrics.agreementId}`}>
                  Sign Agreement
                </Link>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/versotech_main/client-transactions/manage">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clients
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? '...' : metrics.clientCount}
                </div>
                <Badge variant="secondary">Manage</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/versotech_main/opportunities">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Own Investments (MODE 1)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? '...' : metrics.ownInvestments}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/versotech_main/client-transactions">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Client Investments (MODE 2)
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {loading ? '...' : metrics.proxyInvestments}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Client AUM
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loading ? '...' : (metrics.clientAUM / 1000000).toFixed(1)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Commissions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${loading ? '...' : metrics.pendingCommissions.toLocaleString()}
              </div>
              {metrics.pendingCommissions > 0 && (
                <Badge variant="secondary">Pending</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

**Total Estimated Hours: 28**
- Client Management CRUD (P0): 6 hours
- Placement Agreement Signing (P0): 6 hours
- Agreement Detail Page (P0): 4 hours
- CP Dashboard (P1): 4 hours
- Can-Invest Utility (P1): 4 hours
- Proxy Banner Integration in Deal Flow (P1): 2 hours
- MODE 1 UI Clarity (P2): 2 hours

**Priority: HIGH (Two-mode operation is unique to CP - both modes need to work)**
**Risk: HIGH (Client management is BLOCKING - cannot use MODE 2 without clients)**
**Deployment Status: NOT READY**
**Last Updated:** December 24, 2025 (Developer-Ready)
