# CEO & Staff Guide: Subscription Approval

Approve investor subscriptions to trigger the document signing process.

---

## Overview

When investors submit subscriptions, they need approval before documents are sent for signature. This is a key control point in the investment process.

---

## Understanding the Three-Status System

Subscriptions are tracked across **three interconnected status systems**:

| System | What It Tracks | Values |
|--------|----------------|--------|
| **Submission Status** | Your review decision | `pending_review` → `approved`/`rejected`/`cancelled` |
| **Pack Status** | Document signing | `no_pack` → `draft` → `final` → `pending_signature` → `signed` |
| **Subscription Status** | Financial lifecycle | `pending` → `committed` → `partially_funded` → `funded` → `active` → `closed`/`cancelled` |

## What Subscription Approval Does

### The Flow

```
Investor Submits Subscription (submission status: pending_review)
    → Staff Reviews
        → Approved → Pack Generated → Sent for Signing
        → Rejected → Investor Notified
        → Cancelled → Removed from queue
```

### Why It Matters

Subscription approval:
- Validates investment commitment
- Verifies source of funds
- Triggers document generation (changes pack status to `draft`)
- Moves investor toward funding (changes subscription status to `committed`)

---

## Accessing Subscription Queue

### Navigation

1. Go to **Approvals** → **Subscriptions**
2. See all pending subscriptions
3. Sorted by submission date

### Queue Information

For each subscription:
- Investor name/entity
- Deal
- Amount
- Source of funds summary
- Submission date

---

## Reviewing a Subscription

### Step 1: Open Subscription

Click to see full details.

### Step 2: Verify Investor Details

| Check | What to Verify |
|-------|----------------|
| **Entity** | Correct investing entity |
| **KYC** | KYC is approved |
| **Capacity** | Investor can invest this amount |

### Step 3: Review Amount

| Check | Consideration |
|-------|---------------|
| **Minimum** | Meets deal minimum |
| **Maximum** | Within deal capacity |
| **Allocation** | Fair allocation if oversubscribed |

### Step 4: Source of Funds

Review the source of funds declaration:
- Is it credible?
- Consistent with KYC?
- Any red flags?

---

## Making a Decision

### Approving Subscription

If everything checks out:
1. Click **"Approve"**
2. Confirm action
3. **Subscription documents generated**
4. **Sent to all signatories for signing**
5. Status: `committed`

> **Critical**: Approval triggers document generation and signature requests to all signatories.

### Rejecting Subscription

If issues found:
1. Click **"Reject"**
2. Enter specific reason
3. Investor notified
4. Status: `rejected`

---

## Common Rejection Reasons

| Reason | When to Use |
|--------|-------------|
| **KYC Not Approved** | Investor KYC pending/rejected |
| **Below Minimum** | Amount less than required |
| **Capacity Full** | Deal is fully subscribed |
| **Source of Funds** | Concerns about fund origin |
| **Entity Issues** | Problems with investing entity |

---

## Source of Funds Review

### What to Check

| Factor | Question |
|--------|----------|
| **Consistency** | Matches KYC declarations? |
| **Credibility** | Amount realistic for stated source? |
| **Documentation** | Can be evidenced if needed? |

### Red Flags

- Vague explanations
- Inconsistent with profile
- Unusual patterns
- High-risk indicators

### When Uncertain

1. Request additional information
2. Consult compliance
3. Escalate to senior staff

---

## What Happens After Approval

### Document Generation

1. Subscription agreement generated
2. LPA signature pages prepared
3. Tax forms included
4. Full subscription pack created

### Signature Requests

1. All entity signatories receive email
2. Signing links included
3. Platform notifications sent
4. Tracking begins

### Multi-Signatory Note

> **Important**: Entity subscriptions require ALL signatories to sign before documents are considered executed. One missing signature blocks the entire process.

---

## Oversubscription Handling

### When Deal is Full

Options:
- Reject new subscriptions
- Waitlist investors
- Allocate pro-rata
- Increase deal size (if possible)

### Pro-Rata Allocation

If allocating:
1. Calculate each investor's share
2. Communicate reduction
3. Adjust subscription amounts
4. May need new documents

---

## Tracking Subscriptions

### By Deal

1. Go to deal **Subscriptions** tab
2. See all subscriptions
3. Status breakdown

### Pipeline View

See overall pipeline:
- Pending approval
- Awaiting signatures
- Funded
- Active

---

## Best Practices

### Verification

Before approving:
- Check KYC status
- Verify source of funds
- Confirm deal capacity

### Timeliness

Process promptly:
- Investors expect quick turnaround
- Deal timelines matter
- Signature deadlines

### Documentation

Record your review:
- Note any concerns addressed
- Document approval rationale
- Maintain audit trail

---

## Next Steps

1. [Deal Close Approval](./05-deal-close-approval.md)
2. [Data Room Extensions](./06-data-room-extensions.md)
