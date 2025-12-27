# VERSOTECH Phase 2: Portal Restructuring Plan

## Goal

The goal is to write a 100% accurate plan end to end to make this vision.

## Client Vision

In my view, we should have:
(i) Admin portal: /versotech_admin only for admin stuff, CMS, SaaS management, growth marketing
(ii) Main portal: /versotech_main for deal management; CEO, Arranger, Investors, Introducers, Lawyers, Partners, Commercial Partners
(iii) We would need to be able to provide additional services to Arrangers, Introducers, Lawyers, Partners and Commercial Partners in the future

So, the main portal would be used for multiple persona. In the future, some services will be restricted to some persona only in the main portal.

In that case, we follow some of your key recommendations:
* No need to maintain 5x the code but 1 main portal and 1 admin portal
* Authentication, documents, signatures, messaging do not need to be duplicated but adjusted per persona in the main portal
* Hybrid users (user having several roles) would work
* Same login for all external users (Arranger, Investors, Introducers, Lawyers, Partners, Commercial Partners)
* Same login for all CEOs (we have different CEOs as of today depending on the type of investments: private equity, real estate, trading etc…). We could start with one CEO role to launch
* System detects their roles and routes them to the right experience within the same portal
* Investors see their vehicles, their investments, their investment opportunities, their documents, their KYC information, their compliance questionnaire, their available data room (prior to an investment after being invited and after an investment after having invested)
* Users as Arrangers see their mandates, fees, invoices and the associated fees agreements
* Users as Introducers see their referrals, fees, invoices and the associated fees agreements
* Users as Partner/ Commercial Partner see their clients and their respective investments, fees, invoices and the associated fees agreement
* Users as Lawyers see the investment opportunities they're assigned to and documents signed by other Users when the lawyer is the lawyer for the corresponding Investment opportunities
* Signing (Verso Sign) works for everyone for each role including for Hybrid users

---

## User Stories Reference

Claude code can find the User stories for the main portal under User_stories_Verso_Capital_mobile_V6 (1).xlsx

The Excel file contains the following sheets with user journeys:
- 0. Enablers
- 1.CEO
- 2.Arranger
- 3.Lawyer
- 4.Investor
- 5.Partner
- 6.Introducer
- 7.Commercial Partner

**IMPORTANT**: Claude code will need to extract the user journey from the excel file and read each journey for each user and then think about what changements are mentioned below.

### User Journey Summary (Extracted from Excel)

**0. Enablers (95 rows):** Digital Signature, Dataroom, SaaS B2C Subscription, Billing & Invoicing, Growth Marketing, KYC & AML, Content Management, Security

**1. CEO (228 rows):** User profiles (create/approve/manage investors, arrangers, lawyers, partners, commercial partners, introducers), Manage Opportunity (create, termsheet, dispatch, NDA & dataroom, subscription pack, funding, equity certificates, statement of holding), Reporting (transaction tracking, opportunity performance, client performance, partner/commercial partner/introducer performance, compartment reconciliation, conversion event, redemption event), Resell, GDPR

**2. Arranger (86 rows):** My Profile, My Partners (fee models, payment, view, performance), My Introducers (fee models, payment, view, performance), My Commercial Partners (fee models, payment, view, performance), My Lawyers, My Mandates (subscription pack, funding, compartment reporting), GDPR

**3. Lawyer (59 rows):** My Profile, My Notifications (subscription pack, escrow account funding, equity certificates, statement of holding, partner/introducer/commercial partner fees payment, payment to sellers), Escrow Account Handling (funding, partner/introducer/commercial partner fees payment, payment to sellers, redemption event), Reporting (transaction/compartment/redemption reconciliation), GDPR

**4. Investor (79 rows):** My Profile, My Opportunities (view, dataroom access, confirmation of interest, subscription pack, funding, equity certificates, statement of holding), My Investments (view transactions, transaction details, evolution, shareholding positions, performance, redemption event), My Notifications, My Investment Sales (resell), GDPR

**5. Partner (105 rows):** My Profile, My Opportunities as Investor (same as investor journey), My Investments, My Transactions as Partner (view, tracking, reporting, shared transactions), GDPR

**6. Introducer (114 rows):** My Profile, My Opportunities as Investor (same as investor journey), My Investments, My Introductions (view, introducer agreements, tracking, reporting), GDPR

**7. Commercial Partner (111 rows):** My Profile, My Opportunities (same as investor journey), My Investments, My Transactions as Commercial Partner (view, placement agreements, tracking, reporting), GDPR

---

## Investor Portal Changes

### Active Deals / Investment Opportunities
- We will take the data room and integrate it inside the active deals
- We do the same with the portfolio for the investment journey until the investment is active we then create a portfolio thing (record)
- We will make the active deals to the main investment Journey for the User that has access to this
- We need to rename the page into investment opportunities
- We have to have a journey bar that guides the partner and investor through the investor journey, this is important

### Tasks & Notifications
- We will combine the tasks to the notifications
- We will remove it from the side bar and add it near the profile on the top right of the screen
- In the tasks in the investor view we will give more context and categorize them a lil much better, by investment opportunity and sub category like for signatures
- When it comes to compliance update and all we will categorize it in a better way

### Documents
- We will get rid of reports and we will make it just documents

### Investor Profile
- We will have to change the tabs
- The entities is miss leading, but fine we will find a way around
- For the KYC & onboarding page we will split it into both the KYC tab and the compliance thing

---

## Staff Portal Changes (Now Part of Main Portal)

### Approvals & Messages
- We will take the approvals and we will merge it with messages

### Users Management
- We will merge the investors & the arrangers & the introducers into one page called users

---

## Portal Structure Summary

### Admin Portal (/versotech_admin)
- Admin stuff only
- CMS
- SaaS management
- Growth marketing

### Main Portal (/versotech_main)
All personas with role-based routing:
- CEO
- Arranger
- Investors
- Introducers
- Lawyers
- Partners
- Commercial Partners

---

## Key Architecture Principles

1. System detects user roles and routes them to the right experience within the same portal
2. Hybrid users (users having several roles) are supported
3. Same login for all external users
4. Same login for all CEOs (start with one CEO role)
5. Authentication, documents, signatures, messaging shared but adjusted per persona
6. Verso Sign works for everyone for each role including for Hybrid users

---

## Per-Persona Views

### Investors
- Their vehicles
- Their investments
- Their investment opportunities
- Their documents
- Their KYC information
- Their compliance questionnaire
- Their available data room (prior to an investment after being invited and after an investment after having invested)

### Arrangers
- Their mandates
- Fees
- Invoices
- Associated fees agreements

### Introducers
- Their referrals
- Fees
- Invoices
- Associated fees agreements

### Partners / Commercial Partners
- Their clients and their respective investments
- Fees
- Invoices
- Associated fees agreement

### Lawyers
- Investment opportunities they're assigned to
- Documents signed by other Users when the lawyer is the lawyer for the corresponding Investment opportunities

---

## UI / Theme Requirements

The client wants to default to the UI of the current investor portal with the blue and white color plate with the ability for the user to change to dark mode which will switch into the UI for the current staff portal.

---

## Instructions for Claude Code

### Database & Code Analysis Rules

For DB stuff Claude should use the MCP to Supabase to check. When analyzing Claude should not rely on docs or migrations but purely the code that is written to understand the repo.

### Implementation Steps

1. Read the User_stories_Verso_Capital_mobile_V6 (1).xlsx file
2. Extract each user journey for each role (CEO, Arranger, Lawyer, Investor, Partner, Introducer, Commercial Partner)
3. Understand the current user flows
4. Apply the changements mentioned above to plan the restructuring
5. Consider how the merging of Staff and Investor portal into one Main portal affects the codebase
6. Plan the UI/UX changes for:
   - Data room integration into active deals
   - Portfolio integration into investment journey
   - Tasks/notifications consolidation and relocation
   - Documents page simplification
   - Profile tabs restructuring
   - KYC and compliance split
   - Approvals and messages merge
   - Users page consolidation (investors + arrangers + introducers)
7. Ensure the journey bar for partners and investors through the investor journey is properly planned

---

# Phase 2 End-to-End Execution Plan (Repo-Accurate)

This section is the end-to-end Phase 2 plan grounded in:
- The actual repo code under `versotech-portal/src/*`
- The actual Supabase schema (checked via the Supabase MCP)
- The actual user stories in `User_stories_Verso_Capital_mobile_V6 (1).xlsx` (extracted into a generated markdown file)

## 0) Artifacts Generated From The Excel User Stories

To keep the plan 100% accurate and traceable back to the workbook:
- Extract script: `scripts/extract_user_stories_mobile_v6.py`
- Extract output (generated): `docs/important/user_stories_mobile_v6_extracted.md`

Regenerate at any time:

```bash
python scripts/extract_user_stories_mobile_v6.py
```

## 1) Current State (What Exists In Code Today)

### 1.1 Current Portal URL Structure (App Router)

The Next.js app currently has **two branded portals** in one codebase:

**Public entry points**
- `/` landing page links to `/versoholdings/login` and `/versotech/login`
- `/versoholdings/login` (investor) and `/versotech/login` (staff)
- `/versoholdings/set-password` and `/versotech/set-password` (invite flow)
- `/auth/callback` (invite/OAuth callback handling)
- `/sign/[token]` (Verso Sign token-based signing experience)

**Investor portal (authenticated) lives under** `/versoholdings/*`
- Pages include: dashboard, deals, deal details, data rooms, holdings/vehicles, tasks, notifications, messages, reports/documents, profile.
- Concrete routes from the repo:
  - `/versoholdings/dashboard`
  - `/versoholdings/deals`
  - `/versoholdings/deal/[id]`
  - `/versoholdings/data-rooms`
  - `/versoholdings/data-rooms/[dealId]` (this already contains a “deal + dataroom + subscription form” experience)
  - `/versoholdings/holdings`
  - `/versoholdings/vehicle/[id]`
  - `/versoholdings/tasks`
  - `/versoholdings/notifications`
  - `/versoholdings/messages`
  - `/versoholdings/reports` (contains “requests” + “documents” views)
  - `/versoholdings/documents` (redirects to reports?view=documents)
  - `/versoholdings/profile`

**Staff portal (authenticated) lives under** `/versotech/staff/*`
- Concrete routes from the repo include:
  - `/versotech/staff` (dashboard)
  - `/versotech/staff/messages`
  - `/versotech/staff/approvals`
  - `/versotech/staff/deals`, `/versotech/staff/deals/new`, `/versotech/staff/deals/[id]`
  - `/versotech/staff/investors`, `/versotech/staff/investors/[id]`
  - `/versotech/staff/arrangers`
  - `/versotech/staff/introducers`, `/versotech/staff/introducers/[id]`
  - `/versotech/staff/fees`
  - `/versotech/staff/kyc-review`
  - `/versotech/staff/requests` (+ analytics)
  - `/versotech/staff/reconciliation` (+ detail)
  - `/versotech/staff/subscriptions` (+ detail + vehicle summary)
  - `/versotech/staff/versosign`
  - `/versotech/staff/admin` (internal admin dashboard / metrics / staff management)

### 1.2 Current Auth + Role Model

**Auth provider**: Supabase (SSR client + middleware token refresh + server/client helpers).

**Single role (not hybrid)**: the app currently assumes exactly one role per user via `profiles.role`.

**DB-confirmed roles today** (Supabase MCP): `profiles.role` is `user_role` enum with values:
- `investor`
- `staff_admin`
- `staff_ops`
- `staff_rm`

**Enforcement today**
- `versotech-portal/src/middleware.ts`:
  - Redirects based on pathname prefix `/versoholdings` vs `/versotech`
  - Investor portal is allowed only for `profiles.role === 'investor'`
  - Staff portal is allowed only for `profiles.role in ['staff_admin','staff_ops','staff_rm']`
- `versotech-portal/src/components/layout/app-layout.tsx` repeats similar enforcement and sets theme based on “brand”.

### 1.3 Current Theme Model (Not User-Toggle)

The UI has two styles:
- Investor look (light, blue/white)
- Staff look (dark)

But theme selection is currently **hardwired**:
- `AppLayout` sets theme to `'light'` for investor brand and `'staff-dark'` for staff brand
- `ThemeProvider` applies the class but does not allow user toggling/persistence

### 1.4 Existing Data Model Building Blocks For Personas (DB-Checked)

**Investor ↔ User mapping exists**:
- `investor_users` links `profiles.id` → `investors.id` (used throughout investor portal code)

**Introducer ↔ User mapping partially exists**:
- `introducers` table contains a nullable `user_id` column (DB-checked), but the current staff UI doesn’t use it yet.

**Arranger ↔ User mapping does NOT exist yet**:
- `arranger_entities` exists, but has no `user_id` column (DB-checked), so an arranger cannot currently log in as an arranger persona without schema changes.

**Lawyer / Partner / Commercial Partner persona tables do not exist yet** (DB-checked via `information_schema` searches).

## 2) Target State (What Phase 2 Must Produce)

### 2.1 New Portal Structure

**Admin Portal**: `/versotech_admin`
- Scope: admin-only (CMS, SaaS management, growth marketing, internal operations dashboards)

**Main Portal**: `/versotech_main`
- Scope: deal management + shared services (auth, docs, messaging, signatures) across personas
- Personas (role-based routing + nav):
  - CEO
  - Arranger
  - Investor
  - Introducer
  - Lawyer
  - Partner
  - Commercial Partner
  - (Hybrid users: multiple roles on the same account)

### 2.2 UX Requirements From The Prompt

Investor/main portal UX changes required:
- Rename “Active Deals” → “Investment Opportunities”
- Integrate “Data Rooms” inside Investment Opportunities (remove separate nav surface)
- Integrate “Portfolio” into investment journey (only becomes “portfolio” when investment becomes active)
- Add a journey/progress bar for the investor journey (partners + investors)
- Merge Tasks into Notifications; remove from sidebar; move to top-right near profile
- Remove “Reports” and make it “Documents”
- Profile changes: split “KYC & onboarding” into separate KYC and Compliance tabs; revisit Entities tab naming

Staff/main portal UX changes required:
- Merge Approvals with Messages
- Merge Investors + Arrangers + Introducers management into one “Users” page

Theme requirement:
- Default to the current investor portal (light blue/white)
- Allow user toggle to dark mode that matches the current staff portal look

## 3) Non-Negotiable Architecture Principles (From The Vision)

1. System detects user roles and routes them to the right experience within the same portal
2. Hybrid users (multi-role) are supported
3. Same login for all external users (Arranger/Investor/Introducer/Lawyer/Partner/Commercial Partner)
4. Same login for all CEOs (start with one CEO role to launch)
5. Authentication, documents, signatures, messaging are shared (persona-adjusted, not duplicated)
6. Verso Sign works for everyone, including hybrid users

## 4) Proposed Target Information Architecture (Main Portal)

This is the recommended “single main portal” structure that supports hybrid users without duplicating pages.

### 4.1 Global (Shared) Surfaces In `/versotech_main`
- **Home/Dashboard**: role-aware landing dashboard (different widgets per persona)
- **Messages / Inbox**: unified inbox for messaging + approvals (staff/CEO), optionally tasks/notifications as tabs later
- **Notifications Center**: header panel combining tasks + notifications (investor/main requirement)
- **Documents**: unified document center (investor “documents”, staff document center, plus signed docs)
- **Profile**: shared profile with persona-aware tabs (KYC, Compliance, Entities, etc.)
- **Verso Sign**: shared signing experience + internal queue for staff/CEO, but also visible to any persona with signing tasks

### 4.2 Investor Journey Surfaces (Shared By Investor/Partner/Introducer/Commercial Partner)
- **Investment Opportunities** (renamed from Active Deals):
  - list view (was `/versoholdings/deals`)
  - detail view with journey bar + integrated data room + subscription pack submission (currently split between `/versoholdings/deal/[id]` and `/versoholdings/data-rooms/[dealId]`)
- **Investments / Portfolio**:
  - appears when investment becomes active (positions/subscriptions status)

### 4.3 Internal Deal Ops Surfaces (Staff / CEO)
- **Deal Management** (currently `/versotech/staff/deals`)
- **User/Counterparty Management** (new consolidated “Users” surface)
- **KYC Review / Approvals / Reconciliation / Fees / Requests** as role-restricted tools inside main portal

## 5) Key Implementation Decisions (To Meet Hybrid + Single-Portal Goals)

### 5.1 Persona Model (Hybrid Users)

Because `profiles.role` is currently a single enum, Phase 2 needs an additional “persona/roles” layer.

Recommended approach (minimizes breakage during migration):
- Keep `profiles.role` as the **legacy primary role** for compatibility while migrating.
- Add a new persona mapping layer that can return **multiple personas** per user:
  - Investor persona: derived from `investor_users` rows
  - Introducer persona: derived from `introducers.user_id`
  - Staff personas: derived from `profiles.role in staff_*`
  - Arranger persona: requires new mapping (see DB changes below)
  - Lawyer/Partner/Commercial Partner personas: new DB structures (see DB changes below)

In code, introduce a single source of truth function (server-side) such as:
- `getUserPersonas(userId)` → `{ personas: [...], defaultPersona: ..., scopes: ... }`

This becomes the basis for:
- Default landing route after login
- Navigation/feature gating
- Persona switcher UI for hybrid users

### 5.2 Portal Routing Strategy (Zero-Downtime Migration)

Do not “big bang” rename routes. Instead:
1. **Create** `/versotech_main/*` and `/versotech_admin/*` while keeping existing routes working.
2. Add redirects from old URLs to new ones (middleware or Next redirects).
3. Update in-app links/navigation to use new routes.
4. Once stable, deprecate old segments.

This avoids breaking bookmarked investor/staff URLs during transition.

## 6) Database Plan (Required For Multi-Persona Support)

### 6.1 Role & Persona Data Needs

To satisfy “hybrid users” and persona-specific services, the DB must represent:
- which personas a user has
- what entity scope that persona applies to (e.g., which investor_id, which introducer_id, which arranger_entity_id)

### 6.2 Minimal DB Changes To Unlock Phase 2

**A) Arranger login support (required)**
- Add mapping table (recommended) `arranger_users (user_id uuid, arranger_entity_id uuid, created_at, ...)`
  - This is consistent with the existing `investor_users` concept.

**B) Extend introducer portal support (optional but aligns with vision)**
- Start actually using `introducers.user_id` (already exists) to map logged-in users to introducer entity records.

**C) New persona tables (future, but required by the vision)**
- Partner & Commercial Partner: new tables + user mapping tables
- Lawyer: new table + deal assignment table (or reuse deal membership patterns) + user mapping

**D) Long-term improvement (post Phase 2)**
- Replace single `profiles.role` enforcement with the persona layer once stable.

## 7) Concrete Work Breakdown (Phased)

### Phase 2.0 — Foundations (Portal Skeleton + Auth + Theme Toggle)

Deliverables:
- `/versotech_main/login` (single login for all main portal users; investor-styled by default)
- `/versotech_admin/login` (admin-only entry)
- Shared main portal layout that supports:
  - theme toggle (light ↔ staff-dark) stored per user/device
  - header notification center (placeholder)
  - persona switcher (placeholder for hybrid accounts)

Code impact areas (current files):
- `versotech-portal/src/middleware.ts` (new portal prefixes + role checks)
- `versotech-portal/src/lib/auth.ts` and `versotech-portal/src/lib/auth-client.ts` (expand to persona-aware model)
- `versotech-portal/src/app/api/auth/signin/route.ts` (accept portal=main/admin; compute redirect based on personas)
- `versotech-portal/src/app/auth/callback/page.tsx` + `versotech-portal/src/components/auth-handler.tsx` (redirect based on persona, not brand)
- `versotech-portal/src/components/theme-provider.tsx` (user-toggle + persistence)
- `versotech-portal/src/components/layout/app-layout.tsx`, `.../sidebar.tsx`, `.../user-menu.tsx` (remove hard “brand=investor vs staff” coupling)

### Phase 2.1 — Main Portal: Investor Journey Restructure

Deliverables:
- Investment Opportunities (rename + nav + URL)
- Integrated data room inside opportunity detail (remove separate “Data Rooms” nav)
- Journey bar for investor journey on opportunity detail
- Portfolio shown as part of the journey; becomes an “Investments” area when active

Implementation notes grounded in existing code:
- Today there are two overlapping deal surfaces:
  - `/versoholdings/deal/[id]` (deal detail)
  - `/versoholdings/data-rooms/[dealId]` (deal + documents + subscription form)
- Phase 2 should consolidate into one opportunity detail with tabs/sections:
  - Overview
  - Data room (documents)
  - Subscription pack / allocation request
  - Timeline / progress (journey bar)

Journey bar data sources (already present in code and DB):
- `investor_deal_interest` (interest signal)
- `deal_data_room_access` (NDA/data room access state)
- `deal_subscription_submissions` (subscription pack submission status)
- `allocations` (allocation approved)
- `tasks` (signature/funding/compliance tasks)
- `documents` (pack, certificates, statements)

### Phase 2.2 — Tasks + Notifications Consolidation (Header Experience)

Deliverables:
- Remove “Tasks” and “Notifications” from the sidebar for investor/main portal users
- Add a header icon (next to profile) opening a unified panel that contains:
  - tasks (from `tasks`)
  - notifications (from `investor_notifications`)
- Group items by:
  - investment opportunity (deal_id) when relevant
  - compliance category (KYC/compliance/signatures/funding/etc)

Grounding:
- Tasks UI currently lives at `/versoholdings/tasks` and already categorizes by category + related_entity.
- Notifications UI currently lives at `/versoholdings/notifications` and reads `investor_notifications`.
- Notification counts already exist in `/api/notifications/counts`.

### Phase 2.3 — Documents Surface Simplification

Deliverables:
- Replace “Reports” with “Documents” in investor navigation.
- Keep “Requests” functionality, but relocate it:
  - either as a tab inside Documents, or
  - as a separate “Requests” page accessible from Documents.

Grounding:
- Investor “Reports” currently is `ReportsPageClient` fed by `request_tickets` + `loadInvestorDocuments(...)`.
- `/versoholdings/documents` already redirects to reports?view=documents.

### Phase 2.4 — Profile Tabs Restructure (KYC vs Compliance Split)

Deliverables:
- Split “KYC & Onboarding” into:
  - **KYC** tab (identity / documents / onboarding forms)
  - **Compliance** tab (questionnaire + ongoing compliance updates)
- Keep Entities but rename or add helper text to reduce confusion (as per requirement).

Grounding:
- This is implemented in `versotech-portal/src/components/profile/profile-page-client.tsx` today.

### Phase 2.5 — Staff Tools Become Part Of Main Portal

Deliverables:
- Merge approvals into messages:
  - “Inbox” with tabs: Messages + Approvals (and optionally Requests)
- Consolidate Investors + Arrangers + Introducers management into one “Users” page:
  - one surface with type filter/tabs, reusing existing pages’ components/data shapes.

Grounding:
- Staff messages uses `MessagingClient` at `/versotech/staff/messages`.
- Approvals uses `ApprovalsPageClient` at `/versotech/staff/approvals`.
- Investors/Arrangers/Introducers are separate staff pages today with separate entity models.

### Phase 2.6 — Admin Portal Carve-Out (Initial Slice)

Deliverables:
- Move or duplicate the existing internal “admin dashboard” (`/versotech/staff/admin`) into `/versotech_admin` as the initial admin portal nucleus.
- Gate `/versotech_admin` to admin-level roles only (initially `staff_admin`, later a dedicated admin persona).

## 8) Acceptance Criteria (What “Done” Means)

### Portal Structure
- `/versotech_main` exists and is the default home for all deal-related personas.
- `/versotech_admin` exists and is accessible only to admin roles.
- Legacy URLs (`/versoholdings/*`, `/versotech/*`) redirect cleanly to the new structure (no loops).

### Hybrid Users
- A user with multiple personas can:
  - see a persona switcher (or equivalent) and
  - access the correct experience for each persona without a second login.

### Investor/Main UX Changes
- “Investment Opportunities” replaces “Active Deals” and includes data room integrated in the opportunity flow.
- Journey bar exists for investor journey and updates based on real data.
- Tasks + notifications are unified in a top-right panel; removed from sidebar.
- “Reports” is removed from nav and replaced with “Documents”.
- Profile splits KYC vs Compliance.

### Staff/Main UX Changes
- Approvals and messages are merged in one surface.
- Investors + Arrangers + Introducers management is consolidated into “Users”.
