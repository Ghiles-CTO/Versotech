/**
 * Subscription Pack Signature Position Calculator
 *
 * Calculates legacy fixed signature positions for subscription pack documents.
 * NOTE: Anchor-based placement is the source of truth; this file is kept
 * for backwards compatibility and only covers main agreement + T&Cs.
 *
 * Each signer needs their signature on MULTIPLE pages:
 * - Subscribers: page 12 (main agreement)
 * - Issuer (CEO): page 12 (main agreement) + page 39 (T&Cs)
 * - Arranger: page 12 (main agreement) + page 39 (T&Cs)
 *
 * Positions are stored at signature_request creation time (not calculated at signing time)
 * so they persist even if the calculation logic changes.
 */

import type { SignaturePlacementRecord } from './types'

// Re-export the type for backwards compatibility
export type SignaturePlacement = SignaturePlacementRecord

export interface SignerPositions {
  position: string  // 'party_a', 'party_a_2', 'party_b', 'party_c'
  placements: SignaturePlacementRecord[]
}

/**
 * Page 12 layout constants (Main Agreement signature page)
 * All signers sign here in a vertical stack
 *
 * CALIBRATION NOTES:
 * - X must be > 0.25 to prevent clipping (signature width=180, page width=595)
 * - Formula: signatureX = pageWidth * x - signatureWidth/2
 * - At x=0.29: signatureX = 595 * 0.29 - 90 = 82.6pt from left edge
 * - Y values place signature ABOVE the signature line (not on text below it)
 * - Signature height is 70pt, so we add ~80pt to put it above the line
 */
const PAGE_12 = {
  FIRST_SUBSCRIBER_Y: 660,    // Y position for first subscriber (ABOVE the signature line)
  SUBSCRIBER_SPACING: 100,    // Vertical spacing between signature blocks
  X_POSITION: 0.29            // 29% from left edge (centered on signature line)
}

/**
 * Page 39 layout constants (Terms & Conditions signature page)
 * Only Issuer (CEO) and Arranger sign here
 */
const PAGE_39 = {
  ISSUER_Y: 600,              // Y position for Issuer signature (ABOVE the line)
  ARRANGER_Y: 480,            // Y position for Arranger signature (ABOVE the line)
  X_POSITION: 0.43            // 43% from left edge (centered for schedule signature page)
}

/**
 * Calculate signature positions for all signers in a subscription pack.
 *
 * @param subscriberCount - Number of investor signatories (party_a)
 * @returns Array of SignerPositions with placements for each signer
 *
 * @example
 * // 2 investors signing:
 * const positions = calculateSubscriptionPackPositions(2)
 * // Returns:
 * // [
 * //   { position: 'party_a', placements: [{page: 12, ...}] },
 * //   { position: 'party_a_2', placements: [{page: 12, ...}] },
 * //   { position: 'party_b', placements: [{page: 12, ...}, {page: 39, ...}] },
 * //   { position: 'party_c', placements: [{page: 12, ...}, {page: 39, ...}] }
 * // ]
 */
export function calculateSubscriptionPackPositions(
  subscriberCount: number
): SignerPositions[] {
  const positions: SignerPositions[] = []

  // =============================================
  // SUBSCRIBER POSITIONS (party_a, party_a_2, ...)
  // Sign on page 12 (main agreement)
  // =============================================
  for (let i = 0; i < subscriberCount; i++) {
    const positionName = i === 0 ? 'party_a' : `party_a_${i + 1}`

    positions.push({
      position: positionName,
      placements: [
        {
          page: 12,
          x: PAGE_12.X_POSITION,
          y: PAGE_12.FIRST_SUBSCRIBER_Y - (i * PAGE_12.SUBSCRIBER_SPACING),
          label: 'main_agreement'
        }
      ]
    })
  }

  // =============================================
  // ISSUER POSITION (party_b) - CEO/Julien
  // Signs on page 12 (after all subscribers) AND page 39 (T&Cs)
  // =============================================
  const issuerPage12Y = PAGE_12.FIRST_SUBSCRIBER_Y - (subscriberCount * PAGE_12.SUBSCRIBER_SPACING)

  positions.push({
    position: 'party_b',
    placements: [
      {
        page: 12,
        x: PAGE_12.X_POSITION,
        y: issuerPage12Y,
        label: 'main_agreement'
      },
      {
        page: 39,
        x: PAGE_39.X_POSITION,
        y: PAGE_39.ISSUER_Y,
        label: 'tcs'
      }
    ]
  })

  // =============================================
  // ARRANGER POSITION (party_c)
  // Signs on page 12 (after issuer) AND page 39 (T&Cs)
  // =============================================
  const arrangerPage12Y = issuerPage12Y - PAGE_12.SUBSCRIBER_SPACING

  positions.push({
    position: 'party_c',
    placements: [
      {
        page: 12,
        x: PAGE_12.X_POSITION,
        y: arrangerPage12Y,
        label: 'main_agreement'
      },
      {
        page: 39,
        x: PAGE_39.X_POSITION,
        y: PAGE_39.ARRANGER_Y,
        label: 'tcs'
      }
    ]
  })

  console.log(`📐 [POSITIONS] Calculated positions for ${subscriberCount} subscriber(s):`)
  positions.forEach(p => {
    console.log(`   - ${p.position}: ${p.placements.map(pl => `page ${pl.page}`).join(' + ')}`)
  })

  return positions
}

/**
 * Get placements for a specific signer position.
 *
 * @param subscriberCount - Total number of subscribers
 * @param signaturePosition - Position string (e.g., 'party_a', 'party_b')
 * @returns Array of placements for this signer, or empty array if not found
 */
export function getPlacementsForPosition(
  subscriberCount: number,
  signaturePosition: string
): SignaturePlacement[] {
  const allPositions = calculateSubscriptionPackPositions(subscriberCount)
  const signerPositions = allPositions.find(p => p.position === signaturePosition)

  if (!signerPositions) {
    console.warn(`⚠️ [POSITIONS] No placements found for position: ${signaturePosition}`)
    return []
  }

  return signerPositions.placements
}
