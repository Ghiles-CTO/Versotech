# VERSO Subscription Pack: End-to-End Technical Documentation

## Overview

This document explains the complete flow from subscription pack generation to multi-signatory signing. Use this as a reference for understanding and fixing signature placement issues.

---

## 1. Document Generation Flow

### 1.1 N8N Workflow Trigger

The subscription pack is generated via N8N workflow when triggered from the portal.

**API Endpoint:** `POST /api/subscriptions/[id]/regenerate`

**Workflow Key:** `generate-subscription-pack`

### 1.2 Payload Structure Sent to N8N

```typescript
const subscriptionPayload = {
  // Output format: 'pdf' or 'docx'
  output_format: 'docx',  // N8N always returns DOCX first

  // Series & Investment info
  series_number: 'VC207',
  series_title: 'ANTHROPIC',
  series_short_title: 'ANTHROPIC',
  ultimate_investment: 'Anthropic',

  // Subscriber info
  subscriber_name: 'Ghiless Business Ventures LLC',
  subscriber_type: 'CORPORATE ENTITY',
  subscriber_address: '123 Main St, City, Country',
  subscriber_block: 'Ghiless Business Ventures LLC, a corporate entity...',
  subscriber_title: 'Authorized Representative',
  subscriber_representative_name: 'John Doe',

  // Financial details
  certificates_count: '100',
  price_per_share: '1000.00',
  subscription_amount: '100000.00',
  subscription_fee_rate: '2.00%',
  subscription_fee_amount: '2000.00',
  total_subscription_price: '102000.00',
  currency_code: 'USD',

  // Wire instructions
  wire_bank_name: 'Banque de Luxembourg',
  wire_iban: 'LU28 0019 4855 4447 1000',
  wire_bic: 'BLUXLULL',
  // ... more wire details

  // Issuer info
  issuer_gp_name: 'VERSO Capital 2 GP SARL',
  issuer_name: 'Alexandre Müller',
  issuer_title: 'Authorized Signatory',

  // Arranger info
  arranger_name: 'Julien Machot',
  arranger_title: 'Director',
  arranger_company_name: 'VERSO Management',

  // CRITICAL: Multi-signatory support
  // N8N doesn't support Handlebars {{#each}}, so we pre-render HTML
  signatories_table_html: '<div>...pre-rendered signatory table...</div>',
  signatories_signature_html: '<div>...pre-rendered signature blocks...</div>',
  signatories_appendix_html: '<div>...pre-rendered appendix signatures...</div>',

  // Metadata
  is_regeneration: true,
  original_subscription_id: 'uuid-here'
}
```

### 1.3 Pre-Rendered HTML for Signatories

Since N8N can't loop through arrays, the portal pre-renders HTML for multiple signatories:

```typescript
// For each signatory, generates signature blocks like:
const signatoriesSignatureHtml = signatories.map(s => `
  <div class="signature-block" style="margin-bottom: 0.8cm;">
    <p><strong>The Subscriber</strong>, represented by Authorized Signatory ${s.number}</p>
    <div class="signature-line"></div>
    <p>Name: ${s.name}<br>
    Title: ${s.title}</p>
  </div>
`).join('')
```

---

## 2. Template Structure (HTML)

### 2.1 Template Location

**Primary Template:** `/VERSO/VERSOsign/subscription_pack_template.html` (93KB, untracked)

**DOCX Template:** `/VCXXXSHXXX - LAST NAME FIRST NAME or ENTITY NAME template.docx` (2.1MB)

### 2.2 Key Placeholders in Template

The template uses `{{placeholder_name}}` syntax that N8N replaces:

| Placeholder | Example Value | Description |
|-------------|---------------|-------------|
| `{{subscriber_name}}` | Ghiless Business Ventures LLC | Legal entity name |
| `{{series_number}}` | VC207 | Fund series code |
| `{{subscription_amount}}` | 100,000.00 | Commitment amount |
| `{{signatories_signature_html}}` | Pre-rendered HTML | Signature blocks for all signatories |
| `{{issuer_name}}` | Alexandre Müller | Countersigner name |

### 2.3 Signature Page Structure

The signature page in the template should have:

```html
<!-- INVESTOR SIGNATURES (Party A) - Multiple blocks stacked vertically -->
<div id="investor-signatures">
  {{signatories_signature_html}}
</div>

<!-- COUNTERSIGNER (Party B) - Single block at bottom -->
<div id="countersigner-signature">
  <p><strong>For and on behalf of the Issuer:</strong></p>
  <div class="signature-line"></div>
  <p>Name: {{issuer_name}}<br>
  Title: {{issuer_title}}</p>
</div>
```

---

## 3. VERSOsign: Signature Request Flow

### 3.1 Creating Signature Requests

**API Endpoint:** `POST /api/subscriptions/[id]/documents/[documentId]/ready-for-signature`

When "Send for Signature" is clicked, the system:

1. Creates one `signature_request` per signatory
2. Assigns signature positions: `party_a`, `party_a_2`, `party_a_3`, etc.
3. Creates one `signature_request` for countersigner: `party_b`

```typescript
// Example: 2 investors + 1 countersigner
const signatureRequests = [
  {
    signer_name: 'Sarah Ghiless',
    signer_role: 'investor',
    signature_position: 'party_a',
    document_id: 'doc-uuid',
    subscription_id: 'sub-uuid'
  },
  {
    signer_name: 'Ghiles Moussaoui',
    signer_role: 'investor',
    signature_position: 'party_a_2',
    document_id: 'doc-uuid',
    subscription_id: 'sub-uuid'
  },
  {
    signer_name: 'Alexandre Müller',
    signer_role: 'admin',
    signature_position: 'party_b',
    document_id: 'doc-uuid',
    subscription_id: 'sub-uuid'
  }
]
```

### 3.2 Signature Position Types

```typescript
// Defined in src/lib/signature/types.ts
export type SignaturePosition =
  | 'party_a' | 'party_a_1' | 'party_a_2' | 'party_a_3' | 'party_a_4' | 'party_a_5'
  | 'party_b' | 'party_b_1' | 'party_b_2' | 'party_b_3' | 'party_b_4' | 'party_b_5'
```

---

## 4. Signature Embedding: Position Calculation

### 4.1 Core Files

| File | Purpose |
|------|---------|
| `src/lib/signature/helpers.ts` | Position calculation logic |
| `src/lib/signature/pdf-processor.ts` | PDF embedding |
| `src/lib/signature/config.ts` | Dimensions and constants |

### 4.2 Position Calculation Logic

**File:** `src/lib/signature/helpers.ts`

```typescript
export function calculateSignaturePosition(
  position: string,          // 'party_a', 'party_a_2', 'party_b', etc.
  totalPartyASignatories: number = 1,
  documentType: string = 'nda'
): { xPercent: number; yFromBottom: number } {

  const { party, index } = parseSignaturePosition(position)
  // 'party_a_2' → { party: 'a', index: 2 }

  // SUBSCRIPTION PACK: Stacked vertical layout
  if (documentType === 'subscription') {
    const xPercent = 0.15  // 15% from left (left-aligned)

    // Party B (countersigner): at bottom
    if (party === 'b') {
      return {
        xPercent,
        yFromBottom: 180  // Fixed Y near bottom
      }
    }

    // Party A (investors): stack from top down
    const startY = 480    // First signature Y position
    const spacing = 100   // 100pt between each signature

    // Index 1 at TOP, subsequent indices move DOWN
    const yFromBottom = startY - (index - 1) * spacing

    return { xPercent, yFromBottom }
  }

  // NDA: Side-by-side columns (different layout)
  // ... NDA logic
}
```

### 4.3 Current Coordinate Values (Subscription Pack)

| Position | X (% from left) | Y (from bottom) | Notes |
|----------|-----------------|-----------------|-------|
| `party_a` | 15% | 480pt | First investor, top position |
| `party_a_2` | 15% | 380pt | Second investor, below first |
| `party_a_3` | 15% | 280pt | Third investor, below second |
| `party_b` | 15% | 180pt | Countersigner, at bottom |

### 4.4 Signature Dimensions

**File:** `src/lib/signature/config.ts`

```typescript
export const SIGNATURE_CONFIG = {
  pdf: {
    signature: {
      width: 180,   // Signature image width in points
      height: 70    // Signature image height in points
    },
    metadata: {
      timestampFontSize: 7,
      timestampOffsetY: 15,   // Below signature
      signerNameOffsetY: 27   // Below timestamp
    }
  }
}
```

---

## 5. Progressive Signing (Signature Chaining)

### 5.1 The Problem

When multiple people sign the same document, each signature must be ADDED to the previous signatures. Without chaining, each signer gets a fresh copy and the final PDF only has ONE signature.

### 5.2 Chain Query Logic

**File:** `src/lib/signature/client.ts` (lines 840-883)

```typescript
// When a signer submits their signature:
if (!pdfBytes && signatureRequest.document_id) {
  // Query for OTHER signature requests on this document that are already SIGNED
  const { data: otherSignatures } = await supabase
    .from('signature_requests')
    .select('id, status, signed_pdf_path, signer_role, signer_name, signature_position, updated_at')
    .eq('document_id', signatureRequest.document_id)  // Same document
    .neq('id', signatureRequest.id)                   // Not current request
    .eq('status', 'signed')                           // Already signed
    .order('updated_at', { ascending: false })        // Most recent first

  if (otherSignatures && otherSignatures.length > 0) {
    // Use the most recently signed PDF as base
    const mostRecentSigned = otherSignatures[0]
    pdfBytes = await storage.downloadPDF(mostRecentSigned.signed_pdf_path)
    // This PDF already contains previous signatures!
  }
}

// If no chain found, download original unsigned PDF
if (!pdfBytes) {
  pdfBytes = await storage.downloadPDF(signatureRequest.unsigned_pdf_path)
}
```

### 5.3 Expected Chaining Behavior

| Signer Order | Base PDF | Result |
|--------------|----------|--------|
| Sarah (1st) | Original unsigned (255KB) | Sarah's signature (270KB) |
| Ghiles (2nd) | Sarah's signed PDF (270KB) | Sarah + Ghiles (285KB) |
| Alexandre (3rd) | Ghiles's signed PDF (285KB) | All 3 signatures (300KB) |

### 5.4 Known Bug

**Current Issue:** Chain query returns empty even when previous signatures exist.

**Evidence:** All signers have same `unsigned_pdf_size` (255,425 bytes) instead of increasing sizes.

**Debug logging added at:** `src/lib/signature/client.ts` lines 842-870

---

## 6. Database Schema

### 6.1 Key Tables

**`signature_requests`**
```sql
id                    UUID PRIMARY KEY
document_id           UUID          -- Links to documents table
subscription_id       UUID          -- Links to subscriptions table
signer_name           TEXT
signer_email          TEXT
signer_role           TEXT          -- 'investor', 'admin', 'arranger'
signature_position    TEXT          -- 'party_a', 'party_a_2', 'party_b'
status                TEXT          -- 'pending', 'signed', 'expired'
unsigned_pdf_path     TEXT          -- Storage path to unsigned PDF
unsigned_pdf_size     BIGINT        -- Size before signing
signed_pdf_path       TEXT          -- Storage path after signing
signed_pdf_size       BIGINT        -- Size after signing
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

**`documents`**
```sql
id                    UUID PRIMARY KEY
name                  TEXT          -- Display name
file_key              TEXT          -- Storage path
type                  TEXT          -- 'subscription_pack', 'nda', etc.
status                TEXT          -- 'draft', 'final', 'signed', 'published'
subscription_id       UUID
countersigner_name    TEXT          -- For signature flow
countersigner_email   TEXT
countersigner_title   TEXT
```

---

## 7. API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/subscriptions/[id]/regenerate` | POST | Generate subscription pack via N8N |
| `/api/subscriptions/[id]/documents/[docId]/ready-for-signature` | POST | Create signature requests |
| `/api/signature/submit` | POST | Submit a signature |
| `/api/signature/view/[token]` | GET | Get signing page data |
| `/api/documents/[id]` | GET | Get document details |

---

## 8. File Locations Summary

| Component | File Path |
|-----------|-----------|
| Signature Types | `src/lib/signature/types.ts` |
| Position Calculator | `src/lib/signature/helpers.ts` |
| PDF Embedder | `src/lib/signature/pdf-processor.ts` |
| Signature Config | `src/lib/signature/config.ts` |
| Main Client | `src/lib/signature/client.ts` |
| Ready for Signature API | `src/app/api/subscriptions/[id]/documents/[documentId]/ready-for-signature/route.ts` |
| Regenerate API | `src/app/api/subscriptions/[id]/regenerate/route.ts` |
| Submit Signature API | `src/app/api/signature/submit/route.ts` |

---

## 9. What Needs Fixing

### 9.1 Template Signature Block Placement

The HTML template needs signature blocks positioned where the coordinate system expects them:

- **Party A blocks** should be stacked vertically on the LEFT side
- **Party B block** should be at the BOTTOM, same X position
- Each block needs sufficient spacing (100pt = ~35mm)

### 9.2 Coordinate Calibration

The coordinates in `helpers.ts` need to match the ACTUAL template:

```typescript
// CURRENT VALUES (may need adjustment based on template)
// Subscription pack layout:
party_a:   { xPercent: 0.15, yFromBottom: 480 }
party_a_2: { xPercent: 0.15, yFromBottom: 380 }
party_a_3: { xPercent: 0.15, yFromBottom: 280 }
party_b:   { xPercent: 0.15, yFromBottom: 180 }
```

**To calibrate:**
1. Open the generated PDF
2. Find the signature boxes in the template
3. Measure their X and Y positions (in points, 72pt = 1 inch)
4. Update the values in `helpers.ts`

### 9.3 Signature Chaining Bug

The chain query in `client.ts` is not finding previous signatures. Debug logs have been added - need to analyze output to find root cause.

---

## 10. Testing Checklist

1. [ ] Generate subscription pack with 2+ signatories
2. [ ] Verify signature blocks appear in correct positions in PDF
3. [ ] Sign as first investor - verify signature appears in correct spot
4. [ ] Sign as second investor - verify BOTH signatures visible
5. [ ] Sign as countersigner - verify ALL signatures visible
6. [ ] Verify final PDF file size increases with each signature

---

## 11. Quick Reference: PDF Coordinate System

```
PDF Page (A4: 595 × 842 points)
┌──────────────────────────────────────┐
│                                      │  Y = 842 (TOP)
│                                      │
│   ┌─────────────┐                    │  Y = 480 (party_a)
│   │ Signature 1 │                    │
│   └─────────────┘                    │
│   ┌─────────────┐                    │  Y = 380 (party_a_2)
│   │ Signature 2 │                    │
│   └─────────────┘                    │
│   ┌─────────────┐                    │  Y = 280 (party_a_3)
│   │ Signature 3 │                    │
│   └─────────────┘                    │
│   ┌─────────────┐                    │  Y = 180 (party_b)
│   │ Countersign │                    │
│   └─────────────┘                    │
│                                      │
└──────────────────────────────────────┘  Y = 0 (BOTTOM)
    X = 89 (15% of 595)
```

**Key formulas:**
- X position = page_width × xPercent - signature_width / 2
- Y position = yFromBottom (measured from page bottom)

---

*Last updated: January 15, 2026*
