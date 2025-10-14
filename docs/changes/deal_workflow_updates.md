# Deal Workflow Change Specification (Investor & Staff Portals)

This document translates the Oct 12, 2025 client review outcomes and subsequent clarifications into concrete changes for the deal lifecycle across the investor portal, staff portal, backend services, and automations. Use it alongside `docs/changes/next_steps.md` for broader program context.

## 1. Updated Investor Experience
_Primary touchpoints_: `versotech-portal/src/app/(investor)/versoholdings/deals/page.tsx`, `.../deal/page.tsx`, components under `src/components/deals`, and API handlers in `src/app/api/deals`.

### 1.1 Active Deals Cards
- Remove the `Reserve Units`, `Request Report`, and `Documents` CTAs and delete their supporting routes/services (`ReservationModal`, `/api/deals/[id]/reservations`, and related Supabase tables/views).
- Retain a single primary CTA labelled **"I'm Interested"** (rebranded from "Submit Commitment").
- Strip the fundraising progress bar; instead show: `Up to` allocation amount, minimum ticket, unit price (from the fee structure), urgency/deadline copy, and the real company logo.
- Include a "Visit Company Site" link that opens in a new tab, using the `company_website` URL maintained by staff.
- Update the summary metrics in `deals/page.tsx` to track interest pipeline counts (e.g. pending interests, active NDAs) instead of reservations/legacy commitments.

### 1.2 Interest Submission Flow
- Replace `CommitmentModal` with an `InterestModal`:
  - Remove enforced unit/amount inputs and the fee-plan selector; capture indicative amount or range plus optional notes.
  - Drop the "agree to terms" checkbox tied to the old commitment workflow.
- Stop auto-creating `term_sheets` at this stage; term sheets will be produced later in the subscription flow.
- When an investor submits the form:
  - Create a new `investor_deal_interest` record (see Section 3) with status `pending_review`.
  - Generate a high-priority approval in the staff portal approval queue.
  - Send the investor a confirmation message and in-app notification.

### 1.3 Closed Deal Interest Capture
- Keep closed deals visible with a secondary CTA **"Notify Me About Similar Deals"**.
- Persist these signals in `investor_interest_signals` for future recommendations.

### 1.4 Deal Detail (View Details)
- Refresh `DealDetailsModal` so investors immediately see:
  - A hero summary with logo, issuer, sector, stage, geography, and timeline (open/close dates, indicative completion date).
  - A **Term Sheet** section rendered as a responsive table mirroring the sample supplied by Julien (Date, Transaction Type, Opportunity narrative, Issuer, Vehicle, Exclusive Arranger, Seller, Structure, Allocation "Up to …", Price per Share, Minimum/Maximum Ticket, Subscription Fee %, Management Fee %, Carried Interest %, Legal Counsel, Interest Confirmation deadline, Capital Call timeline, Completion Date, In-Principle Approval, Subscription Pack note, Share Certificates, Subject to Change, Validity Date). These values pull from the fee-structure fields maintained on the staff portal (Section 2.2).
  - Highlighted key metrics (investment window, minimum ticket, indicative price per share, arranger contact).
- Remove the legacy `Request Report` / `Documents` buttons and replace them with contextual CTAs: **"Ask a Question"** (launches deal-specific message thread) and **"I'm Interested"**.
- Expose a quick link to download the term sheet PDF (if staff attach one) alongside the rendered table.

### 1.5 Data Rooms Page (New)
- Add a new route `versotech-portal/src/app/(investor)/versoholdings/data-rooms/page.tsx` and navigation item (between `Portfolio` and `Reports` as captured in `next_steps.md`).
- Each card shows deal name, logo, access window, outstanding tasks, and quick contact.
- Render foldered documents (Legal, KYC, Reporting, etc.) that mirror staff-managed structure, with download controls gated by access rights.
- Provide an in-context **"Request Access Extension"** action when the window is about to expire.

### 1.6 Post-Access Actions
- Inside a data room, expose **"Submit Subscription"** to capture definitive commitment details (amount, bank/KYC confirmations, custom questions).
- Submission creates a `deal_subscription_submissions` record and triggers the second approval flow (Section 4.2), replacing the previous `deal_commitments` path.

## 2. Staff Portal Enhancements
_Primary touchpoints_: `versotech-portal/src/app/(staff)/versotech/staff/deals/{page,[id]/page}.tsx`, `src/components/deals/deal-detail-client.tsx`, `deal-*-tab.tsx`, approval/task components, and `/api/deals/**` handlers.

### 2.1 Deal Listing & Detail
- Remove UI hooks and summary metrics tied to the deprecated CTAs (`Reserve Units`, `Request Report`, `Documents`) in `DealsListClient` and `DealDetailClient`.
- Replace the existing "Commitments" quick stat with metrics for pending interests, active NDAs, and completed subscriptions.
- Require a deal logo upload on create/edit and display the asset within `DealOverviewTab`.
- Make the deals management page (staff portal) the single source for term sheet authoring: when creating or editing a deal, staff can draft a fresh term sheet, duplicate an existing version, or revise a previous one from the same interface.

### 2.2 Fee Structure Editor
- Add a dedicated editor to manage fee structures with the following fields (derived from the provided term sheet sample):
  - Date of term sheet, Opportunity narrative.
  - Issuer, Vehicle, Structure, Seller, Exclusive Arranger, Purchaser.
  - Allocation (`Up to ...`), Price per Share, Minimum Ticket, Maximum Ticket.
  - Subscription Fee %, Management Fee %, Carried Interest %.
  - Legal Counsel, Interest Confirmation deadline, Capital Call timeline, Completion Date or note.
  - In-Principle Approval, Subscription Pack note, Share Certificates delivery, Validity Date, Subject to Change clause, Additional terms.
- Opportunity narrative should support rich text (Markdown) so the long-form description renders cleanly in the investor modal.
- Allow staff to upload (or auto-generate) a PDF term sheet that will be exposed in the investor view alongside the rendered table.
- Persist both the structured data (for rendering) and a `term_sheet_html` snapshot to ensure the investor view matches the staff-edited version.
- Include workflow controls (draft/publish/archive) so staff can edit term sheets safely before investor exposure, with clear buttons in the deals management page to create a new version or roll back to a previous one.
- Version every update (tie into existing changelog/history UI).

### 2.3 Approval Queue Updates
- Mark new interest approvals as **Critical** with SLA defaults.
- On approval:
  1. Call the n8n webhook `nda_generate` with investor/deal context, fee structure snapshot, and indicative notes.
  2. Auto-create an investor task "Sign NDA" (high priority, default three-day due date).
  3. Notify the investor via in-app message and email ("NDA ready for signature").
- On rejection, capture structured reason + free text and send the investor a rejection notification.

### 2.4 Data Room Access Management
- Extend `DealDetailClient` to manage investor access:
  - Auto-grant when the NDA completion webhook arrives.
  - Manual grant/extend/revoke controls with default expiry (7-14 days) and bulk permission templates.
  - Log every change to the audit trail.

### 2.5 Data Room Document Management
- Standardise folders (Legal, KYC, Reports, Presentations, Financial Models, Misc).
- Flag documents as investor-visible vs staff-only; expose toggles in `DealDocumentsTab`.
- Support drag/drop upload, replace with version history, and metadata edits (tags, expiry, notes).

### 2.6 Subscription Approval Flow
- Introduce a second approval type `subscription_submission`.
- On approval:
  - Call n8n webhook `subscription_pack_generate`.
  - Create investor task "Sign Subscription Agreement" (configurable due date) and send notification.
- On completion callback, create/update `investor_deal_holdings`, adjust allocation metrics, and dispatch a confirmation message.
- Split the existing commitments tab into two: **Interest Pipeline** (for `investor_deal_interest`) and **Subscriptions** (for `deal_subscription_submissions` plus resulting holdings). Remove reservation views entirely.

## 3. Backend & Data Model Changes

### 3.1 Tables / Entities
- `deal_fee_structures` - stores the fields listed in Section 2.2, plus `term_sheet_html` (rendered snapshot) and `term_sheet_attachment_key` (optional PDF stored in object storage), with `effective_at`, `created_by`, and `version`.
- `investor_deal_interest` - `{ id, deal_id, investor_id, status, indicative_amount, notes, submitted_at, approved_at, approval_id }`.
- `investor_interest_signals` - `{ id, investor_id, deal_id, signal_type ('closed_deal_interest'), created_at }`.
- `deal_data_room_access` - `{ id, deal_id, investor_id, granted_by, granted_at, expires_at, revoked_at, revoked_by, auto_granted }`.
- `deal_data_room_documents` - `{ id, deal_id, folder, file_id, visible_to_investors, metadata_json }`.
- `deal_subscription_submissions` - `{ id, deal_id, investor_id, payload_json, status, submitted_at, approval_id }`.
- Align `term_sheets` with the new flow (generate post-subscription) and archive historical `deal_commitments` data; deprecate `reservations`.

### 3.2 Migrations / API Cleanup
- Decommission `reservations`, legacy `deal_commitments`, and dependent Supabase functions/views (migrate historical data to archive tables if required for reporting).
- Remove `/api/deals/[id]/reservations`, `/api/deals/[id]/commitments*`, and report/document request endpoints; add `/api/deals/[id]/interests`, `/api/deals/[id]/data-room-access`, and `/api/deals/[id]/subscriptions`.
- Update RPCs such as `fn_deal_inventory_summary` to drop reservation math and incorporate final subscription figures.
- Extend task/notification services to accept webhook payloads from the new NDA/subscription automations.

### 3.3 Permissions & RLS
- Investors can read only their own interest submissions, data room entries, and subscription packages.
- Staff roles (`staff_admin`, `staff_ops`, `staff_rm`) retain full CRUD on the new tables; automation service roles can update statuses via signed endpoints.
- Ensure audits and changelog entries capture who modified fee structures, access windows, and document visibility.

## 4. Automation & Integration Points

### 4.1 NDA Generation Flow
1. Investor submits **"I'm Interested"**.
2. Staff approval triggers backend call to `nda_generate` webhook (context includes investor info, deal ID, fee structure version, indicative notes).
3. n8n generates the NDA, launches the open-source e-sign flow (unique signature ID), and posts to `POST /api/automation/nda-complete`.
4. Backend callback marks the approval complete, closes the "Sign NDA" task, grants data room access, and notifies the investor.

### 4.2 Subscription Flow
1. Investor submits the subscription form from the Data Room.
2. Staff approval triggers `subscription_pack_generate`.
3. n8n prepares the subscription agreement, launches e-sign, and posts to `POST /api/automation/subscription-complete`.
4. Backend callback closes the subscription task, creates or updates `investor_deal_holdings`, refreshes deal allocation stats, and sends confirmation (including optional invoice trigger).

### 4.3 Access Revocation Automation
- Scheduled job sweeps `deal_data_room_access.expires_at` daily:
  - Auto-revoke and log when expired.
  - Notify investors with an extension CTA.
  - Reset visibility flags in `deal_data_room_documents`.

## 5. Retired Features
- `Reserve Units` UI/logic (investor and staff) and the `reservations` table/API.
- Investor-initiated `Request Report` / `Documents` shortcuts (replaced by Data Room access).
- Progress bar and commitment-based metrics on investor cards.
- Auto-generated term sheets during the initial interest step.

## 6. Outstanding Clarifications
- Confirm default data room access window (e.g. 7 vs 14 days) and extension policy.
- Decide how long expired data room documents remain accessible (archive vs delete).
- Define the final subscription form fields (e.g. capture bank wiring details upfront?).
- Align notification/email templates for NDA and subscription messaging with branding.

## 7. Implementation Notes
- Update investor navigation order to include `Data Rooms` (per `next_steps.md`).
- Store deal logos in the shared storage bucket and serve via CDN.
- Emit analytics events for the new CTAs (`im_interested`, `closed_deal_interest`, `data_room_submit`).
- Refresh TypeScript types and Supabase clients to cover new tables/endpoints.
- Expand QA checklists to validate approval SLAs, webhook callbacks, data room expiry, and RLS coverage.
