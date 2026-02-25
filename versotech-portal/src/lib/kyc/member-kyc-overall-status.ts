import { SupabaseClient } from '@supabase/supabase-js'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'
import type { KYCEntityType } from '@/lib/kyc/check-entity-kyc-status'

export type MemberKycOverallStatus = 'approved' | 'pending' | 'rejected' | 'not_submitted'

type SubmissionRow = {
  document_type: string
  status: string | null
  submitted_at?: string | null
  reviewed_at?: string | null
  created_at?: string | null
  investor_member_id?: string | null
  partner_member_id?: string | null
  introducer_member_id?: string | null
  lawyer_member_id?: string | null
  commercial_partner_member_id?: string | null
  arranger_member_id?: string | null
}

function getSubmissionEntityColumn(entityType: KYCEntityType) {
  return entityType === 'arranger' ? 'arranger_entity_id' : `${entityType}_id`
}

function getSubmissionMemberColumn(entityType: KYCEntityType) {
  return `${entityType === 'arranger' ? 'arranger' : entityType}_member_id`
}

function normalizeStatus(value?: string | null) {
  return value ? value.toLowerCase().trim() : null
}

function normalizePendingLikeStatus(value?: string | null): string | null {
  const normalized = normalizeStatus(value)
  if (!normalized) return null
  if (['pending', 'submitted', 'under_review', 'pending_review'].includes(normalized)) {
    return 'pending'
  }
  return normalized
}

function getTimestamp(submission: SubmissionRow) {
  const raw = submission.reviewed_at || submission.submitted_at || submission.created_at
  if (!raw) return 0
  const parsed = Date.parse(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function getLatestSubmissionFor(
  submissions: SubmissionRow[],
  predicate: (submission: SubmissionRow) => boolean
) {
  let latest: SubmissionRow | null = null
  let latestTs = -1

  for (const submission of submissions) {
    if (!predicate(submission)) continue
    const ts = getTimestamp(submission)
    if (ts > latestTs) {
      latest = submission
      latestTs = ts
    }
  }

  return latest
}

function deriveOverallStatus(parts: Array<string | null>): MemberKycOverallStatus {
  const normalizedParts = parts.map((status) => normalizePendingLikeStatus(status))
  const hasRejected = normalizedParts.some((status) => status === 'rejected')
  if (hasRejected) return 'rejected'

  const allApproved = normalizedParts.every((status) => status === 'approved')
  if (allApproved) return 'approved'

  const hasAnySignal = normalizedParts.some((status) => status !== null)
  if (hasAnySignal) return 'pending'

  return 'not_submitted'
}

function derivePersonalPartStatus(params: {
  latestSubmissionStatus: string | null
  memberCurrentStatus?: string | null
}) {
  const latest = normalizePendingLikeStatus(params.latestSubmissionStatus)
  const current = normalizePendingLikeStatus(params.memberCurrentStatus)

  if (latest === 'rejected' || current === 'rejected') return 'rejected'
  if (current === 'pending') return 'pending'
  if (latest === 'pending') return 'pending'
  if (current === 'approved' || latest === 'approved') return 'approved'
  return null
}

export async function getMemberOverallKycStatusMap(params: {
  supabase: SupabaseClient
  entityType: KYCEntityType
  entityId: string
  memberIds: string[]
  memberCurrentStatuses?: Record<string, string | null | undefined>
}) {
  const {
    supabase,
    entityType,
    entityId,
    memberIds,
    memberCurrentStatuses = {},
  } = params
  const result: Record<string, MemberKycOverallStatus> = {}

  if (memberIds.length === 0) {
    return result
  }

  const submissionEntityColumn = getSubmissionEntityColumn(entityType)
  const submissionMemberColumn = getSubmissionMemberColumn(entityType)

  const { data, error } = await supabase
    .from('kyc_submissions')
    .select(`
      document_type,
      status,
      submitted_at,
      reviewed_at,
      created_at,
      investor_member_id,
      partner_member_id,
      introducer_member_id,
      lawyer_member_id,
      commercial_partner_member_id,
      arranger_member_id
    `)
    .eq(submissionEntityColumn, entityId)

  if (error || !data) {
    memberIds.forEach((memberId) => {
      result[memberId] = 'not_submitted'
    })
    return result
  }

  const submissions = data as SubmissionRow[]

  for (const memberId of memberIds) {
    const memberSubmissions = submissions.filter(
      (submission) => (submission as any)[submissionMemberColumn] === memberId
    )

    const latestPersonalInfo = getLatestSubmissionFor(
      memberSubmissions,
      (submission) => submission.document_type === 'personal_info'
    )
    const latestId = getLatestSubmissionFor(
      memberSubmissions,
      (submission) => isIdDocument(submission.document_type)
    )
    const latestProofOfAddress = getLatestSubmissionFor(
      memberSubmissions,
      (submission) => isProofOfAddress(submission.document_type)
    )

    const personalPartStatus = derivePersonalPartStatus({
      latestSubmissionStatus: latestPersonalInfo?.status || null,
      memberCurrentStatus: memberCurrentStatuses[memberId],
    })

    result[memberId] = deriveOverallStatus([
      personalPartStatus,
      latestId?.status || null,
      latestProofOfAddress?.status || null,
    ])
  }

  return result
}
