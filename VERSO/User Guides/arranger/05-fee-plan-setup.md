# Arranger Guide: Fee Plan Setup

Configure commission arrangements for introducers and partners on specific deals.

![Fee Plans Page](./screenshots/arranger-fee-plans.png)
*The Fee Plans page showing all your fee structures with status and assignment details.*

---

## Overview

A **Fee Plan** defines the commission structure for an introducer or partner on a **specific deal**. Fee plans are not templates—each deal requires its own fee plan configuration.

> **How Fee Plans Work**: Create fee structures for your partners, introducers, and commercial partners. These plans define the fee components that will apply to subscriptions they refer. You can assign different fee structures to different entities based on your agreements.

---

## Critical Concept

> **Important**: Fee plans are DEAL-SPECIFIC. You create a fee plan for a specific introducer/partner for a specific deal. The same introducer working on a different deal needs a separate fee plan.

---

## Commission Basis

### Funded Amount is Always the Basis

Regardless of fee plan complexity:
- **Commission basis is always the investor's funded amount**
- Not the management fee
- Not the performance fee
- The actual capital the investor commits and funds

### Example

```
Investor funds: $500,000
Fee plan rate: 2%
Commission: $500,000 × 2% = $10,000
```

---

## Creating a Fee Plan

### Step 1: Access Fee Plans

1. Click **"Fee Plans"** in the left sidebar
2. You'll see the Fee Plans page with view options: **List View** or **By Opportunity**
3. Click **"+ Create Fee Plan"** in the top right corner

### Step 2: Select Recipient

| Field | Description |
|-------|-------------|
| **Type** | Introducer or Partner |
| **Recipient** | Select from your network |
| **Contact** | Primary contact person |

### Step 3: Configure Fee Structure

#### Simple Fee Plan

Single rate for all subscriptions:

| Field | Value |
|-------|-------|
| **Rate** | 2% |
| **Type** | One-time |
| **Basis** | Funded amount |

#### Tiered Fee Plan

Different rates based on volume:

| Tier | From | To | Rate |
|------|------|-----|------|
| 1 | $0 | $500K | 2.5% |
| 2 | $500K | $1M | 2.0% |
| 3 | $1M+ | - | 1.5% |

### Step 4: Payment Terms

| Field | Options |
|-------|---------|
| **Timing** | At close, On funding, Deferred |
| **Split** | Single payment, Installments |
| **Currency** | Fee currency |

### Step 5: Save Fee Plan

1. Review all settings
2. Click **"Save Fee Plan"**
3. Status is `draft`

---

## Fee Plan Statuses

| Status | Meaning | Actions |
|--------|---------|---------|
| `draft` | Just created | Edit, Send |
| `sent` | Awaiting acceptance | Wait, Resend |
| `pending_signature` | Requires signature | Wait for signing |
| `accepted` | Introducer agreed | Active, no edits |
| `rejected` | Introducer declined | Create new |
| `archived` | No longer active | View only |

> **Note**: Fee plans may require signatures depending on your agreement type. The `pending_signature` status appears when the introducer/partner must sign to confirm acceptance.

---

## Sending for Acceptance

Fee plans require introducer/partner acceptance:

### Step 1: Review Fee Plan

Ensure all details are correct—changes after acceptance are complex.

### Step 2: Send for Acceptance

1. Click **"Send for Acceptance"**
2. Recipient receives email notification
3. Status changes to `sent`

### What They See

The recipient sees:
- Deal details
- Commission structure
- Payment terms
- Accept/Reject buttons

---

## Acceptance Flow

```
Draft → Sent → Accepted ✓
            → Rejected ✗
```

### When Accepted

- Fee plan becomes active
- Introducer can make introductions
- Commissions calculated automatically

### When Rejected

- Review rejection notes
- Create revised fee plan
- Resend for acceptance

---

## Fee Plan Components

### Rate Structure Options

| Type | Description |
|------|-------------|
| **Flat Rate** | Single percentage (e.g., 2%) |
| **Tiered** | Rate varies by volume |
| **Graduated** | Higher tiers apply only to incremental amounts |
| **Cap** | Maximum commission regardless of volume |

### Timing Options

| Timing | When Paid |
|--------|-----------|
| **At Close** | When deal closes |
| **On Funding** | When investor funds |
| **Deferred** | Specified delay |
| **Trailing** | Ongoing over time |

---

## Trailing Commissions

For ongoing commissions:

| Field | Example |
|-------|---------|
| **Initial Rate** | 1.5% at close |
| **Trail Rate** | 0.25% annually |
| **Trail Period** | 5 years |

Trailing commissions:
- Accrue on each anniversary
- Based on remaining investment value
- Stop if investor exits

---

## Managing Fee Plans

### Viewing All Fee Plans

The Fee Plans page displays all your fee plans in a table:

| Column | Description |
|--------|-------------|
| **Plan Name** | Fee plan name and description |
| **Assigned To** | The partner/introducer entity |
| **Fee Components** | Commission rates (e.g., "management: 2.00%") |
| **Status** | Active/Inactive + Sent/Draft badges |
| **Actions** | Edit, approve, or delete options |

### View Options

Toggle between views:
- **List View** - See all fee plans in a table
- **By Opportunity** - Group fee plans by deal

### Fee Plan Details

Click on a fee plan to see:
- Full configuration
- Acceptance status
- Linked introductions
- Commission calculations

---

## Fee Plans and Introductions

### The Link

When an introducer makes an introduction:
- They must have an accepted fee plan
- The fee plan determines their commission
- All investors they introduce use this plan

### No Fee Plan = No Commission

If an introducer refers someone without an accepted fee plan:
- No automatic commission tracking
- Must be handled manually
- Best practice: Set up fee plan first

---

## Modifying Fee Plans

### Draft Fee Plans

Full editing available:
1. Click **"Edit"**
2. Make changes
3. Save

### Sent Fee Plans

Can be recalled:
1. Click **"Recall"**
2. Fee plan returns to draft
3. Make changes
4. Resend

### Accepted Fee Plans

Cannot be directly modified:
1. Create new fee plan with changes
2. Get recipient to accept new plan
3. Old plan can be superseded

---

## Multiple Fee Plans Per Deal

You can have multiple fee plans for the same deal:
- Different introducers
- Different partners
- Different rate structures

Each introducer/partner has their own fee plan.

---

## Common Issues

### "Introducer not in list"

They must be in your network:
1. Go to **Network**
2. Add the introducer
3. Return to fee plan creation

### "Cannot create fee plan - no deal selected"

Fee plans are deal-specific:
1. Navigate to the specific deal
2. Go to Fee Plans tab
3. Create from there

### "Introducer rejected fee plan"

1. Review their feedback
2. Discuss terms
3. Create revised fee plan
4. Resend for acceptance

---

## Best Practices

### Set Up Early

Create fee plans before dispatching deals:
- Ensures proper tracking
- Avoids commission disputes
- Clear expectations upfront

### Document Everything

Keep records of:
- Fee plan negotiations
- Acceptance dates
- Any modifications

### Standard Templates

While fee plans are deal-specific:
- Use consistent rate structures where possible
- Makes management easier
- Reduces confusion

---

## Next Steps

With fee plans configured:

1. [Manage Your Network](./06-network-management.md)
2. [Dispatch Investors](./07-dispatching-investors.md)
3. [Process Commissions](./11-processing-commissions.md)
