# Investor Interest Workflow - Technical Documentation

**Last Updated:** October 18, 2025
**Version:** 2.0 (Post-Consolidation)

---

## Table of Contents

1. [Overview](#overview)
2. [Workflow Types](#workflow-types)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Investor UI Flow](#investor-ui-flow)
7. [Staff Portal Flow](#staff-portal-flow)
8. [Approval Workflow](#approval-workflow)
9. [Automation & Integrations](#automation--integrations)
10. [Status Lifecycle](#status-lifecycle)
11. [Code References](#code-references)

---

## Overview

The Investor Interest Workflow manages how investors express interest in investment opportunities (deals) and how staff processes those interests. The system supports two distinct workflows:

1. **Open Deal Interest** - "I'm Interested" in an active deal (triggers approval workflow)
2. **Closed Deal Signal** - "Notify Me About Similar" opportunities (signal only, no approval)

### Key Principles

- **Single Source of Truth**: All interests stored in `investor_deal_interest` table
- **Automatic Approval Creation**: Open deal interests auto-trigger approval workflow via database trigger
- **Separation of Concerns**: Closed deals bypass approval system entirely
- **Audit Trail**: All actions logged for compliance

---

## Workflow Types

### 1. Open Deal Interest - "I'm Interested"

**When:** Deal status is `active` or `open`
**Purpose:** Investor wants to participate in this specific deal
**Approval Required:** YES

**Flow:**
```
Investor clicks "I'm Interested"
    ↓
Submit interest form (amount, notes)
    ↓
POST /api/deals/[id]/interests
    ↓
Create investor_deal_interest (status='pending_review', is_post_close=false)
    ↓
Database trigger fires: create_deal_interest_approval()
    ↓
Approval record created in approvals table
    ↓
Auto-assigned to Relationship Manager (RM)
    ↓
RM reviews and approves/rejects
    ↓
If approved:
    - Status → 'approved'
    - Create NDA signature task for investor
    - Trigger NDA generation webhook
    - Send notification to investor
    - Track analytics event
```

### 2. Closed Deal Signal - "Notify Me About Similar"

**When:** Deal status is `closed`
**Purpose:** Signal future interest in similar opportunities
**Approval Required:** NO

**Flow:**
```
Investor clicks "Notify Me About Similar"
    ↓
Submit interest form (amount, notes)
    ↓
POST /api/deals/[id]/interests (with is_post_close=true)
    ↓
Create investor_deal_interest (status='approved', is_post_close=true)
    ↓
NO trigger fired (status is not 'pending_review')
    ↓
Record stored for staff visibility
    ↓
Send confirmation notification to investor
    ↓
Track analytics event
```

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      INVESTOR PORTAL                             │
├─────────────────────────────────────────────────────────────────┤
│  • Active Deals Page     /versoholdings/deals                   │
│  • Interest Modal        InterestModal component                │
│  • Deal Detail Page      /versoholdings/deal/[id]              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/deals/[id]/interests    Interest submission          │
│  GET  /api/deals/[id]/interests    Fetch interests (RLS)        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Tables:                                                         │
│    • investor_deal_interest      (main storage)                 │
│    • approvals                   (workflow engine)              │
│    • deal_data_room_access      (NDA tracking)                 │
│    • investor_notifications     (user notifications)            │
│    • tasks                      (action items)                  │
│    • deal_activity_events       (analytics)                     │
│                                                                  │
│  Triggers:                                                       │
│    • on_deal_interest_create_approval                           │
│                                                                  │
│  Functions:                                                      │
│    • create_deal_interest_approval()                            │
│    • auto_assign_approval()                                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STAFF PORTAL                                │
├─────────────────────────────────────────────────────────────────┤
│  • Deal Management           /versotech/staff/deals/[id]        │
│  • Interest Tab              DealInterestTab component          │
│  • Approvals Page            /versotech/staff/approvals         │
│  • Approval Actions          POST /api/approvals/[id]/action    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `investor_deal_interest` Table

**Purpose:** Central table storing all investor interest submissions (both open and closed deals)

```sql
CREATE TABLE investor_deal_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id),

  -- Interest details
  indicative_amount numeric(18,2),
  indicative_currency text,
  notes text,

  -- Status management
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'withdrawn')),
  approval_id uuid REFERENCES approvals(id) ON DELETE SET NULL,

  -- Workflow flag
  is_post_close boolean NOT NULL DEFAULT false,

  -- Timestamps
  submitted_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_investor_deal_interest_deal ON investor_deal_interest(deal_id);
CREATE INDEX idx_investor_deal_interest_investor ON investor_deal_interest(investor_id);
CREATE INDEX idx_investor_deal_interest_status ON investor_deal_interest(status);
CREATE INDEX idx_investor_deal_interest_post_close ON investor_deal_interest(deal_id, is_post_close);

-- Constraint: Post-close interests must be approved
ALTER TABLE investor_deal_interest
ADD CONSTRAINT investor_deal_interest_post_close_must_be_approved
CHECK (NOT is_post_close OR (is_post_close AND status = 'approved'));
```

**Row-Level Security (RLS):**

```sql
-- Investors can see their own interests
CREATE POLICY investor_deal_interest_select ON investor_deal_interest
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = investor_deal_interest.investor_id
      AND iu.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role::text LIKE 'staff_%'
  )
);

-- Investors can insert their own interests
CREATE POLICY investor_deal_interest_insert_investor ON investor_deal_interest
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM investor_users iu
    WHERE iu.investor_id = investor_deal_interest.investor_id
      AND iu.user_id = auth.uid()
  )
);

-- Staff can do anything
CREATE POLICY investor_deal_interest_staff_all ON investor_deal_interest
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role::text LIKE 'staff_%'
  )
);
```

### Database Trigger

**Trigger:** `on_deal_interest_create_approval`
**Function:** `create_deal_interest_approval()`
**When:** AFTER INSERT ON investor_deal_interest
**Condition:** NEW.status = 'pending_review'

```sql
CREATE OR REPLACE FUNCTION create_deal_interest_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_priority text := 'high';
  v_amount numeric;
  v_approval_id uuid;
BEGIN
  -- Only create approval for pending review interests
  IF NEW.status <> 'pending_review' THEN
    RETURN NEW;
  END IF;

  -- Calculate priority based on indicative amount
  v_amount := NEW.indicative_amount;
  IF v_amount IS NOT NULL THEN
    v_priority := CASE
      WHEN v_amount >= 1000000 THEN 'critical'  -- $1M+
      WHEN v_amount >= 250000 THEN 'high'       -- $250K+
      WHEN v_amount >= 50000 THEN 'medium'      -- $50K+
      ELSE 'low'                                 -- < $50K
    END;
  END IF;

  -- Create approval record
  INSERT INTO approvals (
    entity_type,
    entity_id,
    status,
    action,
    priority,
    requested_by,
    related_deal_id,
    related_investor_id,
    entity_metadata
  )
  VALUES (
    'deal_interest',
    NEW.id,
    'pending',
    'approve',
    v_priority,
    NEW.created_by,
    NEW.deal_id,
    NEW.investor_id,
    jsonb_build_object(
      'indicative_amount', NEW.indicative_amount,
      'indicative_currency', NEW.indicative_currency,
      'notes', NEW.notes,
      'submitted_at', NEW.submitted_at,
      'investor_id', NEW.investor_id,
      'deal_id', NEW.deal_id
    )
  )
  RETURNING id INTO v_approval_id;

  -- Link approval back to interest
  UPDATE investor_deal_interest
  SET approval_id = v_approval_id,
      updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;
```

---

## API Endpoints

### POST `/api/deals/[id]/interests`

**Purpose:** Submit investor interest in a deal (both open and closed)

**Authentication:** Required (investor user)

**Request Body:**
```typescript
{
  investor_id?: string      // Optional, defaults to user's linked investor
  indicative_amount?: number // Optional, positive number
  indicative_currency?: string // Optional, max 8 chars (e.g., "USD")
  notes?: string            // Optional, max 4000 chars
  is_post_close?: boolean   // true for closed deals, false for open
}
```

**Validation:**
- User must be linked to an investor
- User must have deal membership (deal_memberships table)
- If indicative_amount provided, must be positive number

**Response:**
```typescript
{
  success: true,
  interest: {
    id: string
    deal_id: string
    investor_id: string
    status: 'pending_review' | 'approved'
    is_post_close: boolean
    // ... other fields
  },
  message: "Interest submitted successfully"
}
```

**Side Effects:**

For **Open Deals** (is_post_close=false):
1. Creates `investor_deal_interest` with `status='pending_review'`
2. Database trigger creates approval record
3. Sends investor notification: "Interest received - awaiting team review"
4. Logs analytics event: `im_interested`
5. Creates audit log entry

For **Closed Deals** (is_post_close=true):
1. Creates `investor_deal_interest` with `status='approved'`, `approved_at=now()`
2. NO trigger fired (bypasses approval)
3. Sends investor notification: "Request received - will notify about similar deals"
4. Logs analytics event: `closed_deal_interest`
5. Creates audit log entry

**File:** [src/app/api/deals/[id]/interests/route.ts](../versotech-portal/src/app/api/deals/[id]/interests/route.ts)

---

### GET `/api/deals/[id]/interests`

**Purpose:** Fetch interests for a deal (RLS-filtered)

**Authentication:** Required (investor or staff)

**Query Parameters:**
- `status` (optional): Filter by status (e.g., `?status=pending_review`)

**Response:**
```typescript
{
  interests: Array<{
    id: string
    deal_id: string
    investor_id: string
    status: string
    is_post_close: boolean
    indicative_amount: number | null
    indicative_currency: string | null
    notes: string | null
    submitted_at: string
    approved_at: string | null
    investors: {
      id: string
      legal_name: string
    }
  }>
}
```

**Access Control:**
- **Investors:** See only their own interests
- **Staff:** See all interests for the deal

**File:** [src/app/api/deals/[id]/interests/route.ts](../versotech-portal/src/app/api/deals/[id]/interests/route.ts)

---

## Investor UI Flow

### Active Deals Page

**Path:** `/versoholdings/deals`
**File:** [src/app/(investor)/versoholdings/deals/page.tsx](../versotech-portal/src/app/(investor)/versoholdings/deals/page.tsx)

**Display Logic:**

```typescript
// Interest status badges
{interest ? (
  interest.is_post_close ? (
    <Badge className="bg-purple-100 text-purple-700">
      Future interest signal
    </Badge>
  ) : (
    <Badge className={interestStatusMeta[interest.status].tone}>
      {interestStatusMeta[interest.status].label}
    </Badge>
  )
) : (
  <span>No signal yet</span>
)}

// Status labels for open deals
const interestStatusMeta = {
  pending_review: { label: 'Pending review', tone: 'bg-amber-100' },
  approved: { label: 'NDA active', tone: 'bg-emerald-100' },
  rejected: { label: 'Declined', tone: 'bg-rose-100' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100' }
}
```

### Interest Modal

**File:** [src/components/deals/interest-modal.tsx](../versotech-portal/src/components/deals/interest-modal.tsx)

**Props:**
```typescript
interface InterestModalProps {
  dealId: string
  dealName: string
  currency?: string | null
  investorId: string
  defaultAmount?: number | null
  isClosed?: boolean        // Determines workflow
  onSubmitted?: () => Promise<void> | void
  children: React.ReactNode // Trigger button
}
```

**UI Differences:**

| Field | Open Deal | Closed Deal |
|-------|-----------|-------------|
| Title | "I'm Interested" | "Notify Me About Similar Deals" |
| Description | "Share a quick signal and the VERSO team will review your interest in [deal]" | "Let the VERSO team know you're interested in similar opportunities to [deal]. We'll notify you when comparable deals become available." |
| Success Message | "Interest submitted - We'll notify you as soon as the team responds" | Same |

**Form Fields:**
1. Indicative Amount (optional)
2. Notes for team (optional)

**Submission:**
```typescript
const payload = {
  investor_id: investorId,
  indicative_amount: numericAmount,
  indicative_currency: currency,
  notes: notes.trim() || undefined,
  is_post_close: isClosed ? true : undefined
}

await fetch(`/api/deals/${dealId}/interests`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
```

---

## Staff Portal Flow

### Deal Management - Interests Tab

**Path:** `/versotech/staff/deals/[id]`
**Component:** `DealInterestTab`
**File:** [src/components/deals/deal-interest-tab.tsx](../versotech-portal/src/components/deals/deal-interest-tab.tsx)

**Data Fetching:**

Server component fetches interests:

```typescript
const { data: interests } = await supabase
  .from('investor_deal_interest')
  .select(`
    *,
    investors (
      id,
      legal_name
    )
  `)
  .eq('deal_id', dealId)
  .order('submitted_at', { ascending: false })
```

**Display Sections:**

Interests are grouped by status and type:

```typescript
const groupedInterests = {
  signals: interests.filter(i => i.is_post_close),
  pending: interests.filter(i => !i.is_post_close && i.status === 'pending_review'),
  approved: interests.filter(i => !i.is_post_close && i.status === 'approved'),
  other: interests.filter(i => !i.is_post_close && !['pending_review', 'approved'].includes(i.status))
}
```

**Rendered Sections:**
1. **Future Interest Signals (Closed Deal)** - Purple badges, shown if any exist
2. **Pending Review** - Yellow badges, awaiting staff action
3. **Approved** - Green badges, NDA workflow in progress
4. **Completed** - Gray badges (rejected/withdrawn)

**Table Columns:**

| Column | Description |
|--------|-------------|
| Investor | Legal name from investors table |
| Action | "I'm Interested" (blue) or "Notify Me About Similar" (purple) |
| Status | PENDING REVIEW / APPROVED / REJECTED / SIGNAL |
| Indicative Amount | Amount + currency or "—" |
| Submitted | Formatted timestamp |

**Link to Approvals:**

```
View related approvals → /versotech/staff/approvals?entity=deal_interest&deal={dealId}
```

---

## Approval Workflow

### Approval Creation (Automatic)

**When:** Insert into `investor_deal_interest` with `status='pending_review'`
**How:** Database trigger `on_deal_interest_create_approval`

**Approval Record:**
```typescript
{
  entity_type: 'deal_interest',
  entity_id: interest.id,
  status: 'pending',
  action: 'approve',
  priority: 'critical' | 'high' | 'medium' | 'low',
  requested_by: user.id,
  related_deal_id: dealId,
  related_investor_id: investorId,
  assigned_to: auto_assigned_rm_id,  // Via auto_assign_approval()
  entity_metadata: {
    indicative_amount,
    indicative_currency,
    notes,
    submitted_at,
    investor_id,
    deal_id
  }
}
```

**Priority Logic:**
- ≥ $1,000,000 → `critical`
- ≥ $250,000 → `high`
- ≥ $50,000 → `medium`
- < $50,000 → `low`

**Auto-Assignment:**

Function `auto_assign_approval()` routes to Relationship Manager:

```sql
-- Deal interest approvals route to RM team
IF NEW.entity_type IN ('deal_interest', 'deal_commitment', 'deal_subscription') THEN
  SELECT id INTO v_assigned_to
  FROM profiles
  WHERE role = 'staff_rm'
  ORDER BY random()  -- Round-robin (simplified)
  LIMIT 1;
END IF;
```

---

### Approval Actions

**Path:** `/versotech/staff/approvals`
**Endpoint:** `POST /api/approvals/[id]/action`
**File:** [src/app/api/approvals/[id]/action/route.ts](../versotech-portal/src/app/api/approvals/[id]/action/route.ts)

**Request:**
```typescript
{
  action: 'approve' | 'reject',
  notes?: string,
  rejection_reason?: string  // Required for reject
}
```

**Authorization Matrix:**

| Role | Can Approve |
|------|-------------|
| `staff_admin` | All approvals |
| `staff_rm` | Approvals assigned to them (unlimited amount) |
| `staff_ops` | Approvals < $50,000 |

---

### Approval Action: APPROVE

**Updates:**
1. Approval: `status='approved'`, `approved_by=user.id`, `approved_at=now()`
2. Interest: `status='approved'`, `approved_at=now()`

**Creates:**

1. **Investor Task - Sign NDA**
   ```typescript
   {
     kind: 'deal_nda_signature',
     category: 'investment_setup',
     title: 'Sign NDA for [deal name]',
     description: 'Please execute the NDA so we can open the data room for this opportunity.',
     due_in_days: 3,
     related_entity_type: 'deal_interest',
     related_entity_id: interest.id,
     deal_id: dealId
   }
   ```

2. **Investor Notification**
   ```typescript
   {
     title: 'Interest approved',
     message: 'Your interest in [deal] has been approved. Review and sign the NDA to unlock the data room.',
     link: '/versoholdings/tasks',
     type: 'deal_interest_approved'
   }
   ```

3. **Automation Webhook Event**
   ```typescript
   {
     event_type: 'nda_generate_request',
     related_deal_id: dealId,
     related_investor_id: investorId,
     payload: {
       approval_id,
       deal_id,
       investor_id,
       indicative_amount,
       indicative_currency
     }
   }
   ```

4. **External Webhook (n8n)**
   ```typescript
   // POST to process.env.AUTOMATION_NDA_GENERATE_URL
   {
     approval_id,
     deal_id,
     investor_id,
     indicative_amount,
     indicative_currency
   }
   ```

5. **Analytics Event**
   ```typescript
   trackDealEvent({
     eventType: 'deal_interest_approved',
     dealId,
     investorId,
     payload: { approval_id, interest_id, indicative_amount }
   })
   ```

6. **Audit Log**
   ```typescript
   auditLogger.log({
     action: 'APPROVE',
     entity: 'approvals',
     entity_id: approval.id,
     metadata: { entity_type: 'deal_interest', decision: 'approve' }
   })
   ```

---

### Approval Action: REJECT

**Updates:**
1. Approval: `status='rejected'`, `rejection_reason=reason`
2. Interest: `status='rejected'`

**Creates:**

1. **Investor Task - Address Rejection**
   ```typescript
   {
     kind: 'other',
     category: 'investment_setup',
     title: 'Address rejected deal_interest request',
     description: 'Your deal_interest request was rejected. Reason: [reason]',
     priority: 'high',
     due_at: 7 days from now
   }
   ```

2. **Audit Log**
   ```typescript
   auditLogger.log({
     action: 'REJECT',
     entity: 'approvals',
     entity_id: approval.id,
     metadata: { entity_type: 'deal_interest', decision: 'reject', rejection_reason }
   })
   ```

---

## Automation & Integrations

### NDA Generation Webhook

**Triggered When:** Interest is approved
**Target:** `process.env.AUTOMATION_NDA_GENERATE_URL` (n8n workflow)

**Payload:**
```json
{
  "approval_id": "uuid",
  "deal_id": "uuid",
  "investor_id": "uuid",
  "indicative_amount": 250000,
  "indicative_currency": "USD"
}
```

**Expected Automation Flow:**
1. Fetch deal and investor details from database
2. Generate NDA document from template
3. Upload to document storage
4. Create document record with signature workflow
5. Send signature request to investor email

**Webhook Event Logging:**

All webhook events are logged in `automation_webhook_events`:

```typescript
{
  event_type: 'nda_generate_request',
  related_deal_id: dealId,
  related_investor_id: investorId,
  payload: { /* webhook payload */ },
  received_at: now()
}
```

---

### Analytics Tracking

**Events Tracked:**

| Event | When | Payload |
|-------|------|---------|
| `im_interested` | Open deal interest submitted | `{ interest_id, indicative_amount, indicative_currency, notes }` |
| `closed_deal_interest` | Closed deal signal submitted | `{ interest_id, indicative_amount, indicative_currency, notes, is_post_close: true }` |
| `deal_interest_approved` | Staff approves interest | `{ approval_id, interest_id, indicative_amount }` |

**Implementation:**

```typescript
await trackDealEvent({
  supabase: serviceSupabase,
  dealId,
  investorId,
  eventType: is_post_close ? 'closed_deal_interest' : 'im_interested',
  payload: { interest_id, indicative_amount, indicative_currency, notes, is_post_close }
})
```

**Storage:** `deal_activity_events` table

---

## Status Lifecycle

### Open Deal Interest Lifecycle

```
┌─────────────────┐
│ PENDING_REVIEW  │ ← Initial state after submission
└────────┬────────┘
         │
         ├─── Staff Approves ──→ ┌──────────┐
         │                       │ APPROVED │
         │                       └──────────┘
         │                            │
         │                            ├─ NDA Task Created
         │                            ├─ Webhook Triggered
         │                            └─ Notification Sent
         │
         ├─── Staff Rejects ───→ ┌──────────┐
         │                       │ REJECTED │
         │                       └──────────┘
         │                            └─ Rejection Task Created
         │
         └─── Investor Cancels ─→ ┌───────────┐
                                  │ WITHDRAWN │
                                  └───────────┘
```

### Closed Deal Signal Lifecycle

```
┌──────────┐
│ APPROVED │ ← Created directly (auto-approved)
└──────────┘
     │
     ├─ is_post_close = true
     ├─ approved_at = submitted_at
     ├─ approval_id = null (no approval workflow)
     └─ Confirmation notification sent
```

**Key Difference:** Closed deals skip the entire approval workflow and are marked approved immediately.

---

## Code References

### Core Files

| Component | File Path | Description |
|-----------|-----------|-------------|
| **API - Interest Submission** | `src/app/api/deals/[id]/interests/route.ts` | POST/GET endpoints for interests |
| **API - Approval Actions** | `src/app/api/approvals/[id]/action/route.ts` | Approve/reject workflow |
| **Investor - Active Deals** | `src/app/(investor)/versoholdings/deals/page.tsx` | Deal listing with interest status |
| **Investor - Interest Modal** | `src/components/deals/interest-modal.tsx` | Interest submission form |
| **Staff - Deal Detail** | `src/app/(staff)/versotech/staff/deals/[id]/page.tsx` | Server component fetching interests |
| **Staff - Interest Tab** | `src/components/deals/deal-interest-tab.tsx` | Interest display/grouping |
| **Migration - Schema** | `supabase/migrations/20251020000000_deal_workflow_phase1.sql` | Initial tables |
| **Migration - Triggers** | `supabase/migrations/20251102093000_deal_workflow_phase1_finish.sql` | Approval triggers |
| **Migration - Fix** | `supabase/migrations/20251018000000_fix_interest_tracking.sql` | is_post_close consolidation |

### Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `create_deal_interest_approval()` | Database (migration) | Trigger function creating approval records |
| `auto_assign_approval()` | Database (migration) | Auto-assigns approvals to staff |
| `executeApprovalActions()` | `api/approvals/[id]/action/route.ts:136` | Handles post-approval workflow |
| `trackDealEvent()` | `lib/analytics.ts` | Logs analytics events |
| `auditLogger.log()` | `lib/audit.ts` | Creates audit trail entries |

---

## Testing Checklist

### Manual Testing - Open Deal Interest

- [ ] Investor can submit interest on open deal
- [ ] Indicative amount field is optional
- [ ] Notes field is optional
- [ ] Investor sees "Pending review" badge after submission
- [ ] Staff sees interest in "Pending Review" section
- [ ] Approval is auto-created in approvals table
- [ ] Approval is assigned to RM automatically
- [ ] Approval shows correct priority based on amount
- [ ] Staff can approve interest
- [ ] After approval, investor sees "NDA active" badge
- [ ] After approval, investor receives notification
- [ ] After approval, investor task is created
- [ ] After approval, webhook event is logged
- [ ] Staff can reject interest
- [ ] After rejection, investor sees "Declined" badge
- [ ] After rejection, investor task is created for next steps

### Manual Testing - Closed Deal Signal

- [ ] Investor can submit signal on closed deal
- [ ] Modal shows "Notify Me About Similar" text
- [ ] Indicative amount field is optional
- [ ] Notes field is optional
- [ ] Investor sees "Future interest signal" badge after submission
- [ ] Staff sees signal in "Future Interest Signals" section
- [ ] NO approval is created
- [ ] Signal shows "SIGNAL" status (not "APPROVED")
- [ ] Investor receives confirmation notification
- [ ] Analytics event is tracked

### Edge Cases

- [ ] User with multiple investor links can submit for correct investor
- [ ] User cannot submit interest for deal they don't have membership in
- [ ] Cannot submit duplicate interest (application-level prevention)
- [ ] Trigger does not fire for post-close interests
- [ ] Constraint prevents post-close interests with non-approved status
- [ ] RLS prevents investors from seeing other investors' interests
- [ ] Staff with insufficient authority cannot approve high-value interests

---

## Migration History

### Version 1.0 (Oct 20, 2025)
- Initial `investor_deal_interest` table
- Separate `investor_interest_signals` table for closed deals
- Basic approval workflow

### Version 2.0 (Oct 18, 2025)
- Added `is_post_close` field to `investor_deal_interest`
- Consolidated closed deal signals into main interest table
- Migrated existing signals from `investor_interest_signals`
- Added database constraint for post-close validation
- Updated UI to distinguish open vs closed deal interests
- Updated staff portal to show separate "Future Interest Signals" section

---

## Future Enhancements

### Potential Improvements

1. **Duplicate Prevention:** Add unique constraint to prevent multiple active interests for same deal+investor
2. **Interest Expiry:** Auto-withdraw interests after deal closes or deadline passes
3. **Interest Amendment:** Allow investors to update indicative amount before approval
4. **Batch Actions:** Allow staff to approve/reject multiple interests at once
5. **Custom Workflows:** Allow deal-specific approval routing rules
6. **Signal Matching:** Automated notification when new deal matches closed-deal signals
7. **Interest Analytics:** Dashboard showing interest conversion rates, time-to-approval metrics

---

## Support & Troubleshooting

### Common Issues

**Issue:** Interest submitted but not appearing in staff portal
**Solution:** Check RLS policies, ensure staff user has correct role

**Issue:** Approval not auto-created for open deal interest
**Solution:** Verify trigger is enabled, check if status is 'pending_review'

**Issue:** Closed deal showing "NDA active" instead of "Future interest signal"
**Solution:** Ensure `is_post_close` field is included in frontend query

**Issue:** Webhook not firing after approval
**Solution:** Check `AUTOMATION_NDA_GENERATE_URL` environment variable is set

---

**Document Maintainer:** Engineering Team
**Last Review:** October 18, 2025
**Next Review:** January 18, 2026
