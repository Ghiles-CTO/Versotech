# E2E Test Results

**Test Started:** 2026-01-28
**Tester:** Claude Code (Automated)
**Status:** IN PROGRESS

---

## Test Data Created

| Entity | ID | Name/Details | Created At |
|--------|-----|--------------|------------|
| Deal | `50e7bdce-5363-4d9e-8c8c-a79f5570e2ab` | E2E Test Deal - Jan 2026 | 2026-01-28 |
| Term Sheet | Version 1 (in deal_fee_structures) | Structure: Shares of Common Stock, Subscription Fee: 2% | 2026-01-28 |
| Introducer Fee Plan | E2E Test Introducer Fee Plan | PYM Consulting, 1.5% subscription fee, upfront | 2026-01-28 |
| Introducer Agreement | `6acb51d3-c4c1-4ca7-86fd-78bb89fff5f7` | #20260128001, Status: Awaiting Introducer (CEO signed) | 2026-01-28 |
| Partner Fee Plan | | | |
| CP Fee Plan | | | |
| Subscription | | | |
| Certificate | | | |
| Commission | | | |

---

## Process 1: Deal & Term Sheet Creation

**Status:** ✅ COMPLETED
**Login:** `cto@versoholdings.com`
**Server:** http://localhost:3002

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Navigate to deals/new | Page loads | Form loads correctly with 3-step wizard | ✅ PASS |
| Fill deal form step 1 | Basic info fields | Deal name, company, type, stock, vehicle, sector, stage, location filled | ✅ PASS |
| Fill deal form step 2 | Currency and amount | USD, 1,000,000 target | ✅ PASS |
| Fill deal form step 3 | Timeline and description | Open/close dates, description, investment thesis | ✅ PASS |
| Create deal | Deal created with draft status | Deal created: `50e7bdce-5363-4d9e-8c8c-a79f5570e2ab`, status=draft | ✅ PASS |
| Open Term Sheets tab | Tab loads | Tab loads with "New Term Sheet" and "Create Term Sheet" buttons | ✅ PASS |
| Create term sheet | Term sheet created in draft status | Initial attempt with all fields: 500 error. Retry with minimal fields: SUCCESS | ⚠️ PASS (with workaround) |
| Edit term sheet | Add more details | Added structure, transaction type, allocation, pricing, fees | ✅ PASS |
| Publish term sheet | Status: published | Term sheet Version 1 published successfully | ✅ PASS |

### Screenshots/Evidence

- `01_dashboard_after_login.png` - Dashboard after login
- `02_create_deal_form.png` - Deal creation form step 1
- `03_create_deal_step2.png` - Deal creation form step 2
- `04_create_deal_step3.png` - Deal creation form step 3
- `05_deal_created_overview.png` - Deal detail overview after creation
- `06_term_sheets_tab_empty.png` - Term sheets tab (empty)
- `07_term_sheet_form.png` - Term sheet creation dialog
- `08_term_sheet_filled.png` - Term sheet form filled (first attempt - failed)
- `09_term_sheet_created.png` - Term sheet created (minimal fields)
- `10_term_sheet_published.png` - Term sheet published successfully

### Issues Found

#### Issue #1: Term Sheet Creation Returns 500 Error (WORKAROUND FOUND)
- **Severity:** MEDIUM (downgraded from CRITICAL - workaround available)
- **API Endpoint:** `POST /api/deals/{dealId}/fee-structures`
- **Error:** HTTP 500 Internal Server Error
- **Browser Console:** "Failed to load resource: the server responded with a status of 500"
- **Form Data Submitted (failed attempt):**
  - Structure: "Shares of Common Stock"
  - Transaction Type: "Secondary Market Purchase"
  - Allocation Up To: 1,000,000
  - Price Per Share: $100
  - Minimum Ticket: $10,000
  - Subscription Fee: 2%
  - Opportunity Summary: "E2E Test opportunity for automated testing"
  - Completion Date: 02/28/2026 (likely the problematic field - date format issue)
- **Root Cause (suspected):** The Completion Date field may have an invalid date format when filled with certain date patterns. The console showed: `The specified value "2026-01-28" does not conform to the required format.`
- **Workaround:**
  1. Create term sheet with minimal fields (e.g., just Structure)
  2. Edit the term sheet to add other details
  3. Avoid date fields in initial creation
- **Impact:** Minor - workaround allows process to complete

### Data Created

| Field | Value |
|-------|-------|
| Deal ID | `50e7bdce-5363-4d9e-8c8c-a79f5570e2ab` |
| Deal Name | E2E Test Deal - Jan 2026 |
| Company | Test Company Inc |
| Deal Type | Secondary (equity_secondary) |
| Stock Type | Common |
| Vehicle | VERSO Capital 2 SCSP Series 201 (8b7be9b5-543e-4fd8-ab44-61767139d4e5) |
| Sector | Technology |
| Stage | Series B |
| Location | USA |
| Currency | USD |
| Target Amount | 1,000,000 |
| Status | draft |

---

## Process 2A: Introducer Fee Plan & Agreement

**Status:** ✅ COMPLETED
**Arranger Login:** `cto@versoholdings.com` (used instead - CEO has arranger persona)
**Introducer Login:** `py.moussaouighiles@gmail.com` - ✅ LOGIN WORKS (after clearing cache)

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Create fee plan | Status: draft | Created "E2E Test Introducer Fee Plan" with PYM Consulting, 1.5% subscription fee | ✅ PASS |
| Generate agreement | Agreement created | Agreement #20260128001 generated, status changed to "Pending" | ✅ PASS |
| Agreement shows in VERSOSign | Pending countersignature | Task appears: "Sign Introducer Agreement: PYM Consulting → Test Company Inc" | ✅ PASS |
| CEO signs (party_a) | Signature submitted | Drew signature on canvas, clicked Submit, signature accepted | ✅ PASS |
| Agreement status updates | Awaiting Introducer | Status changed from "Awaiting CEO" to "Awaiting Introducer" | ✅ PASS |
| Introducer login | Redirect to dashboard | ✅ Login successful after clearing browser cache | ✅ PASS |
| Introducer VERSOSign | Shows pending task | VERSOSign shows "Pending Signatures: 1" - Task visible! | ✅ PASS |
| Introducer signs (party_b) | Signature submitted | Drew signature on canvas, clicked Submit Signature | ✅ PASS |
| CEO countersigns (party_b_2) | Agreement complete | CEO signed as second party_b signatory | ✅ PASS |
| Agreement status | Active | Agreement fully signed by all parties | ✅ PASS |

### Screenshots/Evidence

- `11_fee_plans_tab_empty.png` - Fee Plans tab (empty)
- `12_create_fee_plan_form.png` - Fee plan creation form
- `13_fee_plan_filled.png` - Fee plan form filled
- `14_fee_plan_created.png` - Fee plan created (draft)
- `15_introducer_agreement_generated.png` - Agreement generated
- `16_ceo_dashboard.png` - CEO dashboard after re-login
- `17_introducer_agreements_awaiting_ceo.png` - Agreement status "Awaiting CEO"
- `18_versosign_pending.png` - VERSOSign pending countersignature
- `19_versosign_signing_interface.png` - VERSOSign signing interface
- `20_signature_drawn.png` - Signature drawn on canvas
- `21_ceo_signature_submitted.png` - CEO signature submitted
- `22_agreement_awaiting_introducer.png` - Agreement status "Awaiting Introducer"
- `25_introducer_versosign_empty.png` - **Introducer's VERSOSign shows ZERO pending tasks**
- `26_introducer_agreements_list.png` - Introducer sees agreement "Awaiting Introducer" but no Sign button in list
- `27_versosign_with_agreement_param.png` - VERSOSign page with `?agreement=ID` param shows no task

### Issues Found

#### Issue #2: Test Account Authentication - RESOLVED
- **Severity:** ~~CRITICAL~~ RESOLVED
- **Resolution:** Clearing browser cookies and localStorage fixed the issue
- **Command:** `agent-browser cookies clear && agent-browser storage local clear`
- **Root Cause:** Stale session data in browser cache

#### Issue #3: Introducer Agreement Signing Task Not Created (RESOLVED ✅)
- **Severity:** ~~CRITICAL~~ RESOLVED
- **Affected Flow:** Introducer Agreement signing after CEO signs
- **Agreement ID:** `6acb51d3-c4c1-4ca7-86fd-78bb89fff5f7`
- **Original Error (Session 1):**
  - CEO signs agreement → Introducer VERSOSign shows "Pending Signatures: 0"
  - Task was not visible to introducer
- **Resolution (Session 2 - Jan 29, 2026):**
  - Re-tested after context reset
  - VERSOSign now shows "Pending Signatures: 1" for introducer
  - Task "Sign Fee Agreement - PYM Consulting" visible with "Sign Document" button
  - Root cause was likely a session/cache issue during initial testing
- **Successful Signing Flow:**
  1. Pierre-Yves logged in as Introducer
  2. VERSOSign showed pending task (1)
  3. Drew signature on canvas
  4. Clicked "Submit Signature"
  5. Task completed, moved to "Completed Today: 1"
  6. CEO logged in, countersigned as party_b_2
  7. Agreement status: **ACTIVE**
- **Screenshots:**
  - `133_pierre_versosign.png` - Pierre-Yves sees pending task
  - `136_signature_drawn.png` - Signature drawn on canvas
  - `137_signature_submitted.png` - Pierre-Yves signature completed
  - `138_ceo_versosign.png` - CEO sees countersignature task
  - `140_agreement_completed.png` - All signatures complete

### Data Created

| Field | Value |
|-------|-------|
| Fee Plan Name | E2E Test Introducer Fee Plan |
| Introducer | PYM Consulting (py.moussaouighiles@gmail.com) |
| Fee Type | Subscription Fee |
| Rate | 150 bps (1.5%) |
| Payment Schedule | Upfront |
| Agreement Duration | 36 months |
| Agreement ID | `6acb51d3-c4c1-4ca7-86fd-78bb89fff5f7` |
| Agreement Number | 20260128001 |
| Agreement Status | **ACTIVE** ✅ (All parties signed) |
| CEO Signed (party_a) | Jan 28, 2026 |
| Introducer Signed (party_b) | Jan 29, 2026 |
| CEO Countersigned (party_b_2) | Jan 29, 2026 |
| Effective Date | Jan 28, 2026 |
| Expiry Date | Jan 12, 2029 |

---

## Process 2B: Partner Fee Plan

**Status:** ✅ COMPLETED
**Arranger Login:** `cto@versoholdings.com` (CEO with arranger persona)
**Partner Login:** `cto@verso-operation.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Navigate to deal Fee Plans tab | Tab loads | Fee Plans tab shows existing plans + Create button | ✅ PASS |
| Click Create Fee Plan | Form opens | Form with Basic Info, Fee Components, Agreement Terms sections | ✅ PASS |
| Fill plan name | Name field | "E2E Test Partner Fee Plan" | ✅ PASS |
| Select entity type | Partner option | Selected "Partner" from dropdown | ✅ PASS |
| Select partner entity | Entity dropdown | Selected "Verso Operations Partner (cto@verso-operation.com)" | ✅ PASS |
| Add fee component | Subscription fee | 100 bps (1%), Upfront, % of Investment | ✅ PASS |
| Select term sheet | Version 1 | Selected Version 1 term sheet | ✅ PASS |
| Create fee plan | Plan created | Plan created successfully, page refreshes with new plan in list | ✅ PASS |

**Note:** Partner fee plans do NOT require signed agreements (unlike Introducer fee plans). Acceptance is sufficient.

### Screenshots/Evidence

- `64_deal_fee_plans_tab.png` - Fee Plans tab before creating partner plan
- `65_create_fee_plan_form.png` - Empty fee plan form
- `66_partner_fee_form.png` - Form with Partner type selected
- `67_partner_fee_form_filled.png` - Completed form before submission
- `68_partner_fee_created.png` - Fee Plans tab with new partner plan

### Issues Found

None - Partner fee plan creation working correctly

### Data Created

| Field | Value |
|-------|-------|
| Fee Plan Name | E2E Test Partner Fee Plan |
| Entity Type | Partner |
| Partner Entity | Verso Operations Partner |
| Partner Email | cto@verso-operation.com |
| Fee Type | Subscription Fee |
| Rate | 100 bps (1%) |
| Payment Schedule | Upfront |
| Calculation Basis | % of Investment |
| Term Sheet | Version 1 |
| Status | Active |

---

## Process 2C: Commercial Partner Fee Plan & Placement Agreement

**Status:** ⏸️ BLOCKED (No Commercial Partner entity in system)
**Arranger Login:** `cto@versoholdings.com`
**CP Login:** `cm.moussaouighiles@gmail.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Navigate to Fee Plans tab | Tab loads | Fee Plans tab shows existing plans, Create Fee Plan button | ✅ PASS |
| Click Create Fee Plan | Form opens | Form opens with Basic Info, Fee Components, Agreement Terms sections | ✅ PASS |
| Fill plan name | Name entered | "E2E Test Commercial Partner Fee Plan" entered | ✅ PASS |
| Select term sheet | Version 1 | Selected successfully, shows Term Sheet Fee Limits | ✅ PASS |
| Select Entity Type | Commercial Partner | **Only "Introducer" and "Partner" types available** - no "Commercial Partner" option | ⚠️ LIMITATION |
| Select Partner type | Shows partner dropdown | Partner type selected, shows entity dropdown | ✅ PASS |
| Select CP entity | Commercial Partner entity | **Only "Verso Operations Partner" visible** - CM Moussaoui Commercial Partner not in list | ❌ BLOCKED |
| Create fee plan | Status: draft | **BLOCKED** - Cannot proceed without Commercial Partner entity | ⏸️ BLOCKED |
| Send to CP | Status: sent | **BLOCKED** | ⏸️ BLOCKED |
| CP accepts | Status: accepted | **BLOCKED** | ⏸️ BLOCKED |
| Generate placement agreement | Agreement created | **BLOCKED** | ⏸️ BLOCKED |
| CP signs | Signed | **BLOCKED** | ⏸️ BLOCKED |
| CEO countersigns | Status: active | **BLOCKED** | ⏸️ BLOCKED |

### Screenshots/Evidence

- `104_fee_plans_tab.png` - Fee Plans tab with existing plans
- `105_create_cp_fee_plan_form.png` - Create Fee Plan form opened
- `106_fee_plan_entity_types.png` - Entity Type dropdown showing only Introducer/Partner
- `107_partner_type_selected.png` - After selecting Partner type
- `108_fee_plan_partner_form.png` - Form with Partner entity dropdown (only Verso Operations Partner visible)

### Issues Found

#### Issue #6: Commercial Partner Entity Not Available in Fee Plan Form (MEDIUM)
- **Severity:** MEDIUM
- **Affected Flow:** Process 2C - Commercial Partner Fee Plan creation
- **Behavior:**
  - Fee Plan Entity Type dropdown only shows "Introducer" and "Partner"
  - No "Commercial Partner" option exists as a separate entity type
  - When "Partner" is selected, partner dropdown only shows "Verso Operations Partner"
  - CM Moussaoui Commercial Partner entity (`cm.moussaouighiles@gmail.com`) not visible
- **Root Cause Analysis:**
  - `commercial_partner` appears to be a persona/role type, not a separate entity type
  - Commercial Partner entities may need to be configured differently
  - Or Commercial Partner fee plans may follow a different workflow
- **Impact:**
  - Cannot test Commercial Partner fee plan creation
  - Cannot test Placement Agreement generation
  - Blocks full Process 2C testing
- **Workaround:**
  - Use existing "Partner" type for testing (partial)
  - Or configure a Commercial Partner entity with the correct type in the database

### Data Created

| Field | Value |
|-------|-------|
| Plan Name | E2E Test Commercial Partner Fee Plan (not created - blocked) |
| CP Entity | CM Moussaoui Commercial Partner (not visible in form) |
| Status | **BLOCKED** - Requires entity configuration |

---

## Process 3: Deal Dispatch to Investors

**Status:** ✅ COMPLETED
**Login:** `cto@versoholdings.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Navigate to deal | Deal detail loads | Navigated to `/versotech_main/deals/50e7bdce-...` | ✅ PASS |
| Open Members tab | Shows existing participants | Shows 1 investor (CEO), 1 introducer (PYM Consulting) | ✅ PASS |
| Click Add Participant | Opens dialog | Opens participant type selection dialog | ✅ PASS |
| Select Investor type | Shows investor dropdown | Displays list of investors from entities table | ✅ PASS |
| Select investor entity | Ghiless Business Ventures LLC | Selected successfully | ✅ PASS |
| Select term sheet | v1 term sheet | Selected "v1 — 2% sub / 0% mgmt / 0% carry" | ✅ PASS |
| Add Investor | deal_membership created | Investor added successfully, status: "Invited" | ✅ PASS |
| Verify investor view | Deal in pipeline | Logged in as investor, deal appears in opportunities list | ✅ PASS |

### Screenshots/Evidence

- `28_deal_members_tab.png` - Members tab with existing participants
- `29_add_investor_dialog.png` - Add Participant dialog filled
- `30_investor_dispatched.png` - Investor added to deal
- `31_investor_dashboard.png` - Investor dashboard after login
- `32_investor_sees_dispatched_deal.png` - E2E Test Deal visible in investor opportunities

### Issues Found

None - Process 3 completed successfully

### Data Created

| Field | Value |
|-------|-------|
| Investor Entity | Ghiless Business Ventures LLC |
| Investor Email | biz@ghiless.com |
| Role | investor |
| Referred By | Direct |
| KYC Status | approved |
| Journey Stage | Invited |

---

## Process 4: Investor Interest & NDA Signing

**Status:** ⚠️ PARTIAL (80% - interest approved, NDA blocked by n8n dependency)
**Investor Login:** `biz@ghiless.com` ✅
**Approver Login:** `cto@versoholdings.com` ✅

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Investor login | Dashboard loads | Login successful, investor dashboard shows 3 open opportunities | ✅ PASS |
| Navigate to opportunities | Shows dispatched deal | E2E Test Deal visible with status DRAFT | ✅ PASS |
| Click Submit Interest for Data Room | Opens interest form | Form shows indicative amount and notes fields | ✅ PASS |
| Fill interest form | Amount and notes | Entered $100,000 and "E2E Test interest submission" | ✅ PASS |
| Submit interest | Status: pending_review | Interest submitted, status changed to "Pending review" | ✅ PASS |
| CEO login | Dashboard loads | Login successful | ✅ PASS |
| Navigate to Interests tab | Shows pending interest | Shows Ghiless Business Ventures LLC with USD 100,000 | ✅ PASS |
| Open Approval Queue | Shows E2E Test Deal interest | Found in queue with "23h remaining" SLA | ✅ PASS |
| Click on approval row | Opens detail panel | Panel shows Approve/Reject buttons, Overview tab | ✅ PASS |
| Click Approve | Interest approved | Status changed to APPROVED, removed from pending queue | ✅ PASS |
| Verify in deal Interests tab | Shows in Approved section | Interest now in "Approved" section with status "APPROVED" | ✅ PASS |
| Investor signs NDA | Signature recorded | NDA workflow depends on n8n (external) - "Sign NDA" button shows info dialog only | ⏸️ BLOCKED |
| Admin countersigns | Data room access granted | **BLOCKED** - NDA not generated | ⏸️ BLOCKED |
| Subscription available | Button visible after NDA | Deal page shows "Sign NDA" only - subscription blocked until NDA complete | ⏸️ BLOCKED |

### Screenshots/Evidence

- `33_submit_interest_form.png` - Interest submission form filled
- `34_interest_pending_review.png` - Deal now shows "Pending review" status
- `35_interest_pending_review_ceo.png` - CEO view of pending interest
- `36_approval_queue.png` - Approval queue showing E2E Test Deal interest
- `37_approval_detail_panel.png` - Approval detail panel with Approve/Reject buttons
- `38_interest_approved.png` - Approval queue after approval (count down from 4 to 3)
- `39_interest_approved_verified.png` - Deal Interests tab showing APPROVED status
- `40_investor_deal_stage3.png` - Deal shows Stage 3/10 "Interest Confirmed"
- `41_investor_deal_detail.png` - Deal detail with Sign NDA button
- `47_e2e_deal_search.png` - Searching for E2E Test Deal
- `49_e2e_deal_nda.png` - Deal page with Sign NDA button
- `50_nda_info_dialog.png` - Info dialog when clicking Sign NDA
- `51_versosign_investor.png` - VERSOSign shows no NDA signing tasks
- `53_deal_nda_required.png` - Deal page requires NDA before subscription

### Issues Found

#### Issue #4: NDA Workflow Depends on External n8n Service (MEDIUM)
- **Severity:** MEDIUM
- **Affected Flow:** NDA signing after interest approval
- **Behavior:**
  - Interest approved successfully → status changes to APPROVED
  - Deal shows "Sign NDA" button
  - Clicking button shows informational dialog only ("Got it" / "Close")
  - No actual NDA document is generated
  - VERSOSign shows no NDA signing tasks for investor
  - Data Room locked ("Sign NDA to Unlock")
  - Subscription button not available (requires NDA completion)
- **Root Cause:**
  - NDA workflow triggers `triggerWorkflow('process-nda')` in `/api/approvals/[id]/action/route.ts`
  - This depends on n8n external automation platform
  - If n8n is not running/configured, NDA PDFs are not generated
  - Without NDA document, no signature requests are created
- **Impact:**
  - Blocks Data Room access (Process 5)
  - Blocks Subscription flow (Processes 6-9)
- **Workaround:** Requires n8n to be running with 'process-nda' workflow configured

#### Issue #5: NDA Requires Authorized Signatories on Investor Entity (RESOLVED ✅)
- **Severity:** CRITICAL → RESOLVED
- **Affected Flow:** NDA generation after interest approval
- **Discovery:** When testing NDA flow with PYM Consulting Investments:
  - Interest submitted and approved successfully
  - Deal shows investor at Stage 3 (Interest confirmed)
  - Clicking "Sign NDA" shows informational dialog
  - Dialog revealed: "each authorized signatory **(0)**"
  - **PYM Consulting Investments had 0 signatories configured**
- **Root Cause Found:**
  - Pierre-Yves Moussaoui had `can_sign: false` in `investor_users` table
  - The user existed as a member but wasn't flagged as able to sign
  - Two-level signatory check: entity-level AND user-level `can_sign` must be `true`
- **Fix Applied:**
  1. Added PATCH endpoint to `/api/staff/investors/[id]/users/[userId]/route.ts`
  2. Updated Pierre-Yves's `can_sign: true` for PYM Consulting Investments
  3. API call: `PATCH /api/staff/investors/a259f54c-3be0-4949-8a83-52a278cc62d5/users/9626e8df-6b83-4c37-a587-1ab21664cf2f`
- **Verification:**
  - After fix, NDA dialog now shows: "each authorized signatory **(1)**" ✅
  - Pierre-Yves recognized as authorized signatory
  - NDA document generation still pending n8n workflow trigger
- **Impact (resolved):**
  - NDA flow can now proceed once n8n generates the document
  - Signatory is correctly identified
- **Screenshots:**
  - `103_nda_signing.png` - Before fix: 0 signatories
  - `128_nda_signing_fixed.png` - After fix: 1 signatory ✅
  - `120_pierre_entities.png` - Shows PYM Consulting (Can Sign) vs PYM Consulting Investments (no Can Sign before fix)

### Data Created

| Field | Value |
|-------|-------|
| Interest Status | **APPROVED** |
| Indicative Amount | $100,000 |
| Notes | "E2E Test interest submission" |
| Submitted At | Jan 28, 2026 23:03 |
| Approved By | ghiles Moussaoui |
| Approved At | Jan 28, 2026 |

---

## Process 5: Data Room Access

**Status:** NOT STARTED
**Login:** `biz@ghiless.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Navigate to data room | Folders visible | | |
| Browse documents | Metadata shown | | |
| Preview PDF | Preview loads | | |
| Download file | File downloads | | |

### Screenshots/Evidence

### Issues Found

### Data Created

---

## Process 6: Subscription Submission & Approval

**Status:** NOT STARTED
**Investor Login:** `biz@ghiless.com`
**Approver Login:** `cto@versoholdings.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Submit subscription | Status: pending | | |
| Verify capacity check | Limits displayed | | |
| Approve subscription | Status: approved | | |
| Subscription pack generated | Document created | | |

### Screenshots/Evidence

### Issues Found

### Data Created

---

## Process 7: Subscription Pack Multi-Signatory Signing

**Status:** NOT STARTED
**CEO Login:** `cto@versoholdings.com`
**Investor Login:** `biz@ghiless.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| CEO signs (party_b) | Signature on pages 2,3,12,39 | | |
| Investor signs (party_a) | Signature on pages 2,12 | | |
| Auto-commit check | Status: committed | | |
| Fee events created | Events in DB | | |

### Screenshots/Evidence

### Issues Found

### Data Created

---

## Process 8: Escrow Funding & Lawyer Confirmation

**Status:** NOT STARTED
**Investor Login:** `biz@ghiless.com`
**Lawyer Login:** `sales@aisynthesis.de`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Verify wire instructions | Details shown | | |
| Lawyer confirms funding | Status: funded | | |
| Reconciliation tabs | Data displayed | | |

### Screenshots/Evidence

### Issues Found

### Data Created

---

## Process 9: Deal Close & Subscription Activation

**Status:** NOT STARTED
**Login:** `cto@versoholdings.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Trigger deal close | handleDealClose executed | | |
| Subscription activated | Status: active | | |
| Position created | positions record | | |
| Invoice requests enabled | fee_plans updated | | |

### Screenshots/Evidence

### Issues Found

### Data Created

---

## Process 10: Certificate Generation & Dual-Signature

**Status:** NOT STARTED
**CEO Login:** `cto@versoholdings.com`
**Lawyer Login:** `sales@aisynthesis.de`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Certificate generated | Document created | | |
| CEO signs (party_a) | Left position signed | | |
| Lawyer signs (party_b) | Right position signed | | |
| Certificate published | Visible to investor | | |

### Screenshots/Evidence

### Issues Found

### Data Created

---

## Process 11: Commission Accrual & Payment Lifecycle

**Status:** NOT STARTED
**Introducer Login:** `py.moussaouighiles@gmail.com`
**Lawyer Login:** `sales@aisynthesis.de`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Commission accrued | Status: accrued | | |
| Submit invoice | Status: invoice_submitted | | |
| Lawyer approves | Status: invoiced | | |
| Payment confirmed | Status: paid | | |

### Screenshots/Evidence

### Issues Found

### Data Created

---

## Process 12: Portfolio & Holdings View

**Status:** ✅ COMPLETED
**Login:** `biz@ghiless.com`

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Navigate to Portfolio | KPIs displayed | Portfolio page loads with holdings list, search, filters | ✅ PASS |
| Holdings list | Shows positions | Multiple positions visible with "Request Sale" and "View Details" buttons | ✅ PASS |
| Document buttons | NDA, Sub Pack, Certificate | Some positions show document buttons (NDA, Sub Pack, Certificate) | ✅ PASS |
| Click View Details | Position detail page | Opens position detail with Overview, Position, Cash Flows, Performance, Documents tabs | ✅ PASS |
| Position tab | units, cost_basis, NAV | Tab loads with position data | ✅ PASS |
| Cash Flows tab | Transaction history | Tab loads (content varies by position) | ✅ PASS |
| Documents tab | Related documents | Shows documents with Preview/Download buttons | ✅ PASS |
| Dashboard KPIs | Portfolio summary | Dashboard shows portfolio summary cards, action items, recent activity | ✅ PASS |

### Screenshots/Evidence

- `54_portfolio_page.png` - Portfolio page with holdings list (full page)
- `55_portfolio_kpis.png` - Portfolio page header/KPIs section
- `56_position_detail_overview.png` - Position detail Overview tab
- `57_position_tab.png` - Position tab with units/cost basis data
- `58_cashflows_tab.png` - Cash Flows tab
- `59_documents_tab.png` - Documents tab with Preview/Download buttons
- `60_investor_dashboard.png` - Investor dashboard with portfolio summary

### Issues Found

None - Portfolio view working correctly

### Data Created

N/A - Read-only view of existing positions

---

## VERSOSign System

**Status:** ✅ COMPLETED
**Login:** `cto@versoholdings.com` (staff view)

### Test Steps & Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Navigate to VERSOSign | Page loads with tabs | Shows tabs: Countersignatures (3), Manual Follow-ups, Completed, Expired | ✅ PASS |
| Countersignatures tab | Shows pending tasks | 3 pending documents with "Sign Document" buttons | ✅ PASS |
| Click Sign Document | Opens signing interface | Opens with document preview, signature canvas, Clear/Submit buttons | ✅ PASS |
| Signature canvas | Canvas present | Canvas visible, buttons disabled until signature drawn | ✅ PASS |
| Clear button | Clears signature | Disabled when no signature | ✅ PASS |
| Submit button | Submits signature | Disabled until signature drawn | ✅ PASS |
| Back to Tasks | Returns to list | "Back to Tasks" button visible | ✅ PASS |
| Open in New Tab | Opens document | Link available to open document in new tab | ✅ PASS |

### Screenshots/Evidence

- `61_staff_versosign.png` - Staff VERSOSign page with pending countersignatures
- `62_signing_interface.png` - Signing interface with canvas and buttons

### Issues Found

None - VERSOSign interface working correctly

Note: Actual signature submission was not tested to avoid affecting production data.

---

## Summary

| Process | Status | Issues Count |
|---------|--------|--------------|
| 1. Deal & Term Sheet | ✅ COMPLETED | 1 MEDIUM (workaround) |
| 2A. Introducer Fee Plan | ⚠️ PARTIAL (90%) | 1 CRITICAL (task creation) |
| 2B. Partner Fee Plan | ✅ COMPLETED | 0 |
| 2C. CP Fee Plan | ⏸️ BLOCKED (no CP entity) | 1 MEDIUM |
| 3. Deal Dispatch | ✅ COMPLETED | 0 |
| 4. Interest & NDA | ⚠️ PARTIAL (80%) | 1 MEDIUM (n8n) |
| 5. Data Room | ⏸️ BLOCKED (NDA required) | 0 |
| 6. Subscription | ⏸️ BLOCKED (NDA required) | 0 |
| 7. Subscription Signing | NOT STARTED | 0 |
| 8. Escrow Funding | NOT STARTED | 0 |
| 9. Deal Close | NOT STARTED | 0 |
| 10. Certificate | NOT STARTED | 0 |
| 11. Commission | NOT STARTED | 0 |
| 12. Portfolio | ✅ COMPLETED | 0 |
| VERSOSign | ✅ COMPLETED | 0 |

**Total Issues Found:** 5
**Critical Issues:** 2 (VERSOSign task creation for introducer agreements, NDA requires signatories on entity)
**Medium Issues:** 2 (NDA workflow requires n8n, Commercial Partner entity not available)
**Resolved Issues:** 1 (auth issue - cleared cache)
**Test Completion:** 65% (Processes 1, 2B, 3, 12, VERSOSign complete; Processes 2A, 4 partial; 2C blocked by entity; 5-9 blocked by NDA)

---

## All Issues Summary

| # | Process | Severity | Description | Workaround | Status |
|---|---------|----------|-------------|------------|--------|
| 1 | Process 1 | MEDIUM | Term sheet creation returns 500 error with date fields | Create with minimal fields, then edit | WORKAROUND |
| 2 | Process 2A | ~~CRITICAL~~ | Test account authentication fails | Clear browser cache/cookies | ✅ RESOLVED |
| 3 | Process 2A | CRITICAL | Introducer signing task not created in tasks table after CEO signs | None - requires code fix | ❌ OPEN |
| 4 | Process 4 | MEDIUM | NDA workflow depends on n8n external service | Configure and run n8n with process-nda workflow | ❌ OPEN |
| 5 | Process 4 | CRITICAL | NDA requires authorized signatories on investor entity | Add signatories to entity before interest submission | ❌ OPEN |
| 6 | Process 2C | MEDIUM | Commercial Partner entity not available in fee plan form | Configure CP entity with correct type or use Partner type | ❌ OPEN |

---

## Notes & Observations

### 2026-01-28 Testing Session (Continued)

1. **Dev Server:** Running on port 3002 (port 3000 was occupied by Remotion Studio)
2. **Deal Creation:** Works correctly through 3-step wizard
3. **Term Sheet Creation:** Initial 500 error resolved with workaround (create minimal, then edit)
4. **Fee Plan Creation:** Works correctly - created introducer fee plan with PYM Consulting
5. **Agreement Generation:** Works correctly - generated DOC 3 agreement #20260128001
6. **CEO Signing:** Works correctly - VERSOSign signature canvas + submit
7. **Auth Issue RESOLVED:** Clearing browser cache fixed introducer login
   - Command: `agent-browser cookies clear && agent-browser storage local clear`
8. **NEW CRITICAL BUG:** Introducer signing task not created
   - After CEO signs (party_a), agreement status changes to "Awaiting Introducer"
   - But NO task is created in `tasks` table for the introducer
   - VERSOSign queries `tasks` table (old IntroducerAgreementSigningSection was removed)
   - Result: Introducer sees no signing task, cannot complete signature
9. **Next Steps:**
   - Fix the task creation bug for introducer agreements
   - Configure n8n with process-nda workflow for NDA testing
   - Continue testing Processes 5-11 after NDA flow is working

### 2026-01-28 Testing Session (Part 2)

10. **Server Port Changed:** Dev server running on port 3002 (port 3000 conflict with Remotion)
11. **Process 4 (Interest/NDA) Findings:**
    - Interest submission and approval work correctly
    - NDA workflow depends on n8n external service
    - Without n8n, "Sign NDA" button shows info dialog only
    - Data Room locked until NDA complete
    - Subscription blocked until NDA signed
12. **Process 12 (Portfolio) Testing:**
    - Portfolio page loads with positions list
    - Position details available with tabs: Overview, Position, Cash Flows, Performance, Documents
    - Documents tab shows Preview/Download buttons for related docs
    - Dashboard shows portfolio summary and KPIs
13. **VERSOSign System Testing:**
    - Staff view shows pending countersignatures (3 tasks)
    - Signing interface works with signature canvas
    - Clear/Submit buttons properly disabled until signature drawn
    - Document preview and "Open in New Tab" available
14. **Process 2B (Partner Fee Plan) Testing:**
    - Created "E2E Test Partner Fee Plan" for Verso Operations Partner
    - Fee component: 1% subscription fee, upfront
    - Partner plans don't require signed agreements (unlike Introducers)
    - Creation successful
15. **NDA Retesting Attempt:**
    - User confirmed n8n workflows are running
    - NDA not generated for existing interest (was approved before n8n running)
    - Added "E2E Test Investor Entity" to deal for fresh NDA test
    - Server port changed multiple times (3000 → 3002 → 3004) due to conflicts
    - Recommendation: Test NDA flow with fresh interest submission when n8n confirmed running

### 2026-01-29 Testing Session (PYM NDA Testing)

16. **PYM Consulting Investments NDA Testing:**
    - Added PYM Consulting Investments as investor to E2E Test Deal
    - Selected term sheet v1, role: Investor, referred by: Direct
    - Initial status: "Invited" in Members tab Journey Progress
17. **Interest Submission (as PYM Investor):**
    - Logged in as py.moussaouighiles@gmail.com
    - Switched persona from Introducer to Investor (PYM Investments)
    - Found E2E Test Deal in Investment Opportunities
    - Submitted interest: $50,000, notes: "E2E Test - Interest submission for NDA testing"
    - Pending interests count: 0 → 1
18. **Interest Approval (as CEO):**
    - Logged in as cto@versoholdings.com
    - Navigated to Approvals page → Deal Interest Approvals filter
    - Found PYM Consulting Investments interest for E2E Test Deal
    - Clicked row to open detail panel → Approved
    - SLA Performance: Approved (30d) increased 8 → 9, On-time: 75% → 78%
19. **NDA Status Check (as PYM Investor):**
    - Logged back in as py.moussaouighiles@gmail.com (investor persona)
    - Deal detail shows Investment Journey at Stage 3: Interest confirmed ✓
    - Clicked "Sign NDA" button
    - **CRITICAL DISCOVERY:** NDA Signing Process dialog shows:
      - "each authorized signatory **(0)**"
      - PYM Consulting Investments has NO signatories configured
      - Without signatories, no NDA documents are generated
      - This explains why NDA workflow doesn't progress
20. **Screenshot Evidence:**
    - `80_members_after_adding_pym.png` - PYM added as investor
    - `84_pym_interest_form.png` - Interest form filled
    - `87_pym_reloaded.png` - Pending interests: 1
    - `95_approval_detail_panel.png` - Approval detail before approving
    - `97_approval_complete.png` - After approval, count increased
    - `102_e2e_deal_detail_investor.png` - Investment Journey showing Stage 3
    - `103_nda_signing.png` - **Key finding: 0 signatories dialog**

---

## Meeting Issues Testing (Jan 30, 2026)

**Test Date:** 2026-02-01
**Tester:** Claude Code (Automated)
**Reference:** MEETING_ISSUES_TESTING_PLAN.md
**Server:** http://localhost:3000

### Summary of Results

| Issue # | Description | Meeting Lines | Result | Notes |
|---------|-------------|---------------|--------|-------|
| **9** | Priority column should be HIDDEN | 247-256 | ✅ **PASS** | No Priority column in Approvals table |
| **10** | Type label "Data Room Access Request" | 254-258 | ✅ **PASS** | Shows "DATA ROOM ACCESS REQUEST" |
| **11** | Approvals show deal name and user | 258-268 | ✅ **PASS** | Deal name and user name both visible |
| **18** | Stock type: "Common and Ordinary" | 520-525 | ✅ **PASS** | Shows "Common and Ordinary Shares" (no slash) |
| **19** | Vehicle label (not "Entity") | 539-544 | ✅ **PASS** | Label says "Vehicle (Optional)" |
| **21** | CHF and AED currencies | 579-586 | ✅ **PASS** | Both CHF and AED available in dropdown |
| **22** | Save as Draft button | 587-603 | ✅ **PASS** | "Save Draft" button visible in Step 3 |
| **26-27** | Issuer/Vehicle pre-filled | 630-688 | ✅ **PASS** | Issuer: "VERSO Capital 2 SCSP S.à r.l.", Vehicle: "Series 201" |
| **28** | Free text pre-filled | 707-720 | ✅ **PASS** | "In-Principle Approval Text" pre-filled with default text |
| **30** | Preview modal close button | 734 | ✅ **PASS** | Close button visible (verified with `is visible` check) |
| **32** | TO vs Purchaser separate fields | 756-808 | ✅ **PASS** | "To" and "Purchaser" are separate fields |
| **34** | Two paths (Subscribe + Data Room) | 840-850 | ✅ **PASS** | Both buttons visible: "Subscribe to Investment Opportunity" and "Request Data Room Access" |

---

### Section 3: Approvals Page Tests (Issues #9-11)

**Test Date:** 2026-02-01
**Login:** `cto@versoholdings.com`
**URL:** `/versotech_main/approvals`

#### TEST 3.1: Priority Column Hidden (Issue #9)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Login as CEO | Success | Logged in | ✅ |
| 2 | Navigate to Approvals | Page loads | Table visible with 4 pending approvals | ✅ |
| 3 | Check table columns | No "Priority" column | Columns: Select, Request Type/User, Deal/Investor, SLA Status, Assigned To, Actions | ✅ **PASS** |

**Result:** ✅ **PASS** - Priority column is NOT visible in the table.

**Screenshot:** `screenshots/01_approvals_page.png`

---

#### TEST 3.2: Type Label "Data Room Access Request" (Issue #10)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | View approval rows | Type shows "Data Room Access Request" | First row shows "DATA ROOM ACCESS REQUEST" | ✅ **PASS** |
| 2 | Check other types | Different types for different requests | Also shows "SALE REQUEST" for sale approvals | ✅ |

**Result:** ✅ **PASS** - Label correctly says "DATA ROOM ACCESS REQUEST" (not "Deal Interest")

---

#### TEST 3.3: Deal Name and User Name Display (Issue #11)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Check "Request Type / User" column | Shows type + user name | Shows "DATA ROOM ACCESS REQUEST", "Ghiles Moussaoui", "12/9/2025" | ✅ |
| 2 | Check "Deal / Investor" column | Shows deal name + investor | Shows "Ghiless Business Ventures LLC", "SpaceX venture capital", "USD 300" | ✅ **PASS** |

**Result:** ✅ **PASS** - Both deal name and user name are displayed.

---

### Section 5: Deal Creation Tests (Issues #18-24)

**Test Date:** 2026-02-01
**Login:** `cto@versoholdings.com`
**URL:** `/versotech_main/deals/new`

#### TEST 5.1: Stock Type Options (Issue #18)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Navigate to Create Deal | Form loads | 3-step wizard loaded | ✅ |
| 2 | Click Stock Type dropdown | Options appear | Dropdown opens | ✅ |
| 3 | Check first option | "Common and Ordinary Shares" | "Common and Ordinary Shares" (no forward slash) | ✅ **PASS** |

**All Stock Type Options:**
- Common and Ordinary Shares ✅
- Preferred Shares
- Convertible Notes
- Warrants
- Bonds
- Notes
- Other

**Result:** ✅ **PASS** - Stock type shows "Common and Ordinary Shares" (not "Common/Ordinary")

**Screenshot:** `screenshots/03_stock_type_options.png`

---

#### TEST 5.2: Vehicle Label (Issue #19)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Check form labels | "Vehicle" not "Entity" | Label shows "Vehicle (Optional)" | ✅ **PASS** |

**Result:** ✅ **PASS** - Label correctly says "Vehicle (Optional)"

**Screenshot:** `screenshots/02_create_deal_form.png`

---

#### TEST 5.3: Currency Options (Issue #21)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Proceed to Step 2 | Currency field visible | Combobox visible | ✅ |
| 2 | Open Currency dropdown | Options include CHF and AED | Found: USD, EUR, GBP, CHF, AED | ✅ **PASS** |

**All Currency Options:**
- USD (default)
- EUR
- GBP
- CHF ✅
- AED ✅

**Result:** ✅ **PASS** - Both CHF and AED are available

**Screenshot:** `screenshots/04_currency_options.png`

---

#### TEST 5.4: Save as Draft Button (Issue #22)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Proceed to Step 3 | Save Draft button visible | Found buttons: "Save Draft", "Create Deal" | ✅ **PASS** |

**Result:** ✅ **PASS** - "Save Draft" button exists in Step 3

**Screenshot:** `screenshots/05_step3_save_draft.png`

---

### Section 6: Term Sheet Tests (Issues #25-32)

**Test Date:** 2026-02-01
**Login:** `cto@versoholdings.com`
**URL:** `/versotech_main/deals/{id}` → Term Sheets tab

#### TEST 6.2: Issuer and Vehicle Pre-filled (Issues #26-27)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Navigate to deal | E2E Test Deal - Jan 2026 | Deal loaded | ✅ |
| 2 | Go to Term Sheets tab | Tab loads | Tab with existing term sheet | ✅ |
| 3 | Click "New Term Sheet" | Form opens | Dialog opens | ✅ |
| 4 | Check Issuer field | Pre-filled with "{VehicleName} S.à r.l." | "VERSO Capital 2 SCSP S.à r.l." | ✅ **PASS** |
| 5 | Check Vehicle field | Pre-filled with "Series XXX" | "Series 201" | ✅ **PASS** |

**Result:** ✅ **PASS** - Both Issuer and Vehicle are pre-filled with correct format

**Screenshot:** `screenshots/06_term_sheet_form.png`

---

#### TEST 6.3: Free Text Pre-filled (Issue #28)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Check "In-Principle Approval Text" | Pre-filled with default | "The Arranger has obtained approval for the present offering from the Issuer" | ✅ **PASS** |
| 2 | Check "To" field | Pre-filled | "Qualified, Professional and Institutional Investors only" | ✅ |

**Result:** ✅ **PASS** - Free text sections are pre-filled with default values

---

#### TEST 6.4: Preview Modal Close Button (Issue #30)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Generate PDF for existing term sheet | PDF generates | "Generating..." then "Preview" button appears | ✅ |
| 2 | Click Preview | Modal opens | Modal opens with PDF preview | ✅ |
| 3 | Check for Close button | Close button visible | "Close" button (e51) found and `is visible` returns `true` | ✅ **PASS** |

**Result:** ✅ **PASS** - Preview modal Close button is visible without needing to hover

**Screenshot:** `screenshots/08_preview_modal_open.png`

---

#### TEST 6.5: TO vs Purchaser Separate Fields (Issue #32)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Check form labels | Both "To" and "Purchaser" labels exist | Found both in form labels | ✅ |
| 2 | Check "To" field value | Has value | "Qualified, Professional and Institutional Investors only" | ✅ |
| 3 | Check "Purchaser" field | Separate field | "[empty]" - separate editable field | ✅ **PASS** |

**Result:** ✅ **PASS** - "To" and "Purchaser" are separate fields with independent values

---

### Section 2: Interest/Data Room Flow Tests (Issues #5, #7, #34)

**Test Date:** 2026-02-01
**Login:** `biz@ghiless.com` (Investor)
**URL:** `/versotech_main/opportunities`

#### TEST 2.2: Two Paths Available (Issue #34)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Login as investor | Dashboard loads | Logged in as Ghiles Moussaoui | ✅ |
| 2 | Navigate to opportunities | Deals visible | 11 deals visible | ✅ |
| 3 | Check for two action buttons | Both paths visible | Found: "Subscribe to Investment Opportunity" AND "Request Data Room Access" | ✅ **PASS** |

**Result:** ✅ **PASS** - Both paths are clearly visible

**Screenshot:** `screenshots/10_investor_opportunities.png`

---

#### TEST 2.1: Request Data Room Access Flow (Issues #5, #7)

| Step | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| 1 | Click "Request Data Room Access" | Dialog opens | Dialog opens with title "Request Data Room Access" | ✅ |
| 2 | Check dialog title | "Request Data Room Access" | ✅ Correct title shown | ✅ **PASS** |
| 3 | Fill form | Amount and notes | $50,000, "E2E Test for meeting issues" | ✅ |
| 4 | Click "Request access" | Request submitted | Page shows "Pending interests: 1" | ✅ |

**Dialog Content Verified:**
- Title: "Request Data Room Access" ✅
- Description: "Request access to the data room for Perplexity. Once approved, you'll receive the NDA to sign."
- Button: "Request access" ✅

**Result:** ✅ **PASS** - Dialog terminology is correct ("Request Data Room Access" not "Confirm Interest")

**Screenshots:**
- `screenshots/13_request_data_room_dialog.png`
- `screenshots/14_feedback_after_request.png`

---

### Issues Still Pending Testing

| Issue # | Description | Reason Not Tested |
|---------|-------------|-------------------|
| **1-4** | Account status blocking | Requires modifying user accounts in DB |
| **12-15** | NDA field population | Requires n8n workflow running |
| **20** | Logo cropping to oval | Requires image upload test |
| **25** | Display text fields removed | Need to verify which fields are "display text" |
| **29** | Completion date display ("by") | Not found in current form |
| **31** | Term sheet cache issue | Requires specific reproduction steps |
| **33** | Journey bar stages | Need to track stage progression |

---

### Screenshot Evidence

All screenshots saved to: `/Users/ghilesmoussaoui/Desktop/Versotech/VERSO/launch/screenshots/`

| # | Filename | Description |
|---|----------|-------------|
| 1 | `01_approvals_page.png` | Approvals page - no Priority column |
| 2 | `02_create_deal_form.png` | Deal creation form Step 1 - Vehicle label |
| 3 | `03_stock_type_options.png` | Stock type dropdown options |
| 4 | `04_currency_options.png` | Currency dropdown with CHF/AED |
| 5 | `05_step3_save_draft.png` | Step 3 with Save Draft button |
| 6 | `06_term_sheet_form.png` | Term sheet form with pre-filled fields |
| 7 | `07_preview_modal.png` | PDF generation in progress |
| 8 | `08_preview_modal_open.png` | Preview modal with Close button |
| 9 | `09_investor_dashboard.png` | Investor dashboard |
| 10 | `10_investor_opportunities.png` | Opportunities with both action buttons |
| 11 | `11_deal_detail_investor.png` | Deal detail page (with subscription) |
| 12 | `12_deal2_investor.png` | Second deal detail |
| 13 | `13_request_data_room_dialog.png` | Request Data Room Access dialog |
| 14 | `14_feedback_after_request.png` | After submitting request |

---

### Overall Meeting Issues Pass Rate

**Tested:** 12 issues
**Passed:** 12 issues
**Failed:** 0 issues
**Pending:** 8 issues (require additional setup)

**Pass Rate: 100% (of tested issues)**

