import { SupabaseClient } from '@supabase/supabase-js'
import { isIdDocument, isProofOfAddress } from '@/lib/validation/document-validation'

type InvestorRow = {
  id: string
  legal_name?: string | null
  display_name?: string | null
  type?: string | null
  kyc_status?: string | null
  account_approval_status?: string | null
}

type SubmissionRow = {
  document_type: string
  status: string
  investor_member_id?: string | null
}

type MemberRow = {
  id: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

type ApprovalRow = {
  id: string
  status?: string | null
  entity_metadata?: Record<string, unknown> | null
}

export type InvestorKycMissingItem = {
  scope: 'entity' | 'member'
  name: string
  missingItems: string[]
  memberId?: string | null
}

export type InvestorRequestInfoNotice = {
  details: string
  reason: string | null
  requestedAt: string | null
}

export type InvestorAccountApprovalReadiness = {
  investorId: string
  investorName: string
  investorType: string
  accountApprovalStatus: string | null
  isKycApproved: boolean
  isReady: boolean
  hasPendingApproval: boolean
  pendingApprovalId: string | null
  missingItems: InvestorKycMissingItem[]
  latestRequestInfo: InvestorRequestInfoNotice | null
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

function getInvestorName(investor: InvestorRow): string {
  return investor.display_name || investor.legal_name || 'Investor Account'
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

function hasApprovedSubmissionForType(
  submissions: SubmissionRow[],
  documentType: string,
  memberId?: string | null
): boolean {
  return submissions.some((submission) => {
    if (normalizeStatus(submission.status) !== 'approved') return false
    if (submission.document_type !== documentType) return false

    if (memberId === undefined) return true
    if (memberId === null) return !submission.investor_member_id
    return submission.investor_member_id === memberId
  })
}

function hasApprovedIdDocument(submissions: SubmissionRow[], memberId?: string | null): boolean {
  return submissions.some((submission) => {
    if (normalizeStatus(submission.status) !== 'approved') return false
    if (!isIdDocument(submission.document_type)) return false

    if (memberId === undefined) return true
    if (memberId === null) return !submission.investor_member_id
    return submission.investor_member_id === memberId
  })
}

function hasApprovedProofOfAddress(submissions: SubmissionRow[], memberId?: string | null): boolean {
  return submissions.some((submission) => {
    if (normalizeStatus(submission.status) !== 'approved') return false
    if (!isProofOfAddress(submission.document_type)) return false

    if (memberId === undefined) return true
    if (memberId === null) return !submission.investor_member_id
    return submission.investor_member_id === memberId
  })
}

function hasApprovedEntityDocument(submissions: SubmissionRow[], documentType: string): boolean {
  const acceptedTypes = [documentType, ...(ENTITY_DOCUMENT_ALIASES[documentType] || [])]

  return acceptedTypes.some((type) =>
    hasApprovedSubmissionForType(submissions, type, null)
  )
}

function parseLatestRequestInfo(entityMetadata: unknown): InvestorRequestInfoNotice | null {
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

export async function getInvestorAccountApprovalReadiness(params: {
  supabase: SupabaseClient
  investorId: string
}): Promise<InvestorAccountApprovalReadiness | null> {
  const { supabase, investorId } = params

  const { data: investorData, error: investorError } = await supabase
    .from('investors')
    .select('id, legal_name, display_name, type, kyc_status, account_approval_status')
    .eq('id', investorId)
    .maybeSingle()

  if (investorError || !investorData) {
    return null
  }

  const investor = investorData as InvestorRow

  const [submissionsResult, membersResult, approvalsResult] = await Promise.all([
    supabase
      .from('kyc_submissions')
      .select('document_type, status, investor_member_id')
      .eq('investor_id', investorId)
      .eq('status', 'approved'),
    supabase
      .from('investor_members')
      .select('id, full_name, first_name, last_name, email')
      .eq('investor_id', investorId)
      .eq('is_active', true),
    supabase
      .from('approvals')
      .select('id, status, entity_metadata')
      .eq('entity_type', 'account_activation')
      .eq('entity_id', investorId)
      .in('status', ['pending', 'cancelled'])
      .order('updated_at', { ascending: false })
      .limit(25),
  ])

  const approvedSubmissions = (submissionsResult.data || []) as SubmissionRow[]
  const activeMembers = (membersResult.data || []) as MemberRow[]
  const approvalRows = (approvalsResult.data || []) as ApprovalRow[]

  const pendingApproval = approvalRows.find((row) => normalizeStatus(row.status) === 'pending') || null
  let latestRequestInfo: InvestorRequestInfoNotice | null = null

  for (const row of approvalRows) {
    if (normalizeStatus(row.status) !== 'cancelled') continue
    const parsed = parseLatestRequestInfo(row.entity_metadata)
    if (parsed) {
      latestRequestInfo = parsed
      break
    }
  }

  const missingItems: InvestorKycMissingItem[] = []
  const isIndividual = normalizeStatus(investor.type) === 'individual'
  const investorName = getInvestorName(investor)

  if (isIndividual) {
    const missing: string[] = []
    if (!hasApprovedSubmissionForType(approvedSubmissions, 'personal_info', null)) {
      missing.push('Personal Information')
    }
    if (!hasApprovedIdDocument(approvedSubmissions, null)) {
      missing.push('ID Document')
    }
    if (!hasApprovedProofOfAddress(approvedSubmissions, null)) {
      missing.push('Proof of Address')
    }
    if (missing.length > 0) {
      missingItems.push({
        scope: 'entity',
        name: investorName,
        missingItems: missing,
      })
    }
  } else {
    const entityMissing: string[] = []

    if (!hasApprovedSubmissionForType(approvedSubmissions, 'entity_info', null)) {
      entityMissing.push('Entity Information')
    }

    for (const requiredType of REQUIRED_ENTITY_DOCUMENTS) {
      if (!hasApprovedEntityDocument(approvedSubmissions, requiredType)) {
        entityMissing.push(ENTITY_DOCUMENT_LABELS[requiredType])
      }
    }

    if (activeMembers.length === 0) {
      entityMissing.push('At least one active member')
    }

    if (entityMissing.length > 0) {
      missingItems.push({
        scope: 'entity',
        name: investorName,
        missingItems: entityMissing,
      })
    }

    activeMembers.forEach((member, index) => {
      const missing: string[] = []

      if (!hasApprovedSubmissionForType(approvedSubmissions, 'personal_info', member.id)) {
        missing.push('Personal Information')
      }
      if (!hasApprovedIdDocument(approvedSubmissions, member.id)) {
        missing.push('ID Document')
      }
      if (!hasApprovedProofOfAddress(approvedSubmissions, member.id)) {
        missing.push('Proof of Address')
      }

      if (missing.length > 0) {
        missingItems.push({
          scope: 'member',
          name: getMemberName(member, index),
          missingItems: missing,
          memberId: member.id,
        })
      }
    })
  }

  const isKycApproved = normalizeStatus(investor.kyc_status) === 'approved'

  return {
    investorId,
    investorName,
    investorType: normalizeStatus(investor.type) || 'entity',
    accountApprovalStatus: investor.account_approval_status || null,
    isKycApproved,
    isReady: isKycApproved && missingItems.length === 0,
    hasPendingApproval: !!pendingApproval,
    pendingApprovalId: pendingApproval?.id || null,
    missingItems,
    latestRequestInfo,
  }
}

