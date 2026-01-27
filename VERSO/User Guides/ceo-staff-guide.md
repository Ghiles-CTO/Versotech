# CEO & Staff Guide

Complete guide for staff and CEO operations - KYC review, approvals, user management, and executive oversight.

---

## Your Dashboard

Your dashboard shows:
- Pending approvals
- KYC review queue
- Key metrics (subscriptions, AUM, deals)
- User activity
- Recent actions

---

## Staff Hierarchy

CEO and Staff are part of the same persona with different access levels:

| Role | Access Level | Primary Focus |
|------|--------------|---------------|
| **CEO** | Highest | Final approvals, oversight, countersignatures |
| **Staff Admin** | High | User management, system config, approvals |
| **Staff Ops** | Medium | KYC review, document processing, operations |
| **Staff RM** | Medium | Relationship management, investor support |

CEO can do everything staff can do, plus has final authority on all approvals.

---

## 1. KYC Review Process

### Accessing the Queue

**KYC Review** in sidebar

Queue shows:
- Investor name
- Submission date
- Document count
- Status

### Review Workflow

```
Investor Submits Documents
           │
           ▼
┌─────────────────────────────────────┐
│ REVIEW EACH DOCUMENT                │
│                                     │
│ ✓ APPROVE - Document verified       │
│ ✗ REJECT - Insufficient + reason    │
│ ? REQUEST INFO - Need clarification │
└─────────────────────────────────────┘
           │
           ▼ (when ALL docs approved)

Investor KYC → APPROVED (automatic)
```

### Reviewing Documents

For each submission:

1. Open the submission
2. Review each document:

| Document Type | What to Check |
|---------------|---------------|
| **ID** | Valid, not expired, matches name, clear photo |
| **Proof of Address** | Recent (<3 months), matches profile address |
| **Accreditation** | If required, properly certified |

3. Mark each:
   - **Approve** - Verified correct
   - **Reject** - Add specific reason
   - **Request Info** - Need clarification

### Auto-Approval

When ALL required documents are approved:
- System sets investor status to **APPROVED**
- Investor notified
- They can now invest

### Rejection Best Practices

Be specific:
- ❌ "Document rejected"
- ✓ "ID expired - please provide valid passport or ID"
- ✓ "Address proof over 3 months old - need recent utility bill"
- ✓ "Image too blurry - please rescan at higher resolution"

### Entity KYC

Entity verification requires:

| Document | Purpose |
|----------|---------|
| Certificate of Incorporation | Legal existence |
| Memorandum & Articles | Constitution |
| Register of Directors | Current directors |
| Register of Members | Ownership |
| Bank Confirmation | Account verification |

**Plus** individual KYC for each:
- Authorized signatory
- UBO (>25% owner)

---

## 2. Approval Workflows

### Approval Queue

**Approvals** in sidebar

Views:
- **List** - Sortable list
- **Kanban** - By status columns
- **Database** - Spreadsheet style

### Priority Levels

| Priority | Target Response |
|----------|-----------------|
| 🔴 Critical | Same day |
| 🟠 High | 24 hours |
| 🟡 Medium | 48 hours |
| 🟢 Low | 1 week |

---

### Deal Interest Approval

**What:** Investor wants to learn more about a deal

**Review:**
| Check | Why |
|-------|-----|
| Investor KYC status | Are they verified? |
| Deal appropriateness | Suitable for this investor? |
| Conflicts | Any issues? |

**Actions:**
| Action | Result |
|--------|--------|
| **Approve** | NDA workflow triggers |
| **Reject** | Access denied, investor notified |
| **Request Info** | Ask arranger for context |

**After Approval:**
```
Approved → NDA Generated → Investor Signs → CEO Countersigns → Data Room Access
```

---

### Subscription Approval

**What:** Investor submits capital commitment

**Review:**
| Check | Why |
|-------|-----|
| Investment amount | Within deal limits? |
| KYC status | Should be approved |
| Source of funds | AML compliance |
| Deal capacity | Room for this subscription? |

**Actions:**
| Action | Result |
|--------|--------|
| **Approve** | Subscription pack generated |
| **Reject** | Cancelled, investor notified |
| **Request Revision** | Ask for changes |

**After Approval:**
```
Approved → Sub Pack Generated → Investor Signs → CEO Countersigns → COMMITTED
```

---

### Deal Close Approval

**What:** Arranger requests to finalize deal (CEO authority required)

**Review:**
| Check | Why |
|-------|-----|
| Target vs Funded | Sufficient capital? |
| Subscription status | Key investors funded? |
| Fee plans | Accepted by introducers? |
| Documents | All signed? |
| Issues/Warnings | Any blockers? |

**Actions:**
| Action | Result |
|--------|--------|
| **Approve** | Close handler runs |
| **Reject** | Deal remains open |
| **Defer** | Wait for more progress |

**What Happens on Close:**
```
CEO Approves
     │
     ├─→ Subscriptions: FUNDED → ACTIVE
     ├─→ Positions created in vehicle
     ├─→ Commissions created for introducers/partners
     ├─→ Certificates queued (Lawyer → CEO signing)
     └─→ Notifications sent
```

---

### Data Room Extension

**What:** Investor's 7-day access expired, they request more time

**Review:**
| Check | Why |
|-------|-----|
| Deal still open? | Is extension relevant? |
| Investor subscribed? | Are they proceeding? |
| Reason provided | Legitimate need? |

**Actions:**
| Action | Result |
|--------|--------|
| **Approve** | 7 more days granted |
| **Approve Custom** | Set specific duration |
| **Reject** | Access stays expired |

---

## 3. KYC Override (CEO)

### When to Use

CEO can override KYC status in exceptional cases:
- Urgent deal, KYC pending
- Minor document issues
- Staff escalation

### How to Override

1. **Users** → **[Investor]** → **KYC**
2. **CEO Override**
3. Select new status
4. Enter justification (required)
5. Confirm

### Audit Trail

All overrides are logged:
- Who, when, reason
- Previous status
- For compliance review

---

## 4. Document Signing (CEO)

### Documents Requiring CEO Signature

| Document | When CEO Signs |
|----------|----------------|
| **NDA** | Countersign after investor |
| **Subscription Pack** | Countersign after investor |
| **Certificate** | Countersign after lawyer |
| **Introducer Agreement** | May sign as Party A |

### Finding Pending Signatures

**My Tasks** → **Pending Signatures**

Or check email for signing links.

### Signing Process

1. Open document
2. Review content
3. Apply signature
4. Submit

### Multi-Signatory Context

For entity investors:
- All their signatories sign first
- CEO signs last (countersignature)
- Document complete when CEO signs

---

## 5. User Management

### Creating Users

**Users** → **+ Add User**

| Field | Required |
|-------|----------|
| Email | ✓ (unique) |
| Name | ✓ |
| Personas | ✓ |

### Assigning Personas

Available personas:
- investor
- arranger
- introducer
- partner
- commercial_partner
- lawyer
- staff (admin/ops/rm)
- ceo

### Deactivating Users

1. **Users** → **[User]**
2. **Deactivate**
3. Immediate access removal
4. Historical data preserved

### Password Resets

**Users** → **[User]** → **Send Password Reset**

---

## 6. Entity Management

### Creating Entities

**Entities** → **+ Create Entity**

| Field | Description |
|-------|-------------|
| Legal Name | Registered name |
| Entity Type | Company, Trust, Fund |
| Jurisdiction | Registration country |
| Tax ID | VAT/Tax number |

### Managing Members

For each entity:
1. **Entities** → **[Entity]** → **Members**
2. Add authorized signatories
3. Set roles (Director, Signatory, UBO)
4. Each member needs KYC

---

## 7. Delegation (CEO to Staff)

### Setting Up

**Settings** → **Delegations**

### What Can Be Delegated

| Approval Type | Common Delegation |
|---------------|-------------------|
| KYC Review | Staff Ops |
| Data Room Extension | Staff Ops |
| Deal Interest | Staff RM |
| Subscription (under $X) | Staff Admin |
| Deal Close | Usually NOT delegated |

### Setting Limits

- Amount thresholds
- Deal types
- Specific entities

### Monitoring

Review delegated actions:
- Who approved what
- Within limits
- Patterns/issues

---

## 8. Operations Tasks

### Bank Reconciliation

**Finance** → **Bank Reconciliation**

Match incoming wires to subscriptions:
1. View unmatched transactions
2. Match to subscriptions
3. Subscription funding status updates

### Subscription Monitoring

Track:
- Pending approvals
- Awaiting signatures
- Awaiting funding

### Invoice Processing

**Finance** → **Invoices**

Review submitted invoices:
1. Verify amount matches commission
2. Approve or reject
3. Queue for payment

---

## 9. Reporting & Audit

### Activity Reports

- KYC processing volume
- Approval timing
- User activity

### Audit Logs

All actions logged:
- Who did what, when
- Changes made
- For compliance

### Key Metrics

| Metric | Track |
|--------|-------|
| KYC review time | < 48 hours |
| Approval queue size | Keep manageable |
| SLA compliance | Meet targets |

---

## Troubleshooting

### "Approval stuck in pending"

- Check assignment
- Verify no blocking conditions
- Check for validation errors

### "KYC won't auto-approve"

- Some documents may be rejected
- Check each document status
- All required types present?

### "User can't log in"

- Account active?
- Email verified?
- Password reset needed?

### "Commission not created"

Check:
1. Fee plan ACCEPTED?
2. Introducer agreement ACTIVE?
3. Investor dispatched WITH fee plan?
4. Subscription FUNDED?
5. Deal CLOSED?

---

## Best Practices

### KYC Review
- [ ] Review all documents per submission
- [ ] Be specific in rejections
- [ ] Complete within 48 hours
- [ ] Flag suspicious documents
- [ ] Maintain consistent standards

### Approvals
- [ ] Check queue daily
- [ ] Prioritize by urgency
- [ ] Provide clear rejection reasons
- [ ] Delegate appropriately

### Security
- [ ] Log out when away
- [ ] Don't share credentials
- [ ] Report suspicious activity
- [ ] Document exceptions

---

## Emergency Actions

### Immediate Deactivation

If security concern:
1. **Users** → **[User]** → **Deactivate**
2. Immediate effect
3. Document reason

### Revoking Data Room Access

1. **Deal** → **Data Room** → **Access**
2. Find user → **Revoke**
3. Immediate effect
