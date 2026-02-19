import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

type SubmissionLike = {
  document_type?: string | null
  status?: string | null
  created_at?: string | null
  submitted_at?: string | null
  reviewed_at?: string | null
  document_date?: string | null
  document_valid_from?: string | null
  document_valid_to?: string | null
  expiry_date?: string | null
  metadata?: {
    document_fields?: {
      document_number?: string | null
      issuing_country?: string | null
      document_date?: string | null
      document_issue_date?: string | null
      document_expiry_date?: string | null
      [key: string]: unknown
    } | null
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

export type ApprovedKycDocumentMetadata = {
  id_type: string | null
  id_number: string | null
  id_issue_date: string | null
  id_expiry_date: string | null
  id_issuing_country: string | null
  proof_of_address_date: string | null
}

function normalizeStatus(value?: string | null) {
  return value?.toLowerCase().trim() ?? null
}

function submissionTimestamp(submission: SubmissionLike): number {
  const candidate =
    submission.reviewed_at ||
    submission.submitted_at ||
    submission.created_at ||
    null
  if (!candidate) return 0
  const parsed = Date.parse(candidate)
  return Number.isNaN(parsed) ? 0 : parsed
}

function matchesMemberScope(
  submission: SubmissionLike,
  memberColumn: string | null,
  memberId: string | null
) {
  if (!memberColumn) return true
  const value = (submission as Record<string, unknown>)[memberColumn]

  if (memberId === null) {
    return !value
  }

  return value === memberId
}

export function extractApprovedKycDocumentMetadata(
  submissions: SubmissionLike[],
  options?: {
    memberColumn?: string | null
    memberId?: string | null
  }
): ApprovedKycDocumentMetadata {
  const memberColumn = options?.memberColumn ?? null
  const memberId = options?.memberId ?? null

  const approved = submissions
    .filter(submission => normalizeStatus(submission.status) === 'approved')
    .filter(submission => matchesMemberScope(submission, memberColumn, memberId))

  const sorted = [...approved].sort(
    (a, b) => submissionTimestamp(b) - submissionTimestamp(a)
  )

  const latestIdSubmission = sorted.find(
    submission => !!submission.document_type && isIdDocument(submission.document_type)
  )

  const latestProofSubmission = sorted.find(
    submission => !!submission.document_type && isProofOfAddress(submission.document_type)
  )

  return {
    id_type: latestIdSubmission?.document_type ?? null,
    id_number:
      latestIdSubmission?.metadata?.document_fields?.document_number ?? null,
    id_issue_date:
      latestIdSubmission?.document_valid_from ??
      latestIdSubmission?.metadata?.document_fields?.document_issue_date ??
      null,
    id_expiry_date:
      latestIdSubmission?.document_valid_to ??
      latestIdSubmission?.expiry_date ??
      latestIdSubmission?.metadata?.document_fields?.document_expiry_date ??
      null,
    id_issuing_country:
      latestIdSubmission?.metadata?.document_fields?.issuing_country ?? null,
    proof_of_address_date:
      latestProofSubmission?.document_date ??
      latestProofSubmission?.metadata?.document_fields?.document_date ??
      null,
  }
}
