/**
 * KYC Document Types - V E R S O
 *
 * Compulsory KYC documents for all entities including investors, partners,
 * introducers, lawyers, arrangers, and commercial partners.
 */

export interface KYCDocumentTypeInfo {
  label: string
  description: string
  category: 'individual' | 'entity' | 'both'
  /** For member-specific documents */
  memberOnly?: boolean
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

  // ===== ENTITY DOCUMENTS - FORMATION =====
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
  certificate_of_good_standing: {
    label: 'Certificate of Good Standing',
    description: 'Certificate confirming entity is in good standing with registry',
    category: 'entity',
  },
  certificate_of_incumbency: {
    label: 'Certificate of Incumbency',
    description: 'Certificate listing current directors and officers',
    category: 'entity',
  },
  company_register_extract: {
    label: 'Company Register Extract',
    description: 'Official extract from company registry',
    category: 'entity',
  },
  partnership_agreement: {
    label: 'Partnership Agreement',
    description: 'Limited Partnership or General Partnership Agreement',
    category: 'entity',
  },
  operating_agreement: {
    label: 'Operating Agreement',
    description: 'LLC Operating Agreement or equivalent',
    category: 'entity',
  },

  // ===== ENTITY DOCUMENTS - GOVERNANCE =====
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
  register_beneficial_owners: {
    label: 'Register of Beneficial Owners',
    description: 'Register of ultimate beneficial owners (UBOs)',
    category: 'entity',
  },
  directors_declaration: {
    label: 'Directors Declaration',
    description: 'Signed declaration from board of directors',
    category: 'entity',
  },
  board_resolution: {
    label: 'Board Resolution',
    description: 'Board resolution authorizing investment or account opening',
    category: 'entity',
  },
  authorized_signatory_list: {
    label: 'Authorized Signatory List',
    description: 'List of persons authorized to sign on behalf of entity',
    category: 'entity',
  },
  power_of_attorney: {
    label: 'Power of Attorney',
    description: 'Power of Attorney document',
    category: 'entity',
  },

  // ===== ENTITY DOCUMENTS - FINANCIAL =====
  bank_confirmation: {
    label: 'Bank Confirmation',
    description: 'Confirmation of bank name and jurisdiction for wire transfers',
    category: 'entity',
  },
  financial_statements: {
    label: 'Financial Statements',
    description: 'Audited Financial Statements',
    category: 'entity',
  },
  beneficial_ownership: {
    label: 'Beneficial Ownership Declaration',
    description: 'Declaration of ultimate beneficial owners',
    category: 'entity',
  },

  // ===== TRUST DOCUMENTS =====
  trust_deed: {
    label: 'Trust Deed',
    description: 'Trust Deed or Declaration of Trust',
    category: 'entity',
  },
  trust_schedule: {
    label: 'Trust Schedule',
    description: 'Schedule of beneficiaries and settlors',
    category: 'entity',
  },
  letter_of_wishes: {
    label: 'Letter of Wishes',
    description: 'Settlor letter of wishes',
    category: 'entity',
  },

  // ===== INDIVIDUAL / MEMBER ID DOCUMENTS =====
  passport_id: {
    label: 'ID / Passport',
    description: 'Valid government-issued ID or passport',
    category: 'both',
  },
  passport: {
    label: 'Passport',
    description: 'Valid passport (photo page)',
    category: 'both',
  },
  national_id_card: {
    label: 'National ID Card',
    description: 'Government-issued national identification card',
    category: 'both',
  },
  drivers_license: {
    label: "Driver's License",
    description: 'Government-issued driving license',
    category: 'both',
  },
  residence_permit: {
    label: 'Residence Permit',
    description: 'Valid residence permit or visa',
    category: 'both',
  },

  // ===== PROOF OF ADDRESS DOCUMENTS =====
  utility_bill: {
    label: 'Utility Bill',
    description: 'Recent utility bill (less than 3 months old)',
    category: 'both',
  },
  bank_statement: {
    label: 'Bank Statement',
    description: 'Recent bank statement (less than 3 months old)',
    category: 'both',
  },
  proof_of_address: {
    label: 'Proof of Address',
    description: 'Recent utility bill, bank statement, or official letter',
    category: 'both',
  },
  government_correspondence: {
    label: 'Government Correspondence',
    description: 'Recent letter from government agency with address',
    category: 'both',
  },
  council_tax_bill: {
    label: 'Council Tax Bill',
    description: 'Council tax or property tax statement',
    category: 'both',
  },

  // ===== ACCREDITATION / QUALIFICATION =====
  accreditation_letter: {
    label: 'Accreditation Letter',
    description: 'Accredited Investor verification letter',
    category: 'individual',
  },
  professional_qualification: {
    label: 'Professional Qualification',
    description: 'Professional investor qualification or certification',
    category: 'individual',
  },
  sophistication_declaration: {
    label: 'Sophistication Declaration',
    description: 'Self-certification as sophisticated investor',
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
  tax_return: {
    label: 'Tax Return',
    description: 'Recent tax return or tax filing',
    category: 'both',
  },
  tax_residency_certificate: {
    label: 'Tax Residency Certificate',
    description: 'Certificate of tax residency from tax authority',
    category: 'both',
  },

  // ===== AML / SOURCE OF FUNDS =====
  source_of_funds: {
    label: 'Source of Funds',
    description: 'Source of Funds Declaration',
    category: 'both',
  },
  source_of_wealth: {
    label: 'Source of Wealth',
    description: 'Source of Wealth Declaration',
    category: 'both',
  },
  employment_letter: {
    label: 'Employment Letter',
    description: 'Letter confirming employment and salary',
    category: 'individual',
  },
  business_ownership_proof: {
    label: 'Business Ownership Proof',
    description: 'Documentation proving business ownership',
    category: 'both',
  },

  // ===== PARTNER / INTRODUCER SPECIFIC =====
  introducer_agreement: {
    label: 'Introducer Agreement',
    description: 'Signed introducer/referral agreement',
    category: 'entity',
  },
  fee_agreement: {
    label: 'Fee Agreement',
    description: 'Signed fee sharing or commission agreement',
    category: 'entity',
  },
  regulatory_license: {
    label: 'Regulatory License',
    description: 'Financial services or regulatory license',
    category: 'entity',
  },
  professional_indemnity_insurance: {
    label: 'Professional Indemnity Insurance',
    description: 'Certificate of professional indemnity insurance',
    category: 'entity',
  },

  // ===== LAWYER SPECIFIC =====
  practicing_certificate: {
    label: 'Practicing Certificate',
    description: 'Current practicing certificate from bar association',
    category: 'entity',
  },
  bar_membership: {
    label: 'Bar Membership',
    description: 'Bar association membership certificate',
    category: 'entity',
  },
  law_firm_letterhead: {
    label: 'Law Firm Letterhead',
    description: 'Official letterhead confirming association',
    category: 'entity',
  },

  // ===== MEMBER-SPECIFIC DOCUMENTS =====
  member_passport: {
    label: 'Member Passport/ID',
    description: 'Passport or ID for director/UBO/signatory',
    category: 'both',
    memberOnly: true,
  },
  member_proof_of_address: {
    label: 'Member Proof of Address',
    description: 'Proof of address for director/UBO/signatory',
    category: 'both',
    memberOnly: true,
  },
  specimen_signature: {
    label: 'Specimen Signature',
    description: 'Specimen signature for authorized signatory',
    category: 'both',
    memberOnly: true,
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
export function getSuggestedDocumentTypes(
  category?: 'individual' | 'entity' | 'both',
  options?: { includeMemberOnly?: boolean }
): Array<{
  value: string
  label: string
  description: string
  memberOnly?: boolean
}> {
  return Object.entries(SUGGESTED_KYC_DOCUMENT_TYPES)
    .filter(([_, info]) => {
      // Filter by category
      const categoryMatch = !category || info.category === category || info.category === 'both'
      // Filter member-only documents unless explicitly included
      const memberMatch = options?.includeMemberOnly || !info.memberOnly
      return categoryMatch && memberMatch
    })
    .map(([value, info]) => ({
      value,
      label: info.label,
      description: info.description,
      memberOnly: info.memberOnly,
    }))
}

/**
 * ==============================================
 * SIMPLIFIED KYC DOCUMENT TYPES
 * ==============================================
 *
 * INDIVIDUAL INVESTOR: ID + Proof of Address
 * ENTITY INVESTOR: Company docs + ID/Address for each director/UBO
 */

/**
 * Documents for INDIVIDUAL investors - ID + Proof of Address
 */
export const INDIVIDUAL_REQUIRED_DOCS = [
  { value: 'passport', label: 'Passport', description: 'Valid passport (photo page)' },
  { value: 'utility_bill', label: 'Utility Bill / Proof of Address', description: 'Recent utility bill or bank statement (less than 3 months)' },
] as const

/**
 * Documents for ENTITY-LEVEL (the company itself)
 * NO NDA - that's handled separately in deal flow
 */
export const ENTITY_REQUIRED_DOCS = [
  { value: 'incorporation_certificate', label: 'Incorporation Certificate', description: 'Certificate of Incorporation' },
  { value: 'memo_articles', label: 'Memo & Articles', description: 'Memorandum and Articles of Association' },
  { value: 'register_directors', label: 'Register of Directors', description: 'Current list of all directors' },
  { value: 'register_members', label: 'Register of Members/Shareholders', description: 'Current list of shareholders' },
  { value: 'register_beneficial_owners', label: 'Register of UBOs', description: 'List of beneficial owners (>25%)' },
  { value: 'bank_confirmation', label: 'Bank Confirmation Letter', description: 'Bank details for wire transfers' },
] as const

/**
 * Documents for MEMBERS (Directors, UBOs) - personal ID docs
 */
export const MEMBER_REQUIRED_DOCS = [
  { value: 'passport', label: 'Passport / ID', description: 'Valid passport or government ID' },
  { value: 'utility_bill', label: 'Proof of Address', description: 'Utility bill or bank statement (less than 3 months)' },
] as const

/**
 * Get document types for INDIVIDUAL investors
 */
export function getIndividualDocumentTypes() {
  return [...INDIVIDUAL_REQUIRED_DOCS]
}

/**
 * Get document types for ENTITY-level uploads
 */
export function getEntityDocumentTypes() {
  return [...ENTITY_REQUIRED_DOCS]
}

/**
 * Get document types for MEMBER uploads (personal ID for directors/UBOs)
 */
export function getMemberDocumentTypes() {
  return [...MEMBER_REQUIRED_DOCS]
}

/**
 * Check if a document type is a predefined type
 */
export function isPredefinedDocumentType(documentType: string): boolean {
  return documentType in SUGGESTED_KYC_DOCUMENT_TYPES
}
