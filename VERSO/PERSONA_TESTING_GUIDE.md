# VERSO Platform - Complete Persona Testing Guide (V2)

**Purpose:** Comprehensive testing bible for all 7 user personas in the unified `/versotech_main/` portal.
**Version:** 2.0 - Updated with Enablers, GDPR, correct status values, and complete route mapping
**Last Updated:** 2025-12-28

---

## Quick Reference

### Persona Login Matrix
| Persona | Auth Link Table | First Page | Navigation Items |
|---------|-----------------|------------|------------------|
| CEO/Staff | `profiles.role = 'staff_admin'` OR `'ceo'` | `/dashboard` | Full admin access |
| Investor | `investor_users` | `/dashboard` | Opportunities, Portfolio, Documents |
| Arranger | `arranger_users` | `/dashboard` | My Mandates, My Partners, Fee Plans |
| Lawyer | `lawyer_users` | `/dashboard` | Assigned Deals, Escrow, Reconciliation |
| Partner | `partner_users` | `/dashboard` | Opportunities*, Partner Transactions |
| Introducer | `introducer_users` | `/dashboard` | Opportunities*, Introductions |
| Commercial Partner | `commercial_partner_users` | `/dashboard` | Opportunities*, Client Transactions |

*Conditional investor access - see section 10.3

### Correct Database Status Values
| Entity                 | Status Values                                 | Journey                                        |
| ---------------------- | --------------------------------------------- | ---------------------------------------------- |
| `subscriptions.status` | `pending`, `committed`, `active`, `cancelled` | pending → committed (signed) → active (funded) |
| `introductions.status` | `invited`, `joined`, `allocated`, `lost`      | invited → joined → allocated (commission due)  |
| `fee_events.status`    | `accrued`, `invoiced`, `paid`                 | accrued → invoiced → paid                      |

### Complete Route Tree (59 Routes)
```
/versotech_main/
├── admin/                      # CEO: Platform admin settings
├── approvals/                  # CEO: User approval queue
├── arrangers/                  # CEO: Arranger management
│   └── [id]/                   # Arranger detail
├── arranger-profile/           # Arranger: Own profile
├── assigned-deals/             # Lawyer: Assigned deal list
├── audit/                      # CEO: Audit logs
├── calendar/                   # All: Shared calendar
├── client-transactions/        # CP: Client investor tracking
├── commercial-partners/        # CEO: CP management
│   └── [id]/                   # CP detail
├── dashboard/                  # All: Role-specific dashboard
├── deals/                      # CEO: Deal management
│   ├── [id]/                   # Deal detail
│   └── new/                    # Create deal
├── documents/                  # All: Document hub
├── entities/                   # CEO: Entity management
├── escrow/                     # Lawyer: Escrow management
├── fee-plans/                  # Arranger/CEO: Fee structures
├── fees/                       # CEO: Fee management
├── inbox/                      # All: Unified inbox
├── introducer-agreements/      # Introducer: My agreements
│   └── [id]/                   # Agreement detail
├── introducers/                # CEO: Introducer management
│   └── [id]/                   # Introducer detail
├── introductions/              # Introducer: Introduction tracking
├── investors/                  # CEO: Investor management
│   └── [id]/                   # Investor detail
├── kyc-review/                 # CEO: KYC queue
├── lawyer-profile/             # Lawyer: Own profile
├── lawyer-reconciliation/      # Lawyer: Reconciliation reports
├── lawyers/                    # CEO: Lawyer management
│   └── [id]/                   # Lawyer detail
├── messages/                   # All: Direct messages
├── my-commercial-partners/     # Arranger: CP relationships
├── my-introducers/             # Arranger: Introducer relationships
├── my-lawyers/                 # Arranger: Lawyer assignments
├── my-mandates/                # Arranger: Deals I manage
├── my-partners/                # Arranger: Partner relationships
├── notifications/              # All: Notification center
├── opportunities/              # Investor/Partner/Introducer/CP
│   └── [id]/                   # Opportunity detail & journey
├── partner-transactions/       # Partner: Referral tracking
├── partners/                   # CEO: Partner management
│   └── [id]/                   # Partner detail
├── payment-requests/           # CEO/Arranger: Payment queue
├── placement-agreements/       # CP: My placement agreements
│   └── [id]/                   # Agreement detail
├── portfolio/                  # Investor: Holdings
│   └── [id]/                   # Position detail
├── processes/                  # CEO: Business processes
├── profile/                    # All: Own profile management
├── reconciliation/             # CEO/Arranger: Reports
├── requests/                   # All: Request queue
├── shared-transactions/        # Partner: Shared deals
├── subscription-packs/         # Arranger: Pack management
├── subscriptions/              # CEO: Subscription tracking
│   └── vehicle-summary/        # Vehicle-level summary
├── tasks/                      # All: Task queue
├── users/                      # CEO: User management
└── versosign/                  # All: Signature queue
```

---

## 0. ENABLERS (Platform-Wide Features)

### 0.1 Digital Signature (MVP)

#### 0.1.1 Signature Specimen
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| Save signature specimen | `/profile` | User uploads/draws signature | Signature saved to profile |
| Auto-insert on documents | N/A | System inserts saved specimen | Certificate shows specimen |

#### 0.1.2 Sign Document (VersoSign)
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| View signature queue | `/versosign` | List pending documents to sign | Queue populates |
| Digital signature | `/versosign` | Sign via DocuSign API | Signature captured |
| Signature status tracking | `/versosign` | Track pending/signed status | Status accurate |

#### 0.1.3 Archive
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| Archive signed documents | `/documents` | CEO archives after signing | Document archived |
| Retrieve from archive | `/documents` | Search archived documents | Documents retrievable |

---

### 0.2 Dataroom (MVP)

#### 0.2.1 Identity Management (SSO)
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| Single Sign-On access | `/opportunities/[id]` | Pre-authenticated from app | No separate login |
| Block user access | `/deals/[id]` (CEO) | CEO blocks specific user | User loses access |
| Grant user access | `/deals/[id]` (CEO) | CEO grants specific user | User gains access |

#### 0.2.2 Privacy
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| Hide other users | `/opportunities/[id]` | Users don't see other NDA signers | Privacy maintained |
| CEO views all users | `/deals/[id]` | CEO sees full access list | List complete |

#### 0.2.3 Access Rights
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| View access rights | `/deals/[id]` (CEO) | See rights per user per deal | Rights displayed |
| Change access rights | `/deals/[id]` (CEO) | Modify view/edit/download | Changes applied |
| Upload documents | `/deals/[id]` (CEO) | Upload to dataroom | Documents uploaded |
| View files | `/opportunities/[id]` | Browse dataroom files | Files visible |
| Request download | `/opportunities/[id]` | Request download permission | Request sent |
| Approve/deny download | `/deals/[id]` (CEO) | CEO approves/denies | Permission set |

#### 0.2.4 Dataroom Reporting
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| View logs per user | `/audit` | Activity logs filtered by user | Logs display |
| View logs per deal | `/deals/[id]` | Activity logs for deal | Logs display |
| Export logs | `/audit` | Download logs file | File exports |

---

### 0.3 KYC & AML

#### 0.3.1 Collection
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| Upload KYC documents | `/profile` | User uploads ID, proof of address | Documents stored |
| Entity KYC | `/profile` | Entity uploads corporate docs | Documents stored |
| CEO collects KYC | `/investors/[id]` | Request/upload on behalf | Documents associated |

#### 0.3.2 KYC Review
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| View pending queue | `/kyc-review` | List pending submissions | Queue populates |
| Review submission | `/kyc-review` | View all documents | Documents displayed |
| Approve KYC | `/kyc-review` | Mark as approved | Status = approved |
| Reject KYC | `/kyc-review` | Reject with reason | Status = rejected |
| Request more info | `/kyc-review` | Generate request notification | User notified |

#### 0.3.3 KYC Updates
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| Expiry reminder | N/A | System reminder on expiry | Notification sent |
| User updates | `/profile` | User uploads new docs | Docs replace old |
| Re-verification | `/kyc-review` | CEO re-reviews updated docs | Flow works |

---

### 0.4 Security (MVP)

#### 0.4.1 Screen Capture Blocked
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Block screenshots | App prevents screen capture | Screenshot attempt fails |
| Block screen recording | App prevents recording | Recording blocked |

#### 0.4.2 Document Encryption (V2)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| DRM protection | Documents encrypted at rest | Files inaccessible without key |
| Access token required | Decryption requires valid session | Expired session blocks access |

---

## 1. CEO/STAFF PERSONA

### 1.1 Dashboard (`/dashboard`)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Platform KPIs | Total investors, AUM, active deals | Metrics match DB |
| Pending items | KYC queue count, signature queue | Counts accurate |
| Recent activity | Activity feed | Events chronological |

### 1.2 User Profile Management

#### Create Users
| Route                              | User Type                    | Test                          |
| ---------------------------------- | ---------------------------- | ----------------------------- |
| `/investors`                       | Investor (individual/entity) | Create + invite link sent     |
| `/arrangers`                       | Arranger                     | Create + profile auto-created |
| `/users` → Lawyers tab             | Lawyer                       | Create + assign to deals      |
| `/users` → Partners tab            | Partner                      | Create + define fee model     |
| `/users` → Commercial Partners tab | Commercial Partner           | Create + placement setup      |
| `/introducers`                     | Introducer                   | Create + send agreement       |

#### Approval Workflow (`/approvals`)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View pending queue | List all pending approvals | Queue populates |
| Edit under approval | Modify before approve | Changes saved |
| Request info | Send request notification | User receives |
| Hold profile | Keep pending | Status maintained |
| Approve | Grant access | User active |
| Reject | Deny with reason | User rejected |

#### User Management
| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| View by type | `/users` | Filter tabs work | Lists accurate |
| View profile detail | `/investors/[id]` | Full profile info | All fields show |
| View dispatched IOs | Detail page | Deals assigned to user | List accurate |
| View signed NDAs | Detail page | NDA list per user | NDAs listed |
| Blacklist user | Detail page | Block platform access | Access revoked |
| Whitelist user | Detail page | Restore access | Access restored |
| Enable/disable features | Detail page | Toggle features | Features toggle |

---

### 1.3 Opportunity Management (`/deals`)

#### Create/Edit Opportunity
| Feature             | Expected Behavior                 | Test                  |
| ------------------- | --------------------------------- | --------------------- |
| Create deal         | Fill form with vehicle (REQUIRED) | Deal created          |
| Edit deal           | Modify terms/description          | Changes saved         |
| Create fee model    | Define partner/introducer fees    | Model created         |
| Duplicate termsheet | Copy existing                     | New termsheet created |
| Assign roles        | Add partner/CP/introducer         | Roles assigned        |
| Close manually      | Mark as closed                    | Status = closed       |
|                     |                                   |                       |

#### Dispatch Investment Opportunity
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Dispatch to investors | Select recipients, send | `deal_memberships` created |
| Dispatch to CPs | Select CPs, send | CPs notified |
| Auto-reminder | No response after X days | Reminder sent |
| Manual reminder | CEO sends reminder | Reminder sent |
| Dispatch updated version | Send revised IO | Recipients see new version |

#### NDA Management
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Auto-generate NDA | Interest confirmed → NDA created | NDA generated |
| Individual: 1 NDA | Single signatory | 1 NDA created |
| Entity: N NDAs | N signatories = N NDAs | All NDAs created |
| Upload signed NDA | Manual upload | NDA stored |
| Data room after NDA | ALL signatories must sign | Access granted only when complete |

#### Interest Confirmation
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Send confirmation request | Request with deadline | Request sent |
| Confirmed → Subscribe | Start subscription process | Pack generated |
| Declined → End | Mark as passed | Status = passed |
| Negotiate → New IO | Create new IO with new terms | New IO dispatched |

#### Subscription Pack (`/subscriptions`)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Auto-generate on commit | Interest + commitment → pack | Pack created immediately |
| Dispatch pack | Send to investor | Investor receives |
| Review comments | View investor feedback | Comments displayed |
| Edit/re-upload | Modify pack docs | Updates saved |
| Sign pack | CEO signs after investor approves | Signature captured |
| Notify lawyer | Lawyer receives notification | Notification sent |
| Track status | Pending → signed | Status accurate |

#### Funding
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Request funding | After pack signed → request | Request sent |
| View escrow status | Show funding status | Status accurate |
| Confirm funded | Amount correct | Status = funded |
| Request additional | Need more funds | Request sent |
| Reject | Deadline missed | Status = rejected |

#### Fee Payments
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Receive invoice | Partner/Introducer/CP sends | Notification received |
| View invoice | Display details | Invoice shown |
| Request lawyer payment | Send to lawyer | Request sent |
| Payment confirmation | Notified when paid | Notification received |

#### Equity & Statements
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Issue certificate | Generate shareholding cert | Certificate created |
| Approve before dispatch | CEO approval required | Workflow enforced |
| Issue statement | Generate holding statement | Statement created |
| Auto-dispatch | Sent after approval | Investor receives |

---

### 1.4 Introducer Agreement Workflow

| Step | Feature | Expected Behavior | Test |
|------|---------|------------------|------|
| 1 | Create fee model | Define introducer commission | Model saved |
| 2 | Send agreement | Dispatch to introducer | Agreement sent |
| 3 | Auto-reminder | System reminder after X days | Reminder sent |
| 4 | Approval notification | Introducer approves | CEO notified |
| 5 | CEO signs | Sign after introducer | Signature captured |
| 6 | Completion | Both signed | Status = active |

**CRITICAL:** Introducer CANNOT make introductions until agreement is signed.

---

### 1.5 Placement Agreement Workflow (Commercial Partner)

| Step | Feature | Expected Behavior | Test |
|------|---------|------------------|------|
| 1 | Enter fee summary | Share placement fees | CP sees summary |
| 2 | V2: Send agreement | Dispatch for approval | CP receives |
| 3 | V2: Approval | CP approves terms | CEO notified |
| 4 | CEO signs | Sign after CP | Signature captured |
| 5 | Completion | Both signed | Status = active |

---

### 1.6 Reporting

#### Transaction Tracking (`/audit`)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View notifications | Filter by opportunity | List accurate |
| Activity logs | Date, time, user, action | Logs complete |
| Assign tasks | Create task for user | Task created |
| View pipeline | Amount by status/date | Pipeline accurate |

#### Reconciliation (`/reconciliation`)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Opportunity report | Per-opportunity reconciliation | Report accurate |
| Client report | Per-investor reconciliation | Report accurate |
| Partner/Introducer/CP | Per-entity reconciliation | Report accurate |
| Compartment report | Per-compartment reconciliation | Report accurate |

---

### 1.7 GDPR (Admin)

| Feature | Route | Expected Behavior | Test |
|---------|-------|------------------|------|
| Right to erasure | `/admin` | Delete user data on request | Data deleted |
| Consent management | `/admin` | Track/update consent | Consent recorded |
| Data portability | `/admin` | Generate data export | Export created |
| Restrict processing | `/admin` | Limit data usage | Restrictions applied |
| Report breaches | N/A | Notify affected users | Users notified |

---

## 2. INVESTOR PERSONA

### 2.1 Profile (`/profile`)

#### Account Management
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Create from invite | Click link → create profile | Account created |
| Request access | Fill contact form | Request submitted |
| Update profile | Modify and resubmit | Resubmission works |
| Save as draft | Incomplete profile saved | Draft saved |
| Submit for approval | Send for review | Status = pending |

#### Check-in (Onboarding)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Feature tour | See interesting features | Tour displays |
| Select preferences | Choose important features | Preferences saved |
| Customize profile | Personalize settings | Settings saved |
| Skip onboarding | Bypass tour | Skipped successfully |

#### KYC & Compliance
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Upload ID | Identity document | Document stored |
| Upload proof of address | Address document | Document stored |
| Entity documents | Corporate KYC docs | Documents stored |
| Expiry notification | Receive update reminder | Notification received |
| Update documents | Replace expired docs | Documents updated |

---

### 2.2 Opportunities (`/opportunities`)

#### View Opportunities
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Notified list | IOs dispatched to me | List shows dispatched |
| Interested filter | IOs I confirmed interest | Filter works |
| Passed filter | IOs I declined | Filter works |
| Approved filter | IOs I approved | Filter works |
| Signed filter | IOs I signed | Filter works |
| Funded filter | IOs I funded | Filter works |

#### 10-Stage Investor Journey
| Stage | Trigger | DB Field | UI Display |
|-------|---------|----------|------------|
| 1. Received | IO dispatched | `deal_memberships.dispatched_at` | "Received" |
| 2. Viewed | Investor opens | `deal_memberships.viewed_at` | "Viewed" |
| 3. Interest Confirmed | Confirms interest | `deal_memberships.interest_confirmed_at` | "Interested" |
| 4. NDA Signed | ALL signatories sign | `signature_requests.status='signed'` | "NDA Signed" |
| 5. Data Room Access | After NDA | `deal_data_room_access.granted_at` | "Data Room" |
| 6. Pack Generated | Subscription starts | `subscriptions.pack_generated_at` | "Pack Ready" |
| 7. Pack Sent | Pack dispatched | `subscriptions.pack_sent_at` | "Pack Sent" |
| 8. Signed | ALL signatories sign pack | `subscriptions.signed_at` | "Signed" |
| 9. Funded | Funds received | `subscriptions.funded_at` | "Funded" |
| 10. Active | Investment activated | `subscriptions.activated_at` | "Active" |

#### Opportunity Detail (`/opportunities/[id]`)
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View description | Deal info displayed | Info accurate |
| View termsheet | Terms displayed | Terms accurate |
| Request data room | Request access | Request sent |
| Access data room | After NDA signed | Files visible |
| Decline | Mark not interested | Status = passed |

#### Confirm Interest
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Confirm interest | Express interest | Status = interested |
| Enter commitment | Specify amount | Amount recorded |
| Update amount | Modify commitment | Amount updated |
| Review negotiated terms | View updated IO | Terms displayed |

#### Subscription Pack
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Receive notification | Pack ready | Notification received |
| Review pack | View documents | Documents displayed |
| Download pack | Save locally | Download works |
| Share comments | Add feedback | Comments saved |
| Request clarification | Ask questions | Request sent |
| Approve pack | Accept terms | Status = approved |
| Reject pack | Decline pack | Status = rejected |
| Sign digitally | Sign via VersoSign | Signature captured |

#### Funding
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Funding request | Notification to transfer | Notification received |
| Funding reminder | If not funded | Reminder received |
| Funded confirmation | Escrow funded | Notification received |

---

### 2.3 Portfolio (`/portfolio`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View transactions | By opportunity/date | List accurate |
| View transaction detail | Signed subscription pack | Pack displayed |
| View evolution | Current vs initial value | Values accurate |
| View positions | Shares per opportunity | Counts correct |
| View performance | Profit generated/projected | Values accurate |
| Download certificate | Equity certificate | Download works |
| Download statement | Statement of holding | Download works |

---

### 2.4 Notifications (`/inbox`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View by type | Filter by category | Filter works |
| View by opportunity | Filter by deal | Filter works |
| View sent | Notifications I sent | List accurate |

---

### 2.5 GDPR

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Request data access | Submit request | Request submitted |
| Download data | Export CSV/XLS | Export generated |
| Restrict processing | Limit data usage | Restriction applied |
| Right to erasure | Request deletion | Request submitted |
| View data policy | Clear policy display | Policy visible |
| Request rectification | Correct inaccurate data | Request submitted |
| Withdraw consent | Revoke consent | Consent withdrawn |

---

## 3. ARRANGER PERSONA

### 3.1 Profile (`/arranger-profile`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Complete profile | Fill arranger details | Profile complete |
| Update profile | Modify and resubmit | Resubmission works |
| Approval notification | Notified when approved | Notification received |
| Check-in | Feature tour and preferences | Onboarding works |

---

### 3.2 My Partners (`/my-partners`)

#### Fee Models
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Create fee model | Define partner fees | Model created |
| Update fee model | Modify existing | Update applied |

#### Payments
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Request invoice | System requests | Request sent |
| Receive invoice | Partner sends | Notification received |
| View fees | Display amounts | Fees displayed |
| Request payment | Send to lawyer | Request sent |
| Payment complete | Notified when paid | Notification received |

#### View & Reporting
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Partners per opportunity | List by deal | List accurate |
| Fee models per partner | Display details | Details correct |
| Revenues per partner | Per opportunity | Data accurate |
| Generate reconciliation | Create report | Report generated |

---

### 3.3 My Introducers (`/my-introducers`)

#### Fee Models & Agreements
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Create fee model | Define introducer fees | Model created |
| Send fee model | Dispatch to introducer | Introducer notified |
| Update agreement | Modify terms | Update applied |
| Sign agreement | Arranger signs | Signature captured |

#### Payments & Reporting
Same structure as Partners section.

---

### 3.4 My Commercial Partners (`/my-commercial-partners`)

Same structure as Partners section, with V2 placement agreement workflow.

---

### 3.5 My Lawyers (`/my-lawyers`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View lawyers per opportunity | List assigned | List accurate |
| View escrow status | Funding status | Status accurate |

---

### 3.6 My Mandates (`/my-mandates`)

#### Subscription Pack
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Rejection notification | Investor rejects | Notification received |
| Sign pack | After CEO signs | Signature captured |
| Notify lawyer | Lawyer notified | Notification sent |
| View signed packs | List by investor/date | List accurate |

#### Funding & Reporting
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Funded notification | Escrow funded | Notification received |
| Send payment notification | Partner/Introducer/CP | Notification sent |
| Opportunity reconciliation | Per-opportunity report | Report accurate |
| Compartment reconciliation | Per-compartment report | Report accurate |

---

### 3.7 Fee Plans (`/fee-plans`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Create fee plan | Define fee structure | Plan created |
| Edit fee plan | Modify existing | Update applied |
| Assign to deal | Link plan to deal | Assignment saved |

---

### 3.8 GDPR

Same GDPR rights as Investor persona.

---

## 4. LAWYER PERSONA

### 4.1 Profile (`/lawyer-profile`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Complete profile | Fill lawyer details | Profile complete |
| Upload signature specimen | For auto-insert | Specimen saved |
| Update profile | Modify and resubmit | Resubmission works |
| Check-in | Feature tour | Onboarding works |

---

### 4.2 Assigned Deals (`/assigned-deals`)

**RESTRICTION:** Lawyer can ONLY see deals assigned via `deal_lawyer_assignments` table.

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View assigned deals | Only my assignments | No unassigned deals visible |
| View deal detail | Deal documents | Documents displayed |
| Subscription pack notifications | CEO/Arranger/Investor signs | Notifications received |
| Certificate notifications | When sent to investor | Notification received |

---

### 4.3 Escrow Management (`/escrow`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Send funding complete | Notify when funded | Notification sent |
| Send funding pending | Notify when not funded | Notification sent |
| Display partner invoice | Per partner/opportunity | Invoice displayed |
| Confirm partner payment | Payment complete | Notification sent |
| Display introducer invoice | Per introducer | Invoice displayed |
| Confirm introducer payment | Payment complete | Notification sent |
| Display CP invoice | Per CP | Invoice displayed |
| Confirm CP payment | Payment complete | Notification sent |
| Escrow amount notification | Funds received | Notification sent |

---

### 4.4 Reconciliation (`/lawyer-reconciliation`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Transaction reconciliation | Invested vs fees vs escrow | Report accurate |
| Compartment reconciliation | Shares vs fees vs escrow | Report accurate |
| Redemption reconciliation | Pre/post shares, fees | Report accurate |
| Conversion reconciliation | Pre/post shares | Report accurate |

---

### 4.5 Auto-Signature Specimen

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Certificate signature | Auto-insert specimen | Signature appears |
| Statement signature | Auto-insert specimen | Signature appears |

---

### 4.6 GDPR

Same GDPR rights as Investor persona.

---

## 5. PARTNER PERSONA

### 5.1 Profile

Same as Investor profile features.

---

### 5.2 Opportunities (`/opportunities`)

**CRITICAL RULE - Conditional Investor Access:**
- Partner does NOT automatically have investor capabilities
- Must have `deal_memberships.role = 'partner_investor'` to invest
- If `role = 'partner'` only: Can track but CANNOT invest

| Role | Can View Deal | Can Subscribe | Can Sign | Test |
|------|---------------|---------------|----------|------|
| `partner` | Yes | NO | NO | Verify subscribe button hidden |
| `partner_investor` | Yes | Yes | Yes | Full investor journey |

**If `partner_investor`:** Same features as Investor section 2.2

---

### 5.3 Portfolio (`/portfolio`)

Same as Investor section 2.3 - shows Partner's OWN investments.

---

### 5.4 Partner Transactions (`/partner-transactions`)

**RESTRICTION:** Partner CANNOT sign on behalf of referred investors.

#### View My Transactions
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View assigned IOs | IOs where I'm partner | List accurate |
| Filter by investor status | Interested/passed/approved/signed/funded | Filters work |
| View fee model | Fees that apply to me | Fees displayed |
| View deal + termsheet | Full opportunity details | Details displayed |
| Access data room | View documents | Access works |

#### Transaction Tracking
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Pack sent notification | Pack sent to investor | Notification received |
| Pack approved notification | Investor approves | Notification received |
| Pack signed notification | Investor signs | Notification received |
| Escrow funded notification | Investor funds | Notification received |
| Payment notification | My payment processed | Notification received |

#### Transaction Reporting
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View revenues | Between dates | Amount accurate |
| Recalculate fees | Based on progress | Recalculation works |
| View projected | Per opportunity/investor | Projection accurate |
| Send redemption invoice | Enter due amount | Invoice sent |

---

### 5.5 Shared Transactions (`/shared-transactions`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Share to investor only | Partner fee model auto-applied | IO shared |
| Share to investor + introducer | Include introducer | IO shared with both |
| Copy CEO/Arranger | Auto-copied | Recipients included |

---

### 5.6 GDPR

Same GDPR rights as Investor persona.

---

## 6. INTRODUCER PERSONA

### 6.1 Profile

Same as Investor profile features.

---

### 6.2 Opportunities (`/opportunities`)

**CRITICAL RULE - Conditional Investor Access:**
- Must have `deal_memberships.role = 'introducer_investor'` to invest
- If `role = 'introducer'` only: Can track introductions but CANNOT invest

**If `introducer_investor`:** Same features as Investor section 2.2

---

### 6.3 Portfolio (`/portfolio`)

Same as Investor section 2.3 - shows Introducer's OWN investments.

---

### 6.4 Introducer Agreements (`/introducer-agreements`)

**BLOCKING RULE:** Cannot make introductions until agreement is signed.

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View dispatched agreement | See agreement with fees | Agreement displayed |
| View approval reminders | Pending approval requests | Reminders displayed |
| View signing reminders | Pending sign requests | Reminders displayed |
| Approve agreement | Accept fee terms | Status = approved |
| Sign agreement | Digitally sign | Signature captured |
| Reject agreement | Decline terms | Status = rejected |
| View agreement list | All my agreements | List displayed |
| View agreement detail | Full info | Details displayed |

**Test without agreement:**
1. No signed agreement exists
2. Try to make introduction
3. System should BLOCK with message
4. Sign agreement
5. Introduction functionality enabled

---

### 6.5 Introductions (`/introductions`)

**RESTRICTION:** Introducer CANNOT see detailed investor journey (only status).

#### View Introductions
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View assigned IOs | IOs where I'm introducer | List accurate |
| Filter by investor status | Interested/passed/approved/signed/funded | Filters work |
| View deal + termsheet | Full opportunity details | Details displayed |
| View fee model | Fees that apply to me | Fees displayed |
| Access data room | View documents | Access works |

#### Introduction Status Values
| Status | Meaning | Test |
|--------|---------|------|
| `invited` | Introduction submitted | Initial state |
| `joined` | Prospect became investor | Status updates |
| `allocated` | Allocation received, commission due | Status updates |
| `lost` | Did not convert | Status updates |

#### Introduction Tracking
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Pack sent notification | Pack sent to investor | Notification received |
| Escrow funded notification | Investor funds | Notification received |
| Invoice sent notification | Invoice sent | Notification received |
| Payment complete notification | Payment received | Notification received |

#### Introduction Reporting
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View revenues | Between dates | Amount accurate |
| View projected | Per opportunity/investor | Projection accurate |
| Send redemption invoice | Enter due amount | Invoice sent |

---

### 6.6 GDPR

Same GDPR rights as Investor persona.

---

## 7. COMMERCIAL PARTNER PERSONA

### 7.1 Profile

Same as Investor profile features.

---

### 7.2 Opportunities (`/opportunities`)

**TWO MODES OF OPERATION:**

| Mode | Role | Description | Test |
|------|------|-------------|------|
| Direct Investment | `commercial_partner_investor` | CP invests own money | Standard investor journey |
| Proxy Mode | `commercial_partner_proxy` | CP acts for client | "Acting on behalf of" banner |

#### MODE 1: Direct Investment
If `role = 'commercial_partner_investor'`: Same features as Investor section 2.2

#### MODE 2: Proxy Investment
| Feature | Expected Behavior | Test |
|---------|------------------|------|
| "Acting on behalf of" banner | Banner shows client name | Banner visible |
| Subscribe for client | Submit with client details | Subscription uses client ID |
| Sign for client | CP signs, client on document | Documents show client |
| Track client journey | See client's progress | Status accurate |

---

### 7.3 Portfolio (`/portfolio`)

Shows CP's OWN investments only (not client investments).

---

### 7.4 Client Transactions (`/client-transactions`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View assigned IOs | IOs where I'm CP | List accurate |
| Filter by client status | Interested/passed/approved/signed/funded | Filters work |
| View deal + termsheet | Full opportunity details | Details displayed |
| View fee model | Fees that apply to me | Fees displayed |
| Access data room | View documents | Access works |

#### Client Buckets (Journey Stages)
| Stage | Expected Behavior | Test |
|-------|------------------|------|
| New Lead | Just introduced | Correct count |
| Interested | Confirmed interest | Correct count |
| Subscribed | Pack generated | Correct count |
| Funded | Funds received | Correct count |

---

### 7.5 Placement Agreements (`/placement-agreements`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View fee summary | MVP: Fee summary displayed | Summary shown |
| View placement agreement | V2: Full agreement | Agreement displayed |
| Approval reminders | V2: Pending approval | Reminders shown |
| Approve agreement | V2: Accept terms | Status = approved |
| Sign agreement | Digitally sign | Signature captured |
| Reject agreement | V2: Decline terms | Status = rejected |
| View agreement list | All my agreements | List displayed |

---

### 7.6 GDPR

Same GDPR rights as Investor persona.

---

## 8. GLOBAL UX FEATURES

### 8.1 Dashboard (`/dashboard`)

Role-specific dashboard content:

| Persona | Dashboard Shows | Test |
|---------|-----------------|------|
| CEO | Platform KPIs, pending queues | All metrics visible |
| Investor | Portfolio summary, pending tasks | Own data only |
| Arranger | Mandate summary, fee performance | Mandate data only |
| Lawyer | Assigned deals, pending signatures | Assigned only |
| Partner | Referral summary, commissions | Own transactions |
| Introducer | Introduction stats, commissions | Own introductions |
| CP | Client summary, placements | Own clients |

---

### 8.2 Documents Hub (`/documents`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View all documents | NDAs, packs, certificates | Documents listed |
| Filter by type | Document type filter | Filter works |
| Filter by deal | Per opportunity | Filter works |
| Download document | Save locally | Download works |
| Search documents | Text search | Search works |

---

### 8.3 VersoSign Queue (`/versosign`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View pending signatures | Documents awaiting my signature | Queue populates |
| Filter by type | NDA, subscription pack, agreement | Filters work |
| Sign document | Digital signature | Signature captured |
| View completed | Signed documents | History shown |

---

### 8.4 Unified Inbox (`/inbox`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Messages tab | Direct messages | Messages shown |
| Notifications tab | System notifications | Notifications shown |
| Requests tab | Pending requests | Requests shown |
| Mark as read | Update status | Status updated |

---

### 8.5 Tasks (`/tasks`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View my tasks | Assigned tasks | Tasks listed |
| Filter by status | Pending/completed | Filters work |
| Complete task | Mark as done | Status updated |

---

### 8.6 Calendar (`/calendar`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View shared calendar | Platform-wide events | Events visible |
| View deal deadlines | Funding deadlines | Deadlines shown |
| View reminders | Scheduled reminders | Reminders visible |

---

## 9. ADMIN PORTAL FEATURES

### 9.1 Admin Settings (`/admin`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| Platform settings | Configure platform | Settings saved |
| Feature toggles | Enable/disable features | Toggles work |
| Notification templates | Edit templates | Templates saved |

### 9.2 Entities (`/entities`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View all entities | Investors, partners, etc. | Entities listed |
| Entity detail | Full entity info | Details shown |
| Entity members | Member list | Members displayed |

### 9.3 Processes (`/processes`)

| Feature | Expected Behavior | Test |
|---------|------------------|------|
| View workflows | Business processes | Processes listed |
| Process status | Track progress | Status accurate |

---

## 10. MULTI-PERSONA & SIGNATORY RULES

### 10.1 Multi-Persona Users

#### Single Persona User
| Test | Expected Behavior |
|------|------------------|
| User with only investor link | Only investor navigation, no switcher |

#### Multi-Persona User (Hybrid)
| Test | Expected Behavior |
|------|------------------|
| User with investor + introducer | Persona switcher visible |
| Switch personas | Navigation updates |
| Each view | Shows persona-specific features |

#### CEO Detection
| Test | Expected Behavior |
|------|------------------|
| `profiles.role = 'ceo'` | Full admin access |
| `profiles.role = 'staff_admin'` | Full admin access |

---

### 10.2 Signatory Rules (CRITICAL)

#### NDA Signing

**Individual Investor:**
| Step | Expected Behavior | Test |
|------|------------------|------|
| 1 | Individual expresses interest | 1 NDA generated |
| 2 | Individual signs NDA | Data room access granted |

**Entity Investor (Multiple Signatories):**
| Step | Expected Behavior | Test |
|------|------------------|------|
| 1 | Entity with 3 signatories expresses interest | 3 separate NDAs generated |
| 2 | Each NDA uses ENTITY address | NOT individual address |
| 3 | Signatory 1 signs | NO data room access yet |
| 4 | Signatory 2 signs | NO data room access yet |
| 5 | Signatory 3 (ALL) signs | ALL entity users get access |

**Critical:** Data room access is granted to ALL entity users ONLY after ALL signatories sign.

#### Subscription Pack Signing

**Entity with Multiple Signatories:**
| Step | Expected Behavior | Test |
|------|------------------|------|
| 1 | Entity subscribes | 1 pack with N signature blocks |
| 2 | Pack sent to all signatories | All receive request |
| 3 | Signatory 1 signs | Status = pending |
| 4 | Signatory 2 signs | Status = pending |
| 5 | ALL sign | Status = signed |

**Maximum signatories per document:** 10

#### Non-Signatory Access
| Test | Expected Behavior |
|------|------------------|
| Entity user NOT signatory | Can VIEW after entity has access |
| Non-signatory tries to sign | CANNOT sign |
| Signature queue for non-signatory | Documents NOT shown |

---

### 10.3 Conditional Investor Access

| Persona | Condition | `deal_memberships.role` | Can Invest? |
|---------|-----------|-------------------------|-------------|
| Partner | Tracking only | `partner` | NO |
| Partner | CEO dispatched with investor | `partner_investor` | YES |
| Introducer | Tracking only | `introducer` | NO |
| Introducer | CEO dispatched with investor | `introducer_investor` | YES |
| CP | Direct investment | `commercial_partner_investor` | YES |
| CP | Proxy for client | `commercial_partner_proxy` | Signs for client |

---

### 10.4 Agreement Requirements

| Persona | Agreement Required | Can Act Without? |
|---------|-------------------|-----------------|
| Introducer | Introducer Agreement must be signed | NO - introductions blocked |
| Commercial Partner | Placement Agreement (V2) | MVP: Yes, V2: No |

---

## 11. DATABASE VERIFICATION QUERIES

```sql
-- Check user's personas
SELECT * FROM get_user_personas('user-uuid');

-- Check deal membership role
SELECT deal_id, role, dispatched_at, viewed_at, interest_confirmed_at
FROM deal_memberships
WHERE user_id = 'user-uuid';

-- Check entity signatories
SELECT user_id, investor_id, role, can_sign
FROM investor_members
WHERE investor_id = 'investor-uuid'
AND role = 'authorized_signatory';

-- Check NDA signatures (per signatory for entity)
SELECT sr.id, sr.signer_user_id, sr.status, sr.signed_at
FROM signature_requests sr
WHERE sr.deal_id = 'deal-uuid'
AND sr.document_type = 'nda'
AND sr.investor_id = 'investor-uuid';

-- Check subscription with correct statuses
SELECT id, status, pack_generated_at, pack_sent_at, signed_at, funded_at
FROM subscriptions
WHERE investor_id = 'investor-uuid'
AND deal_id = 'deal-uuid';
-- Status: pending, committed, active, cancelled

-- Check introduction with correct statuses
SELECT id, status, prospect_email, prospect_investor_id
FROM introductions
WHERE introducer_id = 'introducer-uuid';
-- Status: invited, joined, allocated, lost

-- Check fee events with correct statuses
SELECT id, fee_type, status, computed_amount
FROM fee_events
WHERE deal_id = 'deal-uuid';
-- Status: accrued, invoiced, paid

-- Check introducer agreement status
SELECT id, status, signed_date
FROM introducer_agreements
WHERE introducer_id = 'introducer-uuid';
-- Must be 'active' with signed_date to make introductions

-- Check data room access (entity)
SELECT investor_id, granted_at
FROM deal_data_room_access
WHERE deal_id = 'deal-uuid'
AND investor_id = 'investor-uuid';
```

---

## 12. CRITICAL RULES SUMMARY

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **Vehicle Required** | `deals.vehicle_id` is REQUIRED | Cannot create deal without |
| **NDA per Signatory** | Entity with N signatories = N NDAs | Auto-generated |
| **Data Room Access** | ALL signatories must sign before ANY user gets access | Database trigger |
| **Subscription Pack** | One document with N signature blocks (max 10) | Pack generation logic |
| **Entity Address** | All documents use ENTITY address | Template logic |
| **Conditional Investor Access** | Partner/Introducer/CP need specific role | RLS policy |
| **Introducer Agreement** | MUST sign before making introductions | UI + backend check |
| **CP Proxy Mode** | Signs on behalf of clients | Document generation |
| **Lawyer Read-Only** | Can view but NOT modify subscriptions | RLS policy |
| **Correct Statuses** | Use actual DB enums, not assumed values | See Quick Reference |

---

**END OF TESTING GUIDE V2**

*Generated from User Stories Mobile V6, Web V2 Excel files, PHASE2_BASE_PLAN, and actual route tree analysis*
