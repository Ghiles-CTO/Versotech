'use client'

import { useEffect, useState } from 'react'
import { ApprovalsPageClient } from '@/components/approvals/approvals-page-client'
import { Approval, ApprovalStats } from '@/types/approvals'
import { AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ApprovalsContent() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [stats, setStats] = useState<ApprovalStats>({
    total_pending: 0,
    overdue_count: 0,
    avg_processing_time_hours: 0,
    approval_rate_24h: 0,
    total_approved_30d: 0,
    total_rejected_30d: 0,
    total_awaiting_info: 0
  })
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApprovals() {
      try {
        setLoading(true)
        const supabase = createClient()

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data, error: fetchError } = await supabase
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

        if (fetchError) throw fetchError

        setApprovals((data || []) as Approval[])

        // Calculate stats from data
        const pending = (data || []).filter((a: any) => a.status === 'pending').length
        const approved = (data || []).filter((a: any) => a.status === 'approved').length
        const rejected = (data || []).filter((a: any) => a.status === 'rejected').length

        setStats({
          total_pending: pending,
          overdue_count: 0,
          avg_processing_time_hours: 0,
          approval_rate_24h: 0,
          total_approved_30d: approved,
          total_rejected_30d: rejected,
          total_awaiting_info: 0
        })

        setCounts({ pending, approved, rejected })
        setError(null)
      } catch (err) {
        console.error('[ApprovalsContent] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load approvals')
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading approvals...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Approvals</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <ApprovalsPageClient
      initialApprovals={approvals}
      initialStats={stats}
      initialCounts={counts}
    />
  )
}
