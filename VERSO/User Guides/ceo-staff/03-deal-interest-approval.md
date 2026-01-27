# CEO & Staff Guide: Deal Interest Approval

Approve investor interest expressions to trigger the NDA process.

![Approval Queue](./screenshots/06-approvals-page.png)
*The Approval Queue showing pending approvals with SLA tracking and multiple view options.*

---

## Overview

When investors express interest in a deal, their request needs approval before they can proceed. Approval triggers the NDA for signing.

---

## What Interest Approval Does

### The Flow

```
Investor Expresses Interest
    → Staff Reviews
        → Approved → NDA Sent Automatically
        → Rejected → Investor Notified
```

### Why It Matters

Interest approval:
- Gates access to confidential materials
- Verifies investor suitability
- Initiates NDA process
- Controls deal pipeline

---

## Accessing Interest Queue

### Navigation

1. Go to **Approvals** in the left sidebar
2. The "Approval Queue" page shows all pending approvals
3. Filter by "DEAL INTEREST" request type

### Summary Cards

At the top, you'll see:

| Card | Description |
|------|-------------|
| **Pending Approvals** | Count requiring review |
| **SLA Breaches** | Items past deadline (highlighted in red) |
| **Avg Processing Time** | Average review time (last 30 days) |

### View Options

Toggle between views using the View buttons: **Table**, **Kanban**, **List**, **Grid**

Use the **Filter**, **Export**, and **Refresh** buttons to manage the queue.

### Queue Columns

The approval table shows:

| Column | Description |
|--------|-------------|
| **Request Type / User** | Type (DEAL INTEREST, SALE REQUEST, etc.) and requester name |
| **Entity** | Associated entity and deal |
| **Priority** | LOW, MEDIUM, HIGH |
| **SLA Status** | Time tracking (shows overdue if breached) |
| **Assigned To** | Staff member handling the request |
| **Actions** | Approve/Reject buttons |

---

## Reviewing Interest

### Step 1: Open Request

Click on an interest request to see details.

### Step 2: Review Investor

Check:
| Factor | Consideration |
|--------|---------------|
| **KYC Status** | Is KYC approved? |
| **Investor Type** | Suitable for this deal? |
| **Amount** | Meets minimum? |
| **History** | Previous investments? |

### Step 3: Review Deal Fit

Consider:
- Deal investor requirements
- Geographic restrictions
- Investor qualification level

---

## Making a Decision

### Approving Interest

If investor is suitable:
1. Click **"Approve"**
2. Confirm the action
3. **NDA is automatically generated and sent**
4. Status: `approved`

> **Important**: Approval triggers NDA. Ensure investor is appropriate before approving.

### Rejecting Interest

If not suitable:
1. Click **"Reject"**
2. Select or enter reason
3. Investor is notified
4. Status: `rejected`

---

## Common Rejection Reasons

| Reason | When to Use |
|--------|-------------|
| **KYC Incomplete** | Investor hasn't completed KYC |
| **Below Minimum** | Indicative amount too low |
| **Geographic** | Investor location not permitted |
| **Qualification** | Doesn't meet accreditation |
| **Deal Full** | No more capacity |

---

## Bulk Actions

### Processing Multiple

For deals with many interest requests:
1. Select multiple requests
2. Click **"Approve Selected"** or **"Reject Selected"**
3. Confirm action
4. All processed

### When to Use Bulk

- Routine approvals
- Similar situations
- Clear-cut decisions

---

## What Happens After Approval

### NDA Triggered

1. **NDA generated** for the investor
2. **Sent to all signatories** (if entity)
3. **Investor notified** to sign
4. **Data room access** after NDA signed

### Timeline

NDA is sent immediately upon approval:
- Investor receives email
- Signing link included
- Platform notification sent

---

## Tracking Interest

### By Deal

1. Go to deal **Interest** tab
2. See all interest for that deal
3. Status breakdown

### Interest Status Values

| Status | Meaning |
|--------|---------|
| `pending_review` | Awaiting staff review |
| `approved` | Interest accepted, NDA triggered |
| `rejected` | Not proceeding |
| `withdrawn` | Investor cancelled |

### By Status

Filter interest queue by:
- Pending Review
- Approved
- Rejected
- Withdrawn

---

## Special Considerations

### New Investors

First-time investors may need:
- Extra review
- KYC reminder
- More scrutiny

### Large Amounts

High-value interest:
- May need senior approval
- Extra verification
- Priority handling

### Introducer Attribution

Note the introducer:
- Affects commission tracking
- Verify attribution correct
- Flag if disputes

---

## Best Practices

### Timely Processing

Process quickly:
- Investors are waiting
- Deal momentum
- Service expectations

### Document Decisions

For rejections:
- Clear reasons
- Consistent approach
- Proper records

### Verify Before Approving

Don't auto-approve:
- Check KYC status
- Verify suitability
- Confirm deal capacity

---

## Next Steps

1. [Subscription Approval](./04-subscription-approval.md)
2. [Deal Close Approval](./05-deal-close-approval.md)
