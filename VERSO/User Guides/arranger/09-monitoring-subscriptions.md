# Arranger Guide: Monitoring Subscriptions

Track and manage investor subscriptions through the full lifecycle.

---

## Overview

As an arranger, you need visibility into all subscriptions across your deals:
- Pipeline progress
- Status tracking
- Issue identification
- Funding monitoring

---

## Subscription Dashboard

### Accessing Subscriptions

1. Navigate to **Subscriptions** in left sidebar
2. Or from deal: Click **Subscriptions** tab
3. See full subscription list

### Dashboard Views

| View | Best For |
|------|----------|
| **List** | Detailed data, sorting, filtering |
| **Kanban** | Visual status flow |
| **Pipeline** | Fundraising progress |

---

## Subscription Status Flow

```
pending → committed → partially_funded → funded → active
```

| Status | Meaning |
|--------|---------|
| `pending` | Submitted, awaiting approval |
| `committed` | Approved, docs being signed |
| `partially_funded` | Some funds received |
| `funded` | Full amount received |
| `active` | Deal closed, position created |

---

## List View

### Subscription Table

Columns typically include:

| Column | Data |
|--------|------|
| **Investor** | Name/entity |
| **Deal** | Which deal |
| **Amount** | Subscription amount |
| **Status** | Current status |
| **Submitted** | Date submitted |
| **Signature** | Signing progress |
| **Funded** | Amount received |

### Sorting and Filtering

Click column headers to sort. Filter by:
- Status
- Deal
- Date range
- Amount range
- Introducer

### Bulk Actions

Select multiple subscriptions:
- Export selected
- Send bulk reminders
- Update status (where applicable)

---

## Kanban View

### Visual Pipeline

Subscriptions shown as cards in columns:

```
| Pending | Committed | Partially Funded | Funded | Active |
|---------|-----------|------------------|--------|--------|
| [Card]  | [Card]    | [Card]           | [Card] | [Card] |
| [Card]  | [Card]    |                  | [Card] |        |
```

### Using Kanban

- See bottlenecks visually
- Quick status check
- Click card for details
- Some actions available from cards

---

## Pipeline View

### Fundraising Progress

Visual representation:

```
Deal: Series A - TechCo

Target: $10,000,000

|████████████░░░░░░░░|
  Funded   Committed  Remaining
  $6.5M    $2.5M      $1M

Subscriptions: 14 funded, 5 pending
```

### Multi-Deal Pipeline

See all deals at once:
- Compare progress
- Identify lagging deals
- Prioritize attention

---

## Subscription Details

### Viewing Full Details

Click any subscription to see:

### Overview Tab

- Investor information
- Amount and currency
- Source of funds
- Status history

### Documents Tab

- Subscription agreement
- Signature status
- Supporting documents

### Funding Tab

- Wire instructions sent
- Amounts received
- Outstanding balance
- Bank references

### Activity Tab

- Full timeline
- All actions taken
- Communications

---

## Signature Tracking

### Multi-Signatory Progress

For entity subscriptions:

```
Subscription: ABC Holdings - $500,000

Signatories:
✅ John Smith - Director - Signed Jan 15
⏳ Jane Doe - Director - Pending
❌ Mike Johnson - Trustee - Not started

Progress: 1 of 3 signed
```

### Sending Reminders

1. Go to subscription details
2. Click on pending signatory
3. Click **"Send Reminder"**
4. Email sent to signatory

---

## Funding Tracking

### Wire Instructions

After signatures complete:
1. Wire instructions auto-generated
2. Sent to investor
3. Tracked on platform

### Recording Receipt

When funds arrive:
1. Bank confirms receipt
2. Update on platform
3. Status changes appropriately

### Manual Recording

If needed:
1. Go to subscription
2. Click **"Record Funding"**
3. Enter amount and date
4. Attach bank confirmation
5. Save

---

## Alerts and Notifications

### Subscription Alerts

Get notified of:
- New submissions
- Signature completions
- Funding receipts
- Status changes

### Setting Up Alerts

1. Go to **Settings** → **Notifications**
2. Enable subscription alerts
3. Choose frequency

### Dashboard Badges

See at a glance:
- Count of pending approvals
- Signatures awaiting
- Overdue items

---

## Reporting

### Subscription Reports

Generate reports:
1. Go to **Subscriptions** → **Reports**
2. Select report type:
   - Pipeline summary
   - Detailed list
   - Funding status
   - Time-to-close analysis
3. Set parameters
4. Generate and download

### Export Options

Export subscription data:
- CSV for analysis
- PDF for sharing
- Excel for detailed work

---

## Common Bottlenecks

### Signature Delays

If signatures are slow:
1. Check which signatories pending
2. Send reminders
3. Contact investor directly
4. Offer assistance

### Funding Delays

If funding is delayed:
1. Verify investor received wire info
2. Check for banking issues
3. Consider deadline extension
4. Document the situation

### Approval Backlogs

If approvals are slow:
1. Check approval queue
2. Escalate urgent items
3. Verify all info complete

---

## Handling Issues

### Subscription Changes

If investor wants to change amount:
1. If before signing: Edit subscription
2. If after signing: May need new documents
3. Document the change

### Withdrawal

If investor withdraws:
1. Update status to `withdrawn`
2. Note the reason
3. Adjust fundraising projections
4. Notify relevant parties

### Duplicate Subscriptions

If duplicate created:
1. Identify correct subscription
2. Cancel duplicate
3. Verify investor understands

---

## Performance Metrics

### Key Metrics to Track

| Metric | Calculation |
|--------|-------------|
| **Conversion Rate** | Subscribed / Interest |
| **Time to Fund** | Days from submission to funded |
| **Signature Time** | Days from approval to signed |
| **Drop-off Rate** | % that don't complete |

### Using Metrics

Identify:
- Process improvements
- Training needs
- System issues

---

## Common Issues

### "Subscription stuck in pending"

Check:
1. Is approval pending?
2. Are there missing documents?
3. Is KYC complete?

### "Signature not progressing"

1. Verify emails delivered
2. Check signatory availability
3. Resend signing links

### "Funding not matching"

1. Verify wire reference used
2. Check currency conversion
3. Confirm bank receipt

---

## Next Steps

As subscriptions progress:

1. [Request Deal Close](./10-requesting-deal-close.md)
2. [Process Commissions](./11-processing-commissions.md)
