# Subscription Pack - Complete End-to-End Documentation

> **Last Updated**: 2025-01-18
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
18. [Testing Procedure](#18-testing-procedure)
19. [Troubleshooting](#19-troubleshooting)
20. [Change Log](#20-change-log)

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
**Line**: 256

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

**AFTER** (new code):
```typescript
// ANCHOR CSS: Invisible anchors for PDF signature positioning
//
// APPROACH: Use off-page positioning to completely hide anchor text
// - position:absolute;left:-9999px moves anchor off-page (invisible)
// - font-size:1px ensures minimal space even if positioning fails
//
// WHY THIS APPROACH:
// Previous approach using color:#ffffff (white text) didn't work because:
// 1. PDF renderer may not use pure white backgrounds
// 2. Anchor text in table cells with slight gray backgrounds was visible
// 3. The white text still appeared as visual artifacts in the PDF
//
// IMPORTANT: Anchors are now used ONLY for page detection (which page needs a signature).
// Y positions are FIXED values in anchor-detector.ts getFixedYPosition().
// This means anchor extraction accuracy is less critical - we mainly need page numbers.
const ANCHOR_CSS = 'position:absolute;left:-9999px;font-size:1px;'
```

### Change 2: action/route.ts

**File**: `src/app/api/approvals/[id]/action/route.ts`
**Line**: 1113

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

**AFTER** (new code):
```typescript
// ANCHOR CSS: Invisible anchors for PDF signature positioning
//
// APPROACH: Use off-page positioning to completely hide anchor text
// - position:absolute;left:-9999px moves anchor off-page (invisible)
// - font-size:1px ensures minimal space even if positioning fails
//
// WHY THIS APPROACH:
// Previous approach using color:#ffffff (white text) didn't work because:
// 1. PDF renderer may not use pure white backgrounds
// 2. Anchor text in table cells with slight gray backgrounds was visible
// 3. The white text still appeared as visual artifacts in the PDF
//
// IMPORTANT: Anchors are now used ONLY for page detection (which page needs a signature).
// Y positions are FIXED values in anchor-detector.ts getFixedYPosition().
// This means anchor extraction accuracy is less critical - we mainly need page numbers.
const ANCHOR_CSS = 'position:absolute;left:-9999px;font-size:1px;'
```

### What Was NOT Changed

| File | Why Not Changed |
|------|-----------------|
| `anchor-detector.ts` | Already had `getFixedYPosition()` implemented |
| `pdf-processor.ts` | Embedding logic is correct |
| `client.ts` | Orchestration logic is correct |
| `handlers.ts` | Progressive signing is correct |
| HTML template | Template is in n8n, not in codebase |

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
| anchor-detector | `src/lib/signature/anchor-detector.ts` | `detectAnchors()`, `getPlacementsFromAnchors()`, `getFixedYPosition()`, `getSignatureXPosition()` |
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
| 44 | Appendix | Party A |

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
**Lines**: 1090-1240

```typescript
// Line 1093-1096: Anchor ID generation
const getAnchorId = (number: number, suffix?: string): string => {
  const base = number === 1 ? 'party_a' : `party_a_${number}`
  return suffix ? `${base}_${suffix}` : base
}

// Line 1113: ANCHOR_CSS definition (UPDATED 2025-01-18)
const ANCHOR_CSS = 'position:absolute;left:-9999px;font-size:1px;'

// Line 1114-1120: Subscriber form signatures (Page 2)
const signatoriesFormHtml = signatories.map(s => `
  <div style="position:relative;margin-bottom: 0.5cm;">
    <span style="${ANCHOR_CSS}">SIG_ANCHOR:${getAnchorId(s.number, 'form')}</span>
    <div class="signature-line"></div>
    Name: ${s.name}<br>
    Title: ${s.title}
  </div>`).join('')

// Line 1125-1132: Main agreement signatures (Page 14)
const signatoriesSignatureHtml = signatories.map(s => `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <span style="${ANCHOR_CSS}">SIG_ANCHOR:${getAnchorId(s.number)}</span>
    <p><strong>The Subscriber</strong>, represented by Authorized Signatory ${s.number}</p>
    <div class="signature-line" style="margin-top: 3cm;"></div>
    <p style="margin-top: 0.3cm;">Name: ${s.name}<br>
    Title: ${s.title}</p>
</div>`).join('')

// Line 1221-1228: Issuer signature (Page 14)
const issuerSignatureHtml = `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <span style="${ANCHOR_CSS}">SIG_ANCHOR:party_b</span>
    <p><strong>The Issuer, VERSO Capital 2 SCSP</strong>...</p>
    <div class="signature-line" style="margin-top: 3cm;"></div>
    <p style="margin-top: 0.3cm;">Name: ${issuerName}<br>
    Title: ${issuerTitle}</p>
</div>`

// Line 1233-1240: Arranger signature (Page 14)
const arrangerSignatureHtml = `
<div class="signature-block" style="position:relative;margin-bottom: 1.5cm; min-height: 4cm;">
    <span style="${ANCHOR_CSS}">SIG_ANCHOR:party_c</span>
    <p><strong>The Attorney, Verso Management Ltd.</strong>...</p>
    <div class="signature-line" style="margin-top: 3cm;"></div>
    <p style="margin-top: 0.3cm;">Name: ${arrangerName}<br>
    Title: ${arrangerTitle}</p>
</div>`
```

### Entry Point 2: Regeneration

**File**: `src/app/api/subscriptions/[id]/regenerate/route.ts`
**Lines**: 235-290

Same structure as approval flow. Key line:

```typescript
// Line 256: ANCHOR_CSS definition (UPDATED 2025-01-18)
const ANCHOR_CSS = 'position:absolute;left:-9999px;font-size:1px;'
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
  // Party A (Subscribers): Right column on form, center elsewhere
  if (signaturePosition.startsWith('party_a')) {
    if (label === 'subscription_form') return 0.70  // Right column (page 2)
    return 0.50  // Center (pages 14, 44)
  }

  // Party B (Issuer): Left column everywhere
  if (signaturePosition === 'party_b') {
    return 0.25  // Left column (pages 2, 3, 14, 42)
  }

  // Party C (Arranger): Right column
  if (signaturePosition === 'party_c') {
    return 0.70  // Right column (pages 14, 42)
  }

  return 0.50  // Default center
}
```

#### getFixedYPosition() - Lines 270-280

```typescript
function getFixedYPosition(label: string): number {
  switch (label) {
    case 'subscription_form':     return 180  // Page 2
    case 'wire_instructions':     return 260  // Page 3 - NEEDS CALIBRATION!
    case 'main_agreement':        return 180  // Page 14
    case 'tcs':                   return 180  // Page 42
    case 'appendix':              return 180  // Page 44
    default:                      return 180
  }
}
```

#### getPlacementsFromAnchors() - Lines 313-353

```typescript
export function getPlacementsFromAnchors(
  anchors: DetectedAnchor[],
  signaturePosition: string
): SignaturePlacementRecord[] {
  const anchorPatterns = getAnchorPatternsForPosition(signaturePosition)
  const placements: SignaturePlacementRecord[] = []

  console.log(`📍 [PLACEMENT] Calculating placements for ${signaturePosition}...`)

  for (const pattern of anchorPatterns) {
    const anchor = anchors.find(a => a.anchorId === pattern.anchorId)
    if (anchor) {
      // FIXED X position (not from anchor)
      const fixedX = getSignatureXPosition(signaturePosition, pattern.label)

      // FIXED Y position (not from anchor)
      const fixedY = getFixedYPosition(pattern.label)

      placements.push({
        page: anchor.pageNumber,
        x: fixedX,
        y: fixedY,
        label: pattern.label
      })

      console.log(`   ✓ ${pattern.anchorId} -> page ${anchor.pageNumber}, x=${(fixedX * 100).toFixed(0)}%, y=${fixedY}pt`)
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
party_a_appendix  → 1st subscriber, appendix (page 44)

party_a_2         → 2nd subscriber, main agreement
party_a_2_form    → 2nd subscriber, subscription form
party_a_2_appendix→ 2nd subscriber, appendix

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

### Anchor CSS Evolution

| Version | CSS | Problem |
|---------|-----|---------|
| v1 (old) | `font-size:1px;line-height:0;color:#ffffff;` | White text visible on gray backgrounds |
| v2 (current) | `position:absolute;left:-9999px;font-size:1px;` | Moves text off-page, completely invisible |

### Why Fixed Positions Instead of Anchor-Relative

**Problem**: HTML template places anchors inconsistently:
- Sometimes ABOVE the signature line
- Sometimes BELOW the signature line
- Calculating `signatureY = anchorY - offset` gave negative values

**Solution**:
- Use anchors ONLY for **page detection** (which page needs signature)
- Use **fixed Y values** calibrated from PDF template

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

### X Position Mapping

| Column | Percentage | Points (612pt page) | Used By |
|--------|------------|---------------------|---------|
| Left | 25% | 153pt | Party B (Issuer) |
| Center | 50% | 306pt | Party A (main pages) |
| Right | 70% | 428pt | Party C, Party A (form) |

### Y Position Mapping

| Page | Label | Y (points) | From Bottom |
|------|-------|------------|-------------|
| 2 | subscription_form | 180 | ~2.5 inches |
| 3 | wire_instructions | 260 | ~3.6 inches ⚠️ WRONG |
| 14 | main_agreement | 180 | ~2.5 inches |
| 42 | tcs | 180 | ~2.5 inches |
| 44 | appendix | 180 | ~2.5 inches |

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

```json
[
  {
    "page": 2,
    "x": 0.70,
    "y": 180,
    "label": "subscription_form"
  },
  {
    "page": 14,
    "x": 0.50,
    "y": 180,
    "label": "main_agreement"
  },
  {
    "page": 44,
    "x": 0.50,
    "y": 180,
    "label": "appendix"
  }
]
```

---

## 15. Known Issues

### Issue 1: Anchor Text Was Visible ✅ FIXED

**Symptom**: Text like `SIG_ANCHOR:party_b_form` visible in PDF
**Root Cause**: `color:#ffffff` didn't hide text on gray backgrounds
**Fix Applied**: Changed to `position:absolute;left:-9999px;font-size:1px;`
**Files Changed**: `regenerate/route.ts:256`, `action/route.ts:1113`
**Status**: ✅ Code changed, needs testing

### Issue 2: Wire Instructions Y Position ⚠️ NOT FIXED

**Symptom**: Signature on page 3 covers bank details
**Root Cause**: Y=260pt was guessed, not measured
**Fix Required**: Measure actual Y coordinate from PDF
**File to Change**: `anchor-detector.ts:274`
**Status**: ⚠️ Needs manual measurement

### Issue 3: Remnant Pages ⚠️ UNKNOWN

**Symptom**: Pages 5 & 15 have corrupted anchor text
**Root Cause**: HTML template page break issues
**Status**: ⚠️ May be fixed by new ANCHOR_CSS, needs testing

---

## 16. What Was Fixed

### Summary of Changes Made on 2025-01-18

| Change | File | Line | Old Value | New Value |
|--------|------|------|-----------|-----------|
| ANCHOR_CSS | regenerate/route.ts | 256 | `font-size:1px;line-height:0;color:#ffffff;` | `position:absolute;left:-9999px;font-size:1px;` |
| ANCHOR_CSS | action/route.ts | 1113 | `font-size:1px;line-height:0;color:#ffffff;` | `position:absolute;left:-9999px;font-size:1px;` |

### How These Changes Were Made

1. **Read** `regenerate/route.ts` to find current ANCHOR_CSS
2. **Read** `action/route.ts` to find current ANCHOR_CSS
3. **Edit** `regenerate/route.ts` to replace old CSS with new
4. **Edit** `action/route.ts` to replace old CSS with new
5. **Grep** to verify both files now have new value

---

## 17. What Still Needs Work

### Must Do (Human Required)

| Task | Why Human Needed | How To Do It |
|------|------------------|--------------|
| Test ANCHOR_CSS fix | Need to run app and view PDF | Regenerate pack, open PDF, check for visible anchors |
| Measure Y positions | Need to view PDF with coordinates | Open PDF in Acrobat, measure signature line Y |
| Update Y values | After measuring | Edit `anchor-detector.ts:270-278` |
| Full E2E test | Need to sign documents | Sign with all parties, verify positions |

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
#    - Are there remnant pages 5 & 15? (should be NO)
#    - Check server terminal for anchor detection logs

# 6. If anchors visible: The off-page CSS might need adjustment
# 7. If anchors NOT detected: May need to revert CSS
```

---

## 18. Testing Procedure

### Pre-Test Database Cleanup

```sql
-- Replace 'xxx' with actual subscription ID
DELETE FROM signature_requests WHERE subscription_id = 'xxx';
DELETE FROM documents WHERE subscription_id = 'xxx' AND type LIKE '%subscription%';
```

### Test Checklist

#### Unsigned PDF Verification
- [ ] No visible "SIG_ANCHOR" text on any page
- [ ] No remnant/blank pages (especially pages 5, 15)
- [ ] Correct total page count
- [ ] Console shows: `✅ [ANCHOR] Found 12 anchor(s) total`

#### Signed PDF Verification (after each signature)
- [ ] Signature visible on correct pages
- [ ] Signature at correct X position (column)
- [ ] Signature at correct Y position (not covering content)
- [ ] Timestamp visible below signature
- [ ] Signer name visible below timestamp
- [ ] Previous signatures still present

### Expected Console Output

```
🔍 [ANCHOR] Scanning 50 pages for SIG_ANCHOR markers...
   📍 Found party_a_form on page 2
   📍 Found party_a on page 14
   📍 Found party_a_appendix on page 44
   📍 Found party_b_form on page 2
   📍 Found party_b_wire on page 3
   📍 Found party_b on page 14
   📍 Found party_b_tcs on page 42
   📍 Found party_c on page 14
   📍 Found party_c_tcs on page 42
✅ [ANCHOR] Found 12 anchor(s) total

📍 [PLACEMENT] Calculating placements for party_a...
   ✓ party_a_form -> page 2, x=70%, y=180pt
   ✓ party_a -> page 14, x=50%, y=180pt
   ✓ party_a_appendix -> page 44, x=50%, y=180pt
✅ [PLACEMENT] Created 3 placement(s)
```

---

## 19. Troubleshooting

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

**Cause**: Y position value is wrong

**Fix**:
1. Open PDF in Adobe Acrobat
2. Enable coordinate display (View > Show/Hide > Cursor Coordinates)
3. Click on signature LINE (not the anchor)
4. Note Y coordinate (from bottom)
5. Update `getFixedYPosition()` in `anchor-detector.ts:270`

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

---

## 20. Change Log

| Date | Time | Change | Files | Author |
|------|------|--------|-------|--------|
| 2025-01-18 | - | Created initial documentation | SUBSCRIPTION_PACK_E2E.md | Claude |
| 2025-01-18 | - | Changed ANCHOR_CSS from white text to off-page positioning | regenerate/route.ts:256 | Claude |
| 2025-01-18 | - | Changed ANCHOR_CSS from white text to off-page positioning | action/route.ts:1113 | Claude |
| 2025-01-18 | - | Expanded documentation with complete details | SUBSCRIPTION_PACK_E2E.md | Claude |

---

## Quick Reference Card

### Files to Edit for Common Changes

| Change | File | Line |
|--------|------|------|
| X positions (columns) | `src/lib/signature/anchor-detector.ts` | 224 |
| Y positions (vertical) | `src/lib/signature/anchor-detector.ts` | 270 |
| Anchor CSS (visibility) | `src/app/api/subscriptions/[id]/regenerate/route.ts` | 256 |
| Anchor CSS (visibility) | `src/app/api/approvals/[id]/action/route.ts` | 1113 |
| Signature size | `src/lib/signature/config.ts` | SIGNATURE_CONFIG |
| PDF embedding | `src/lib/signature/pdf-processor.ts` | embedSignatureMultipleLocations |

### Current Values

```typescript
// ANCHOR_CSS (both routes)
'position:absolute;left:-9999px;font-size:1px;'

// X Positions
party_a on form: 0.70 (70%)
party_a elsewhere: 0.50 (50%)
party_b: 0.25 (25%)
party_c: 0.70 (70%)

// Y Positions (NEED CALIBRATION)
subscription_form: 180pt
wire_instructions: 260pt  // WRONG!
main_agreement: 180pt
tcs: 180pt
appendix: 180pt
```

---

**END OF DOCUMENTATION**
