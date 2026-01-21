import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

interface ActivityLog {
  actor_id: string
  created_at: string
}

interface Profile {
  id: string
  display_name: string | null
  email: string
  created_at: string
}

interface InvestorUser {
  user_id: string
  investor_id: string
}

interface Subscription {
  investor_id: string
  commitment: number | null
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const day7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const day90Ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const day120Ago = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)

    // Fetch audit logs for the last 120 days (to calculate 90-day retention properly)
    const { data: activityLogs } = await supabase
      .from('audit_logs')
      .select('actor_id, created_at')
      .gte('created_at', day120Ago.toISOString())
      .not('actor_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(500000) as { data: ActivityLog[] | null }

    const logs = activityLogs || []

    // ===== 1. Calculate Retention Rates =====
    // Retention = users who were active in period X AND are still active in period Y

    // Group logs by user and get their activity dates
    const userActivityDates: Record<string, Date[]> = {}
    logs.forEach((log) => {
      if (!userActivityDates[log.actor_id]) {
        userActivityDates[log.actor_id] = []
      }
      userActivityDates[log.actor_id].push(new Date(log.created_at))
    })

    // For each user, determine their first and last activity in the period
    const userFirstLastActivity: Record<string, { first: Date; last: Date }> = {}
    Object.entries(userActivityDates).forEach(([userId, dates]) => {
      const sorted = dates.sort((a, b) => a.getTime() - b.getTime())
      userFirstLastActivity[userId] = {
        first: sorted[0],
        last: sorted[sorted.length - 1],
      }
    })

    // Calculate retention for each period
    // Retention = (users active both in period start AND recent 7 days) / (users active in period start)
    const recentUsers = new Set(
      Object.entries(userFirstLastActivity)
        .filter(([, activity]) => activity.last >= day7Ago)
        .map(([userId]) => userId)
    )

    // 7-day retention: users active 7-14 days ago who are still active in last 7 days
    const day14Ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const usersActive7to14DaysAgo = Object.entries(userFirstLastActivity).filter(
      ([, activity]) => activity.last >= day14Ago && activity.last < day7Ago
    )
    const retained7Day = usersActive7to14DaysAgo.filter(([userId]) =>
      recentUsers.has(userId)
    ).length
    const day7Retention =
      usersActive7to14DaysAgo.length > 0
        ? Math.round((retained7Day / usersActive7to14DaysAgo.length) * 100 * 10) / 10
        : 0

    // 30-day retention: users active 30-60 days ago who are still active
    const day60Ago = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const usersActive30to60DaysAgo = Object.entries(userFirstLastActivity).filter(
      ([, activity]) => activity.last >= day60Ago && activity.last < day30Ago
    )
    const retained30Day = usersActive30to60DaysAgo.filter(([userId]) =>
      recentUsers.has(userId)
    ).length
    const day30Retention =
      usersActive30to60DaysAgo.length > 0
        ? Math.round((retained30Day / usersActive30to60DaysAgo.length) * 100 * 10) / 10
        : 0

    // 90-day retention: users active 90-120 days ago who are still active
    const usersActive90to120DaysAgo = Object.entries(userFirstLastActivity).filter(
      ([, activity]) => activity.last >= day120Ago && activity.last < day90Ago
    )
    const retained90Day = usersActive90to120DaysAgo.filter(([userId]) =>
      recentUsers.has(userId)
    ).length
    const day90Retention =
      usersActive90to120DaysAgo.length > 0
        ? Math.round((retained90Day / usersActive90to120DaysAgo.length) * 100 * 10) / 10
        : 0

    const retentionRates = {
      day7: day7Retention,
      day30: day30Retention,
      day90: day90Retention,
    }

    // ===== 2. Calculate Churn Rate =====
    // Churn = users who haven't been active in 30+ days / total users who were active in last 90 days
    const totalActiveUsers90Days = Object.keys(userFirstLastActivity).length
    const churnedUsers = Object.entries(userFirstLastActivity).filter(
      ([, activity]) => activity.last < day30Ago
    ).length
    const churnRate =
      totalActiveUsers90Days > 0
        ? Math.round((churnedUsers / totalActiveUsers90Days) * 100 * 10) / 10
        : 0

    // ===== 3. Build Cohort Matrix =====
    // Get all users with their signup dates
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, email, created_at')
      .not('deleted_at', 'is', null)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }) as { data: Profile[] | null }

    const allProfiles = profiles || []

    // Group users by signup week (last 5 weeks for a 5-week cohort matrix)
    const cohortMatrix: Array<{
      cohort_week: string
      week_0: number
      week_1: number
      week_2: number
      week_3: number
      week_4: number
    }> = []

    // Calculate cohorts for the last 5 weeks
    for (let weekOffset = 4; weekOffset >= 0; weekOffset--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (weekOffset + 1) * 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      // Find users who signed up in this week
      const cohortUsers = allProfiles.filter((profile) => {
        const signupDate = new Date(profile.created_at)
        return signupDate >= weekStart && signupDate < weekEnd
      })

      if (cohortUsers.length === 0) {
        // No users in this cohort, add empty row
        cohortMatrix.push({
          cohort_week: formatWeekLabel(weekStart),
          week_0: 0,
          week_1: 0,
          week_2: 0,
          week_3: 0,
          week_4: 0,
        })
        continue
      }

      const cohortUserIds = new Set(cohortUsers.map((u) => u.id))

      // Calculate retention for each subsequent week
      const weekRetention: number[] = []

      for (let w = 0; w <= 4; w++) {
        // Can only calculate if enough time has passed
        if (weekOffset - w < 0) {
          weekRetention.push(0)
          continue
        }

        const checkWeekStart = new Date(weekStart)
        checkWeekStart.setDate(checkWeekStart.getDate() + w * 7)
        const checkWeekEnd = new Date(checkWeekStart)
        checkWeekEnd.setDate(checkWeekEnd.getDate() + 7)

        // Count users from cohort who were active during this week
        const activeInWeek = Object.entries(userActivityDates).filter(
          ([userId, dates]) => {
            if (!cohortUserIds.has(userId)) return false
            return dates.some(
              (d) => d >= checkWeekStart && d < checkWeekEnd
            )
          }
        ).length

        const retentionPct =
          cohortUsers.length > 0
            ? Math.round((activeInWeek / cohortUsers.length) * 100)
            : 0
        weekRetention.push(retentionPct)
      }

      cohortMatrix.push({
        cohort_week: formatWeekLabel(weekStart),
        week_0: weekRetention[0],
        week_1: weekRetention[1],
        week_2: weekRetention[2],
        week_3: weekRetention[3],
        week_4: weekRetention[4],
      })
    }

    // ===== 4. Find At-Risk Users =====
    // Users with no audit_log entry in 30+ days
    const atRiskUserIds = Object.entries(userFirstLastActivity)
      .filter(([, activity]) => activity.last < day30Ago)
      .map(([userId]) => userId)
      .slice(0, 50) // Limit to 50 users for performance

    // Fetch profile details for at-risk users
    let atRiskProfiles: Record<string, Profile> = {}
    if (atRiskUserIds.length > 0) {
      const { data: riskProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, email, created_at')
        .in('id', atRiskUserIds)
        .is('deleted_at', null)

      if (riskProfiles) {
        riskProfiles.forEach((profile: Profile) => {
          atRiskProfiles[profile.id] = profile
        })
      }
    }

    // Get investor relationships for at-risk users
    let userInvestorMap: Record<string, string[]> = {}
    if (atRiskUserIds.length > 0) {
      const { data: investorUsers } = await supabase
        .from('investor_users')
        .select('user_id, investor_id')
        .in('user_id', atRiskUserIds) as { data: InvestorUser[] | null }

      if (investorUsers) {
        investorUsers.forEach((iu) => {
          if (!userInvestorMap[iu.user_id]) {
            userInvestorMap[iu.user_id] = []
          }
          userInvestorMap[iu.user_id].push(iu.investor_id)
        })
      }
    }

    // Get total investments per investor
    const allInvestorIds = [...new Set(Object.values(userInvestorMap).flat())]
    let investorTotals: Record<string, number> = {}
    if (allInvestorIds.length > 0) {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('investor_id, commitment')
        .in('investor_id', allInvestorIds)
        .in('status', ['active', 'funded', 'completed']) as { data: Subscription[] | null }

      if (subscriptions) {
        subscriptions.forEach((sub) => {
          const amount = Number(sub.commitment) || 0
          investorTotals[sub.investor_id] =
            (investorTotals[sub.investor_id] || 0) + amount
        })
      }
    }

    // Build at-risk users array
    const atRiskUsers = atRiskUserIds
      .filter((userId) => atRiskProfiles[userId]) // Only include users we found profiles for
      .map((userId) => {
        const profile = atRiskProfiles[userId]
        const activity = userFirstLastActivity[userId]
        const investorIds = userInvestorMap[userId] || []
        const totalInvested = investorIds.reduce(
          (sum, invId) => sum + (investorTotals[invId] || 0),
          0
        )

        return {
          id: userId,
          name: profile.display_name || profile.email || 'Unknown',
          email: profile.email,
          lastActive: activity.last.toISOString(),
          totalInvested,
        }
      })
      .sort((a, b) => b.totalInvested - a.totalInvested) // Sort by investment amount descending

    return NextResponse.json({
      success: true,
      data: {
        retentionRates,
        churnRate,
        cohortMatrix,
        atRiskUsers,
      },
    })
  } catch (error) {
    console.error('Retention metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch retention metrics' },
      { status: 500 }
    )
  }
}

// Helper function to format week label
function formatWeekLabel(weekStart: Date): string {
  const month = weekStart.toLocaleString('en-US', { month: 'short' })
  const day = weekStart.getDate()
  return `${month} ${day}`
}
