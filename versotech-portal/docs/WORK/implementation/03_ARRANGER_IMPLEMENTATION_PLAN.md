# Arranger Implementation Plan

**User Type:** Arranger
**Current Completion:** 15% (Audit-Verified: December 24, 2025)
**Target Completion:** 90%
**Estimated Hours:** 28 hours
**Last Audit:** December 24, 2025 - Deep Surgical Audit Complete

---

## ⚠️ CRITICAL AUDIT FINDINGS

### 1. Fee Model CRUD: 0% Complete

**Actual State (Verified via Codebase Search):**

| Component | Status | Notes |
|-----------|--------|-------|
| `/api/arrangers/partners/[partnerId]/fee-models/*` | ❌ MISSING | No routes exist |
| `/api/arrangers/introducers/[introducerId]/fee-models/*` | ❌ MISSING | No routes exist |
| `/api/arrangers/commercial-partners/[cpId]/fee-models/*` | ❌ MISSING | No routes exist |
| `src/components/arranger/fee-model-form.tsx` | ❌ MISSING | No component |
| `src/components/arranger/fee-model-list.tsx` | ❌ MISSING | No component |

**Staff Fee Routes Exist But Are Different:**
- `/api/staff/fees/*` - These are for STAFF managing all fees
- Arranger needs SELF-SERVICE routes to manage THEIR fee models

### 2. My-* Pages: Placeholder Only

**Actual State:**
| Page | Status |
|------|--------|
| `/versotech_main/my-partners` | File exists, minimal content |
| `/versotech_main/my-introducers` | File exists, minimal content |
| `/versotech_main/my-commercial-partners` | File exists, minimal content |
| `/versotech_main/my-lawyers` | File exists, minimal content |
| `/versotech_main/my-mandates` | File exists, minimal content |

**These pages need REAL data integration.**

### 3. Agreement Workflow: 0% Complete

**Required for Introducer/CP:**
- `/api/arrangers/send-introducer-agreement/route.ts` - ❌ MISSING
- `/api/arrangers/send-placement-agreement/route.ts` - ❌ MISSING
- VersaSign integration for dual-party signing - Uses existing pattern

### 4. What Actually Works

| Feature | Status |
|---------|--------|
| Arranger persona detection | ✅ WORKS |
| Navigation configured | ✅ WORKS |
| Database tables exist | ✅ WORKS |
| Profile page | ✅ WORKS |
| Documents page | ✅ WORKS |
| Inbox/VersaSign | ✅ WORKS |

---

## FEATURE TRUTH TABLE (Audit-Verified)

| Feature | Planned | Exists | Working | Priority |
|---------|---------|--------|---------|----------|
| Arranger Persona | ✓ | ✓ | ✓ | - |
| Database Schema | ✓ | ✓ | ✓ | - |
| Navigation | ✓ | ✓ | ✓ | - |
| **Fee Model CRUD (Partners)** | **✓** | **✗** | **0%** | **P0** |
| **Fee Model CRUD (Introducers)** | **✓** | **✗** | **0%** | **P0** |
| **Fee Model CRUD (CPs)** | **✓** | **✗** | **0%** | **P0** |
| **Introducer Agreement Workflow** | **✓** | **✗** | **0%** | **P0** |
| **Placement Agreement Workflow** | **✓** | **✗** | **0%** | **P0** |
| **Arranger Dashboard** | **✓** | **✗** | **0%** | **P1** |
| My-* Pages (real data) | ✓ | PARTIAL | 20% | P1 |
| Payment Request to Lawyer | ✓ | ✗ | 0% | P2 |

**TRUE FUNCTIONAL COMPLETION: 15%**

---

## 1. WHO IS THE ARRANGER?

The Arranger structures deals and manages relationships with partners, introducers, commercial partners, and lawyers. From user stories (Section 2.Arranger, 86 rows):

**Business Role:**
- Manages their profile and company information
- **CREATES and manages fee models** for Partners, Introducers, Commercial Partners
- Sends fee models to these parties
- Creates and manages Introducer Agreements
- Signs placement agreements with Commercial Partners
- Views and manages their Mandates (deals they're structuring)
- Requests payment to lawyers for fee processing
- Views escrow account funding status
- Generates reconciliation reports

**Key Distinction:**
- Arranger has FULL CRUD on fee models (not just view)
- Arranger works with deals at a structuring level
- Different from CEO: CEO manages platform, Arranger manages deal relationships

---

## 2. WHAT ALREADY EXISTS

### 2.1 Database

**Tables (All Exist):**
- `arranger_entities` - Arranger accounts
- `arranger_members` - Entity members
- `arranger_users` - Links profiles to arranger entities
- `fee_plans` - Fee plan definitions (exists, used by staff)
- `fee_components` - Fee plan components
- `introducer_agreements` - Introducer fee agreements
- `placement_agreements` - CP placement agreements

**Missing Fields:**
- None - tables are complete

### 2.2 Pages (Structure Exists, Content Limited)

| Route | Status | Description |
|-------|--------|-------------|
| `/versotech_main/dashboard` | PARTIAL | Uses generic PersonaDashboard |
| `/versotech_main/my-partners` | EXISTS | Page file exists, limited data |
| `/versotech_main/my-introducers` | EXISTS | Page file exists, limited data |
| `/versotech_main/my-commercial-partners` | EXISTS | Page file exists, limited data |
| `/versotech_main/my-lawyers` | EXISTS | Page file exists, limited data |
| `/versotech_main/my-mandates` | EXISTS | Page file exists, limited data |
| `/versotech_main/profile` | BUILT | Profile page |
| `/versotech_main/documents` | BUILT | Documents |
| `/versotech_main/inbox` | BUILT | Inbox |

**What's Limited:**
- Pages exist but mostly show placeholder content
- No fee model creation UI
- No agreement workflow

### 2.3 API Routes

| Route | Status | Notes |
|-------|--------|-------|
| `/api/admin/arrangers/*` | BUILT | Admin routes for managing arrangers |
| `/api/arrangers/*` | MISSING | No arranger self-service routes |
| `/api/staff/fees/*` | BUILT | Staff fee routes (can be referenced) |

### 2.4 Navigation

**Configured in `persona-sidebar.tsx`:**
```typescript
arranger: [
  { name: 'Dashboard', href: '/versotech_main/dashboard', icon: LayoutDashboard },
  { name: 'My Mandates', href: '/versotech_main/my-mandates', icon: FileText },
  { name: 'My Partners', href: '/versotech_main/my-partners', icon: Users },
  { name: 'My Introducers', href: '/versotech_main/my-introducers', icon: UserPlus },
  { name: 'My Commercial Partners', href: '/versotech_main/my-commercial-partners', icon: Building2 },
  { name: 'My Lawyers', href: '/versotech_main/my-lawyers', icon: Scale },
  { name: 'Documents', href: '/versotech_main/documents', icon: FileText },
]
```

---

## 3. WHAT'S MISSING

### 3.1 Fee Model CRUD (From User Stories)

**Section 2.2 - My Partners:**

| Row | Story | Status |
|-----|-------|--------|
| 11 | Create fees model for selected partners | MISSING |
| 12 | Update fees model for selected partners | MISSING |
| 13 | Send notification to Partners to send invoice | MISSING |
| 14 | Receive notification when invoice received | MISSING |
| 15 | View fees to pay to selected Partners | PARTIAL |
| 16 | Request to proceed to Partner fee payment to Lawyer | MISSING |
| 17 | Receive notification when payment completed | MISSING |

**Section 2.3 - My Introducers:**

| Row | Story | Status |
|-----|-------|--------|
| 22 | Create fees model for selected introducers | MISSING |
| 23 | Update fees model for selected introducers | MISSING |
| 24 | Send fees model to selected introducers | MISSING |
| 25 | Update existing Introducer Agreement | MISSING |
| 26 | Automatic reminder to approve Introducer Agreement | MISSING |
| 27 | Receive notification of approval | MISSING |
| 28 | Receive notification of rejection | MISSING |
| 29 | Digitally sign approved Introducer Agreement | MISSING |
| 30-32 | Reminders and signature confirmation | MISSING |

**Section 2.4 - My Commercial Partners:**

| Row | Story | Status |
|-----|-------|--------|
| 42 | Create fees model for Commercial Partners | MISSING |
| 43 | Update fees model for Commercial Partners | MISSING |
| 44 | Send fees model to Commercial Partners | MISSING |
| 49 | Digitally sign approved Placement Agreement | MISSING |
| 50-52 | Reminders and signature | MISSING |

### 3.2 Arranger Dashboard

**Required Metrics:**
- Active mandates count
- Pending agreements (awaiting signature)
- Pending payments (to partners/introducers/CPs)
- Recent activity

### 3.3 Payment Request Flow

**Section 2.2.2, 2.3.2, 2.4.2:**
- Arranger requests lawyer to process payment
- Notification when payment completed

---

## 4. IMPLEMENTATION TASKS

### Task 1: Fee Model CRUD for Partners (6 hours)

**Files to Create:**

```
src/app/api/arrangers/partners/[partnerId]/fee-models/route.ts
src/components/arranger/fee-model-form.tsx
src/components/arranger/fee-model-list.tsx
```

**API Routes:**

```typescript
// GET /api/arrangers/partners/[partnerId]/fee-models
// Returns all fee models for this partner created by current arranger

// POST /api/arrangers/partners/[partnerId]/fee-models
// Body: {
//   name: string,
//   deal_id?: string,
//   components: [
//     { fee_type: 'subscription' | 'management' | 'performance', rate_bps: number, ... }
//   ]
// }

// PATCH /api/arrangers/partners/[partnerId]/fee-models/[modelId]
// Update fee model

// DELETE /api/arrangers/partners/[partnerId]/fee-models/[modelId]
// Delete fee model
```

**Fee Model Form:**
- Name
- Associated deal (optional)
- Fee components:
  - Subscription fee (one-time, % of investment)
  - Management fee (annual, % of AUM)
  - Performance fee (% of gains, with hurdle)
- Preview calculations

**Integration:**
- Add to `/versotech_main/my-partners` page
- Each partner card has "Manage Fee Models" button
- Opens modal or dedicated page

### Task 2: Fee Model CRUD for Introducers (4 hours)

**Files to Create:**

```
src/app/api/arrangers/introducers/[introducerId]/fee-models/route.ts
```

**Same pattern as partners, slightly different:**
- Introducer fee models focus on commission
- `default_commission_bps` field
- Commission cap amount

### Task 3: Fee Model CRUD for Commercial Partners (4 hours)

**Files to Create:**

```
src/app/api/arrangers/commercial-partners/[cpId]/fee-models/route.ts
```

**Same pattern, with:**
- Placement fee focus
- Tiered fee structures possible

### Task 4: Send Fee Model Notification (2 hours)

**Files to Create:**

```
src/app/api/arrangers/send-fee-model/route.ts
src/lib/notifications/fee-model-sent.ts
```

**Flow:**
1. Arranger creates fee model
2. Clicks "Send to Partner/Introducer/CP"
3. Creates notification for recipient
4. Creates task if needed
5. Recipient sees fee model in their portal

### Task 5: Introducer Agreement Workflow (4 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/my-introducers/page.tsx
```

**Files to Create:**

```
src/app/api/arrangers/send-introducer-agreement/route.ts
src/components/arranger/introducer-agreement-modal.tsx
```

**Flow:**
1. Arranger creates/updates fee model for introducer
2. Arranger clicks "Send Agreement"
3. System generates agreement document with fee terms
4. Introducer receives notification
5. Introducer approves → Arranger notified → Arranger signs via VersaSign
6. Introducer signs via VersaSign
7. Agreement active

### Task 6: Payment Request to Lawyer (2 hours)

**Files to Create:**

```
src/app/api/arrangers/request-payment/route.ts
src/components/arranger/request-payment-modal.tsx
```

**Request includes:**
- Partner/Introducer/CP ID
- Invoice reference
- Amount
- Lawyer to assign

**Creates:**
- Task for lawyer
- Notification for CEO
- Audit log entry

### Task 7: Arranger Dashboard (4 hours)

**Files to Create:**

```
src/components/dashboard/arranger-dashboard.tsx
```

**Metrics to Show:**
- Active Mandates: Count of deals where arranger is assigned
- Pending Agreements: Introducer/Placement agreements awaiting action
- Pending Payments: Partner/Introducer/CP payments awaiting processing
- Recent Transactions: Latest activity

**Data Sources:**
- `deals` WHERE arranger_id = current_arranger
- `introducer_agreements` WHERE status = 'pending'
- `placement_agreements` WHERE status = 'pending'
- Fee events for recent activity

### Task 8: Enhance My-* Pages (2 hours)

**Files to Modify:**

```
src/app/(main)/versotech_main/my-partners/page.tsx
src/app/(main)/versotech_main/my-introducers/page.tsx
src/app/(main)/versotech_main/my-commercial-partners/page.tsx
src/app/(main)/versotech_main/my-lawyers/page.tsx
src/app/(main)/versotech_main/my-mandates/page.tsx
```

**Each page needs:**
- Real data from database
- Actions: View, Edit Fee Model, Send Agreement
- Status indicators

---

## 5. USER STORIES COVERAGE CHECK

### Will Be Implemented

| Section | Stories | Task |
|---------|---------|------|
| 2.2.1 Create Partner Fee Models | Rows 11-12 | Task 1 |
| 2.2.2 Payment | Rows 13-17 | Task 6 |
| 2.2.3 View | Rows 18-19 | Task 8 |
| 2.2.4 Partner Performance | Rows 20-21 | Existing reports |
| 2.3.1 Create Introducer Fee Models | Rows 22-32 | Tasks 2, 5 |
| 2.3.2 Payment | Rows 33-37 | Task 6 |
| 2.3.3-4 View & Performance | Rows 38-41 | Task 8, existing |
| 2.4.1 Create CP Fee Models | Rows 42-52 | Task 3, 5 |
| 2.4.2-4 Payment, View, Performance | Rows 53-61 | Task 6, 8 |
| 2.5 My Lawyers | Rows 62-63 | Task 8 |
| 2.6 My Mandates | Rows 64-77 | Task 8 |

### Deferred

| Section | Stories | Reason |
|---------|---------|--------|
| 2.7 GDPR | Rows 78-87 | See CEO plan |

---

## 6. TESTING CHECKLIST

### Arranger Flow Tests

- [ ] Login as arranger → Arranger dashboard shows
- [ ] Dashboard shows correct metrics
- [ ] Navigate to My Partners → List of partners displays
- [ ] Click partner → See fee models
- [ ] Create new fee model → Success
- [ ] Update fee model → Changes saved
- [ ] Delete fee model → Removed
- [ ] Send fee model to partner → Partner notified
- [ ] Create introducer agreement → Sent for approval
- [ ] Introducer approves → Arranger can sign
- [ ] Both sign → Agreement active
- [ ] Request payment to lawyer → Lawyer receives task
- [ ] View My Mandates → Deals assigned display

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- VersaSign (for agreement signing) - ALREADY BUILT

**Blocks Other Features:**
- Introducers need agreements before introducing
- CPs need placement agreements

---

## 8. FILES SUMMARY

### To Create (13 files)

```
src/app/api/arrangers/partners/[partnerId]/fee-models/route.ts
src/app/api/arrangers/introducers/[introducerId]/fee-models/route.ts
src/app/api/arrangers/commercial-partners/[cpId]/fee-models/route.ts
src/app/api/arrangers/send-fee-model/route.ts
src/app/api/arrangers/send-introducer-agreement/route.ts
src/app/api/arrangers/request-payment/route.ts

src/components/arranger/fee-model-form.tsx
src/components/arranger/fee-model-list.tsx
src/components/arranger/introducer-agreement-modal.tsx
src/components/arranger/request-payment-modal.tsx
src/components/dashboard/arranger-dashboard.tsx

src/lib/notifications/fee-model-sent.ts
src/lib/notifications/agreement-sent.ts
```

### To Modify (6 files)

```
src/app/(main)/versotech_main/my-partners/page.tsx
src/app/(main)/versotech_main/my-introducers/page.tsx
src/app/(main)/versotech_main/my-commercial-partners/page.tsx
src/app/(main)/versotech_main/my-lawyers/page.tsx
src/app/(main)/versotech_main/my-mandates/page.tsx
src/app/(main)/versotech_main/dashboard/page.tsx (add arranger dashboard)
```

---

## 9. ACCEPTANCE CRITERIA

1. **Fee Model CRUD:**
   - [ ] Arranger can create fee model for partner
   - [ ] Arranger can create fee model for introducer
   - [ ] Arranger can create fee model for commercial partner
   - [ ] Fee model includes subscription, management, performance components
   - [ ] Arranger can update and delete fee models
   - [ ] Arranger can send fee model to recipient (notification created)

2. **Agreements:**
   - [ ] Arranger can send introducer agreement
   - [ ] Introducer receives notification to approve
   - [ ] After approval, both can sign via VersaSign
   - [ ] Signed agreement stored in documents

3. **Payments:**
   - [ ] Arranger can request payment to lawyer
   - [ ] Lawyer receives task
   - [ ] CEO receives notification
   - [ ] Arranger notified when payment completed

4. **Dashboard:**
   - [ ] Shows active mandates count
   - [ ] Shows pending agreements
   - [ ] Shows pending payments
   - [ ] Links to relevant pages

---

## 10. DEVELOPER-READY IMPLEMENTATION CODE

### 10.1 Fee Model CRUD API for Partners

**File: `src/app/api/arrangers/partners/[partnerId]/fee-models/route.ts`**

```typescript
/**
 * Arranger Fee Model CRUD for Partners
 * GET - List fee models for a partner
 * POST - Create fee model for a partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const feeModelSchema = z.object({
  name: z.string().min(3),
  deal_id: z.string().uuid().optional(),
  components: z.array(z.object({
    fee_type: z.enum(['subscription', 'management', 'performance']),
    rate_bps: z.number().min(0).max(10000), // basis points 0-100%
    calculation_basis: z.string().optional(),
    notes: z.string().optional()
  })).min(1)
});

export async function GET(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an arranger
    const { data: arrangerUser } = await supabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single();

    if (!arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 });
    }

    // Get fee models for this partner created by this arranger
    const { data: feeModels, error } = await supabase
      .from('fee_plans')
      .select('*, components:fee_components(*)')
      .eq('partner_id', params.partnerId)
      .eq('created_by_arranger_id', arrangerUser.arranger_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fee models:', error);
      return NextResponse.json({ error: 'Failed to fetch fee models' }, { status: 500 });
    }

    return NextResponse.json({ data: feeModels || [] });

  } catch (error) {
    console.error('Fee models GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is an arranger
    const { data: arrangerUser } = await supabase
      .from('arranger_users')
      .select('arranger_id')
      .eq('user_id', user.id)
      .single();

    if (!arrangerUser) {
      return NextResponse.json({ error: 'Not an arranger' }, { status: 403 });
    }

    // Verify partner exists
    const { data: partner } = await supabase
      .from('partners')
      .select('id, legal_name')
      .eq('id', params.partnerId)
      .single();

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = feeModelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 });
    }

    const { components, ...planData } = validation.data;

    // Create fee plan
    const { data: feePlan, error: planError } = await supabase
      .from('fee_plans')
      .insert({
        ...planData,
        partner_id: params.partnerId,
        created_by: user.id,
        created_by_arranger_id: arrangerUser.arranger_id,
        is_active: true,
        plan_type: 'partner'
      })
      .select()
      .single();

    if (planError) {
      console.error('Error creating fee plan:', planError);
      return NextResponse.json({ error: 'Failed to create fee model' }, { status: 500 });
    }

    // Create fee components
    const componentInserts = components.map((comp) => ({
      ...comp,
      fee_plan_id: feePlan.id
    }));

    const { data: createdComponents, error: compError } = await supabase
      .from('fee_components')
      .insert(componentInserts)
      .select();

    if (compError) {
      // Rollback
      await supabase.from('fee_plans').delete().eq('id', feePlan.id);
      console.error('Error creating components:', compError);
      return NextResponse.json({ error: 'Failed to create fee components' }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      event_type: 'fee_model',
      action: 'created',
      entity_type: 'fee_plan',
      entity_id: feePlan.id,
      actor_id: user.id,
      action_details: {
        partner_id: params.partnerId,
        partner_name: partner.legal_name,
        plan_name: planData.name,
        component_count: components.length
      },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      data: { ...feePlan, components: createdComponents }
    }, { status: 201 });

  } catch (error) {
    console.error('Fee model POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 10.2 Fee Model Form Component

**File: `src/components/arranger/fee-model-form.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FeeComponent {
  fee_type: 'subscription' | 'management' | 'performance'
  rate_bps: number
  calculation_basis?: string
  notes?: string
}

interface FeeModelFormProps {
  entityType: 'partner' | 'introducer' | 'commercial_partner'
  entityId: string
  entityName: string
  dealId?: string
  onSuccess?: () => void
}

export function FeeModelForm({
  entityType,
  entityId,
  entityName,
  dealId,
  onSuccess
}: FeeModelFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [components, setComponents] = useState<FeeComponent[]>([
    { fee_type: 'subscription', rate_bps: 0 }
  ])

  function addComponent() {
    setComponents([...components, { fee_type: 'management', rate_bps: 0 }])
  }

  function removeComponent(index: number) {
    setComponents(components.filter((_, i) => i !== index))
  }

  function updateComponent(index: number, updates: Partial<FeeComponent>) {
    const newComponents = [...components]
    newComponents[index] = { ...newComponents[index], ...updates }
    setComponents(newComponents)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter a name for the fee model')
      return
    }

    if (components.length === 0) {
      toast.error('Please add at least one fee component')
      return
    }

    setLoading(true)
    try {
      const endpoint = `/api/arrangers/${entityType}s/${entityId}/fee-models`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          deal_id: dealId,
          components
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create fee model')
      }

      toast.success('Fee model created successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Create fee model error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create fee model')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Fee Model for {entityName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Fee Model Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Partner Terms"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Fee Components</Label>
              <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                <Plus className="h-4 w-4 mr-1" /> Add Component
              </Button>
            </div>

            {components.map((comp, index) => (
              <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={comp.fee_type}
                    onValueChange={(v) => updateComponent(index, { fee_type: v as FeeComponent['fee_type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Subscription Fee (one-time)</SelectItem>
                      <SelectItem value="management">Management Fee (annual)</SelectItem>
                      <SelectItem value="performance">Performance Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32 space-y-2">
                  <Label>Rate (bps)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10000"
                    value={comp.rate_bps}
                    onChange={(e) => updateComponent(index, { rate_bps: parseInt(e.target.value) || 0 })}
                    placeholder="100 = 1%"
                  />
                </div>

                <div className="w-24 text-sm text-muted-foreground">
                  = {(comp.rate_bps / 100).toFixed(2)}%
                </div>

                {components.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeComponent(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Fee Model
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 10.3 Arranger Dashboard Component

**File: `src/components/dashboard/arranger-dashboard.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Handshake, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DashboardMetrics {
  activeMandates: number
  pendingAgreements: number
  pendingPayments: number
  totalPartners: number
}

export function ArrangerDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeMandates: 0,
    pendingAgreements: 0,
    pendingPayments: 0,
    totalPartners: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get arranger_id
      const { data: arrangerUser } = await supabase
        .from('arranger_users')
        .select('arranger_id')
        .eq('user_id', user.id)
        .single()

      if (!arrangerUser) return

      // Fetch metrics in parallel
      const [mandates, agreements, partners] = await Promise.all([
        supabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .eq('arranger_id', arrangerUser.arranger_id)
          .eq('status', 'active'),
        supabase
          .from('introducer_agreements')
          .select('id', { count: 'exact', head: true })
          .eq('arranger_id', arrangerUser.arranger_id)
          .eq('status', 'pending'),
        supabase
          .from('partners')
          .select('id', { count: 'exact', head: true })
      ])

      setMetrics({
        activeMandates: mandates.count || 0,
        pendingAgreements: agreements.count || 0,
        pendingPayments: 0, // TODO: implement payment tracking
        totalPartners: partners.count || 0
      })
      setLoading(false)
    }

    fetchMetrics()
  }, [])

  const cards = [
    {
      title: 'Active Mandates',
      value: metrics.activeMandates,
      icon: FileText,
      href: '/versotech_main/my-mandates',
      color: 'text-blue-500'
    },
    {
      title: 'Pending Agreements',
      value: metrics.pendingAgreements,
      icon: Handshake,
      href: '/versotech_main/my-introducers',
      color: 'text-amber-500',
      badge: metrics.pendingAgreements > 0
    },
    {
      title: 'Partners',
      value: metrics.totalPartners,
      icon: Users,
      href: '/versotech_main/my-partners',
      color: 'text-emerald-500'
    },
    {
      title: 'Pending Payments',
      value: metrics.pendingPayments,
      icon: Clock,
      href: '/versotech_main/fees',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Arranger Dashboard</h1>
        <p className="text-muted-foreground">Manage your deals, partners, and agreements</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {loading ? '...' : card.value}
                  </div>
                  <div className="flex items-center gap-2">
                    {card.badge && (
                      <Badge variant="secondary">Action needed</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

**Total Estimated Hours: 28**
- Fee Model CRUD (3 entity types): 14 hours
- Send Notifications: 2 hours
- Introducer Agreement Workflow: 4 hours
- Payment Request: 2 hours
- Dashboard: 4 hours
- Page Enhancements: 2 hours

**Priority: HIGH (Arranger required for January 10 per client)**
**Risk: Medium (Multiple integrations)**
**Last Updated:** December 24, 2025 (Developer-Ready)
