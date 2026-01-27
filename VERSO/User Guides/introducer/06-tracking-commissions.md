# Introducer Guide: Tracking Commissions

Monitor your commissions from introduction to payment.

![My Commissions Page](./screenshots/31-introducer-commissions.png)
*The My Commissions page showing summary cards and commission table.*

---

## Overview

The **My Commissions** page shows all your earnings from successful introductions. Track status, amounts, and payment progress here.

---

## Commission Lifecycle

```
Deal Closes → Commission Accrues → Invoice Requested → Invoice Submitted → Paid
                                                                        → Cancelled/Rejected
```

### Status Flow

| Status | Meaning | Your Action |
|--------|---------|-------------|
| `accrued` | Earned, awaiting invoice | None yet |
| `invoice_requested` | Arranger asking for invoice | Submit invoice |
| `invoice_submitted` | Invoice sent | Wait for approval |
| `invoiced` | Invoice approved | Await payment |
| `paid` | Payment completed | None |
| `cancelled` | Commission was cancelled | Contact arranger if unexpected |
| `rejected` | Invoice/commission rejected | Review feedback and resubmit |

> **Note**: Commissions can be cancelled if the underlying subscription is cancelled or if there are issues with the fee plan. Rejections typically occur when invoice details are incorrect.

---

## Accessing My Commissions

### Navigation

1. Go to **My Commissions** in left sidebar
2. See all your commissions
3. Filter by status and date range

### Summary Cards

At the top of the page, you'll see four summary cards:

| Card | Color | Description |
|------|-------|-------------|
| **Total Owed** | Green | Pending payment - commissions awaiting invoice |
| **Total Paid** | Green | Completed - commissions fully paid out |
| **Invoice Requested** | Yellow | Submit your invoice - action needed from you |
| **Invoiced** | Blue | Awaiting payment - invoice submitted, waiting for payment |

### Filters

Use the filters to narrow down your commissions:
- **All Status** dropdown - Filter by commission status
- **Pick a date range** button - Filter by time period

---

## Commission Details

### Commission Table Columns

The commissions table shows all your commission records:

| Column | Information |
|--------|-------------|
| **Status** | Current status (Invoiced, Paid, etc.) shown as colored badge |
| **Deal** | Deal name and company (e.g., "Perplexity - Perplexity AI") |
| **Arranger** | The arranger entity (e.g., "VERSO MANAGEMENT LTD") |
| **Basis** | Commission calculation basis - always "Invested Amount" |
| **Amount** | Commission amount and percentage (e.g., "$5,000 1.50%") |
| **Due Date** | Payment due date |
| **Created** | When the commission was created |
| **Actions** | Available actions for this commission |

### Understanding the Basis Column

The **Basis** column shows "Invested Amount" - this confirms that commissions are calculated on the actual funded amount the investor commits, not on management fees or other charges.

### Calculation Breakdown

The detail shows how commission was calculated:

```
Funded Amount: $500,000
Fee Plan Rate: 2.0%
Calculation: $500,000 × 2.0%
Commission: $10,000
```

For tiered plans:
```
Tier 1 ($0-500K @ 2.5%): $500,000 × 2.5% = $12,500
Total: $12,500
```

---

## Filtering Commissions

### Filter Options

| Filter | Options |
|--------|---------|
| **Status** | Accrued, Requested, Submitted, Paid |
| **Deal** | Specific deals |
| **Date Range** | Custom period |
| **Amount** | Minimum/maximum |

### Quick Filters

Use preset filters:
- **Pending Action** - Needs your attention
- **This Month** - Recent activity
- **Paid** - Completed payments

---

## Commission by Deal

### Deal View

See all commissions from one deal:
1. Go to **Commissions**
2. Click **"By Deal"** tab
3. Select a deal
4. See all related commissions

### Deal Summary

Shows:
- Total introduced investors
- Total volume
- Total commission
- Status breakdown

---

## Commission by Status

### Tracking Progress

Monitor where your money is:

| Status | What to Know |
|--------|--------------|
| **Accrued** | Waiting for invoice request |
| **Requested** | Submit invoice promptly |
| **Submitted** | In review |
| **Invoiced** | Approved, payment pending |
| **Paid** | Complete |

### Action Items

Focus on:
- `invoice_requested` - Submit your invoice
- `paid` - Confirm receipt

---

## Understanding Commission Amounts

### Basis: Always Funded Amount

Your commission is based on what the investor actually funded:

```
Committed: $500,000
Funded: $500,000 ← Commission basis
Your Rate: 2%
Commission: $10,000
```

### Partial Funding

If investor funds less than committed:
```
Committed: $500,000
Funded: $400,000 ← Commission basis
Your Rate: 2%
Commission: $8,000
```

### Multiple Closes

For deals with multiple closes:
- Commission accrues at each close
- Based on funded amount at that close
- Accumulates over time

---

## Trailing Commissions

### How They Work

If your fee plan includes trailing:
1. Initial commission at close
2. Annual commission on anniversary
3. Based on investment value

### Tracking Trailing

Trailing commissions show:
- Initial amount
- Trail schedule
- Upcoming payments
- History

---

## Commission Timeline

### Typical Timeline

| Event | Typical Timing |
|-------|----------------|
| Deal closes | Day 0 |
| Commission accrues | Day 0 |
| Invoice requested | Day 1-7 |
| You submit invoice | Day 1-14 |
| Invoice approved | Day 1-7 after submission |
| Payment processed | 30 days after approval |

### Delays

Payments may be delayed for:
- Incomplete invoice
- Processing cycles
- Bank transfers

---

## Export and Reporting

### Exporting Data

1. Go to **Commissions**
2. Apply desired filters
3. Click **"Export"**
4. Choose format (CSV, Excel, PDF)
5. Download

### Commission Statement

Generate summary statement:
1. Click **"Generate Statement"**
2. Select date range
3. Download PDF statement

---

## Common Questions

### "My commission amount seems wrong"

Check:
1. What amount was funded?
2. What's your fee plan rate?
3. Is there tiering?
4. Verify calculation

### "Commission not showing after close"

Allow 24-48 hours for:
1. Close to process
2. Commissions to accrue
3. System updates

### "Status hasn't changed"

Some stages take time:
- Invoice review: 1-7 days
- Payment processing: Up to 30 days

---

## Tracking Best Practices

### Regular Monitoring

- Check weekly
- Note pending actions
- Follow up if delayed

### Record Keeping

- Export regular statements
- Track for tax purposes
- Reconcile with payments received

### Communication

- Respond promptly to invoice requests
- Follow up professionally if delayed
- Keep arranger informed of issues

---

## Next Steps

When invoice is requested:

1. [Submit Your Invoice](./07-submitting-invoices.md)
2. Track payment to completion
