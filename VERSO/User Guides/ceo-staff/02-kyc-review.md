# CEO & Staff Guide: KYC Review

Review and approve investor KYC submissions.

![KYC Document Review](./screenshots/08-kyc-review.png)
*The KYC Document Review page with summary cards and submission filters.*

---

## Overview

KYC (Know Your Customer) review is a critical compliance function. You verify investor documents and either approve or request corrections.

---

## KYC Workflow

```
Investor Submits → Staff Review → Approved ✓
                              → Rejected → Resubmit
                              → Expired → Renewal Required
```

### KYC Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting investor submission |
| `submitted` | Ready for staff review |
| `approved` | KYC verified, investor can invest |
| `rejected` | Issues found, resubmission needed |
| `expired` | KYC validity period has lapsed |

---

## Accessing KYC Queue

### Navigation

1. Go to **KYC Review** in the left sidebar
2. See the KYC Document Review page
3. Summary cards show status breakdown

### Summary Cards

At the top, you'll see status counts:

| Card | Description |
|------|-------------|
| **Total** | All KYC submissions |
| **Draft** | Started but not submitted |
| **Pending** | Awaiting review (orange) |
| **Under Review** | Currently being reviewed |
| **Approved** | Completed and approved (green) |
| **Rejected** | Needs correction (red) |
| **Expired** | Past validity period |

### Filters

Use the filters to narrow down submissions:

| Filter | Options |
|--------|---------|
| **Status** | All Statuses, Pending, Approved, etc. |
| **Document Type** | All Types, or specific document types |
| **Investor** | All Investors, or search specific investor |
| **Search** | Search investor name or email |

### Submissions Table

The table shows columns: **Investor**, **Document Type**, **Content**, **Submitted**, **Status**, **Reviewer**, **Actions**

---

## Reviewing a Submission

### Step 1: Open Submission

1. Click on a KYC item
2. Full details open
3. Documents accessible

### Step 2: Review Investor Information

Check:
| Section | Verify |
|---------|--------|
| **Personal Info** | Name, DOB, nationality |
| **Contact** | Email, phone, address |
| **Tax Status** | FATCA/CRS declarations |
| **Source of Wealth** | Explanation and evidence |

### Step 3: Review Documents

For each document:
- Open and view
- Check validity (not expired)
- Verify readability
- Confirm matches declarations

---

## Document Checklist

### For Individuals

| Document | Check |
|----------|-------|
| **ID/Passport** | Clear photo, all corners, not expired |
| **Proof of Address** | Recent (< 3 months), matches address |
| **Source of Wealth** | Evidence provided |

### For Entities

| Document | Check |
|----------|-------|
| **Certificate of Incorporation** | Current, valid |
| **Constitutional Documents** | Complete |
| **Directors Register** | Current listing |
| **Shareholders/UBOs** | Ownership clear |
| **UBO KYC** | Each 25%+ owner verified |

---

## Making a Decision

### Approving KYC

If everything is satisfactory:
1. Click **"Approve"**
2. Confirm the action
3. Investor notified
4. Status: `approved`

### Rejecting KYC

If issues found:
1. Click **"Reject"**
2. **Enter specific feedback**:
   - Which document has issues
   - What needs correction
   - What they need to provide
3. Confirm
4. Investor notified with feedback
5. Status: `rejected`

---

## Common Issues to Flag

### Document Issues

| Issue | Feedback Example |
|-------|------------------|
| **Expired ID** | "Passport expired. Please provide current passport." |
| **Blurry image** | "ID photo unclear. Please retake with all corners visible." |
| **Old address proof** | "Utility bill is 6 months old. Please provide one less than 3 months." |
| **Missing pages** | "Trust deed incomplete. Please upload all pages." |

### Information Issues

| Issue | Feedback Example |
|-------|------------------|
| **Name mismatch** | "Name on passport doesn't match profile. Please clarify." |
| **Missing UBO** | "Entity has 4 shareholders but only 2 UBOs listed." |
| **Unclear source** | "Source of wealth explanation insufficient. Please elaborate." |

---

## Entity KYC Considerations

### Corporate Structures

For complex entities:
- Trace ownership up the chain
- Each UBO (25%+) needs personal KYC
- Structure chart helpful

### Regulated Entities

Some entities are simplified:
- Listed companies
- Regulated financial institutions
- Government entities

---

## High-Risk Indicators

### Watch For

| Indicator | Action |
|-----------|--------|
| **PEP** (Politically Exposed Person) | Enhanced review |
| **High-risk jurisdiction** | Additional documentation |
| **Complex structure** | Detailed analysis |
| **Large amounts** | Extra scrutiny |

### Escalation

If uncertain:
1. Consult compliance
2. Request additional docs
3. Escalate to senior staff

---

## KYC Expiry

### Ongoing Monitoring

KYC isn't permanent:
- ID documents expire
- Proof of address: 12 months
- Full refresh: 24 months

### Renewal Process

System tracks expiry:
- Notifications sent
- Investor resubmits
- You re-review

---

## Tracking and Reporting

### KYC Status Report

1. Go to **Reports** → **KYC Status**
2. See:
   - Pending count
   - Approved count
   - Rejection rate
   - Average review time

### Audit Trail

All actions logged:
- Who reviewed
- When decided
- Feedback given
- Status changes

---

## Best Practices

### Consistency

Apply same standards to all:
- Document all decisions
- Follow procedures
- Escalate appropriately

### Timely Review

Process promptly:
- Investors waiting
- Deal timelines
- Service levels

### Clear Feedback

When rejecting:
- Be specific
- Be actionable
- Be professional

---

## Next Steps

1. [Interest Approval](./03-deal-interest-approval.md)
2. [Subscription Approval](./04-subscription-approval.md)
