import { ENTITY_REQUIRED_DOCS, getDocumentTypeLabel } from '@/constants/kyc-document-types'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

export type KycChecklistDocumentTypeOption = {
  value: string
  label: string
}

export type KycChecklistMember = {
  id: string
  full_name: string
  role: string
}

export type KycChecklistSubmission = {
  id: string
  document_type: string
  status?: string | null
  version?: number | null
  created_at?: string | null
  submitted_at?: string | null
  reviewed_at?: string | null
  document_date?: string | null
  document_valid_to?: string | null
  expiry_date?: string | null
  custom_label?: string | null
  rejection_reason?: string | null
  document?: {
    id: string
    name: string
    file_key?: string | null
    file_size_bytes?: number | null
    mime_type?: string | null
    created_at?: string | null
  } | null
  memberId?: string | null
  memberName?: string | null
  memberRole?: string | null
}

export type KycChecklistStatus =
  | 'missing'
  | 'draft'
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'

export type KycChecklistRow = {
  key: string
  scope: 'entity' | 'member' | 'individual'
  label: string
  memberId?: string | null
  memberName?: string | null
  memberRole?: string | null
  acceptedDocumentTypes: string[]
  documentTypeOptions: KycChecklistDocumentTypeOption[]
  latestSubmission: KycChecklistSubmission | null
  status: KycChecklistStatus
}

export const PORTAL_ID_DOCUMENT_OPTIONS: KycChecklistDocumentTypeOption[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'residence_permit', label: 'Residence Permit' },
  { value: 'other_government_id', label: 'Other Government ID' },
]

export const PORTAL_PROOF_OF_ADDRESS_OPTIONS: KycChecklistDocumentTypeOption[] = [
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'government_correspondence', label: 'Government Correspondence' },
  { value: 'council_tax_bill', label: 'Council Tax Bill' },
  { value: 'other', label: 'Other Proof of Address' },
]

const CHECKLIST_ID_REQUIREMENT = {
  key: 'proof_of_identification',
  label: 'Proof of Identification',
  documentTypeOptions: PORTAL_ID_DOCUMENT_OPTIONS,
}

const CHECKLIST_PROOF_OF_ADDRESS_REQUIREMENT = {
  key: 'proof_of_address',
  label: 'Proof of Address',
  documentTypeOptions: PORTAL_PROOF_OF_ADDRESS_OPTIONS,
}

const ENTITY_DOCUMENT_ALIASES: Record<string, string[]> = {
  incorporation_certificate: ['certificate_of_incorporation'],
  memo_articles: ['company_registration', 'memorandum_articles'],
  register_beneficial_owners: ['beneficial_ownership'],
  register_directors: ['directors_list'],
  bank_confirmation: ['bank_account_details'],
}

const CHECKLIST_ENTITY_REQUIREMENTS = ENTITY_REQUIRED_DOCS.map((document) => ({
  key: document.value,
  label: document.label,
  acceptedDocumentTypes: [document.value, ...(ENTITY_DOCUMENT_ALIASES[document.value] || [])],
  documentTypeOptions: [{ value: document.value, label: document.label }],
}))

function normalizeStatus(status?: string | null) {
  return (status || '').toLowerCase().trim()
}

function submissionTimestamp(submission: KycChecklistSubmission) {
  const candidate =
    submission.reviewed_at ||
    submission.submitted_at ||
    submission.created_at ||
    submission.document?.created_at ||
    null

  if (!candidate) return 0

  const parsed = Date.parse(candidate)
  return Number.isNaN(parsed) ? 0 : parsed
}

function resolveChecklistStatus(
  submission: KycChecklistSubmission | null
): KycChecklistStatus {
  if (!submission) return 'missing'

  const status = normalizeStatus(submission.status)

  if (!status) return 'pending'
  if (status === 'approved') return 'approved'
  if (status === 'under_review') return 'under_review'
  if (status === 'expired') return 'expired'
  if (status === 'draft') return 'draft'
  if (status.includes('reject') || status.includes('info_request')) return 'rejected'

  return 'pending'
}

function findLatestSubmission(
  submissions: KycChecklistSubmission[],
  acceptedDocumentTypes: string[],
  memberId?: string | null
) {
  const accepted = new Set(acceptedDocumentTypes.map((value) => value.toLowerCase().trim()))
  const matches = submissions.filter((submission) => {
    const submissionType = (submission.document_type || '').toLowerCase().trim()
    if (!accepted.has(submissionType)) return false

    if (memberId === undefined) return true
    if (memberId === null) return !submission.memberId
    return submission.memberId === memberId
  })

  if (matches.length === 0) return null

  return [...matches].sort((a, b) => submissionTimestamp(b) - submissionTimestamp(a))[0] || null
}

function buildRequirementRow(
  submissions: KycChecklistSubmission[],
  requirement: {
    key: string
    label: string
    acceptedDocumentTypes?: string[]
    documentTypeOptions: KycChecklistDocumentTypeOption[]
  },
  scope: KycChecklistRow['scope'],
  member?: KycChecklistMember
): KycChecklistRow {
  const acceptedDocumentTypes = requirement.acceptedDocumentTypes || requirement.documentTypeOptions.map((option) => option.value)
  const latestSubmission = findLatestSubmission(
    submissions,
    acceptedDocumentTypes,
    member ? member.id : scope === 'entity' ? null : undefined
  )

  return {
    key: member ? `${requirement.key}:${member.id}` : requirement.key,
    scope,
    label: requirement.label,
    memberId: member?.id ?? null,
    memberName: member?.full_name ?? null,
    memberRole: member?.role ?? null,
    acceptedDocumentTypes,
    documentTypeOptions: requirement.documentTypeOptions,
    latestSubmission,
    status: resolveChecklistStatus(latestSubmission),
  }
}

export function buildPortalKycChecklistRows(params: {
  entityType: 'individual' | 'entity'
  members?: KycChecklistMember[]
  submissions?: KycChecklistSubmission[]
}) {
  const { entityType, members = [], submissions = [] } = params

  if (entityType === 'individual') {
    return [
      buildRequirementRow(submissions, CHECKLIST_ID_REQUIREMENT, 'individual'),
      buildRequirementRow(submissions, CHECKLIST_PROOF_OF_ADDRESS_REQUIREMENT, 'individual'),
    ]
  }

  return [
    ...CHECKLIST_ENTITY_REQUIREMENTS.map((requirement) =>
      buildRequirementRow(submissions, requirement, 'entity')
    ),
    ...members.flatMap((member) => [
      buildRequirementRow(submissions, CHECKLIST_ID_REQUIREMENT, 'member', member),
      buildRequirementRow(submissions, CHECKLIST_PROOF_OF_ADDRESS_REQUIREMENT, 'member', member),
    ]),
  ]
}

export function getEquivalentKycRequirementDocumentTypes(documentType: string) {
  const normalized = (documentType || '').toLowerCase().trim()

  if (!normalized) return []

  if (isIdDocument(normalized)) {
    return Array.from(
      new Set([...PORTAL_ID_DOCUMENT_OPTIONS.map((option) => option.value), normalized])
    )
  }

  if (isProofOfAddress(normalized)) {
    return Array.from(
      new Set([...PORTAL_PROOF_OF_ADDRESS_OPTIONS.map((option) => option.value), normalized])
    )
  }

  const matchingEntityRequirement = CHECKLIST_ENTITY_REQUIREMENTS.find((requirement) =>
    requirement.acceptedDocumentTypes.includes(normalized)
  )

  if (matchingEntityRequirement) {
    return matchingEntityRequirement.acceptedDocumentTypes
  }

  return [normalized]
}

export function getChecklistDocumentTypeLabel(
  documentType?: string | null,
  customLabel?: string | null
) {
  if (!documentType) return null
  return getDocumentTypeLabel(documentType, customLabel)
}

export function getChecklistCompletionSummary(rows: KycChecklistRow[]) {
  const total = rows.length
  const approved = rows.filter((row) => row.status === 'approved').length
  const uploaded = rows.filter((row) => row.status !== 'missing').length
  const pending = rows.filter((row) =>
    row.status === 'pending' || row.status === 'draft' || row.status === 'under_review'
  ).length
  const attention = rows.filter((row) =>
    row.status === 'missing' || row.status === 'rejected' || row.status === 'expired'
  ).length

  return {
    total,
    approved,
    uploaded,
    pending,
    attention,
  }
}
