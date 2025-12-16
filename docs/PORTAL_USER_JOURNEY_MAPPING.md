# Portal User Journey Mapping (Client XLSX → Current Platform)

**Sources**
- `User_stories_Verso_Capital_web_V2.xlsx` (WEB ADMIN / Superadmin stories)
- `User_stories_Verso_Capital_mobile_V6 (1).xlsx` (personas: CEO, Arranger, Lawyer, Investor, Partner, Introducer, Commercial Partner + Enablers)
- Current codebase: `versotech-portal/src/app/*` (Next.js App Router) + `supabase/migrations/*` (schema/RLS)

**Goal**
Find the “common ground” between the client’s original multi-persona (mobile-first) story set and what exists today (Investor + Staff portals), then outline how to expand to full end-to-end coverage without rebuilding everything.

---

## 1) Current Platform Reality (What Exists in Code)

### 1.1 Portal Surfaces (routes)

**Public / Auth**
- `/` (landing; entry links to investor + staff)
- `/versoholdings/login`, `/versoholdings/set-password`
- `/versotech/login`, `/versotech/set-password`
- `/auth/callback` (invite/magic-link handling + profile bootstrap + portal redirect)
- `/sign/[token]` (+ `/success`) (signature flow)

**Investor portal (VersoHoldings)**
- `/versoholdings/dashboard`
- `/versoholdings/deals`, `/versoholdings/deal/[id]`
- `/versoholdings/data-rooms`, `/versoholdings/data-rooms/[dealId]`
- `/versoholdings/holdings`, `/versoholdings/vehicle/[id]`
- `/versoholdings/tasks`, `/versoholdings/messages`, `/versoholdings/notifications`
- `/versoholdings/reports`, `/versoholdings/calendar`, `/versoholdings/documents`

**Staff portal (VersoTech)**
- `/versotech/staff` (ops dashboard)
- `/versotech/staff/deals`, `/versotech/staff/deals/new`, `/versotech/staff/deals/[id]`
- `/versotech/staff/investors`, `/versotech/staff/entities`
- `/versotech/staff/kyc-review`, `/versotech/staff/approvals`
- `/versotech/staff/documents`, `/versotech/staff/versosign`
- `/versotech/staff/fees`, `/versotech/staff/reconciliation`
- `/versotech/staff/introducers`, `/versotech/staff/arrangers`
- `/versotech/staff/requests`, `/versotech/staff/processes`, `/versotech/staff/audit`, `/versotech/staff/calendar`
- `/versotech/staff/admin` (super-admin, permission-gated)

### 1.2 Identity & Access Model (today)

**Coarse portal gating**
- `profiles.role` enum: `investor | staff_admin | staff_ops | staff_rm`
- Middleware gates:
  - `/versoholdings/*` requires `profiles.role === 'investor'`
  - `/versotech/*` requires role in `staff_*`
- Fine-grained staff-only controls via `staff_permissions` (e.g., `super_admin` shows the Admin nav)

**Important “common ground” primitive already in the schema**
- `deal_memberships.role` enum (`deal_member_role`) includes:
  - `investor`, `co_investor`, `spouse`, `advisor`, `lawyer`, `banker`, `introducer`, `viewer`, `verso_staff`
- RLS for `deals`, `documents`, `conversations` already grants access via `deal_memberships` (deal-scoped collaboration).

This is the bridge between the original multi-persona product vision and the current investor/staff portal reality.

---

## 2) Personas in the XLSX (What the Client Originally Wanted)

### 2.1 Mobile workbook persona “feature clusters” (high level)

From `User_stories_Verso_Capital_mobile_V6 (1).xlsx` (normalized):

- **CEO**
  - `Manage Opportunity`, `User profiles`, `Reporting`, `GDPR`, `Resell`
- **Arranger**
  - `My Mandates`, `My Partners`, `My Introducers`, `My Commercial Partners`, `My Lawyers`, `User invitation`, `My Profile`, `GDPR`
- **Lawyer**
  - `Escrow Account Handling`, `My Notifications`, `My Profile`, `Reporting`, `GDPR`
- **Investor**
  - `My opportunities`, `My Investments`, `My Investment Sales`, `My Notifications`, `My profile`, `GDPR`
- **Partner / Commercial Partner**
  - `My Transactions`, `My opportunities as investor`, `My Investments`, `My Investment Sales`, `My profile`, `User invitation`, `GDPR`
- **Introducer**
  - `My Introductions`, `My opportunities as investor`, `My Investments`, `My Investment Sales`, `My profile`, `User invitation`, `GDPR`
- **Enablers**
  - `Dataroom`, `Digital Signature`, `KYC & AML`, `Content management`, `Billing & Invoicing`, `SaaS subscription`, `Security`, `Growth marketing`

### 2.2 Web workbook (Superadmin) epic set

`User_stories_Verso_Capital_web_V2.xlsx` is essentially the “back-office superadmin console”:
- Dashboard + reporting export
- Login/reset password
- User management (roles, invite links, blacklist/whitelist)
- Opportunity management (create/edit, term sheets, dispatch, subscription packs, monitor funding, archive)
- Data management (templates, dataroom folders/files, download extracts)
- Notifications + GDPR handling
- Account management + billing/invoicing + account reporting

---

## 3) Mapping: XLSX Personas → Current Portals (As-Is)

### 3.1 What maps cleanly today

**Superadmin (Web) → Staff portal**
- Closest match: `staff_admin` + `staff_permissions.super_admin`
- Existing surfaces:
  - `/versotech/staff/admin` (staff mgmt, user mgmt, exports, monitoring)
  - `/versotech/staff/deals/*`, `/versotech/staff/documents`, `/versotech/staff/approvals`
  - `/versotech/staff/fees`, `/versotech/staff/reconciliation`, `/versotech/staff/audit`

**CEO (Mobile) → Staff portal**
- Closest match: `staff_admin` or `staff_rm` depending on responsibilities.
- “Manage Opportunity” is already strongly represented by:
  - deals lifecycle + membership + data rooms + fee plans + share lots inventory
  - approvals, subscription submissions, workflows, documents, signatures, fees/invoices, reconciliation

**Investor (Mobile) → Investor portal**
- Closest match: `profiles.role = investor` + `investor_users` link(s).
- Key coverage:
  - opportunities: `/versoholdings/deals`, `/versoholdings/deal/[id]`
  - portfolio: `/versoholdings/dashboard`, `/versoholdings/holdings`, `/versoholdings/vehicle/[id]`
  - data rooms: `/versoholdings/data-rooms*`
  - tasks/messages/notifications/profile: present

### 3.2 Where the “common ground” exists but UX is incomplete

**Lawyer / Introducer / Spouse / Banker / Advisor**
- The database already models these as `deal_member_role` and RLS already allows deal-scoped access.
- The *UI*, however, is still “investor-entity-first” in many places:
  - Investor pages often require `investor_users` linkage even when the underlying deal access is via `deal_memberships`.
  - Example: `/versoholdings/deals` and `/versoholdings/deal/[id]` gate early on investor linkage.

So: the platform can already support these personas as deal participants at the data layer, but not yet as a first-class portal UX.

### 3.3 What is currently staff-only (blocks external partner portals)

**Introducer / commissions / introductions**
- Tables exist: `introducers`, `introductions`, `introducer_commissions`
- But RLS is staff-only for `introductions` and `introducer_commissions` in baseline.
- Staff UX exists: `/versotech/staff/introducers` + commissions in `/versotech/staff/fees`.
- External Introducer Portal is explicitly described as “future feature” in `docs/staff/Introducers_PRD.md`.

---

## 4) End-to-End Journeys (Practical “How it works” today)

These flows are already documented and largely implemented:
- `docs/Investor_Interest_Workflow.md`
- `docs/investment-workflow-diagrams.md`

### 4.1 Investor end-to-end (today)
1. Staff creates deal → publishes fee structure → uploads dataroom docs → invites investor
2. Investor logs in → sees deal → submits interest
3. Staff reviews interest (Approvals) → if approved, NDA/signature task triggered
4. After NDA completion → dataroom access granted (timeboxed; extension request path exists)
5. Investor submits subscription → staff reviews/approves → pack generation + e-sign → commitment confirmed
6. Fee events/invoice generation → payment ingestion/reconciliation
7. Investor sees holdings/performance + documents + tasks/notifications

### 4.2 Staff end-to-end (today)
1. Create/maintain deals and membership (including deal-scoped participant roles)
2. Review interest/subscription/approvals queue
3. Run workflows (n8n integration points exist) + document/VersoSign operations
4. Manage introducers/arrangers + commission/invoicing/reconciliation
5. Audit logging + exports/monitoring (admin surfaces)

---

## 5) Gap Map (XLSX → “What’s missing”)

### 5.1 Biggest structural gap: “External non-investor personas”

The original story set includes external users who are not “portfolio investors” (or are hybrid):
- Lawyer, Introducer, Partner, Commercial Partner, Arranger (depending on definition)

**Common-ground approach:** treat them as **deal-scoped participants first**, and only add cross-deal financial/commission views when needed.

Practical gaps to close:
- A dedicated “Deal Participant” UX (list my invited deals, documents, tasks, messages, signatures).
- Relax investor portal assumptions that all users have `investor_users` links.
- Add RLS + APIs for introducers to self-view introductions/commissions (if you want a true introducer portal).

### 5.2 GDPR / consent management
Spreadsheets include GDPR-heavy requirements; current implementation appears partial and mostly not exposed as a complete operational UX (export/delete/consent management, breach notifications).

### 5.3 Content management / marketing / SaaS billing
The Enablers set includes SaaS subscription + growth marketing + CMS. Current platform has strong “fees/invoices for deals” but not a full “B2B SaaS account management” product surface.

---

## 6) Recommended Expansion Strategy (Low-risk, High reuse)

### Phase A — Make “Deal Participant Portal” a first-class concept (fastest common ground)
Target personas: **Lawyer, Spouse, Banker, Advisor, Introducer-as-participant**

Deliverables:
- “My Deals” list driven by `deal_memberships.user_id = auth.uid()`
- Deal detail view that works without `investor_users`
- Messages/tasks/notifications already support user-scoped operation (good reuse)
- Signature flow already token-based (`/sign/[token]`)

Result: you satisfy most of the original multi-persona need (people collaborating on a deal) without building 5 separate portals.

**Implementation checklist (app-level)**
- Add a server-side “external context” fetch (investorIds? introducerId? deal membership roles?) and derive capabilities.
- Make the external sidebar dynamic:
  - If `investorIds.length > 0`: show full investor nav (portfolio/holdings/reports/etc).
  - Else: show deal-participant nav (deals/messages/tasks/profile; optionally hide holdings/reports).
- Update investor-facing deal pages to not hard-require `investor_users` when access is via `deal_memberships`.
- Decide how due-diligence docs should work for participants:
  - Today, `deal_data_room_documents` RLS is investor-access-table based (`deal_data_room_access` via `investor_users`) and does **not** include deal participants.
  - `documents` / `document_versions` RLS **does** allow deal-based access via `deal_memberships` (`user_has_deal_access(deal_id)`).
  - Pick one: extend dataroom RLS for participants, or use the primary `documents` system for deal participant documents.

### Phase B — Introducer portal (self-serve) if needed
Target persona: **Introducer / Partner / Commercial Partner** (as a distribution partner)

Deliverables:
- Add self RLS policies for introducers to view their own:
  - `introductions`
  - `introducer_commissions`
- Add “Introductions” + “Commissions” pages in the external portal
- Optional: allow introducers to create an introduction (or request one) → staff approval workflow

**Implementation checklist (DB-level)**
- Extend RLS on `introductions` / `introducer_commissions` to allow `introducers.user_id = auth.uid()` ownership-based reads (and possibly inserts).
- Add API endpoints that query with RLS (no service role) for introducer self views.

### Phase C — Role/context switching (for hybrid users)
Some stories explicitly say “opportunities as investor even if I’m introducer/partner”.

Deliverables:
- A “context switcher” in the external portal header:
  - Investor context (portfolio/holdings)
  - Introducer context (introductions/commissions)
  - Deal participant context (deal-only)

This avoids forcing a single `profiles.role` to represent a user’s full identity.

---

## 7) Key Takeaway (Common Ground)

The old mobile spec is multi-persona; the current platform is dual-portal (Investor + Staff).

The **bridging mechanism already exists in the database and staff UX**:
- `deal_memberships` + `deal_member_role` (lawyer/banker/introducer/spouse/etc)
- workflow + docs + signatures + tasks/notifications

So the most efficient path to “end-to-end expansion” is:
1) **Formalize deal-scoped participant UX**, then
2) **Add partner/introducer financial views** only if the business truly needs them.

---

## 8) Target-State Architecture (Recommended)

### 8.1 Keep the platform as one Next.js app, but treat “portals” as contexts

**Today**
- Portal is primarily derived from `profiles.role`:
  - `investor` → `/versoholdings/*`
  - `staff_*` → `/versotech/*`

**Recommended**
- Keep staff portal as-is.
- Evolve `/versoholdings/*` from “Investor Portal” into a broader **External Portal**, where pages/nav are driven by *capabilities* (links + memberships), not only investor entity linkage.

### 8.2 External Portal contexts (capability-driven)

For a given `profiles.id = userId`, derive:
- `investorIds` via `investor_users` (portfolio investor context)
- `introducerId` via `introducers.user_id = userId` (distribution partner context)
- `dealMemberRoles` via `deal_memberships.user_id = userId` (deal participant context)

Then define contexts:
- **Investor context** (portfolio-focused)
  - condition: `investorIds.length > 0`
  - pages: dashboard/holdings/vehicle/reports + deals/data rooms/tasks/messages/notifications/profile
- **Deal participant context** (deal-scoped)
  - condition: `dealMemberRoles.length > 0` (even if no `investorIds`)
  - pages: deals (invited only), deal documents, tasks, messages, signatures, profile
- **Introducer context** (partner network + commissions)
  - condition: `introducerId != null`
  - pages: introductions, commission ledger, “invite investor”, plus deal participant pages as applicable

This directly matches the mobile XLSX reality where users can be hybrids (e.g., “investor + introducer”).

### 8.3 Data access implications

To support the above contexts cleanly:
- Keep `deal_memberships` as the canonical “who can see this deal”.
- Prefer the primary `documents` system for deal participant document access (already membership-aware via RLS through `user_has_deal_access(deal_id)`).
- If you need true “dataroom” for non-investor participants, extend `deal_data_room_documents` access rules to include deal participants (policy/table change).
