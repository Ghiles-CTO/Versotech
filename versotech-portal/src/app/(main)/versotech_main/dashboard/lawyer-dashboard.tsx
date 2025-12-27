'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Scale,
  Briefcase,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/format'
import { useTheme } from '@/components/theme-provider'

type Persona = {
  persona_type: string
  entity_id: string
  entity_name: string
  role_in_entity?: string | null
  can_sign?: boolean
  logo_url?: string | null
}

interface LawyerDashboardProps {
  lawyerId: string
  userId: string
  persona: Persona
}

type LawyerMetrics = {
  assignedDeals: number
  pendingEscrowConfirmations: number
  pendingPaymentConfirmations: number
  signedSubscriptions: number
  fullyFundedSubscriptions: number
  totalCommitmentValue: number
  totalFundedValue: number
}

type RecentSubscription = {
  id: string
  deal_name: string
  investor_name: string
  commitment: number
  funded_amount: number
  currency: string
  status: string
  committed_at: string | null
}

type AssignedDeal = {
  id: string
  name: string
  status: string
  target_size: number | null
  currency: string
}

export function LawyerDashboard({ lawyerId, userId, persona }: LawyerDashboardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<LawyerMetrics | null>(null)
  const [lawyerInfo, setLawyerInfo] = useState<{
    firm_name: string
    display_name: string
    specializations: string[] | null
    is_active: boolean
  } | null>(null)
  const [recentSubscriptions, setRecentSubscriptions] = useState<RecentSubscription[]>([])
  const [assignedDeals, setAssignedDeals] = useState<AssignedDeal[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // Fetch lawyer info
        const { data: lawyer } = await supabase
          .from('lawyers')
          .select('id, firm_name, display_name, specializations, is_active, assigned_deals')
          .eq('id', lawyerId)
          .maybeSingle()

        if (lawyer) {
          setLawyerInfo({
            firm_name: lawyer.firm_name,
            display_name: lawyer.display_name,
            specializations: lawyer.specializations,
            is_active: lawyer.is_active,
          })
        }

        // Get deal assignments
        const { data: assignments } = await supabase
          .from('deal_lawyer_assignments')
          .select('deal_id')
          .eq('lawyer_id', lawyerId)

        let dealIds = (assignments || []).map((a: any) => a.deal_id)

        // Fallback to lawyers.assigned_deals if no assignments
        if (!dealIds.length && lawyer?.assigned_deals?.length) {
          dealIds = lawyer.assigned_deals
        }

        if (dealIds.length > 0) {
          // Fetch assigned deals
          const { data: deals } = await supabase
            .from('deals')
            .select('id, name, status, target_size, currency')
            .in('id', dealIds)
            .order('created_at', { ascending: false })
            .limit(5)

          if (deals) {
            setAssignedDeals(deals.map((d: any) => ({
              id: d.id,
              name: d.name,
              status: d.status,
              target_size: d.target_size,
              currency: d.currency || 'USD',
            })))
          }

          // Fetch subscriptions for these deals (signed/committed statuses)
          const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select(`
              id,
              deal_id,
              investor_id,
              status,
              commitment,
              funded_amount,
              currency,
              committed_at,
              deals (id, name),
              investors (id, display_name, legal_name)
            `)
            .in('deal_id', dealIds)
            .in('status', ['committed', 'partially_funded', 'active'])
            .order('committed_at', { ascending: false })

          const subs = subscriptions || []

          // Query fee events for pending payment confirmations
          const { data: feeEvents } = await supabase
            .from('fee_events')
            .select('id, status')
            .in('deal_id', dealIds)
            .in('status', ['accrued', 'invoiced'])

          const pendingFeePayments = (feeEvents || []).length

          // Calculate metrics
          const committed = subs.filter((s: any) => s.status === 'committed')
          const partiallyFunded = subs.filter((s: any) => s.status === 'partially_funded')
          const fullyFunded = subs.filter((s: any) => s.status === 'active')
          const totalCommitment = subs.reduce((sum: number, s: any) => sum + (s.commitment || 0), 0)
          const totalFunded = subs.reduce((sum: number, s: any) => sum + (s.funded_amount || 0), 0)

          setMetrics({
            assignedDeals: dealIds.length,
            pendingEscrowConfirmations: committed.length + partiallyFunded.length,
            pendingPaymentConfirmations: pendingFeePayments,
            signedSubscriptions: subs.length,
            fullyFundedSubscriptions: fullyFunded.length,
            totalCommitmentValue: totalCommitment,
            totalFundedValue: totalFunded,
          })

          // Map recent subscriptions
          const recentSubs: RecentSubscription[] = subs.slice(0, 5).map((sub: any) => {
            const deal = Array.isArray(sub.deals) ? sub.deals[0] : sub.deals
            const investor = Array.isArray(sub.investors) ? sub.investors[0] : sub.investors

            return {
              id: sub.id,
              deal_name: deal?.name || 'Unknown Deal',
              investor_name: investor?.display_name || investor?.legal_name || 'Unknown Investor',
              commitment: sub.commitment || 0,
              funded_amount: sub.funded_amount || 0,
              currency: sub.currency || 'USD',
              status: sub.status,
              committed_at: sub.committed_at,
            }
          })

          setRecentSubscriptions(recentSubs)
        } else {
          // No deals assigned
          setMetrics({
            assignedDeals: 0,
            pendingEscrowConfirmations: 0,
            pendingPaymentConfirmations: 0,
            signedSubscriptions: 0,
            fullyFundedSubscriptions: 0,
            totalCommitmentValue: 0,
            totalFundedValue: 0,
          })
        }
      } catch (error) {
        console.error('Error fetching lawyer data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lawyerId])

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  const statusStyles: Record<string, string> = {
    committed: 'bg-blue-500/20 text-blue-400',
    partially_funded: 'bg-amber-500/20 text-amber-400',
    active: 'bg-green-500/20 text-green-400',
  }

  const statusLabels: Record<string, string> = {
    committed: 'Awaiting Funding',
    partially_funded: 'Partial',
    active: 'Fully Funded',
  }

  const dealStatusStyles: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    draft: 'bg-gray-500/20 text-gray-400',
    closed: 'bg-purple-500/20 text-purple-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Lawyer Dashboard
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {lawyerInfo?.display_name || persona.entity_name}
            {lawyerInfo?.firm_name && ` - ${lawyerInfo.firm_name}`}
          </p>
        </div>
        {lawyerInfo?.specializations?.length ? (
          <div className="flex gap-2">
            {lawyerInfo.specializations.slice(0, 3).map((spec, idx) => (
              <Badge key={idx} variant="outline" className="capitalize">
                {spec}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {/* Alert for inactive lawyer */}
      {lawyerInfo && !lawyerInfo.is_active && (
        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Account Inactive
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your lawyer account is currently inactive. Contact the VERSO team for assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Escrow Alert */}
      {metrics && metrics.pendingEscrowConfirmations > 0 && (
        <Card className={`border-blue-500/30 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/20">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {metrics.pendingEscrowConfirmations} Pending Escrow Confirmation{metrics.pendingEscrowConfirmations !== 1 ? 's' : ''}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Signed subscriptions awaiting funding confirmation
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/versotech_main/escrow">
                  Confirm Funding
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payment Confirmations Alert */}
      {metrics && metrics.pendingPaymentConfirmations > 0 && (
        <Card className={`border-purple-500/30 ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {metrics.pendingPaymentConfirmations} Pending Fee Payment{metrics.pendingPaymentConfirmations !== 1 ? 's' : ''}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fee payments awaiting confirmation
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/versotech_main/lawyer-reconciliation">
                  View Fees
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Assigned Deals
            </CardTitle>
            <Briefcase className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.assignedDeals || 0}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Deals under your counsel
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Signed Subscriptions
            </CardTitle>
            <FileText className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.signedSubscriptions || 0}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {metrics?.fullyFundedSubscriptions || 0} fully funded
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Committed
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-blue-500`}>
              {formatCurrency(metrics?.totalCommitmentValue || 0)}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Across all subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Funded
            </CardTitle>
            <CheckCircle2 className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-green-500`}>
              {formatCurrency(metrics?.totalFundedValue || 0)}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Escrow confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signed Subscriptions */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Recent Subscriptions</CardTitle>
              <CardDescription>Recently signed subscription packs</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech_main/subscription-packs">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No signed subscriptions yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {sub.investor_name}
                      </p>
                      <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sub.deal_name}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatCurrency(sub.commitment, sub.currency)} committed
                      </p>
                    </div>
                    <Badge className={statusStyles[sub.status] || 'bg-gray-500/20 text-gray-400'}>
                      {statusLabels[sub.status] || sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Deals */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Assigned Deals</CardTitle>
              <CardDescription>Deals under your legal counsel</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech_main/assigned-deals">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {assignedDeals.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No deals assigned yet
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Contact the VERSO team to be assigned to deals
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/versotech_main/assigned-deals/${deal.id}`}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {deal.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {deal.target_size
                          ? `${formatCurrency(deal.target_size, deal.currency)} target`
                          : 'No target set'}
                      </p>
                    </div>
                    <Badge className={dealStatusStyles[deal.status] || 'bg-gray-500/20 text-gray-400'}>
                      {deal.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : ''}>Quick Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/subscription-packs">
                <FileText className="h-5 w-5" />
                <span>View Signed Packs</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/escrow">
                <DollarSign className="h-5 w-5" />
                <span>Confirm Escrow</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/assigned-deals">
                <Briefcase className="h-5 w-5" />
                <span>View Deals</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/notifications">
                <Clock className="h-5 w-5" />
                <span>Notifications</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
