export type AccountStatusKey =
  | 'new'
  | 'incomplete'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'unauthorized'

const STATUS_LABELS: Record<AccountStatusKey, { label: string; description: string }> = {
  new: {
    label: 'NEW',
    description: 'User has not yet access to the platform.'
  },
  incomplete: {
    label: 'INCOMPLETE',
    description: 'User can view dispatched deals and positions but cannot request data room access, confirm interest, or invest.'
  },
  pending_approval: {
    label: 'PENDING APPROVAL',
    description: 'Profile submitted. Waiting for CEO approval.'
  },
  approved: {
    label: 'APPROVED',
    description: 'Account active. User can request data room access and invest.'
  },
  rejected: {
    label: 'REJECTED',
    description: 'KYC rejected. Contact support for next steps.'
  },
  unauthorized: {
    label: 'UNAUTHORIZED',
    description: 'Blacklisted. Viewing only; investment actions disabled.'
  }
}

const KYC_PROGRESS_STATUSES = new Set(['pending', 'submitted', 'in_progress', 'review', 'draft'])
const KYC_APPROVED_STATUSES = new Set(['approved', 'completed', 'verified'])
const KYC_REJECTED_STATUSES = new Set(['rejected'])
const UNAUTHORIZED_STATUSES = new Set(['unauthorized', 'blacklisted'])

function normalize(value?: string | null) {
  return value ? value.toLowerCase().trim() : null
}

export function formatKycStatusLabel(kycStatus?: string | null): string | null {
  if (!kycStatus) return null
  return kycStatus.replace(/_/g, ' ')
}

export function getAccountStatusCopy(
  accountApprovalStatus?: string | null,
  kycStatus?: string | null
) {
  const accountStatus = normalize(accountApprovalStatus)
  const kyc = normalize(kycStatus)

  if (accountStatus && UNAUTHORIZED_STATUSES.has(accountStatus)) return STATUS_LABELS.unauthorized
  if (accountStatus === 'approved') return STATUS_LABELS.approved
  if (accountStatus === 'rejected') return STATUS_LABELS.rejected
  if (accountStatus === 'pending_approval') return STATUS_LABELS.pending_approval
  if (accountStatus === 'incomplete') return STATUS_LABELS.incomplete
  if (accountStatus === 'new') return STATUS_LABELS.new
  if (accountStatus === 'pending_onboarding') {
    if (kyc && KYC_PROGRESS_STATUSES.has(kyc)) return STATUS_LABELS.incomplete
    if (kyc && KYC_APPROVED_STATUSES.has(kyc)) return STATUS_LABELS.pending_approval
    if (kyc && KYC_REJECTED_STATUSES.has(kyc)) return STATUS_LABELS.rejected
    return STATUS_LABELS.new
  }

  // Unknown/empty account status: infer from KYC if possible
  if (kyc && KYC_PROGRESS_STATUSES.has(kyc)) return STATUS_LABELS.incomplete
  if (kyc && KYC_APPROVED_STATUSES.has(kyc)) return STATUS_LABELS.pending_approval
  if (kyc && KYC_REJECTED_STATUSES.has(kyc)) return STATUS_LABELS.rejected

  return STATUS_LABELS.new
}
