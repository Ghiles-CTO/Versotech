import { NextResponse } from 'next/server'
import { createSmartClient } from '@/lib/supabase/smart-client'

async function getAuthenticatedStaff(supabase: any) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    return { user: null, error: error || new Error('Not authenticated'), role: null }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!(profile?.role?.startsWith('staff_') || profile?.role === 'ceo')) {
    return { user: null, error: new Error('Staff access required'), role: null }
  }
  return { user, error: null, role: profile.role } as const
}

export async function GET(request: Request) {
  try {
    const supabase = await createSmartClient()
    const { user, error, role } = await getAuthenticatedStaff(supabase)

    if (error || !user || !role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch all requests for the period
    const { data: requests, error: fetchError } = await supabase
      .from('request_tickets')
      .select(`
        *,
        investor:investors!request_tickets_investor_id_fkey (id, legal_name),
        assigned_to_profile:profiles!request_tickets_assigned_to_fkey (id, display_name)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('[RequestStats] Error fetching requests:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Calculate analytics
    const totalRequests = requests?.length || 0
    
    // Group by status
    const byStatus: Record<string, number> = {}
    // Group by priority
    const byPriority: Record<string, number> = {}
    // Group by category
    const byCategory: Record<string, number> = {}
    // Group by assignee
    const byAssignee: Record<string, { name: string; count: number }> = {}
    // Top requesters (investors)
    const topRequesters: Record<string, { name: string; count: number }> = {}
    // Requests over time (by day)
    const requestsByDay: Record<string, number> = {}

    requests?.forEach((req: any) => {
      // By status
      byStatus[req.status] = (byStatus[req.status] || 0) + 1

      // By priority
      byPriority[req.priority] = (byPriority[req.priority] || 0) + 1

      // By category
      byCategory[req.category] = (byCategory[req.category] || 0) + 1

      // By assignee
      if (req.assigned_to && req.assigned_to_profile) {
        const assigneeId = req.assigned_to
        if (!byAssignee[assigneeId]) {
          byAssignee[assigneeId] = {
            name: req.assigned_to_profile.display_name || 'Unknown',
            count: 0,
          }
        }
        byAssignee[assigneeId].count++
      }

      // Top requesters
      if (req.investor) {
        const investorId = req.investor.id
        if (!topRequesters[investorId]) {
          topRequesters[investorId] = {
            name: req.investor.legal_name || 'Unknown',
            count: 0,
          }
        }
        topRequesters[investorId].count++
      }

      // Requests by day
      const date = new Date(req.created_at).toISOString().split('T')[0]
      requestsByDay[date] = (requestsByDay[date] || 0) + 1
    })

    // Convert to arrays and sort
    const statusData = Object.entries(byStatus).map(([status, count]) => ({ status, count }))
    const priorityData = Object.entries(byPriority).map(([priority, count]) => ({ priority, count }))
    const categoryData = Object.entries(byCategory).map(([category, count]) => ({ category, count }))
    const assigneeData = Object.values(byAssignee).sort((a, b) => b.count - a.count)
    const topRequestersData = Object.values(topRequesters)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    const timeSeriesData = Object.entries(requestsByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate completion stats
    const closedRequests = requests?.filter((r: any) => r.status === 'closed') || []
    const avgCompletionTime = closedRequests.length > 0
      ? closedRequests.reduce((sum: number, req: any) => {
          if (req.closed_at && req.created_at) {
            const diff = new Date(req.closed_at).getTime() - new Date(req.created_at).getTime()
            return sum + diff / (1000 * 60 * 60) // hours
          }
          return sum
        }, 0) / closedRequests.length
      : null

    // Calculate overdue count
    const now = new Date()
    const overdueCount = requests?.filter((r: any) => {
      if (r.status === 'closed' || r.status === 'cancelled') return false
      if (!r.due_date) return false
      return new Date(r.due_date) < now
    }).length || 0

    return NextResponse.json({
      summary: {
        total: totalRequests,
        closed: byStatus['closed'] || 0,
        open: byStatus['open'] || 0,
        in_progress: byStatus['in_progress'] || 0,
        overdue: overdueCount,
        avg_completion_hours: avgCompletionTime ? Math.round(avgCompletionTime * 10) / 10 : null,
      },
      byStatus: statusData,
      byPriority: priorityData,
      byCategory: categoryData,
      byAssignee: assigneeData,
      topRequesters: topRequestersData,
      timeSeries: timeSeriesData,
    })
  } catch (err) {
    console.error('[RequestStats] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}


