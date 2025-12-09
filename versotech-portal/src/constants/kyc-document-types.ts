/**
 * KYC Document Types - VERSO Holdings
 *
 * Compulsory KYC documents for investors.
 */

export interface KYCDocumentTypeInfo {
  label: string
  description: string
  category: 'individual' | 'entity' | 'both'
}

/**
 * KYC document types
 *
 * Entity documents: Required for entity-level KYC
 * Individual documents: Required for individuals, directors, shareholders, and members
 */
export const SUGGESTED_KYC_DOCUMENT_TYPES: Record<string, KYCDocumentTypeInfo> = {
  // ===== QUESTIONNAIRE =====
  questionnaire: {
    label: 'KYC Questionnaire',
    description: 'Investor questionnaire responses',
    category: 'both',
  },

  // ===== ENTITY DOCUMENTS =====
  nda_ndnc: {
    label: 'NDA / NDNC',
    description: 'Non-Disclosure and Non-Circumvention Agreement',
    category: 'entity',
  },
  incorporation_certificate: {
    label: 'Incorporation Certificate',
    description: 'Certificate of Incorporation',
    category: 'entity',
  },
  memo_articles: {
    label: 'Memo & Articles of Association',
    description: 'Memorandum and Articles of Association',
    category: 'entity',
  },
  register_members: {
    label: 'Register of Members',
    description: 'Current register of all members/shareholders',
    category: 'entity',
  },
  register_directors: {
    label: 'Register of Directors',
    description: 'Current register of all directors',
    category: 'entity',
  },
  bank_confirmation: {
    label: 'Bank Confirmation',
    description: 'Confirmation of bank name and jurisdiction for wire transfers',
    category: 'entity',
  },
  trust_deed: {
    label: 'Trust Deed',
    description: 'Trust Deed or Declaration of Trust',
    category: 'entity',
  },
  financial_statements: {
    label: 'Financial Statements',
    description: 'Audited Financial Statements',
    category: 'entity',
  },
  beneficial_ownership: {
    label: 'Beneficial Ownership',
    description: 'Beneficial Ownership Declaration',
    category: 'entity',
  },

  // ===== INDIVIDUAL / MEMBER DOCUMENTS =====
  // Category 'both' because entity investors also need these for their members/directors
  passport_id: {
    label: 'ID / Passport',
    description: 'Valid government-issued ID or passport',
    category: 'both',
  },
  utility_bill: {
    label: 'Utility Bill',
    description: 'Recent utility bill (less than 3 months old)',
    category: 'both',
  },
  accreditation_letter: {
    label: 'Accreditation Letter',
    description: 'Accredited Investor verification letter',
    category: 'individual',
  },

  // ===== TAX DOCUMENTS =====
  tax_w8_ben: {
    label: 'W-8BEN / W-8BEN-E',
    description: 'IRS form for foreign persons/entities',
    category: 'both',
  },
  tax_w9: {
    label: 'W-9',
    description: 'IRS form for US persons',
    category: 'individual',
  },
  source_of_funds: {
    label: 'Source of Funds',
    description: 'Source of Funds Declaration',
    category: 'both',
  },

  // ===== OTHER =====
  other: {
    label: 'Other Document',
    description: 'Any other supporting document',
    category: 'both',
  },
} as const

export type KYCDocumentType = keyof typeof SUGGESTED_KYC_DOCUMENT_TYPES

/**
 * Get display label for a document type
 */
export function getDocumentTypeLabel(documentType: string, customLabel?: string | null): string {
  if (customLabel) {
    return customLabel
  }

  const typeInfo = SUGGESTED_KYC_DOCUMENT_TYPES[documentType]
  return typeInfo?.label || formatDocumentType(documentType)
}

/**
 * Format document type string for display (fallback for unknown types)
 */
function formatDocumentType(documentType: string): string {
  return documentType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get suggested document types for a specific category
 */
export function getSuggestedDocumentTypes(category?: 'individual' | 'entity' | 'both'): Array<{
  value: string
  label: string
  description: string
}> {
  return Object.entries(SUGGESTED_KYC_DOCUMENT_TYPES)
    .filter(([_, info]) => !category || info.category === category || info.category === 'both')
    .map(([value, info]) => ({
      value,
      label: info.label,
      description: info.description
    }))
}

/**
 * Check if a document type is a predefined type
 */
export function isPredefinedDocumentType(documentType: string): boolean {
  return documentType in SUGGESTED_KYC_DOCUMENT_TYPES
}
