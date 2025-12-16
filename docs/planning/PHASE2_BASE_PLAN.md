# VERSO Phase 2: Platform Restructuring Plan

**Version:** 1.2
**Date:** December 16, 2025
**Status:** Final Draft for Review

---

## 1. Executive Summary

VERSO is restructuring its platform into TWO portals:

**Admin Portal** (`/versotech_admin/`)
Internal platform operations: settings, content management, analytics.

**Main Portal** (`/versotech_main/`)
All business users access ONE portal with role-based views. Seven distinct personas use this portal:

1. CEO
2. Arranger
3. Lawyer
4. Investor
5. Partner
6. Introducer
7. Commercial Partner

Each persona is an **ENTITY** (company/account) that can have **MULTIPLE USERS** (people with login access). This is the core architectural principle.

---

## 2. The Seven Personas

Each persona type represents a different business relationship with VERSO. Below is what each persona does and why they're distinct.

### 2.1 CEO

**Business Role:** Manages the entire VERSO platform.

**What they do:**
- Create and manage all user types (investors, arrangers, lawyers, partners, commercial partners, introducers)
- Manage investment opportunities (deals)
- Review and approve KYC submissions
- Track fees, invoices, and reconciliation
- View reporting and analytics
- Handle GDPR requests and compliance
- Manage the signature queue (Verso Sign)

**Why they exist:** Someone needs full administrative control. This is the CEO persona.

**Key sections from user stories:**
- Create User (Investor, Arranger, Lawyer, Partner, Commercial Partner, Introducer)
- Manage Opportunity (Create, Edit, Archive, View subscribers, Manage documents)
- Reporting (Platform analytics)
- GDPR (Data requests, right to be forgotten)

---

### 2.2 Arranger

**Business Role:** Structures deals and manages relationships.

**What they do:**
- Manage their profile and company information
- View and manage their Partners (entities they work with)
- View and manage their Introducers (entities that bring them deals)
- View and manage their Commercial Partners
- View and manage their Lawyers
- View and manage their Mandates (deals they're structuring)

**Why they exist:** Arrangers are regulated entities that structure investment vehicles. They have their own network of partners, introducers, and lawyers.

**Key sections from user stories:**
- Profile (Personal info, entity details)
- My Partners (Fee models, agreements)
- My Introducers (Introducer relationships)
- My Commercial Partners (Commercial partner relationships)
- My Lawyers (Legal counsel assignments)
- My Mandates (Deals being structured)

---

### 2.3 Lawyer

**Business Role:** External legal counsel assigned to specific deals.

**What they do:**
- Manage their profile
- Receive notifications about deals they're assigned to
- Handle escrow accounts (view, approve releases)
- View reporting for their deals
- Sign legal documents via Verso Sign

**Why they exist:** Lawyers provide legal services for specific transactions. They only see deals they're assigned to.

**Key sections from user stories:**
- Profile
- Notifications (New subscription pack, Funded subscription, Escrow release request, Certificate request)
- Escrow Account Handling (View accounts, View transactions, Approve release)
- Reporting (Their deal activity)

---

### 2.4 Investor

**Business Role:** Invests capital into deals.

**What they do:**
- Manage their profile (personal info, KYC documents, compliance questionnaire, bank details)
- Browse investment opportunities
- Request access to deal data rooms
- Sign NDAs
- Submit subscription requests
- Sign subscription packs
- Fund investments
- View their portfolio (active investments)
- Request and receive certificates
- Sell investments (secondary sales)
- Receive notifications about their investments

**Why they exist:** Investors are the core users. They provide capital.

**Key sections from user stories:**
- Profile (Personal info, KYC, Compliance, Bank details)
- My Opportunities (View deals, Request dataroom access, Sign NDA, Submit subscription, Sign subscription pack, View funding instructions, Request certificates)
- My Investments (Portfolio view, Position details)
- Notifications (Deal updates, Document requests, Status changes)
- Investment Sales (Sell positions)

---

### 2.5 Partner

**Business Role:** Invests AND brings other investors to deals.

**What they do:**
- **EVERYTHING an Investor does** (the user stories explicitly state: "My opportunities as investor even if I am partner")
- PLUS: View opportunities they're assigned to as a partner
- PLUS: Track transactions from investors they brought
- PLUS: View reporting on their partner activity
- PLUS: Share investment opportunities with their network
- PLUS: View shared transactions

**Why they exist:** Partners have a dual relationship - they invest their own money AND bring other investors. They need both views.

**Key sections from user stories:**
- Profile
- My Opportunities (SAME AS INVESTOR - explicitly stated)
- My Transactions as Partner:
  - View opportunities assigned as partner
  - View opportunity transactions (what their referred investors did)
  - Reporting as Partner
  - Shared Transactions (opportunities shared with others)

**Critical distinction:** A Partner is NOT just "someone who is both investor and introducer." A Partner is its own entity type with specific features. The user stories show Partner has explicit sections that differ from Introducer.

---

### 2.6 Introducer

**Business Role:** Brings new investors to deals for a commission.

**What they do:**
- **EVERYTHING an Investor does** (the user stories explicitly state: "My opportunities as investor even if I am Introducer")
- PLUS: Sign Introducer Agreements with VERSO
- PLUS: Track their introductions (referrals)
- PLUS: View reporting on their introducer activity

**Why they exist:** Introducers earn commissions for bringing investors. Unlike Partners, they don't necessarily invest themselves (though they can, since they have the full investor journey available).

**Key sections from user stories:**
- Profile
- My Opportunities (SAME AS INVESTOR - explicitly stated)
- My Introductions:
  - Introducer Agreements (legal agreements with VERSO about commission terms)
  - Introductions Tracking (status of referrals)
  - Reporting as Introducer (commission tracking)

**Critical distinction from Partner:**
- Introducer has "Introducer Agreements" (fee agreements with VERSO)
- Partner has "View opportunity transactions" and "Shared Transactions" (they see what their investors do)
- Different business model, different features

---

### 2.7 Commercial Partner

**Business Role:** Institutional partner that can act on behalf of clients.

**What they do:**
- **EVERYTHING an Investor does** (has full investor journey)
- PLUS: View opportunities they're assigned to as commercial partner
- PLUS: Track transactions for their clients
- PLUS: Sign Placement Agreements with VERSO
- PLUS: Execute (sign) documents on behalf of their clients

**Why they exist:** Commercial Partners represent institutions (wealth managers, family offices) that place capital on behalf of their clients. Unlike regular Partners, they CAN sign subscription packs for their clients.

**Key sections from user stories:**
- Profile
- My Opportunities (SAME AS INVESTOR)
- My Transactions as Commercial Partner:
  - View opportunities assigned as commercial partner
  - View transactions for clients
  - Reporting as Commercial Partner
- My Placement Agreements (legal agreements defining their relationship with VERSO)

**Critical distinction from Partner:**
- Commercial Partner has "Placement Agreements" (formal institutional agreements)
- Commercial Partner CAN execute on behalf of clients (Partner cannot)
- Different legal/regulatory relationship

---

## 3. The Entity-User Model

### 3.1 The Core Principle

Every persona type is an **ENTITY** (the account/company) that can have **MULTIPLE USERS** (people with login access).

**Why this matters:**

Real-world example: "Smith Family Trust" is an investor entity. Three people need access:
- John Smith (Trustee) - can sign documents
- Mary Smith (Trustee) - can sign documents
- Jane Doe (Assistant) - can view but not sign

With the correct design, all three can log in. With a wrong design (single user_id), only one person can access the account.

### 3.2 The Correct Pattern

Every entity type needs TWO tables:

**Entity Table** (the account)
- `investors` - Investor accounts
- `introducers` - Introducer accounts
- `partner_entities` - Partner accounts
- `commercial_partner_entities` - Commercial partner accounts
- `arranger_entities` - Arranger accounts
- `lawyer_entities` - Lawyer accounts (or firms)

**Linking Table** (who can access)
- `investor_users` - Links profiles to investors
- `introducer_users` - Links profiles to introducers
- `partner_users` - Links profiles to partner_entities
- `commercial_partner_users` - Links profiles to commercial_partner_entities
- `arranger_users` - Links profiles to arranger_entities
- `lawyer_users` - Links profiles to lawyer_entities

For CEO, we have options:
- Use `profiles.role = 'ceo'` for simple detection
- Or create `ceo_users` table if CEOs need entity-level organization

### 3.3 Current Database State

The current database has inconsistent patterns:

**CORRECT (already exists):**
- `investors` table with `investor_users` linking table

**INCORRECT (needs fixing):**
- `introducers` table has a single `user_id` column (only allows ONE user per introducer)

**MISSING (needs creation):**
- `introducer_users` table
- `partner_entities` + `partner_users` tables
- `commercial_partner_entities` + `commercial_partner_users` tables
- `arranger_users` table (arranger_entities exists but has no linking table)
- `lawyer_entities` + `lawyer_users` tables (or use deal_memberships for lawyer assignments)

---

## 4. Persona Detection Logic

When a user logs in, the system determines which personas they have by checking the linking tables:

```
1. SELECT * FROM investor_users WHERE user_id = [logged_in_user]
   → If found, user is an INVESTOR for that investor entity

2. SELECT * FROM introducer_users WHERE user_id = [logged_in_user]
   → If found, user is an INTRODUCER for that introducer entity

3. SELECT * FROM partner_users WHERE user_id = [logged_in_user]
   → If found, user is a PARTNER for that partner entity

4. SELECT * FROM commercial_partner_users WHERE user_id = [logged_in_user]
   → If found, user is a COMMERCIAL PARTNER for that entity

5. SELECT * FROM arranger_users WHERE user_id = [logged_in_user]
   → If found, user is an ARRANGER for that arranger entity

6. SELECT * FROM lawyer_users WHERE user_id = [logged_in_user]
   → If found, user is a LAWYER

7. SELECT role FROM profiles WHERE id = [logged_in_user]
   → If role = 'ceo', user is a CEO
```

**A single user can have MULTIPLE personas.** Example: John Doe might be:
- An Investor (via investor_users)
- AND an Introducer (via introducer_users)
- AND a Partner (via partner_users)

The system shows navigation items and features for ALL their personas.

---

## 5. What Each Persona Sees

### 5.1 CEO Navigation

Based on user stories section "1. CEO":

- **Dashboard** - Platform overview, KYC pipeline, deal flow
- **Users** - Manage all user types
  - Create/Edit/View Investor
  - Create/Edit/View Arranger
  - Create/Edit/View Lawyer
  - Create/Edit/View Partner
  - Create/Edit/View Commercial Partner
  - Create/Edit/View Introducer
- **Opportunities** - Deal management
  - Create/Edit/Archive deals
  - View subscribers
  - Manage deal documents
  - Document generation (subscription packs)
- **KYC Review** - Approve/reject KYC submissions
- **Fees** - Fee tracking and reconciliation
- **Verso Sign** - Signature queue management
- **Documents** - All platform documents
- **Audit** - Audit logs, compliance
- **GDPR** - Data requests, erasure

### 5.2 Arranger Navigation

Based on user stories section "2. Arranger":

- **Dashboard** - Mandate summary
- **Profile** - Personal and entity information
- **My Partners** - Partner relationships and fee models
- **My Introducers** - Introducer relationships
- **My Commercial Partners** - Commercial partner relationships
- **My Lawyers** - Legal counsel assignments
- **My Mandates** - Deals being arranged
- **Documents** - Mandate documents
- **Inbox** - Messages and notifications

### 5.3 Lawyer Navigation

Based on user stories section "3. Lawyer":

- **Dashboard** - Assigned deals summary
- **Profile** - Personal information
- **My Assigned Deals** - Deals they're legal counsel for
- **Escrow Accounts** - View and manage escrow
- **Documents** - Deal documents
- **Verso Sign** - Documents requiring signature
- **Inbox** - Notifications (subscription packs, funding, certificates)
- **Reporting** - Activity reports

### 5.4 Investor Navigation

Based on user stories section "4. Investor":

- **Dashboard** - Portfolio summary, pending tasks
- **Profile** - Personal info, KYC, Compliance, Bank details
- **My Opportunities** - Browse deals
  - View deal details
  - Request data room access
  - Sign NDA
  - Submit subscription
  - Sign subscription pack
  - View funding instructions
  - Request certificates
- **My Investments** - Active portfolio
  - Position details
  - Performance
  - Documents (K-1s, statements)
- **Documents** - All investor documents
- **Verso Sign** - Signature queue
- **Inbox** - Messages, notifications
- **Investment Sales** - Sell positions

### 5.5 Partner Navigation

Based on user stories section "5. Partner":

**Includes everything from Investor, PLUS:**

- **My Transactions as Partner**
  - View opportunities assigned as partner
  - Track investor transactions
  - Partner reporting
  - Shared transactions

### 5.6 Introducer Navigation

Based on user stories section "6. Introducer":

**Includes everything from Investor, PLUS:**

- **My Introductions**
  - Introducer Agreements (fee agreements)
  - Introduction tracking
  - Introducer reporting

### 5.7 Commercial Partner Navigation

Based on user stories section "7. Commercial Partner":

**Includes everything from Investor, PLUS:**

- **My Transactions as Commercial Partner**
  - View assigned opportunities
  - Track client transactions
  - Commercial partner reporting
- **My Placement Agreements** - Institutional agreements with VERSO

---

## 6. Database Changes Required

### 6.1 New Tables

**A. `introducer_users`**
```
Purpose: Allow multiple users per introducer entity
Fields:
- id (uuid, primary key)
- introducer_id (uuid, references introducers)
- user_id (uuid, references profiles)
- role (text: 'admin', 'member')
- created_at (timestamp)
```

**B. `partner_entities`**
```
Purpose: Partner accounts (distinct from introducers)
Fields:
- id (uuid, primary key)
- legal_name (text)
- status (text: 'active', 'pending', 'inactive')
- created_at (timestamp)
- updated_at (timestamp)
```

**C. `partner_users`**
```
Purpose: Link users to partner entities
Fields:
- id (uuid, primary key)
- partner_id (uuid, references partner_entities)
- user_id (uuid, references profiles)
- can_sign (boolean) - whether this user can sign documents
- created_at (timestamp)
```

**D. `commercial_partner_entities`**
```
Purpose: Commercial partner accounts
Fields:
- id (uuid, primary key)
- legal_name (text)
- status (text)
- created_at (timestamp)
- updated_at (timestamp)
```

**E. `commercial_partner_users`**
```
Purpose: Link users to commercial partner entities
Fields:
- id (uuid, primary key)
- commercial_partner_id (uuid, references commercial_partner_entities)
- user_id (uuid, references profiles)
- can_execute_for_clients (boolean) - whether this user can sign on behalf of clients
- created_at (timestamp)
```

**F. `arranger_users`**
```
Purpose: Link users to arranger entities (arranger_entities already exists)
Fields:
- id (uuid, primary key)
- arranger_entity_id (uuid, references arranger_entities)
- user_id (uuid, references profiles)
- role (text)
- created_at (timestamp)
```

**G. `placement_agreements`**
```
Purpose: Track commercial partner placement agreements
Fields:
- id (uuid, primary key)
- commercial_partner_id (uuid, references commercial_partner_entities)
- document_id (uuid, references documents)
- status (text)
- effective_date (date)
- created_at (timestamp)
```

**H. `introducer_agreements`**
```
Purpose: Track introducer fee agreements
Fields:
- id (uuid, primary key)
- introducer_id (uuid, references introducers)
- document_id (uuid, references documents)
- commission_rate (decimal)
- status (text)
- effective_date (date)
- created_at (timestamp)
```

### 6.2 Changes to Existing Tables

**A. `profiles.role` enum**
- Current values: investor, staff_admin, staff_ops, staff_rm
- Remove: staff_admin, staff_ops, staff_rm
- Add: ceo
- Note: "investor" in profiles.role is redundant since we detect via investor_users. Consider removing entirely and detecting all personas via linking tables.

**B. `introducers` table**
- Deprecate the `user_id` column
- Keep it for backwards compatibility during migration
- All new code should use `introducer_users` table

**C. `investor_members` table (if exists)**
- Add `is_signatory` boolean field
- Purpose: Only signatories can sign subscription packs

### 6.3 Tables that may already exist (verify before creating)

- `arranger_entities` - Exists, confirmed
- `investors` - Exists, confirmed
- `investor_users` - Exists, confirmed
- `introducers` - Exists, confirmed
- `deal_memberships` - May exist, used for lawyer assignment

### 6.4 Data Migration Strategy

**A. Existing `introducers.user_id` → `introducer_users`**
```
1. For each introducer with non-null user_id:
   - INSERT INTO introducer_users (introducer_id, user_id, role, created_at)
   - VALUES (introducer.id, introducer.user_id, 'admin', introducer.created_at)
2. Verify all records migrated
3. Update application code to use introducer_users
4. Keep introducers.user_id for backwards compatibility (deprecate, don't delete)
```

**B. Existing `profiles.role` staff users → CEO**
```
1. Users with role = 'staff_admin' → role = 'ceo'
2. Users with role = 'staff_ops' → role = 'ceo' (or new role if needed)
3. Users with role = 'staff_rm' → role = 'ceo' (or new role if needed)
4. Document which users were migrated for audit
```

**C. RLS Policy Updates**
```
1. All new tables require SELECT/INSERT/UPDATE/DELETE policies
2. Persona detection queries must be RLS-safe
3. Cross-persona data access must be explicitly denied
4. Service role bypasses for admin operations only
```

---

## 7. Signatory Logic

Not everyone linked to an entity can sign documents. Example:

"Smith Family Trust" (investor entity) has 3 users:
- John Smith (Trustee) - IS a signatory
- Mary Smith (Trustee) - IS a signatory
- Jane Doe (Assistant) - NOT a signatory

When generating a subscription pack for signature:
1. Look up all users linked to the investor entity
2. Filter to those marked as signatories
3. Create signature requests only for signatories

This requires tracking signatory status in the linking tables:
- `investor_users.is_signatory` (or `investor_members.is_signatory`)
- `partner_users.can_sign`
- `commercial_partner_users.can_execute_for_clients`

---

## 8. Route Structure

### 8.1 Admin Portal

```
/versotech_admin/
  /dashboard         - Platform metrics
  /settings          - Platform configuration
  /processes         - Workflow automations
  /cms               - Content management
```

### 8.2 Main Portal

```
/versotech_main/
  /login             - Single login for all personas
  /dashboard         - Persona-aware dashboard
  /profile           - User profile (KYC, Compliance, Bank)
  /documents         - All documents
  /versosign         - Signature queue
  /inbox             - Messages and notifications

  # Investor features
  /opportunities              - Browse deals
  /opportunities/[id]         - Deal detail + data room
  /portfolio                  - Active investments
  /portfolio/[id]             - Position detail
  /sales                      - Investment sales

  # CEO features
  /users                      - User management
  /users/investors            - Manage investors
  /users/introducers          - Manage introducers
  /users/partners             - Manage partners
  /users/commercial-partners  - Manage commercial partners
  /users/arrangers            - Manage arrangers
  /users/lawyers              - Manage lawyers
  /deals                      - Deal management
  /kyc-review                 - KYC approval queue
  /fees                       - Fees and reconciliation
  /audit                      - Audit logs

  # Arranger features
  /my-partners                - Partner relationships
  /my-introducers             - Introducer relationships
  /my-commercial-partners     - Commercial partner relationships
  /my-lawyers                 - Lawyer assignments
  /mandates                   - Deals being arranged

  # Lawyer features
  /assigned-deals             - Deals assigned as counsel
  /escrow                     - Escrow account management

  # Partner features
  /partner-transactions       - Partner activity tracking

  # Introducer features
  /introductions              - Introduction tracking
  /introducer-agreements      - Fee agreements

  # Commercial Partner features
  /commercial-transactions    - Commercial partner activity
  /placement-agreements       - Placement agreements
```

---

## 9. Key Business Rules

### 9.1 What Partners CAN and CANNOT do

- CAN: Invest their own money (full investor journey)
- CAN: See transactions from investors they brought
- CAN: Share investment opportunities with their network
- CANNOT: Sign documents on behalf of investors they brought

### 9.2 What Commercial Partners CAN do differently

- CAN: Execute (sign) documents on behalf of their clients
- Have formal Placement Agreements that define this relationship

### 9.3 What Introducers CAN and CANNOT do

- CAN: Invest their own money (full investor journey available)
- CAN: Track introductions and commissions
- CANNOT: See detailed transaction info for investors they introduced
- Have Introducer Agreements that define commission terms

### 9.4 Lawyer Access Rules

- Can ONLY see deals they are assigned to
- Cannot see other deals or other users
- Assignment tracked via deal_memberships or lawyer_users

---

## 10. Summary: What Makes Each Persona Different

| Persona | Invests Own Money | Brings Investors | Can Sign for Others | Has Agreements |
|---------|-------------------|------------------|---------------------|----------------|
| CEO | N/A | N/A | N/A (admin) | N/A |
| Arranger | No | No | No | Mandate agreements |
| Lawyer | No | No | No (signs own docs) | No |
| Investor | Yes | No | No | No |
| Partner | Yes | Yes | No | No |
| Introducer | Yes (optional) | Yes | No | Introducer Agreements |
| Commercial Partner | Yes | Yes | YES | Placement Agreements |

---

## 11. UI/UX Changes Required

These changes are documented in the client vision and must be implemented.

### 11.1 Investment Opportunities (Investor Journey)

**Current State:**
- `/versoholdings/deals` - List of deals
- `/versoholdings/deal/[id]` - Deal detail
- `/versoholdings/data-rooms` - Separate data room list
- `/versoholdings/data-rooms/[dealId]` - Data room detail with subscription form

**Required Changes:**
1. **Rename** "Active Deals" → "Investment Opportunities"
2. **Integrate data room** inside Investment Opportunity detail (remove separate Data Rooms page from navigation)
3. **Add journey/progress bar** showing investor journey stages:
   - Opportunity Received → Interest Confirmed → NDA Signed → Data Room Access → Subscription Pack → Signed → Funded → Active Investment
4. **Portfolio integration** - Investment becomes part of "My Investments" only when active (funded)

### 11.2 Tasks & Notifications

**Current State:**
- `/versoholdings/tasks` - Tasks page in sidebar
- `/versoholdings/notifications` - Notifications page in sidebar

**Required Changes:**
1. **Merge** tasks and notifications into unified "Inbox" component
2. **Remove** from sidebar
3. **Move** to header (top-right, near profile icon)
4. **Categorize** by:
   - Investment Opportunity (group by deal)
   - Type (Signatures, KYC, Compliance, Funding, etc.)

### 11.3 Documents

**Current State:**
- `/versoholdings/reports` - Contains "Requests" + "Documents" views
- `/versoholdings/documents` - Redirects to reports

**Required Changes:**
1. **Rename** "Reports" → "Documents"
2. **Keep** document request functionality (as tab or sub-section)

### 11.4 Profile - KYC vs Compliance Split

**Current State:**
- Profile has "KYC & Onboarding" as single tab
- Compliance questionnaire mixed with KYC documents

**Required Changes:**
1. **Split into two tabs:**
   - **KYC tab** - Identity documents, proof of address, entity documents, onboarding forms
   - **Compliance tab** - Questionnaire, accreditation status, suitability, risk tolerance
2. **Rename** or clarify "Entities" tab (currently confusing)

### 11.5 Staff Features → CEO Features

**Current State (Staff Portal):**
- `/versotech/staff/approvals` - Approvals queue
- `/versotech/staff/messages` - Messages
- `/versotech/staff/investors` - Investor management
- `/versotech/staff/arrangers` - Arranger management
- `/versotech/staff/introducers` - Introducer management

**Required Changes:**
1. **Merge** Approvals + Messages into unified "Inbox" for CEO
2. **Consolidate** Investors + Arrangers + Introducers + Partners + Commercial Partners + Lawyers into ONE "Users" page with type filter/tabs

### 11.6 Theme Toggle

**Current State:**
- Investor portal: Light (blue/white)
- Staff portal: Dark
- Theme is hardwired based on portal, not user choice

**Required Changes:**
1. **Default** to light theme (investor style) for all users
2. **Add toggle** allowing user to switch to dark mode
3. **Persist** preference per user

---

## 12. Page Mapping: Existing vs New

This section maps existing pages to the new portal structure and identifies what's reusable vs what needs to be built new.

### 12.1 Existing Investor Portal Pages

| Current Page | New Location | Reuse Level | Changes Needed |
|--------------|--------------|-------------|----------------|
| `/versoholdings/dashboard` | `/versotech_main/dashboard` | High | Add persona-awareness |
| `/versoholdings/deals` | `/versotech_main/opportunities` | High | Rename, update nav |
| `/versoholdings/deal/[id]` | `/versotech_main/opportunities/[id]` | Medium | Integrate data room, add journey bar |
| `/versoholdings/data-rooms` | REMOVED | N/A | Integrated into opportunities |
| `/versoholdings/data-rooms/[dealId]` | `/versotech_main/opportunities/[id]` | Medium | Merge into opportunity detail |
| `/versoholdings/holdings` | `/versotech_main/portfolio` | High | Rename |
| `/versoholdings/vehicle/[id]` | `/versotech_main/portfolio/[id]` | High | Rename |
| `/versoholdings/tasks` | REMOVED from sidebar | Medium | Move to header notification center |
| `/versoholdings/notifications` | REMOVED from sidebar | Medium | Move to header notification center |
| `/versoholdings/messages` | `/versotech_main/inbox` | Medium | Merge with approvals for CEO |
| `/versoholdings/reports` | `/versotech_main/documents` | High | Rename |
| `/versoholdings/profile` | `/versotech_main/profile` | Medium | Split KYC/Compliance tabs |

### 12.2 Existing Staff Portal Pages → CEO Features

| Current Page | New Location | Reuse Level | Changes Needed |
|--------------|--------------|-------------|----------------|
| `/versotech/staff` (dashboard) | `/versotech_main/dashboard` | High | Persona-aware widgets |
| `/versotech/staff/deals` | `/versotech_main/deals` | High | CEO-only access |
| `/versotech/staff/deals/[id]` | `/versotech_main/deals/[id]` | High | Minimal changes |
| `/versotech/staff/deals/new` | `/versotech_main/deals/new` | High | Minimal changes |
| `/versotech/staff/investors` | `/versotech_main/users` | Medium | Consolidate with other user types |
| `/versotech/staff/investors/[id]` | `/versotech_main/users/[id]` | Medium | Add user type handling |
| `/versotech/staff/arrangers` | `/versotech_main/users` | Medium | Consolidate |
| `/versotech/staff/introducers` | `/versotech_main/users` | Medium | Consolidate |
| `/versotech/staff/introducers/[id]` | `/versotech_main/users/[id]` | Medium | Consolidate |
| `/versotech/staff/approvals` | `/versotech_main/inbox` | Medium | Merge with messages |
| `/versotech/staff/messages` | `/versotech_main/inbox` | Medium | Merge with approvals |
| `/versotech/staff/fees` | `/versotech_main/fees` | High | CEO-only access |
| `/versotech/staff/kyc-review` | `/versotech_main/kyc-review` | High | CEO-only access |
| `/versotech/staff/versosign` | `/versotech_main/versosign` | High | All personas |
| `/versotech/staff/audit` | `/versotech_main/audit` | High | CEO-only access |
| `/versotech/staff/reconciliation` | `/versotech_main/reconciliation` | High | CEO-only access |
| `/versotech/staff/subscriptions` | `/versotech_main/subscriptions` | High | CEO-only access |
| `/versotech/staff/documents` | `/versotech_main/documents` | High | Persona filtering |
| `/versotech/staff/admin` | `/versotech_admin/dashboard` | High | Move to admin portal |

### 12.3 New Pages Required (Not Existing)

| New Page | Persona | Description |
|----------|---------|-------------|
| `/versotech_main/partner-transactions` | Partner | Track referred investor transactions |
| `/versotech_main/introductions` | Introducer | Track introductions and commissions |
| `/versotech_main/introducer-agreements` | Introducer | View/sign introducer agreements |
| `/versotech_main/commercial-transactions` | Commercial Partner | Track client transactions |
| `/versotech_main/placement-agreements` | Commercial Partner | View/sign placement agreements |
| `/versotech_main/mandates` | Arranger | Deals being arranged |
| `/versotech_main/my-partners` | Arranger | Partner relationships |
| `/versotech_main/my-introducers` | Arranger | Introducer relationships |
| `/versotech_main/my-commercial-partners` | Arranger | Commercial partner relationships |
| `/versotech_main/my-lawyers` | Arranger | Lawyer assignments |
| `/versotech_main/assigned-deals` | Lawyer | Filtered deal view |
| `/versotech_main/escrow` | Lawyer | Escrow account management |

---

## 13. Implementation Phases

Total estimated time: **182 hours**

**Ordering Principle:** Database schema must be stable BEFORE dependent UI development begins. This ensures TypeScript types are correct, RLS policies are in place, and no mid-project rework is needed.

---

### Phase 1: Database Schema & Migration (~24 hours)

**Objective:** Create all required database tables, RLS policies, and migrate existing data. This MUST be done first so all subsequent phases have stable types and data.

**Deliverables:**

**A. Entity-User Linking Tables:**
1. Create `introducer_users` table (multi-user per introducer)
2. Create `partner_entities` + `partner_users` tables
3. Create `commercial_partner_entities` + `commercial_partner_users` tables
4. Create `arranger_users` table (arranger_entities already exists)
5. Create `lawyer_entities` + `lawyer_users` tables (or configure deal_memberships)
6. Create `placement_agreements` table
7. Create `introducer_agreements` table
8. Add `is_signatory` boolean to `investor_users` (or `investor_members`)
9. Update `profiles.role` enum: add `ceo`, deprecate `staff_*` values

**B. Companies Table (Vehicle vs Company Separation):**
10. Create `companies` table:
    - `id` (uuid, primary key)
    - `legal_name` (text)
    - `address` (text) - domicile of company
    - `country` (text)
    - `logo_url` (text)
    - `website` (text)
    - `created_at`, `updated_at` (timestamps)
11. Add `vehicles.company_id` (uuid, FK to companies)
12. Create `company_stakeholders` table (move from vehicle level)
13. Create `company_directors` table (move from vehicle level)
14. Create `company_valuations` table (move from vehicle level)

**C. Deals Table Updates:**
15. Add `deals.stock_type` field (text: 'preferred_stock', 'common_stock', 'series_a', etc.)
16. Make `deals.vehicle_id` NOT NULL (required for all deals)

**D. KYC Document Types Cleanup:**
17. Remove NDA, DNC from KYC document type enum (these are investment documents, not KYC)

**Correct KYC Document Types (for entities):**
- Incorporation Certificate
- Memorandum of Association
- Register of Members
- Register of Directors
- ID for each member
- Proof of Address for each member
- Bank confirmation (for wire instructions)

**NOT KYC documents (remove from KYC enum):**
- NDA (investment document)
- DNC (investment document)
- Questionnaire (compliance, not KYC)

**E. Data Migrations:**
18. Migrate existing `introducers.user_id` → `introducer_users`
19. Migrate existing `staff_admin` users → `ceo` role
20. Migrate stakeholders/directors/valuations from vehicles to companies
21. Create RLS policies for ALL new tables
22. Regenerate TypeScript types

**Database Changes:**
- 12+ new tables with full RLS policies
- `companies` table with related tables (stakeholders, directors, valuations)
- `deals.stock_type` field, `deals.vehicle_id` NOT NULL
- Enum migration for `profiles.role`
- KYC document types cleanup
- Data migration for introducers, staff users, and company data

**Files Affected:**
- `supabase/migrations/` - New migration files
- `src/types/supabase.ts` - Regenerated types

**API Routes Affected:**
- None yet (schema only)

**Estimated Hours:** 24

---

### Phase 2: Auth & Portal Structure (~25 hours)

**Objective:** Create the new portal skeleton, authentication foundation, persona detection, and legacy redirects.

**Deliverables:**
1. Create `/versotech_main` route group with shared layout
2. Create `/versotech_admin` route group with admin-only layout
3. Implement single login page (`/versotech_main/login`)
4. Update middleware to handle new portal prefixes
5. Implement persona detection logic via `getUserPersonas()` function
6. Create persona-aware navigation component
7. **Persona switcher UI** for hybrid users (dropdown in user menu)
8. Add theme toggle (light/dark) with user persistence
9. Set up all legacy URL redirects (see Section 17)
10. **Move Processes to Admin Portal** - The "Processes" feature (workflow automations) belongs in Admin Portal, not Main Portal

**Database Changes:**
- None (schema complete from Phase 1)

**Files Affected:**
- `middleware.ts` - New portal routing + legacy redirects
- `lib/auth.ts` - Persona detection function (`getUserPersonas()`)
- `lib/auth-client.ts` - Client-side persona awareness
- `app/api/auth/signin/route.ts` - Redirect based on personas, not brand
- `app/auth/callback/page.tsx` - Redirect based on persona
- `components/auth-handler.tsx` - Persona-aware callback handling
- `components/layout/app-layout.tsx` - Remove hard brand coupling
- `components/layout/sidebar.tsx` - Persona-aware navigation
- `components/layout/user-menu.tsx` - Persona switcher dropdown
- `components/theme-provider.tsx` - User toggle + persistence

**API Routes Affected:**
- `app/api/auth/signin/route.ts` - Persona-based redirect
- `app/api/auth/signout/route.ts` - Clear persona state

**Estimated Hours:** 25

---

### Phase 3: Investor Journey Restructure (~40 hours)

**Objective:** Implement the new investment opportunities experience with integrated data room, journey bar, and correct subscription pack workflow.

**Deliverables:**

**A. Opportunity Pages (10 hours)**
1. Create `/versotech_main/opportunities` page (rename from deals)
2. Create `/versotech_main/opportunities/[id]` with:
   - Overview section (deal details)
   - Integrated data room (documents tab, NDA signing)
   - Subscription pack section (submit, sign, fund)
   - **Journey progress bar** showing investor stages
3. Create `/versotech_main/portfolio` page (rename from holdings)
4. Create `/versotech_main/portfolio/[id]` (rename from vehicle)
5. Remove separate `/data-rooms` navigation item
6. Journey bar component with stages: Interest → NDA → Data Room → Subscribe → Sign → Fund → Active
7. **Stock type display** - Show stock type field in deal detail (data from `deals.stock_type`)

**B. Subscription Pack Workflow (CRITICAL - 12 hours)**
**Important:** NO DRAFT STEP. Pack generates immediately when investor clicks "Invest."

**Correct Workflow:**
1. Investor clicks "Invest $X"
2. System checks prerequisites (KYC complete, NDA signed, etc.)
3. System auto-generates subscription pack with:
   - All entity signatories identified (up to 10)
   - CEO signature block(s)
   - All dynamic fields populated
4. System creates signature requests for ALL signatories
5. Goes directly to signing queue (NO draft review step)
6. If comments needed, handled AFTER first version shared

**Implementation:**
- Update `deal_subscription_submissions` flow to auto-generate pack
- Create subscription pack template with multiple signature blocks (max 10)
- Update signature request creation to handle all signatories
- Remove any draft approval step from current flow

**C. NDA vs Subscription Pack Handling (6 hours)**
- **NDA:** One NDA per signatory (entity with 3 signatories = 3 separate NDAs)
- **Subscription Pack:** ONE pack with MULTIPLE signature blocks (entity with 3 signatories = 1 pack with 3 blocks)

**D. Entity-Level Data Room Access (8 hours)**
**Rule:** ALL signatories must sign NDA before ANY entity user gets data room access.

**Rule:**
1. Entity has N signatories
2. ALL N must sign their individual NDAs
3. THEN all users (signatories + non-signatories) linked to entity get data room access
4. Address used in NDA = ENTITY address (not individual address)

**Implementation:**
- Update data room access grant logic
- Check `deal_nda_signatures` for ALL signatories of entity
- Only grant access when count matches total signatory count
- Update RLS policy for `deal_data_room_access` table

**E. CEO Deal Creation UI (4 hours)**
- Add stock type selector in deal creation form
- Required vehicle selection (vehicle_id is NOT NULL)
- Display company info from linked vehicle.company

**Journey Bar Data Sources:**
- `investor_deal_interest` → Interest stage
- `deal_nda_signatures` → NDA stage (check ALL signatories)
- `deal_data_room_access` → Data Room stage
- `deal_subscription_submissions` → Subscribe stage
- `signature_requests` → Sign stage (check ALL signatories)
- `allocations.funding_status` → Fund stage
- `subscriptions` → Active stage

**Database Changes:**
- None (uses existing tables from Phase 1)

**Files Affected:**
- New: `app/(main)/versotech_main/opportunities/page.tsx`
- New: `app/(main)/versotech_main/opportunities/[id]/page.tsx`
- New: `app/(main)/versotech_main/portfolio/page.tsx`
- New: `app/(main)/versotech_main/portfolio/[id]/page.tsx`
- New: `components/investor/journey-bar.tsx`
- New: `components/deals/subscription-pack-generator.tsx`
- Update: `api/deals/[id]/subscribe/route.ts` - Auto-generate pack
- Update: `api/data-room/access/route.ts` - Entity-level access logic
- Update: `components/deals/deal-form.tsx` - Stock type, required vehicle
- Update: Sidebar navigation

**API Routes Affected:**
- Existing `/api/deals/*` routes (reuse)
- Existing `/api/data-room/*` routes (reuse + update)
- Update: `/api/deals/[id]/subscribe` - Auto-generate subscription pack
- Update: `/api/data-room/access` - Entity-level signatory check
- New: `/api/investor/journey-status/[dealId]` - Aggregate journey state

**Estimated Hours:** 40

---

### Phase 4: UI/UX Consolidation (~26 hours)

**Objective:** Consolidate tasks/notifications into header, simplify documents, split profile tabs, and fix terminology.

**Deliverables:**

**A. Tasks & Notifications (8 hours)**
1. Create header notification center component (bell icon near profile)
2. Unified dropdown panel showing:
   - Tasks (grouped by deal, then by category)
   - Notifications (grouped by type: signatures, KYC, compliance, funding)
3. Remove Tasks and Notifications from sidebar
4. Badge showing unread count

**B. Documents (8 hours)**
1. Rename "Reports" → "Documents" in navigation
2. Keep document request functionality as sub-tab
3. Update all references

**C. Profile KYC/Compliance Split (8 hours)**
1. Split "KYC & Onboarding" into:
   - **KYC tab:** Identity documents, proof of address, entity documents
   - **Compliance tab:** Questionnaire, accreditation, suitability, risk tolerance
2. Rename "Entities" tab → "My Entities" or "Linked Accounts"
3. Update profile navigation

**D. Terminology Updates (2 hours)**
**Required terminology changes:**

1. **"Utility bill" → "Proof of Address"**
   - KYC document types: rename "utility_bill" to "proof_of_address"
   - UI labels: "Utility Bill" becomes "Proof of Address"
   - Note: Utility bill is one EXAMPLE of proof of address, not the only option

2. **"Investors" tab → "Subscriptions" tab (Vehicle Detail)**
   - On vehicle detail page, tab showing investors should be renamed
   - Because: Subscription = in-progress journey, Position = funded/active
   - Shows investors who have subscribed to the vehicle

3. **"Entity" → "Vehicle" in relevant contexts**
   - Where "Entity" refers to investment structures (series/compartments), rename to "Vehicle"
   - Keep "Entity" for investor/partner/introducer entities (people/companies)

**Database Changes:**
- None (reorganization of existing data display)

**Files Affected:**
- New: `components/layout/notification-center.tsx`
- Update: `components/layout/header.tsx`
- Update: `app/(main)/versotech_main/documents/page.tsx` (rename from reports)
- Update: `components/profile/profile-page-client.tsx`
- New: `components/profile/kyc-tab.tsx`
- New: `components/profile/compliance-tab.tsx`
- Update: Sidebar navigation

**API Routes Affected:**
- Existing `/api/notifications/*` (reuse)
- Existing `/api/tasks/*` (reuse)

**Estimated Hours:** 26

---

### Phase 5: CEO Features - Inbox & Users (~24 hours)

**Objective:** Merge approvals+messages into unified inbox and consolidate all user types into one management page.

**Deliverables:**

**A. Unified Inbox (12 hours)**
1. Create `/versotech_main/inbox` with tabs:
   - Messages (existing messaging)
   - Approvals (existing approvals queue)
   - Requests (document requests, access requests)
2. Unified notification for new items
3. CEO-specific filters and bulk actions

**B. Users Consolidation (12 hours)**
1. Create `/versotech_main/users` consolidated page with:
   - Type filter tabs: All | Investors | Arrangers | Introducers | Partners | Commercial Partners | Lawyers
   - Unified search across all user types
   - Reuse existing table components with adapter pattern
2. Create `/versotech_main/users/[id]` that:
   - Detects user type from URL or query param
   - Renders appropriate detail component
   - Shows all personas for hybrid users
3. Include existing entities management (staff entities page → users)

**Database Changes:**
- None (tables exist from Phase 1)

**Files Affected:**
- New: `app/(main)/versotech_main/inbox/page.tsx`
- New: `components/inbox/inbox-tabs.tsx`
- New: `app/(main)/versotech_main/users/page.tsx`
- New: `app/(main)/versotech_main/users/[id]/page.tsx`
- New: `components/users/user-type-adapter.tsx`
- Reuse: Existing investor/introducer/arranger detail components

**API Routes Affected:**
- Existing `/api/conversations/*` (reuse for messages)
- Existing `/api/approvals/*` (reuse)
- New: `/api/users/search` - Unified search across all user types
- New: `/api/users/[id]` - Get user with all personas

**Estimated Hours:** 24

---

### Phase 6: Partner, Introducer & Commercial Partner Features (~19 hours)

**Objective:** Build persona-specific pages for Partners, Introducers, and Commercial Partners.

**Deliverables:**

**A. Partner Features (5 hours)**
1. `/versotech_main/partner-transactions` - Track referred investor transactions
   - List of investors they brought
   - Transaction status per investor
   - Reporting/analytics

**B. Introducer Features (8 hours)**
1. `/versotech_main/introductions` - Track introductions and status
2. `/versotech_main/introducer-agreements` - View/sign fee agreements
   - Commission rates
   - Agreement status

3. **CRITICAL: Introducer Agreement Prerequisite**
   **Important:** Fee agreement must be signed BEFORE introducer can introduce.

   **Process:**
   1. CEO sends fee proposal to introducer (e.g., "1% fee on total investment")
   2. Introducer AGREES to fee terms (signs agreement)
   3. THEN introducer can either:
      - Invite user directly (requires CEO approval), OR
      - Send contact details to VERSO (VERSO invites)
   4. Block introduction functionality until agreement signed

   **Key Distinction from Partner:**
   Partners don't have this process - "the partner will tell us so we're just going to invite him"

   **Implementation:**
   - Check `introducer_agreements` for signed agreement before allowing introduction
   - UI: Show "Sign Agreement First" message if no agreement exists
   - API: Return 403 if introducer tries to introduce without agreement

**C. Commercial Partner Features (6 hours)**
1. `/versotech_main/commercial-transactions` - Track client transactions
2. `/versotech_main/placement-agreements` - View/sign placement agreements
   - Client list
   - Execute-on-behalf capability

**Database Changes:**
- None (tables exist from Phase 1)

**Files Affected:**
- New: `app/(main)/versotech_main/partner-transactions/page.tsx`
- New: `app/(main)/versotech_main/introductions/page.tsx`
- New: `app/(main)/versotech_main/introducer-agreements/page.tsx`
- New: `app/(main)/versotech_main/commercial-transactions/page.tsx`
- New: `app/(main)/versotech_main/placement-agreements/page.tsx`
- Update: Sidebar navigation (persona-conditional items)

**API Routes Affected:**
- New: `/api/partners/transactions` - Partner transaction data
- New: `/api/introducers/introductions` - Introduction tracking
- New: `/api/introducers/agreements` - Introducer agreements
- Update: `/api/introducers/introductions` - Block if no signed agreement
- New: `/api/commercial-partners/transactions` - Commercial partner data
- New: `/api/commercial-partners/placements` - Placement agreements

**Estimated Hours:** 19

---

### Phase 7: Testing, Polish & Documentation (~24 hours)

**Objective:** Comprehensive testing of all persona flows, bug fixes, and documentation.

**Deliverables:**

**A. Persona Flow Testing (10 hours)**
1. Test CEO flow: Login → Dashboard → Users → Deals → KYC Review → Inbox
2. Test Investor flow: Login → Opportunities → Journey → Portfolio → Documents
3. Test Partner flow: Investor journey + Partner transactions
4. Test Introducer flow: Investor journey + Introductions + Agreements
5. Test Commercial Partner flow: Investor journey + Client transactions + Placements
6. Test Hybrid user: Switch between personas, verify navigation updates

**B. Redirect & Migration Testing (4 hours)**
1. Test ALL legacy URL redirects (30+ routes)
2. Verify no redirect loops
3. Verify query parameters preserved
4. Test deep links from emails/bookmarks

**C. Security Testing (4 hours)**
1. Verify RLS policies on all new tables
2. Test cross-persona data isolation
3. Verify persona detection cannot be spoofed
4. Test service role restrictions

**D. Bug Fixes & Polish (4 hours)**
1. Fix UI/UX issues discovered during testing
2. Performance optimization if needed
3. Error handling improvements

**E. Documentation (2 hours)**
1. Update CLAUDE.md with new routes
2. Document persona detection logic
3. Document new API routes

**Files Affected:**
- Various bug fixes across codebase
- `CLAUDE.md` - Updated documentation
- New: `docs/PHASE2_IMPLEMENTATION_NOTES.md`

**Estimated Hours:** 24

---

## 14. Phase Summary

| Phase | Description | Hours | Dependencies |
|-------|-------------|-------|--------------|
| 1 | Database Schema & Migration | 24 | None (foundational) |
| 2 | Auth & Portal Structure | 25 | Phase 1 (needs types) |
| 3 | Investor Journey Restructure | 40 | Phase 2 (needs routes) |
| 4 | UI/UX Consolidation | 26 | Phase 3 (investor base) |
| 5 | CEO Features - Inbox & Users | 24 | Phase 1 (needs all tables) |
| 6 | Partner/Introducer/Commercial Features | 19 | Phase 1, 5 (needs tables + users page) |
| 7 | Testing, Polish & Documentation | 24 | All phases |
| **TOTAL** | | **182 hours** | |

**Note:** Timeline increased from original 160 hours to 182 hours due to additional requirements:
- Phase 1: +8 hours for companies table, stock_type field, vehicle required, KYC document cleanup
- Phase 2: +1 hour for moving Processes to Admin Portal
- Phase 3: +8 hours for subscription pack auto-generation, NDA handling, entity-level data room access
- Phase 4: +2 hours for terminology updates
- Phase 6: +3 hours for introducer agreement prerequisite

**Phase Ordering Rationale:**
1. **Database first** - TypeScript types and RLS policies must be stable before UI work
2. **Auth second** - Portal structure and persona detection enable all subsequent work
3. **Investor journey third** - Core user flow with highest code reuse from existing portal
4. **UI/UX fourth** - Polish and consolidation of investor experience
5. **CEO features fifth** - Now all user type tables exist for consolidated Users page
6. **Persona features sixth** - Partner/Introducer/Commercial pages depend on tables AND users page patterns
7. **Testing last** - Comprehensive QA with adequate time (24 hours, not 8)

---

## 15. Deferred Features (Post-Launch)

These features from user stories are NOT included in this plan:

**Persona-Specific Features:**
1. **Arranger Features** - My Partners, My Introducers, My Commercial Partners, My Lawyers, My Mandates (requires significant new development)
2. **Lawyer Features** - Escrow handling, deal assignments (requires new workflows)
3. **GDPR Features** - Data export, right to be forgotten (per-persona)
4. **Advanced Reporting** - Per-persona analytics dashboards

**Enablers (from User Stories Sheet 0):**
5. **SaaS B2C Subscription** - Subscription billing for platform access
6. **Billing & Invoicing** - Automated invoice generation and payment tracking
7. **Growth Marketing** - Customer success, retention analytics, acquisition tools
8. **Content Management (CMS)** - Marketing content, landing pages
9. **Advanced Security** - Additional security features beyond current implementation

**Admin Portal:**
10. **Admin Portal Full Build** - CMS, SaaS management, Growth marketing dashboards (initial carve-out in Phase 1, full build deferred)

---

## 16. Open Questions

The following decisions are needed to finalize scope:

1. **Arranger priority:** Should Arranger features (My Mandates, My Partners, etc.) be included in the initial launch, or deferred?

2. **Lawyer features:** Are Lawyer-specific features (Escrow handling) needed for launch?

---

## 17. Legacy URL Redirect Mappings

To ensure zero downtime and preserve bookmarked URLs, the following redirects will be implemented:

### Investor Portal Redirects (`/versoholdings/*` → `/versotech_main/*`)

| Old URL | New URL | Notes |
|---------|---------|-------|
| `/versoholdings/login` | `/versotech_main/login` | Single login for all |
| `/versoholdings/dashboard` | `/versotech_main/dashboard` | Persona-aware |
| `/versoholdings/deals` | `/versotech_main/opportunities` | Renamed |
| `/versoholdings/deal/[id]` | `/versotech_main/opportunities/[id]` | Integrated data room |
| `/versoholdings/data-rooms` | `/versotech_main/opportunities` | Merged |
| `/versoholdings/data-rooms/[dealId]` | `/versotech_main/opportunities/[dealId]` | Merged |
| `/versoholdings/holdings` | `/versotech_main/portfolio` | Renamed |
| `/versoholdings/vehicle/[id]` | `/versotech_main/portfolio/[id]` | Renamed |
| `/versoholdings/tasks` | `/versotech_main/dashboard` | Moved to header |
| `/versoholdings/notifications` | `/versotech_main/dashboard` | Moved to header |
| `/versoholdings/messages` | `/versotech_main/inbox` | Merged |
| `/versoholdings/reports` | `/versotech_main/documents` | Renamed |
| `/versoholdings/documents` | `/versotech_main/documents` | Direct |
| `/versoholdings/profile` | `/versotech_main/profile` | Direct |

### Staff Portal Redirects (`/versotech/staff/*` → `/versotech_main/*`)

| Old URL | New URL | Notes |
|---------|---------|-------|
| `/versotech/login` | `/versotech_main/login` | Single login |
| `/versotech/staff` | `/versotech_main/dashboard` | CEO dashboard |
| `/versotech/staff/deals` | `/versotech_main/deals` | CEO only |
| `/versotech/staff/deals/[id]` | `/versotech_main/deals/[id]` | CEO only |
| `/versotech/staff/investors` | `/versotech_main/users?type=investor` | Consolidated |
| `/versotech/staff/investors/[id]` | `/versotech_main/users/[id]` | Type-aware |
| `/versotech/staff/arrangers` | `/versotech_main/users?type=arranger` | Consolidated |
| `/versotech/staff/introducers` | `/versotech_main/users?type=introducer` | Consolidated |
| `/versotech/staff/introducers/[id]` | `/versotech_main/users/[id]` | Type-aware |
| `/versotech/staff/approvals` | `/versotech_main/inbox?tab=approvals` | Merged |
| `/versotech/staff/messages` | `/versotech_main/inbox?tab=messages` | Merged |
| `/versotech/staff/fees` | `/versotech_main/fees` | CEO only |
| `/versotech/staff/kyc-review` | `/versotech_main/kyc-review` | CEO only |
| `/versotech/staff/versosign` | `/versotech_main/versosign` | All personas |
| `/versotech/staff/audit` | `/versotech_main/audit` | CEO only |
| `/versotech/staff/admin` | `/versotech_admin/dashboard` | Admin portal |

### Implementation Notes
- Redirects should be 301 (permanent) to update search engines
- Middleware handles redirect logic before route matching
- Query parameters preserved during redirect
- No redirect loops (verify all targets exist before enabling)

---

## 18. Acceptance Criteria (Definition of Done)

### Portal Structure

- [ ] `/versotech_main` exists and serves all deal-related personas
- [ ] `/versotech_admin` exists and is accessible only to admin roles
- [ ] `/versotech_admin` contains Processes feature (workflow automations)
- [ ] Legacy URLs (`/versoholdings/*`, `/versotech/*`) redirect cleanly with no loops
- [ ] Single login page works for all external personas

### Hybrid Users

- [ ] A user with multiple personas sees a persona switcher UI
- [ ] User can access each persona's experience without re-login
- [ ] Navigation updates dynamically based on active persona
- [ ] Default persona is determined correctly on first login

### Investor/Main UX Changes

- [ ] "Investment Opportunities" replaces "Active Deals" (nav + page titles)
- [ ] Data room is integrated within opportunity detail (no separate nav item)
- [ ] Journey bar exists and updates based on real data:
  - Interest → NDA → Data Room → Subscribe → Sign → Fund → Active
- [ ] Tasks + Notifications unified in header panel (bell icon near profile)
- [ ] Tasks/Notifications removed from sidebar
- [ ] "Reports" removed from nav, replaced with "Documents"
- [ ] Profile shows separate KYC and Compliance tabs
- [ ] Theme toggle works (light default, dark option)
- [ ] Theme preference persists per user

### Subscription Pack Workflow

- [ ] Subscription pack auto-generates when investor clicks "Invest" (NO draft step)
- [ ] Subscription pack supports multiple signatories (up to 10 signature blocks)
- [ ] All entity signatories are automatically identified for signature requests
- [ ] Pack goes directly to signing queue after generation

### NDA Handling

- [ ] One NDA per signatory (entity with 3 signatories = 3 NDAs)
- [ ] NDA uses entity address (not individual address)

### Data Room Access

- [ ] Entity-level access: ALL signatories must sign NDA before ANY entity user gets access
- [ ] Access correctly counts signatory signatures vs total signatory count
- [ ] Non-signatory entity users get access only after all signatories signed

### Stock Type & Company Separation

- [ ] `deals.stock_type` field exists and is used in deal creation
- [ ] `deals.vehicle_id` is required (NOT NULL)
- [ ] CEO can specify stock type when creating investment opportunity
- [ ] Stock type displayed in deal detail
- [ ] `companies` table exists (separate from vehicles)
- [ ] `vehicles.company_id` links vehicle to underlying company

### Terminology Updates

- [ ] "Utility Bill" replaced with "Proof of Address" in KYC
- [ ] "Investors" tab renamed to "Subscriptions" on vehicle detail page
- [ ] "Entity" (investment structures) renamed to "Vehicle" in relevant contexts

### Introducer Features

- [ ] Introducer cannot make introductions until fee agreement is signed
- [ ] UI blocks introduction with "Sign Agreement First" message
- [ ] API returns 403 if introducer tries to introduce without agreement

### Staff/CEO UX Changes

- [ ] Approvals and Messages merged into single "Inbox" surface
- [ ] Inbox has tabs: Messages | Approvals
- [ ] Users page consolidates: Investors | Arrangers | Introducers | Partners | Commercial Partners | Lawyers
- [ ] User type filter/tabs work correctly
- [ ] User detail page handles all user types

### Database & Security

- [ ] All new tables have RLS policies
- [ ] `companies`, `company_stakeholders`, `company_directors`, `company_valuations` tables exist
- [ ] KYC document types exclude NDA and DNC (investment documents, not KYC)
- [ ] Persona detection works via linking tables
- [ ] No data leakage between personas (verified via testing)

### Performance

- [ ] Page load times comparable to current portal (<2s for dashboard)
- [ ] No degradation in existing investor journey

---

**END OF PLAN**

This document is ready for client review. All phases are based on the user stories from Mobile V6 specifications and the existing codebase structure.
