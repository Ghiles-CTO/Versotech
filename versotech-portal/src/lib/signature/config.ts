/**
 * Centralized configuration for signature system
 */

export const SIGNATURE_CONFIG = {
  storage: {
    bucket: process.env.SIGNATURES_BUCKET || 'signatures',
    paths: {
      unsigned: (investorId: string, token: string) =>
        `${investorId}/${token}_unsigned.pdf`,
      signed: (investorId: string, token: string) =>
        `${investorId}/${token}_signed.pdf`
    }
  },
  token: {
    lengthBytes: 32,
    expiryDays: 7
  },
  pdf: {
    signature: {
      // Reduced from 180x70 to fit better in subscription pack signature fields
      // and prevent overlap with surrounding text
      width: 150,
      height: 50
    },
    table: {
      // Y position calibrated from actual NDA template (Page 5, US Letter 612×792pt)
      // Signature boxes: y=433 from bottom, height=112
      // Formula: signatureY = bottom + height/2 - sigHeight/2
      // Target Y = 433 + 56 - 35 = 454 (centered in 112pt box)
      bottom: 433,
      height: 112
    },
    positions: {
      // X positions calibrated from actual NDA template (Page 5)
      // Party A (Investor): left box x=53, width=252 → center=179 → 179/612=0.292
      party_a: { xPercent: 0.292 },
      // Party B (VERSO): right box x=305, width=252 → center=431 → 431/612=0.704
      party_b: { xPercent: 0.704 }
    },
    metadata: {
      timestampFontSize: 7,
      // Reduced offsets to keep metadata closer to signature
      // and prevent overlap with content below
      timestampOffsetY: 12,  // was 15
      signerNameOffsetY: 22, // was 27
      textColor: { r: 0.3, g: 0.3, b: 0.3 }
    }
  },
  email: {
    fromAddress: 'signatures@versoholdings.com',
    replyTo: 'support@versoholdings.com'
  }
} as const
