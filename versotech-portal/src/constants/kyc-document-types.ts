/**
 * KYC Document Types
 *
 * Predefined KYC document types as SUGGESTIONS, not restrictions.
 * Users can upload custom document types with custom labels.
 */

export interface KYCDocumentTypeInfo {
  label: string
  description: string
  category: 'individual' | 'entity' | 'both'
  icon?: string
}

/**
 * Suggested KYC document types
 * These are recommendations to guide users, but custom types are allowed
 */
export const SUGGESTED_KYC_DOCUMENT_TYPES: Record<string, KYCDocumentTypeInfo> = {
  // Individual/Personal KYC
  government_id: {
    label: 'Government-Issued ID',
    description: 'Passport, driver\'s license, or national ID card',
    category: 'individual',
    icon: 'CreditCard'
  },
  proof_of_address: {
    label: 'Proof of Address',
    description: 'Utility bill or bank statement (within 3 months)',
    category: 'individual',
    icon: 'Home'
  },
  accreditation_letter: {
    label: 'Accreditation Letter',
    description: 'CPA letter or documentation of qualifying income/assets',
    category: 'individual',
    icon: 'FileCheck'
  },
  bank_statement: {
    label: 'Bank Statement',
    description: 'Recent bank statement for verification',
    category: 'both',
    icon: 'Building2'
  },

  // Entity/Corporate KYC
  entity_formation_docs: {
    label: 'Entity Formation Documents',
    description: 'Certificate of incorporation, articles of organization, LLC formation docs, partnership agreement, or trust deed',
    category: 'entity',
    icon: 'FileText'
  },
  beneficial_ownership: {
    label: 'Beneficial Ownership',
    description: 'Information on beneficial owners with >25% stake (FinCEN Form or equivalent)',
    category: 'entity',
    icon: 'Users'
  },
  operating_agreement: {
    label: 'Operating Agreement',
    description: 'LLC operating agreement or corporate bylaws',
    category: 'entity',
    icon: 'FileText'
  },
  tax_identification: {
    label: 'Tax Identification',
    description: 'EIN confirmation letter or tax certificate',
    category: 'entity',
    icon: 'Receipt'
  },
  board_resolution: {
    label: 'Board Resolution',
    description: 'Board resolution authorizing investment and signatories',
    category: 'entity',
    icon: 'Stamp'
  },
  good_standing_certificate: {
    label: 'Certificate of Good Standing',
    description: 'State-issued certificate confirming entity is in good standing',
    category: 'entity',
    icon: 'Award'
  }
} as const

export type KYCDocumentType = keyof typeof SUGGESTED_KYC_DOCUMENT_TYPES

/**
 * Get display label for a document type
 * Handles both predefined types and custom types with custom labels
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
 * Check if a document type is a predefined suggestion
 */
export function isPredefinedDocumentType(documentType: string): boolean {
  return documentType in SUGGESTED_KYC_DOCUMENT_TYPES
}
