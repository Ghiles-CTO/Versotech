'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  UserPlus,
  Users,
  DollarSign,
  FileSignature,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  PenLine,
  BarChart3,
  Target,
  Wallet,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/format'
import { useTheme } from '@/components/theme-provider'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

type Persona = {
  persona_type: string
  entity_id: string
  entity_name: string
  role_in_entity?: string | null
  can_sign?: boolean
  logo_url?: string | null
}

type JourneyStage = 'interested' | 'approved' | 'signed' | 'funded' | 'passed'

function getStageFromIntroduction(status: string | null): JourneyStage {
  switch (status) {
    case 'allocated':
      return 'signed'
    case 'joined':
      return 'approved'
    case 'lost':
    case 'inactive':
      return 'passed'
    case 'invited':
    default:
      return 'interested'
  }
}

function resolveJourneyStage(status: string | null, hasCommission: boolean): JourneyStage {
  const base = getStageFromIntroduction(status)
  if (status === 'allocated' && hasCommission) {
    return 'funded'
  }
  return base
}

interface IntroducerDashboardProps {
  introducerId: string
  userId: string
  persona: Persona
}

type IntroducerMetrics = {
  totalIntroductions: number
  interestedIntroductions: number
  approvedIntroductions: number
  signedIntroductions: number
  fundedIntroductions: number
  passedIntroductions: number
  totalCommissionEarned: number
  pendingCommission: number
  conversionRate: number
}

type PerformanceMetrics = {
  thisMonthIntroductions: number
  lastMonthIntroductions: number
  introductionGrowth: number
  avgCommissionPerIntro: number
}

type Agreement = {
  id: string
  status: string
  default_commission_bps: number | null
  effective_date: string | null
  expiry_date: string | null
  signed_date: string | null
}

type RecentIntroduction = {
  id: string
  prospect_email: string
  status: string
  introduced_at: string
  deal: {
    id: string
    name: string
  } | null
}

export function IntroducerDashboard({ introducerId, userId, persona }: IntroducerDashboardProps) {
  const { theme } = useTheme()
  // Theme system uses 'staff-dark' for dark mode across all personas
  const isDark = theme === 'staff-dark'

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<IntroducerMetrics | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [activeAgreement, setActiveAgreement] = useState<Agreement | null>(null)
  const [pendingAgreement, setPendingAgreement] = useState<Agreement | null>(null)
  const [recentIntroductions, setRecentIntroductions] = useState<RecentIntroduction[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // Fetch introductions for metrics
        const { data: introductions } = await supabase
          .from('introductions')
          .select('id, status, prospect_email, introduced_at, deal:deal_id(id, name)')
          .eq('introducer_id', introducerId)
          .order('introduced_at', { ascending: false })

        const allIntros = introductions || []

        // Apply date range filter
        const intros = allIntros.filter(i => {
          if (!dateRange?.from) return true
          if (!i.introduced_at) return false

          const introDate = new Date(i.introduced_at)
          const fromDate = new Date(dateRange.from)
          fromDate.setHours(0, 0, 0, 0)

          if (introDate < fromDate) return false

          if (dateRange.to) {
            const toDate = new Date(dateRange.to)
            toDate.setHours(23, 59, 59, 999)
            if (introDate > toDate) return false
          }

          return true
        })

        // Fetch commissions (using created_at as the date column)
        const { data: commissions } = await supabase
          .from('introducer_commissions')
          .select('id, accrual_amount, status, created_at, introduction_id')
          .eq('introducer_id', introducerId)

        const allComms = commissions || []

        // Apply date range filter to commissions
        const comms = allComms.filter(c => {
          if (!dateRange?.from) return true
          if (!c.created_at) return false

          const commDate = new Date(c.created_at)
          const fromDate = new Date(dateRange.from)
          fromDate.setHours(0, 0, 0, 0)

          if (commDate < fromDate) return false

          if (dateRange.to) {
            const toDate = new Date(dateRange.to)
            toDate.setHours(23, 59, 59, 999)
            if (commDate > toDate) return false
          }

          return true
        })

        const fundedIntroIds = new Set(
          comms
            .filter(c => c.introduction_id)
            .map(c => c.introduction_id)
        )

        const stagedIntros = intros.map(i => ({
          ...i,
          journey_stage: resolveJourneyStage(i.status, fundedIntroIds.has(i.id))
        }))

        const interested = stagedIntros.filter(i => i.journey_stage === 'interested').length
        const approved = stagedIntros.filter(i => i.journey_stage === 'approved').length
        const signed = stagedIntros.filter(i => i.journey_stage === 'signed').length
        const funded = stagedIntros.filter(i => i.journey_stage === 'funded').length
        const passed = stagedIntros.filter(i => i.journey_stage === 'passed').length

        const totalEarned = comms
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + (c.accrual_amount || 0), 0)
        const pendingComm = comms
          .filter(c => ['accrued', 'invoice_requested', 'invoice_submitted', 'invoiced'].includes(c.status))
          .reduce((sum, c) => sum + (c.accrual_amount || 0), 0)

        setMetrics({
          totalIntroductions: intros.length,
          interestedIntroductions: interested,
          approvedIntroductions: approved,
          signedIntroductions: signed,
          fundedIntroductions: funded,
          passedIntroductions: passed,
          totalCommissionEarned: totalEarned,
          pendingCommission: pendingComm,
          conversionRate: intros.length > 0 ? (funded / intros.length) * 100 : 0,
        })

        // Calculate performance metrics based on date range or default to monthly comparison
        const now = new Date()
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        const thisMonthIntroductions = intros.filter(i =>
          i.introduced_at && new Date(i.introduced_at) >= startOfThisMonth
        ).length

        const lastMonthIntroductions = allIntros.filter(i =>
          i.introduced_at &&
          new Date(i.introduced_at) >= startOfLastMonth &&
          new Date(i.introduced_at) < startOfThisMonth
        ).length

        const introductionGrowth = lastMonthIntroductions > 0
          ? Math.round(((thisMonthIntroductions - lastMonthIntroductions) / lastMonthIntroductions) * 100)
          : thisMonthIntroductions > 0 ? 100 : 0

        const avgCommissionPerIntro = funded > 0
          ? Math.round(totalEarned / funded)
          : 0

        setPerformance({
          thisMonthIntroductions,
          lastMonthIntroductions,
          introductionGrowth,
          avgCommissionPerIntro
        })

        // Map introductions to match expected type (deal is single object, not array)
        const mappedIntros: RecentIntroduction[] = stagedIntros.slice(0, 5).map((intro: any) => ({
          id: intro.id,
          prospect_email: intro.prospect_email,
          status: intro.journey_stage,
          introduced_at: intro.introduced_at,
          deal: Array.isArray(intro.deal) ? intro.deal[0] || null : intro.deal,
        }))
        setRecentIntroductions(mappedIntros)

        // Fetch agreements (not affected by date filter)
        const { data: agreements } = await supabase
          .from('introducer_agreements')
          .select('id, status, default_commission_bps, effective_date, expiry_date, signed_date')
          .eq('introducer_id', introducerId)
          .order('created_at', { ascending: false })

        if (agreements) {
          const active = agreements.find(a => a.status === 'active')
          const pending = agreements.find(a =>
            ['pending_approval', 'pending_ceo_signature', 'pending_introducer_signature'].includes(a.status)
          )
          setActiveAgreement(active || null)
          setPendingAgreement(pending || null)
        }
      } catch (error) {
        console.error('Error fetching introducer data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [introducerId, dateRange])

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  const statusStyles: Record<string, string> = {
    interested: 'bg-blue-500/20 text-blue-400',
    approved: 'bg-purple-500/20 text-purple-400',
    signed: 'bg-amber-500/20 text-amber-400',
    funded: 'bg-green-500/20 text-green-400',
    passed: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Introducer Dashboard
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {persona.entity_name}
          </p>
        </div>
        {persona.logo_url && (
          <img
            src={persona.logo_url}
            alt={persona.entity_name}
            className="h-12 w-auto object-contain"
          />
        )}
      </div>

      {/* Alert for Pending Agreement */}
      {pendingAgreement && (
        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <PenLine className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {pendingAgreement.status === 'pending_approval'
                      ? 'Agreement Awaiting Your Approval'
                      : pendingAgreement.status === 'pending_ceo_signature' || pendingAgreement.status === 'approved'
                      ? 'Agreement Awaiting CEO Signature'
                      : 'Agreement Awaiting Your Signature'}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {pendingAgreement.status === 'pending_approval'
                      ? 'Please review and approve your fee agreement'
                      : pendingAgreement.status === 'pending_ceo_signature' || pendingAgreement.status === 'approved'
                      ? 'You have approved. Awaiting CEO signature.'
                      : 'CEO has signed. Please countersign to activate.'}
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/versotech_main/introducer-agreements/${pendingAgreement.id}`}>
                  {pendingAgreement.status === 'pending_approval' ? 'Review'
                    : pendingAgreement.status === 'pending_ceo_signature' || pendingAgreement.status === 'approved' ? 'View'
                    : 'Sign Now'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert for No Active Agreement */}
      {!activeAgreement && !pendingAgreement && (
        <Card className={`border-red-500/30 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No Active Agreement
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You need an active fee agreement to make introductions. Contact your relationship manager.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date Range Filter */}
      <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                Filter by Date Range:
              </p>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                variant={isDark ? 'dark' : 'default'}
              />
            </div>
            {dateRange?.from && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(undefined)}
                className={isDark ? 'text-gray-400 hover:text-white' : ''}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filter
              </Button>
            )}
          </div>
          {dateRange?.from && (
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {dateRange.to
                ? `Showing data from ${format(dateRange.from, 'MMM dd, yyyy')} to ${format(dateRange.to, 'MMM dd, yyyy')}`
                : `Showing data from ${format(dateRange.from, 'MMM dd, yyyy')} onwards`
              }
            </p>
          )}
          {!dateRange?.from && (
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Showing all-time data
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Introductions
            </CardTitle>
            <Users className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.totalIntroductions || 0}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {metrics?.interestedIntroductions || 0} interested
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Conversion Rate
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.conversionRate.toFixed(1) || 0}%
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {metrics?.fundedIntroductions || 0} funded
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Commission Earned
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-green-500`}>
              {formatCurrency(metrics?.totalCommissionEarned || 0)}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Total paid to date
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Pending Commission
            </CardTitle>
            <Clock className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-amber-500`}>
              {formatCurrency(metrics?.pendingCommission || 0)}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Accrued or awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      {performance && (
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <CardDescription>Your introduction performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30'}`}>
                <div className={`flex items-center gap-2 text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  {performance.introductionGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  This Month
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {performance.thisMonthIntroductions}
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
                  <span className={performance.introductionGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {performance.introductionGrowth >= 0 ? '+' : ''}{performance.introductionGrowth}%
                  </span>
                  {' '}vs last month ({performance.lastMonthIntroductions})
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30'}`}>
                <div className={`flex items-center gap-2 text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  <Target className="h-4 w-4" />
                  Conversion Rate
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metrics?.conversionRate.toFixed(1) || 0}%
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
                  {metrics?.fundedIntroductions || 0} of {metrics?.totalIntroductions || 0} funded
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-muted/30'}`}>
                <div className={`flex items-center gap-2 text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  <Wallet className="h-4 w-4" />
                  Avg Commission
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(performance.avgCommissionPerIntro)}
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
                  Per successful introduction
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Introductions */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Recent Introductions</CardTitle>
              <CardDescription>Your latest referrals</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech_main/introductions">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentIntroductions.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No introductions yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentIntroductions.map((intro) => (
                  <div
                    key={intro.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {intro.prospect_email}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {intro.deal?.name || 'Unknown Deal'}
                      </p>
                    </div>
                    <Badge className={statusStyles[intro.status] || 'bg-gray-500/20 text-gray-400'}>
                      {intro.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Agreement */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-white' : ''}>Fee Agreement</CardTitle>
            <CardDescription>Your current commission terms</CardDescription>
          </CardHeader>
          <CardContent>
            {activeAgreement ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Active Agreement
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Commission Rate</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activeAgreement.default_commission_bps
                        ? `${(activeAgreement.default_commission_bps / 100).toFixed(2)}%`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Effective Since</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activeAgreement.effective_date
                        ? formatDate(activeAgreement.effective_date)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Expires</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activeAgreement.expiry_date
                        ? formatDate(activeAgreement.expiry_date)
                        : 'No Expiry'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Signed</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activeAgreement.signed_date
                        ? formatDate(activeAgreement.signed_date)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/versotech_main/introducer-agreements/${activeAgreement.id}`}>
                    <FileSignature className="h-4 w-4 mr-2" />
                    View Agreement
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileSignature className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No active agreement
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Contact your relationship manager to set up an agreement
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
