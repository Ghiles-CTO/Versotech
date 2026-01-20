# Subscription Pack - Complete End-to-End Documentation

> **Last Updated**: 2026-01-20 (Rounds 1-7)
> **Author**: Claude (AI Assistant)
> **Purpose**: Complete documentation of EVERYTHING related to subscription pack generation and signing.

---

## Table of Contents

1. [What This Document Covers](#1-what-this-document-covers)
2. [How Changes Were Made](#2-how-changes-were-made)
3. [Exact Code Changes Made](#3-exact-code-changes-made)
4. [Complete File Reference](#4-complete-file-reference)
5. [System Overview](#5-system-overview)
6. [End-to-End Flow](#6-end-to-end-flow)
7. [Phase 1: Pack Generation](#7-phase-1-pack-generation)
8. [Phase 2: Anchor Detection](#8-phase-2-anchor-detection)
9. [Phase 3: Signature Placement](#9-phase-3-signature-placement)
10. [Phase 4: Signature Embedding](#10-phase-4-signature-embedding)
11. [Phase 5: Progressive Signing](#11-phase-5-progressive-signing)
12. [Anchor System Deep Dive](#12-anchor-system-deep-dive)
13. [Coordinate System](#13-coordinate-system)
14. [Database Schema](#14-database-schema)
15. [Known Issues](#15-known-issues)
16. [What Was Fixed](#16-what-was-fixed)
17. [What Still Needs Work](#17-what-still-needs-work)
18. [PRD: Dynamic Signature Placement Fix (End-to-End)](#18-prd-dynamic-signature-placement-fix-end-to-end)
19. [Testing Procedure](#19-testing-procedure)
20. [Troubleshooting](#20-troubleshooting)
21. [Change Log](#21-change-log)

---

## 1. What This Document Covers

This document contains:

- **Every file** involved in subscription pack generation and signing
- **Exact line numbers** for key code locations
- **Code snippets** showing actual implementation
- **What was changed** and why
- **What was NOT changed** and why
- **How to test** the changes
- **What to do next**

---

## 2. How Changes Were Made

### Tools Used by Claude

| Tool | Purpose | Example |
|------|---------|---------|
| `Read` | Read file contents | Read `anchor-detector.ts` to see current code |
| `Edit` | Modify specific text in files | Changed `ANCHOR_CSS` value |
| `Write` | Create/overwrite entire files | Created this documentation |
| `Grep` | Search for patterns across files | Found all `ANCHOR_CSS` usages |
| `Glob` | Find files by pattern | Found all `*.ts` files in signature folder |
| `Bash` | Run shell commands | Renamed documentation file |

### What Claude CAN Do

| Capability | Status |
|------------|--------|
| Read any file on your machine | ✅ YES |
| Edit any file on your machine | ✅ YES |
| Create new files | ✅ YES |
| Delete files | ✅ YES |
| Run bash commands | ✅ YES |
| Search code | ✅ YES |
| Query Supabase database | ✅ YES |

### What Claude CANNOT Do

| Capability | Status |
|------------|--------|
| Open a web browser | ❌ NO |
| View PDFs visually | ❌ NO |
| Click buttons in UI | ❌ NO |
| Run `npm run dev` and keep it running | ❌ NO |
| See your screen | ❌ NO |
| Test the application | ❌ NO |

---

## 3. Exact Code Changes Made

### Change 1: regenerate/route.ts

**File**: `src/app/api/subscriptions/[id]/regenerate/route.ts`
**Line**: 250

**BEFORE** (old code):
```typescript
// ANCHOR CSS: Invisible but DETECTABLE by PDF.js text extraction
// - font-size:1px makes text tiny but still rendered in PDF text layer
// - line-height:0 collapses any vertical space
// - color:#ffffff makes text white (invisible on white background)
//
// WHY #ffffff instead of transparent:
// HTML-to-PDF converters (LibreOffice/Gotenberg) treat color:transparent as
// "no text to render" and exclude it from the PDF text layer. White text is
// still rendered and extractable by PDF.js.
//
// WHY NOT position:absolute;left:-9999px:
// Off-page positioning also causes text to be excluded from the PDF text layer.
const ANCHOR_CSS = 'font-size:1px;line-height:0;color:#ffffff;'
```

**AFTER** (current code):
```typescript
// ANCHOR CSS: Invisible anchors placed ON the signature line
//
// APPROACH:
// - Keep anchors in the PDF text layer (for PDF.js extraction)
// - Position anchors at the signature line using absolute positioning
// - Use tiny white text so anchors remain invisible
//
// IMPORTANT: Anchors are now used for PAGE + Y placement (anchor-based Y).
// Avoid off-page positioning so anchor Y is accurate.
const ANCHOR_CSS = 'position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;'
```

### Change 2: action/route.ts

**File**: `src/app/api/approvals/[id]/action/route.ts`
**Line**: 1107

**BEFORE** (old code):
```typescript
// ANCHOR CSS: Invisible but DETECTABLE by PDF.js text extraction
// - font-size:1px makes text tiny but still rendered in PDF text layer
// - line-height:0 collapses any vertical space
// - color:#ffffff makes text white (invisible on white background)
//
// WHY #ffffff instead of transparent:
// HTML-to-PDF converters (LibreOffice/Gotenberg) treat color:transparent as
// "no text to render" and exclude it from the PDF text layer. White text is
// still rendered and extractable by PDF.js.
//
// WHY NOT position:absolute;left:-9999px:
// Off-page positioning also causes text to be excluded from the PDF text layer.
const ANCHOR_CSS = 'font-size:1px;line-height:0;color:#ffffff;'
```

**AFTER** (current code):
```typescript
// ANCHOR CSS: Invisible anchors placed ON the signature line
//
// APPROACH:
// - Keep anchors in the PDF text layer (for PDF.js extraction)
// - Position anchors at the signature line using absolute positioning
// - Use tiny white text so anchors remain invisible
//
// IMPORTANT: Anchors are now used for PAGE + Y placement (anchor-based Y).
// Avoid off-page positioning so anchor Y is accurate.
const ANCHOR_CSS = 'position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;'
```

### Change 3: Remove Appendix Signatures

**Files**:
- `VERSO/VERSOsign/subscription_pack_template.html`
- `src/app/api/subscriptions/[id]/regenerate/route.ts`
- `src/app/api/approvals/[id]/action/route.ts`

**BEFORE**:
- Appendix signature block present in template
- `signatories_appendix_html` generated and injected

**AFTER**:
- Appendix signature block removed
- No appendix anchors or HTML are generated

### Change 4: VC215-Aligned X Positions + Line Alignment

**Files**:
- `src/lib/signature/anchor-detector.ts`
- `VERSO/VERSOsign/subscription_pack_template.html`

**Key Updates**:
- X mapping now matches VC215 layout (stacked left on main, centered on T&Cs)
- Wire instruction line width narrowed (`wire-line`)
- T&Cs signature lines centered (`tcs-line`)

```typescript
// VC215-aligned X mapping
if (label === 'subscription_form') return 0.63
if (label === 'main_agreement') return 0.29
if (label === 'tcs') return 0.43
```

```css
.signature-line.wire-line { width: 42%; }
.signature-line.main-line { width: 50%; }
.signature-line.tcs-line { margin-left: 12%; }
```

### Change 5: Automated Signature Placement Validator (Read-Only)

**File**:
- `scripts/validate-subscription-pack-signatures.mjs`

**Purpose**:
- Validates anchor-based placements by comparing unsigned anchors to signed `Signed:`/`Signer:` text positions
- Read-only check, no PDF modification
- Fails fast if core offsets drift between `anchor-detector.ts` and `pdf-processor.ts`

### What Was Not Changed in the 2025-01-18 Patch (Historical)

| File | Why Not Changed |
|------|-----------------|
| `anchor-detector.ts` | Not changed in 2025-01-18; updated in Round 2 (2025-01-19) |
| `pdf-processor.ts` | Embedding logic is correct |
| `client.ts` | Orchestration logic is correct |
| `handlers.ts` | Progressive signing is correct |
| HTML template | Live template is managed in n8n; repo snapshot exists at `VERSO/VERSOsign/subscription_pack_template.html` and was updated in Round 1 (2025-01-19) |

---

## 4. Complete File Reference

### Pack Generation Files

| File | Full Path | Purpose |
|------|-----------|---------|
| regenerate route | `src/app/api/subscriptions/[id]/regenerate/route.ts` | Regenerate subscription pack |
| action route | `src/app/api/approvals/[id]/action/route.ts` | Generate pack on approval |
| trigger workflow | `src/lib/trigger-workflow.ts` | Trigger n8n workflow |
| gotenberg convert | `src/lib/gotenberg/convert.ts` | DOCX to PDF conversion |

### Signature Library Files

| File | Full Path | Key Exports |
|------|-----------|-------------|
| anchor-detector | `src/lib/signature/anchor-detector.ts` | `detectAnchors()`, `getPlacementsFromAnchors()`, `getSignatureXPosition()` |
| pdf-processor | `src/lib/signature/pdf-processor.ts` | `embedSignatureMultipleLocations()` |
| client | `src/lib/signature/client.ts` | `createSignatureRequest()`, `submitSignature()` |
| handlers | `src/lib/signature/handlers.ts` | `handlePostSignature()` |
| types | `src/lib/signature/types.ts` | `SignaturePlacementRecord`, `SignaturePosition` |
| config | `src/lib/signature/config.ts` | `SIGNATURE_CONFIG` |
| storage | `src/lib/signature/storage.ts` | PDF upload/download |
| token | `src/lib/signature/token.ts` | Signing token generation |
| helpers | `src/lib/signature/helpers.ts` | Legacy position helpers |

### Signature API Routes

| File | Full Path | Method | Purpose |
|------|-----------|--------|---------|
| request | `src/app/api/signature/request/route.ts` | POST | Create signature request |
| submit | `src/app/api/signature/submit/route.ts` | POST | Submit signature |
| complete | `src/app/api/signature/complete/route.ts` | POST | Complete flow |
| ready-for-signature | `src/app/api/subscriptions/[id]/documents/[documentId]/ready-for-signature/route.ts` | POST | Mark ready |

### UI Components

| File | Full Path | Purpose |
|------|-----------|---------|
| signature-pad | `src/components/signature/signature-pad.tsx` | Drawing canvas |
| signature-dialog | `src/components/signature/signature-dialog.tsx` | Modal dialog |
| versosign page | `src/app/(main)/versotech_main/versosign/page.tsx` | Landing page |

---

## 5. System Overview

### What is a Subscription Pack?

A subscription pack is a legal PDF document containing:

| Page | Content | Who Signs |
|------|---------|-----------|
| 2 | Subscription Form | Party A (Subscriber), Party B (Issuer) |
| 3 | Wire Instructions | Party B (Issuer) |
| 14 | Main Agreement | Party A, Party B, Party C (Arranger) |
| 42 | Terms & Conditions | Party B, Party C |
| 44 | Appendix | None (no signatures) |

### Tech Stack

| Component | Technology |
|-----------|------------|
| PDF Generation | n8n workflow + Gotenberg |
| Anchor Detection | PDF.js |
| Signature Embedding | pdf-lib |
| Storage | Supabase Storage |
| Database | PostgreSQL (Supabase) |
| Frontend | Next.js 15 + React |

---

## 6. End-to-End Flow

```
USER ACTION                           SYSTEM RESPONSE
───────────                           ───────────────

1. Staff approves subscription
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: PACK GENERATION                                     │
│                                                              │
│ File: approvals/[id]/action/route.ts                        │
│                                                              │
│ 1. Build signatory HTML with SIG_ANCHOR markers             │
│ 2. Create payload with all subscription data                │
│ 3. Call triggerWorkflow('generate-subscription-pack')       │
│ 4. n8n populates HTML template                              │
│ 5. Gotenberg converts HTML → PDF                            │
│ 6. Upload PDF to Supabase Storage                           │
│ 7. Create document record in database                       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
2. Staff marks document "Ready for Signature"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: SIGNATURE REQUEST CREATION                          │
│                                                              │
│ File: src/lib/signature/client.ts                           │
│                                                              │
│ 1. Download PDF from storage                                │
│ 2. detectAnchors() - scan PDF for SIG_ANCHOR markers        │
│ 3. getPlacementsFromAnchors() - calculate positions         │
│ 4. Insert signature_request with placements                 │
│ 5. Generate signing token                                   │
│ 6. Send email to first signer                               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
3. Signer opens email link
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: SIGNATURE SUBMISSION                                │
│                                                              │
│ Files: signature-pad.tsx, client.ts, pdf-processor.ts       │
│                                                              │
│ 1. User draws signature on canvas                           │
│ 2. submitSignature() called with signature data             │
│ 3. Download current PDF                                     │
│ 4. embedSignatureMultipleLocations() - add signature        │
│ 5. Upload signed PDF                                        │
│ 6. Update signature_request status                          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: PROGRESSIVE SIGNING                                 │
│                                                              │
│ File: src/lib/signature/handlers.ts                         │
│                                                              │
│ 1. Check if more signers needed                             │
│ 2. If yes: create next signature_request                    │
│    (uses SIGNED PDF as input)                               │
│ 3. Send email to next signer                                │
│ 4. Repeat until all signed                                  │
│ 5. Mark document as fully_signed                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
4. All parties have signed → Document complete
```

---

## 7. Phase 1: Pack Generation

### Entry Point 1: Approval Flow

**File**: `src/app/api/approvals/[id]/action/route.ts`
**Lines**: 1091-1223

```typescript
// Line 1093-1095: Anchor ID generation
const getAnchorId = (number: number, suffix?: string): string => {
  const base = number === 1 ? 'party_a' : `party_a_${number}`
  return suffix ? `${base}_${suffix}` : base
}

// Line 1107: ANCHOR_CSS definition (UPDATED 2025-01-19, Round 4)
const ANCHOR_CSS = 'position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;'

// Line 1111-1116: Subscriber form signatures (Page 2)
const signatoriesFormHtml = signatories.map(s => `
  <div class="signature-block-inline" style="position:relative;margin-bottom: 0.5cm;">
    <div class="signature-line" style="position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:${getAnchorId(s.number, 'form')}</span></div>
    Name: ${s.name}<br>
    Title: ${s.title}
  </div>`).join('')

// Line 1121-1127: Main agreement signatures (Page 12)
const signatoriesSignatureHtml = signatories.map(s => `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <p><strong>The Subscriber</strong>, represented by Authorized Signatory ${s.number}</p>
    <div class="signature-line main-line" style="margin-top: 3cm; position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:${getAnchorId(s.number)}</span></div>
    <p style="margin-top: 0.3cm;">Name: ${s.name}<br>
    Title: ${s.title}</p>
</div>`).join('')

// Line 1206-1212: Issuer signature (Page 12)
const issuerSignatureHtml = `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <p><strong>The Issuer, VERSO Capital 2 SCSP</strong>...</p>
    <div class="signature-line main-line" style="margin-top: 3cm; position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:party_b</span></div>
    <p style="margin-top: 0.3cm;">Name: ${issuerName}<br>
    Title: ${issuerTitle}</p>
</div>`

// Line 1217-1223: Arranger signature (Page 12)
const arrangerSignatureHtml = `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <p><strong>The Attorney, Verso Management Ltd.</strong>...</p>
    <div class="signature-line main-line" style="margin-top: 3cm; position:relative;"><span style="${ANCHOR_CSS}">SIG_ANCHOR:party_c</span></div>
    <p style="margin-top: 0.3cm;">Name: ${arrangerName}<br>
    Title: ${arrangerTitle}</p>
</div>`
```

### Entry Point 2: Regeneration

**File**: `src/app/api/subscriptions/[id]/regenerate/route.ts`
**Lines**: 234-279

Same structure as approval flow. Key line:

```typescript
// Line 250: ANCHOR_CSS definition (UPDATED 2025-01-19, Round 4)
const ANCHOR_CSS = 'position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;'
```

---

## 8. Phase 2: Anchor Detection

### File: `src/lib/signature/anchor-detector.ts`

#### detectAnchors() - Lines 35-122

```typescript
export async function detectAnchors(pdfBytes: Uint8Array): Promise<DetectedAnchor[]> {
  // Dynamic import PDF.js
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Set worker path
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url
  ).toString()

  const anchors: DetectedAnchor[] = []

  const loadingTask = pdfjsLib.getDocument({
    data: pdfBytes,
    useSystemFonts: true,
    disableFontFace: true,
  })

  const pdf = await loadingTask.promise

  console.log(`🔍 [ANCHOR] Scanning ${pdf.numPages} pages for SIG_ANCHOR markers...`)

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1.0 })

    for (const item of textContent.items) {
      if (!('str' in item)) continue

      const text = item.str

      // Check for SIG_ANCHOR:xxx pattern
      if (text.includes('SIG_ANCHOR:')) {
        const match = text.match(/SIG_ANCHOR:(\S+)/)
        if (match) {
          const anchorId = match[1]
          const rawX = item.transform[4]
          const rawY = item.transform[5]

          anchors.push({
            anchorId,
            pageNumber: pageNum,
            rawX,
            rawY,
            xPercent: rawX / viewport.width,
            yFromBottom: rawY,
            pageWidth: viewport.width,
            pageHeight: viewport.height
          })

          console.log(`   📍 Found ${anchorId} on page ${pageNum}`)
        }
      }
    }
  }

  console.log(`✅ [ANCHOR] Found ${anchors.length} anchor(s) total`)
  return anchors
}
```

---

## 9. Phase 3: Signature Placement

### File: `src/lib/signature/anchor-detector.ts`

#### getSignatureXPosition() - Lines 224-242

```typescript
function getSignatureXPosition(signaturePosition: string, label: string): number {
  // Party A (Subscribers): Right column on form, stacked-left on main agreement
  if (signaturePosition.startsWith('party_a')) {
    if (label === 'subscription_form') return 0.63  // Right column (form table)
    return 0.29  // Stacked left (main agreement)
  }

  // Party B (Issuer): Left on form/wire/main, centered on T&Cs signature page
  if (signaturePosition === 'party_b') {
    if (label === 'tcs') return 0.43
    if (label === 'main_agreement') return 0.29
    if (label === 'subscription_form') return 0.20
    return 0.25
  }

  // Party C (Arranger): Stacked left on main, centered on T&Cs signature page
  if (signaturePosition === 'party_c') {
    if (label === 'tcs') return 0.43
    return 0.29
  }

  return 0.29  // Default to stacked-left alignment
}
```

#### getSignatureYFromAnchor() - Anchor-Based Placement

```typescript
function getSignatureYFromAnchor(anchor: DetectedAnchor, label: string): number {
  const { metadata } = SIGNATURE_CONFIG.pdf
  const compactSignerOffset = 14
  const signerOffset = label === 'wire_instructions'
    ? compactSignerOffset
    : metadata.signerNameOffsetY

  const lineGap = 4
  return anchor.rawY + signerOffset + lineGap
}
```

#### getPlacementsFromAnchors() - Lines 295-339

```typescript
export function getPlacementsFromAnchors(
  anchors: DetectedAnchor[],
  signaturePosition: string
): SignaturePlacementRecord[] {
  const anchorPatterns = getAnchorPatternsForPosition(signaturePosition)
  const placements: SignaturePlacementRecord[] = []

  console.log(`📍 [PLACEMENT] Calculating placements for ${signaturePosition} (anchor-based Y)...`)

  for (const pattern of anchorPatterns) {
    const anchor = anchors.find(a => a.anchorId === pattern.anchorId)
    if (anchor) {
      // FIXED X position (not from anchor)
      const fixedX = getSignatureXPosition(signaturePosition, pattern.label)

      // Anchor-based Y position (line + offset)
      const signatureY = getSignatureYFromAnchor(anchor, pattern.label)

      placements.push({
        page: anchor.pageNumber,
        x: fixedX,
        y: signatureY,
        label: pattern.label
      })

      console.log(`   ✓ ${pattern.anchorId} -> page ${anchor.pageNumber}, x=${(fixedX * 100).toFixed(0)}%, y=${signatureY.toFixed(0)}pt`)
    }
  }

  console.log(`✅ [PLACEMENT] Created ${placements.length} placement(s)`)
  return placements
}
```

---

## 10. Phase 4: Signature Embedding

### File: `src/lib/signature/pdf-processor.ts`

```typescript
export async function embedSignatureMultipleLocations({
  pdfBytes,
  signatureDataUrl,
  placements,
  signerName,
  signatureDate
}: EmbedParams): Promise<Uint8Array> {

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()

  // Embed signature image
  const signatureImageBytes = signatureDataUrl.replace('data:image/png;base64,', '')
  const signatureImage = await pdfDoc.embedPng(Buffer.from(signatureImageBytes, 'base64'))

  const sigConfig = {
    width: 150,
    height: 50
  }

  for (const placement of placements) {
    const pageIndex = placement.page - 1
    const targetPage = pages[pageIndex]
    const { width: pageWidth } = targetPage.getSize()

    // Calculate X: percentage to points, centered on signature
    const signatureX = pageWidth * placement.x - sigConfig.width / 2

    // Y is already in points from bottom
    const signatureY = placement.y

    // Draw signature image
    targetPage.drawImage(signatureImage, {
      x: signatureX,
      y: signatureY,
      width: sigConfig.width,
      height: sigConfig.height
    })

    // Draw timestamp 12pt below signature
    targetPage.drawText(`Signed: ${signatureDate}`, {
      x: signatureX,
      y: signatureY - 12,
      size: 7,
      color: rgb(0.3, 0.3, 0.3)
    })

    // Draw signer name 22pt below signature
    targetPage.drawText(signerName, {
      x: signatureX,
      y: signatureY - 22,
      size: 7,
      color: rgb(0.3, 0.3, 0.3)
    })

    console.log(`✅ [EMBED] Signature on page ${placement.page} at (${signatureX.toFixed(0)}, ${signatureY})`)
  }

  return pdfDoc.save()
}
```

---

## 11. Phase 5: Progressive Signing

### File: `src/lib/signature/handlers.ts`

```typescript
// Signing order
const SIGNING_ORDER = [
  'party_a',      // First subscriber
  'party_a_2',    // Second subscriber
  'party_a_3',    // Third subscriber
  // ... up to party_a_10
  'party_b',      // Issuer (CEO)
  'party_c'       // Arranger
]

export async function handlePostSignature(completedRequest: SignatureRequest) {
  const { subscription_id, signature_position, document_id } = completedRequest

  // Get next signer in order
  const nextPosition = getNextSignaturePosition(signature_position, subscription_id)

  if (nextPosition) {
    // More signers needed
    const nextSigner = await getSignerForPosition(nextPosition, subscription_id)

    // Create signature request for next signer
    // IMPORTANT: Uses the SIGNED PDF, not the original unsigned
    await createSignatureRequest({
      subscriptionId: subscription_id,
      documentId: document_id,
      signaturePosition: nextPosition,
      signerUserId: nextSigner.userId,
      signerName: nextSigner.name,
      signerEmail: nextSigner.email,
      unsignedPdfPath: completedRequest.signed_pdf_path  // <-- SIGNED PDF
    })

    // Send email notification
    await sendSigningInvitation(nextSigner.email, ...)

  } else {
    // All parties have signed
    await markDocumentFullySigned(document_id)
    await updateSubscriptionStatus(subscription_id, 'fully_signed')
    await sendCompletionNotifications(subscription_id)
  }
}
```

---

## 12. Anchor System Deep Dive

### Anchor Naming Convention

```
SUBSCRIBERS (Party A):
──────────────────────
party_a           → 1st subscriber, main agreement (page 14)
party_a_form      → 1st subscriber, subscription form (page 2)

party_a_2         → 2nd subscriber, main agreement
party_a_2_form    → 2nd subscriber, subscription form

party_a_3         → 3rd subscriber, main agreement
... and so on up to party_a_10

ISSUER (Party B):
─────────────────
party_b           → Issuer, main agreement (page 14)
party_b_form      → Issuer, subscription form (page 2)
party_b_wire      → Issuer, wire instructions (page 3)
party_b_tcs       → Issuer, T&Cs (page 42)

ARRANGER (Party C):
───────────────────
party_c           → Arranger, main agreement (page 14)
party_c_tcs       → Arranger, T&Cs (page 42)
```

NOTE: Page numbers above are illustrative and can shift (e.g., cover/title pages). Anchor detection is the source of truth.
NOTE: Appendix signatures are removed; no `party_a_*_appendix` anchors should exist.

### Anchor CSS Evolution

| Version | CSS | Notes |
|---------|-----|-------|
| v1 (old) | `font-size:1px;line-height:0;color:#ffffff;` | Visible on gray backgrounds in some templates |
| v2 (old API) | `position:absolute;left:-9999px;font-size:1px;` | Off-page anchors; Y not usable |
| current | `position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;` | Anchors on the line with near-invisible opacity |
| target | keep current + verify invisibility | Ensure anchors remain extractable by PDF.js |

### Why Fixed Positions Instead of Anchor-Relative (Legacy)

**Problem**: HTML template places anchors inconsistently:
- Sometimes ABOVE the signature line
- Sometimes BELOW the signature line
- Calculating `signatureY = anchorY - offset` gave negative values

**Legacy Solution (no longer recommended)**:
- Use anchors ONLY for **page detection** (which page needs signature)
- Use **fixed Y values** calibrated from PDF template

**Current Direction**: Use anchor-on-line + anchor-based Y placement (see PRD Section 18).

---

## 13. Coordinate System

### PDF Origin

```
┌────────────────────────────────────────────┐
│                                            │
│            Y = 792 (top)                   │
│                                            │
│                                            │
│                                            │
│                                            │
│  (0,0) ────────────────────────────────→   │ X = 612 (right)
└────────────────────────────────────────────┘
   Origin is BOTTOM-LEFT
   Y increases UPWARD
```

### Page Dimensions (US Letter)

| Dimension | Points | Inches | CM |
|-----------|--------|--------|-----|
| Width | 612 | 8.5 | 21.59 |
| Height | 792 | 11 | 27.94 |

### X Position Mapping (VC215-Aligned)

| Label | Party A | Party B | Party C |
|-------|---------|---------|---------|
| subscription_form | 0.63 | 0.20 | - |
| wire_instructions | - | 0.25 | - |
| main_agreement | 0.29 | 0.29 | 0.29 |
| tcs | - | 0.43 | 0.43 |

### Y Position Mapping (Legacy - Deprecated)

NOTE: Fixed Y values below are deprecated and do not match real layouts. Use anchor-based Y per the PRD in Section 18.

| Page | Label | Y (points) | From Bottom |
|------|-------|------------|-------------|
| 2 | subscription_form | 180 | ~2.5 inches |
| 3 | wire_instructions | 260 | ~3.6 inches ⚠️ WRONG |
| 14 | main_agreement | 180 | ~2.5 inches |
| 42 | tcs | 180 | ~2.5 inches |

---

## 14. Database Schema

### Table: signature_requests

```sql
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  subscription_id UUID REFERENCES subscriptions(id),
  document_id UUID REFERENCES documents(id),

  -- Signer info
  signature_position TEXT NOT NULL,     -- 'party_a', 'party_b', 'party_c'
  signer_user_id UUID REFERENCES profiles(id),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,

  -- Placements (JSONB array)
  signature_placements JSONB NOT NULL,

  -- Authentication
  signing_token TEXT UNIQUE NOT NULL,

  -- PDF paths in storage
  unsigned_pdf_path TEXT NOT NULL,
  signed_pdf_path TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending',        -- pending, signed, expired, cancelled
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### signature_placements JSONB Format

NOTE: Example values below reflect legacy fixed-Y placement; anchor-based Y should replace these.

```json
[
  {
    "page": 2,
    "x": 0.63,
    "y": 180,
    "label": "subscription_form"
  },
  {
    "page": 14,
    "x": 0.29,
    "y": 180,
    "label": "main_agreement"
  }
]
```

---

## 15. Known Issues

### Issue 1: Anchor Text Visible ⚠️ Pending Verification

**Symptom**: Text like `SIG_ANCHOR:party_b_form` visible in PDF
**Root Cause**: `color:#ffffff` didn't hide text on gray backgrounds
**Fix Applied**: Anchors placed on the line with `opacity:0.01` to reduce visibility; template + generated HTML updated
**Files Changed**: `subscription_pack_template.html`, `regenerate/route.ts`, `action/route.ts`
**Status**: ⚠️ Needs PDF regeneration + visibility check

### Issue 2: Wire Instructions Y Position ⚠️ Pending Verification

**Symptom**: Signature on wire instructions page can cover bank details
**Root Cause**: Fixed Y placement did not match the actual line position
**Fix Applied**: Anchor-on-line + anchor-based Y placement, wire-line width aligned to left-column X
**Status**: ⚠️ Needs PDF regeneration + positional verification

### Issue 3: Signature Blocks Split Across Pages ⚠️ Pending Verification

**Symptom**: Anchor is on one page while Name/Title line appears on the next page (example: party_c block in sample PDF)
**Root Cause**: HTML page-break rules are not consistently enforced by the renderer
**Fix Applied**: Added `break-inside: avoid` rules and `signature-block-inline` to keep blocks intact
**Status**: ⚠️ Needs PDF regeneration + split verification

### Issue 4: X Position Mismatch with VC215 Layout ⚠️ Pending Verification

**Symptom**: Signatures land left/right of the actual line on main agreement or T&Cs pages
**Root Cause**: Fixed X mapping assumed left/center/right columns that do not match VC215 layout
**Fix Applied**: VC215-aligned X mapping + centered T&Cs lines
**Status**: ⚠️ Needs PDF regeneration + positional verification

---

## 16. What Was Fixed

### Summary of Changes Made on 2025-01-18

| Change | File | Line | Old Value | New Value |
|--------|------|------|-----------|-----------|
| ANCHOR_CSS | regenerate/route.ts | 256 | `font-size:1px;line-height:0;color:#ffffff;` | `position:absolute;left:-9999px;font-size:1px;` |
| ANCHOR_CSS | action/route.ts | 1113 | `font-size:1px;line-height:0;color:#ffffff;` | `position:absolute;left:-9999px;font-size:1px;` |

Note: line numbers above reflect the 2025-01-18 snapshot; current ANCHOR_CSS lines are 250 (regenerate) and 1107 (action).

### Summary of Changes Made on 2025-01-19 (Rounds 1-5)

| Change | File | Notes |
|--------|------|-------|
| Anchor placement moved to signature line | `VERSO/VERSOsign/subscription_pack_template.html` | Static anchors moved inside `.signature-line`; added `.sig-anchor` |
| Anchor CSS updated (on-line) | `regenerate/route.ts`, `action/route.ts` | `left:-9999px` removed, anchors placed on line |
| Anchor-based Y placement | `anchor-detector.ts` | `anchor.rawY + offset` replaces fixed Y |
| Page-break hardening | `subscription_pack_template.html`, `regenerate/route.ts`, `action/route.ts` | Added `signature-block-inline` and break-inside rules |
| Anchor visibility tuning | `subscription_pack_template.html`, `regenerate/route.ts`, `action/route.ts` | Added `opacity:0.01` to anchor CSS |
| VC215 alignment + appendix removal | `subscription_pack_template.html`, `anchor-detector.ts`, `client.ts`, `regenerate/route.ts`, `action/route.ts` | Removed appendix signatures; updated X mapping |

### Summary of Changes Made on 2026-01-20 (Round 7)

| Change | File | Notes |
|--------|------|-------|
| Commit on investor signatures (internal flow) | `src/lib/signature/client.ts` | Added commit check after each signature; commits when all investor signers are signed |
| Fully-signed handling is now commit-aware | `src/lib/signature/handlers.ts` | Full execution no longer re-commits; still publishes doc + completes staff tasks |
| Notifications aligned to commit vs full execution | `src/lib/signature/handlers.ts`, `src/lib/signature/client.ts` | Investor notified on commit; lawyers/arrangers notified on full execution |

### How These Changes Were Made

1. **Read** `regenerate/route.ts` and `action/route.ts` to confirm ANCHOR_CSS
2. **Edit** both routes to place anchors inside `.signature-line`
3. **Update** the template to add `.sig-anchor` and move static anchors onto the line
4. **Change** placement logic in `anchor-detector.ts` to use anchor-based Y
5. **Add** `signature-block-inline` and break-inside rules for block integrity
6. **Tune** anchor visibility with `opacity:0.01` in template + routes
7. **Remove** appendix signature blocks and anchors from template + payload
8. **Align** X positions to VC215 and adjust wire/T&Cs line alignment in the template
9. **Add** investor-only commit logic in `submitSignature` to enforce `committed` after investor signers
10. **Update** full-signature handler to publish without re-committing and to emit full-execution notifications

---

## 17. What Still Needs Work

### 🔴 Critical Findings (2025-01-19)

Analysis of actual PDF anchor positions revealed fundamental issues with the current approach:

#### Finding 1: Fixed Y Positions Don't Match Reality

| Anchor | Actual Y in PDF | Current Fixed Y | Gap |
|--------|-----------------|-----------------|-----|
| party_b_wire (page 3) | ~681pt | 260pt | **421pt off!** |
| party_a_form (page 3) | ~668pt | 180pt | **488pt off!** |
| party_b (page 14) | ~659pt | 180pt | **479pt off!** |
| party_c (page 14) | ~312pt | 180pt | **132pt off** |

**Why this matters**: Signatures are landing hundreds of points away from where they should be.
**Status**: Addressed by anchor-based Y placement (Round 2), pending verification

#### Finding 2: Anchor-to-Line Offset Was NOT Constant (Historical)

Previously, each signature block had a different distance from anchor to the actual signature line:
- Form blocks: ~40-60pt offset
- Main agreement blocks: ~80-100pt offset
- T&C blocks: ~50-70pt offset

**Why this matters**: A single offset value can't work for all signature types.
**Mitigation**: Anchors are now placed directly on the line (Round 1), making the offset constant.
**Status**: Implemented, pending verification

#### Finding 3: Signature Blocks Split Across Pages

The HTML `page-break-inside: avoid` is NOT being honored by the PDF renderer:
- Signature blocks that should stay together are splitting
- Anchor ends up on one page, signature line on another
- This makes anchor Y positions unpredictable

**Why this matters**: Even correct Y calculation fails if blocks are split.
**Status**: Page-break hardening applied (Round 3), pending verification

#### Finding 4: Mixed Anchor CSS (Resolved in Round 1)

Previously, the template used white-text anchors while API-generated HTML used off-page anchors, which caused inconsistent visibility and extraction. Anchors are now placed on the signature line with unified CSS.
**Status**: Unified anchor placement and CSS (Round 1), pending visibility check

---

### The Path Forward (Aligned with PRD)

#### Option A: Anchor-On-Line + Anchor-Based Placement (Recommended)

1. **Remove appendix signatures + align X positions to VC215**
   - Appendix is informational only (no anchors, no placements)
   - Main agreement signatures stacked left; T&Cs centered; wire line aligned left
2. **Move anchors onto the signature line**
   - Place `SIG_ANCHOR:*` inside the `.signature-line` element (or a consistent line-adjacent spot)
   - This makes anchor Y the canonical signature Y
3. **Prevent block splits**
   - Apply `break-inside: avoid; page-break-inside: avoid; display: inline-block;`
   - Ensure the wrapper includes the line + Name/Title so the anchor stays with its line
4. **Use anchor Y for placement**
   - Replace fixed Y with `signatureY = anchor.rawY + offset`
   - Offset should be derived from signature height and metadata spacing

#### Option B: Per-Block Offset Mapping (Fallback Only)

Instead of fixed Y positions, create a lookup table:

```typescript
const BLOCK_Y_POSITIONS: Record<string, Record<number, number>> = {
  'party_b_wire': { 3: 681 - 40 },  // page 3, offset 40pt
  'party_a_form': { 2: 668 - 50 },  // page 2, offset 50pt
  'party_b': { 14: 659 - 80 },      // page 14, offset 80pt
  // etc.
}
```

This requires measuring EVERY anchor position in the PDF template.

---

### Must Do (Human Required)

| Task | Why Human Needed | How To Do It |
|------|------------------|--------------|
| Validate anchor visibility/detectability | Need to view PDF output | Regenerate pack, open PDF, confirm anchors are invisible but detected |
| **Verify page-break rules** | Renderer behavior is unknown | Confirm signature blocks do not split across pages |
| **Verify anchors on signature line** | Requires PDF check | Confirm anchor Y aligns with the line in Acrobat |
| **Verify anchor-based Y placement** | Requires signing test | Sign and confirm signatures land on the line |
| Measure offsets (fallback only) | Needed if anchor-based Y fails | For each block: `offset = anchor_Y - signature_line_Y` |
| Full E2E test | Need to sign documents | Sign with all parties, verify positions on all pages |

### Step-by-Step Testing Instructions

```bash
# 1. Start the development server
cd versotech-portal
npm run dev

# 2. Go to any subscription in the UI

# 3. Click "Regenerate Pack" (select PDF format)

# 4. Download the generated PDF

# 5. Open PDF and check:
#    - Is "SIG_ANCHOR:xxx" text visible? (should be NO)
#    - Are there unexpected blank pages or split signature blocks? (should be NO)
#    - Check server terminal for anchor detection logs

# 6. If anchors visible: The off-page CSS might need adjustment
# 7. If anchors NOT detected: May need to revert CSS
```

---

## 18. PRD: Dynamic Signature Placement Fix (End-to-End)

### Background and Scope
- This PRD applies only to subscription packs (`document_type = 'subscription'`).
- The system must support 1-10 signatories for entity investors and still place signatures correctly.
- The goal is a single, reliable placement path based on anchor positions in the PDF.
- Appendix is informational only; no signatures required.

### Current End-to-End System (Trace)
1. **Generate pack**:
   - Approval flow: `versotech-portal/src/app/api/approvals/[id]/action/route.ts`
   - Regenerate flow: `versotech-portal/src/app/api/subscriptions/[id]/regenerate/route.ts`
   - Both generate `signatories_*_html` with SIG_ANCHOR markers.
2. **Render template**:
   - `VERSO/VERSOsign/subscription_pack_template.html`
   - Static anchors for issuer/arranger (form/wire/T&Cs) are still in this template.
3. **Store PDF** in `deal-documents` bucket and create `documents` record.
4. **Ready for signature**:
   - `versotech-portal/src/app/api/subscriptions/[id]/documents/[documentId]/ready-for-signature/route.ts`
   - Creates signature requests for `party_b`, `party_c`, then `party_a_n`.
5. **Anchor detection + placement**:
   - `versotech-portal/src/lib/signature/anchor-detector.ts`
   - Anchors are detected and used for Y placement (anchor-based Y).
   - X positions use VC215-aligned fixed columns by label.
6. **Signature embedding**:
   - `versotech-portal/src/lib/signature/pdf-processor.ts`
   - Uses stored placements; updates `deal-documents` after each signature.

### What Was Wrong (Pre-VC215 Alignment)
- **Appendix signatures were still generated**:
  - Appendix no longer needs signatures; only form + main for Party A.
- **X positions did not match VC215 layout**:
  - Main agreement signatures are stacked left (not center/right columns).
  - T&Cs signature page is centered (not left-aligned).
  - Wire instructions line width did not align to the left-column X.
- **Block integrity and visibility needed hardening**:
  - `page-break-inside: avoid` needed reinforcement.
  - Anchor visibility on gray backgrounds required tuning.

### Evidence (Sample Wrong PDF)
Sample file:
- `VERSO/VERSOsign/8753bf9d-babf-4174-9bc5-75d65c3b0a39_subscription_1768772732090.pdf`
Note: This sample predates VC215 alignment and includes appendix anchors that are now removed.

Anchors detected by PDF.js (page numbers are PDF-indexed; cover pages may shift the form page):

| Anchor | Page | X (pt) | Y (pt) | Notes |
|--------|------|--------|--------|-------|
| party_b_form | 3 | 85.8 | 668.1 | form page |
| party_a_form | 3 | 312.3 | 680.8 | form page |
| party_a_2_form | 3 | 312.3 | 555.9 | form page |
| party_b_wire | 4 | 79.5 | 66.3 | space-corrupted text "SIG ANCHOR" |
| party_a | 14 | 79.5 | 658.9 | main agreement |
| party_a_2 | 14 | 79.5 | 485.4 | main agreement |
| party_b | 14 | 79.5 | 311.8 | main agreement |
| party_c | 14 | 79.5 | 66.3 | space-corrupted text "SIG ANCHOR" |
| party_b_tcs | 42 | 79.5 | 615.9 | T&Cs signature page |
| party_c_tcs | 42 | 79.5 | 445.1 | T&Cs signature page |

Signature block "Name:" text positions (same PDF):

| Page | Text | X (pt) | Y (pt) |
|------|------|--------|--------|
| 3 | Name: Julien Machot | 85.8 | 572.1 |
| 3 | Name: Sarah Ghiless | 312.3 | 584.8 |
| 3 | Name: Ghiles Moussaoui | 312.3 | 460.0 |
| 14 | Name: Sarah Ghiless | 79.5 | 542.5 |
| 14 | Name: Ghiles Moussaoui | 79.5 | 369.0 |
| 14 | Name: Julien Machot | 79.5 | 195.4 |
| 15 | Name: Julien Machot | 79.5 | 608.8 | indicates block split |
| 42 | Name: Julien Machot | 79.5 | 502.3 |
| 42 | Name: Julien Machot | 79.5 | 318.2 |

Mismatch summary:
- Stamped signatures appear around Y ~180pt (fixed Y path) while lines are much higher.
- One signature block is split across pages (anchor vs Name on different pages).
- Anchor-to-line offsets vary across block types.

### Root Causes
1. Fixed-Y placement logic hardcoded vertical positions (now removed):
   - `versotech-portal/src/lib/signature/anchor-detector.ts`
2. Anchors are placed at inconsistent points within blocks:
   - `VERSO/VERSOsign/subscription_pack_template.html`
   - `versotech-portal/src/app/api/approvals/[id]/action/route.ts`
   - `versotech-portal/src/app/api/subscriptions/[id]/regenerate/route.ts`
3. Renderer does not guarantee block integrity across page breaks.
4. Anchor CSS and placement differed between template and generated HTML (resolved in Round 1).

### Proposed Fixes (End-to-End)
1. **Remove appendix signatures**:
   - Delete appendix signature blocks from the template.
   - Stop generating appendix anchors and placements.
2. **Align X positions to VC215 layout**:
   - Main agreement signatures stacked left.
   - T&Cs signatures centered on the schedule signature page.
   - Wire instructions line width aligned to left-column X.
3. **Anchor placement on the signature line**:
   - Move the `SIG_ANCHOR:*` marker into the `.signature-line` element (or a consistent line-adjacent location).
   - This makes anchor Y a direct proxy for where the signature should be stamped.
4. **Prevent block splits**:
   - Apply `break-inside: avoid; page-break-inside: avoid; display: inline-block;` on the wrapper that includes the line + Name/Title.
5. **Use anchor Y for placements**:
   - Replace fixed Y with `anchor.rawY + offset`.
   - Offset should be derived from `SIGNATURE_CONFIG.pdf.signature.height` and metadata offsets.
6. **Standardize anchor CSS**:
   - Use one anchor CSS pattern in both the template and generated HTML.
   - The anchor must be invisible but extractable by PDF.js.
7. **Verification hooks**:
   - Log anchor positions and computed placements for each signer.
   - Fail early if required anchors are missing.

### Functional Requirements
- Support 1-10 signers without manual per-page calibration.
- Only Party A (subscriber) is multi-signatory; Party B/C are single static blocks.
- Each signer stamps only their own blocks on every required page:
  - party_a: form + main agreement
  - party_b: form + wire + main agreement + T&Cs
  - party_c: main agreement + T&Cs
- Signatures do not overlap names, titles, or wire instructions.
- No visible anchor text in the final PDF.

### Technical Requirements
- Anchor count matches expected formula: `6 + (2 * N)` where `N` is party_a signers.
- Anchor Y is used for placement (fixed Y only as fallback/debug).
- Anchor normalization still handles space-corrupted text.
- Signature blocks are not split across pages.

### Dependencies and Risks
- Off-page or fully transparent anchors can be dropped by the renderer.
- If anchors are not placed directly on the line, offsets must be recalibrated per block type.
- The template and API-generated HTML must stay aligned.
- Removing appendix signatures requires template + payload alignment to avoid stale anchors.

### Success Criteria (Testing Phase)
Acceptance criteria must pass on regenerated PDFs with 1, 2, 3, and 10 signers:
- All expected anchors exist and are detected (`detectAnchors()` logs).
- Placement Y matches anchor Y within +/- 5pt (after offset).
- All signatures appear on the correct line and correct page.
- No block split across pages (anchor and Name/Title in same page).
- No anchor text visible in the PDF.
- No appendix signature blocks or anchors present.
- Progressive signing continues to update `deal-documents` after each signer.

### Implementation Progress

**Round 1 (Template + Anchor Placement)**
- Updated `VERSO/VERSOsign/subscription_pack_template.html`:
  - `.signature-line` now `position: relative`
  - Added `.sig-anchor` class for on-line anchors
  - Moved static anchors into the signature line for form, wire, and T&Cs blocks
- Updated anchor placement in generated HTML:
  - `versotech-portal/src/app/api/subscriptions/[id]/regenerate/route.ts`
  - `versotech-portal/src/app/api/approvals/[id]/action/route.ts`
  - Anchors now live inside `.signature-line` with on-line CSS
  - Added inline `position:relative` on `.signature-line` for template-sync safety

**Round 2 (Anchor-Based Y Placement)**
- Updated `versotech-portal/src/lib/signature/anchor-detector.ts`:
  - Replaced fixed-Y placement with anchor-based Y (`anchor.rawY + offset`)
  - Added compact-layout offset for wire instructions to match embedding logic
  - Updated placement logs to reflect anchor-based Y

**Round 3 (Page-Break Hardening)**
- Updated `VERSO/VERSOsign/subscription_pack_template.html`:
  - Added `.signature-block-inline` to prevent block splitting in tables/form blocks
  - Reinforced `break-inside: avoid` rules (base + print)
- Updated generated HTML:
  - Added `signature-block-inline` to form signatory blocks in
    `regenerate/route.ts` and `action/route.ts`

**Round 4 (Anchor Visibility Tuning)**
- Updated anchor CSS in template + generated HTML to include `opacity:0.01`
- Target: reduce anchor visibility on gray backgrounds without breaking PDF.js extraction

**Round 5 (VC215 Alignment + Appendix Removal)**
- Updated `VERSO/VERSOsign/subscription_pack_template.html`:
  - Removed appendix signature block
  - Adjusted wire instruction line width (`wire-line`)
  - Aligned main agreement line width (`main-line`)
  - Centered T&Cs signature lines (`tcs-line`)
- Updated generated HTML:
  - Removed appendix signatory HTML from `regenerate/route.ts` and `action/route.ts`
- Updated anchor placement logic:
  - Removed appendix anchors for Party A
  - VC215-aligned X positions by label (form/main/T&Cs/wire)
  - Updated expected placement counts (Party A now 2 placements)
- Updated legacy helper + diagnostics:
  - `subscription-positions.ts` aligned to no appendix
  - `scripts/diagnose-pdf-text.ts`, `scripts/simple-pdf-diagnose.ts` expected anchors updated

**Round 6 (Automated Validation Script)**
- Added `scripts/validate-subscription-pack-signatures.mjs`:
  - Compares anchor-derived expected positions to actual `Signed:`/`Signer:` text in the PDF
  - Provides pass/fail report and exits non-zero on mismatches
- Fixed validator anchor regex (`SIG_ANCHOR:(\S+)`)
- Validation run (10/10 pass):
  - Unsigned: `VERSO/VERSOsign/1768864188174-VC215 - SUBSCRIPTION PACK - ANTHROPIC - Ghiless Business Ventures LLC - 190126.pdf`
  - Signed: `VERSO/VERSOsign/8753bf9d-babf-4174-9bc5-75d65c3b0a39_subscription_1768865439869.pdf`

---

## 19. Testing Procedure

### Pre-Test Database Cleanup

```sql
-- Replace 'xxx' with actual subscription ID
DELETE FROM signature_requests WHERE subscription_id = 'xxx';
DELETE FROM documents WHERE subscription_id = 'xxx' AND type LIKE '%subscription%';
```

### Test Checklist

#### Unsigned PDF Verification
- [ ] No visible "SIG_ANCHOR" text on any page
- [ ] No unexpected blank pages; signature blocks are not split across pages
- [ ] Correct total page count
- [ ] No appendix signature blocks or anchors present
- [ ] Console anchor count matches `6 + (2 * N)` where `N` is party_a signers

#### Signed PDF Verification (after each signature)
- [ ] Signature visible on correct pages
- [ ] Signature at correct X position (column)
- [ ] Signature at correct Y position (not covering content)
- [ ] Timestamp visible below signature
- [ ] Signer name visible below timestamp
- [ ] Previous signatures still present

#### Automated Validation (Recommended)

```bash
# Run from versotech-portal/
node scripts/validate-subscription-pack-signatures.mjs \
  --pdf /path/to/signed-subscription-pack.pdf \
  --unsigned /path/to/unsigned-subscription-pack.pdf \
  --subscribers 2 \
  --tolerance 10
```

- **Pass criteria**: All anchors (from unsigned PDF) map to `Signed:` and `Signer:` text (from signed PDF) within tolerance on the same page
- **Fail criteria**: Missing anchors, missing text, or Y deltas above tolerance

#### Validation Run (2026-01-19)

```bash
node scripts/validate-subscription-pack-signatures.mjs \
  --pdf "VERSO/VERSOsign/8753bf9d-babf-4174-9bc5-75d65c3b0a39_subscription_1768865439869.pdf" \
  --unsigned "VERSO/VERSOsign/1768864188174-VC215 - SUBSCRIPTION PACK - ANTHROPIC - Ghiless Business Ventures LLC - 190126.pdf" \
  --subscribers 2 \
  --tolerance 10
```

- Result: **10 passed, 0 failed**

### Example Console Output (post-fix; values will vary)

```
🔍 [ANCHOR] Scanning 50 pages for SIG_ANCHOR markers...
   📍 Found party_a_form on page 3
   📍 Found party_a on page 14
   📍 Found party_b_form on page 3
   📍 Found party_b_wire on page 4
   📍 Found party_b on page 14
   📍 Found party_b_tcs on page 42
   📍 Found party_c on page 14
   📍 Found party_c_tcs on page 42
✅ [ANCHOR] Found 10 anchor(s) total (N=2 party_a signers)

📍 [PLACEMENT] Calculating placements for party_a...
   ✓ party_a_form -> page 3, x=63%, y=585pt
   ✓ party_a -> page 14, x=29%, y=540pt
✅ [PLACEMENT] Created 2 placement(s)
```

---

## 20. Troubleshooting

### Problem: Anchors Still Visible

**Check**: Did you regenerate the pack AFTER the code change?
- Old PDFs still have old CSS
- Must generate NEW PDF to see fix

### Problem: Anchors Not Detected (0 found)

**Cause**: Off-page CSS might prevent PDF.js from extracting text

**Fix Options**:
1. Revert to `color:#ffffff` CSS
2. Implement page-number mapping (hardcode which pages need signatures)

### Problem: Signature Covers Content

**Cause**: Anchor placement or anchor-to-signature offset is wrong

**Fix**:
1. Open PDF in Adobe Acrobat
2. Enable coordinate display (View > Show/Hide > Cursor Coordinates)
3. Click on signature LINE (not the anchor)
4. Note Y coordinate (from bottom)
5. Update anchor placement to sit on the line, or adjust the anchor-to-signature offset in placement logic

### Problem: Wrong Page

**Cause**: Anchor not found or on different page than expected

**Debug**:
```typescript
// Add to anchor-detector.ts
console.log('ALL ANCHORS:', anchors.map(a => ({
  id: a.anchorId,
  page: a.pageNumber
})))
```

### Problem: Validation Script Fails

**Check**:
- Did you pass the correct PDF path?
- If anchors are missing, did you provide `--unsigned`?
- Are `anchor-detector.ts` and `pdf-processor.ts` offsets in sync?

**Fix**:
- Re-run generation/signing to ensure anchors and `Signed:`/`Signer:` text are from the same build

---

## 21. Change Log

| Date | Time | Change | Files | Author |
|------|------|--------|-------|--------|
| 2025-01-18 | - | Created initial documentation | SUBSCRIPTION_PACK_E2E.md | Claude |
| 2025-01-18 | - | Changed ANCHOR_CSS from white text to off-page positioning | regenerate/route.ts (historical line 256) | Claude |
| 2025-01-18 | - | Changed ANCHOR_CSS from white text to off-page positioning | action/route.ts (historical line 1113) | Claude |
| 2025-01-18 | - | Expanded documentation with complete details | SUBSCRIPTION_PACK_E2E.md | Claude |
| 2025-01-19 | - | Added critical findings about Y position mismatches | SUBSCRIPTION_PACK_E2E.md (§17) | Claude |
| 2025-01-19 | - | Documented page-break issues and per-block offset strategy | SUBSCRIPTION_PACK_E2E.md (§17) | Claude |
| 2025-01-19 | - | Added PRD section and removed fixed-Y contradictions | SUBSCRIPTION_PACK_E2E.md (§18-19) | Claude |
| 2025-01-19 | - | Round 1: Moved anchors onto signature lines in template + generation | subscription_pack_template.html, regenerate/route.ts, action/route.ts | Claude |
| 2025-01-19 | - | Round 2: Switched placement to anchor-based Y | anchor-detector.ts | Claude |
| 2025-01-19 | - | Round 3: Hardened page-breaks for signature blocks | subscription_pack_template.html, regenerate/route.ts, action/route.ts | Claude |
| 2025-01-19 | - | Round 4: Added opacity to anchor CSS to reduce visibility | subscription_pack_template.html, regenerate/route.ts, action/route.ts | Claude |
| 2025-01-19 | - | Round 5: Removed appendix signatures + aligned X positions to VC215 | subscription_pack_template.html, anchor-detector.ts, client.ts, regenerate/route.ts, action/route.ts | Claude |
| 2025-01-19 | - | Updated diagnostics + legacy position helper to remove appendix anchors | subscription-positions.ts, diagnose-pdf-text.ts, simple-pdf-diagnose.ts | Claude |
| 2026-01-19 | - | Round 6: Added automated signature placement validation script | scripts/validate-subscription-pack-signatures.mjs | Claude |
| 2026-01-19 | - | Round 6: Fixed validator anchor regex + validated signed/unsigned pack (10/10 pass) | scripts/validate-subscription-pack-signatures.mjs, SUBSCRIPTION_PACK_E2E.md | Claude |
| 2026-01-20 | - | Round 7: Commit subscription on investor signatures; publish on full execution | src/lib/signature/client.ts, src/lib/signature/handlers.ts | Claude |

---

## Quick Reference Card

### Files to Edit for Common Changes

| Change | File | Line |
|--------|------|------|
| X positions (columns) | `src/lib/signature/anchor-detector.ts` | 224 |
| Placement logic (anchor-based Y) | `src/lib/signature/anchor-detector.ts` | 295 |
| Anchor CSS (visibility) | `src/app/api/subscriptions/[id]/regenerate/route.ts` | 250 |
| Anchor CSS (visibility) | `src/app/api/approvals/[id]/action/route.ts` | 1107 |
| Anchor placement in template | `VERSO/VERSOsign/subscription_pack_template.html` | signature blocks |
| Signature size | `src/lib/signature/config.ts` | SIGNATURE_CONFIG |
| PDF embedding | `src/lib/signature/pdf-processor.ts` | embedSignatureMultipleLocations |
| Validation script | `scripts/validate-subscription-pack-signatures.mjs` | - |

### Current Values

```typescript
// ANCHOR_CSS (current)
// API-generated HTML + template:
'position:absolute;left:0;top:0;font-size:1px;line-height:1px;color:#ffffff;opacity:0.01;'

// X Positions
party_a on form: 0.63 (63%)
party_a on main: 0.29 (29%)
party_b on form: 0.20 (20%)
party_b on wire: 0.25 (25%)
party_b on main: 0.29 (29%)
party_b on tcs: 0.43 (43%)
party_c on main: 0.29 (29%)
party_c on tcs: 0.43 (43%)

// Y Positions
// Anchor-based: signatureY = anchor.rawY + offset
// Fixed Y values are deprecated (see PRD Section 18)
```

---

**END OF DOCUMENTATION**
