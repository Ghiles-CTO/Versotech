export type AccountStatusKey =
  | 'invited'
  | 'pending_onboarding'
  | 'kyc_in_progress'
  | 'pending_approval'
  | 'approved'
  | 'rejected'

const STATUS_LABELS: Record<AccountStatusKey, { label: string; description: string }> = {
  invited: {
    label: 'Invited',
    description: 'Accept the invitation and sign in to begin onboarding.'
  },
  pending_onboarding: {
    label: 'Pending onboarding',
    description: 'Complete your profile and start KYC to proceed.'
  },
  kyc_in_progress: {
    label: 'KYC in progress',
    description: 'Finish your KYC submission to proceed.'
  },
  pending_approval: {
    label: 'Pending approval',
    description: 'KYC approved. Waiting for CEO activation.'
  },
  approved: {
    label: 'Active',
    description: 'Account active.'
  },
  rejected: {
    label: 'Rejected',
    description: 'Approval rejected. Contact support to continue.'
  }
}

const KYC_PROGRESS_STATUSES = new Set(['pending', 'submitted', 'in_progress', 'review', 'draft'])
const KYC_APPROVED_STATUSES = new Set(['approved', 'completed', 'verified'])
const KYC_REJECTED_STATUSES = new Set(['rejected'])

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

  if (accountStatus === 'approved') return STATUS_LABELS.approved
  if (accountStatus === 'rejected') return STATUS_LABELS.rejected
  if (accountStatus === 'pending_approval') return STATUS_LABELS.pending_approval
  if (accountStatus === 'pending_onboarding') {
    if (kyc && KYC_PROGRESS_STATUSES.has(kyc)) return STATUS_LABELS.kyc_in_progress
    if (kyc && KYC_APPROVED_STATUSES.has(kyc)) return STATUS_LABELS.pending_approval
    if (kyc && KYC_REJECTED_STATUSES.has(kyc)) return STATUS_LABELS.rejected
    return STATUS_LABELS.pending_onboarding
  }
  if (accountStatus === 'invited') return STATUS_LABELS.invited

  // Unknown/empty account status: infer from KYC if possible
  if (kyc && KYC_PROGRESS_STATUSES.has(kyc)) return STATUS_LABELS.kyc_in_progress
  if (kyc && KYC_APPROVED_STATUSES.has(kyc)) return STATUS_LABELS.pending_approval
  if (kyc && KYC_REJECTED_STATUSES.has(kyc)) return STATUS_LABELS.rejected

  return STATUS_LABELS.pending_onboarding
}
