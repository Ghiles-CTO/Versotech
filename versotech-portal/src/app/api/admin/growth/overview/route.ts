import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

interface ActivityLog {
  actor_id: string
  action: string
  entity_type: string | null
  created_at: string
}

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

    // Calculate date boundaries
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all audit logs for the specified period
    const { data: activityLogs } = await supabase
      .from('audit_logs')
      .select('actor_id, action, entity_type, created_at')
      .gte('created_at', daysAgo)
      .not('actor_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(200000) as { data: ActivityLog[] | null }

    const logs = activityLogs || []

    // Calculate DAU - unique users today
    const dauSet = new Set<string>()
    logs.forEach((log) => {
      if (log.created_at >= todayStart) {
        dauSet.add(log.actor_id)
      }
    })
    const dau = dauSet.size

    // Calculate WAU - unique users in last 7 days
    const wauSet = new Set<string>()
    logs.forEach((log) => {
      if (log.created_at >= day7) {
        wauSet.add(log.actor_id)
      }
    })
    const wau = wauSet.size

    // Calculate MAU - unique users in last 30 days
    const mauSet = new Set<string>()
    logs.forEach((log) => {
      if (log.created_at >= day30) {
        mauSet.add(log.actor_id)
      }
    })
    const mau = mauSet.size

    // Calculate stickiness (DAU/MAU * 100)
    const stickiness = mau > 0 ? Math.round((dau / mau) * 100 * 10) / 10 : 0

    // Calculate average session duration estimate
    // Group logs by user and date, then estimate session length from action timestamps
    const sessionsByUserDate: Record<string, number[]> = {}
    logs.forEach((log) => {
      const dateKey = log.created_at.split('T')[0]
      const key = `${log.actor_id}-${dateKey}`
      const timestamp = new Date(log.created_at).getTime()
      if (!sessionsByUserDate[key]) {
        sessionsByUserDate[key] = []
      }
      sessionsByUserDate[key].push(timestamp)
    })

    // Calculate session duration: difference between first and last action per user-day
    // Add a minimum of 1 minute per session to account for single-action sessions
    let totalDuration = 0
    let sessionCount = 0
    Object.values(sessionsByUserDate).forEach((timestamps) => {
      if (timestamps.length >= 1) {
        const sorted = timestamps.sort((a, b) => a - b)
        const duration = (sorted[sorted.length - 1] - sorted[0]) / 1000 / 60 // in minutes
        // Add minimum 1 minute for single-action sessions, cap at 120 minutes
        totalDuration += Math.min(Math.max(duration, 1), 120)
        sessionCount++
      }
    })
    const avgSessionDuration = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0

    // Calculate activeUsersTrend - daily active users for each day in the period
    const activeUsersByDate: Record<string, Set<string>> = {}

    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      activeUsersByDate[dateKey] = new Set()
    }

    // Populate with actual data
    logs.forEach((log) => {
      const dateKey = log.created_at.split('T')[0]
      if (activeUsersByDate[dateKey]) {
        activeUsersByDate[dateKey].add(log.actor_id)
      }
    })

    const activeUsersTrend = Object.entries(activeUsersByDate).map(([date, userSet]) => ({
      date,
      count: userSet.size,
    }))

    // Calculate featureUsage - count actions by entity_type (as a proxy for feature usage)
    const featureCounts: Record<string, number> = {}
    logs.forEach((log) => {
      // Use action as the primary feature identifier
      const feature = log.action || 'unknown'
      featureCounts[feature] = (featureCounts[feature] || 0) + 1
    })

    // Convert to array and get top features
    const featureUsage = Object.entries(featureCounts)
      .map(([feature, count]) => ({
        feature: formatFeatureName(feature),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 features

    // Calculate userSegments based on activity frequency
    const userActivityCounts: Record<string, number> = {}
    logs.forEach((log) => {
      userActivityCounts[log.actor_id] = (userActivityCounts[log.actor_id] || 0) + 1
    })

    // Segment users by activity level
    let powerUsers = 0 // 50+ actions
    let regularUsers = 0 // 10-49 actions
    let occasionalUsers = 0 // 2-9 actions
    let atRiskUsers = 0 // 1 action (at risk of churning)

    Object.values(userActivityCounts).forEach((count) => {
      if (count >= 50) {
        powerUsers++
      } else if (count >= 10) {
        regularUsers++
      } else if (count >= 2) {
        occasionalUsers++
      } else {
        atRiskUsers++
      }
    })

    const userSegments = [
      { segment: 'Power Users', count: powerUsers },
      { segment: 'Regular', count: regularUsers },
      { segment: 'Occasional', count: occasionalUsers },
      { segment: 'At Risk', count: atRiskUsers },
    ]

    return NextResponse.json({
      success: true,
      data: {
        dau,
        wau,
        mau,
        stickiness,
        avgSessionDuration,
        activeUsersTrend,
        featureUsage,
        userSegments,
      },
    })
  } catch (error) {
    console.error('Growth overview metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch growth overview metrics' },
      { status: 500 }
    )
  }
}

// Helper function to format action names into readable feature names
function formatFeatureName(action: string): string {
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
