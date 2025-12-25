# Fred's Feedback Analysis - Phase 2 Plan Review

**Date:** December 18, 2025
**Document:** Analysis of client feedback on PHASE2_BASE_PLAN.md v1.2
**Purpose:** Identify required corrections before plan update

---

## Summary of Fred's 15 Feedback Points

### CATEGORY A: Critical Corrections (Must Fix)

#### 1. Hybrid Personas Are CONDITIONAL, Not Automatic

**Fred's Point:** "The partner the introducer and the commercial partner CAN be investor on each IO (investment opportunity) IF the CEO dispatches them as such"

**Current Plan Issue:**
- Section 2.5-2.7 states Partner/Introducer/Commercial Partner "EVERYTHING an Investor does" as if it's automatic
- This is INCORRECT

**Correct Understanding:**
- These personas CAN act as investors, but ONLY when:
  1. CEO dispatches an Investment Opportunity (IO) to them
  2. CEO explicitly marks them in investor capacity for that specific deal
- It's per-deal, not global
- A Partner without CEO dispatch to a specific IO does NOT have investor access to that IO

**Evidence:** User stories show "My opportunities as investor (even if I am partner)" - this is about viewing IOs dispatched TO THEM as investor, not about having automatic investor access

**Plan Update Required:**
- Section 2.5-2.7: Clarify the conditional nature
- Section 4: Update persona detection to be deal-specific
- Database: May need `deal_memberships.role` to track "dispatched as investor" vs "dispatched as partner"

---

#### 2. Commercial Partner Proxy Mode (NEW)

**Fred's Point:** "on behalf of client XXX means the CEO is talking to an external interface which is the commercial partner, the commercial partner will access an opportunity and from the opportunity the commercial partner will be dispatching and doing everything on behalf of someone else"

**Current Plan Issue:**
- Section 2.7 mentions Commercial Partner can "execute on behalf of clients"
- But misses the TWO MODES of operation

**Correct Understanding - TWO MODES:**

**MODE 1: Direct Investment**
- Commercial Partner invests their own money
- Same as investor journey

**MODE 2: Proxy Mode (NEW)**
- CEO dispatches IO to Commercial Partner with "on behalf of Client XXX"
- Client XXX may be:
  - Unknown to VERSO (new investor)
  - Known investor (existing in system)
- Commercial Partner handles ENTIRE flow for Client XXX:
  - Signs NDA on behalf of Client XXX
  - Gets data room access for Client XXX
  - Submits subscription on behalf of Client XXX
  - Signs subscription pack on behalf of Client XXX
- All documents show "Client XXX" as the investing party
- Commercial Partner is the executor, not the investor

**Plan Update Required:**
- Section 2.7: Add explicit Proxy Mode description
- Phase 3: Update subscription pack workflow to handle proxy signing
- Database: Need way to track proxy relationships (commercial_partner_clients table?)
- UI: Add "On Behalf Of" selector when Commercial Partner submits subscription

---

#### 3. Investor Journey Has 10 Stages (Not 7)

**Fred's Point:** "this is the life cycle Received > Viewed > Interest confirmed > NDA signed > data room access > pack generated > pack sent > signed > funded > active"

**Current Plan Issue:**
- Section 11.1 and Phase 3 show 7 stages: Interest → NDA → Data Room → Subscribe → Sign → Fund → Active

**Correct 10 Stages:**
1. **Received** - IO dispatched to investor (investor notified)
2. **Viewed** - Investor opened/viewed the IO
3. **Interest Confirmed** - Investor expressed interest
4. **NDA Signed** - All signatories signed NDA
5. **Data Room Access** - Access granted
6. **Pack Generated** - Subscription pack created (system action)
7. **Pack Sent** - Pack sent to signatories for signature
8. **Signed** - All signatories signed subscription pack
9. **Funded** - Funds received
10. **Active** - Investment active in portfolio

**Missing Stages in Current Plan:**
- Received (new)
- Viewed (new)
- Pack Generated (was implicit)
- Pack Sent (was implicit)

**Plan Update Required:**
- Section 11.1: Update journey stages to 10
- Phase 3: Update journey bar component
- Database: May need tracking for Received and Viewed stages

---

#### 4. Lawyer Subscription Visibility

**Fred's Point:** "I think as per my understanding when the investor is done signing the lawyer receives a copy of the signed subscription pack"

**Current Plan Issue:**
- Section 2.3 mentions lawyer handles escrow and receives notifications
- But doesn't explicitly mention subscription visibility

**Correct Understanding:**
- Lawyer assigned to a deal should SEE subscriptions for that deal
- When investor signs subscription pack, lawyer gets notified
- Lawyer can view signed subscription packs

**Plan Update Required:**
- Section 2.3: Add "View signed subscription packs for assigned deals"
- Section 5.3 (Lawyer Navigation): Add subscription visibility
- Phase 6: Ensure lawyer has read access to subscriptions for assigned deals

---

#### 5. Signatory Logic Applies to ALL Documents

**Fred's Point:** "all documents should be signed by the designated signatories as per entity"

**Current Plan Issue:**
- Section 7 focuses on subscription packs
- Implies NDA is different

**Correct Understanding:**
- Signatory designation applies to:
  - NDA (each signatory signs their own NDA)
  - Subscription Pack (all signatories sign one pack)
  - ALL other legal documents
- The `is_signatory` flag determines who can sign ANY document for the entity
- Non-signatories can view but NEVER sign

**Plan Update Required:**
- Section 7: Broaden title to "Document Signatory Logic"
- Clarify it applies to all documents, not just subscription packs

---

### CATEGORY B: Clarifications Needed

#### 6. Route Structure Confusion (Section 8)

**Fred's Point:** "Clarify and simplify"

**Issue:** Section 8 lists many routes that may be overwhelming
**Action:** Reorganize into logical groups, remove redundancy

---

#### 7. Entity-User Model Confirmation

**Fred's Point:** "Personas are individual OR entity and within a user story each persona has a Profile individual section"

**Current Plan Status:** CORRECT - Section 3 already covers this correctly
**Action:** No change needed, just confirm understanding with Fred

---

#### 8. Compliance Questionnaire Storage

**Fred's Point:** "The compliance questionnaire is already available in profile within KYC it just need to be stored"

**Current Plan Status:** Already mentioned in Phase 4 (KYC/Compliance split)
**Action:** Ensure database has proper storage for questionnaire responses

---

### CATEGORY C: Process/Workflow Notes

#### 9. Review Subscription Pack Workflow with Julien

**Fred's Point:** "I would need to review that with Julien"
**Action:** Schedule session with Julien before Phase 3 implementation

---

#### 10. Review Phases 4-6 After Phase 1-2

**Fred's Point:** "I think we can review phase 3 to 6 once we are done with phase 1 to 2"
**Action:** Break plan into two review cycles

---

#### 11. Team Support for Testing

**Fred's Point:** "For the phase 7 testing we can get one of your team member to help me testing"
**Action:** Allocate team member for UAT in Phase 7

---

#### 12. Fees Not Yet Reviewed

**Fred's Point:** "I haven't reviewed the fees"
**Action:** Fees system review as separate work item

---

#### 13. Sprint Structure Proposal

**Fred's Point:** Suggested 2-week sprint structure
**Action:** Consider for project planning, outside of plan document

---

## Database Impact Analysis

### Current Schema vs Required Changes

#### A. Tables That Exist (from DATABASE_SCHEMA_DUMP.sql):
- `profiles` - User accounts with role enum
- `investors` - Investor entities
- `investor_users` - Links profiles to investors (CORRECT pattern)
- `introducers` - Has single `user_id` (WRONG pattern - needs `introducer_users`)
- `arranger_entities` - Arranger entities (exists)
- `deals` - Investment opportunities
- `deal_memberships` - Links users to deals with role enum
- `signature_requests` - Tracks signature requests
- `subscriptions` - Investor subscriptions to vehicles

#### B. Tables Missing (from Plan Section 6):
- `introducer_users` - Multi-user per introducer
- `partner_entities` + `partner_users` - Partner entities
- `commercial_partner_entities` + `commercial_partner_users` - Commercial partner entities
- `arranger_users` - Multi-user per arranger
- `lawyer_entities` + `lawyer_users` - Lawyer entities
- `placement_agreements` - Commercial partner agreements
- `introducer_agreements` - Introducer fee agreements

#### C. NEW Tables Needed (from Fred's feedback):
- `commercial_partner_clients` - For proxy mode relationships
  - `commercial_partner_id` (FK)
  - `client_name` (text) - May be unknown investor
  - `client_investor_id` (FK, nullable) - If known investor
  - `created_by_deal_id` - Which deal this was created for

#### D. Existing Table Changes Needed:
1. `deal_memberships`:
   - Current roles: investor, co_investor, spouse, advisor, lawyer, banker, introducer, viewer, verso_staff
   - Add roles: `partner_investor`, `introducer_investor`, `commercial_partner_investor`, `commercial_partner_proxy`
   - This enables per-deal persona tracking

2. `investor_deal_interest` or new table:
   - Add `received_at` timestamp (when IO dispatched)
   - Add `viewed_at` timestamp (when investor opened IO)

---

## Key Corrections to Make in Plan

### Section 2 (Personas) - Updates:

1. **Section 2.5 (Partner):**
   - Change from "EVERYTHING an Investor does" to "CAN access investor features FOR DEALS where CEO dispatched them as investor"
   - Add: "Partner investor access is deal-specific, granted by CEO dispatch"

2. **Section 2.6 (Introducer):**
   - Same correction as Partner

3. **Section 2.7 (Commercial Partner):**
   - Add explicit "TWO MODES" subsection:
     - Mode 1: Direct investment (same as investor)
     - Mode 2: Proxy mode (on behalf of Client XXX)
   - Clarify proxy mode workflow in detail

### Section 3 (Entity-User Model) - No Change:
- Already correctly describes entity-user relationship

### Section 4 (Persona Detection) - Updates:

1. Add deal-specific persona detection:
```
8. SELECT * FROM deal_memberships WHERE user_id = [logged_in_user] AND deal_id = [current_deal]
   → Determines per-deal persona (investor, partner_investor, commercial_partner_proxy, etc.)
```

### Section 5 (Navigation) - Updates:

1. **Section 5.3 (Lawyer):**
   - Add: "View signed subscription packs for assigned deals"

### Section 7 (Signatory Logic) - Updates:

1. Rename to "Document Signatory Logic"
2. Add: "Applies to ALL legal documents: NDA, Subscription Pack, Amendments, etc."
3. Clarify: Non-signatories can view but NEVER sign

### Section 11.1 (Investor Journey) - Updates:

1. Change from 7 stages to 10 stages:
   - Received → Viewed → Interest Confirmed → NDA Signed → Data Room Access → Pack Generated → Pack Sent → Signed → Funded → Active

### Phase 3 - Updates:

1. Update journey bar to show 10 stages
2. Add data sources for new stages:
   - Received: `investor_deal_interest.received_at` or `deal_memberships.invited_at`
   - Viewed: `investor_deal_interest.viewed_at` or `deal_memberships.accepted_at`
   - Pack Generated: `deal_subscription_submissions.pack_generated_at`
   - Pack Sent: `signature_requests.email_sent_at`

### Phase 1 (Database) - Updates:

1. Add `commercial_partner_clients` table for proxy mode
2. Update `deal_memberships.role` enum with new values
3. Add tracking columns for Received/Viewed stages

---

## Questions to Confirm with Fred

1. **Proxy Mode Client Creation:**
   - When Commercial Partner acts on behalf of "Client XXX", is Client XXX:
     a) Automatically created as new investor?
     b) Just stored as text in the subscription?
     c) Created on-demand if they want to continue independently later?

2. **Pack Generated vs Pack Sent:**
   - Is there a review step between generation and sending?
   - Or does it go directly from generated → sent?

3. **Received vs Dispatched Terminology:**
   - User stories use "Received" - confirm this means "CEO dispatched IO to investor"

---

## Summary of Required Plan Changes

| Section | Change Type | Description |
|---------|-------------|-------------|
| 2.5-2.7 | CRITICAL | Add conditional investor access (per-deal, CEO dispatch) |
| 2.7 | CRITICAL | Add Commercial Partner Proxy Mode (Two Modes) |
| 4 | MAJOR | Add deal-specific persona detection |
| 5.3 | MINOR | Add lawyer subscription visibility |
| 7 | MINOR | Broaden signatory logic to all documents |
| 8 | MINOR | Simplify route structure presentation |
| 11.1 | MAJOR | Update to 10-stage investor journey |
| Phase 1 | MAJOR | Add proxy mode tables, update enums |
| Phase 3 | MAJOR | Update journey bar, add new tracking |

---

**Next Step:** Update PHASE2_BASE_PLAN.md with all corrections above.
