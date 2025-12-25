# Investor Implementation Plan

**User Type:** Investor
**Current Completion:** 60% (Audit-Verified: December 24, 2025)
**Target Completion:** 95%
**Estimated Hours:** 32 hours
**Last Audit:** December 24, 2025 - Deep Surgical Audit Complete

---

## ⚠️ CRITICAL AUDIT FINDINGS

### 1. Journey Bar: Two Implementations Exist (Confusion Risk)

**Actual State (Verified via Codebase Search):**

| File | Status | Issue |
|------|--------|-------|
| `src/components/deals/investor-journey-bar.tsx` | ✅ BUILT (340 LOC) | Main implementation |
| `src/components/investor/journey-bar.tsx` | ⚠️ ORPHANED | Duplicate, may cause confusion |

**investor-journey-bar.tsx Analysis:**
- Has all 10 stages defined
- Fetches `deal_memberships`, `signature_requests`, `subscriptions`
- Missing: Real-time subscription to updates
- Missing: `pack_generated_at` check (uses existence instead of timestamp)

**Fix Required:** Delete orphaned file, enhance main implementation

### 2. Resale Flow: 0% Complete (NOT 50%)

**Actual State:**
- `investor_sale_requests` table: **DOES NOT EXIST**
- `/api/investor/sell-request/*`: **DOES NOT EXIST**
- Sell button in portfolio: **DOES NOT EXIST**
- Sale status tracker: **DOES NOT EXIST**

**This is a COMPLETE BUILD, not an enhancement.**

### 3. Certificate Generation: ~30% Complete

**What Exists:**
- Document generation pattern exists (NDA, subscription pack)
- Template system works

**What's Missing:**
- `/api/subscriptions/[id]/generate-certificate/route.ts`
- `equity-certificate.html` template
- `statement-of-holding.html` template
- Trigger when subscription becomes 'active'

---

## FEATURE TRUTH TABLE (Audit-Verified)

| Feature | Planned | Exists | Working | Priority |
|---------|---------|--------|---------|----------|
| Investor Persona | ✓ | ✓ | ✓ | - |
| Opportunities Page | ✓ | ✓ | ✓ | - |
| Subscription Flow | ✓ | ✓ | ✓ | - |
| VersaSign Integration | ✓ | ✓ | ✓ | - |
| Portfolio View | ✓ | ✓ | ✓ | - |
| **Journey Bar** | **✓** | **✓** | **85%** | **P1** |
| **Resale Flow** | **✓** | **✗** | **0%** | **P0** |
| **Certificate Generation** | **✓** | **PARTIAL** | **30%** | **P1** |

---

## 1. WHO IS THE INVESTOR?

The Investor is the core user of VERSO - they provide capital to investment opportunities. From user stories (Section 4.Investor, 79 rows):

**Business Role:**
- Browses investment opportunities dispatched to them
- Signs NDAs to access data rooms
- Submits subscription requests with investment amount
- Signs subscription packs (legally binding)
- Funds investments via escrow
- Views portfolio (active positions)
- Receives and views equity certificates
- Can sell investments (secondary sales)
- Tracks all transactions and notifications

**Key Distinction:**
- Investor can be INDIVIDUAL or ENTITY type
- Entity investors have multiple MEMBERS (people)
- Only SIGNATORIES can sign documents
- Multiple signatories = multiple signatures on same document

---

## 2. WHAT ALREADY EXISTS

### 2.1 Database

**Tables (All Exist):**
- `investors` - Main investor account
- `investor_members` - Entity members (with `role = 'authorized_signatory'`)
- `investor_users` - Links profiles to investors
- `investor_counterparties` - Third-party entities for investing through
- `subscriptions` - Investment subscriptions
- `positions` - Active holdings
- `investor_deal_interest` - Interest tracking
- `signature_requests` - Document signing
- `deal_memberships` - Deal access tracking

### 2.2 Pages (Mostly Built)

| Route | Status | Description |
|-------|--------|-------------|
| `/versotech_main/dashboard` | BUILT | Investor dashboard (persona-aware) |
| `/versotech_main/opportunities` | BUILT | Browse deals |
| `/versotech_main/opportunities/[id]` | BUILT | Deal detail |
| `/versotech_main/portfolio` | BUILT | Holdings view |
| `/versotech_main/profile` | BUILT | Profile with KYC |
| `/versotech_main/documents` | BUILT | Document center |
| `/versotech_main/versosign` | BUILT | Signature queue |
| `/versotech_main/inbox` | BUILT | Notifications |
| `/versotech_main/tasks` | BUILT | Tasks |

**What's Missing:**
- Journey bar on opportunity detail
- Resale flow (sell positions)
- Certificate generation trigger

### 2.3 API Routes

| Route | Status |
|-------|--------|
| `/api/investors/me/*` | BUILT |
| `/api/deals/*` | BUILT |
| `/api/subscriptions/*` | BUILT |
| `/api/signature/*` | BUILT |
| `/api/data-room/*` | BUILT |

### 2.4 Components

| Component | Status |
|-----------|--------|
| `components/dashboard/investor-dashboard.tsx` | BUILT |
| `components/investor/*` | PARTIAL |
| `components/deals/*` | BUILT |
| `components/subscriptions/*` | BUILT |
| `components/signature/*` | BUILT |

---

## 3. WHAT'S MISSING

### 3.1 Journey Bar (10-Stage Progress Visualization)

**User Stories Requiring This:**
- All of Section 4.2 (My Opportunities) requires tracking progress

**The 10 Stages:**

| Stage | Description | Data Source | Required? |
|-------|-------------|-------------|-----------|
| 1. Received | IO dispatched to investor | `deal_memberships.dispatched_at` | Optional |
| 2. Viewed | Investor opened deal | `deal_memberships.viewed_at` | Optional |
| 3. Interest Confirmed | Expressed interest | `investor_deal_interest` | Optional |
| 4. NDA Signed | All signatories signed NDA | `signature_requests` WHERE type='nda' | Optional |
| 5. Data Room Access | Access granted | `deal_data_room_access.granted_at` | Optional |
| 6. Pack Generated | Subscription pack created | `deal_subscription_submissions.pack_generated_at` | Required |
| 7. Pack Sent | Pack sent for signature | `signature_requests.email_sent_at` | Required |
| 8. Signed | All signatories signed pack | `signature_requests` WHERE type='subscription' | Required |
| 9. Funded | Money received | `subscriptions.funded_amount > 0` | Required |
| 10. Active | Investment active | `subscriptions.status = 'active'` | Required |

**Why Optional Stages Exist:**
- Investor can subscribe DIRECTLY from deal card without going through Interest/NDA/Data Room
- Journey bar shows actual state, not enforced order
- Skipped stages shown as dimmed/dotted

### 3.2 Resale Flow (Secondary Sales)

**User Stories (Section 4.5):**

| Row | Story | Status |
|-----|-------|--------|
| 66 | Sell quantity of shares from position | MISSING |
| 67 | Receive notification when subscription pack dispatched | MISSING |
| 68 | Receive notification when transaction completed | MISSING |
| 69 | Receive notification when payment completed | MISSING |
| 70 | Send update on sales transaction | MISSING |

**Business Flow:**
1. Investor clicks "Sell" on a position
2. Enters quantity/amount to sell
3. System notifies CEO
4. CEO creates new IO for the shares
5. CEO finds buyer
6. Buyer goes through subscription process
7. Lawyer processes payment to seller
8. Shareholding positions update for both parties

### 3.3 Certificate Generation

**User Stories (Section 4.2.7-4.2.8):**

| Row | Story | Status |
|-----|-------|--------|
| 43 | Receive notification when certificate available | PARTIAL |
| 44 | View Equity Certificates per Opportunity | PARTIAL |
| 45 | Receive notification when Statement of Holding available | PARTIAL |
| 46 | View Statement of Holding per Opportunity | PARTIAL |

**What's Needed:**
- Trigger certificate generation when `subscription.status = 'active'`
- Use same document generation pattern as NDA/subscription pack
- Store in documents, notify investor

---

## 4. IMPLEMENTATION TASKS

### Task 1: Journey Bar Component (8 hours)

**Files to Create:**

```
src/components/investor/journey-bar.tsx
src/lib/investor/journey-status.ts
src/app/api/investor/journey-status/[dealId]/route.ts
```

**Journey Bar Component:**

```typescript
// journey-bar.tsx
interface JourneyStage {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'skipped';
  timestamp?: Date;
  required: boolean;
}

// Visual: 
// [Received] → [Viewed] → [Interest] → [NDA] → [DataRoom] → [Pack Gen] → [Pack Sent] → [Signed] → [Funded] → [Active]
//    ✓           ✓          ⊘           ⊘         ⊘            ✓           ✓           🔵         ○          ○
// (completed) (completed) (skipped)  (skipped) (skipped) (completed) (completed) (current)  (pending) (pending)
```

**API Route:**

```typescript
// GET /api/investor/journey-status/[dealId]
// Returns: { stages: JourneyStage[], currentStage: number }

// Query logic:
// 1. Get deal_membership for this investor+deal
// 2. Get signature_requests for NDA and subscription
// 3. Get subscription status
// 4. Compute each stage's status
```

**Integration:**
- Add to `/versotech_main/opportunities/[id]/page.tsx`
- Show below deal header, above tabs
- Real-time updates via subscription

### Task 2: Resale Flow (24 hours)

**Files to Create:**

```
src/app/(main)/versotech_main/portfolio/[id]/sell/page.tsx
src/app/api/investor/sell-request/route.ts
src/app/api/investor/sell-request/[id]/route.ts
src/app/api/deals/[id]/resale/route.ts
src/components/investor/sell-position-form.tsx
src/components/investor/sale-status-tracker.tsx
```

**Database Changes:**

```sql
-- New table for tracking sales
CREATE TABLE investor_sale_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id),
  position_id UUID REFERENCES positions(id),
  subscription_id UUID REFERENCES subscriptions(id),
  quantity_to_sell INTEGER,
  amount_to_sell NUMERIC(18,2),
  asking_price_per_unit NUMERIC(18,4),
  status TEXT CHECK (status IN ('pending', 'approved', 'matched', 'in_progress', 'completed', 'cancelled')),
  matched_buyer_id UUID REFERENCES investors(id),
  matched_deal_id UUID REFERENCES deals(id),
  payment_completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Sell Request Form:**
- Select position to sell from
- Enter quantity OR amount (calculated)
- Optional: Set asking price
- Submit creates request + notifies CEO

**CEO Actions:**
- See sell requests in dashboard/inbox
- Create new IO for the shares
- Link buyer subscription to seller
- Assign lawyer for payment

**Position Update Logic:**
- Seller: `positions.units -= sold_quantity`
- Buyer: New position created via normal subscription flow

### Task 3: Certificate Generation (4 hours)

**Files to Create:**

```
src/app/api/subscriptions/[id]/generate-certificate/route.ts
src/lib/documents/certificate-generator.ts
src/templates/equity-certificate.html
src/templates/statement-of-holding.html
```

**Trigger:**
- When `subscription.status` changes to `'active'`
- Automatic via database trigger OR
- API call from funding confirmation

**Certificate Template:**
- Similar to subscription pack
- Placeholders: investor name, shares, deal name, date, signatures
- CEO signature block (auto-signed like NDA)

**Storage:**
- Save to `documents` table
- Link to subscription
- Notify investor

---

## 5. USER STORIES COVERAGE CHECK

### Fully Implemented

| Section | Stories | Status |
|---------|---------|--------|
| 4.1 My Profile | Rows 2-14 | COMPLETE |
| 4.2.1-4.2.5 Opportunities, DataRoom, Subscription | Rows 15-39 | COMPLETE |
| 4.2.6 Funding | Rows 40-42 | COMPLETE |
| 4.3 My Investments (View) | Rows 47-51 | COMPLETE |
| 4.4 My Notifications | Rows 63-65 | COMPLETE |

### Needs Work

| Section | Stories | Status | This Plan |
|---------|---------|--------|-----------|
| 4.2.7-4.2.8 Certificates | Rows 43-46 | PARTIAL | Task 3 |
| 4.3.7 Conversion Event | Rows 52-54 | DEFERRED | Post-launch |
| 4.3.8 Redemption Event | Rows 55-62 | DEFERRED | Post-launch |
| 4.5 Resell | Rows 66-70 | MISSING | Task 2 |
| 4.6 GDPR | Rows 71-80 | MISSING | See CEO plan |

---

## 6. TESTING CHECKLIST

### Investor Flow Tests

- [ ] Login as investor → Investor dashboard shows
- [ ] View opportunities → List displays dispatched deals
- [ ] Open opportunity → Journey bar shows correct stage
- [ ] Journey bar updates as stages complete
- [ ] Submit subscription → Pack generated, sent for signature
- [ ] Sign subscription → Status updates to 'signed'
- [ ] View portfolio → Active positions display
- [ ] Click sell on position → Sell form opens
- [ ] Submit sell request → CEO notified
- [ ] Certificate generated when funded → Investor notified

### Entity Investor Tests

- [ ] Entity with 3 signatories → NDA creates 3 signature requests
- [ ] All sign NDA → Data room access granted
- [ ] Subscription pack → 1 pack with 3 signature blocks
- [ ] All sign pack → Status updates to 'signed'

---

## 7. DEPENDENCIES

**Requires Before Implementation:**
- None (investor is core flow)

**Blocks Other Features:**
- Partner/Introducer/CP investor access (uses same journey)
- Resale requires CEO and Lawyer involvement

---

## 8. FILES SUMMARY

### To Create (12 files)

```
src/components/investor/journey-bar.tsx
src/lib/investor/journey-status.ts
src/app/api/investor/journey-status/[dealId]/route.ts

src/app/(main)/versotech_main/portfolio/[id]/sell/page.tsx
src/app/api/investor/sell-request/route.ts
src/app/api/investor/sell-request/[id]/route.ts
src/app/api/deals/[id]/resale/route.ts
src/components/investor/sell-position-form.tsx
src/components/investor/sale-status-tracker.tsx

src/app/api/subscriptions/[id]/generate-certificate/route.ts
src/lib/documents/certificate-generator.ts
src/templates/equity-certificate.html
src/templates/statement-of-holding.html
```

### To Modify (2 files)

```
src/app/(main)/versotech_main/opportunities/[id]/page.tsx
  - Add journey bar component

src/app/(main)/versotech_main/portfolio/page.tsx
  - Add "Sell" button to position cards
```

### Database Migration (1 file)

```
supabase/migrations/YYYYMMDD_investor_sale_requests.sql
```

---

## 9. ACCEPTANCE CRITERIA

1. **Journey Bar:**
   - [ ] Shows 10 stages with correct status
   - [ ] Skipped optional stages shown as dotted/dimmed
   - [ ] Current stage highlighted in blue
   - [ ] Completed stages green with checkmark
   - [ ] Updates in real-time when status changes

2. **Resale:**
   - [ ] Investor can submit sell request from portfolio
   - [ ] CEO receives notification of sell request
   - [ ] CEO can create IO for the shares
   - [ ] Buyer completes subscription → Payment to seller triggered
   - [ ] Both positions update correctly

3. **Certificates:**
   - [ ] Certificate generated when subscription becomes active
   - [ ] Investor notified when certificate ready
   - [ ] Certificate downloadable from documents
   - [ ] Shows correct investor name, shares, deal info

---

## 10. DEVELOPER-READY IMPLEMENTATION CODE

### 10.1 Resale Database Migration

**File: `supabase/migrations/YYYYMMDD_investor_sale_requests.sql`**

```sql
-- Investor Sale Requests Table
-- Tracks secondary sale requests from investors

CREATE TABLE IF NOT EXISTS investor_sale_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investors(id),
  position_id UUID REFERENCES positions(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  deal_id UUID REFERENCES deals(id),
  vehicle_id UUID REFERENCES vehicles(id),

  -- What they want to sell
  quantity_to_sell INTEGER,
  amount_to_sell NUMERIC(18,2),
  asking_price_per_unit NUMERIC(18,4),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'matched', 'in_progress', 'completed', 'cancelled', 'rejected')),

  -- Matching info (filled by CEO)
  matched_buyer_id UUID REFERENCES investors(id),
  matched_deal_id UUID REFERENCES deals(id), -- New IO created for resale
  matched_at TIMESTAMPTZ,

  -- Completion
  payment_completed_at TIMESTAMPTZ,
  transfer_completed_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  rejection_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sale_requests_investor ON investor_sale_requests(investor_id);
CREATE INDEX idx_sale_requests_status ON investor_sale_requests(status);
CREATE INDEX idx_sale_requests_subscription ON investor_sale_requests(subscription_id);

-- RLS
ALTER TABLE investor_sale_requests ENABLE ROW LEVEL SECURITY;

-- Investor can view and create their own requests
CREATE POLICY "Investors can view own sale requests"
  ON investor_sale_requests FOR SELECT
  USING (
    investor_id IN (
      SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can create own sale requests"
  ON investor_sale_requests FOR INSERT
  WITH CHECK (
    investor_id IN (
      SELECT investor_id FROM investor_users WHERE user_id = auth.uid()
    )
  );

-- Staff can view and manage all
CREATE POLICY "Staff can manage all sale requests"
  ON investor_sale_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff_admin', 'ceo')
    )
  );

-- Updated at trigger
CREATE TRIGGER update_sale_requests_updated_at
  BEFORE UPDATE ON investor_sale_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 10.2 Sell Request API Route

**File: `src/app/api/investor/sell-request/route.ts`**

```typescript
/**
 * Investor Sell Request API
 * POST /api/investor/sell-request - Create sell request
 * GET /api/investor/sell-request - Get investor's sell requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const sellRequestSchema = z.object({
  subscription_id: z.string().uuid(),
  quantity_to_sell: z.number().int().positive().optional(),
  amount_to_sell: z.number().positive().optional(),
  asking_price_per_unit: z.number().positive().optional(),
  notes: z.string().optional()
}).refine(
  data => data.quantity_to_sell || data.amount_to_sell,
  { message: 'Either quantity or amount must be specified' }
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get investor_id
    const { data: investorUser } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single();

    if (!investorUser) {
      return NextResponse.json({ error: 'Not an investor' }, { status: 403 });
    }

    const body = await request.json();
    const validation = sellRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.issues
      }, { status: 400 });
    }

    // Verify subscription belongs to investor and is active
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, deal_id, vehicle_id, commitment, status')
      .eq('id', validation.data.subscription_id)
      .eq('investor_id', investorUser.investor_id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({
        error: 'Subscription not found or not eligible for sale'
      }, { status: 400 });
    }

    // Check for existing pending request
    const { data: existing } = await supabase
      .from('investor_sale_requests')
      .select('id')
      .eq('subscription_id', subscription.id)
      .in('status', ['pending', 'approved', 'matched', 'in_progress'])
      .single();

    if (existing) {
      return NextResponse.json({
        error: 'You already have a pending sale request for this position'
      }, { status: 400 });
    }

    // Create sell request
    const { data: sellRequest, error } = await supabase
      .from('investor_sale_requests')
      .insert({
        investor_id: investorUser.investor_id,
        subscription_id: subscription.id,
        deal_id: subscription.deal_id,
        vehicle_id: subscription.vehicle_id,
        quantity_to_sell: validation.data.quantity_to_sell,
        amount_to_sell: validation.data.amount_to_sell,
        asking_price_per_unit: validation.data.asking_price_per_unit,
        notes: validation.data.notes,
        created_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create sell request:', error);
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }

    // Create task for CEO
    await supabase.from('tasks').insert({
      kind: 'sale_request_review',
      title: 'Investor Sale Request',
      description: `Investor wants to sell position in subscription ${subscription.id}`,
      status: 'pending',
      priority: 'medium',
      related_entity_type: 'sale_request',
      related_entity_id: sellRequest.id,
      assigned_to_role: 'staff_admin'
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      event_type: 'resale',
      action: 'sale_request_submitted',
      entity_type: 'sale_request',
      entity_id: sellRequest.id,
      actor_id: user.id,
      action_details: {
        subscription_id: subscription.id,
        quantity: validation.data.quantity_to_sell,
        amount: validation.data.amount_to_sell
      },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ data: sellRequest }, { status: 201 });

  } catch (error) {
    console.error('Sell request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: investorUser } = await supabase
      .from('investor_users')
      .select('investor_id')
      .eq('user_id', user.id)
      .single();

    if (!investorUser) {
      return NextResponse.json({ error: 'Not an investor' }, { status: 403 });
    }

    const { data: requests } = await supabase
      .from('investor_sale_requests')
      .select(`
        *,
        subscription:subscriptions(id, commitment, currency, vehicle:vehicles(name)),
        deal:deals(id, name)
      `)
      .eq('investor_id', investorUser.investor_id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ data: requests || [] });

  } catch (error) {
    console.error('Get sell requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 10.3 Sell Position Form Component

**File: `src/components/investor/sell-position-form.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface SellPositionFormProps {
  subscriptionId: string
  maxAmount: number
  currency: string
  dealName: string
}

export function SellPositionForm({
  subscriptionId,
  maxAmount,
  currency,
  dealName
}: SellPositionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [askingPrice, setAskingPrice] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (parseFloat(amount) > maxAmount) {
      toast.error(`Amount cannot exceed ${maxAmount} ${currency}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/investor/sell-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          amount_to_sell: parseFloat(amount),
          asking_price_per_unit: askingPrice ? parseFloat(askingPrice) : undefined,
          notes: notes || undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit request')
      }

      toast.success('Sale request submitted successfully')
      router.push('/versotech_main/portfolio')
      router.refresh()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sell Position</CardTitle>
        <CardDescription>
          Request to sell your position in {dealName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sale requests are subject to review and matching with a buyer.
            The process may take several weeks to complete.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Sell ({currency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max: ${maxAmount.toLocaleString()}`}
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum sellable: {maxAmount.toLocaleString()} {currency}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="askingPrice">Asking Price per Unit (Optional)</Label>
            <Input
              id="askingPrice"
              type="number"
              step="0.0001"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="Leave blank for market price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information for the sale..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Sale Request
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 10.4 Journey Bar Enhancement Note

**The journey bar component already exists at:**
`src/components/deals/investor-journey-bar.tsx` (340 LOC)

**To use it, import and add to opportunity detail page:**

```typescript
// In src/app/(main)/versotech_main/opportunities/[id]/page.tsx
import { InvestorJourneyBar } from '@/components/deals/investor-journey-bar'

// Inside the component, add after deal header:
<InvestorJourneyBar
  summary={{
    received: membership?.dispatched_at,
    viewed: membership?.viewed_at,
    interest_confirmed: interest?.created_at,
    nda_signed: ndaSignature?.signed_at,
    data_room_access: dataRoomAccess?.granted_at,
    pack_generated: subscription?.pack_generated_at,
    pack_sent: subscriptionSignature?.email_sent_at,
    signed: subscription?.signed_at,
    funded: subscription?.funded_at,
    active: subscription?.status === 'active' ? subscription.updated_at : null,
  }}
/>
```

---

**Total Estimated Hours: 32**
- Resale Migration + API: 16 hours
- Sell Form + UI: 8 hours
- Journey Bar Integration: 4 hours
- Certificate Generation: 4 hours

**Priority: HIGH (Journey bar and resale are P0 per user)**
**Risk: Medium (Resale involves multiple parties)**
**Last Updated:** December 24, 2025 (Developer-Ready)
