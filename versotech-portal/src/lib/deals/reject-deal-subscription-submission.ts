import { updateDealInvestmentCycleProgress } from '@/lib/deals/investment-cycles'

type CycleProgressSupabase = Parameters<typeof updateDealInvestmentCycleProgress>[0]['supabase']

type RejectDealSubscriptionSubmissionParams = {
  supabase: CycleProgressSupabase
  submissionId: string
  reason: string
  actorId: string
  now?: string
}

export async function rejectDealSubscriptionSubmission({
  supabase,
  submissionId,
  reason,
  actorId,
  now = new Date().toISOString(),
}: RejectDealSubscriptionSubmissionParams) {
  const { data: submission, error: submissionError } = await supabase
    .from('deal_subscription_submissions')
    .select('cycle_id')
    .eq('id', submissionId)
    .maybeSingle()

  if (submissionError) {
    throw submissionError
  }

  const { error: rejectionError } = await supabase
    .from('deal_subscription_submissions')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      rejected_by: actorId,
      rejected_at: now,
      decided_by: actorId,
      decided_at: now,
    })
    .eq('id', submissionId)

  if (rejectionError) {
    throw rejectionError
  }

  if (!submission?.cycle_id) {
    return
  }

  await updateDealInvestmentCycleProgress({
    supabase,
    cycleId: submission.cycle_id,
    status: 'rejected',
    rejectionReason: reason,
    timestamps: {
      rejected_at: now,
    },
  })
}
