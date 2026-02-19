/**
 * Anchor Detection for Subscription Pack PDFs
 *
 * Scans a PDF for SIG_ANCHOR markers and returns their exact positions.
 * These positions are used to place signatures at the correct locations.
 *
 * ANCHOR NAMING CONVENTION (matches database signature_position):
 * - Subscribers: party_a, party_a_2, party_a_3, ... (first is 'party_a', NOT 'party_a_1')
 * - Issuer: party_b, party_b_form, party_b_wire, party_b_tcs
 * - Arranger: party_c, party_c_tcs
 * - Introducer agreements: party_a (VERSO/Arranger), party_b, party_b_2, ...
 */

import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import type { DocumentType, SignaturePlacementRecord } from './types'
import { SIGNATURE_CONFIG } from './config'

/**
 * Polyfill browser globals that pdfjs-dist expects.
 * We only use getTextContent() + getViewport() (no canvas rendering),
 * so minimal stubs are sufficient to prevent the module from crashing.
 */
function ensurePdfjsPolyfills() {
  const g = globalThis as any
  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
      constructor(init?: any) {
        if (Array.isArray(init) && init.length >= 6) {
          ;[this.a, this.b, this.c, this.d, this.e, this.f] = init
        }
      }
      isIdentity = true
      inverse() { return new DOMMatrix() }
      multiply() { return new DOMMatrix() }
      scale() { return new DOMMatrix() }
      translate() { return new DOMMatrix() }
      transformPoint(p: any) { return p }
      static fromMatrix() { return new DOMMatrix() }
      static fromFloat32Array() { return new DOMMatrix() }
      static fromFloat64Array() { return new DOMMatrix() }
    }
  }
  if (typeof g.ImageData === 'undefined') {
    g.ImageData = class ImageData {
      width: number; height: number; data: Uint8ClampedArray
      constructor(w: number, h: number) {
        this.width = w; this.height = h
        this.data = new Uint8ClampedArray(w * h * 4)
      }
    }
  }
  if (typeof g.Path2D === 'undefined') {
    g.Path2D = class Path2D {
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      rect() {}
    }
  }
}

export interface DetectedAnchor {
  anchorId: string       // e.g., 'party_a', 'party_b_tcs', 'party_a_2_form'
  pageNumber: number     // 1-indexed page number
  rawX: number           // X coordinate in points (from left of page)
  rawY: number           // Y coordinate in points (from bottom of page - PDF native)
  xPercent: number       // X as percentage of page width (0-1)
  yFromBottom: number    // Y in points from bottom (same as rawY for PDF.js)
  pageWidth: number      // Page width in points
  pageHeight: number     // Page height in points
}

/**
 * Scan PDF for all SIG_ANCHOR markers
 *
 * The PDF.js library extracts text items with their transform matrices.
 * transform[4] = X position, transform[5] = Y position (from bottom of page)
 *
 * @param pdfBytes - Raw PDF bytes as Uint8Array
 * @returns Array of detected anchors with positions
 */
export async function detectAnchors(pdfBytes: Uint8Array): Promise<DetectedAnchor[]> {
  // Polyfill browser globals before importing pdfjs-dist (server-side only)
  ensurePdfjsPolyfills()

  // Dynamic import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // CRITICAL: Set worker path for Node.js/server-side usage
  // Must be set BEFORE calling getDocument
  const workerCandidates = [
    process.env.PDFJS_WORKER_SRC,
    new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString(),
    new URL('../../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString()
  ].filter(Boolean) as string[]

  const resolvedWorkerSrc = workerCandidates.find((candidate) => {
    try {
      const path = candidate.startsWith('file:')
        ? fileURLToPath(candidate)
        : candidate
      return existsSync(path)
    } catch {
      return false
    }
  }) || workerCandidates[0]

  pdfjsLib.GlobalWorkerOptions.workerSrc = resolvedWorkerSrc

  const anchors: DetectedAnchor[] = []

  try {
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

        // Check for both formats:
        // 1. Normal: SIG_ANCHOR:party_b_wire
        // 2. Space-corrupted: SIG ANCHOR:party b wire (HTML-to-PDF renderer sometimes breaks underscores)
        const hasNormalAnchor = text.includes('SIG_ANCHOR:')
        const hasSpaceAnchor = text.includes('SIG ANCHOR:')

        if (!hasNormalAnchor && !hasSpaceAnchor) continue

        // Try normal format first, then space-corrupted format
        let anchorId: string | null = null

        if (hasNormalAnchor) {
          const match = text.match(/SIG_ANCHOR:(\S+)/)
          if (match) {
            anchorId = match[1]
          }
        } else if (hasSpaceAnchor) {
          // Match space-corrupted format: "SIG ANCHOR:party b wire" or "SIG ANCHOR:party c"
          // Capture everything after the colon until end or next significant separator
          const match = text.match(/SIG ANCHOR:([a-z0-9_ ]+)/i)
          if (match) {
            // Normalize: convert spaces to underscores, trim
            anchorId = match[1].trim().replace(/ /g, '_')
            console.log(`   🔧 Normalized space-corrupted anchor: "${match[1]}" -> "${anchorId}"`)
          }
        }

        if (!anchorId) continue

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

        console.log(`   📍 Found ${anchorId} on page ${pageNum} at (${rawX.toFixed(1)}, ${rawY.toFixed(1)}) - ${(rawX / viewport.width * 100).toFixed(1)}% from left`)
      }
    }
  } catch (error) {
    console.error('❌ [ANCHOR] PDF parsing error:', error)
    throw error
  }

  console.log(`✅ [ANCHOR] Found ${anchors.length} anchor(s) total`)
  return anchors
}

/**
 * Get a specific anchor by ID
 *
 * @param anchors - Array of detected anchors
 * @param anchorId - The anchor ID to find
 * @returns The anchor, or throws if not found
 */
export function getAnchorById(anchors: DetectedAnchor[], anchorId: string): DetectedAnchor {
  const anchor = anchors.find(a => a.anchorId === anchorId)
  if (!anchor) {
    const available = anchors.map(a => a.anchorId).join(', ') || '(none)'
    throw new Error(`ANCHOR_NOT_FOUND: ${anchorId}. Available anchors: ${available}`)
  }
  return anchor
}

/**
 * Validate that all required anchors exist in the detected set
 *
 * @param anchors - Array of detected anchors
 * @param required - Array of anchor IDs that must be present
 * @throws Error if any required anchor is missing
 */
export function validateRequiredAnchors(anchors: DetectedAnchor[], required: string[]): void {
  const found = new Set(anchors.map(a => a.anchorId))
  const missing = required.filter(r => !found.has(r))

  if (missing.length > 0) {
    const available = Array.from(found).join(', ') || '(none)'
    throw new Error(`MISSING_ANCHORS: ${missing.join(', ')}. Found: ${available}`)
  }
}

/**
 * Get anchor patterns for a given signature position
 *
 * NAMING CONVENTION:
 * - Database uses: party_a, party_a_2, party_a_3 (first is 'party_a', NOT 'party_a_1')
 * - Anchors match the database convention exactly
 *
 * WHICH PAGES EACH PARTY SIGNS:
 * - Subscribers (party_a*): Page 2 (form), Page 12 (main)
 * - Issuer (party_b): Page 2 (form), Page 3 (wire), Page 12 (main), Page 39 (T&Cs)
 * - Arranger (party_c): Page 12 (main), Page 39 (T&Cs)
 *
 * @param position - Database signature_position value
 * @returns Array of anchor patterns with their labels
 */
function getAnchorPatternsForPosition(
  position: string,
  documentType: DocumentType = 'subscription'
): { anchorId: string; label: string }[] {
  if (documentType === 'introducer_agreement') {
    return [
      { anchorId: position, label: 'introducer_agreement' }
    ]
  }

  // Subscribers sign on: Page 2 (form), Page 12 (main)
  if (position.startsWith('party_a')) {
    // position is 'party_a', 'party_a_2', 'party_a_3', etc.
    // Anchors use SAME base: 'party_a', 'party_a_2', 'party_a_3'
    const base = position
    return [
      { anchorId: `${base}_form`, label: 'subscription_form' },
      { anchorId: base, label: 'main_agreement' }
    ]
  }

  // Issuer signs on: Page 2 (form), Page 3 (wire), Page 12 (main), Page 39 (T&Cs)
  if (position === 'party_b') {
    return [
      { anchorId: 'party_b_form', label: 'subscription_form' },
      { anchorId: 'party_b_wire', label: 'wire_instructions' },
      { anchorId: 'party_b', label: 'main_agreement' },
      { anchorId: 'party_b_tcs', label: 'tcs' }
    ]
  }

  // Arranger signs on: Page 12 (main), Page 39 (T&Cs)
  if (position === 'party_c') {
    return [
      { anchorId: 'party_c', label: 'main_agreement' },
      { anchorId: 'party_c_tcs', label: 'tcs' }
    ]
  }

  console.warn(`⚠️ [ANCHOR] Unknown position: ${position}`)
  return []
}

/**
 * Get fixed X position for signature based on party type and page label
 *
 * RATIONALE: The anchor's raw X coordinate represents where the anchor TEXT starts,
 * not where the signature should go. Since anchors are placed at the start of cells/blocks,
 * they always report X near the left margin. Instead, we use FIXED positions based on
 * the known column layout of the subscription pack template:
 *
 * COLUMN POSITIONS:
 * - Form page: Issuer left column, Subscriber right column
 * - Main agreement: All parties stacked on the left
 * - T&Cs: Issuer/Arranger centered on signature page
 *
 * @param signaturePosition - The database signature_position value (party_a, party_b, party_c)
 * @param label - The page/section label (subscription_form, main_agreement, etc.)
 * @returns X position as percentage of page width (0-1)
 */
function getSignatureXPosition(
  signaturePosition: string,
  label: string,
  documentType: DocumentType = 'subscription'
): number {
  // Party A (Subscribers): Right column on form page, stacked-left on main agreement
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

/**
 * Get signature Y position from the anchor position
 *
 * Anchors are now placed ON the signature line. This function shifts the signature
 * image ABOVE the line so that the metadata (timestamp + signer name) sits just
 * above the line and does not overlap Name/Title text below.
 *
 * @param anchor - Detected anchor with rawY (line position)
 * @param label - Page/section label (used for compact layout offsets)
 * @returns Signature Y position in points from bottom of page
 */
function getSignatureYFromAnchor(
  anchor: DetectedAnchor,
  label: string,
  documentType: DocumentType = 'subscription'
): number {
  const { metadata } = SIGNATURE_CONFIG.pdf

  // Keep in sync with embedSignatureMultipleLocations() compact layout offsets
  const compactSignerOffset = 14
  const signerOffset = label === 'wire_instructions'
    ? compactSignerOffset
    : metadata.signerNameOffsetY

  const lineGap = 4
  return anchor.rawY + signerOffset + lineGap
}

/**
 * Convert detected anchors to signature placements for a specific signer
 *
 * This is the main function used during signature request creation to
 * calculate where signatures should be placed based on detected anchors.
 *
 * POSITIONING STRATEGY (v5 - ANCHOR-BASED Y):
 * - X: Uses FIXED column positions based on party type and page label
 * - Y: Uses anchor position + offset (anchor is on the signature line)
 *
 * WHY ANCHOR-BASED Y:
 * Anchors are placed directly on the signature line, so anchor.yFromBottom is the
 * line position. We then offset upward so the signature image sits above the line.
 *
 * X POSITIONING (VC215-aligned):
 * - Party A (Subscribers): 63% on form, 29% on main agreement
 * - Party B (Issuer): 20% on form, 25% on wire, 29% on main, 43% on T&Cs
 * - Party C (Arranger): 29% on main, 43% on T&Cs
 *
 * @param anchors - All detected anchors from PDF
 * @param signaturePosition - The signer's position (e.g., 'party_a', 'party_b')
 * @returns Array of placements for this signer
 */
export function getPlacementsFromAnchors(
  anchors: DetectedAnchor[],
  signaturePosition: string,
  documentType: DocumentType = 'subscription'
): SignaturePlacementRecord[] {
  // Map signature positions to their anchor patterns
  const anchorPatterns = getAnchorPatternsForPosition(signaturePosition, documentType)
  const placements: SignaturePlacementRecord[] = []

  console.log(`📍 [PLACEMENT] Calculating placements for ${signaturePosition} (${documentType}, anchor-based Y)...`)

  for (const pattern of anchorPatterns) {
    const anchor = anchors.find(a => a.anchorId === pattern.anchorId)
    if (anchor) {
      const fixedX = documentType === 'introducer_agreement'
        ? anchor.xPercent
        : getSignatureXPosition(signaturePosition, pattern.label, documentType)

      // Get signature Y position based on anchor line + offset
      const signatureY = getSignatureYFromAnchor(anchor, pattern.label, documentType)

      // Debug logging
      console.log(`   🔍 [ANCHOR] ${pattern.anchorId} on page ${anchor.pageNumber}`)
      console.log(`      Anchor position (for reference): (${anchor.rawX.toFixed(0)}pt, ${anchor.rawY.toFixed(0)}pt)`)
      console.log(`   📍 [PLACEMENT] ${signaturePosition} -> page ${anchor.pageNumber}`)
      console.log(`      FIXED X: ${(fixedX * 100).toFixed(0)}% | ANCHOR Y: ${signatureY.toFixed(0)}pt (${pattern.label})`)

      placements.push({
        page: anchor.pageNumber,
        x: fixedX,  // FIXED X position based on party/page
        y: signatureY,  // Anchor-based Y position
        label: pattern.label
      })

      console.log(`   ✓ ${pattern.anchorId} -> page ${anchor.pageNumber}, x=${(fixedX * 100).toFixed(0)}%, y=${signatureY.toFixed(0)}pt (${pattern.label})`)
    } else {
      console.warn(`   ⚠️ Anchor not found: ${pattern.anchorId} (expected for ${signaturePosition})`)
    }
  }

  console.log(`✅ [PLACEMENT] Created ${placements.length} placement(s) for ${signaturePosition}`)
  return placements
}

/**
 * Get required anchors for a subscription pack based on signatory count
 *
 * @param subscriberCount - Number of investor signatories (1-10)
 * @returns Array of all anchor IDs that should be present in the PDF
 */
export function getRequiredAnchorsForSubscriptionPack(subscriberCount: number): string[] {
  const required: string[] = []

  // Subscriber anchors (party_a, party_a_2, party_a_3, ...)
  for (let i = 1; i <= subscriberCount; i++) {
    const base = i === 1 ? 'party_a' : `party_a_${i}`
    required.push(`${base}_form`)   // Page 2
    required.push(base)              // Page 12
  }

  // Issuer anchors (party_b)
  required.push('party_b_form')  // Page 2
  required.push('party_b_wire')  // Page 3
  required.push('party_b')       // Page 12
  required.push('party_b_tcs')   // Page 39

  // Arranger anchors (party_c)
  required.push('party_c')       // Page 12
  required.push('party_c_tcs')   // Page 39

  return required
}

/**
 * Get required anchors for an introducer agreement based on signatory count
 *
 * @param signatoryCount - Number of introducer signers
 * @returns Array of anchor IDs that should be present in the PDF
 */
export function getRequiredAnchorsForIntroducerAgreement(signatoryCount: number): string[] {
  const required: string[] = ['party_a']

  for (let i = 1; i <= signatoryCount; i++) {
    const base = i === 1 ? 'party_b' : `party_b_${i}`
    required.push(base)
  }

  return required
}

/**
 * Helper to generate anchor ID matching database convention
 * First subscriber is 'party_a', subsequent are 'party_a_2', 'party_a_3', etc.
 *
 * @param number - 1-based signatory number
 * @param suffix - Optional suffix like 'form'
 * @returns Anchor ID string
 */
export function getSignatoryAnchorId(number: number, suffix?: string): string {
  const base = number === 1 ? 'party_a' : `party_a_${number}`
  return suffix ? `${base}_${suffix}` : base
}
