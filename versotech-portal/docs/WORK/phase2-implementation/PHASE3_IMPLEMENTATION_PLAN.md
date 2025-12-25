# Phase 3 Implementation Plan (Investor Journey Restructure)

**Based on:** `docs/WORK/PHASE2_BASE_PLAN.md` + current Phase 2 implementation state

---

## Nontechnical Goal (Plain English)
Phase 3 makes investing feel simple and transparent. Investors can open an opportunity, review everything, sign what’s needed, invest, and track their progress in one place. No more jumping between multiple pages or unclear status.

---

## Technical Goal
Deliver the full investor journey experience inside `/versotech_main/*`:
- Real opportunities list + opportunity detail page
- Integrated data room inside opportunity detail
- 10-stage journey bar with optional/required stage logic
- Direct subscribe support (skips early optional stages)
- Multi-signatory NDA + subscription pack flows
- Correct subscription pack generation (no draft step)

---

## Current State (from Phase 1 + Phase 2)
- Unified portal exists (`/versotech_main/*`) and is persona-aware
- `get_investor_journey_stage(deal_id, investor_id)` exists and returns 10 stages
- Journey columns exist on `deal_memberships`:
  - `dispatched_at`, `viewed_at`, `interest_confirmed_at`, `nda_signed_at`, `data_room_granted_at`
- Subscription stage columns exist on `subscriptions`:
  - `pack_generated_at`, `pack_sent_at`, `signed_at`, `funded_at`, `activated_at`
- Data room access table exists: `deal_data_room_access`
- Investor APIs already exist under `/api/investors/me/*` (profile, portfolio, documents, members, etc.); opportunity-specific endpoints are missing
- Signatory source is `investor_members.role` (text, no DB constraint); code uses `authorized_signatory` as the canonical value

Important alignment with current schema:
- Use `deal_memberships.dispatched_at/viewed_at/...` (NOT received_at/first_viewed_at)
- Use `subscriptions.pack_generated_at/pack_sent_at/...` (NOT deal_subscription_submissions.pack_generated_at)
- `investor_members.role` has no database CHECK constraint in the schema dump; rely on code validation for now

---

## Phase 3 Plan (End-to-End)

### 1) Align Journey Bar Data Sources
**Goal:** Ensure UI reads correct fields from DB.

**Use:**
- Stage 1 Received: `deal_memberships.dispatched_at`
- Stage 2 Viewed: `deal_memberships.viewed_at`
- Stage 3 Interest Confirmed: `deal_memberships.interest_confirmed_at`
- Stage 4 NDA Signed: `deal_memberships.nda_signed_at`
- Stage 5 Data Room Access: `deal_memberships.data_room_granted_at`
- Stage 6 Pack Generated: `subscriptions.pack_generated_at`
- Stage 7 Pack Sent: `subscriptions.pack_sent_at`
- Stage 8 Signed: `subscriptions.signed_at`
- Stage 9 Funded: `subscriptions.funded_at`
- Stage 10 Active: `subscriptions.activated_at`

---

### 2) Investor Opportunities API
**Goal:** Give investor pages a clean data source.

Add opportunity endpoints (aligning with existing `/api/investors/me/*` patterns):
- `GET /api/investors/me/opportunities`
- `GET /api/investors/me/opportunities/:id`

Include:
- Deal details + vehicle/company
- Investor membership status (if exists)
- Journey stage summary from `get_investor_journey_stage`
- Data room access status
- Subscription pack status (signed/funded/active)

---

### 3) Opportunities List Page
**Path:** `/versotech_main/opportunities`

Deliverables:
- Real list (not stub)
- CTA: “Subscribe Now” and “View Details”
- Stage indicator per deal
- Clear gating labels (KYC / NDA / Data Room)

---

### 4) Opportunity Detail with Integrated Data Room
**Path:** `/versotech_main/opportunities/[id]`

Deliverables:
- Deal overview + key docs
- Data room documents embedded as a tab/section
- No separate data-rooms nav
- Show journey bar at top
- Use `deal_data_room_access` to gate documents

---

### 5) Journey Bar Component
**File:** `src/components/deals/investor-journey-bar.tsx`

Logic:
- Use `get_investor_journey_stage()`
- Optional stages show as “skipped” if later stages completed
- Required stages show pending/in progress/completed

---

### 6) Direct Subscribe Flow (Skip Early Stages)
**Goal:** Support direct subscribe without dispatch/interest/nda.

When investor clicks “Subscribe Now”:
- Insert into `deal_memberships` if missing:
  - `deal_id`, `user_id`, `investor_id`, `role = 'investor'`
  - `viewed_at = NOW()`
  - `dispatched_at`, `interest_confirmed_at`, `nda_signed_at`, `data_room_granted_at` = NULL

This is critical for journey tracking.

---

### 7) Subscription Pack Generation (No Draft)
**Goal:** Pack generates immediately on invest.

Flow:
1. Investor clicks “Invest”
2. System generates pack
3. Create signature requests for ALL signatories
4. Update:
   - `subscriptions.pack_generated_at`
   - `subscriptions.pack_sent_at`

No draft review step.

---

### 8) Multi-Signatory NDA Flow
**Goal:** One NDA per signatory.

Rules:
- Signatories = `investor_members.role = 'authorized_signatory'` (text field; no DB constraint, so keep code validation consistent)
- Create separate NDA signature requests for each signatory
- Update `deal_memberships.nda_signed_at` only when all signatories signed

---

### 9) Data Room Access Gating
**Goal:** All signatories must sign before access.

Rules:
- Grant access in `deal_data_room_access` only after all NDA signatures are complete
- Update `deal_memberships.data_room_granted_at` when access is granted

---

### 10) Portfolio Activation Rules
**Path:** `/versotech_main/portfolio`

Rules:
- Only show active investments when `subscriptions.activated_at` is set
- Show funded vs active clearly

---

### 11) Redirect Updates
Update dynamic redirects to land on new detail pages:
- `/versoholdings/deal/:id` → `/versotech_main/opportunities/:id`
- `/versoholdings/data-rooms/:dealId` → `/versotech_main/opportunities/:dealId`
- `/versoholdings/vehicle/:id` → `/versotech_main/portfolio/:id`

---

### 12) Validation & Testing
- Manual tests: direct subscribe, NDA signing, pack generation, data room gating
- Automated tests (Vitest): journey bar logic, direct subscribe membership creation
- Run:
  - `npm run build`
  - `npm run lint`
  - `npx vitest --run --setupFiles src/__tests__/setup.ts`

---

## Definition of Done
Phase 3 is complete when:
- Investors can complete the entire journey in `/versotech_main/opportunities/[id]`
- Journey bar correctly reflects progress and skipped stages
- Direct subscribe works with proper `deal_memberships` creation
- NDA + data room access are gated by all signatories
- Subscription packs generate immediately and track signatures correctly
- Legacy routes redirect into the new experience
