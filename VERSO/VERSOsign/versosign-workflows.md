# VERSOsign: Processes, Gaps, and Plan

## Scope
Documents covered:
- NDA (investor data room access)
- Subscription Pack (investor commitment)
- Certificate (CEO + lawyer)
- Introducer Agreement

This note reflects the current code and DB behavior, the expected business flow, and a concrete plan to align everything.

## Core Rules (Business Intent)
- If investor is **individual**: one NDA, one subscription pack signer.
- If investor is **entity**: multiple signatories; each must sign their own NDA and their own signature block on the subscription pack.
- Data room access is granted **only after all NDA signatories signed**.
- Tasks should be visible to **all investor users** (entity members). A single account can complete signatures if that is how the entity operates.

## Cross-Cutting Gaps (Engine + Task Routing)
- Signature engine only supports `party_a` and `party_b`. Any extra positions (e.g., `party_a_2`) will break unless positions and coordinates are added.
- Signature tasks are only auto-created for `signer_role = investor` and staff (`admin`/`arranger`). Signers labeled `authorized_signatory`, `introducer`, `lawyer`, `ceo`, etc. do **not** get tasks today.
- Lawyer visibility in VERSOsign depends on `deal_lawyer_assignments`. If lawyers are assigned only at vehicle level, they will not see deal signature tasks.
- NDA completion and data-room unlock happen through multiple paths (workflow handler, automation endpoint, data-room-access endpoint). These need to be unified so the gate is consistent.

## Where the "Sign NDA" Path Exists (Today)
- UI: `versotech-portal/src/app/(main)/versotech_main/opportunities/[id]/page.tsx`
  - Action: `handleSignNda()`
- API: `versotech-portal/src/app/api/investors/me/opportunities/[id]/nda/route.ts`
  - This inserts `signature_requests` with no Google Drive URL or PDF path.
  - Result: signatures cannot be completed because the signer has no document to sign.

This path conflicts with the intended approval-driven NDA flow.

---

# NDA (Data Room Access)

## Current Flow (as-is)
1. Investor clicks **Submit Interest** (approval created).
2. CEO approves in approvals.
3. Approval handler triggers n8n `process-nda` and creates **one** investor signature request + **one** admin signature request.
   - Code: `versotech-portal/src/app/api/approvals/[id]/action/route.ts`
4. Separate "Sign NDA" CTA exists and creates signature requests directly (without a doc).

## Problems
- The direct "Sign NDA" CTA creates signature records **without a document**, so signing fails.
- CEO-approval flow only creates **one** investor signature request (no per-signatory NDAs).
- Multi-signatory support is inconsistent with the business rule.
- Data room access is granted by multiple paths (workflow handler / automation endpoint / data-room-access endpoint), which makes the gate inconsistent.
- `authorized_signatory` signer roles do not get tasks today, so signers are blind unless we create tasks explicitly.

## Expected Behavior
- CEO approval triggers **one NDA per signatory**.
- Each signatory receives a distinct signing link and task.
- Data room access only unlocks after **all signatories** have signed their own NDA.

## Plan
1. **Disable the direct "Sign NDA" CTA path** or route it to the CEO-approval flow.
2. On CEO approval:
   - Load all authorized signatories for the investor entity.
   - For each signatory: trigger n8n `process-nda` to generate the NDA (one NDA per signer).
   - Create a `signature_requests` row per signatory with `member_id` set.
3. **Unify data-room gating** to a single check:
   - Use `signature_requests` by `deal_id + investor_id + document_type='nda'`.
   - Grant access only when **all** are signed.
4. Tasks:
   - Create a signature task per signatory.
   - Set `owner_investor_id` so all investor users can see it.
   - Store signatory name/email in task metadata to make it clear who is signing.
    - Allow any investor user to complete the task if the entity uses shared accounts.

---

# Subscription Pack (Investor Commitment)

## Current Flow (as-is)
1. Staff sends document for signature using:
   - `versotech-portal/src/app/api/subscriptions/[id]/documents/[documentId]/ready-for-signature/route.ts`
2. When multiple signatories are selected:
   - The code creates multiple `signature_requests` with positions like `party_a_2`.
3. The signature engine only supports `party_a` and `party_b`.
   - Result: extra signers fail when the signature is embedded.

## Problems
- Multiple signers are blocked because the signature engine has no positions beyond `party_a`/`party_b`.
- Current document template only has two signature blocks.
- The type/config only recognizes `party_a`/`party_b`, so `party_a_2` cannot be embedded without changes.

## Expected Behavior
- **One subscription pack** with **multiple signatory blocks** for the investor side.
- Each signatory receives a unique signing link and signs their own block.
- Countersigner (CEO or Arranger) signs the VERSO block.

## Plan
1. **Template change**: make the subscription pack template generate N signatory blocks dynamically.
   - Stack vertically, include signatory names and titles.
2. **Signature engine change**:
   - Add positions `party_a_1..party_a_n` (and map coordinates).
   - Update signature position type to accept these.
3. **Signature request creation**:
   - Assign each signatory to a dedicated position block.
   - Keep VERSO countersigner as `party_b`.
4. **Validation**:
   - If signatory count exceeds template capacity, block and require regeneration.

---

# Certificate (CEO + Lawyer)

## Current Flow (as-is)
- Certificate handler assumes **lawyer = party_a**, **CEO = party_b**.
  - `versotech-portal/src/lib/signature/handlers.ts`
- Certificate creation currently creates **CEO = party_a**, **second signatory = party_b**.
  - `versotech-portal/src/lib/subscription/certificate-trigger.ts`

## Problems
- Role/order mismatch: handler expects lawyer first, creation assigns CEO first.
- Lawyer detection is done by email string, which is not reliable.
- Lawyer task visibility depends on `deal_lawyer_assignments` (not vehicle-level assignment).

## Expected Behavior
- Lawyer signs first (party_a).
- CEO signs second (party_b).
- Certificate published only after both are signed.

## Plan
1. Align certificate creation with handler:
   - Set lawyer = `party_a`.
   - Set CEO = `party_b`.
2. Use explicit role mapping (no email-string guessing).
3. Confirm lawyer tasks appear in VERSOsign by deal assignment.

---

# Introducer Agreement

## Current Flow (as-is)
- Agreement is signed by Arranger/CEO then Introducer.
- Uses only two signature blocks (party_a / party_b).

## Problems
- Entity introducers with multiple signatories are not supported.
- Same signature-position limitation as subscription packs.
- Introducer signers do not get tasks unless we create them explicitly.

## Expected Behavior
- If introducer is an entity, multiple signatories must sign.
- Countersigner is CEO or Arranger.

## Plan
1. Extend agreement template to include N introducer signatory blocks.
2. Add dynamic signature positions (like subscription pack).
3. Create one signature request per introducer signatory.
4. Complete agreement only when all signatories + countersigner have signed.

---

# Portal / Persona Notes (Migration Risks)
- VERSOsign now lives under `versotech_main` and is persona-driven.
- Some flows still assume old staff roles (staff_admin vs ceo) and may mis-route tasks.
- We need to verify CEO persona mapping and task visibility for lawyers/arrangers.

---

# Implementation Roadmap (High Level)
1. Remove or re-route the direct "Sign NDA" CTA to the CEO approval flow.
2. Implement per-signatory NDA generation + signature requests + tasks.
3. Add multi-signature positions and dynamic template support.
4. Align certificate signer order and roles.
5. Update introducer agreement to support entity signatories.
6. Validate end-to-end: approval -> n8n -> signature -> data room / subscription / document publish.
