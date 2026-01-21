# Introducer Agreement - Complete End-to-End Documentation

> **Last Updated**: 2026-01-20
> **Author**: Codex (AI Assistant)
> **Purpose**: Complete documentation of introducer agreement generation, signature placement, and multi-signatory signing.

---

## Table of Contents

1. [What This Document Covers](#1-what-this-document-covers)
2. [How Changes Were Made](#2-how-changes-were-made)
3. [Exact Code Changes Made](#3-exact-code-changes-made)
4. [Complete File Reference](#4-complete-file-reference)
5. [System Overview](#5-system-overview)
6. [End-to-End Flow](#6-end-to-end-flow)
7. [Phase 1: Agreement Generation](#7-phase-1-agreement-generation)
8. [Phase 2: Anchor Detection](#8-phase-2-anchor-detection)
9. [Phase 3: Signature Placement](#9-phase-3-signature-placement)
10. [Phase 4: Signature Embedding](#10-phase-4-signature-embedding)
11. [Phase 5: Progressive Signing (Multi-Signatory)](#11-phase-5-progressive-signing-multi-signatory)
12. [Anchor System Deep Dive](#12-anchor-system-deep-dive)
13. [Coordinate System](#13-coordinate-system)
14. [Database Schema](#14-database-schema)
15. [Known Issues](#15-known-issues)
16. [What Was Fixed](#16-what-was-fixed)
17. [What Still Needs Work](#17-what-still-needs-work)
18. [Testing Procedure](#18-testing-procedure)
19. [Troubleshooting](#19-troubleshooting)
20. [Change Log](#20-change-log)

---

## 1. What This Document Covers

This document contains:

- **Every file** involved in introducer agreement generation and signing
- **Exact line numbers** for key code locations
- **Code snippets** showing the actual implementation
- **How multi-signatory introducer agreements are built**
- **How anchors and signature placements are calculated**
- **How signatures are embedded and chained**
- **How to test the end-to-end flow**

---

## 2. How Changes Were Made

### Tools Used

| Tool | Purpose | Example |
|------|---------|---------|
| `rg` | Fast search | Find introducer agreement signing flow |
| `sed`/`nl` | Read file sections with line numbers | Extract anchor sections |
| `apply_patch` | Targeted edits | Insert anchor spans and placements |
| `cat` | Create new documentation | This file |

### What Changed vs. What Stayed

- **Changed**: Introducer signature layout, anchor detection, multi-signatory signature positions, and signing endpoint.
- **Unchanged**: PDF generation through n8n, storage path conventions, and signature embedding engine (`pdf-lib`).

---

## 3. Exact Code Changes Made

### Change 1: Introducer Agreement Template Anchors

**File**: `introducer_agreement_template.html` (CSS + signature section)

**Key Lines**:
- Anchor CSS added in `introducer_agreement_template.html` (signature line anchors).
- CEO/Arranger anchor inserted in the Execution row signature block.
- Dynamic introducer signatures placeholders inserted in the Execution row.

**Snippet**:
```html
<div class="signature-line" style="margin: 3cm auto 0.2cm; position:relative;">
<span style="position:absolute;left:50%;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;transform:translateX(-50%);">SIG_ANCHOR:party_a</span>
</div>
```

```html
<!-- Execution row -->
<p><span class="bold">Signed by the parties on this day,</span></p>
{{ $json.entity_signature_html }}
{{ $json.individual_signature_html }}
```

### Change 2: Dynamic Introducer Signatories + Anchors

**File**: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts`

**Key Lines**:
- Signatory lookup + HTML: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:283`
- Payload field: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:578`

**Snippet**:
```typescript
const ANCHOR_CSS = 'position:absolute;left:50%;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;transform:translateX(-50%);'

const entitySignatureHtml = introducerSignatories.map((signatory, index) => {
  const number = index + 1
  const anchorId = getIntroducerAnchorId(number)

  return `
  <div style="margin-top: 10px; margin-bottom: 20px;">
    <div class="signature-line" style="margin:3cm auto 0.2cm; position:relative;">
      <span style="${ANCHOR_CSS}">SIG_ANCHOR:${anchorId}</span>
    </div>
    <div class="signature-name">${signatory.name}</div>
    <div class="signature-title">Authorised Signatory ${number}</div>
  </div>
  `
}).join('')
```

### Change 3: Anchor Placements for CEO Signature Requests

**File**: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts`

**Key Lines**:
- Anchor detection + placements: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:716`

**Snippet**:
```typescript
const anchors = await detectAnchors(new Uint8Array(pdfBuffer))
const introducerAnchorCount = isEntity ? introducerSignatories.length : 1
const requiredAnchors = getRequiredAnchorsForIntroducerAgreement(introducerAnchorCount)
validateRequiredAnchors(anchors, requiredAnchors)
const placements = getPlacementsFromAnchors(anchors, 'party_a', 'introducer_agreement')
```

### Change 4: Introducer Multi-Signatory Signature Requests

**File**: `versotech-portal/src/lib/signature/handlers.ts`

**Key Lines**:
- Multi-signer positions and placements: `versotech-portal/src/lib/signature/handlers.ts:1245`
- Completion query includes `party_b_*`: `versotech-portal/src/lib/signature/handlers.ts:1404`

**Snippet**:
```typescript
const signaturePosition = (index === 0 ? 'party_b' : `party_b_${index + 1}`) as SignaturePosition
const signaturePlacements = detectedAnchors
  ? getPlacementsFromAnchors(detectedAnchors, signaturePosition, 'introducer_agreement')
  : []
```

```typescript
.eq('signer_role', 'introducer')
.like('signature_position', 'party_b%')
```

### Change 5: Anchor Support for Introducer Agreements

**File**: `versotech-portal/src/lib/signature/anchor-detector.ts`

**Key Lines**:
- Introducer anchor patterns: `versotech-portal/src/lib/signature/anchor-detector.ts:174`
- Introducer required anchors: `versotech-portal/src/lib/signature/anchor-detector.ts:389`

**Snippet**:
```typescript
if (documentType === 'introducer_agreement') {
  return [{ anchorId: position, label: 'introducer_agreement' }]
}
```

```typescript
export function getRequiredAnchorsForIntroducerAgreement(signatoryCount: number): string[] {
  const required: string[] = ['party_a']
  for (let i = 1; i <= signatoryCount; i++) {
    const base = i === 1 ? 'party_b' : `party_b_${i}`
    required.push(base)
  }
  return required
}
```

### Change 6: In-App Signing Endpoint

**File**: `versotech-portal/src/app/(main)/versotech_main/versosign/introducer-agreement-signing-section.tsx`

**Key Line**:
- `versotech-portal/src/app/(main)/versotech_main/versosign/introducer-agreement-signing-section.tsx:113`

**Snippet**:
```typescript
const response = await fetch('/api/signature/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: signingMode.token, signature_data_url: signatureDataUrl })
})
```

### Change 7: Progressive Signing Scoped to Subscriptions

**File**: `versotech-portal/src/lib/signature/client.ts`

**Key Line**:
- `versotech-portal/src/lib/signature/client.ts:1018`

**Snippet**:
```typescript
if (signatureRequest.document_type === 'subscription' && signatureRequest.signature_position?.startsWith('party_a')) {
  // progressive signing check
}
```

---

## 4. Complete File Reference

- `introducer_agreement_template.html` - HTML template + anchors
- `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts` - signatory HTML + n8n payload + CEO signature placements
- `versotech-portal/src/lib/signature/anchor-detector.ts` - anchor detection + introducer patterns
- `versotech-portal/src/lib/signature/handlers.ts` - multi-signatory introducer signing + placements
- `versotech-portal/src/app/api/introducer-agreements/[id]/sign/route.ts` - party_a placements for manual flow
- `versotech-portal/src/lib/signature/client.ts` - signature embedding + progressive signing gating
- `versotech-portal/src/app/(main)/versotech_main/versosign/introducer-agreement-signing-section.tsx` - in-app signing endpoint
- `versotech-portal/scripts/test-introducer-webhook.ts` - updated payload for entity/individual signature HTML

---

## 5. System Overview

**Core flow:**
1. Fee plan generates introducer agreement data.
2. n8n builds the PDF using `introducer_agreement_template.html`.
3. PDF is uploaded to `deal-documents` bucket.
4. Signature requests are created with anchor-based placements.
5. CEO/Arranger signs (party_a) first.
6. Introducer signers receive tasks and sign (party_b, party_b_2, ...).
7. Agreement activates once all introducer signers are complete.

**Key design change:** anchors are embedded in the template so we detect exact Y positions and use the anchor X for introducer agreements.

---

## 6. End-to-End Flow

1. **Generate Agreement**: `/api/staff/fees/plans/[id]/generate-agreement` creates agreement + n8n payload.
2. **PDF Generation**: n8n merges `introducer_agreement_template.html` + payload.
3. **Anchor Detection**: after PDF upload, anchors are parsed via `detectAnchors()`.
4. **CEO Signature Request**: party_a signature request is created with `signature_placements`.
5. **CEO Signs**: `/api/signature/submit` embeds the signature at party_a anchor.
6. **Introduce Signers**: multi-signatory requests created as `party_b`, `party_b_2`, ... with anchor placements.
7. **All Signers Complete**: agreement status transitions to `active`.

---

## 7. Phase 1: Agreement Generation

**Entry point**: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts`

Key work:
- Fetch introducer signatories from `introducer_users`.
- Render `entity_signature_html` / `individual_signature_html` with anchors.
- Inject HTML into the n8n payload.

**Line reference**: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:283`

---

## 8. Phase 2: Anchor Detection

**File**: `versotech-portal/src/lib/signature/anchor-detector.ts`

- Detects `SIG_ANCHOR:*` text markers in the PDF text layer.
- Supports `introducer_agreement` via new patterns and required anchor list.

**Line reference**: `versotech-portal/src/lib/signature/anchor-detector.ts:174`

---

## 9. Phase 3: Signature Placement

**Strategy**:
- **X position**: uses the detected anchor X for introducer agreement placements.
- **Y position**: anchor line + offset to place signature above the line.

**Placement call**:
```typescript
getPlacementsFromAnchors(anchors, 'party_a', 'introducer_agreement')
```

**Line reference**: `versotech-portal/src/app/api/staff/fees/plans/[id]/generate-agreement/route.ts:716`

---

## 10. Phase 4: Signature Embedding

**Embedding engine**: `pdf-lib` via `embedSignatureMultipleLocations()`.

- If `signature_placements` are present, signatures are embedded at exact anchor-based locations.
- If not, it falls back to legacy positions (not recommended for introducer agreements).

**File**: `versotech-portal/src/lib/signature/client.ts`

---

## 11. Phase 5: Progressive Signing (Multi-Signatory)

**Logic**:
- Party A signs first (CEO/Arranger).
- Party B signers receive tasks: `party_b`, `party_b_2`, ...
- Completion check uses `.like('signature_position', 'party_b%')`.

**Line reference**: `versotech-portal/src/lib/signature/handlers.ts:1245`

---

## 12. Anchor System Deep Dive

**Introducer Agreement Anchor IDs**:
- `party_a` - CEO/Arranger signature line (fixed)
- `party_b` - Introducer signer 1
- `party_b_2` - Introducer signer 2
- `party_b_3` - Introducer signer 3

Anchors are embedded directly in the HTML template and preserved through n8n PDF generation.

---

## 13. Coordinate System

- **PDF coordinates** are measured from the bottom-left corner.
- Anchor Y is the line position; we add offsets so the signature sits above it.
- Signature image size: `150x50` points (`versotech-portal/src/lib/signature/config.ts`).

---

## 14. Database Schema

Relevant tables:

- `introducer_agreements`
  - `ceo_signature_request_id`
  - `introducer_signature_request_id`
  - `arranger_signature_request_id`
  - `status`

- `signature_requests`
  - `introducer_agreement_id`
  - `signature_position`
  - `signature_placements` (JSONB)

- `introducer_users`
  - `user_id`, `introducer_id`, `can_sign`, `is_primary`

---

## 15. Known Issues

- **Existing agreements generated before anchors** will not have `SIG_ANCHOR` markers and will fall back to legacy placement.
- **Maximum signatories** is capped at 5 due to `SignaturePosition` type constraints.

---

## 16. What Was Fixed

- Anchors are now embedded in the introducer agreement template.
- Introducer signers are generated dynamically from `introducer_users`.
- Signature placements are computed from anchors for both party_a and party_b signers.
- Multi-signatory completion is correctly detected for `party_b_*`.
- In-app signing now uses `/api/signature/submit` instead of webhook endpoint.

---

## 17. What Still Needs Work

- If you want more than 5 introducer signers, extend `SignaturePosition` (add `party_b_6`, etc.)
- Legacy introducer agreements without anchors should be regenerated for perfect placement.

---

## 18. Testing Procedure

1. Generate a new introducer agreement via fee plan:
   - Staff: `POST /api/staff/fees/plans/[id]/generate-agreement`
2. Confirm anchors exist in generated PDF:
   - `npx tsx versotech-portal/scripts/test-anchor-detection.ts /path/to/pdf`
3. Sign as CEO/Arranger from VERSOSign (party_a).
4. Verify introducer signers receive tasks and can sign in sequence.
5. Confirm agreement status transitions to `active`.

---

## 19. Troubleshooting

- **No anchors detected**: Ensure n8n is using the updated `introducer_agreement_template.html`.
- **Signatures misplaced**: Check anchor span placement on signature lines and verify the inline anchor CSS is present.
- **Party A blocked**: Confirm signing endpoint is `/api/signature/submit` and progressive signing only applies to subscriptions.

---

## 20. Change Log

- Added anchor CSS and `SIG_ANCHOR` markers to introducer agreement template.
- Added dynamic introducer signatories with anchor IDs in generate-agreement payload.
- Added introducer-specific anchor detection and placement logic.
- Updated introducer signing handler for multi-signers and `party_b_*` positions.
- Scoped progressive signing enforcement to subscriptions only.
- Updated in-app introducer signing to use `/api/signature/submit`.
