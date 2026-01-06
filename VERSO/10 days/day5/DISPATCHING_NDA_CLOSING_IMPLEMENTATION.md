# Dispatching Logic, NDA Access Rules, and Closing Date Implementation

**Document Created**: January 5, 2026
**Based on**: Meeting with Fred (meeting2.md)
**Purpose**: Complete specification for implementation

---

## ⚠️ CROSS-REFERENCE: Fee System Document

**IMPORTANT**: This document works in conjunction with:
`FEE_SYSTEM_ANALYSIS_AND_REFACTORING_PLAN.md` (same folder)

### Responsibility Split:

| This Document (DISPATCHING) | Fee System Document |
|----------------------------|---------------------|
| `assigned_fee_plan_id` on `deal_memberships` | `term_sheet_id` on `fee_plans` |
| Dispatch validation logic | Acceptance columns (`accepted_at`, `accepted_by`) |
| Fee plan query endpoint for dispatch UI | Status enum (`accepted` not `accepted`) |
| Dispatch modal UI with fee plan selection | Acceptance API (`/api/fee-plans/[id]/accept`) |
| NDA/Data Room persona-based access rules | Deal close handler (`handleDealClose()`) |
| | Remove auto-sync, value validation |

**STATUS ALIGNMENT**: Both documents use `status = 'accepted'` (not 'accepted')

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Dispatching Logic](#dispatching-logic)
   - [Dispatch Type 1: Fee Model to Entity](#dispatch-type-1-fee-model-to-entity)
   - [Dispatch Type 2: Term Sheet to Investor](#dispatch-type-2-term-sheet-to-investor)
3. [NDA and Data Room Access Rules](#nda-and-data-room-access-rules)
4. [Closing Date Rule](#closing-date-rule)
5. [Implementation Checklist](#implementation-checklist)
6. [Database Changes](#database-changes)
7. [API Endpoints](#api-endpoints)
8. [UI Changes](#ui-changes)

---

## Executive Summary

Based on Fred's meeting, three interconnected systems need implementation:

| System | Key Rule |
|--------|----------|
| **Dispatching** | Two-phase: (1) Fee model approval, (2) Investor dispatch |
| **NDA/Data Room** | Access varies by persona - some get none, some need NDA, arranger is automatic |
| **Closing Date** | Certificate & invoice only after CEO confirms closing (NOT when funded) |

**Critical Business Rule:**
> "Before you dispatch to any investor, the partner needs to agree on a fee model" - Fred

---

## Dispatching Logic

### Overview: Two Dispatch Types

```
DISPATCH TYPE 1: Fee Model → Entity
(Must happen FIRST - entity must approve before investor dispatch)

         ┌─────────────────┐
         │  CEO creates    │
         │   Fee Plan      │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌───────┐   ┌─────────┐   ┌────────────┐
│Partner│   │Introducer│  │Commercial  │
│       │   │         │   │Partner     │
└───┬───┘   └────┬────┘   └─────┬──────┘
    │            │              │
    ▼            ▼              ▼
 Accept/     Sign          Sign
 Reject    Agreement     Agreement
    │            │              │
    └────────────┼──────────────┘
                 ▼
         Fee Plan Status:
         'accepted'


DISPATCH TYPE 2: Term Sheet → Investor
(Can only happen AFTER entity has accepted fee model)

         ┌─────────────────┐
         │  Staff selects  │
         │    Investor     │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Select referrer │
         │(partner/intro/CP)│
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ VALIDATION:     │
         │ Fee plan        │
         │ accepted?       │
         └────────┬────────┘
                  │
         ┌───────┴───────┐
         │               │
         ▼               ▼
       NO              YES
    ┌──────┐        ┌──────┐
    │BLOCK │        │CREATE│
    │Error │        │member│
    └──────┘        └──────┘
```

---

### Dispatch Type 1: Fee Model to Entity

#### 1.1 Introducer Dispatch (Requires Agreement Signature)

**Fred's Quote:**
> "CEO create introducer agreement. Dispatch agreement to introducer. Introducer reviews, can add comments. Approve sign digitally. CEO counter sign agreement active."

**Workflow:**
```
Step 1: CEO creates fee plan for deal
        - Links to deal_id and term_sheet
        - Links to introducer_id

Step 2: CEO generates introducer_agreement document
        - Based on fee plan terms
        - Uses agreement template

Step 3: CEO signs agreement FIRST
        - Pre-signature before dispatch
        - Fred: "when the document is sent for the other party to sign it the CEO already signed"

Step 4: System dispatches to introducer
        - Creates signature_request
        - Sends notification
        - Fee plan status: 'sent'

Step 5: Introducer reviews
        - Can view fee terms
        - Can add comments

Step 6: Introducer signs digitally
        - Using signature workflow (/app/sign/[token])

Step 7: Fee plan becomes accepted
        - fee_plan.status = 'accepted'
        - fee_plan.accepted_at = now()
        - Links to introducer_agreement.id
```

#### 1.2 Partner Dispatch (Approval WITHOUT Agreement Document)

**Fred's EXACT Quote:**
> "So it's the same as an introducer. So you before you dispatch to any investor the partner needs to agree on a fee model."
> "There's not there's just not an agreement. We don't need to formalize it with an agreement but there is still a fee models between a partner and a term sheet within an investment opportunity."

**Key Insight:** Partners MUST approve/agree to fee model, but do NOT sign a formal document.

**Workflow:**
```
Step 1: CEO creates fee plan for deal
        - Links to deal_id and term_sheet
        - Links to partner_id

Step 2: System sends fee plan to partner
        - Notification sent
        - Fee plan status: 'sent'

Step 3: Partner reviews fee terms
        - Views subscription fee %, management fee %, performance fee %
        - Can see rate calculations

Step 4: Partner responds: ACCEPT or REJECT
        - No signature required
        - Simple button click
        - Can add optional comments

Step 5: On ACCEPT:
        - fee_plan.status = 'accepted'
        - fee_plan.accepted_at = now()
        - fee_plan.accepted_by = partner_user_id

Step 6: On REJECT:
        - fee_plan.status = 'rejected'
        - CEO can create new fee plan or negotiate
```

#### 1.3 Commercial Partner Dispatch (Requires Placement Agreement)

**Fred's Quote:**
> "Is there some kind of an agreement there with also commercial partner? ...there needs to be a signature is true."

**Workflow:** Same as Introducer, but uses `placement_agreement` instead of `introducer_agreement`

```
Step 1: CEO creates fee plan for deal
        - Links to deal_id and term_sheet
        - Links to commercial_partner_id

Step 2: CEO generates placement_agreement document

Step 3: CEO signs agreement FIRST

Step 4: System dispatches to commercial partner
        - Fee plan status: 'sent'

Step 5: Commercial partner reviews and signs

Step 6: Fee plan accepted
        - fee_plan.status = 'accepted'
```

---

### Dispatch Type 2: Term Sheet to Investor

#### Prerequisites
- Referring entity (partner/introducer/commercial_partner) MUST have accepted fee plan
- Without this, dispatch is BLOCKED

#### Fred's Quote:
> "When you dispatch the term sheet to an investor, you need to associate the introducer. And in the database data model, the fee model is associated to a term sheet and to an introducer. So automatically the system associates a term sheet with an investor, with an introducer and with a fee model at the time of dispatch."

#### Dispatch Payload Requirements

```typescript
// POST /api/deals/:id/dispatch
{
  user_ids: string[],              // Investors to dispatch
  role: 'investor' | 'partner_investor' | 'introducer_investor' | 'commercial_partner_investor',

  // When role is *_investor, these are REQUIRED:
  referred_by_entity_id: string,   // UUID of partner/introducer/commercial_partner
  referred_by_entity_type: 'partner' | 'introducer' | 'commercial_partner',
  assigned_fee_plan_id: string     // MUST be accepted fee plan for this entity
}
```

#### Validation Logic (MUST IMPLEMENT)

```typescript
// In dispatch API:
if (referred_by_entity_id) {
  // 1. Query accepted fee plans for this entity + deal
  const acceptedFeePlans = await supabase
    .from('fee_plans')
    .select('id')
    .eq('deal_id', dealId)
    .eq('status', 'accepted')
    .eq('is_active', true)
    .or(`
      partner_id.eq.${referred_by_entity_id},
      introducer_id.eq.${referred_by_entity_id},
      commercial_partner_id.eq.${referred_by_entity_id}
    `);

  // 2. Block if no accepted fee plans
  if (!acceptedFeePlans || acceptedFeePlans.length === 0) {
    return error(400,
      'Cannot dispatch investor: No accepted fee plan found for this entity. ' +
      'The partner/introducer must approve a fee model before investors can be dispatched.'
    );
  }

  // 3. Validate assigned_fee_plan_id is in the list
  if (!assigned_fee_plan_id || !acceptedFeePlans.find(fp => fp.id === assigned_fee_plan_id)) {
    return error(400, 'Invalid or missing fee plan selection');
  }

  // 4. Store in deal_membership
  membership.assigned_fee_plan_id = assigned_fee_plan_id;
}
```

---

## NDA and Data Room Access Rules

### Access Matrix

| Persona | Sees Term Sheet? | Data Room Access? | NDA Required? | Access Trigger |
|---------|-----------------|-------------------|---------------|----------------|
| **Investor** | YES | After NDA signed | YES | Sign NDA in platform |
| **Partner** | YES | After NDA signed | YES | Sign NDA in platform |
| **Introducer** | **NO** | **NEVER** | N/A | N/A |
| **Commercial Partner** | YES | After NDA signed | YES | Sign NDA in platform |
| **Arranger** | YES | YES (automatic) | **NO** | Assigned at vehicle level |
| **Lawyer** | **NO** | **NEVER** | N/A | N/A |

### Fred's Exact Quotes

**Introducer:**
> "The term sheet was supposed to be hidden for the introducer."
> "Normally you are not supposed as an introducer to get access data room."

**Partner:**
> "Partner has access. So partner will need to sign an NDA."
> "I want to display the list of opportunity I was notified to as a partner - access room only if NDA signed."

**Commercial Partner:**
> "Commercial partner has access. So commercial partner will need to sign an NDA."

**Arranger:**
> "The arranger doesn't need to sign an NDA so it's automatic."
> "When you create a vehicle with an investment opportunity in it you need to define who is the arranger."

**Lawyer:**
> "For the lawyer we didn't it was hidden. There was no possibility to ask to get access to it."
> "He will not have access to the data room but you will see that there is an investment opportunity."
> "He should only get notifications once a pack is signed."

### Implementation Notes

#### For Introducers:
- Hide `term_sheet` section on opportunity detail page
- Remove "Request Data Room Access" button
- Remove NDA workflow
- Only show: deal name, status, their referred investors' progress

#### For Lawyers:
- Hide `term_sheet` section on opportunity detail page
- Remove data room entirely
- Only show notifications when subscription pack is signed
- Show: deal name, status, signing-related info only

#### For Arranger:
- Defined at **vehicle level** (not deal level)
- When vehicle is created, arranger is assigned
- Arranger automatically has access to:
  - All term sheets in that vehicle
  - All data rooms for deals in that vehicle
  - No NDA required

#### For Partners/Commercial Partners/Investors:
- Show NDA requirement before data room access
- Track NDA signing: `deal_data_room_access.nda_signed_at`
- Only show data room content after NDA signed

---

## Closing Date Rule

### Current (WRONG) Behavior
```
Subscription fully funded → Certificate generated → Invoice unlocked
```

### Correct Behavior (Fred's Rule)
```
Subscription fully funded → WAIT
                              ↓
CEO confirms deal closing → Certificate generated → Invoice unlocked
```

### Fred's Quotes

> "It's at the closing that we should request the invoice from the introducer or from the partner. It's not when the subscription is fully funded. It's actually when the opportunity is closed."

> "We need the fact that we receive the funds is not always enough for us to say this is done. So, we need to receive the money AND receive confirmation from the investor that we are sourcing the shares that everything is in order. Once the closing is done, then we have received the money. We have received confirmation that we have the shares."

> Q: "Is there an approval for the CEO?"
> A: "Yeah there should be an approval for the CEO. So we should trigger a closing date confirmation by the CEO."

> Q: "So on closing date an approval will be triggered and created for the CEO. Once that approval is agreed upon then the portfolio is created and a certificate is created and sent to the investor. Is that correct?"
> A: "Yes. And the invoices are requested by the arranger to the introducer partners."

### Closing Workflow

```
1. Deal has closing_date set (on deal or term sheet)

2. When closing_date arrives OR staff initiates:
   - System creates approval task for CEO
   - Type: 'deal_closing'
   - Shows: deal info, funded subscriptions, total amounts

3. CEO reviews approval:
   - Sees all funded subscriptions
   - Confirms we received the money
   - Confirms we secured the shares

4. CEO approves closing → TRIGGERS:
   a. For each funded subscription:
      - Portfolio/position created
      - Certificate generated
      - Certificate sent to investor

   b. For each introducer/partner/commercial partner with commissions:
      - Invoice submission unlocked
      - Notification: "You can now submit invoice for [deal]"

   c. Lawyer notification:
      - "Deal [name] has closed"

5. If CEO rejects:
   - Potential refund workflow
   - Deal status updated
   - Notifications sent
```

### Database/API Changes for Closing

```sql
-- Option 1: Add to deals table
ALTER TABLE deals
ADD COLUMN closing_confirmed_at timestamptz,
ADD COLUMN closing_confirmed_by uuid REFERENCES profiles(id);

-- Option 2: Use existing approvals system
-- Create approval with entity='deal', action='closing_confirmation'
```

---

## Implementation Checklist

### Phase 1: Database Changes

- [ ] Add `assigned_fee_plan_id` to `deal_memberships`
- [ ] Ensure `fee_plans` has: `status`, `accepted_at`, `accepted_by`
- [ ] Add closing confirmation fields to `deals`
- [ ] Create indexes for performance

### Phase 2: Fee Model Dispatch (Type 1)

- [ ] **Partner approval endpoint** (no signature)
  - `POST /api/partners/me/fee-plans/:id/respond`
  - Accept/reject with optional comments

- [ ] **Introducer agreement workflow**
  - Generate agreement document
  - CEO pre-signature
  - Dispatch to introducer
  - Track signature completion

- [ ] **Commercial partner placement agreement**
  - Same flow as introducer

### Phase 3: Investor Dispatch (Type 2)

- [ ] **Dispatch validation**
  - Check fee plan status = 'accepted'
  - Block if not approved
  - Return helpful error message

- [ ] **Store assigned_fee_plan_id**
  - Include in deal_membership record

- [ ] **Update dispatch UI**
  - Show fee plan status per entity
  - Require selection
  - Block button if no approved plan

### Phase 4: NDA/Data Room Access ✅ COMPLETED

- [x] **Hide term sheet for introducers** ✅
  - API: `GET /api/investors/me/opportunities/:id` filters `fee_structures` for role='introducer'
  - Frontend: Checks `access_controls.can_view_term_sheet` before rendering

- [x] **Hide data room for introducers** ✅
  - API: Sets `hasDataRoomAccess = false` for role='introducer'
  - Frontend: Hides Data Room tab and "Request Access" button
  - New `access_controls.can_view_data_room` flag

- [x] **Same for lawyers** ✅
  - Same API logic for role='lawyer'
  - Same frontend checks

- [x] **Auto-access for arrangers** ✅
  - API: Sets `hasDataRoomAccess = true` for role='arranger' (no NDA check)
  - Frontend: Shows "Auto-granted (Arranger)" badge
  - New `access_controls.has_auto_data_room_access` flag

**Files Modified:**
- `src/app/api/investors/me/opportunities/[id]/route.ts` - Role-based filtering
- `src/app/(main)/versotech_main/opportunities/[id]/page.tsx` - UI hiding/showing

### Phase 5: Closing Date Rule

- [ ] **Closing approval workflow**
  - Create approval task on closing date
  - CEO reviews and confirms

- [ ] **Post-closing triggers**
  - Certificate generation
  - Portfolio creation
  - Invoice unlock for introducers/partners

- [ ] **Remove triggers from funding**
  - Certificate NOT on funding
  - Invoice NOT on funding

---

## Database Changes

### deal_memberships
```sql
-- Add fee plan linkage for investor dispatches
ALTER TABLE deal_memberships
ADD COLUMN IF NOT EXISTS assigned_fee_plan_id uuid REFERENCES fee_plans(id);

CREATE INDEX IF NOT EXISTS idx_deal_memberships_fee_plan
ON deal_memberships(assigned_fee_plan_id)
WHERE assigned_fee_plan_id IS NOT NULL;

COMMENT ON COLUMN deal_memberships.assigned_fee_plan_id IS
'Fee plan assigned at investor dispatch time, linking investor to introducer/partner commission terms';
```

### fee_plans (verify exists)
```sql
-- Ensure these columns exist for approval workflow
-- status: 'draft' | 'sent' | 'accepted' | 'rejected'
-- accepted_at: timestamptz
-- accepted_by: uuid REFERENCES profiles(id)
-- partner_id, introducer_id, commercial_partner_id: already exist
```

### deals (closing workflow)
```sql
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS closing_confirmed_at timestamptz,
ADD COLUMN IF NOT EXISTS closing_confirmed_by uuid REFERENCES profiles(id);

COMMENT ON COLUMN deals.closing_confirmed_at IS
'When CEO confirmed deal closing - triggers certificate/invoice workflows';
```

---

## API Endpoints

### New Endpoints

#### 1. Partner Fee Plan Response
```
POST /api/partners/me/fee-plans/:id/respond
Authorization: Partner persona required

Body:
{
  "response": "accept" | "reject",
  "comments": "Optional comments"
}

Response:
{
  "success": true,
  "fee_plan": { ... updated fee plan ... }
}
```

#### 2. Fee Plans for Dispatch
```
GET /api/deals/:id/dispatch/fee-plans?entity_id=xxx&entity_type=partner
Authorization: Staff persona required

Response:
{
  "fee_plans": [
    {
      "id": "uuid",
      "name": "Standard Fee Plan",
      "status": "accepted",
      "is_default": true,
      "components": [...]
    }
  ],
  "can_dispatch": true,
  "message": null
}
```

#### 3. Deal Closing Approval
```
POST /api/deals/:id/closing/confirm
Authorization: CEO/Staff persona required

Body:
{
  "confirmed": true,
  "notes": "Optional notes"
}

Response:
{
  "success": true,
  "triggered": {
    "certificates": 5,
    "invoices_unlocked": 3,
    "notifications": 12
  }
}
```

### Updated Endpoints

#### POST /api/deals/:id/dispatch
Add validation for fee plan approval:
```typescript
// If referred_by_entity_id provided:
// 1. Check fee_plans.status = 'accepted' for entity
// 2. Require assigned_fee_plan_id in body
// 3. Validate assigned_fee_plan_id is valid for entity
// 4. Store in deal_membership
```

---

## UI Changes

### 1. Partner Portal - Fee Model Approval

**New Component: FeeModelApproval.tsx**
```
┌─────────────────────────────────────────────────────┐
│ Fee Model Review                                     │
│                                                      │
│ Deal: Series X - Company ABC                         │
│ Term Sheet: Standard Terms                           │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Fee Structure                                    │ │
│ │                                                  │ │
│ │ Subscription Fee:    2.00%                       │ │
│ │ Management Fee:      2.00% per annum             │ │
│ │ Performance Fee:     20.00% of profits           │ │
│ │                                                  │ │
│ │ Effective From: January 1, 2026                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ Comments (optional):                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │                                                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│        [Reject]                    [Accept]          │
└─────────────────────────────────────────────────────┘
```

### 2. Staff Dispatch Modal - Fee Plan Selection

**Update: add-participant-modal.tsx**
```
┌─────────────────────────────────────────────────────┐
│ Add Investor to Deal                                 │
│                                                      │
│ Investor: John Smith                                 │
│                                                      │
│ Referring Entity:                                    │
│ [Partner: ABC Partners               ▼]              │
│                                                      │
│ Fee Plan:                                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ✅ Standard Fee (2% sub, 2% mgmt, 20% perf)     │ │
│ │ ✅ Reduced Fee (1.5% sub, 1.5% mgmt, 15% perf)  │ │
│ │ ⏳ New Terms (awaiting partner approval)         │ │
│ │ 📝 Draft Plan (not sent)                         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ⚠️ Only accepted fee plans can be selected      │
│                                                      │
│ [Cancel]                         [Add Investor]      │
└─────────────────────────────────────────────────────┘
```

### 3. Opportunity Page - Persona-Based Access

**Introducer View (Hidden elements):**
```
┌─────────────────────────────────────────────────────┐
│ Deal: Series X - Company ABC                         │
│                                                      │
│ Status: Open                                         │
│                                                      │
│ Your Referred Investors:                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ John Smith      Interested    →                  │ │
│ │ Jane Doe        NDA Signed    →                  │ │
│ │ Bob Wilson      Subscribed    $50,000            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ ❌ Term Sheet: [HIDDEN - Introducers do not see]     │
│ ❌ Data Room: [HIDDEN - No access for introducers]   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 4. Deal Closing - CEO Approval

**New Component: DealClosingApproval.tsx**
```
┌─────────────────────────────────────────────────────┐
│ Confirm Deal Closing                                 │
│                                                      │
│ Deal: Series X - Company ABC                         │
│ Closing Date: January 15, 2026                       │
│                                                      │
│ Summary:                                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Total Subscriptions: 15                          │ │
│ │ Total Funded: $2,500,000                         │ │
│ │ Pending Funding: $0                              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ On Confirmation:                                     │
│ • 15 Certificates will be generated                  │
│ • 3 Partners/Introducers can submit invoices         │
│ • Lawyer will be notified                            │
│                                                      │
│ Notes:                                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Shares secured, all funds received.              │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ [Cancel]                    [Confirm Closing]        │
└─────────────────────────────────────────────────────┘
```

---

## Priority Order

### HIGH PRIORITY (Implement First)
1. Partner fee plan approval endpoint (accept/reject)
2. Dispatch validation (block without approved fee plan)
3. assigned_fee_plan_id storage on dispatch
4. Closing date approval workflow

### MEDIUM PRIORITY
5. Hide term sheet for introducers
6. Hide data room for introducers
7. Same for lawyers
8. Auto-access for arrangers

### LOWER PRIORITY (Can Iterate)
9. UI polish for fee plan selection
10. Closing confirmation notifications
11. Edge case handling

---

## Testing Checklist

### Dispatch Type 1 Tests
- [ ] Partner can accept fee plan → status becomes 'accepted'
- [ ] Partner can reject fee plan → status becomes 'rejected'
- [ ] Introducer must sign agreement → triggers signature workflow
- [ ] Commercial partner must sign placement agreement

### Dispatch Type 2 Tests
- [ ] Cannot dispatch investor with introducer who has no accepted fee plan
- [ ] Cannot dispatch investor with partner who has no accepted fee plan
- [ ] CAN dispatch investor without referrer (direct investor)
- [ ] assigned_fee_plan_id is stored in deal_membership
- [ ] Multiple fee plans → user must select one

### NDA/Access Tests
- [ ] Introducer cannot see term sheet section
- [ ] Introducer cannot access data room
- [ ] Lawyer cannot see term sheet section
- [ ] Lawyer cannot access data room
- [ ] Partner sees NDA requirement for data room
- [ ] Arranger has automatic data room access

### Closing Tests
- [ ] Certificate NOT generated on subscription funding
- [ ] Invoice NOT unlocked on subscription funding
- [ ] Closing approval creates proper approval task
- [ ] On closing confirmation: certificates generated
- [ ] On closing confirmation: invoices unlocked
- [ ] On closing confirmation: lawyer notified

---

## Questions for Clarification

1. **What if introducer rejects fee model?**
   - Can CEO send new fee model?
   - Is there a negotiation flow?

2. **What if fee plan is modified after acknowledgement?**
   - Re-approval required?
   - Block modifications after acknowledgement?

3. **Multiple closings per deal?**
   - Can a deal have multiple tranches/closings?
   - Each with separate certificates?

4. **Retroactive data?**
   - Existing dispatched investors without assigned_fee_plan_id?
   - How to handle?
