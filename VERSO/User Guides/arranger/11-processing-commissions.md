# Arranger Guide: Processing Commissions

Manage and process introducer and partner commissions after deal close.

---

## Overview

After a deal closes, commissions for introducers and partners need to be processed. This involves:
- Commission calculation (automatic)
- Invoice receipt
- Payment approval
- Payment execution

---

## Commission Lifecycle

```
Deal Closes → Commissions Accrued → Invoice Requested → Invoice Submitted → Approved → Paid
```

### Status Flow

| Status | Meaning |
|--------|---------|
| `accrued` | Calculated, not yet invoiced |
| `invoice_requested` | Introducer asked to submit invoice |
| `invoice_submitted` | Invoice received |
| `invoiced` | Invoice approved |
| `paid` | Payment completed |

---

## Commission Calculation

### Automatic Calculation

When deal closes:
1. System identifies all fee plans
2. Matches to funded subscriptions
3. Calculates commission per fee plan
4. Creates commission records

### Calculation Basis

> **Important**: Commission is ALWAYS calculated on the **funded amount**, regardless of fee plan complexity.

```
Example:
Investor funded: $500,000
Fee plan rate: 2%
Commission: $500,000 × 2% = $10,000
```

### Tiered Calculations

For tiered fee plans:
```
Tier 1: $0-500K @ 2.5%
Tier 2: $500K-1M @ 2.0%

Investor: $750,000
Tier 1: $500,000 × 2.5% = $12,500
Tier 2: $250,000 × 2.0% = $5,000
Total: $17,500
```

---

## Viewing Commissions

### Commissions Dashboard

1. Navigate to **Commissions** in left sidebar
2. See all commissions across deals
3. Filter by status, deal, recipient

### Commission Details

Click on any commission to see:
- Recipient information
- Linked subscription
- Fee plan terms
- Calculated amount
- Status history

---

## Requesting Invoices

### Automated Request

When commissions accrue:
1. System can auto-request invoices
2. Recipients notified
3. Status moves to `invoice_requested`

### Manual Request

To request an invoice manually:
1. Go to commission record
2. Click **"Request Invoice"**
3. Recipient receives notification
4. Status updates

### Bulk Request

Request invoices from multiple:
1. Select commissions
2. Click **"Request Invoices"**
3. All recipients notified

---

## Receiving Invoices

### When Submitted

When introducer/partner submits invoice:
1. Notification appears in your queue
2. Invoice attached to commission
3. Status moves to `invoice_submitted`

### Reviewing Invoice

1. Go to commission record
2. View attached invoice
3. Verify:
   - Amount matches calculation
   - Details correct
   - Proper format

---

## Invoice Approval

### Approving an Invoice

If invoice is correct:
1. Click **"Approve Invoice"**
2. Confirm the action
3. Status moves to `invoiced`
4. Ready for payment

### Rejecting an Invoice

If issues found:
1. Click **"Reject Invoice"**
2. Enter rejection reason
3. Recipient notified
4. They resubmit corrected invoice

### Common Rejection Reasons

| Issue | Action |
|-------|--------|
| Amount mismatch | Request corrected amount |
| Missing details | Request complete invoice |
| Wrong entity | Request from correct entity |
| Missing tax info | Request tax details |

---

## Payment Processing

### Payment Queue

Approved invoices enter payment queue:
1. Go to **Commissions** → **Payment Queue**
2. See all pending payments
3. Prioritize as needed

### Initiating Payment

1. Select commission(s) for payment
2. Click **"Process Payment"**
3. Confirm payment details
4. Submit for execution

### Payment Methods

Typical payment methods:
- Bank wire transfer
- ACH transfer
- Check (if applicable)

---

## Payment Approval Workflow

### Who Approves

Payment approval typically requires:
- Finance review
- CEO/CFO approval
- Compliance clearance

### Approval Process

```
Payment Initiated
    → Finance Review
        → CEO Approval
            → Payment Executed
```

---

## Tracking Payments

### Payment Status

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting approval |
| `approved` | Ready for execution |
| `processing` | Being executed |
| `completed` | Payment made |
| `failed` | Payment issue |

### Confirming Receipt

After payment:
1. Mark as completed
2. Add payment reference
3. Recipient confirms receipt

---

## Commission Reports

### Summary Reports

Generate commission summaries:
1. Go to **Commissions** → **Reports**
2. Select report type
3. Set date range
4. Generate

### Report Types

| Report | Content |
|--------|---------|
| **Accruals** | All accrued commissions |
| **Paid** | Completed payments |
| **Outstanding** | Pending payments |
| **By Recipient** | Per introducer/partner |
| **By Deal** | Per deal breakdown |

---

## Trailing Commissions

### For Ongoing Arrangements

If fee plans include trailing:
- Commission accrues periodically
- Usually annually
- Based on remaining investment value

### Processing Trailing

1. System calculates on schedule
2. Creates new commission record
3. Same invoice/payment process

---

## Disputes and Adjustments

### Handling Disputes

If recipient disputes commission:
1. Review fee plan terms
2. Check calculation
3. Verify attribution
4. Resolve or escalate

### Making Adjustments

If adjustment needed:
1. Document the reason
2. Create adjustment record
3. Process difference
4. Update records

---

## Tax Considerations

### Tax Forms

May need to collect:
- W-9 (US recipients)
- W-8BEN (international)
- Tax residency certificates

### Withholding

Some payments require withholding:
- Verify tax status
- Apply appropriate withholding
- Provide withholding certificates

---

## Audit Trail

### What's Tracked

All commission activity is logged:
- Calculations
- Status changes
- Approvals
- Payments

### Accessing Audit

1. Go to commission record
2. Click **"Audit Trail"**
3. See complete history

---

## Common Issues

### "Commission amount seems wrong"

1. Review fee plan terms
2. Check funded amount
3. Verify tier calculation
4. Recalculate manually if needed

### "Introducer says they weren't paid"

1. Check payment status
2. Verify bank details
3. Trace payment
4. Resolve with finance

### "Invoice rejected multiple times"

1. Clarify requirements
2. Provide invoice template
3. Offer assistance

---

## Best Practices

### Timely Processing

Process commissions promptly:
- Good relationships
- Regulatory compliance
- Clean books

### Documentation

Maintain records of:
- All calculations
- Invoice exchanges
- Payment confirmations

### Communication

Keep recipients informed:
- Expected timing
- Required documents
- Payment confirmation

---

## Related Guides

- [Fee Plan Setup](./05-fee-plan-setup.md)
- [Network Management](./06-network-management.md)
- [Requesting Deal Close](./10-requesting-deal-close.md)
