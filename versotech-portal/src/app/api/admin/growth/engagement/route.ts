import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

interface ActivityLog {
  actor_id: string
  action: string
  created_at: string
}

interface Profile {
  id: string
  display_name: string | null
  email: string
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    // Validate days: must be 7, 30, or 90 (default 30)
    const validDays = [7, 30, 90]
    const days = validDays.includes(Number(daysParam)) ? Number(daysParam) : 30

    const supabase = createServiceClient()

    // Check if user is super admin
    const { data: permission } = await supabase
      .from('staff_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .eq('permission', 'super_admin')
      .single()

    if (!permission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date boundary
    const now = new Date()
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all audit logs for the specified period
    const { data: activityLogs } = await supabase
      .from('audit_logs')
      .select('actor_id, action, created_at')
      .gte('created_at', daysAgo)
      .not('actor_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(200000) as { data: ActivityLog[] | null }

    const logs = activityLogs || []

    // ===== 1. Actions by Type (top 10 actions with counts) =====
    const actionCounts: Record<string, number> = {}
    logs.forEach((log) => {
      const action = log.action || 'unknown'
      actionCounts[action] = (actionCounts[action] || 0) + 1
    })

    const actionsByType = Object.entries(actionCounts)
      .map(([action, count]) => ({
        action: formatActionName(action),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // ===== 2. Engagement by Day of Week (0=Sunday to 6=Saturday) =====
    const dayOfWeekCounts: Record<number, number> = {}
    // Initialize all days
    for (let i = 0; i < 7; i++) {
      dayOfWeekCounts[i] = 0
    }

    logs.forEach((log) => {
      const date = new Date(log.created_at)
      const dayOfWeek = date.getDay() // 0=Sunday, 6=Saturday
      dayOfWeekCounts[dayOfWeek]++
    })

    const engagementByDay = Object.entries(dayOfWeekCounts).map(([day, count]) => ({
      day: Number(day),
      dayName: DAY_NAMES[Number(day)],
      count,
    }))

    // ===== 3. Peak Hours (0-23) =====
    const hourCounts: Record<number, number> = {}
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0
    }

    logs.forEach((log) => {
      const date = new Date(log.created_at)
      const hour = date.getHours()
      hourCounts[hour]++
    })

    const peakHours = Object.entries(hourCounts).map(([hour, count]) => ({
      hour: Number(hour),
      count,
    }))

    // ===== 4. Top Engaged Users =====
    // Count actions and sessions per user
    const userActivity: Record<string, { actions: number; sessionDates: Set<string> }> = {}

    logs.forEach((log) => {
      const userId = log.actor_id
      const dateKey = log.created_at.split('T')[0]

      if (!userActivity[userId]) {
        userActivity[userId] = { actions: 0, sessionDates: new Set() }
      }
      userActivity[userId].actions++
      userActivity[userId].sessionDates.add(dateKey)
    })

    // Get top 10 users by action count
    const topUserIds = Object.entries(userActivity)
      .sort(([, a], [, b]) => b.actions - a.actions)
      .slice(0, 10)
      .map(([id]) => id)

    // Fetch user profiles for the top users
    let userProfiles: Record<string, Profile> = {}
    if (topUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', topUserIds)

      if (profiles) {
        profiles.forEach((profile: Profile) => {
          userProfiles[profile.id] = profile
        })
      }
    }

    const topEngagedUsers = topUserIds.map((id) => {
      const activity = userActivity[id]
      const profile = userProfiles[id]
      return {
        id,
        name: profile?.display_name || profile?.email || 'Unknown User',
        actions: activity.actions,
        sessions: activity.sessionDates.size,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        actionsByType,
        engagementByDay,
        peakHours,
        topEngagedUsers,
      },
    })
  } catch (error) {
    console.error('Engagement metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement metrics' },
      { status: 500 }
    )
  }
}

// Helper function to format action names into readable names
function formatActionName(action: string): string {
  const mappings: Record<string, string> = {
    'LOGIN': 'Login',
    'LOGOUT': 'Logout',
    'VIEW': 'Page View',
    'CREATE': 'Create',
    'UPDATE': 'Update',
    'DELETE': 'Delete',
    'DOWNLOAD': 'Download',
    'UPLOAD': 'Upload',
    'APPROVE': 'Approve',
    'REJECT': 'Reject',
    'SUBMIT': 'Submit',
    'KYC_APPROVE': 'KYC Approval',
    'KYC_REJECT': 'KYC Rejection',
    'SUBSCRIPTION_CREATE': 'Subscription Created',
    'SUBSCRIPTION_UPDATE': 'Subscription Updated',
    'DEAL_CREATE': 'Deal Created',
    'DEAL_UPDATE': 'Deal Updated',
    'DOCUMENT_UPLOAD': 'Document Upload',
    'DOCUMENT_DOWNLOAD': 'Document Download',
  }

  if (mappings[action]) {
    return mappings[action]
  }

  // Convert SNAKE_CASE to Title Case
  return action
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
