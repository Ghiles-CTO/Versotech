# Direct Subscribe NDA Bundle Implementation Plan

## Problem Statement

When an investor uses "Direct Subscribe" (clicking Subscribe without going through Express Interest → Sign NDA → Access Data Room), the system currently only creates **subscription pack signature requests**. It does NOT create **NDA signature requests**.

Per the Phase II design, Direct Subscribe should bundle both documents so the investor gets both NDA and Subscription Pack sent to their signatories simultaneously.

---

## Current State Analysis

### What Happens Now (Subscribe Route)

**File**: `src/app/api/investors/me/opportunities/[id]/subscribe/route.ts`

```
1. Validates user and gets investor_id
2. Validates deal is open
3. Creates deal_membership with viewed_at only (skips interest, nda, data_room)
4. Creates subscription record with pack_generated_at and pack_sent_at set immediately
5. Creates signature_requests with document_type='subscription' ONLY
6. Logs audit event
```

**Gap**: No NDA signature requests are created.

### What Happens Now (NDA Route)

**File**: `src/app/api/investors/me/opportunities/[id]/nda/route.ts`

```
1. Validates user and gets investor_id
2. BLOCKS if !membership.interest_confirmed_at ❌
3. Creates signature_requests with document_type='nda'
4. Creates deal_signatory_ndas tracking entries
```

**Gap**: Cannot be called from Direct Subscribe because it requires `interest_confirmed_at`.

### What Happens When NDA Is Signed

**File 1**: `src/app/api/automation/nda-complete/route.ts`
- Triggered when NDA signing completes
- Updates `deal_signatory_ndas` with signature
- Checks if ALL signatories signed via `check_all_signatories_signed` RPC
- When all signed:
  - Creates `deal_data_room_access` record (grants data room)
  - Updates `deal_memberships.nda_signed_at` and `data_room_granted_at`
  - Creates notification

**File 2**: `src/lib/signature/handlers.ts` → `handleNDASignature()`
- Alternative handler for NDA completion
- Does the same: grants data room, updates journey tracking, logs events

---

## Implementation Plan

### Step 1: Modify Subscribe Route to Create Both NDA + Subscription Signature Requests

**File to modify**: `src/app/api/investors/me/opportunities/[id]/subscribe/route.ts`

**Changes**:

1. After getting signatories (line 173), create TWO sets of signature requests:

```typescript
// Create signature requests for NDA (document_type='nda')
if (signatories && signatories.length > 0) {
  const ndaSignatureRequests = signatories.map((sig, index) => ({
    investor_id: investorId,
    deal_id: dealId,
    member_id: sig.id,  // Important for signatory tracking
    signer_email: sig.email,
    signer_name: sig.full_name,
    signer_role: 'authorized_signatory',
    signature_position: `nda_signatory_${index + 1}`,
    document_type: 'nda',
    signing_token: crypto.randomBytes(32).toString('hex'),
    token_expires_at: expiresAt,
    status: 'pending',
    created_at: now,
    created_by: user.id
  }))

  await serviceSupabase
    .from('signature_requests')
    .insert(ndaSignatureRequests)
}

// Create signature requests for Subscription (existing code)
if (signatories && signatories.length > 0) {
  const subscriptionSignatureRequests = signatories.map((sig, index) => ({
    subscription_id: subscription.id,
    investor_id: investorId,
    deal_id: dealId,
    signer_email: sig.email,
    signer_name: sig.full_name,
    signer_role: 'authorized_signatory',
    signature_position: `signatory_${index + 1}`,
    document_type: 'subscription',
    signing_token: crypto.randomBytes(32).toString('hex'),
    token_expires_at: expiresAt,
    status: 'pending',
    created_at: now,
    created_by: user.id
  }))

  await serviceSupabase
    .from('signature_requests')
    .insert(subscriptionSignatureRequests)
}
```

2. Also create `deal_signatory_ndas` tracking entries (like NDA route does):

```typescript
// Create signatory NDA tracking entries for entity-level NDA tracking
const signatoryNdaEntries = signatories.map(sig => ({
  deal_id: dealId,
  investor_id: investorId,
  member_id: sig.id,
  user_id: user.id,
  signed_at: null
}))

await serviceSupabase
  .from('deal_signatory_ndas')
  .upsert(signatoryNdaEntries, {
    onConflict: 'deal_id,member_id',
    ignoreDuplicates: true
  })
```

3. Update the audit log to indicate bundled documents:

```typescript
details: {
  deal_id: dealId,
  investor_id: investorId,
  commitment_amount,
  direct_subscribe: true,
  bundled_nda: true,  // NEW
  signatories_count: signatories?.length || 0,
  nda_signature_requests: signatories?.length || 0,  // NEW
  subscription_signature_requests: signatories?.length || 0  // NEW
}
```

### Step 2: Update Response to Include NDA Info

Modify the response to indicate both document types were created:

```typescript
return NextResponse.json({
  success: true,
  subscription: {
    id: subscription.id,
    status: subscription.status,
    commitment: subscription.commitment,
    pack_generated_at: subscription.pack_generated_at,
    pack_sent_at: subscription.pack_sent_at
  },
  bundled_documents: {
    nda: {
      signature_requests: signatories?.length || 0,
      status: 'pending'
    },
    subscription_pack: {
      signature_requests: signatories?.length || 0,
      status: 'pending'
    }
  },
  signatories_notified: signatories?.length || 0,
  message: `NDA and Subscription Pack sent to ${signatories?.length || 0} signatory(ies) for signing.`
})
```

### Step 3: No Changes Needed to NDA Completion Handlers

The existing handlers will work automatically:

- `src/app/api/automation/nda-complete/route.ts` - Already handles NDA completion
- `src/lib/signature/handlers.ts` → `handleNDASignature()` - Already handles NDA completion

Both will:
- Grant data room access when all NDA signatories sign
- Update `deal_memberships.nda_signed_at` and `data_room_granted_at`
- Create notifications

### Step 4: Update UI Subscribe Dialog (Optional Enhancement)

**File**: `src/app/(main)/versotech_main/opportunities/[id]/page.tsx`

Update the Subscribe dialog message to inform users:

```tsx
<DialogDescription>
  Enter your commitment amount to proceed with the subscription.
  Both the NDA and subscription documents will be sent to all
  authorized signatories for execution.
</DialogDescription>
```

---

## Data Flow After Implementation

### Direct Subscribe Flow

```
User clicks "Subscribe Now"
    ↓
POST /api/investors/me/opportunities/{id}/subscribe
    ↓
Creates deal_membership (viewed_at set, other stages NULL)
    ↓
Creates subscription (pack_generated_at, pack_sent_at set)
    ↓
Creates signature_requests:
  - N requests with document_type='nda'
  - N requests with document_type='subscription'
    ↓
Creates deal_signatory_ndas entries
    ↓
Signatories receive BOTH documents to sign
```

### NDA Completion Flow (Existing, No Changes)

```
All signatories sign NDA
    ↓
nda-complete webhook triggered
    ↓
check_all_signatories_signed RPC returns true
    ↓
deal_data_room_access record created (grants access)
    ↓
deal_memberships updated:
  - nda_signed_at = now
  - data_room_granted_at = now
    ↓
Notification sent: "Data room unlocked"
```

### Subscription Completion Flow (Existing, No Changes)

```
All signatories sign Subscription
    ↓
handleSubscriptionSignature() triggered
    ↓
subscription.status = 'committed'
subscription.signed_at = now
    ↓
Fee events created
    ↓
Notification sent: "Investment Commitment Confirmed"
```

---

## Progress Bar Behavior After Implementation

With the fix, the progress bar will show:

| Stage | Status | Notes |
|-------|--------|-------|
| 1 - Received | Skipped | Optional, no dispatched_at |
| 2 - Viewed | Completed | Set by subscribe route |
| 3 - Interest | Skipped | Optional, direct subscribe |
| 4 - NDA | Completed | Set when NDA signed |
| 5 - Data Room | Completed | Set when NDA signed |
| 6 - Pack Gen | Completed | Set by subscribe route |
| 7 - Pack Sent | Completed | Set by subscribe route |
| 8 - Signed | Pending → Completed | When subscription signed |
| 9 - Funded | Pending | When funds received |
| 10 - Active | Pending | When activated |

---

## Testing Checklist

1. [ ] Direct Subscribe creates both NDA and subscription signature requests
2. [ ] deal_signatory_ndas entries are created
3. [ ] Signatories receive both documents
4. [ ] When NDA signed, data_room_access is granted
5. [ ] When NDA signed, deal_memberships.nda_signed_at is updated
6. [ ] When subscription signed, subscription.signed_at is updated
7. [ ] Progress bar correctly shows NDA/Data Room as completed (not skipped) after signing
8. [ ] Full journey completes: Subscribe → Sign NDA → Sign Subscription → Fund → Active

---

## Files to Modify

1. **Primary Change**:
   - `src/app/api/investors/me/opportunities/[id]/subscribe/route.ts`

2. **Optional UI Enhancement**:
   - `src/app/(main)/versotech_main/opportunities/[id]/page.tsx`

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate NDA requests if user tries again | Low | Low | Existing check prevents duplicate subscriptions |
| NDA completion handler fails | Low | Medium | Handlers have error logging, non-blocking |
| User confused by two documents | Low | Low | Clear messaging in UI |

---

## Implementation Order

1. Modify subscribe route to create NDA signature requests
2. Add deal_signatory_ndas tracking
3. Update response to indicate bundled documents
4. Test complete flow
5. Optional: Update UI messaging
