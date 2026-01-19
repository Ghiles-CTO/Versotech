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
 */

import type { SignaturePlacementRecord } from './types'

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
  // Dynamic import pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // CRITICAL: Set worker path for Node.js/server-side usage
  // Must be set BEFORE calling getDocument
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url
  ).toString()

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
 * - Subscribers (party_a*): Page 2 (form), Page 12 (main), Page 40 (appendix)
 * - Issuer (party_b): Page 2 (form), Page 3 (wire), Page 12 (main), Page 39 (T&Cs)
 * - Arranger (party_c): Page 12 (main), Page 39 (T&Cs)
 *
 * @param position - Database signature_position value
 * @returns Array of anchor patterns with their labels
 */
function getAnchorPatternsForPosition(position: string): { anchorId: string; label: string }[] {
  // Subscribers sign on: Page 2 (form), Page 12 (main), Page 40 (appendix)
  if (position.startsWith('party_a')) {
    // position is 'party_a', 'party_a_2', 'party_a_3', etc.
    // Anchors use SAME base: 'party_a', 'party_a_2', 'party_a_3'
    const base = position
    return [
      { anchorId: `${base}_form`, label: 'subscription_form' },
      { anchorId: base, label: 'main_agreement' },
      { anchorId: `${base}_appendix`, label: 'appendix' }
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
 * - Left column (Issuer): 25% of page width
 * - Center (Subscriber on most pages): 50% of page width
 * - Right column (Arranger, Subscriber on form): 70% of page width
 *
 * @param signaturePosition - The database signature_position value (party_a, party_b, party_c)
 * @param label - The page/section label (subscription_form, main_agreement, etc.)
 * @returns X position as percentage of page width (0-1)
 */
function getSignatureXPosition(signaturePosition: string, label: string): number {
  // Party A (Subscribers): Right column on form page, center elsewhere
  if (signaturePosition.startsWith('party_a')) {
    if (label === 'subscription_form') return 0.70  // Right column (page 2)
    return 0.50  // Center (pages 12, 40)
  }

  // Party B (Issuer): Left column everywhere
  if (signaturePosition === 'party_b') {
    return 0.25  // Left column (pages 2, 3, 12, 39)
  }

  // Party C (Arranger): Right column
  if (signaturePosition === 'party_c') {
    return 0.70  // Right column (pages 12, 39)
  }

  return 0.50  // Default center
}

/**
 * Get FIXED Y position for signature placement
 *
 * WHY FIXED POSITIONS INSTEAD OF ANCHOR-RELATIVE:
 * The HTML template places anchors at the END of signature blocks (below the signature line).
 * When we calculated signatureY = anchorY - Y_OFFSET, we got NEGATIVE values because
 * the anchor is already near the page bottom. This caused signatures to be clamped to
 * minimum values and placed incorrectly.
 *
 * SOLUTION: Use calibrated fixed Y positions based on visual inspection of the PDF template.
 * Anchors are now used ONLY for page detection (which page needs a signature), not for
 * vertical positioning.
 *
 * Y POSITIONS (in points from bottom of page, Letter = 792pt tall):
 * - Higher values = closer to top of page
 * - Lower values = closer to bottom of page
 *
 * CALIBRATION NOTES (from visual analysis of signed PDF):
 * - Page 2-3 (forms): Signature areas are in lower portion, ~180-260pt from bottom
 * - Page 14 (main agreement): Signature areas are ~180pt from bottom
 * - Page 39 (T&Cs): Same layout as main agreement
 * - Page 42 (appendix): Same layout as main agreement
 *
 * @param label - The page/section label
 * @returns Fixed Y position in points from bottom of page
 */
function getFixedYPosition(label: string): number {
  // Y positions calibrated by visual inspection of PDF template
  switch (label) {
    case 'subscription_form':     return 180  // Page 2: subscription form signature
    case 'wire_instructions':     return 260  // Page 3: wire transfer form (higher up due to compact layout)
    case 'main_agreement':        return 180  // Page 14: main signature page
    case 'tcs':                   return 180  // Page 39: T&Cs page
    case 'appendix':              return 180  // Page 42: appendix page
    default:                      return 180  // Default fallback
  }
}

/**
 * Convert detected anchors to signature placements for a specific signer
 *
 * This is the main function used during signature request creation to
 * calculate where signatures should be placed based on detected anchors.
 *
 * POSITIONING STRATEGY (v4 - FIXED Y POSITIONS):
 * - X: Uses FIXED column positions based on party type and page label
 * - Y: Uses FIXED positions calibrated by visual inspection (NOT anchor-relative)
 *
 * WHY FIXED Y POSITIONS:
 * The HTML template places SIG_ANCHOR markers at the END of signature blocks,
 * BELOW the signature line. This means anchor.yFromBottom is near the page bottom.
 * Calculating signatureY = anchorY - Y_OFFSET yielded NEGATIVE values that got
 * clamped, placing signatures incorrectly at the page bottom.
 *
 * SOLUTION: Anchors are used ONLY for:
 * 1. PAGE DETECTION - which page needs a signature
 * 2. ANCHOR ID MATCHING - mapping signature positions to their required pages
 *
 * Y positions are now FIXED values calibrated from the PDF template layout.
 *
 * X POSITIONING (unchanged):
 * - Party A (Subscribers): 70% on form, 50% elsewhere
 * - Party B (Issuer): 25% (left column)
 * - Party C (Arranger): 70% (right column)
 *
 * @param anchors - All detected anchors from PDF
 * @param signaturePosition - The signer's position (e.g., 'party_a', 'party_b')
 * @returns Array of placements for this signer
 */
export function getPlacementsFromAnchors(
  anchors: DetectedAnchor[],
  signaturePosition: string
): SignaturePlacementRecord[] {
  // Map signature positions to their anchor patterns
  const anchorPatterns = getAnchorPatternsForPosition(signaturePosition)
  const placements: SignaturePlacementRecord[] = []

  console.log(`📍 [PLACEMENT] Calculating placements for ${signaturePosition} (using FIXED Y positions)...`)

  for (const pattern of anchorPatterns) {
    const anchor = anchors.find(a => a.anchorId === pattern.anchorId)
    if (anchor) {
      // Get FIXED X position based on party and page type
      const fixedX = getSignatureXPosition(signaturePosition, pattern.label)

      // Get FIXED Y position based on page label (NOT anchor-relative!)
      const fixedY = getFixedYPosition(pattern.label)

      // Debug logging
      console.log(`   🔍 [ANCHOR] ${pattern.anchorId} on page ${anchor.pageNumber}`)
      console.log(`      Anchor position (for reference): (${anchor.rawX.toFixed(0)}pt, ${anchor.rawY.toFixed(0)}pt)`)
      console.log(`   📍 [PLACEMENT] ${signaturePosition} -> page ${anchor.pageNumber}`)
      console.log(`      FIXED X: ${(fixedX * 100).toFixed(0)}% | FIXED Y: ${fixedY}pt (${pattern.label})`)

      placements.push({
        page: anchor.pageNumber,
        x: fixedX,  // FIXED X position based on party/page
        y: fixedY,  // FIXED Y position based on page label
        label: pattern.label
      })

      console.log(`   ✓ ${pattern.anchorId} -> page ${anchor.pageNumber}, x=${(fixedX * 100).toFixed(0)}%, y=${fixedY}pt (${pattern.label})`)
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
    required.push(`${base}_appendix`) // Page 40
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
 * Helper to generate anchor ID matching database convention
 * First subscriber is 'party_a', subsequent are 'party_a_2', 'party_a_3', etc.
 *
 * @param number - 1-based signatory number
 * @param suffix - Optional suffix like 'form' or 'appendix'
 * @returns Anchor ID string
 */
export function getSignatoryAnchorId(number: number, suffix?: string): string {
  const base = number === 1 ? 'party_a' : `party_a_${number}`
  return suffix ? `${base}_${suffix}` : base
}
