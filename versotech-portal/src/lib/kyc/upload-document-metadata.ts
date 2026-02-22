import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

export type UploadDocumentMetadataInput = {
  documentNumber: string | null
  documentIssueDate: string | null
  documentExpiryDate: string | null
  documentIssuingCountry: string | null
  documentDate: string | null
}

export type UploadDocumentMetadataResult = {
  submission: {
    document_date: string | null
    document_valid_from: string | null
    document_valid_to: string | null
    expiry_date: string | null
  }
  metadataFields: {
    document_number: string | null
    issuing_country: string | null
  }
}

function clean(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed || null
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

function isValidDateOnly(value: string): boolean {
  if (!DATE_ONLY_REGEX.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

/**
 * Validate document metadata based on selected document type.
 *
 * Rules:
 * - ID documents require: expiry date only
 *   (document number, issue date, and issuing country are optional)
 * - Proof of address documents require: document date
 */
export function validateUploadDocumentMetadata(
  documentType: string,
  rawInput: UploadDocumentMetadataInput
): string | null {
  const input: UploadDocumentMetadataInput = {
    documentNumber: clean(rawInput.documentNumber),
    documentIssueDate: clean(rawInput.documentIssueDate),
    documentExpiryDate: clean(rawInput.documentExpiryDate),
    documentIssuingCountry: clean(rawInput.documentIssuingCountry),
    documentDate: clean(rawInput.documentDate),
  }

  const dateFieldValidations: Array<{ value: string | null; label: string }> = [
    { value: input.documentIssueDate, label: 'Issue date' },
    { value: input.documentExpiryDate, label: 'Expiry date' },
    { value: input.documentDate, label: 'Document date' },
  ]

  for (const field of dateFieldValidations) {
    if (field.value && !isValidDateOnly(field.value)) {
      return `${field.label} must be a valid date in YYYY-MM-DD format`
    }
  }

  if (isIdDocument(documentType)) {
    if (!input.documentExpiryDate) return 'Expiry date is required for ID documents'
  }

  if (isProofOfAddress(documentType) && !input.documentDate) {
    return 'Document date is required for proof of address documents'
  }

  return null
}

export function buildUploadDocumentMetadata(
  documentType: string,
  rawInput: UploadDocumentMetadataInput
): UploadDocumentMetadataResult {
  const documentNumber = clean(rawInput.documentNumber)
  const documentIssueDate = clean(rawInput.documentIssueDate)
  const documentExpiryDate = clean(rawInput.documentExpiryDate)
  const documentIssuingCountry = clean(rawInput.documentIssuingCountry)
  const documentDate = clean(rawInput.documentDate)

  const isId = isIdDocument(documentType)
  const isPoa = isProofOfAddress(documentType)

  return {
    submission: {
      document_date: isPoa ? documentDate : null,
      document_valid_from: isId ? documentIssueDate : null,
      document_valid_to: isId ? documentExpiryDate : null,
      expiry_date: isId ? documentExpiryDate : null,
    },
    metadataFields: {
      document_number: isId ? documentNumber : null,
      issuing_country: isId ? documentIssuingCountry : null,
    },
  }
}
