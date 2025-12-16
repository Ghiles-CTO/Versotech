# Phase 2 Plan Review Addendum (Synthesis of `docs/planning/*`)

Date: 2025-12-16

This document is an addendum to the existing Phase 2 plans. It does **not** replace or modify any existing plan file. It consolidates what's in `docs/planning/*`, highlights corrections and missing considerations, and proposes concrete refinements needed to make the overall plan \"perfect\" before implementation.

---

## 1) Reviewed Files (Full Coverage)

- `docs/planning/plan_next_phase.md`
- `docs/planning/phase2_executive_summary.md`
- `docs/planning/phase2_technical_plan.md`
- `docs/planning/GAP_ANALYSIS_REPORT.md`
- `docs/planning/COMPLETE_FEATURE_MAPPING.md`
- `docs/planning/user_stories_mobile_v6_extracted.md`

---

## 2) High-Confidence Facts The Plans Agree On

### 2.1 Target Product Structure

- **Main Portal**: `/versotech_main` (deal lifecycle + shared services for multiple personas)
- **Admin Portal**: `/versotech_admin` (CMS + SaaS mgmt + growth marketing + internal controls)
- **Single login** for all external personas; **hybrid users** supported.

### 2.2 Required Investor/Main UX Changes (explicitly repeated across plans)

- Rename \"Active Deals\" -> \"Investment Opportunities\"
- Integrate Data Room into the investment opportunity flow
- Create an investor journey/progress bar
- Combine Tasks + Notifications and move to header (remove sidebar items)
- Replace \"Reports\" with \"Documents\"
- Profile restructure: split KYC vs Compliance; improve \"Entities\" wording
- Staff: merge Approvals + Messages; consolidate user management into one \"Users\" area
- Theme: default investor light; allow dark mode (staff look) + (recommended) system preference

---

## 3) Key Corrections / New Insights From `docs/planning/*` (Not Fully Reflected In The Current Plan)

### 3.1 The Most Important Architectural Insight: Multi-Persona Deal Access Already Exists (DB-Level)

Both `docs/planning/GAP_ANALYSIS_REPORT.md` and `docs/planning/COMPLETE_FEATURE_MAPPING.md` highlight a critical point:
- The database already models multi-persona collaboration **per deal** via `deal_memberships.role` (enum `deal_member_role`).

DB-confirmed enum values (via Supabase MCP, not just docs):
- `investor`, `co_investor`, `spouse`, `advisor`, `lawyer`, `banker`, `introducer`, `viewer`, `verso_staff`

Implication:
- You can enable lawyers/advisors/bankers/spouses to see deals they're assigned to **without** first building a brand-new \"lawyer system\" (tables/dashboards).

### 3.2 The Actual Blocker Is The UI (Not The DB)

The plans correctly identify the current blocker:
- The investor portal UI currently assumes an external user must have an `investor_users` link; if not, pages block/redirect.

Concrete example (verified in code, not just docs):
- `versotech-portal/src/app/(investor)/versoholdings/deals/page.tsx` requires `investor_users` linkage (as referenced in the reports).

### 3.3 \"Participant Route Group\" Is The Lowest-Risk Unlock

`docs/planning/COMPLETE_FEATURE_MAPPING.md` recommends:
- Create a new external route group (example given: `/versoholdings/participant/*`) to serve non-investor participants by querying `deal_memberships` instead of `investor_users`.

Why this matters for Phase 2:
- It unlocks \"multi-persona external access\" early **without breaking existing investor flows**.

This approach is missing from `docs/planning/plan_next_phase.md` and should be incorporated as an explicit Phase 2 deliverable (even if the final URL becomes `/versotech_main/...`).

### 3.4 \"Data Room Access For Non-Investors\" Is Not Just UI - It's Also RLS

`docs/planning/GAP_ANALYSIS_REPORT.md` correctly flags \"Dataroom for non-investors\" as needing access-rule changes.

DB-confirmed nuance (via Supabase MCP):
- `deal_data_room_documents` SELECT policy requires:
  - investor visibility (`visible_to_investors = true`) **and**
  - an *active* `deal_data_room_access` row joined through `investor_users`
  - OR staff role
- `deal_data_room_access` SELECT policy similarly relies on `investor_users` (or staff).

Implication:
- A non-investor deal participant (e.g., `deal_memberships.role='lawyer'`) can access the **deal record** (RLS already allows it), but **cannot access data room documents** unless you:
  - add/extend RLS policies for participant roles, or
  - introduce a participant-access table, or
  - move \"shared deal documents\" into a table whose policies already permit membership-based access.

This must be explicitly decided and designed before implementation.

### 3.5 \"Introducer Self-Service\" Is Not Fully DB-Ready Yet (RLS Gap)

`docs/planning/COMPLETE_FEATURE_MAPPING.md` calls introducer self-service \"database-ready\". That's partially true:
- `introducers` supports self SELECT by `user_id` (policy exists).

But DB-confirmed via Supabase MCP:
- `introductions` and `introducer_commissions` are currently **staff-only** (no self SELECT policies).

Implication:
- Introducer self-service requires **RLS policy work** (or a secure read API pattern) before any UI can be safely shipped.

### 3.6 Known Broken Pieces Should Be Treated As Phase 0 (Credibility + Avoid Multiplying Bugs)

Both `docs/planning/GAP_ANALYSIS_REPORT.md` and `docs/planning/COMPLETE_FEATURE_MAPPING.md` list \"broken pieces\" that will actively undermine Phase 2 if left unfixed:

Verified examples:
- `/api/deals/[id]/members/route.ts` sends notification links to `/versoholdings/deals/${dealId}` but the detail route is `/versoholdings/deal/[id]` (singular).
- Term sheet download button exists but has no handler.
- Investor \"report requests / statements\" flow references `/api/report-requests` which does not exist.
- Invite-links exist on the backend but there is no `/invite/[token]` page handling acceptance.
- Scheduled reminders cron has TODOs (invoice creation/reminders not implemented).
- Profile lock/deactivation exists via `profiles.deleted_at` but is not enforced in middleware/auth.

These are not \"nice to have\" - they are risk multipliers during restructuring.

### 3.7 Feature Completion Reality Check (Sets Expectations + Scope Boundaries)

`docs/planning/COMPLETE_FEATURE_MAPPING.md` provides a corrected completion assessment:
- **29% fully built**, **11% partial/database-ready**, **60% not built** (of mapped sub-features).

The plan should explicitly separate:
- Phase 2 \"portal restructuring\" (information architecture + UX changes + multi-persona access unlocks)
vs
- \"full Excel vision delivery\" (GDPR module, escrow workflows, conversion/redemption events, secondary sales, SaaS billing, etc.)

---

## 4) Proposed Refinement: Make The Phase Sequence Explicit And Non-Conflicting

The best parts of `docs/planning/phase2_executive_summary.md`, `docs/planning/phase2_technical_plan.md`, and `docs/planning/GAP_ANALYSIS_REPORT.md` can be combined into a single coherent sequence:

### Phase 0 - Stabilize & Remove Known Breakage (Required)

Goal: eliminate existing breakpoints that will otherwise \"leak\" into the new portal.

Minimum scope:
- Fix deal invite notification URL mismatch.
- Implement or remove non-functional UI actions (term sheet download, report requests).
- Add invite-link acceptance page (or remove the feature).
- Enforce `profiles.deleted_at` lock in auth/middleware.
- Decide how external participants access \"deal documents\" vs \"data room documents\" (RLS-sensitive).

### Phase 1 - Investor/Main UX Quick Wins (No DB Changes)

Goal: deliver visible improvements with minimal risk.

Includes (matches the prompt + exec/technical plans):
- Journey bar
- Header notification center (tasks + notifications)
- Rename deals -> investment opportunities
- Data room embedded in opportunity flow (investor)
- Documents nav simplification
- Profile tab split (KYC vs Compliance)
- Theme preference: light/dark/system (persisted)

### Phase 1b - Enable External Deal Participants (Lawyer/Advisor/Banker/Spouse) (Minimal DB Changes)

Goal: unlock multi-persona access *fast* by leveraging `deal_memberships`.

Two design options (must be decided upfront):
- **Option A (lower code churn, more URL surfaces):** new route group (e.g., `/versotech_main/participant/*`) that lists deals via `deal_memberships` and shows deal-level documents/messages/tasks.
- **Option B (one external portal):** refactor existing external pages to support either:
  - investor-linked access (current), OR
  - membership-only access (participant), with persona-aware navigation.

Critical decision: whether participants need \"data room\" docs (RLS change) or just \"deal docs\" (potentially already covered via `documents` policies).

### Phase 2 - Introducer Self-Service (RLS + UI)

Goal: introducers can log in, see introductions and commissions.

Prereqs:
- Add safe read access (RLS policies or carefully scoped server APIs) for:
  - `introductions` (filtered by introducer.user_id)
  - `introducer_commissions` (joined to introducer-owned introductions)

### Phase 3 - Certificates & Statements of Holding (Close Existing Gaps)

This is explicitly called out as \"PARTIAL\" with broken investor self-serve. Complete it before larger replatforming.

### Phase 4 - Corporate Events (Conversion/Redemption) + GDPR

These are major Excel vision items and should be treated as separate projects with dedicated data models and workflows.

### Phase 5 - Route Unification To `/versotech_main` + Admin Portal Carve-Out

Once the external experience is stable:
- introduce `/versotech_main` as the canonical path
- add redirects from legacy paths
- move admin features to `/versotech_admin`

---

## 5) Specific Plan Gaps To Close (Actionable Before Any Implementation)

1. **Explicitly decide how \"deal participant access\" works**
   - Which personas are \"participants\" vs \"investors\" vs \"introducers\" in v1?
   - Which surfaces do participants see (deals list, docs, signatures, messages)?
   - Do they need pre-investment data room docs? If yes: define RLS changes.

2. **Clarify arranger login path**
   - Current DB has `arranger_entities` but no user linkage.
   - The technical plan suggests `arranger_entities.user_id`, but that only supports one user per entity.
   - If an arranger firm needs multiple users, a junction table (e.g., `arranger_users`) is more future-proof.

3. **Clarify \"Admin Portal\" scope vs what actually exists**
   - CMS / growth marketing / SaaS billing are largely NOT BUILT per the mapping.
   - Phase 2 should treat `/versotech_admin` as:
     - relocation of existing admin dashboard features first,
     - placeholders for future CMS/marketing/SaaS next.

4. **Add a \"Phase 0\" stabilization gate**
   - If Phase 0 is skipped, you will ship broken links into the new IA, then have to debug in two places.

---

## 6) Consolidated Open Questions (From The Existing Plans)

1. CEO persona: separate UI/dashboard or same screens with permissions?
2. Lawyer access: view-only vs ability to upload/approve/edit?
3. Which external persona is urgent first: lawyers (deal access) vs introducers (commissions)?
4. Do you need partner/commercial partner as distinct entities immediately, or can they be modeled as introducers in v1?
5. Markets served: EU GDPR urgency?
6. Do external participants need \"data room\" docs, or only \"deal docs\" + \"signed docs\"?

---

## 7) Recommendation Summary (What To Change In The \"Perfect Plan\")

If we want the plan to be implementation-ready and low-risk:
- Add **Phase 0** stabilization (broken links, missing endpoints, lock enforcement).
- Add an explicit **Phase 1b** for \"deal participant access\" using `deal_memberships` + a routing strategy (route group vs refactor).
- Treat introducer self-service as **Phase 2** with explicit RLS work (not just UI).
- Defer heavy \"new persona tables\" (partners/commercial partners/lawyers) until there is a confirmed need beyond what `deal_memberships` already provides.
- Keep `/versotech_main` as the **final canonical** URL, but don't force a big-bang route rewrite before the experience is stable.
