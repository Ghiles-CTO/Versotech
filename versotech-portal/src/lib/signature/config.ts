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
      width: 180,
      height: 70
    },
    table: {
      bottom: 50,
      height: 180
    },
    positions: {
      party_a: { xPercent: 0.25 },
      party_b: { xPercent: 0.75 }
    },
    metadata: {
      timestampFontSize: 7,
      timestampOffsetY: 15,
      signerNameOffsetY: 27,
      textColor: { r: 0.3, g: 0.3, b: 0.3 }
    }
  },
  email: {
    fromAddress: 'signatures@versoholdings.com',
    replyTo: 'support@versoholdings.com'
  }
} as const
