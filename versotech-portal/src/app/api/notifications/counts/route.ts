import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const TASK_STATUSES = ['pending', 'in_progress'] as const
const REQUEST_STATUSES = ['open', 'assigned', 'in_progress', 'awaiting_info'] as const
const APPROVAL_STATUSES = ['pending'] as const
const KYC_REVIEW_STATUSES = ['pending', 'under_review', 'unread', 'not_read'] as const
const CHUNK_SIZE = 50

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export async function GET() {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[notifications/counts] Failed to load profile:', profileError)
    }

    const userRole =
      profile?.role ??
      (typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : 'investor')

    const { data: personas } = await serviceSupabase.rpc('get_user_personas', { p_user_id: user.id })
    const isLawyerPersona = personas?.some((p: { persona_type: string }) => p.persona_type === 'lawyer') || false

    const [
      taskResult,
      notificationsResult,
      lawyerNotificationsResult,
      participantResult,
      membershipResult,
      investorLinksResult
    ] = await Promise.all([
      serviceSupabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('owner_user_id', user.id)
        .in('status', TASK_STATUSES),
      serviceSupabase
        .from('investor_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null),
      isLawyerPersona
        ? serviceSupabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false)
        : Promise.resolve({ count: 0, error: null }),
      serviceSupabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id),
      serviceSupabase
        .from('deal_memberships')
        .select('deal_id')
        .eq('user_id', user.id),
      serviceSupabase
        .from('investor_users')
        .select('investor_id')
        .eq('user_id', user.id)
    ])

    if (taskResult.error) {
      console.error('[notifications/counts] Task count error:', taskResult.error)
    }
    if (notificationsResult.error) {
      console.error('[notifications/counts] Notification count error:', notificationsResult.error)
    }
    if (lawyerNotificationsResult.error) {
      console.error('[notifications/counts] Lawyer notification count error:', lawyerNotificationsResult.error)
    }
    if (participantResult.error) {
      console.error('[notifications/counts] Conversation participant error:', participantResult.error)
    }
    if (membershipResult.error) {
      console.error('[notifications/counts] Deal membership error:', membershipResult.error)
    }
    if (investorLinksResult.error) {
      console.error('[notifications/counts] Investor link error:', investorLinksResult.error)
    }

    const taskCount = taskResult.count ?? 0
    const notificationCount = (notificationsResult.count ?? 0) + (lawyerNotificationsResult.count ?? 0)

    const conversationIds =
      participantResult.data?.map((row) => row.conversation_id).filter(Boolean) ?? []

    let messageCount = 0
    if (conversationIds.length > 0) {
      const chunks = chunkArray(conversationIds, CHUNK_SIZE)
      for (const chunk of chunks) {
        const { data, error } = await serviceSupabase.rpc('get_conversation_unread_counts', {
          p_user_id: user.id,
          p_conversation_ids: chunk
        })

        if (error) {
          console.error('[notifications/counts] Unread conversation count error:', error)
          continue
        }

        messageCount += (data ?? []).reduce(
          (total: number, row: any) => total + Number(row?.unread_count ?? 0),
          0
        )
      }
    }

    let dealCount = 0
    if (userRole === 'investor') {
      const accessibleDealIds = new Set<string>()
      const membershipIds =
        membershipResult.data?.map((row) => row.deal_id).filter(Boolean) ?? []
      membershipIds.forEach((id) => accessibleDealIds.add(id))

      const investorIds =
        investorLinksResult.data?.map((row) => row.investor_id).filter(Boolean) ?? []

      if (investorIds.length > 0) {
        const [interestResult, submissionResult, allocationResult] = await Promise.all([
          serviceSupabase
            .from('investor_deal_interest')
            .select('deal_id')
            .in('investor_id', investorIds),
          serviceSupabase
            .from('deal_subscription_submissions')
            .select('deal_id')
            .in('investor_id', investorIds),
          serviceSupabase
            .from('allocations')
            .select('deal_id')
            .in('investor_id', investorIds)
        ])

        if (interestResult.error) {
          console.error('[notifications/counts] Deal interest error:', interestResult.error)
        } else {
          interestResult.data
            ?.map((row) => row.deal_id)
            .filter(Boolean)
            .forEach((id) => accessibleDealIds.add(id))
        }

        if (submissionResult.error) {
          console.error('[notifications/counts] Deal submission error:', submissionResult.error)
        } else {
          submissionResult.data
            ?.map((row) => row.deal_id)
            .filter(Boolean)
            .forEach((id) => accessibleDealIds.add(id))
        }

        if (allocationResult.error) {
          console.error('[notifications/counts] Allocation error:', allocationResult.error)
        } else {
          allocationResult.data
            ?.map((row) => row.deal_id)
            .filter(Boolean)
            .forEach((id) => accessibleDealIds.add(id))
        }
      }

      if (accessibleDealIds.size > 0) {
        const { count, error } = await serviceSupabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .in('id', Array.from(accessibleDealIds))
          .eq('status', 'open')

        if (error) {
          console.error('[notifications/counts] Deal count error:', error)
        } else {
          dealCount = count ?? 0
        }
      }
    }

    let requestCount = 0
    let approvalCount = 0
    let kycReviewCount = 0
    let signaturesCount = 0
    let reconciliationCount = 0
    let feesCount = 0

    if (userRole.startsWith('staff_') || userRole === 'ceo') {
      const [
        requestsResult,
        approvalsResult,
        kycReviewResult,
        signaturesResult,
        reconciliationResult,
        feesResult
      ] = await Promise.all([
        serviceSupabase
          .from('request_tickets')
          .select('id', { count: 'exact', head: true })
          .in('status', REQUEST_STATUSES)
          .or(`assigned_to.eq.${user.id},assigned_to.is.null`),
        serviceSupabase
          .from('approvals')
          .select('id', { count: 'exact', head: true })
          .in('status', APPROVAL_STATUSES)
          .or(`assigned_to.eq.${user.id},assigned_to.is.null`),
        serviceSupabase
          .from('kyc_submissions')
          .select('id', { count: 'exact', head: true })
          .in('status', KYC_REVIEW_STATUSES),
        // Signatures: pending signature tasks (countersignature + subscription_pack_signature)
        // Note: VersoSign uses the tasks table, not signature_requests (which doesn't exist)
        serviceSupabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .in('kind', ['countersignature', 'subscription_pack_signature'])
          .in('status', ['pending', 'in_progress']),
        // Reconciliation: unmatched bank transactions
        serviceSupabase
          .from('bank_transactions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'unmatched'),
        // Fees: overdue invoices
        serviceSupabase
          .from('invoices')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'overdue')
      ])

      if (requestsResult.error) {
        console.error('[notifications/counts] Request count error:', requestsResult.error)
      } else {
        requestCount = requestsResult.count ?? 0
      }

      if (approvalsResult.error) {
        console.error('[notifications/counts] Approval count error:', approvalsResult.error)
      } else {
        approvalCount = approvalsResult.count ?? 0
      }

      if (kycReviewResult.error) {
        console.error('[notifications/counts] KYC review count error:', kycReviewResult.error)
      } else {
        kycReviewCount = kycReviewResult.count ?? 0
      }

      if (signaturesResult.error) {
        console.error('[notifications/counts] Signatures count error:', signaturesResult.error)
      } else {
        signaturesCount = signaturesResult.count ?? 0
      }

      if (reconciliationResult.error) {
        console.error('[notifications/counts] Reconciliation count error:', reconciliationResult.error)
      } else {
        reconciliationCount = reconciliationResult.count ?? 0
      }

      if (feesResult.error) {
        console.error('[notifications/counts] Fees count error:', feesResult.error)
      } else {
        feesCount = feesResult.count ?? 0
      }
    }

    const baseTotal = taskCount + messageCount + notificationCount
    const totalUnread = userRole.startsWith('staff_') || userRole === 'ceo'
      ? baseTotal + requestCount + approvalCount
      : baseTotal

    return NextResponse.json({
      counts: {
        tasks: taskCount,
        messages: messageCount,
        deals: dealCount,
        requests: requestCount,
        approvals: approvalCount,
        kyc_review: kycReviewCount,
        notifications: notificationCount,
        signatures: signaturesCount,
        reconciliation: reconciliationCount,
        fees: feesCount,
        totalUnread
      },
      meta: {
        role: userRole
      }
    })
  } catch (error) {
    console.error('[notifications/counts] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
