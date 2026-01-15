/**
 * Signature Position Helpers
 *
 * Utilities for parsing and calculating signature positions
 * in multi-signatory documents (subscription packs, NDAs, etc.)
 */

/**
 * Parse a signature position string to extract party and index
 *
 * @example parseSignaturePosition('party_a') → { party: 'a', index: 1 }
 * @example parseSignaturePosition('party_a_2') → { party: 'a', index: 2 }
 * @example parseSignaturePosition('party_b') → { party: 'b', index: 1 }
 */
export function parseSignaturePosition(position: string): {
  party: 'a' | 'b'
  index: number
} {
  // Match patterns like 'party_a', 'party_a_2', 'party_b_3'
  const match = position.match(/^party_([ab])(?:_(\d+))?$/)

  if (!match) {
    // Default fallback for unknown positions
    console.warn(`Unknown signature position format: ${position}, defaulting to party_a index 1`)
    return { party: 'a', index: 1 }
  }

  const party = match[1] as 'a' | 'b'
  // If no index suffix, it's index 1 (party_a = party_a_1)
  const index = match[2] ? parseInt(match[2], 10) : 1

  return { party, index }
}

/**
 * Check if a signature position belongs to Party A (investor side)
 *
 * @example isPartyA('party_a') → true
 * @example isPartyA('party_a_2') → true
 * @example isPartyA('party_b') → false
 */
export function isPartyA(position: string): boolean {
  return position.startsWith('party_a')
}

/**
 * Check if a signature position belongs to Party B (countersigner side - CEO/Arranger)
 *
 * @example isPartyB('party_b') → true
 * @example isPartyB('party_b_2') → true
 * @example isPartyB('party_a') → false
 */
export function isPartyB(position: string): boolean {
  return position.startsWith('party_b')
}

/**
 * Calculate X and Y coordinates for a signature based on position and total signatories
 *
 * Layout:
 * - All Party A signatures stack VERTICALLY in the LEFT column (same X, different Y)
 * - Party B signatures stay in the RIGHT column at fixed position
 *
 * @param position - Signature position (e.g., 'party_a', 'party_a_2', 'party_b')
 * @param totalPartyASignatories - Total number of Party A signatories (for Y spacing calculation)
 * @returns { xPercent, yFromBottom } - X as percentage of page width, Y in points from bottom
 */
export function calculateSignaturePosition(
  position: string,
  totalPartyASignatories: number = 1
): { xPercent: number; yFromBottom: number } {
  const { party, index } = parseSignaturePosition(position)

  // Party B (CEO/Julien/Arranger): fixed position on RIGHT side
  if (party === 'b') {
    return {
      xPercent: 0.704, // 70.4% from left (right column)
      yFromBottom: 433  // Fixed Y position
    }
  }

  // Party A (Investor signatories): LEFT column, stacked vertically
  const xPercent = 0.292 // 29.2% from left (left column)

  // Single signatory: use legacy position
  if (totalPartyASignatories === 1) {
    return {
      xPercent,
      yFromBottom: 433 // Same as Party B for single signer
    }
  }

  // Multiple signatories: stack vertically (first at TOP, others below)
  // Start higher when there are more signers to make room
  const baseY = 520 + (totalPartyASignatories - 2) * 50
  const spacing = 100 // 100pt between each signature

  // Index 1 is at TOP, subsequent indices move DOWN (lower Y)
  const yFromBottom = baseY - (index - 1) * spacing

  return { xPercent, yFromBottom }
}

/**
 * Generate a signature position string for a given party and index
 *
 * @example getSignaturePositionString('a', 1) → 'party_a'
 * @example getSignaturePositionString('a', 2) → 'party_a_2'
 * @example getSignaturePositionString('b', 1) → 'party_b'
 */
export function getSignaturePositionString(
  party: 'a' | 'b',
  index: number
): string {
  if (index === 1) {
    return `party_${party}`
  }
  return `party_${party}_${index}`
}

/**
 * Get all Party A signature positions for a given number of signatories
 *
 * @example getPartyAPositions(1) → ['party_a']
 * @example getPartyAPositions(3) → ['party_a', 'party_a_2', 'party_a_3']
 */
export function getPartyAPositions(totalSignatories: number): string[] {
  const positions: string[] = []
  for (let i = 1; i <= totalSignatories; i++) {
    positions.push(getSignaturePositionString('a', i))
  }
  return positions
}
