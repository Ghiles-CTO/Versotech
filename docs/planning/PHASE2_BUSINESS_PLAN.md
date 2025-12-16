# VERSO Phase 2: Platform Restructuring Plan

**Version:** 2.0
**Date:** December 16, 2025
**Status:** Draft for Client Review

---

## 1. What Are We Building?

VERSO is creating a unified platform where different types of users can access the system through ONE login. Each user type sees different features based on their role.

**Two Portals:**

1. **Admin Portal** (`/versotech_admin/`) - For VERSO internal operations: platform settings, content management, analytics
2. **Main Portal** (`/versotech_main/`) - For ALL external users: Investors, Introducers, Partners, Commercial Partners, Lawyers, CEOs

**Why one Main Portal instead of separate portals per user type?**

- Simpler login experience (one URL for everyone)
- A single user can have MULTIPLE roles (e.g., someone is both an Investor AND an Introducer)
- Easier to maintain one codebase
- The system detects what roles you have and shows the right features

---

## 2. User Types (Personas)

### Who uses the platform?

**1. INVESTOR**
- Individual or company investing in deals
- Sees: Investment opportunities, portfolio, documents (K-1s, statements)
- Can: Browse deals, sign NDAs, subscribe to investments, track performance

**2. INTRODUCER**
- Brings new investors to deals
- Sees: Their referrals, commission tracking, fee agreements
- Cannot: See the investor's full journey or sign on their behalf
- Gets paid: Commission when their referral invests

**3. PARTNER**
- Is BOTH an investor AND an introducer
- Sees: Everything an investor sees PLUS referral tracking
- Special rule: Can VIEW client journeys but CANNOT SIGN on behalf of clients
- This is a hybrid role - automatically detected when someone is in both investor_users AND introducer_users

**4. COMMERCIAL PARTNER**
- Like a Partner but represents a company/institution
- CAN execute (sign) on behalf of their clients
- Has clients under them (placement relationships)
- Gets platform fees for placements

**5. CEO / VERSO STAFF**
- Full access to manage the platform
- Sees: All deals, all users, approvals, KYC review, fees, audit logs
- Can: Approve investments, review KYC, manage users, run workflows

**6. LAWYER**
- External legal counsel assigned to specific deals
- Sees: Only their assigned deals and related documents
- Can: Access deal data room, sign legal documents

**7. ARRANGER**
- Structures deals and vehicles
- Sees: Mandates (deals they're arranging), fees, vehicle performance
- May be a regulated entity

---

## 3. The Entity-User Model (WHY This Matters)

### The Problem with the Current Database

Right now, the database has:
- `investors` table with `investor_users` linking table (CORRECT - multiple users can access one investor account)
- `introducers` table with a single `user_id` column (WRONG - only one person can access the introducer account)

### Why is this wrong?

**Real-world example:**
"ABC Capital" is an introducer company. They have 3 employees who all need access:
- John (CEO of ABC Capital) - should see commissions
- Sarah (Operations Manager) - should track referral status
- Mike (Sales) - should submit new introductions

With the current design, only ONE of them can be linked. The other two are locked out.

### The Correct Pattern

Every user type is an **ENTITY** (company/account) that can have **MULTIPLE USERS** (people with access):

```
ENTITY TABLE                  LINKING TABLE              USER TABLE
(the account)                 (who has access)           (the person)
-------------                 ---------------            -----------
investors            -->      investor_users       -->   profiles
introducers          -->      introducer_users     -->   profiles
partners             -->      partner_users        -->   profiles
commercial_partners  -->      commercial_partner_users -> profiles
ceos/organizations   -->      ceo_users            -->   profiles
arranger_entities    -->      arranger_users       -->   profiles
```

This is exactly how investors work today - it's the correct pattern.

---

## 4. Database Changes Required

### 4.1 New Tables Needed

**A. `introducer_users`** - Link users to introducer accounts
- Why: Currently introducers.user_id only allows ONE user. We need multiple.
- Fields: introducer_id, user_id, role (admin/member), created_at

**B. `partner_entities`** - Partner accounts (companies)
- Why: Partners are distinct from introducers - they have investor access plus referral tracking
- Fields: id, legal_name, status, created_at

**C. `partner_users`** - Link users to partner accounts
- Why: Multiple people at a partner firm need access
- Fields: partner_id, user_id, can_sign (boolean - only some can execute), created_at

**D. `commercial_partner_entities`** - Commercial partner accounts
- Why: They're different from regular partners - they can sign for clients
- Fields: id, legal_name, status, placement_agreement_doc_id, created_at

**E. `commercial_partner_users`** - Link users to commercial partner accounts
- Why: Multiple people at a commercial partner need access
- Fields: commercial_partner_id, user_id, can_execute_for_clients (boolean), created_at

**F. `arranger_users`** - Link users to arranger entities (ALREADY EXISTS: arranger_entities)
- Why: Multiple people at an arranger need access
- Fields: arranger_entity_id, user_id, role, created_at

**G. `organizations` + `organization_users`** - For CEO/staff accounts
- Why: "CEO" might be an organization with multiple people (or keep using profiles.role for now)
- Alternative: Keep CEO detection via profiles.role = 'ceo' for now, add table later if needed

### 4.2 Changes to Existing Tables

**A. `profiles.role` enum needs to change:**
- Current: investor, staff_admin, staff_ops, staff_rm
- Problem: "staff_admin" doesn't mean anything to clients. "investor" is detected via investor_users anyway.
- New: Remove role detection from profiles.role entirely. Detect persona via linking tables.

**B. `investor_members` - Add `is_signatory` field:**
- Why: Not everyone on an investor entity can sign documents. Only signatories should appear in signature requests.
- Field: is_signatory BOOLEAN DEFAULT false

**C. `deals` - Add `stock_type` field:**
- Why: Different deals have different stock types (common, preferred, etc.)
- Field: stock_type TEXT

**D. `introducers` - Deprecate `user_id` column:**
- Why: Replaced by introducer_users table
- Action: Keep for backwards compatibility, but new code uses introducer_users

### 4.3 Why Section 3.3 "Optional Commercial Partner Extension" Was Wrong

I wrote that section because I assumed Commercial Partners were just "special introducers" and we could add a `type` column to the introducers table.

**This was wrong because:**
1. Commercial Partners have fundamentally different permissions (can sign for clients)
2. They have client relationships (placements) that introducers don't have
3. Mixing them would create confusing RLS policies
4. The client meeting clarified they're distinct personas

---

## 5. How Persona Detection Works

When a user logs in, the system checks these tables in order:

1. **Is user in `investor_users`?** → They're an Investor
2. **Is user in `introducer_users`?** → They're an Introducer
3. **Are they in BOTH investor_users AND introducer_users?** → They're a Partner (hybrid)
4. **Is user in `commercial_partner_users`?** → They're a Commercial Partner
5. **Is user in `arranger_users`?** → They're an Arranger
6. **Is user in `deal_memberships` with role='lawyer'?** → They're a Lawyer
7. **Is profiles.role = 'ceo' or is user in organization_users?** → They're a CEO

A user can be multiple things. The system stores all their personas and lets them switch between views.

---

## 6. What Each User Type Sees

### INVESTOR

**Navigation:**
- Dashboard (portfolio summary, pending tasks)
- Investment Opportunities (deals they can invest in)
- Portfolio (their active investments)
- Documents (K-1s, statements, subscription agreements)
- Inbox (messages, tasks to complete)
- Profile (personal info, KYC, compliance, bank details)

**Key Journeys:**
1. See deal → Sign NDA → Access data room → Subscribe → Sign subscription pack → Fund → Active investment
2. Review portfolio → Request statement → Download document
3. Complete KYC → Upload documents → Staff reviews → Approved

### INTRODUCER

**Navigation:**
- Dashboard (commission summary, active referrals)
- My Introductions (referrals they've made)
- My Commissions (what they've earned)
- My Agreements (fee agreements with VERSO)
- Documents (introduction agreements)
- Inbox (notifications about referral status)

**Key Journeys:**
1. Submit new introduction → Referral joins platform → Referral invests → Commission accrued
2. View pending commissions → Invoice generated → Payment received

**Important:** Introducer does NOT see the investor's journey details. They see status (invited/joined/invested) but not subscription amounts or documents.

### PARTNER (Investor + Introducer)

**Navigation:**
- Everything Investor sees
- Plus: Partner Transactions (referrals made as partner)
- Same documents, inbox combines both roles

**Key Difference from Introducer:**
- Partner CAN see their own investments (they're an investor too)
- Partner can VIEW client journeys (read-only) but CANNOT sign on their behalf

### COMMERCIAL PARTNER

**Navigation:**
- Everything Investor sees
- Plus: My Clients (entities they represent)
- Plus: Placement Agreements
- Can execute for clients (sign subscription packs on behalf of clients)

**Key Difference from Partner:**
- Commercial Partner CAN sign documents on behalf of their clients
- Has formal placement agreements with VERSO

### CEO / STAFF

**Navigation:**
- Dashboard (KYC pipeline, deal flow, system health)
- Deal Management (create/edit deals, manage allocations)
- Users (all users: investors, introducers, partners, arrangers)
- Inbox (approvals queue, messages)
- KYC Review (review pending KYC submissions)
- Fees & Reconciliation (invoices, payments, commission tracking)
- Audit (audit logs, compliance reports)
- Verso Sign (signature queue)
- Documents (all platform documents)

### LAWYER

**Navigation:**
- Dashboard (assigned deals summary)
- My Assigned Deals (only deals they're invited to)
- Documents (only for their deals)
- Verso Sign (documents requiring their signature)
- Inbox (messages related to their deals)

### ARRANGER

**Navigation:**
- Dashboard (mandate summary)
- My Mandates (deals they're arranging)
- Fees (arranger fees)
- Documents (mandate documents)
- Inbox

---

## 7. KYC vs Compliance (Important Distinction)

**KYC (Know Your Customer) = Document Collection**
- ID document (passport, national ID)
- Proof of address
- Entity incorporation documents
- Ultimate beneficial owner documents

**Compliance = Questionnaire**
- Accreditation status
- Investment suitability
- Risk tolerance
- Source of funds declaration

In the Profile page, these should be SEPARATE TABS:
- "KYC" tab - upload/view documents
- "Compliance" tab - complete questionnaire

---

## 8. Signatory System

**Problem:** Not everyone linked to an investor entity should be able to sign subscription packs.

**Example:**
"Smith Family Trust" has 3 people with access:
- John Smith (Trustee) - CAN sign
- Mary Smith (Trustee) - CAN sign
- Assistant Jane - CANNOT sign (just has portal access)

**Solution:** Add `is_signatory` boolean to `investor_members` table.

When generating a subscription pack:
1. Look up all investor_members for the entity
2. Filter to only those with is_signatory = true
3. Generate signature request for each signatory

---

## 9. Subscription Pack Workflow

**What happens when investor clicks "Invest $X":**

1. System creates deal_subscription_submission record (amount, investor, deal)
2. System auto-generates subscription pack document
3. System looks up all signatories (investor_members with is_signatory = true)
4. System creates signature_request for each signatory
5. Signatories receive task to sign
6. Once all sign → subscription pack complete
7. Move to funding stage

**Key Point from Client:** There is NO draft approval step. Pack generates immediately and goes to signing queue.

---

## 10. Theme / Branding

**Default:** White/blue color scheme (similar to current investor portal)
**Optional:** Dark mode toggle (user preference, not forced)

The platform should feel professional and clean, not "dark mode by default."

---

## 11. What's NOT in Scope for January 10th Launch

Per client meeting, these are POST-LAUNCH:

1. **Growth Marketing / CMS** - Customer success, retention analytics. Not acquisition CRM.
2. **Advanced Analytics** - Detailed reporting dashboards
3. **Arranger Portal Features** - MVP only, full features later
4. **Multi-language Support** - English only for launch

Focus for launch: Core investor journey + CEO tools + basic introducer tracking

---

## 12. Route Structure

**Admin Portal:**
```
/versotech_admin/
  /dashboard     - Platform metrics
  /settings      - Platform configuration
  /cms           - Content management (post-launch)
  /growth        - Customer success analytics (post-launch)
```

**Main Portal:**
```
/versotech_main/
  /login         - Single login for all user types
  /dashboard     - Persona-aware dashboard
  /inbox         - Messages + Tasks + Approvals (combined)
  /documents     - All documents
  /versosign     - Signature queue
  /profile       - User profile with tabs (KYC, Compliance, Entities, Bank)

  # Investor-specific
  /opportunities          - Investment opportunities (deals)
  /opportunities/[id]     - Deal detail with data room
  /portfolio              - Active investments
  /portfolio/[id]         - Position detail

  # CEO-specific
  /deals                  - Deal management
  /users                  - All users (investors, introducers, etc.)
  /kyc-review             - KYC approval queue
  /fees                   - Fees & reconciliation
  /audit                  - Audit logs

  # Introducer-specific
  /introductions          - My referrals
  /commissions            - Commission tracking
  /agreements             - Fee agreements

  # Lawyer-specific
  /assigned-deals         - Deals assigned to me

  # Partner-specific
  /partner-transactions   - Partner referral tracking

  # Commercial Partner-specific
  /clients                - My clients
```

---

## 13. Questions to Resolve

1. **CEO Detection:** Should CEO be a separate organization entity with organization_users linking table, or just use profiles.role = 'ceo'?

2. **Partner vs Introducer Permissions:** Confirmed that Partner can view but not sign. But can Partner see the AMOUNT their client invested, or just status?

3. **Arranger Scope:** How much arranger functionality for launch? Just read-only mandate view, or full mandate management?

4. **Legacy Data Migration:** The current `introducers.user_id` has data. Do we migrate to `introducer_users` table or maintain both?

---

## 14. Summary of Database Changes

| Change | Type | Reason |
|--------|------|--------|
| Create `introducer_users` | New table | Allow multiple users per introducer |
| Create `partner_entities` | New table | Partner accounts (investor + introducer) |
| Create `partner_users` | New table | Link users to partners |
| Create `commercial_partner_entities` | New table | Commercial partner accounts |
| Create `commercial_partner_users` | New table | Link users to commercial partners |
| Create `arranger_users` | New table | Link users to arranger entities |
| Add `is_signatory` to `investor_members` | New column | Identify who can sign |
| Add `stock_type` to `deals` | New column | Deal stock type |
| Deprecate `introducers.user_id` | Column change | Replaced by introducer_users |
| Update `profiles.role` enum | Enum change | Remove staff terminology, add ceo |

---

**END OF DOCUMENT**

This document is written for business stakeholders. Technical implementation details (code, RLS policies, migration scripts) will be created separately once this plan is approved.
