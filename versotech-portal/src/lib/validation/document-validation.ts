/**
 * Document Validation Library
 *
 * Implements STRICT enforcement for KYC document validation:
 * - ID Documents: Block expired IDs (expiry_date < today)
 * - Proof of Address: Block if > 3 months old (with staff override option)
 *
 * @module lib/validation/document-validation
 */

import { differenceInDays, differenceInMonths, isBefore, isAfter, addDays } from 'date-fns'

// ============================================================
// Types
// ============================================================

export type DocumentCategory = 'id_document' | 'proof_of_address' | 'corporate' | 'financial' | 'other'

export type ValidationEnforcement = 'strict_block' | 'block_with_override' | 'warn' | 'none'

export type ValidationStatus = 'valid' | 'expired' | 'expiring_soon' | 'stale' | 'pending' | 'rejected'

export interface DocumentValidationConfig {
  category: DocumentCategory
  maxAgeDays?: number  // For proof of address: 90 days (3 months)
  requiresExpiry?: boolean  // For ID documents
  enforcement: ValidationEnforcement
  warningDays?: number  // Days before expiry to show warning
}

export interface ValidationResult {
  isValid: boolean
  status: ValidationStatus
  enforcement: ValidationEnforcement
  errors: string[]
  warnings: string[]
  daysUntilExpiry?: number
  documentAgeInDays?: number
  canOverride: boolean
  overrideReason?: string
}

export interface DocumentValidationInput {
  documentType: string
  documentDate?: Date | string | null
  expiryDate?: Date | string | null
  issueDate?: Date | string | null
  isStaffOverride?: boolean
  overrideReason?: string
}

// ============================================================
// Document Type Configurations
// ============================================================

/**
 * Document types that are ID documents (passports, national IDs, etc.)
 * These require valid expiry dates and are STRICTLY blocked if expired
 */
export const ID_DOCUMENT_TYPES = [
  'passport_id',
  'passport',
  'national_id',
  'drivers_license',
  'signatory_id',
  'id_card',
  'residence_permit',
  'visa',
  'government_id',
  'other_government_id',
  'member_id',
  'director_id',
  'ubo_id',
] as const

/**
 * Document types that are proof of address
 * These must be < 3 months old and are blocked with override option
 */
export const PROOF_OF_ADDRESS_TYPES = [
  'proof_of_address',
  'signatory_proof_of_address',
  'utility_bill',
  'bank_statement',
  'tax_bill',
  'council_tax',
  'rental_agreement',
  'mortgage_statement',
  'member_proof_of_address',
] as const

/**
 * Corporate documents (certificates, registrations)
 * These may have expiry dates but are typically warning only
 */
export const CORPORATE_DOCUMENT_TYPES = [
  'certificate_of_incorporation',
  'memorandum_articles',
  'register_members_directors',
  'company_registration',
  'regulatory_license',
  'bar_registration',
  'practice_license',
  'firm_registration',
  'partnership_agreement',
] as const

// ============================================================
// Validation Configuration Map
// ============================================================

const VALIDATION_CONFIG: Record<string, DocumentValidationConfig> = {
  // ID Documents - STRICT BLOCK if expired
  passport_id: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  passport: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  national_id: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  drivers_license: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  residence_permit: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  other_government_id: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  signatory_id: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  member_id: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  director_id: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },
  ubo_id: {
    category: 'id_document',
    requiresExpiry: true,
    enforcement: 'strict_block',
    warningDays: 30,
  },

  // Proof of Address - BLOCK WITH OVERRIDE if > 3 months old
  proof_of_address: {
    category: 'proof_of_address',
    maxAgeDays: 90, // 3 months
    enforcement: 'block_with_override',
    warningDays: 14, // Warn when approaching 3-month limit
  },
  signatory_proof_of_address: {
    category: 'proof_of_address',
    maxAgeDays: 90,
    enforcement: 'block_with_override',
    warningDays: 14,
  },
  member_proof_of_address: {
    category: 'proof_of_address',
    maxAgeDays: 90,
    enforcement: 'block_with_override',
    warningDays: 14,
  },
  utility_bill: {
    category: 'proof_of_address',
    maxAgeDays: 90,
    enforcement: 'block_with_override',
    warningDays: 14,
  },
  bank_statement: {
    category: 'proof_of_address',
    maxAgeDays: 90,
    enforcement: 'block_with_override',
    warningDays: 14,
  },

  // Corporate Documents - WARN only
  certificate_of_incorporation: {
    category: 'corporate',
    enforcement: 'none',
  },
  regulatory_license: {
    category: 'corporate',
    requiresExpiry: true,
    enforcement: 'warn',
    warningDays: 60,
  },
  insurance_certificate: {
    category: 'corporate',
    requiresExpiry: true,
    enforcement: 'warn',
    warningDays: 60,
  },
}

// Default config for unknown document types
const DEFAULT_CONFIG: DocumentValidationConfig = {
  category: 'other',
  enforcement: 'none',
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Get the validation configuration for a document type
 */
export function getDocumentConfig(documentType: string): DocumentValidationConfig {
  return VALIDATION_CONFIG[documentType] || DEFAULT_CONFIG
}

/**
 * Check if a document type is an ID document
 */
export function isIdDocument(documentType: string): boolean {
  const normalized = (documentType || '').toLowerCase().trim()
  return ID_DOCUMENT_TYPES.includes(normalized as any) ||
    normalized.endsWith('_id') ||
    normalized.includes('passport') ||
    normalized === 'id_card' ||
    normalized === 'drivers_license'
}

/**
 * Check if a document type is a proof of address
 */
export function isProofOfAddress(documentType: string): boolean {
  return PROOF_OF_ADDRESS_TYPES.includes(documentType as any) ||
    documentType.includes('proof_of_address') ||
    documentType.includes('utility') ||
    documentType.includes('statement')
}

/**
 * Parse a date value (string, Date, or null)
 */
function parseDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Validate a document against the strict enforcement rules
 *
 * @param input - Document validation input
 * @returns ValidationResult with status, errors, and warnings
 */
export function validateDocument(input: DocumentValidationInput): ValidationResult {
  const config = getDocumentConfig(input.documentType)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day

  const result: ValidationResult = {
    isValid: true,
    status: 'valid',
    enforcement: config.enforcement,
    errors: [],
    warnings: [],
    canOverride: config.enforcement === 'block_with_override',
  }

  const expiryDate = parseDate(input.expiryDate)
  const documentDate = parseDate(input.documentDate)
  const issueDate = parseDate(input.issueDate)

  // ============================================================
  // ID Document Validation (STRICT BLOCK)
  // ============================================================
  if (config.category === 'id_document' || isIdDocument(input.documentType)) {
    // Check if expiry date is provided for ID documents
    if (config.requiresExpiry && !expiryDate) {
      result.warnings.push('ID documents should have an expiry date')
    }

    // STRICT: Block expired ID documents
    if (expiryDate) {
      result.daysUntilExpiry = differenceInDays(expiryDate, today)

      if (isBefore(expiryDate, today)) {
        // Document is EXPIRED
        result.isValid = false
        result.status = 'expired'
        result.errors.push(
          `ID document has expired on ${expiryDate.toLocaleDateString(undefined, { timeZone: 'UTC' })}. Please upload a current, valid document.`
        )
        result.canOverride = false // STRICT - no override for expired IDs
      } else if (config.warningDays && result.daysUntilExpiry <= config.warningDays) {
        // Document expiring soon
        result.status = 'expiring_soon'
        result.warnings.push(
          `ID document expires in ${result.daysUntilExpiry} days (${expiryDate.toLocaleDateString(undefined, { timeZone: 'UTC' })})`
        )
      }
    }
  }

  // ============================================================
  // Proof of Address Validation (BLOCK WITH OVERRIDE)
  // ============================================================
  if (config.category === 'proof_of_address' || isProofOfAddress(input.documentType)) {
    const dateToCheck = documentDate || issueDate

    if (!dateToCheck) {
      result.warnings.push('Proof of address documents should have a document date for freshness validation')
    } else {
      result.documentAgeInDays = differenceInDays(today, dateToCheck)
      const maxAgeDays = config.maxAgeDays || 90 // Default 3 months

      if (result.documentAgeInDays > maxAgeDays) {
        // Document is STALE (> 3 months old)
        const monthsOld = differenceInMonths(today, dateToCheck)

        if (input.isStaffOverride && input.overrideReason) {
          // Staff override provided
          result.status = 'valid'
          result.overrideReason = input.overrideReason
          result.warnings.push(
            `Document is ${monthsOld} months old (>${maxAgeDays / 30} months). Staff override applied: ${input.overrideReason}`
          )
        } else {
          // Block upload
          result.isValid = false
          result.status = 'stale'
          result.errors.push(
            `Proof of address must be dated within the last ${maxAgeDays / 30} months. This document is ${monthsOld} months old (dated ${dateToCheck.toLocaleDateString(undefined, { timeZone: 'UTC' })}). Staff override required.`
          )
          result.canOverride = true
        }
      } else if (config.warningDays) {
        // Check if approaching staleness
        const daysUntilStale = maxAgeDays - result.documentAgeInDays
        if (daysUntilStale <= config.warningDays) {
          result.warnings.push(
            `Proof of address becomes stale in ${daysUntilStale} days`
          )
        }
      }
    }
  }

  // ============================================================
  // Corporate/License Documents (WARN only)
  // ============================================================
  if (config.category === 'corporate' && expiryDate) {
    result.daysUntilExpiry = differenceInDays(expiryDate, today)

    if (isBefore(expiryDate, today)) {
      result.status = 'expired'
      result.warnings.push(
        `This document expired on ${expiryDate.toLocaleDateString(undefined, { timeZone: 'UTC' })}. Consider uploading a renewed version.`
      )
    } else if (config.warningDays && result.daysUntilExpiry <= config.warningDays) {
      result.status = 'expiring_soon'
      result.warnings.push(
        `This document expires in ${result.daysUntilExpiry} days`
      )
    }
  }

  return result
}

/**
 * Calculate the validation status for display purposes
 */
export function calculateValidationStatus(
  documentType: string,
  expiryDate?: Date | string | null,
  documentDate?: Date | string | null
): ValidationStatus {
  const result = validateDocument({
    documentType,
    expiryDate,
    documentDate,
  })
  return result.status
}

/**
 * Get human-readable label for validation status
 */
export function getValidationStatusLabel(status: ValidationStatus): string {
  const labels: Record<ValidationStatus, string> = {
    valid: 'Valid',
    expired: 'Expired',
    expiring_soon: 'Expiring Soon',
    stale: 'Stale',
    pending: 'Pending Review',
    rejected: 'Rejected',
  }
  return labels[status] || 'Unknown'
}

/**
 * Get color class for validation status badge
 */
export function getValidationStatusColor(status: ValidationStatus): string {
  const colors: Record<ValidationStatus, string> = {
    valid: 'bg-green-500/20 text-green-400',
    expired: 'bg-red-500/20 text-red-400',
    expiring_soon: 'bg-amber-500/20 text-amber-400',
    stale: 'bg-orange-500/20 text-orange-400',
    pending: 'bg-blue-500/20 text-blue-400',
    rejected: 'bg-red-500/20 text-red-400',
  }
  return colors[status] || 'bg-gray-500/20 text-gray-400'
}

/**
 * Format days until expiry for display
 */
export function formatExpiryCountdown(daysUntilExpiry: number): string {
  if (daysUntilExpiry < 0) {
    return `Expired ${Math.abs(daysUntilExpiry)} days ago`
  }
  if (daysUntilExpiry === 0) {
    return 'Expires today'
  }
  if (daysUntilExpiry === 1) {
    return 'Expires tomorrow'
  }
  if (daysUntilExpiry <= 7) {
    return `Expires in ${daysUntilExpiry} days`
  }
  if (daysUntilExpiry <= 30) {
    return `Expires in ${Math.ceil(daysUntilExpiry / 7)} weeks`
  }
  return `Expires in ${Math.ceil(daysUntilExpiry / 30)} months`
}

/**
 * Get documents that are expiring within a given number of days
 * Utility function for compliance dashboard queries
 */
export function getExpiryDateThreshold(daysFromNow: number): Date {
  return addDays(new Date(), daysFromNow)
}
