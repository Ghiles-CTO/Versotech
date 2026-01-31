# Launch Follow-ups Plan (Jan 30, 2026)

Purpose: Capture the end-to-end work items requested in the Friday client meeting and break them into actionable checklists.

## Scope (from client feedback)
- Two-route investor journey (Data Room -> NDA -> Subscribe vs Direct Subscribe without NDA) must be clear in BOTH progress bars (deal page and opportunity page).
- Wording fixes: "Request Data Room Access" should not show "Interest Confirmed"; it should lead to NDA flow.
- NDA data correctness: Party A fields should use entity vs individual correctly; "Represented by" and email must be the user/signatory; multi-signatory NDA generation must be correct.
- Approval queue terminology: rename "deal interest" to "data room access request", show deal + requesting user, hide/remove Priority; review other approval UX issues.
- Deal creation UI updates: stock type labels, rename "entity" to "vehicle", add CHF/AED currency, verify currency use in auto-created subscriptions, add save-as-draft.
- Logo cropping: ensure deal/company logos are cropped consistently and displayed properly across personas and screens.

---

## 1) Investor Journey Progress Bars and Wording
Files to review:
- versotech-portal/src/components/deals/investor-journey-bar.tsx
- versotech-portal/src/components/deals/interest-status-card.tsx
- versotech-portal/src/app/(main)/versotech_main/opportunities/[id]/page.tsx
- versotech-portal/src/components/deals/investor-deals-list-client.tsx
- versotech-portal/src/components/deals/interest-modal.tsx
- versotech-portal/src/app/api/investors/me/opportunities/[id]/route.ts (journey summary + flags)

Checklist:
- [x] Define the two routes and the exact stage wording for each route:
  - Route A: Request Data Room Access -> NDA -> Data Room -> Subscription
  - Route B: Direct Subscribe (bypass NDA and data room)
- [x] Update stage labels and summary text so "Interest Confirmed" becomes "Data Room Access Requested" (or equivalent) for the data-room route.
- [x] Update InvestorJourneyBar to render two-route logic clearly (branching UI or a route-specific stage list).
- [x] Update InterestStatusCard progress bar to match the two-route model (avoid single-line confusion).
- [x] Align CTA text on opportunity page + investor deal list to match the two-route model (no NDA in direct subscribe path).
- [x] Verify currentStage and journey summary logic in API still maps correctly after the wording/route changes.

---

## 2) NDA Workflow and Template Data Correctness
Files to review:
- NDA_template.html
- versotech-portal/src/app/api/approvals/[id]/action/route.ts (NDA payload + signatories)
- versotech-portal/src/lib/signature/handlers.ts (NDA completion handling)
- versotech-portal/src/app/api/signature/complete/route.ts (direct subscribe vs data room)
- versotech-portal/src/app/api/deals/[id]/interests/route.ts (interest submission)
- VERSO/VERSOsign/versosign-workflows.md (workflow intent)

Checklist:
- [x] Confirm NDA template placeholders (party_a_*, party_b_*, dataroom_email) match payload keys.
- [x] Validate NDA payload mapping for individuals vs entities:
  - Entity: party_a_name/address/city-country = entity data
  - Represented by + email = signatory (user)
  - Individual: party_a_name/address/city-country = user data
- [x] Verify CEO approval generates one NDA per signatory (investor_members) and creates signature_requests for each.
- [x] Ensure signatory email always uses the user email (member email) with a safe fallback only when necessary.
- [x] Add preflight validation so NDA generation is blocked if required party data is missing (address, city, country, email).
- [x] Ensure the data-room unlock condition requires all signatories signed (entity-level requirement).
- [x] Confirm direct subscribe path bypasses NDA in both UI and backend (if business rule = no NDA).

---

## 3) Approval Queue Terminology and UX
Files to review:
- versotech-portal/src/components/approvals/approval-filters.tsx
- versotech-portal/src/components/approvals/views/approvals-list-view.tsx
- versotech-portal/src/components/approvals/views/approvals-kanban-view.tsx
- versotech-portal/src/components/approvals/views/approvals-database-view.tsx
- versotech-portal/src/components/approvals/approval-detail-drawer.tsx

Checklist:
- [x] Rename "deal_interest" labels to "Data Room Access Request" everywhere (filters, list, kanban, drawer).
- [x] Update approval list rows to show BOTH: investment opportunity name and requesting user.
- [x] Remove/hide Priority from approval UI (badges and filter) where requested.
- [x] Check other approval UX issues (missing deal name, confusing labels, missing requester).

---

## 4) Deal Creation UI and Field Updates
Files to review:
- versotech-portal/src/components/deals/create-deal-form.tsx
- versotech-portal/src/components/deals/deal-detail-client.tsx
- versotech-portal/src/app/api/deals/route.ts
- versotech-portal/src/types/supabase.ts (deal_status_enum)

Checklist:
- [x] Update stock type label to "Common and Ordinary Shares" (remove slash) in create + edit forms.
- [x] Rename "entity" to "vehicle" in deal creation UI labels, placeholders, and helper text.
- [x] Add CHF and AED currency options to deal create + edit forms.
- [x] Verify currency propagation when a subscription is auto-created (approval flow):
  - deal currency -> subscription currency -> subscription pack data
- [x] Implement "Save as Draft" in deal creation:
  - set deals.status = 'draft'
  - allow partial data
  - add button + redirect to edit view
  - ensure draft visibility in lists and filters

---

## 5) Deal Logo Cropping and Display
Files to review (examples, not exhaustive):
- versotech-portal/src/app/(main)/versotech_main/opportunities/[id]/page.tsx
- versotech-portal/src/components/deals/investor-deals-list-client.tsx
- versotech-portal/src/components/deals/data-room-preview-card.tsx
- versotech-portal/src/app/(main)/versotech_main/my-mandates/page.tsx
- versotech-portal/src/app/(main)/versotech_main/assigned-deals/page.tsx

Checklist:
- [x] Inventory all deal/company logo render locations (all personas).
- [x] Create a shared DealLogo component with consistent size, crop, and fallback behavior.
- [x] Apply consistent cropping (object-fit: cover + overflow hidden) and shape handling (circle or rounded) across all surfaces.
- [x] Replace direct <img>/<Image> usage with the shared component in key deal views.

---

## 6) Validation and QA
Checklist:
- [ ] Manual test: Data room request -> NDA -> data room access (multi-signatory).
- [ ] Manual test: Direct subscribe bypasses NDA and proceeds to subscription pack only.
- [ ] Manual test: Approval queue shows correct labels and requestor info.
- [ ] Manual test: Draft deal saved and later resumed.
- [ ] Manual test: CHF/AED propagate into subscription creation + display.
- [ ] Manual test: Logos display correctly across main personas.

---

## Deferred (Next)
- Term sheet fixes (as requested to handle later).
