import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { addCurrencyAmount, normalizeCurrencyCode } from '@/lib/currency-totals'

type GroupBy = 'signup_week' | 'signup_month' | 'first_investment_month'

interface Profile {
  id: string
  created_at: string
  display_name: string | null
}

interface InvestorUser {
  user_id: string
  investor_id: string
}

interface Subscription {
  investor_id: string
  commitment: number | null
  currency: string | null
  created_at: string
}

interface ActivityLog {
  actor_id: string
  created_at: string
}

interface Cohort {
  cohortName: string
  size: number
  activationRate: number
  investmentRate: number
  avgInvestment: number
  avgInvestmentByCurrency: Record<string, number>
  avgTimeToFirstInvestment: number | null
  retention30d: number
  retention60d: number
  retention90d: number
}

export async function GET(request: NextRequest) {
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

    // Parse groupBy parameter
    const { searchParams } = new URL(request.url)
    const groupByParam = searchParams.get('groupBy') || 'signup_month'
    const groupBy: GroupBy = ['signup_week', 'signup_month', 'first_investment_month'].includes(groupByParam)
      ? (groupByParam as GroupBy)
      : 'signup_month'

    // ===== Fetch all necessary data =====

    // 1. Fetch all profiles (non-deleted)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, created_at, display_name')
      .is('deleted_at', null)
      .order('created_at', { ascending: true }) as { data: Profile[] | null }

    const allProfiles = profiles || []

    // 2. Fetch investor_users to map users to investors
    const { data: investorUsers } = await supabase
      .from('investor_users')
      .select('user_id, investor_id') as { data: InvestorUser[] | null }

    const userToInvestors: Record<string, string[]> = {}
    investorUsers?.forEach((iu) => {
      if (!userToInvestors[iu.user_id]) {
        userToInvestors[iu.user_id] = []
      }
      userToInvestors[iu.user_id].push(iu.investor_id)
    })

    // 3. Fetch all subscriptions for investment data
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('investor_id, commitment, currency, created_at')
      .order('created_at', { ascending: true }) as { data: Subscription[] | null }

    // Map investor to their first subscription and total investment
    const investorFirstSubscription: Record<string, Date> = {}
    const investorTotalInvestment: Record<string, number> = {}
    const investorTotalInvestmentByCurrency: Record<string, Record<string, number>> = {}

    subscriptions?.forEach((sub) => {
      const subDate = new Date(sub.created_at)

      // Track first subscription date
      if (!investorFirstSubscription[sub.investor_id] || subDate < investorFirstSubscription[sub.investor_id]) {
        investorFirstSubscription[sub.investor_id] = subDate
      }

      // Sum up total investment
      const amount = Number(sub.commitment) || 0
      investorTotalInvestment[sub.investor_id] = (investorTotalInvestment[sub.investor_id] || 0) + amount
      if (!investorTotalInvestmentByCurrency[sub.investor_id]) {
        investorTotalInvestmentByCurrency[sub.investor_id] = {}
      }
      addCurrencyAmount(
        investorTotalInvestmentByCurrency[sub.investor_id],
        amount,
        normalizeCurrencyCode(sub.currency)
      )
    })

    // 4. Fetch audit logs for retention calculations (last 120 days)
    const now = new Date()
    const day120Ago = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)

    const { data: activityLogs } = await supabase
      .from('audit_logs')
      .select('actor_id, created_at')
      .gte('created_at', day120Ago.toISOString())
      .not('actor_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(500000) as { data: ActivityLog[] | null }

    // Build user activity dates map
    const userLastActivityDate: Record<string, Date> = {}
    activityLogs?.forEach((log) => {
      const logDate = new Date(log.created_at)
      if (!userLastActivityDate[log.actor_id] || logDate > userLastActivityDate[log.actor_id]) {
        userLastActivityDate[log.actor_id] = logDate
      }
    })

    // ===== Group users into cohorts =====
    const cohortGroups: Record<string, Profile[]> = {}

    if (groupBy === 'signup_week' || groupBy === 'signup_month') {
      // Group by signup date
      allProfiles.forEach((profile) => {
        const signupDate = new Date(profile.created_at)
        const cohortKey = groupBy === 'signup_week'
          ? getWeekKey(signupDate)
          : getMonthKey(signupDate)

        if (!cohortGroups[cohortKey]) {
          cohortGroups[cohortKey] = []
        }
        cohortGroups[cohortKey].push(profile)
      })
    } else {
      // Group by first investment month
      // First, map users to their first investment date
      allProfiles.forEach((profile) => {
        const investorIds = userToInvestors[profile.id] || []

        // Find earliest investment date for this user
        let earliestInvestmentDate: Date | null = null
        investorIds.forEach((investorId) => {
          const firstSub = investorFirstSubscription[investorId]
          if (firstSub && (!earliestInvestmentDate || firstSub < earliestInvestmentDate)) {
            earliestInvestmentDate = firstSub
          }
        })

        if (earliestInvestmentDate) {
          const cohortKey = getMonthKey(earliestInvestmentDate)
          if (!cohortGroups[cohortKey]) {
            cohortGroups[cohortKey] = []
          }
          cohortGroups[cohortKey].push(profile)
        }
      })
    }

    // ===== Calculate metrics for each cohort =====
    const cohorts: Cohort[] = []

    // Sort cohort keys chronologically
    const sortedCohortKeys = Object.keys(cohortGroups).sort()

    for (const cohortKey of sortedCohortKeys) {
      const cohortUsers = cohortGroups[cohortKey]
      const size = cohortUsers.length

      if (size === 0) continue

      // 1. Activation Rate: users with display_name filled
      const activatedCount = cohortUsers.filter(
        (u) => u.display_name && u.display_name.trim() !== ''
      ).length
      const activationRate = Math.round((activatedCount / size) * 100 * 10) / 10

      // 2. Investment Rate: users who have made any subscription
      let investorsCount = 0
      let totalInvestment = 0
      const totalInvestmentByCurrency: Record<string, number> = {}
      let totalTimeToFirstInvestment = 0
      let usersWithInvestment = 0

      cohortUsers.forEach((profile) => {
        const investorIds = userToInvestors[profile.id] || []
        const hasInvestment = investorIds.some((id) => investorFirstSubscription[id])

        if (hasInvestment) {
          investorsCount++

          // Calculate total investment for this user
          investorIds.forEach((investorId) => {
            totalInvestment += investorTotalInvestment[investorId] || 0
            const byCurrency = investorTotalInvestmentByCurrency[investorId] || {}
            Object.entries(byCurrency).forEach(([currency, amount]) => {
              totalInvestmentByCurrency[currency] =
                (totalInvestmentByCurrency[currency] || 0) + (Number(amount) || 0)
            })
          })

          // Calculate time to first investment
          const signupDate = new Date(profile.created_at)
          const earliestInvestment = investorIds.reduce<Date | null>((earliest, investorId) => {
            const firstSub = investorFirstSubscription[investorId]
            if (firstSub && (!earliest || firstSub < earliest)) {
              return firstSub
            }
            return earliest
          }, null)

          if (earliestInvestment !== null) {
            const daysToInvest = Math.floor(
              (earliestInvestment.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            totalTimeToFirstInvestment += Math.max(0, daysToInvest) // Ensure non-negative
            usersWithInvestment++
          }
        }
      })

      const investmentRate = Math.round((investorsCount / size) * 100 * 10) / 10
      const avgInvestment = investorsCount > 0
        ? Math.round(totalInvestment / investorsCount)
        : 0
      const avgInvestmentByCurrency =
        investorsCount > 0
          ? Object.fromEntries(
              Object.entries(totalInvestmentByCurrency).map(([currency, amount]) => [
                currency,
                Math.round((Number(amount) || 0) / investorsCount),
              ])
            )
          : {}
      const avgTimeToFirstInvestment = usersWithInvestment > 0
        ? Math.round(totalTimeToFirstInvestment / usersWithInvestment)
        : null

      // 3. Retention rates: check activity at 30, 60, 90 days after cohort start
      const cohortStartDate = getCohortStartDate(cohortKey, groupBy)

      const day30 = new Date(cohortStartDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      const day60 = new Date(cohortStartDate.getTime() + 60 * 24 * 60 * 60 * 1000)
      const day90 = new Date(cohortStartDate.getTime() + 90 * 24 * 60 * 60 * 1000)

      // Count users still active at each retention checkpoint
      // Active = had activity within 7 days of the checkpoint
      const activeAt30 = cohortUsers.filter((u) => {
        const lastActivity = userLastActivityDate[u.id]
        if (!lastActivity) return false
        const windowStart = new Date(day30.getTime() - 7 * 24 * 60 * 60 * 1000)
        return lastActivity >= windowStart && lastActivity <= day30
      }).length

      const activeAt60 = cohortUsers.filter((u) => {
        const lastActivity = userLastActivityDate[u.id]
        if (!lastActivity) return false
        const windowStart = new Date(day60.getTime() - 7 * 24 * 60 * 60 * 1000)
        return lastActivity >= windowStart && lastActivity <= day60
      }).length

      const activeAt90 = cohortUsers.filter((u) => {
        const lastActivity = userLastActivityDate[u.id]
        if (!lastActivity) return false
        const windowStart = new Date(day90.getTime() - 7 * 24 * 60 * 60 * 1000)
        return lastActivity >= windowStart && lastActivity <= day90
      }).length

      // Only calculate retention if enough time has passed
      const retention30d = day30 <= now
        ? Math.round((activeAt30 / size) * 100 * 10) / 10
        : -1 // -1 indicates not enough time has passed
      const retention60d = day60 <= now
        ? Math.round((activeAt60 / size) * 100 * 10) / 10
        : -1
      const retention90d = day90 <= now
        ? Math.round((activeAt90 / size) * 100 * 10) / 10
        : -1

      cohorts.push({
        cohortName: formatCohortName(cohortKey, groupBy),
        size,
        activationRate,
        investmentRate,
        avgInvestment,
        avgInvestmentByCurrency,
        avgTimeToFirstInvestment,
        retention30d,
        retention60d,
        retention90d,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        groupBy,
        cohorts,
      },
    })
  } catch (error) {
    console.error('Cohorts metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cohort metrics' },
      { status: 500 }
    )
  }
}

// ===== Helper functions =====

/**
 * Get a sortable week key in format YYYY-WXX
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  const weekNumber = Math.ceil((dayOfYear + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

/**
 * Get a sortable month key in format YYYY-MM
 */
function getMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Parse cohort key back to start date
 */
function getCohortStartDate(cohortKey: string, groupBy: GroupBy): Date {
  if (groupBy === 'signup_week') {
    // Parse YYYY-WXX format
    const [yearStr, weekStr] = cohortKey.split('-W')
    const year = parseInt(yearStr)
    const week = parseInt(weekStr)
    const startOfYear = new Date(year, 0, 1)
    const daysOffset = (week - 1) * 7
    return new Date(startOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000)
  } else {
    // Parse YYYY-MM format
    const [yearStr, monthStr] = cohortKey.split('-')
    return new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
  }
}

/**
 * Format cohort key for human-readable display
 */
function formatCohortName(cohortKey: string, groupBy: GroupBy): string {
  if (groupBy === 'signup_week') {
    // Convert YYYY-WXX to "Week of MMM D, YYYY"
    const startDate = getCohortStartDate(cohortKey, groupBy)
    const month = startDate.toLocaleString('en-US', { month: 'short' })
    const day = startDate.getDate()
    const year = startDate.getFullYear()
    return `Week of ${month} ${day}, ${year}`
  } else {
    // Convert YYYY-MM to "MMM YYYY"
    const [yearStr, monthStr] = cohortKey.split('-')
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
  }
}
