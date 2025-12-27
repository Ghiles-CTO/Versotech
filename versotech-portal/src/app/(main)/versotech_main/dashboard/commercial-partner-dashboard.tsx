'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  FileSignature,
  Briefcase,
  UserCheck,
  Eye,
  PenTool,
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
  can_execute_for_clients?: boolean
  logo_url?: string | null
}

interface CommercialPartnerDashboardProps {
  commercialPartnerId: string
  userId: string
  persona: Persona
}

type CPMetrics = {
  totalClients: number
  activeClients: number
  dispatchedDeals: number
  activeOpportunities: number
  totalSubscriptions: number
  pendingSubscriptions: number
  ownInvestmentValue: number
  clientInvestmentValue: number
  pendingAgreements: number
  activeAgreements: number
}

type RecentSubscription = {
  id: string
  deal_name: string
  investor_name: string
  commitment: number
  status: string
  created_at: string
  is_proxy: boolean
}

type PlacementAgreement = {
  id: string
  agreement_type: string
  status: string
  default_commission_bps: number
  created_at: string
}

export function CommercialPartnerDashboard({ commercialPartnerId, userId, persona }: CommercialPartnerDashboardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<CPMetrics | null>(null)
  const [cpInfo, setCpInfo] = useState<{
    name: string
    legal_name: string
    status: string
    kyc_status: string | null
    cp_type: string
  } | null>(null)
  const [recentSubscriptions, setRecentSubscriptions] = useState<RecentSubscription[]>([])
  const [placementAgreements, setPlacementAgreements] = useState<PlacementAgreement[]>([])
  const [canExecuteForClients, setCanExecuteForClients] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // Fetch commercial partner entity info
        const { data: cp } = await supabase
          .from('commercial_partners')
          .select('id, name, legal_name, status, kyc_status, cp_type')
          .eq('id', commercialPartnerId)
          .maybeSingle()

        if (cp) {
          setCpInfo({
            name: cp.name,
            legal_name: cp.legal_name,
            status: cp.status,
            kyc_status: cp.kyc_status,
            cp_type: cp.cp_type,
          })
        }

        // Check if user can execute for clients
        const { data: cpUser } = await supabase
          .from('commercial_partner_users')
          .select('can_execute_for_clients')
          .eq('commercial_partner_id', commercialPartnerId)
          .eq('user_id', userId)
          .maybeSingle()

        setCanExecuteForClients(cpUser?.can_execute_for_clients || false)

        // Fetch clients from commercial_partner_clients table
        const { data: clients, count: clientCount } = await supabase
          .from('commercial_partner_clients')
          .select('id, is_active, client_investor_id', { count: 'exact' })
          .eq('commercial_partner_id', commercialPartnerId)

        const totalClients = clientCount || 0
        const activeClients = (clients || []).filter((c: any) => c.is_active).length

        // Get client investor IDs for subscription queries
        const clientInvestorIds = (clients || [])
          .filter((c: any) => c.client_investor_id)
          .map((c: any) => c.client_investor_id)

        // Get user's investor link (for MODE 1 - direct investment)
        const { data: investorLinks } = await supabase
          .from('investor_users')
          .select('investor_id')
          .eq('user_id', userId)

        const ownInvestorIds = (investorLinks || []).map((l: any) => l.investor_id)

        // Fetch dispatched deals - deals where CP is dispatched
        const { data: dealMemberships } = await supabase
          .from('deal_memberships')
          .select('deal_id, role')
          .eq('user_id', userId)
          .in('role', ['commercial_partner_investor', 'commercial_partner_proxy'])

        const dispatchedDeals = (dealMemberships || []).length
        const dispatchedDealIds = (dealMemberships || []).map((dm: any) => dm.deal_id)

        // Count active opportunities (deals with status open/allocation_pending that CP is dispatched to)
        let activeOpportunities = 0
        if (dispatchedDealIds.length > 0) {
          const { count: activeDealsCount } = await supabase
            .from('deals')
            .select('id', { count: 'exact', head: true })
            .in('id', dispatchedDealIds)
            .in('status', ['open', 'allocation_pending', 'active'])

          activeOpportunities = activeDealsCount || 0
        }

        // Fetch subscriptions - both own investments (MODE 1) and client subscriptions (MODE 2)
        let ownInvestmentValue = 0
        let clientInvestmentValue = 0
        let totalSubscriptions = 0
        let pendingSubscriptions = 0
        const allSubscriptions: RecentSubscription[] = []

        // MODE 1 - Own investments
        if (ownInvestorIds.length > 0) {
          const { data: ownSubs } = await supabase
            .from('subscriptions')
            .select(`
              id, commitment, status, created_at,
              deals (id, name),
              investors (id, legal_name)
            `)
            .in('investor_id', ownInvestorIds)
            .order('created_at', { ascending: false })
            .limit(10)

          ;(ownSubs || []).forEach((sub: any) => {
            if (['committed', 'active', 'signed', 'funded'].includes(sub.status)) {
              ownInvestmentValue += sub.commitment || 0
            }
            totalSubscriptions++
            if (sub.status === 'pending') pendingSubscriptions++

            allSubscriptions.push({
              id: sub.id,
              deal_name: sub.deals?.name || 'Unknown Deal',
              investor_name: 'My Investment',
              commitment: sub.commitment || 0,
              status: sub.status,
              created_at: sub.created_at,
              is_proxy: false,
            })
          })
        }

        // MODE 2 - Client subscriptions
        if (clientInvestorIds.length > 0) {
          const { data: clientSubs } = await supabase
            .from('subscriptions')
            .select(`
              id, commitment, status, created_at,
              deals (id, name),
              investors (id, legal_name)
            `)
            .in('investor_id', clientInvestorIds)
            .order('created_at', { ascending: false })
            .limit(10)

          ;(clientSubs || []).forEach((sub: any) => {
            if (['committed', 'active', 'signed', 'funded'].includes(sub.status)) {
              clientInvestmentValue += sub.commitment || 0
            }
            totalSubscriptions++
            if (sub.status === 'pending') pendingSubscriptions++

            allSubscriptions.push({
              id: sub.id,
              deal_name: sub.deals?.name || 'Unknown Deal',
              investor_name: sub.investors?.legal_name || 'Client',
              commitment: sub.commitment || 0,
              status: sub.status,
              created_at: sub.created_at,
              is_proxy: true,
            })
          })
        }

        // Sort all subscriptions by date and take top 5
        allSubscriptions.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setRecentSubscriptions(allSubscriptions.slice(0, 5))

        // Fetch placement agreements
        const { data: agreements } = await supabase
          .from('placement_agreements')
          .select('id, agreement_type, status, default_commission_bps, created_at')
          .eq('commercial_partner_id', commercialPartnerId)
          .order('created_at', { ascending: false })

        setPlacementAgreements(agreements || [])

        const pendingAgreements = (agreements || []).filter((a: any) =>
          ['sent', 'pending_approval', 'approved', 'pending_ceo_signature', 'pending_cp_signature'].includes(a.status)
        ).length
        const activeAgreements = (agreements || []).filter((a: any) => a.status === 'active').length

        setMetrics({
          totalClients,
          activeClients,
          dispatchedDeals,
          activeOpportunities,
          totalSubscriptions,
          pendingSubscriptions,
          ownInvestmentValue,
          clientInvestmentValue,
          pendingAgreements,
          activeAgreements,
        })
      } catch (error) {
        console.error('Error fetching commercial partner data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [commercialPartnerId, userId])

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  const subscriptionStatusStyles: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    committed: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    signed: 'bg-purple-500/20 text-purple-400',
    funded: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  const agreementStatusStyles: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    sent: 'bg-blue-500/20 text-blue-400',
    pending_approval: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-green-500/20 text-green-400',
    pending_ceo_signature: 'bg-purple-500/20 text-purple-400',
    pending_cp_signature: 'bg-indigo-500/20 text-indigo-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    expired: 'bg-red-500/20 text-red-400',
    terminated: 'bg-red-500/20 text-red-400',
  }

  const agreementStatusLabels: Record<string, string> = {
    draft: 'Draft',
    sent: 'Sent',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    pending_ceo_signature: 'Awaiting CEO Signature',
    pending_cp_signature: 'Your Signature Required',
    active: 'Active',
    expired: 'Expired',
    terminated: 'Terminated',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Commercial Partner Dashboard
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {cpInfo?.legal_name || cpInfo?.name || persona.entity_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cpInfo?.cp_type && (
            <Badge variant="outline" className={isDark ? 'border-gray-600' : ''}>
              {cpInfo.cp_type.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          )}
          {cpInfo?.kyc_status && (
            <Badge
              variant="outline"
              className={
                cpInfo.kyc_status === 'approved'
                  ? 'border-green-500/50 text-green-500'
                  : cpInfo.kyc_status === 'pending'
                  ? 'border-amber-500/50 text-amber-500'
                  : 'border-gray-500/50 text-gray-500'
              }
            >
              KYC: {cpInfo.kyc_status}
            </Badge>
          )}
        </div>
      </div>

      {/* Alert for inactive/pending CP */}
      {cpInfo && cpInfo.status !== 'active' && (
        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Account {cpInfo.status === 'pending' ? 'Pending Approval' : 'Inactive'}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {cpInfo.status === 'pending'
                    ? 'Your commercial partner account is pending approval. Contact the VERSO team for status updates.'
                    : 'Your commercial partner account is currently inactive. Contact the VERSO team for assistance.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Signature Alert */}
      {metrics && metrics.pendingAgreements > 0 && (
        <Card className={`border-orange-500/30 ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/20">
                  <FileSignature className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {metrics.pendingAgreements} Pending Agreement{metrics.pendingAgreements !== 1 ? 's' : ''}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Agreements awaiting approval or signature
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/versotech_main/placement-agreements">
                  View Agreements
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
              Clients Managed
            </CardTitle>
            <Users className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.totalClients || 0}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {metrics?.activeClients || 0} active clients
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Active Opportunities
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {metrics?.activeOpportunities || 0}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {metrics?.dispatchedDeals || 0} total dispatched
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Client Investments
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-green-500`}>
              {formatCurrency(metrics?.clientInvestmentValue || 0)}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Via proxy subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Own Investments
            </CardTitle>
            <Briefcase className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(metrics?.ownInvestmentValue || 0)}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Direct investments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions & Agreements Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metrics?.totalSubscriptions || 0}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Subscriptions ({metrics?.pendingSubscriptions || 0} pending)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metrics?.activeAgreements || 0}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Active Placement Agreements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Recent Transactions</CardTitle>
              <CardDescription>Latest subscription activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech_main/client-transactions">
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
                  No subscriptions yet
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Browse opportunities to start investing
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
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sub.deal_name}
                        </p>
                        {sub.is_proxy && (
                          <Badge variant="outline" className="text-xs">
                            Proxy
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sub.investor_name} • {formatCurrency(sub.commitment)}
                      </p>
                    </div>
                    <Badge className={subscriptionStatusStyles[sub.status] || 'bg-gray-500/20 text-gray-400'}>
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placement Agreements */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Placement Agreements</CardTitle>
              <CardDescription>Your commission agreements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech_main/placement-agreements">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {placementAgreements.length === 0 ? (
              <div className="text-center py-8">
                <FileSignature className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No placement agreements
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Agreements will appear here once created
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {placementAgreements.slice(0, 5).map((agreement) => (
                  <Link
                    key={agreement.id}
                    href={`/versotech_main/placement-agreements/${agreement.id}`}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {agreement.agreement_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Agreement
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Commission: {(agreement.default_commission_bps / 100).toFixed(2)}%
                      </p>
                    </div>
                    <Badge className={agreementStatusStyles[agreement.status] || 'bg-gray-500/20 text-gray-400'}>
                      {agreementStatusLabels[agreement.status] || agreement.status}
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
              <Link href="/versotech_main/opportunities">
                <TrendingUp className="h-5 w-5" />
                <span>View Opportunities</span>
              </Link>
            </Button>
            {canExecuteForClients && (
              <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                <Link href="/versotech_main/client-transactions">
                  <Users className="h-5 w-5" />
                  <span>Client Transactions</span>
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/portfolio">
                <Briefcase className="h-5 w-5" />
                <span>My Portfolio</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/placement-agreements">
                <FileSignature className="h-5 w-5" />
                <span>Agreements</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mode Capabilities Notice */}
      <Card className={`${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}`}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cyan-500 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Commercial Partner Capabilities
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {canExecuteForClients ? (
                  <>You can invest directly <strong>(MODE 1)</strong> and execute on behalf of clients <strong>(MODE 2)</strong>.</>
                ) : (
                  <>You can invest directly <strong>(MODE 1)</strong>. Contact admin to enable client execution.</>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
