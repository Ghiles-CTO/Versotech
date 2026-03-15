import { SupabaseClient } from '@supabase/supabase-js'

import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

type IntroducerRow = {
  id: string
  legal_name?: string | null
  contact_name?: string | null
  type?: string | null
  kyc_status?: string | null
  account_approval_status?: string | null
}

type SubmissionRow = {
  id?: string
  document_type: string
  status: string
  introducer_member_id?: string | null
  submitted_at?: string | null
  reviewed_at?: string | null
}

type MemberRow = {
  id: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  linked_user_id?: string | null
}

type ApprovalRow = {
  id: string
  status?: string | null
  entity_metadata?: Record<string, unknown> | null
}

export type IntroducerKycMissingItem = {
  scope: 'entity' | 'member'
  name: string
  email?: string | null
  missingItems: string[]
  memberId?: string | null
}

export type IntroducerRequestInfoNotice = {
  details: string
  reason: string | null
  requestedAt: string | null
}

export type IntroducerAccountApprovalReadiness = {
  introducerId: string
  introducerName: string
  introducerType: string
  accountApprovalStatus: string | null
  isKycApproved: boolean
  isReady: boolean
  hasPendingApproval: boolean
  pendingApprovalId: string | null
  missingItems: IntroducerKycMissingItem[]
  latestRequestInfo: IntroducerRequestInfoNotice | null
}

const REQUIRED_ENTITY_DOCUMENTS = [
  'incorporation_certificate',
  'memo_articles',
  'register_members',
  'register_beneficial_owners',
  'register_directors',
  'bank_confirmation',
] as const

const ENTITY_DOCUMENT_LABELS: Record<(typeof REQUIRED_ENTITY_DOCUMENTS)[number], string> = {
  incorporation_certificate: 'Certificate of Incorporation',
  memo_articles: 'Memorandum & Articles of Association',
  register_members: 'Register of Members',
  register_beneficial_owners: 'Register of Beneficial Owners',
  register_directors: 'Register of Directors',
  bank_confirmation: 'Bank Confirmation Letter',
}

const ENTITY_DOCUMENT_ALIASES: Record<string, string[]> = {
  incorporation_certificate: ['certificate_of_incorporation'],
  memo_articles: ['company_registration', 'memorandum_articles'],
  register_beneficial_owners: ['beneficial_ownership'],
  register_directors: ['directors_list'],
  bank_confirmation: ['bank_account_details'],
}

function normalizeStatus(value?: string | null): string {
  return (value || '').toLowerCase().trim()
}

function getIntroducerName(introducer: IntroducerRow): string {
  return introducer.legal_name || introducer.contact_name || 'Introducer Account'
}

function getMemberName(member: MemberRow, index: number): string {
  const fullName = member.full_name?.trim()
  if (fullName) return fullName
  const assembled = `${member.first_name || ''} ${member.last_name || ''}`.trim()
  if (assembled) return assembled
  const email = member.email?.trim()
  if (email) return email
  return `Member ${index + 1}`
}

function isSubmissionForMember(submission: SubmissionRow, memberId?: string | null): boolean {
  if (memberId === undefined) return true
  if (memberId === null) return !submission.introducer_member_id
  return submission.introducer_member_id === memberId
}

function getSubmissionSortTimestamp(submission: SubmissionRow): number {
  const submittedAt = submission.submitted_at ? Date.parse(submission.submitted_at) : Number.NaN
  const reviewedAt = submission.reviewed_at ? Date.parse(submission.reviewed_at) : Number.NaN
  if (Number.isFinite(reviewedAt)) return reviewedAt
  if (Number.isFinite(submittedAt)) return submittedAt
  return 0
}

function getLatestSubmission(
  submissions: SubmissionRow[],
  predicate: (submission: SubmissionRow) => boolean
): SubmissionRow | null {
  const candidates = submissions.filter(predicate)
  if (candidates.length === 0) return null
  candidates.sort((a, b) => getSubmissionSortTimestamp(b) - getSubmissionSortTimestamp(a))
  return candidates[0] || null
}

function getLatestSubmissionForType(
  submissions: SubmissionRow[],
  documentType: string,
  memberId?: string | null
): SubmissionRow | null {
  return getLatestSubmission(
    submissions,
    (submission) =>
      submission.document_type === documentType &&
      isSubmissionForMember(submission, memberId)
  )
}

function getLatestIdDocumentSubmission(
  submissions: SubmissionRow[],
  memberId?: string | null
) {
  return getLatestSubmission(
    submissions,
    (submission) =>
      isIdDocument(submission.document_type) &&
      isSubmissionForMember(submission, memberId)
  )
}

function getLatestProofOfAddressSubmission(
  submissions: SubmissionRow[],
  memberId?: string | null
) {
  return getLatestSubmission(
    submissions,
    (submission) =>
      isProofOfAddress(submission.document_type) &&
      isSubmissionForMember(submission, memberId)
  )
}

function getLatestEntityDocumentSubmission(
  submissions: SubmissionRow[],
  documentType: string
) {
  const acceptedTypes = [documentType, ...(ENTITY_DOCUMENT_ALIASES[documentType] || [])]
  return getLatestSubmission(
    submissions,
    (submission) =>
      acceptedTypes.includes(submission.document_type) &&
      isSubmissionForMember(submission, null)
  )
}

function toOutstandingRequirementLabel(
  label: string,
  latestSubmission: SubmissionRow | null
): string | null {
  if (!latestSubmission) {
    return `${label} (missing)`
  }

  const status = normalizeStatus(latestSubmission.status)
  if (status === 'approved') {
    return null
  }

  if (status.includes('reject')) {
    return `${label} (rejected)`
  }

  return `${label} (not yet approved)`
}

function parseLatestRequestInfo(entityMetadata: unknown): IntroducerRequestInfoNotice | null {
  if (!entityMetadata || typeof entityMetadata !== 'object' || Array.isArray(entityMetadata)) {
    return null
  }

  const metadata = entityMetadata as Record<string, unknown>
  const candidate =
    (metadata.last_request_info as Record<string, unknown> | undefined) ||
    (metadata.request_info as Record<string, unknown> | undefined)

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return null
  }

  if ((candidate as Record<string, unknown>).active !== true) {
    return null
  }

  const details = typeof candidate.details === 'string' ? candidate.details.trim() : ''
  const reason = typeof candidate.reason === 'string' ? candidate.reason.trim() : ''
  const message = details || reason

  if (!message) return null

  return {
    details: message,
    reason: reason || null,
    requestedAt: typeof candidate.requested_at === 'string' ? candidate.requested_at : null,
  }
}

export async function getIntroducerAccountApprovalReadiness(params: {
  supabase: SupabaseClient
  introducerId: string
  linkedUserId?: string | null
}): Promise<IntroducerAccountApprovalReadiness | null> {
  const { supabase, introducerId, linkedUserId } = params

  const { data: introducerData, error: introducerError } = await supabase
    .from('introducers')
    .select('id, legal_name, contact_name, type, kyc_status, account_approval_status')
    .eq('id', introducerId)
    .maybeSingle()

  if (introducerError || !introducerData) {
    return null
  }

  const introducer = introducerData as IntroducerRow

  const [submissionsResult, membersResult, approvalsResult] = await Promise.all([
    supabase
      .from('kyc_submissions')
      .select('id, document_type, status, introducer_member_id, submitted_at, reviewed_at')
      .eq('introducer_id', introducerId)
      .in('status', ['approved', 'pending', 'under_review', 'rejected']),
    supabase
      .from('introducer_members')
      .select('id, full_name, first_name, last_name, email, linked_user_id')
      .eq('introducer_id', introducerId)
      .eq('is_active', true),
    supabase
      .from('approvals')
      .select('id, status, entity_metadata')
      .eq('entity_type', 'account_activation')
      .eq('entity_id', introducerId)
      .in('status', ['pending', 'cancelled'])
      .order('updated_at', { ascending: false })
      .limit(25),
  ])

  const submissions = (submissionsResult.data || []) as SubmissionRow[]
  const members = (membersResult.data || []) as MemberRow[]
  const approvalRows = (approvalsResult.data || []) as ApprovalRow[]

  const pendingApproval = approvalRows.find((row) => normalizeStatus(row.status) === 'pending') || null
  let latestRequestInfo: IntroducerRequestInfoNotice | null = null

  for (const row of approvalRows) {
    if (normalizeStatus(row.status) !== 'cancelled') continue
    const parsed = parseLatestRequestInfo(row.entity_metadata)
    if (parsed) {
      latestRequestInfo = parsed
      break
    }
  }

  const activeMembers = [...members].sort((a, b) => {
    const aLinked = linkedUserId && a.linked_user_id === linkedUserId ? 0 : 1
    const bLinked = linkedUserId && b.linked_user_id === linkedUserId ? 0 : 1
    if (aLinked !== bLinked) return aLinked - bLinked
    return getMemberName(a, 0).localeCompare(getMemberName(b, 0))
  })

  const missingItems: IntroducerKycMissingItem[] = []
  const isIndividual = normalizeStatus(introducer.type) === 'individual'
  const introducerName = getIntroducerName(introducer)

  if (isIndividual) {
    const primaryMember = activeMembers[0] || null
    const missing: string[] = []

    const personalIssue = toOutstandingRequirementLabel(
      'Personal Information',
      getLatestSubmissionForType(submissions, 'personal_info', primaryMember?.id || null)
    )
    if (personalIssue) missing.push(personalIssue)

    const idIssue = toOutstandingRequirementLabel(
      'Proof of Identification',
      getLatestIdDocumentSubmission(submissions, primaryMember?.id || null)
    )
    if (idIssue) missing.push(idIssue)

    const addressIssue = toOutstandingRequirementLabel(
      'Proof of Address',
      getLatestProofOfAddressSubmission(submissions, primaryMember?.id || null)
    )
    if (addressIssue) missing.push(addressIssue)

    if (!primaryMember) {
      missing.push('At least one active member')
    }

    if (missing.length > 0) {
      missingItems.push({
        scope: primaryMember ? 'member' : 'entity',
        name: primaryMember ? getMemberName(primaryMember, 0) : introducerName,
        email: primaryMember?.email || null,
        missingItems: missing,
        memberId: primaryMember?.id || null,
      })
    }
  } else {
    const entityMissing: string[] = []

    const entityInfoIssue = toOutstandingRequirementLabel(
      'Entity Information',
      getLatestSubmissionForType(submissions, 'entity_info', null)
    )
    if (entityInfoIssue) entityMissing.push(entityInfoIssue)

    for (const requiredType of REQUIRED_ENTITY_DOCUMENTS) {
      const entityDocIssue = toOutstandingRequirementLabel(
        ENTITY_DOCUMENT_LABELS[requiredType],
        getLatestEntityDocumentSubmission(submissions, requiredType)
      )
      if (entityDocIssue) entityMissing.push(entityDocIssue)
    }

    if (activeMembers.length === 0) {
      entityMissing.push('At least one active member')
    }

    if (entityMissing.length > 0) {
      missingItems.push({
        scope: 'entity',
        name: introducerName,
        missingItems: entityMissing,
      })
    }

    activeMembers.forEach((member, index) => {
      const missing: string[] = []

      const personalIssue = toOutstandingRequirementLabel(
        'Personal Information',
        getLatestSubmissionForType(submissions, 'personal_info', member.id)
      )
      if (personalIssue) missing.push(personalIssue)

      const idIssue = toOutstandingRequirementLabel(
        'Proof of Identification',
        getLatestIdDocumentSubmission(submissions, member.id)
      )
      if (idIssue) missing.push(idIssue)

      const addressIssue = toOutstandingRequirementLabel(
        'Proof of Address',
        getLatestProofOfAddressSubmission(submissions, member.id)
      )
      if (addressIssue) missing.push(addressIssue)

      if (missing.length > 0) {
        missingItems.push({
          scope: 'member',
          name: getMemberName(member, index),
          email: member.email || null,
          missingItems: missing,
          memberId: member.id,
        })
      }
    })
  }

  const isKycApproved = normalizeStatus(introducer.kyc_status) === 'approved'

  return {
    introducerId,
    introducerName,
    introducerType: normalizeStatus(introducer.type) || 'entity',
    accountApprovalStatus: introducer.account_approval_status || null,
    isKycApproved,
    isReady: isKycApproved && missingItems.length === 0,
    hasPendingApproval: !!pendingApproval,
    pendingApprovalId: pendingApproval?.id || null,
    missingItems,
    latestRequestInfo,
  }
}
