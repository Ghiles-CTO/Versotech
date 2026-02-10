import { ApprovalsPageClient } from '@/components/approvals/approvals-page-client'
import { Approval, ApprovalStats } from '@/types/approvals'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { AlertCircle } from 'lucide-react'
import { checkStaffAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Approvals Page for Unified Portal (versotech_main)
 *
 * Persona-aware approval management:
 * - Staff/CEO personas: Full access to approval queue
 * - Other personas: Access denied
 */
export default async function ApprovalsPage() {
  const clientSupabase = await createClient()
  const { data: { user }, error: userError } = await clientSupabase.auth.getUser()

  if (!user || userError) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to view approvals.
          </p>
        </div>
      </div>
    )
  }

  // Check if user has staff/CEO persona for full access
  const hasStaffAccess = await checkStaffAccess(user.id)
  const serviceSupabase = createServiceClient()

  if (!hasStaffAccess) {
    return (
      <div>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            Approval management is only available to staff members.
          </p>
        </div>
      </div>
    )
  }

  // Fetch approval data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: approvals, error: approvalsError } = await serviceSupabase
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
    .or(`status.eq.pending,and(status.in.(approved,rejected),resolved_at.gte.${thirtyDaysAgo.toISOString()})`)
    .order('sla_breach_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (approvalsError) {
    console.error('[Approvals] Error fetching approvals:', approvalsError)
  }

  // Get statistics
  const { data: statsData } = await serviceSupabase
    .rpc('get_approval_stats', { p_staff_id: null })
    .single()

  const stats: ApprovalStats = (statsData || {
    total_pending: approvals?.length || 0,
    overdue_count: 0,
    avg_processing_time_hours: 0,
    approval_rate_24h: 0,
    total_approved_30d: 0,
    total_rejected_30d: 0,
    total_awaiting_info: 0
  }) as ApprovalStats

  const counts = {
    pending: stats.total_pending,
    approved: stats.total_approved_30d,
    rejected: stats.total_rejected_30d
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">Approval Queue</h1>
        <p className="text-lg text-muted-foreground mt-1">
          Review and approve investor commitments and allocations
        </p>
      </div>

      {/* Client Component with Interactive Features */}
      <ApprovalsPageClient
        initialApprovals={(approvals || []) as Approval[]}
        initialStats={stats}
        initialCounts={counts}
      />
    </div>
  )
}
