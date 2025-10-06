import { AppLayout } from '@/components/layout/app-layout'
import { Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ApprovalsPageClient } from '@/components/approvals/approvals-page-client'
import { Approval, ApprovalStats } from '@/types/approvals'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { parseDemoSession, DEMO_COOKIE_NAME } from '@/lib/demo-session'

// Fetch approval data server-side directly from database
async function fetchApprovalData(): Promise<{
  approvals: Approval[]
  stats: ApprovalStats
  counts: { pending: number; approved: number; rejected: number }
  hasData: boolean
}> {
  try {
    // Use service client to bypass RLS for demo sessions
    const supabase = createServiceClient()

    // Check for demo session
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)

    if (!demoCookie) {
      console.log('[Approvals] No demo session found')
      return getEmptyData()
    }

    const demoSession = parseDemoSession(demoCookie.value)
    if (!demoSession) {
      console.log('[Approvals] Invalid demo session')
      return getEmptyData()
    }

    console.log('[Approvals] Fetching data for demo user:', demoSession.email, demoSession.role)

    // Fetch approvals with comprehensive joins
    const { data: approvals, error: approvalsError } = await supabase
      .from('approvals')
      .select(`
        *,
        requested_by_profile:requested_by (
          id,
          display_name,
          email,
          role
        ),
        assigned_to_profile:assigned_to (
          id,
          display_name,
          email,
          role
        ),
        approved_by_profile:approved_by (
          id,
          display_name,
          email,
          role
        ),
        related_deal:deals (
          id,
          name,
          status,
          deal_type,
          currency
        ),
        related_investor:investors (
          id,
          legal_name,
          kyc_status,
          type
        )
      `)
      .eq('status', 'pending')
      .order('sla_breach_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (approvalsError) {
      console.error('[Approvals] Error fetching approvals:', approvalsError)
      return getEmptyData()
    }

    console.log(`[Approvals] Fetched ${approvals?.length || 0} pending approvals`)

    // Get statistics using RPC function
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_approval_stats', { p_staff_id: null })
      .single()

    if (statsError) {
      console.warn('[Approvals] Error fetching stats:', statsError)
    }

    const stats: ApprovalStats = statsData || {
      total_pending: approvals?.length || 0,
      overdue_count: 0,
      avg_processing_time_hours: 0,
      approval_rate_24h: 0,
      total_approved_30d: 0,
      total_rejected_30d: 0,
      total_awaiting_info: 0
    }

    console.log('[Approvals] Stats:', stats)

    return {
      approvals: (approvals || []) as Approval[],
      stats,
      counts: {
        pending: stats.total_pending,
        approved: stats.total_approved_30d,
        rejected: stats.total_rejected_30d
      },
      hasData: (approvals && approvals.length > 0) || false
    }
  } catch (error) {
    console.error('[Approvals] Error in fetchApprovalData:', error)
    return getEmptyData()
  }
}

function getEmptyData() {
  return {
    approvals: [],
    stats: {
      total_pending: 0,
      overdue_count: 0,
      avg_processing_time_hours: 0,
      approval_rate_24h: 0,
      total_approved_30d: 0,
      total_rejected_30d: 0,
      total_awaiting_info: 0
    },
    counts: { pending: 0, approved: 0, rejected: 0 },
    hasData: false
  }
}

export default async function ApprovalsPage() {
  // Fetch approval data server-side
  const { approvals, stats, counts, hasData } = await fetchApprovalData()

  return (
    <AppLayout brand="versotech">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-foreground">Approval Queue</h1>
          <p className="text-lg text-muted-foreground mt-1">
            Review and approve investor commitments and allocations
          </p>
        </div>

        {/* Client Component with Interactive Features */}
        <ApprovalsPageClient
          initialApprovals={approvals}
          initialStats={stats}
          initialCounts={counts}
        />
      </div>
    </AppLayout>
  )
}