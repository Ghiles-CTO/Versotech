function getApprovalEntityLabel(entityType: string): string {
  const labels: Record<string, string> = {
    account_activation: 'account activation',
    deal_interest: 'data room access',
    deal_interest_nda: 'data room access',
    deal_subscription: 'subscription',
    investor_onboarding: 'onboarding',
    member_invitation: 'member invitation',
    sale_request: 'sale request',
    commission_invoice: 'commission invoice',
  }

  return labels[entityType] || entityType.replace(/_/g, ' ')
}

export function getRequesterApprovalNotificationCopy(params: {
  action: 'approve' | 'reject'
  entityType: string
  rejectionReason?: string | null
}) {
  const approvalLabel = getApprovalEntityLabel(params.entityType)

  if (params.action === 'approve') {
    if (params.entityType === 'deal_subscription') {
      return {
        approvalLabel,
        title: `${approvalLabel} approved`,
        message: 'Your subscription request has been approved. Your subscription pack will be sent for signature soon.',
      }
    }

    return {
      approvalLabel,
      title: `${approvalLabel} approved`,
      message: `Your ${approvalLabel} request has been approved.`,
    }
  }

  return {
    approvalLabel,
    title: `${approvalLabel} rejected`,
    message: `Your ${approvalLabel} request has been rejected${params.rejectionReason ? `: ${params.rejectionReason}` : '.'}`,
  }
}
