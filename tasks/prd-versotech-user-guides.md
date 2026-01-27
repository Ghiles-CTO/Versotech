# PRD: Versotech Platform User Guides

## Introduction

Create comprehensive user guides for the Versotech investment banking platform. These guides are for **internal users only** - not technical documentation, not marketing material. The purpose is to enable each persona to complete their workflows independently without needing support.

The guides are organized by **persona** and **user journey** - what the user is trying to accomplish, not what buttons exist in the system.

---

## Goals

- Enable self-service for all platform users across 7 personas
- Reduce support burden by documenting all critical workflows
- Provide clear, actionable guidance with minimal but strategic visual aids
- Create a single source of truth for "how things work" in Versotech
- Ensure new users can onboard without hand-holding

---

## Scope & Boundaries

### In Scope
- All user-facing workflows in `/versotech_main`
- End-to-end processes from user's perspective
- Prerequisites, step-by-step actions, expected outcomes
- Strategic screenshots at decision points and key forms
- Edge cases and common mistakes

### Out of Scope (Non-Goals)
- Technical/developer documentation
- API documentation
- Database schema explanations
- Admin configuration guides (separate document)
- Feature marketing or sales materials
- Granular UI element documentation (not "how to use a dropdown")

---

## Delivery Format

- **Format:** Markdown files
- **Location:** `VERSO/User Guides/`
- **Structure:** One file per persona guide
- **Screenshots:** Stored in `VERSO/User Guides/assets/[persona]/`
- **Naming:** `[persona]-guide.md` (e.g., `investor-guide.md`)

---

## User Stories

Stories are grouped by persona. Each section within a persona is a separate story to ensure focused, completable work.

---

# GETTING STARTED (Universal)

This guide applies to ALL users regardless of persona.

### US-GS-001: Create Getting Started Guide - First Login
**Description:** As any new user, I need documentation on how to accept my invitation, set my password, and complete initial profile setup.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/getting-started.md` with guide header and "Who is this for" statement
- [ ] Section 1: Your First Login
  - Accepting your invitation email
  - Setting your password (requirements)
  - First-time login experience
  - Completing your basic profile
- [ ] Prerequisites: Must have received invitation email
- [ ] Result: User can access dashboard
- [ ] 2 screenshot placeholders maximum
- [ ] Uses process documentation format (Prerequisites → Steps → Result → Notes)

---

### US-GS-002: Create Getting Started Guide - Understanding Personas
**Description:** As any user, I need to understand what personas are, which ones I have, and how switching affects my view.

**Acceptance Criteria:**
- [ ] Adds Section 2 to `getting-started.md`: Understanding Your Persona
  - What personas are and why they matter
  - How to check which personas you have
  - How to switch personas (persona switcher location)
  - What changes when you switch (dashboard, menu, access)
- [ ] Explains common persona combinations (e.g., investor + introducer)
- [ ] 2 screenshot placeholders maximum (persona switcher, different dashboard views)
- [ ] Warning note: Some actions only available in specific persona

---

### US-GS-003: Create Getting Started Guide - Platform Navigation
**Description:** As any user, I need to understand the core navigation elements that exist across all personas.

**Acceptance Criteria:**
- [ ] Adds Section 3 to `getting-started.md`: Navigating the Platform
  - Dashboard overview (what the main sections are)
  - Notifications center (where to find, what triggers notifications)
  - Inbox and messages
  - Finding help and support
- [ ] 2 screenshot placeholders maximum (dashboard layout, notifications)
- [ ] Tip: How to return to dashboard from anywhere

---

### US-GS-004: Create Getting Started Guide - VersSign Basics
**Description:** As any user, I need to understand how to complete signature requests since all personas sign documents.

**Acceptance Criteria:**
- [ ] Adds Section 4 to `getting-started.md`: Signing Documents (VersSign)
  - How signature requests arrive (email + in-app)
  - Finding your pending signatures
  - Completing a signature (step-by-step)
  - Multi-signatory workflows (what to expect when others need to sign)
  - What happens after you sign
- [ ] 2 screenshot placeholders maximum (VersSign task list, signing interface)
- [ ] Warning: Multi-signatory requires ALL signatures before proceeding
- [ ] Cross-reference note: Each persona guide will reference this section

---

# INVESTOR

### US-INV-001: Create Investor Guide - Profile & KYC Setup
**Description:** As an investor, I need to complete my profile and KYC requirements before I can subscribe to deals.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/investor-guide.md` with guide header and "Who is this for" statement
- [ ] Section 1: Setting Up Your Investor Profile
  - Profile information required (personal details, contact)
  - KYC requirements overview
  - Document upload process (what documents, what format)
  - Accreditation status (what it means, how to update)
  - KYC review status (pending, approved, rejected)
- [ ] Prerequisites: Must have investor persona assigned
- [ ] Result: Profile complete, KYC submitted for review
- [ ] 3 screenshot placeholders maximum (profile page, document upload, KYC status)
- [ ] Warning: Cannot subscribe until KYC approved

---

### US-INV-002: Create Investor Guide - Exploring Opportunities
**Description:** As an investor, I need to browse and evaluate investment opportunities before deciding to invest.

**Acceptance Criteria:**
- [ ] Adds Section 2 to `investor-guide.md`: Exploring Investment Opportunities
  - Accessing the opportunities list
  - Understanding deal cards (key info displayed)
  - Viewing deal details (terms, documents, timeline, vehicle info)
  - Expressing interest vs. committing (what's the difference)
  - Deal membership (how you get access to deals)
- [ ] 3 screenshot placeholders maximum (opportunities list, deal detail page)
- [ ] Tip: How to filter/sort opportunities
- [ ] Note: You only see deals you've been introduced to or invited to

---

### US-INV-003: Create Investor Guide - Subscription Process
**Description:** As an investor, I need to subscribe to a deal, complete required documents, and track my subscription status.

**Acceptance Criteria:**
- [ ] Adds Section 3 to `investor-guide.md`: Making an Investment (Subscription Process)
  - Prerequisites before subscribing (KYC approved, deal open)
  - Starting a subscription (where to click)
  - Subscription form fields (amount, entity selection if applicable)
  - Required documents to sign
  - Submitting your subscription
  - Subscription status lifecycle:
    - Pending: Submitted, awaiting review
    - Committed: Approved, awaiting funding
    - Funded: Payment received, complete
  - Tracking your subscription status
- [ ] 3 screenshot placeholders maximum (subscription form, status tracker)
- [ ] Uses terminology: "Subscribe" not "Invest", "Funded" not "Closed"
- [ ] Cross-reference: Getting Started guide for VersSign
- [ ] Warning: Subscription requires signature to complete

---

### US-INV-004: Create Investor Guide - Portfolio Management
**Description:** As an investor, I need to view my holdings, track performance, and access investment documents.

**Acceptance Criteria:**
- [ ] Adds Section 4 to `investor-guide.md`: Managing Your Portfolio
  - Accessing the portfolio dashboard
  - Understanding positions (units, cost basis, current NAV)
  - Viewing position details
  - Performance tracking
  - Accessing investment documents
  - Vehicle summary view
- [ ] 3 screenshot placeholders maximum (portfolio dashboard, position detail)
- [ ] Uses terminology: "Position" not "Holdings"
- [ ] Tip: How to download statements/documents

---

# INTRODUCER

### US-INT-001: Create Introducer Guide - Profile & Agreements
**Description:** As an introducer, I need to set up my profile and understand/sign my fee agreement.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/introducer-guide.md` with guide header and "Who is this for" statement
- [ ] Section 1: Your Introducer Profile & Agreements
  - Accessing your introducer profile
  - Required profile information
  - Understanding your fee agreement (what it covers)
  - Reviewing fee agreement terms
  - Signing your introducer agreement (via VersSign)
  - Agreement status
- [ ] Prerequisites: Must have introducer persona assigned
- [ ] 2 screenshot placeholders maximum (profile page, agreement view)
- [ ] Cross-reference: Getting Started for VersSign
- [ ] Warning: Must sign agreement before earning commissions

---

### US-INT-002: Create Introducer Guide - Making Introductions
**Description:** As an introducer, I need to introduce investors to deals and track my introduction pipeline.

**Acceptance Criteria:**
- [ ] Adds Section 2 to `introducer-guide.md`: Making Introductions
  - What an introduction is (connecting investor to deal)
  - How to create an introduction
  - Required information for introduction
  - Tracking your introduction pipeline
  - Introduction statuses:
    - Pending: Introduction submitted
    - Active: Investor engaged with deal
    - Converted: Investor subscribed
    - Expired/Cancelled: Did not proceed
  - When introductions convert to commissions (on deal close)
- [ ] 3 screenshot placeholders maximum (introductions list, create introduction, status view)
- [ ] Tip: How to check if investor already introduced by someone else
- [ ] Note: Commission only created when deal closes AND investor funded

---

### US-INT-003: Create Introducer Guide - Commission Management
**Description:** As an introducer, I need to view my commissions, understand the lifecycle, and submit invoices for payment.

**Acceptance Criteria:**
- [ ] Adds Section 3 to `introducer-guide.md`: Managing Your Commissions
  - Accessing My Commissions
  - Understanding commission calculation (based on funded_amount)
  - Commission lifecycle (MUST document all states):
    - **Accrued**: Deal closed, commission calculated, not yet payable
    - **Invoice Requested**: You can now submit invoice
    - **Invoice Submitted**: Invoice received, awaiting processing
    - **Invoiced**: Invoice recorded in accounting
    - **Paid**: Payment completed
  - Submitting an invoice:
    - Prerequisites (commission must be "Invoice Requested")
    - Invoice details required
    - Uploading invoice document
    - Confirmation
  - Tracking payment status
  - Reconciliation view (introducer-reconciliation)
- [ ] 3 screenshot placeholders maximum (commissions list, invoice submission form)
- [ ] Uses terminology: "Accrued" not "Earned"
- [ ] Warning: Cannot submit invoice until status is "Invoice Requested"

---

# PARTNER

### US-PAR-001: Create Partner Guide - Profile Setup
**Description:** As a partner, I need to set up my partner profile and understand my role.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/partner-guide.md` with guide header and "Who is this for" statement
- [ ] Section 1: Your Partner Profile
  - Accessing your partner profile
  - Required profile information
  - Understanding the partner role (referral-based, different from introducer)
  - Profile completion
- [ ] Prerequisites: Must have partner persona assigned
- [ ] 2 screenshot placeholders maximum (partner profile)
- [ ] Note: Explains difference from introducer role

---

### US-PAR-002: Create Partner Guide - Referring Investors
**Description:** As a partner, I need to refer investors to opportunities and track my referrals.

**Acceptance Criteria:**
- [ ] Adds Section 2 to `partner-guide.md`: Referring Investors to Opportunities
  - Viewing available opportunities
  - How referral tracking works (different from introductions)
  - Making a referral
  - Monitoring your referral pipeline
  - Referral conversion tracking
- [ ] 2 screenshot placeholders maximum (opportunities with referral indicator)
- [ ] Explains how this differs from introducer introductions

---

### US-PAR-003: Create Partner Guide - Commissions & Transactions
**Description:** As a partner, I need to track my commissions and view my transaction history.

**Acceptance Criteria:**
- [ ] Adds Section 3 to `partner-guide.md`: Tracking Commissions & Transactions
  - Accessing My Commissions
  - Viewing commission earnings
  - Commission lifecycle (same as introducer: accrued → paid)
  - Transaction history (partner-transactions)
  - Submitting invoices
- [ ] 2 screenshot placeholders maximum (transactions page, commissions)
- [ ] Cross-reference: Introducer guide for detailed commission lifecycle

---

# COMMERCIAL PARTNER

### US-CP-001: Create Commercial Partner Guide - Profile Setup
**Description:** As a commercial partner, I need to set up my profile and understand my role.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/commercial-partner-guide.md` with guide header and "Who is this for" statement
- [ ] Section 1: Your Commercial Partner Profile
  - Accessing your commercial partner profile
  - Required profile information
  - Understanding the CP role (placement-based)
  - Profile completion
- [ ] Prerequisites: Must have commercial_partner persona assigned
- [ ] 2 screenshot placeholders maximum (CP profile)

---

### US-CP-002: Create Commercial Partner Guide - Placement Agreements
**Description:** As a commercial partner, I need to understand, review, and sign my placement agreements.

**Acceptance Criteria:**
- [ ] Adds Section 2 to `commercial-partner-guide.md`: Placement Agreements
  - What placement agreements are
  - Accessing your placement agreements
  - Reviewing agreement terms
  - Signing your agreement (via VersSign)
  - Agreement statuses
  - Viewing signed agreements
- [ ] 2 screenshot placeholders maximum (placement agreement detail)
- [ ] Cross-reference: Getting Started for VersSign
- [ ] Warning: Must sign agreement before earning commissions

---

### US-CP-003: Create Commercial Partner Guide - Tracking Earnings
**Description:** As a commercial partner, I need to track my commissions and submit invoices.

**Acceptance Criteria:**
- [ ] Adds Section 3 to `commercial-partner-guide.md`: Tracking Your Earnings
  - Accessing My Commissions
  - Commission structure for commercial partners
  - Viewing accrued commissions
  - Commission lifecycle (accrued → paid)
  - Invoice submission process
  - Payment tracking
- [ ] 2 screenshot placeholders maximum (commissions - CP view)
- [ ] Explains how CP commissions differ from introducer/partner commissions

---

# ARRANGER

### US-ARR-001: Create Arranger Guide - Profile & Capabilities
**Description:** As an arranger, I need to set up my profile and understand my capabilities.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/arranger-guide.md` with guide header and "Who is this for" statement
- [ ] Section 1: Your Arranger Profile & Setup
  - Accessing your arranger profile
  - Required profile information
  - Understanding arranger capabilities overview:
    - Create and manage deals
    - Create fee plans
    - Manage partner network
    - Close deals
  - Profile completion
- [ ] Prerequisites: Must have arranger persona assigned
- [ ] 2 screenshot placeholders maximum (arranger profile)

---

### US-ARR-002: Create Arranger Guide - Creating Deals
**Description:** As an arranger, I need to create new deals with all required information.

**Acceptance Criteria:**
- [ ] Adds Section 2A to `arranger-guide.md`: Creating a New Deal
  - Accessing deal creation (/deals/new)
  - Required deal information:
    - Deal name and description
    - Vehicle selection/creation
    - Terms (minimum investment, target raise, etc.)
    - Timeline
  - Uploading deal documents
  - Setting deal status (draft initially)
  - Submitting the deal
- [ ] Prerequisites: None (arranger can always create)
- [ ] Result: Deal created in draft status
- [ ] 3 screenshot placeholders maximum (new deal form key sections)
- [ ] Warning: Deal must have vehicle assigned

---

### US-ARR-003: Create Arranger Guide - Managing Deal Lifecycle
**Description:** As an arranger, I need to manage deals through their lifecycle from draft to closed.

**Acceptance Criteria:**
- [ ] Adds Section 2B to `arranger-guide.md`: Managing Deal Lifecycle
  - Viewing your deals list
  - Deal statuses:
    - **Draft**: Being prepared, not visible to investors
    - **Active**: Open for subscriptions
    - **Closing**: No new subscriptions, processing existing
    - **Closed**: Complete, commissions triggered
  - Editing deal details
  - Updating deal status
  - Adding/removing deal members
  - Viewing deal subscriptions
- [ ] 2 screenshot placeholders maximum (deal management page)
- [ ] Warning: Changing to "Active" makes deal visible to assigned investors

---

### US-ARR-004: Create Arranger Guide - Fee Plans
**Description:** As an arranger, I need to create and send fee plans to partners, introducers, and commercial partners.

**Acceptance Criteria:**
- [ ] Adds Section 3 to `arranger-guide.md`: Fee Plans & Commercial Agreements
  - Understanding fee plans:
    - **Fee plans are deal-specific, NOT templates**
    - Created for a specific deal
    - Sent to specific partners/introducers/CPs
  - Creating a fee plan:
    - Select the deal
    - Define fee structure/tiers
    - Assign recipients
  - Sending fee plans
  - Tracking fee plan acknowledgment
- [ ] Prerequisites: Must have a deal created first
- [ ] 2 screenshot placeholders maximum (fee plan creation)
- [ ] **Critical Warning: Fee plans are deal-specific agreements, not templates**

---

### US-ARR-005: Create Arranger Guide - Managing Network
**Description:** As an arranger, I need to manage my network of introducers, partners, commercial partners, and lawyers.

**Acceptance Criteria:**
- [ ] Adds Section 4 to `arranger-guide.md`: Managing Your Network
  - My Introducers:
    - Viewing your introducers
    - Adding new introducers
    - Introducer details
  - My Partners:
    - Viewing your partners
    - Adding new partners
  - My Commercial Partners:
    - Viewing your commercial partners
    - Adding new commercial partners
  - My Lawyers:
    - Viewing assigned lawyers
    - Assigning lawyers to deals
- [ ] 3 screenshot placeholders maximum (one consolidated network view)
- [ ] Note: These are YOUR network - people you work with

---

### US-ARR-006: Create Arranger Guide - Closing Deals
**Description:** As an arranger, I need to close deals which triggers commission creation.

**Acceptance Criteria:**
- [ ] Adds Section 5 to `arranger-guide.md`: Closing a Deal
  - Prerequisites for closing:
    - All subscriptions in final state (committed or funded)
    - Required approvals complete
    - Fee plans in place
  - The close process:
    - Initiating close
    - Final confirmations
    - Close execution
  - What happens when a deal closes:
    - Subscriptions finalized
    - **Commissions created for introducers/partners/CPs**
    - Deal marked closed
  - Escrow management (if applicable)
- [ ] 2 screenshot placeholders maximum (deal close confirmation)
- [ ] **Critical Note: Closing deal CREATES commissions - this is when they become accrued**

---

# LAWYER

### US-LAW-001: Create Lawyer Guide - Profile & Deal Access
**Description:** As a lawyer, I need to set up my profile and understand how I get assigned to deals.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/lawyer-guide.md` with guide header and "Who is this for" statement
- [ ] Section 1: Your Lawyer Profile & Deal Access
  - Accessing your lawyer profile
  - Required profile information
  - How deal assignment works (arranger assigns you)
  - What you can see vs. other personas (subscription packs, not full deal management)
  - Viewing your assigned deals
- [ ] Prerequisites: Must have lawyer persona assigned
- [ ] 2 screenshot placeholders maximum (lawyer dashboard)
- [ ] Note: Limited access compared to arrangers - focused on document review

---

### US-LAW-002: Create Lawyer Guide - Document Signing
**Description:** As a lawyer, I need to review and sign subscription documents.

**Acceptance Criteria:**
- [ ] Adds Section 2 to `lawyer-guide.md`: Reviewing & Signing Documents
  - Accessing subscription packs
  - VersSign for lawyers:
    - Finding your signature tasks
    - Subscription pack signature type
    - Reviewing documents before signing
    - Completing your signature
  - Signature workflow timing
  - Reconciliation view (lawyer-reconciliation)
- [ ] 2 screenshot placeholders maximum (VersSign task list, signing interface)
- [ ] Cross-reference: Getting Started for VersSign basics
- [ ] Note: Your signature may be required before or after investor signs

---

# CEO/STAFF

### US-CEO-001: Create CEO/Staff Guide - Dashboard Overview
**Description:** As a CEO or staff member, I need to understand the executive dashboard and platform monitoring.

**Acceptance Criteria:**
- [ ] Creates `VERSO/User Guides/ceo-staff-guide.md` with guide header and "Who is this for" statement
- [ ] Section 1: Dashboard & Platform Overview
  - Executive dashboard metrics
  - Deal pipeline overview (all deals, not just memberships)
  - Subscription status aggregates
  - Workflow status monitoring
  - Key performance indicators
- [ ] Prerequisites: Must have ceo or staff persona assigned
- [ ] 3 screenshot placeholders maximum (CEO dashboard)
- [ ] **Note: CEO/Staff see ALL deals via service client, not membership-filtered**

---

### US-CEO-002: Create CEO/Staff Guide - Subscription Approvals
**Description:** As a CEO or staff member, I need to review and approve subscription requests.

**Acceptance Criteria:**
- [ ] Adds Section 2A to `ceo-staff-guide.md`: Subscription Approvals
  - Accessing the approvals queue (/approvals)
  - Reviewing subscription requests:
    - Investor details
    - Subscription amount
    - Supporting documents
  - Approval actions:
    - Approve: Move to committed
    - Request Changes: Send back for revision
    - Reject: Decline subscription
  - Bulk actions (if available)
  - Subscription status after approval
- [ ] 2 screenshot placeholders maximum (approvals queue)

---

### US-CEO-003: Create CEO/Staff Guide - KYC Review
**Description:** As a CEO or staff member, I need to review and approve KYC documents.

**Acceptance Criteria:**
- [ ] Adds Section 2B to `ceo-staff-guide.md`: KYC Approvals
  - Accessing KYC review (/kyc-review)
  - Reviewing KYC submissions:
    - Document verification
    - Identity confirmation
    - Accreditation status
  - Approval actions:
    - Approve: KYC complete
    - Request Additional Documents
    - Reject: KYC failed
  - KYC status after action
- [ ] 2 screenshot placeholders maximum (KYC review interface)
- [ ] Warning: Investor cannot subscribe until KYC approved

---

### US-CEO-004: Create CEO/Staff Guide - Request Management
**Description:** As a CEO or staff member, I need to manage the general request queue.

**Acceptance Criteria:**
- [ ] Adds Section 2C to `ceo-staff-guide.md`: Request Queue Management
  - Accessing requests (/requests)
  - Types of requests
  - Request prioritization
  - Processing requests
  - Request analytics
- [ ] 1 screenshot placeholder maximum

---

### US-CEO-005: Create CEO/Staff Guide - Deal Oversight
**Description:** As a CEO or staff member, I need to oversee all deals and intervene when needed.

**Acceptance Criteria:**
- [ ] Adds Section 3 to `ceo-staff-guide.md`: Deal Oversight
  - Viewing all deals (not just your memberships)
  - Deal intervention capabilities:
    - Editing deal details
    - Changing deal status
    - Managing subscriptions
  - Deal close oversight
  - Termsheet approval (CEO approval for termsheet requests)
- [ ] 2 screenshot placeholders maximum (deals list admin view)
- [ ] Note: CEO sees everything, can override normal access

---

### US-CEO-006: Create CEO/Staff Guide - User & Entity Management
**Description:** As a CEO or staff member, I need to manage users and entities across the platform.

**Acceptance Criteria:**
- [ ] Adds Section 4 to `ceo-staff-guide.md`: User & Entity Management
  - Managing users (/users):
    - Viewing all users
    - User details
    - Assigning personas
    - Deactivating users
  - Managing entities (/entities):
    - Viewing all entities
    - Entity details
    - Entity members
    - Entity types
- [ ] 2 screenshot placeholders maximum (user management)

---

### US-CEO-007: Create CEO/Staff Guide - Reconciliation
**Description:** As a CEO or staff member, I need to run reconciliation reports and track payments.

**Acceptance Criteria:**
- [ ] Adds Section 5 to `ceo-staff-guide.md`: Reconciliation & Reporting
  - General reconciliation dashboard (/reconciliation)
  - Commission reconciliation:
    - Introducer commissions
    - Partner commissions
    - Commercial partner commissions
  - Payment tracking
  - Export/reporting capabilities
- [ ] 2 screenshot placeholders maximum (reconciliation dashboard)

---

### US-CEO-008: Create CEO/Staff Guide - Audit & Compliance
**Description:** As a CEO or staff member, I need to access audit logs and monitor compliance.

**Acceptance Criteria:**
- [ ] Adds Section 6 to `ceo-staff-guide.md`: Audit & Compliance
  - Accessing audit logs (/audit)
  - Understanding logged actions:
    - What gets logged
    - Log entry format
    - Timestamps and user attribution
  - Searching/filtering logs
  - Compliance monitoring
  - Common audit queries
- [ ] 2 screenshot placeholders maximum (audit log view)
- [ ] Note: All mutations are logged per CLAUDE.md requirement

---

## Writing Guidelines

### Voice & Tone
- Direct and instructional ("Click the Submit button" not "You may click...")
- Present tense ("The system displays..." not "The system will display...")
- Second person for user actions ("You will see...")
- No jargon - if a term is used, explain it on first use
- No assumptions about technical knowledge

### Terminology Consistency
| Use This | Not This |
|----------|----------|
| Subscribe to a deal | Invest in a deal |
| Subscription | Investment commitment |
| Position | Holdings (use Position as the primary term) |
| Funded | Closed (for subscription status) |
| Accrued | Earned (for commission status) |
| VersSign | Signature system / DocuSign |

### Process Documentation Format
```markdown
## [Process Name]
**Who:** [Persona(s) who perform this]

**Prerequisites:**
- [Requirement 1]
- [Requirement 2 - include WHY if not obvious]

**Steps:**
1. [Action]
2. [Action]
   [SCREENSHOT: description]
3. [Action]

**Result:** [What the user should see/expect when complete]

**Notes:**
> 💡 [Tip or helpful information]
> ⚠️ [Warning or common mistake]
```

---

## Screenshot Guidelines

### When to Include a Screenshot
- **Decision points:** Where the user must choose between options
- **Complex forms:** Multi-field forms where field placement matters
- **Status indicators:** Where users need to understand what a status means
- **Key navigation:** First time reaching an important page

### When NOT to Include a Screenshot
- Simple navigation (clicking a menu item)
- Single-field forms
- Confirmation dialogs with obvious options
- Repeated patterns already shown elsewhere

---

## Implementation Order

### Phase 1: Foundation (4 stories)
- US-GS-001 through US-GS-004: Getting Started Guide

### Phase 2: Investor (4 stories)
- US-INV-001 through US-INV-004: Investor Guide

### Phase 3: Revenue Stakeholders (9 stories)
- US-INT-001 through US-INT-003: Introducer Guide
- US-PAR-001 through US-PAR-003: Partner Guide
- US-CP-001 through US-CP-003: Commercial Partner Guide

### Phase 4: Operations (8 stories)
- US-ARR-001 through US-ARR-006: Arranger Guide
- US-LAW-001 through US-LAW-002: Lawyer Guide

### Phase 5: Administration (8 stories)
- US-CEO-001 through US-CEO-008: CEO/Staff Guide

**Total: 33 User Stories**

---

## Success Metrics

- Users can complete documented workflows without support tickets
- New user onboarding time reduced by 50%
- Support questions for documented processes decrease by 70%
- All processes accurately reflect current platform behavior (validated by testing)
