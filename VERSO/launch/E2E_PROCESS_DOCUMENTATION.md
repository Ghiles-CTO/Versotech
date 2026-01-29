f# Versotech Complete E2E Process Documentation

## Overview

This document captures the **complete end-to-end user processes** as implemented in the Versotech codebase. All flows are documented based on actual code analysis of API routes, components, and database schemas.

---

## MASTER FLOW: Deal Lifecycle

```
Vehicle exists
    ↓
Deal Created (draft) → Term Sheet Created → Term Sheet Published
    ↓
Fee Plans Created:
├── Introducer Fee Plan → Introducer Agreement (must sign before dispatch)
├── Partner Fee Plan → Partner accepts (no formal agreement)
└── Commercial Partner Fee Plan → Placement Agreement (must sign)
    ↓
Deal Dispatched to Investors (with fee plan assignment)
    ↓
Investor Confirms Interest → NDA Generated → NDA Signed (multi-signatory)
    ↓
Data Room Access Granted (7-day auto-expiry)
    ↓
Investor Submits Subscription → CEO/Arranger Reviews → Approved
    ↓
Subscription Pack Generated → Multi-Signatory Signing:
├── Party B (CEO/Issuer) signs FIRST
├── Party A (Investor signatories) sign SECOND
└── Party C (Arranger) signs THIRD (if applicable)
    ↓
Subscription Committed → Investor Funds Escrow
    ↓
Lawyer Confirms Escrow Funding → Subscription Funded
    ↓
Deal Close Date Reached OR Manual Trigger
    ↓
Subscription Activated → Position Created in Portfolio
    ↓
Certificate Generated → Dual-Signature (CEO + Lawyer)
    ↓
Commissions Accrued → Invoice Submitted → Payment Confirmed
```

---

## PERSONAS & THEIR ROLES

| Persona | Primary Role | Key Actions |
|---------|-------------|-------------|
| **CEO** | Platform owner | Approve deals, sign documents, countersign certificates |
| **Arranger** | Deal manager | Create deals, dispatch investors, manage fee plans |
| **Investor** | Capital provider | Confirm interest, sign NDA, subscribe, fund |
| **Introducer** | Referral broker | Sign agreement, introduce investors, submit invoices |
| **Partner** | Co-investor referrer | Share deals, receive commissions |
| **Commercial Partner** | Wealth manager proxy | Manage clients, execute proxy subscriptions |
| **Lawyer** | Payment officer | Confirm escrow, sign certificates, confirm payments |

---

## PROCESS 1: Deal & Term Sheet Creation

### Who: CEO/Arranger
### Key Files:
- `/src/app/api/deals/route.ts`
- `/src/components/deals/create-deal-form.tsx`
- `/src/app/api/deals/[id]/termsheets/route.ts`

**Flow:**
```
Create Deal (draft) → Add Term Sheet → Configure Fee Structure → Publish Term Sheet
```

**Steps:**

1. **Create Deal**
   - URL: `/versotech_main/deals/new`
   - API: `POST /api/deals`
   - Required fields: name, company_name, deal_type, stock_type, vehicle_id, currency
   - Status: `draft`

2. **Create Term Sheet**
   - API: `POST /api/deals/[id]/termsheets`
   - Fields:
     - `structure`: Product description (e.g., "Shares of Series B Preferred Stock")
     - `completion_date`: When subscriptions activate
     - `subscription_fee_percent`: Investor fee rate
     - `fee_components`: subscription, performance, management fees

3. **Publish Term Sheet**
   - API: `PATCH /api/deals/[id]/termsheets/[termsheetId]`
   - Status: `draft` → `published`
   - Now available for dispatch

**Database Tables:**
- `deals`: Main deal record
- `deal_fee_structures`: Term sheet data (versioned)

**Test Credentials:** `cto@versoholdings.com` / `123123`

---

## PROCESS 2: Fee Plan Creation & Agreement Workflows

### Who: CEO/Arranger → Introducer/Partner/Commercial Partner

**Three distinct workflows based on entity type:**

### 2A. Introducer Fee Plan & Agreement

**Key Files:**
- `/src/app/api/fee-plans/route.ts`
- `/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts`
- `/src/lib/signature/handlers.ts` (handleIntroducerAgreementSignature)

**Flow:**
```
Create Fee Plan → Send to Introducer → Introducer Accepts → Generate Agreement →
Arranger/CEO Signs → Introducer Signs (multi-signatory) → Agreement Active
```

**Steps:**

1. **Create Fee Plan**
   - API: `POST /api/fee-plans`
   - Required: `deal_id`, `introducer_id`, `fee_components`
   - Status: `draft`

2. **Send to Introducer**
   - API: `POST /api/fee-plans/[id]/send`
   - Status: `draft` → `sent`
   - Notification created for introducer

3. **Introducer Accepts**
   - API: `POST /api/fee-plans/[id]/accept`
   - Status: `sent` → `accepted`
   - Sets `accepted_at`, `accepted_by`

4. **Generate Introducer Agreement (BI Agreement)**
   - API: `POST /api/staff/fees/plans/[id]/generate-agreement`
   - Creates `introducer_agreements` record
   - Triggers n8n workflow: `generate-introducer-agreement`
   - Template: DOC 3 with fee terms, subscriber table, performance fee section

5. **Arranger/CEO Signs First (party_a)**
   - VERSOSign workflow
   - Status: `pending_introducer_signature`

6. **Introducer Signs (party_b, party_b_2, etc.)**
   - All `introducer_users` with `can_sign = true` must sign
   - Progressive signing: each signer signs previous PDF
   - When ALL signed → Status: `active`

**Critical:** Introducer MUST have active signed agreement before introducing investors to deals.

**Test Credentials:**
- Arranger: `sales@aisynthesis.de` / `TempPass123!`
- Introducer: `py.moussaouighiles@gmail.com` / `TestIntro2024!`

### 2B. Partner Fee Plan

**Flow:**
```
Create Fee Plan → Send to Partner → Partner Accepts → Ready for Dispatch
```

**Simpler than Introducer:**
- No formal agreement signing required (pending implementation)
- Partner accepts fee model directly
- Can share deals after acceptance

**Test Credentials:**
- Partner: `cto@verso-operation.com` / `VersoPartner2024!`

### 2C. Commercial Partner Fee Plan & Placement Agreement

**Flow:**
```
Create Fee Plan → Send to CP → CP Accepts → Generate Placement Agreement →
CP Signs → CEO Signs → Agreement Active
```

**Similar to Introducer but:**
- Uses `placement_agreements` table
- Commercial Partner can execute proxy subscriptions for clients
- Linked via `commercial_partner_id`

**Test Credentials:**
- Commercial Partner: `cm.moussaouighiles@gmail.com` / `CommercialPartner2024!`

---

## PROCESS 3: Deal Dispatch to Investors

### Who: CEO/Arranger → Investor
### Key Files:
- `/src/app/api/deals/[id]/dispatch/route.ts`
- `/src/components/deals/share-deal-dialog.tsx`

**Flow:**
```
Select Investors → Assign Fee Plan (if via introducer/partner) → Dispatch →
Investors See Deal in Pipeline
```

**API:** `POST /api/deals/[id]/dispatch`

**Request Body:**
```typescript
{
  user_ids: ["uuid1", "uuid2"],
  role: "investor" | "introducer_investor" | "partner_investor" | "commercial_partner_investor",
  referred_by_entity_id?: "introducer-or-partner-id",
  referred_by_entity_type?: "introducer" | "partner" | "commercial_partner",
  assigned_fee_plan_id?: "fee-plan-id"  // Required if referred
}
```

**Validations:**
1. Fee plan must be in `accepted` status
2. For `introducer_investor`: Introducer must have active signed agreement
3. Creates `deal_memberships` with `dispatched_at` timestamp

**Database:** `deal_memberships` table
- `dispatched_at`: Authorization timestamp
- `referred_by_entity_id` + `referred_by_entity_type`: Referrer tracking
- `assigned_fee_plan_id`: Commission calculation source

**Test Credentials:** `cto@versoholdings.com` / `123123`

---

## PROCESS 4: Investor Interest & NDA Signing

### Who: Investor
### Key Files:
- `/src/app/api/deals/[id]/interests/route.ts`
- `/src/lib/signature/handlers.ts` (handleNDASignature)
- `/src/app/api/automation/nda-complete/route.ts`

**Flow:**
```
Investor Confirms Interest → NDA Generated → Investor Signs → Admin Signs →
Data Room Access Granted (7 days)
```

**Steps:**

1. **Submit Interest**
   - API: `POST /api/deals/[id]/interests`
   - Creates `investor_deal_interest` record
   - Status: `pending_review`

2. **Arranger Approves Interest**
   - API: `POST /api/deals/[id]/interests/[interestId]/approve`
   - Status: `pending_review` → `approved`

3. **NDA Generated**
   - Triggered automatically on approval
   - n8n workflow: `generate-deal-interest-nda`
   - Creates `documents` record with type: `nda`

4. **NDA Signing (Multi-Signatory)**
   - **Investor signs first**
   - **Admin/Staff signs second** (countersignature)
   - Both signatures required before data room access

5. **Post-NDA Handler Actions** (`handleNDASignature`):
   - Copy signed PDF to documents bucket
   - Path: `ndas/{deal_id}/{DealName}_{InvestorName}_{timestamp}.pdf`
   - Grant 7-day data room access
   - Update `deal_memberships` journey tracking
   - Create notification for investor

**Critical:** Multi-signatory check ensures ALL required signatures complete before granting access.

**Test Credentials:**
- Investor: `biz@ghiless.com` / `22122003`
- Approver: `cto@versoholdings.com` / `123123`

---

## PROCESS 5: Data Room Access

### Who: Investor (post-NDA)
### Key Files:
- `/src/components/data-room/data-room-viewer.tsx`
- `/src/app/api/deals/[id]/data-room-access/route.ts`

**Access Rules:**
- Granted automatically after NDA signed by all parties
- 7-day expiry (can be extended)
- `deal_data_room_access` record created

**What Investor Sees:**
- Folder structure organized by category
- Document metadata (size, date, uploader)
- PDF/image preview inline
- Download capability

**Activity Tracking:**
- `viewed_at` timestamp on `deal_membership`
- Arranger can see who accessed what documents

---

## PROCESS 6: Subscription Submission & Approval

### Who: Investor → CEO/Arranger
### Key Files:
- `/src/app/api/subscriptions/create/route.ts`
- `/src/components/deals/subscribe-now-dialog.tsx`

**Flow:**
```
Investor Submits Subscription → Capacity Check → CEO/Arranger Reviews →
Approved → Subscription Pack Generated
```

**Steps:**

1. **Submit Subscription**
   - API: `POST /api/subscriptions/create`
   - Fields:
     ```typescript
     {
       investor_id: "uuid",
       vehicle_id: "uuid",
       deal_id: "uuid",
       commitment: 1000000,
       currency: "USD",
       effective_date: "2024-01-15",
       funding_due_at: "2024-02-15"
     }
     ```
   - Auto-generates `subscription_number` via DB sequence
   - Status: `pending`

2. **Capacity Check**
   - API: `GET /api/deals/[dealId]/capacity`
   - Validates: target amount, min/max ticket, remaining capacity
   - Prevents over-subscription

3. **CEO/Arranger Review**
   - Review submission details
   - Approve or request changes
   - Status: `pending` → `approved`

4. **Subscription Pack Generated**
   - n8n workflow creates PDF pack
   - Contains: Subscription Summary, Equity Certificate Agreement, Escrow Banking Info
   - Creates `documents` record with `ready_for_signature = true`

**Test Credentials:**
- Investor: `biz@ghiless.com` / `22122003`
- Approver: `cto@versoholdings.com` / `123123`

---

## PROCESS 7: Subscription Pack Multi-Signatory Signing

### Who: CEO → Investor(s) → Arranger (if applicable)
### Key Files:
- `/src/lib/signature/client.ts` (lines 960-1881)
- `/src/lib/signature/handlers.ts` (handleSubscriptionSignature)
- `/src/lib/signature/anchor-detector.ts`

**Signature Order (CRITICAL):**
```
1. Party B (CEO/Issuer) signs FIRST
2. Party A (Investor signatories) sign SECOND
3. Party C (Arranger) signs THIRD (if separate entity)
```

**Document Structure:**
```
Subscription Pack Layout:
├── Page 2: Investor Subscription Form
├── Page 3: Bank Transfer Instructions
├── Page 12: Main Agreement (all signers)
└── Page 39: Terms & Conditions (party_b + party_c only)

Signature Positions (via SIG_ANCHOR_* markers):
├── party_a (investor): Pages 2, 12
├── party_a_2+ (multi-signatory): Pages 2, 12
├── party_b (CEO/Issuer): Pages 2, 3, 12, 39
└── party_c (Arranger): Pages 12, 39
```

**Progressive Signing Flow:**

1. **CEO Signs (party_b)**
   - Downloads unsigned PDF
   - Embeds signature on pages 2, 3, 12, 39
   - Uploads signed PDF
   - Creates task for investor

2. **Investor Signs (party_a, party_a_2, etc.)**
   - **Validation:** party_b must have signed first
   - Downloads CEO-signed PDF
   - Embeds signature on pages 2, 12
   - For entity investors: ALL authorized signatories must sign
   - When all investor signatures complete → Status: `committed`

3. **Auto-Commit Check** (`checkAndCommitSubscriptionIfInvestorComplete`):
   - Checks if ALL investor role signatures are complete
   - If yes: subscription.status → `committed`
   - Creates fee events (investor + partner fees)
   - Sends commitment notification

4. **Arranger Signs (party_c)** - if applicable
   - Final signature on pages 12, 39
   - Completes the pack

**Post-Signature Handler Actions:**
- Copy signed PDF to deal-documents bucket
- Update document status → `published`
- Create notifications for investor, lawyers, arrangers
- Log audit entry

**Test Credentials:**
- CEO: `cto@versoholdings.com` / `123123`
- Investor: `biz@ghiless.com` / `22122003`

---

## PROCESS 8: Escrow Funding & Lawyer Confirmation

### Who: Investor → Lawyer
### Key Files:
- `/src/app/(main)/versotech_main/reconciliation/page.tsx`
- Lawyer user stories (Section 3.3)

**Flow:**
```
Subscription Committed → Investor Receives Wire Instructions →
Investor Wires Funds → Lawyer Confirms Receipt → Subscription Funded
```

**Steps:**

1. **Wire Instructions Sent**
   - After subscription committed
   - Investor receives escrow account details
   - Includes: beneficiary, account number, wire instructions, deadline

2. **Investor Wires Funds**
   - Amount: subscription `funded_amount`
   - Deadline: `funding_due_at`

3. **Lawyer Confirms Escrow Funding**
   - Lawyer dashboard: `/versotech_main/reconciliation`
   - Views: Subscription Reconciliation tab
   - Confirms funds received
   - Status: `committed` → `funded`

**Reconciliation Tabs (Lawyer View):**
1. **Deal Summary** - Compartment-level totals
2. **Subscription Reconciliation** - Each investor transaction
3. **Partner Fee Payments** - Partner invoice tracking
4. **Introducer Fee Payments** - Introducer invoice tracking

**Test Credentials:**
- Lawyer: `sales@aisynthesis.de` / `TempPass123!` (has lawyer persona)

---

## PROCESS 9: Deal Close & Subscription Activation

### Who: System (automatic) or CEO (manual trigger)
### Key Files:
- `/src/lib/deals/deal-close-handler.ts`
- `/src/app/api/cron/deal-close-check/route.ts`

**Triggers:**
1. **Automatic:** Deal `close_at` date reached (daily cron job)
2. **Manual:** CEO triggers close via API
3. **Term Sheet Level:** Individual term sheet completion

**`handleDealClose()` Actions:**

1. **Activate Subscriptions**
   ```typescript
   // Get all funded subscriptions awaiting activation
   for (const sub of fundedSubscriptions) {
     await supabase.from('subscriptions').update({
       status: 'active',
       activated_at: now,
       spread_per_share: pricePerShare - costPerShare,
       spread_fee_amount: (pricePerShare - costPerShare) * numShares
     }).eq('id', sub.id)
   }
   ```

2. **Create Portfolio Positions**
   ```typescript
   // For each activated subscription
   await supabase.from('positions').insert({
     investor_id: sub.investor_id,
     vehicle_id: sub.vehicle_id || deal.vehicle_id,
     units: positionUnits,
     cost_basis: fundedAmount,     // Initial investment
     last_nav: initialNav,          // Per-unit value
     as_of_date: now
   })
   ```

3. **Trigger Certificate Generation** (see Process 10)

4. **Create Commissions** (see Process 11)

5. **Enable Invoice Requests**
   - Set `fee_plans.invoice_requests_enabled = true`
   - Notify introducers/partners: "Deal closed, submit invoices"

**Idempotency:** `closed_processed_at` prevents duplicate processing

---

## PROCESS 10: Certificate Generation & Dual-Signature

### Who: System → CEO → Lawyer
### Key Files:
- `/src/lib/subscription/certificate-trigger.ts` (778 lines)
- `/src/lib/signature/handlers.ts` (handleCertificateSignature)

**Trigger:** Subscription activated (status → `active` or `funded`)

**Flow:**
```
Subscription Activated → Certificate Generated → CEO Signs (party_a, LEFT) →
Lawyer Signs (party_b, RIGHT) → Published to Investor
```

**Certificate Generation Payload:**
```typescript
{
  // Certificate Number
  certificate_number: "VC{series_number}SH{subscription_number}",

  // Content
  units: subscription.units || subscription.num_shares,
  close_at: termsheet.completion_date,
  investor_name: investor.legal_name || "First Last",
  structure: termsheet.structure,

  // Issuer Info
  vehicle_name: vehicle.name,
  company_name: deal.company_name,
  vehicle_registration_number: vehicle.registration_number,

  // Signatories (signatures added via VERSOSign)
  signatory_1_name: 'Mr Julien Machot',
  signatory_1_title: 'Managing Partner',
  signatory_2_name: lawyer.display_name || 'G.A. Giles',
  signatory_2_title: 'Authorized Signatory'
}
```

**Signing Workflow:**

1. **CEO Signs First (party_a - LEFT position)**
   - Creates signature request with 30-day expiry
   - Signs via VERSOSign
   - Updates `unsigned_pdf_path` for lawyer

2. **Lawyer Signs Second (party_b - RIGHT position)**
   - Gets CEO-signed PDF
   - Embeds signature on right position
   - When complete → Document published

3. **Certificate Published**
   - `document.status` → `published`
   - Investor notification: "Certificate Issued"
   - Lawyer notification: "Certificate Issued"
   - Visible in investor portfolio

**Lawyer Assignment:**
- Primary: `deal_lawyer_assignments` table
- Fallback: CTO (`cto@versoholdings.com`) for testing

**Test Credentials:**
- CEO: `cto@versoholdings.com` / `123123`
- Lawyer: `sales@aisynthesis.de` / `TempPass123!`

---

## PROCESS 11: Commission Accrual & Payment Lifecycle

### Who: System → Introducer/Partner/CP → Lawyer
### Key Files:
- `/src/lib/deals/deal-close-handler.ts`
- `/src/app/api/introducers/me/commissions/[id]/submit-invoice/route.ts`
- `/src/app/api/lawyers/me/introducer-commissions/[id]/confirm-payment/route.ts`

**Commission Types:**
- `introducer_commissions`
- `partner_commissions`
- `commercial_partner_commissions`

**Status Flow:**
```
accrued → invoice_submitted → invoiced → paid
              ↓
           rejected (can resubmit)
```

**Step 1: Commission Accrual (on Deal Close)**

```typescript
// For each funded subscription with assigned fee plan
const commissionAmount = (fundedAmount * rateBps) / 10000

// Validation for introducers
const activeAgreement = await supabase
  .from('introducer_agreements')
  .select('id')
  .eq('introducer_id', introducerId)
  .eq('status', 'active')
  .not('signed_date', 'is', null)

if (!activeAgreement) {
  // Commission skipped - introducer agreement not active
  continue
}

await supabase.from('introducer_commissions').insert({
  introducer_id,
  deal_id,
  investor_id,
  fee_plan_id,
  basis_type: 'invested_amount',  // ALWAYS funded_amount
  rate_bps: rateBps,
  base_amount: fundedAmount,
  accrual_amount: commissionAmount,
  currency,
  status: 'accrued'
})
```

**CRITICAL:** Commission basis is ALWAYS `funded_amount`, never includes management fees.

**Step 2: Accrual Notification**
- Notification sent to all entity users
- Message: "You've earned a ${amount} commission for {investor}'s investment"
- Link to `/versotech_main/my-commissions`

**Step 3: Invoice Submission (Introducer/Partner/CP)**
- API: `POST /api/introducers/me/commissions/[id]/submit-invoice`
- Body:
  ```typescript
  {
    invoice_number: "INV-2024-001",
    invoice_amount: 10000,
    invoice_attachment: "file_url"  // PDF of actual invoice
  }
  ```
- Status: `accrued` → `invoice_submitted`

**Step 4: Lawyer/CEO Approval**
- Review submitted invoice
- Approve: Status → `invoiced`
- Reject: Status → `rejected` (with reason)

**Step 5: Payment Confirmation (Lawyer)**
- API: `POST /api/lawyers/me/introducer-commissions/[id]/confirm-payment`
- Status: `invoiced` → `paid`
- Sets `paid_at` timestamp
- Notification to entity: "Payment confirmed"

**Test Credentials:**
- Introducer: `py.moussaouighiles@gmail.com` / `TestIntro2024!`
- Partner: `cto@verso-operation.com` / `VersoPartner2024!`
- Commercial Partner: `cm.moussaouighiles@gmail.com` / `CommercialPartner2024!`
- Lawyer: `sales@aisynthesis.de` / `TempPass123!`

---

## PROCESS 12: Portfolio & Holdings View

### Who: Investor
### Key Files:
- `/src/components/portfolio/portfolio-dashboard.tsx`
- `/src/app/(main)/versotech_main/portfolio/page.tsx`

**Position Data (from `positions` table):**
```typescript
{
  investor_id,
  vehicle_id,
  units,           // Number of shares/units
  cost_basis,      // Total amount invested
  last_nav,        // Current per-unit value
  as_of_date       // Last updated
}

// Derived values:
total_value = units * last_nav
unrealized_pnl = total_value - cost_basis
return_pct = (total_value - cost_basis) / cost_basis * 100
```

**KPIs Displayed:**
- Current NAV
- Total Contributed
- Total Distributions
- Unfunded Commitment
- Cost Basis
- Unrealized Gain
- DPI, TVPI, IRR

**Holdings Visualization:**
- Allocation chart by vehicle/sector
- NAV performance over time
- Cash flow chart (contributions vs distributions)

---

## VERSOSIGN: Digital Signature System

### Overview
VERSOSign is Verso's proprietary multi-party signature system.

### Key Files:
- `/src/lib/signature/client.ts` - Main orchestration
- `/src/lib/signature/handlers.ts` - Post-signature logic
- `/src/lib/signature/anchor-detector.ts` - Multi-page anchor detection
- `/src/app/(staff)/versotech/staff/versosign/page.tsx` - Staff dashboard

### Signature Request Creation
```typescript
createSignatureRequest({
  workflow_run_id,
  investor_id,
  signer_email,
  signer_name,
  document_type: 'nda' | 'subscription' | 'certificate' | 'introducer_agreement',
  signer_role: 'investor' | 'ceo' | 'admin' | 'lawyer',
  signature_position: 'party_a' | 'party_b' | 'party_c'
})
```

### Signing URL
```
/versotech_main/versosign?token={32-byte-hex-token}
```

### Security Features:
- 32-byte secure signing tokens
- Token expiry (7 days default, 30 days for certificates)
- OTP verification for external signers
- Progressive signing with locking
- Duplicate prevention via (workflow_run_id, signer_role) pair

---

## DATABASE TABLES REFERENCE

### Deal Lifecycle
| Table | Purpose |
|-------|---------|
| `deals` | Main deal record (status, close_at, vehicle_id) |
| `deal_fee_structures` | Term sheets (versioned, fee components) |
| `deal_memberships` | User ↔ Deal relationship (dispatch, referral) |

### Subscriptions
| Table | Purpose |
|-------|---------|
| `subscriptions` | Subscription records (status progression) |
| `positions` | Portfolio holdings after activation |
| `documents` | All documents (NDA, certificates, packs) |

### Agreements & Signatures
| Table | Purpose |
|-------|---------|
| `fee_plans` | Fee arrangements (status: draft→sent→accepted) |
| `introducer_agreements` | BI agreements (must be active before dispatch) |
| `placement_agreements` | Commercial partner agreements |
| `signature_requests` | All signature tracking (token, status, positions) |

### Commissions
| Table | Purpose |
|-------|---------|
| `introducer_commissions` | Introducer payouts |
| `partner_commissions` | Partner payouts |
| `commercial_partner_commissions` | CP payouts |

### Entities
| Table | Purpose |
|-------|---------|
| `investors` | Investor records (individual/entity) |
| `introducers` | Introducer entities |
| `partners` | Partner entities |
| `commercial_partners` | Commercial partner entities |
| `*_users` | Junction tables linking users to entities |

---

## TEST CREDENTIALS

| Email | Password | Personas |
|-------|----------|----------|
| `cto@versoholdings.com` | `123123` | CEO, Arranger, Introducer, Investor |
| `sales@aisynthesis.de` | `TempPass123!` | Arranger, Commercial Partner, Introducer, Lawyer, Partner |
| `biz@ghiless.com` | `22122003` | Investor |
| `py.moussaouighiles@gmail.com` | `TestIntro2024!` | Introducer, Investor |
| `cto@verso-operation.com` | `VersoPartner2024!` | Investor, Partner |
| `cm.moussaouighiles@gmail.com` | `CommercialPartner2024!` | Commercial Partner |

---

## STATUS FLOWS REFERENCE

### Deal Status
```
draft → active → closing → closed
```

### Term Sheet Status
```
draft → published → dispatched → closed
```

### Subscription Status
```
pending → approved → committed → signed → funded → active
```

### Fee Plan Status
```
draft → sent → accepted/rejected
```

### Introducer Agreement Status
```
pending_signature → pending_introducer_signature → active
```

### Commission Status
```
accrued → invoice_submitted → invoiced → paid
              ↓
           rejected
```

### Signature Request Status
```
pending → signed → expired/cancelled
```

---

## CRITICAL GOTCHAS

1. **Commission basis is ALWAYS `funded_amount`** - Never includes management_fee, regardless of fee plan complexity

2. **Introducer agreements are prerequisites** - Introducers must sign agreements BEFORE they can introduce investors to deals

3. **Multi-signatory workflow requires ALL signatures** - Subscription packs don't progress until all parties sign (CEO → Investor → Arranger)

4. **Fee plans must be ACCEPTED before dispatch** - Cannot dispatch investors through introducers/partners without prior acceptance

5. **Certificates generated at close, not at funding** - Generated on deal closing date OR when subscription becomes funded

6. **Positions created on deal close** - Portfolio allocation happens automatically during `handleDealClose()`

7. **Invoice requests enabled on deal close** - Introducers/partners can only request invoices AFTER deal close

8. **Progressive signing order enforced** - Investor cannot sign until CEO has signed (party_b before party_a)

9. **Certificate visibility** - Status `pending_signature` means hidden from investor until BOTH CEO + lawyer sign

10. **NDA data room access** - Granted ONLY when ALL investor + admin signatures complete (7-day auto-expiry)
