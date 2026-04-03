'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Users,
  UserPlus,
  Building2,
  Scale,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  FileSignature,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/format'
import { useTheme } from '@/components/theme-provider'
import { ArrangerOnboardingChecklist } from '@/components/arranger/arranger-onboarding-checklist'

type Persona = {
  persona_type: string
  entity_id: string
  entity_name: string
  role_in_entity?: string | null
  can_sign?: boolean
  logo_url?: string | null
}

interface ArrangerDashboardProps {
  arrangerId: string
  userId: string
  persona: Persona
}

type ArrangerMetrics = {
  totalMandates: number
  activeMandates: number
  pendingMandates: number
  totalPartners: number
  totalIntroducers: number
  totalCommercialPartners: number
  totalLawyers: number
  pendingAgreements: number
}

type RecentMandate = {
  id: string
  name: string
  status: string
  target_amount: number | null
  currency: string | null
  created_at: string
}

type PendingAgreement = {
  id: string
  entity_name: string
  entity_type: 'introducer' | 'commercial_partner'
  status: string
  created_at: string
}

type SubscriptionPackMetrics = {
  awaitingInvestorSignature: number
  awaitingArrangerSignature: number
  awaitingCEOSignature: number
  signedThisMonth: number
  totalPending: number
}

export function ArrangerDashboard({ arrangerId, userId, persona }: ArrangerDashboardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<ArrangerMetrics | null>(null)
  const [arrangerInfo, setArrangerInfo] = useState<{
    legal_name: string
    status: string
    kyc_status: string | null
  } | null>(null)
  const [recentMandates, setRecentMandates] = useState<RecentMandate[]>([])
  const [pendingAgreements, setPendingAgreements] = useState<PendingAgreement[]>([])
  const [subPackMetrics, setSubPackMetrics] = useState<SubscriptionPackMetrics | null>(null)

  const formatAmountWithCurrency = (amount: number, currency?: string | null) => {
    if (currency) return formatCurrency(amount, currency)
    return amount.toLocaleString('en-US')
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()

        // Fetch arranger entity info
        const { data: arranger } = await supabase
          .from('arranger_entities')
          .select('id, legal_name, status, kyc_status')
          .eq('id', arrangerId)
          .maybeSingle()

        if (arranger) {
          setArrangerInfo({
            legal_name: arranger.legal_name,
            status: arranger.status,
            kyc_status: arranger.kyc_status,
          })
        }

        // VEHICLE-LEVEL ARCHITECTURE: Fetch vehicles assigned to this arranger first
        const { data: arrangerVehicles } = await supabase
          .from('vehicles')
          .select('id, name, lawyer_id')
          .eq('arranger_entity_id', arrangerId)

        const vehicleIds = (arrangerVehicles || []).map((v: any) => v.id)

        // Then fetch all deals under those vehicles (mandates)
        let deals: any[] = []
        if (vehicleIds.length > 0) {
          const { data: vehicleDeals } = await supabase
            .from('deals')
            .select('id, name, status, target_amount, currency, created_at, vehicle_id')
            .in('vehicle_id', vehicleIds)
            .order('created_at', { ascending: false })
          deals = vehicleDeals || []
        }

        const mandates = deals || []
        // Deal statuses: draft, open, allocation_pending, closed, cancelled
        const activeMandates = mandates.filter((d: any) => d.status === 'open' || d.status === 'allocation_pending')
        const pendingMandates = mandates.filter((d: any) => d.status === 'draft')

        setRecentMandates(mandates.slice(0, 5).map((d: any) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          target_amount: d.target_amount,
          currency: d.currency ? String(d.currency).toUpperCase() : null,
          created_at: d.created_at,
        })))

        const dealIds = mandates.map((d: any) => d.id)

        // Count related entities - SCOPED TO ARRANGER'S DEALS
        let partnersCount = 0
        let introducersCount = 0
        let cpCount = 0

        // VEHICLE-LEVEL: Lawyers are assigned to vehicles, count them regardless of deals
        const uniqueLawyers = new Set(
          (arrangerVehicles || [])
            .filter((v: any) => v.lawyer_id)
            .map((v: any) => v.lawyer_id)
        )
        const lawyersCount = uniqueLawyers.size

        if (dealIds.length > 0) {
          // Get subscriptions on arranger's deals for relationship tracking
          const { data: dealSubscriptions } = await supabase
            .from('subscriptions')
            .select('id, investor_id, introducer_id, proxy_commercial_partner_id')
            .in('deal_id', dealIds)

          // Count unique introducers who have introduced to arranger's deals
          const introducerIds = new Set(
            (dealSubscriptions || [])
              .filter((s: any) => s.introducer_id)
              .map((s: any) => s.introducer_id)
          )
          introducersCount = introducerIds.size

          // Count unique partners who have referred investors to arranger's deals
          // Partners are tracked via deal_memberships.referred_by_entity_id (not subscriptions)
          const { data: partnerReferrals } = await supabase
            .from('deal_memberships')
            .select('referred_by_entity_id')
            .in('deal_id', dealIds)
            .eq('referred_by_entity_type', 'partner')
            .not('referred_by_entity_id', 'is', null)

          const uniquePartnerIds = new Set(
            (partnerReferrals || []).map((r: any) => r.referred_by_entity_id)
          )
          partnersCount = uniquePartnerIds.size

          // Count unique commercial partners on arranger's deals (via subscriptions)
          const cpIds = new Set(
            (dealSubscriptions || [])
              .filter((s: any) => s.proxy_commercial_partner_id)
              .map((s: any) => s.proxy_commercial_partner_id)
          )
          cpCount = cpIds.size
        }

        // Fetch pending agreements (introducer and placement) - SCOPED TO THIS ARRANGER
        const { data: introducerAgreements } = await supabase
          .from('introducer_agreements')
          .select(`
            id,
            status,
            created_at,
            introducers (id, display_name, legal_name)
          `)
          .eq('arranger_id', arrangerId)
          .in('status', ['sent', 'pending_approval', 'approved', 'pending_ceo_signature', 'pending_introducer_signature'])
          .order('created_at', { ascending: false })
          .limit(5)

        const { data: placementAgreements } = await supabase
          .from('placement_agreements')
          .select(`
            id,
            status,
            created_at,
            commercial_partners (id, display_name, legal_name)
          `)
          .eq('arranger_id', arrangerId)
          .in('status', ['sent', 'pending_approval', 'approved', 'pending_ceo_signature', 'pending_cp_signature'])
          .order('created_at', { ascending: false })
          .limit(5)

        const allPendingAgreements: PendingAgreement[] = []

        ;(introducerAgreements || []).forEach((a: any) => {
          const intro = Array.isArray(a.introducers) ? a.introducers[0] : a.introducers
          allPendingAgreements.push({
            id: a.id,
            entity_name: intro?.display_name || intro?.legal_name || 'Unknown',
            entity_type: 'introducer',
            status: a.status,
            created_at: a.created_at,
          })
        })

        ;(placementAgreements || []).forEach((a: any) => {
          const cp = Array.isArray(a.commercial_partners) ? a.commercial_partners[0] : a.commercial_partners
          allPendingAgreements.push({
            id: a.id,
            entity_name: cp?.display_name || cp?.legal_name || 'Unknown',
            entity_type: 'commercial_partner',
            status: a.status,
            created_at: a.created_at,
          })
        })

        // Sort by created_at and take top 5
        allPendingAgreements.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setPendingAgreements(allPendingAgreements.slice(0, 5))

        // SUBSCRIPTION PACK PIPELINE METRICS (User Story 2.6.1)
        if (dealIds.length > 0) {
          const { data: subDocs } = await supabase
            .from('documents')
            .select(`
              id,
              subscription_id,
              status,
              ready_for_signature,
              signature_requests(id, signer_role, status)
            `)
            .not('subscription_id', 'is', null)
            .in('status', ['published', 'pending_signature'])

          const { data: arrangerSubscriptions } = await supabase
            .from('subscriptions')
            .select('id')
            .in('deal_id', dealIds)

          const arrangerSubIds = new Set((arrangerSubscriptions || []).map((s: any) => s.id))
          const arrangerDocs = (subDocs || []).filter((doc: any) => arrangerSubIds.has(doc.subscription_id))

          let awaitingInvestor = 0
          let awaitingArranger = 0
          let awaitingCEO = 0

          arrangerDocs.forEach((doc: any) => {
            if (doc.status !== 'pending_signature') return
            const requests = doc.signature_requests || []
            const hasPendingInvestor = requests.some((r: any) => r.signer_role === 'investor' && r.status === 'pending')
            const hasPendingArranger = requests.some((r: any) => r.signer_role === 'arranger' && r.status === 'pending')
            const hasPendingCEO = requests.some((r: any) => r.signer_role === 'admin' && r.status === 'pending')

            if (hasPendingInvestor) awaitingInvestor++
            if (hasPendingArranger) awaitingArranger++
            if (hasPendingCEO) awaitingCEO++
          })

          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)

          const { count: signedThisMonth } = await supabase
            .from('subscriptions')
            .select('id', { count: 'exact', head: true })
            .in('deal_id', dealIds)
            .not('signed_at', 'is', null)
            .gte('signed_at', startOfMonth.toISOString())

          setSubPackMetrics({
            awaitingInvestorSignature: awaitingInvestor,
            awaitingArrangerSignature: awaitingArranger,
            awaitingCEOSignature: awaitingCEO,
            signedThisMonth: signedThisMonth || 0,
            totalPending: awaitingInvestor + awaitingArranger + awaitingCEO,
          })
        } else {
          setSubPackMetrics({
            awaitingInvestorSignature: 0,
            awaitingArrangerSignature: 0,
            awaitingCEOSignature: 0,
            signedThisMonth: 0,
            totalPending: 0,
          })
        }

        setMetrics({
          totalMandates: mandates.length,
          activeMandates: activeMandates.length,
          pendingMandates: pendingMandates.length,
          totalPartners: partnersCount || 0,
          totalIntroducers: introducersCount || 0,
          totalCommercialPartners: cpCount || 0,
          totalLawyers: lawyersCount,
          pendingAgreements: allPendingAgreements.length,
        })
      } catch (error) {
        console.error('Error fetching arranger data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [arrangerId])

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  // Deal status enum: draft, open, allocation_pending, closed, cancelled
  const dealStatusStyles: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400',
    open: 'bg-green-500/20 text-green-400',
    allocation_pending: 'bg-amber-500/20 text-amber-400',
    closed: 'bg-purple-500/20 text-purple-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  const agreementStatusStyles: Record<string, string> = {
    sent: 'bg-blue-500/20 text-blue-400',
    pending_approval: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-green-500/20 text-green-400',
    pending_ceo_signature: 'bg-purple-500/20 text-purple-400',
    pending_introducer_signature: 'bg-indigo-500/20 text-indigo-400',
    pending_cp_signature: 'bg-indigo-500/20 text-indigo-400',
  }

  const agreementStatusLabels: Record<string, string> = {
    sent: 'Sent',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    pending_ceo_signature: 'Awaiting CEO Signature',
    pending_introducer_signature: 'Awaiting Signature',
    pending_cp_signature: 'Awaiting Signature',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Arranger Dashboard
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {arrangerInfo?.legal_name || persona.entity_name}
          </p>
        </div>
        {arrangerInfo?.kyc_status && (
          <Badge
            variant="outline"
            className={
              arrangerInfo.kyc_status === 'approved'
                ? 'border-green-500/50 text-green-500'
                : arrangerInfo.kyc_status === 'pending'
                ? 'border-amber-500/50 text-amber-500'
                : 'border-gray-500/50 text-gray-500'
            }
          >
            KYC: {arrangerInfo.kyc_status}
          </Badge>
        )}
      </div>

      {/* Alert for inactive/pending arranger */}
      {arrangerInfo && arrangerInfo.status !== 'active' && (
        <Card className={`border-amber-500/30 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Account {arrangerInfo.status === 'pending' ? 'Pending Approval' : 'Inactive'}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {arrangerInfo.status === 'pending'
                    ? 'Your arranger account is pending approval. Contact the VERSO team for status updates.'
                    : 'Your arranger account is currently inactive. Contact the VERSO team for assistance.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Agreements Alert */}
      {metrics && metrics.pendingAgreements > 0 && (
        <Card className={`border-blue-500/30 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/20">
                  <FileSignature className="h-5 w-5 text-blue-500" />
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
                <Link href="/versotech_main/versosign">
                  View in VERSOSIGN
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Checklist - Show when KYC not approved */}
      {arrangerInfo?.kyc_status !== 'approved' && (
        <ArrangerOnboardingChecklist arrangerId={arrangerId} compact />
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/versotech_main/my-mandates" className="group">
          <Card className={`h-full transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10' : 'hover:border-primary/40 hover:bg-primary/5'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Mandates
              </CardTitle>
              <Briefcase className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics?.totalMandates || 0}
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {metrics?.activeMandates || 0} active, {metrics?.pendingMandates || 0} pending
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                View mandates
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/versotech_main/my-introducers" className="group">
          <Card className={`h-full transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10' : 'hover:border-primary/40 hover:bg-primary/5'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Active Network
              </CardTitle>
              <Users className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {(metrics?.totalPartners || 0) + (metrics?.totalIntroducers || 0) + (metrics?.totalCommercialPartners || 0)}
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                On your mandates
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                View network
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/versotech_main/my-lawyers" className="group">
          <Card className={`h-full transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10' : 'hover:border-primary/40 hover:bg-primary/5'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Assigned Lawyers
              </CardTitle>
              <Scale className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metrics?.totalLawyers || 0}
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                On your mandates
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                View lawyers
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* NEW: Subscription Pack Pipeline (User Story 2.6.1) */}
      <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
        <CardHeader>
          <CardTitle className={isDark ? 'text-white' : ''}>Subscription Pack Pipeline</CardTitle>
          <CardDescription>Document signing status across your mandates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
              <p className="text-2xl font-bold text-amber-500">{subPackMetrics?.awaitingInvestorSignature || 0}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Awaiting Investor</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
              <p className="text-2xl font-bold text-purple-500">{subPackMetrics?.awaitingArrangerSignature || 0}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Awaiting Your Signature</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <p className="text-2xl font-bold text-blue-500">{subPackMetrics?.awaitingCEOSignature || 0}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Awaiting CEO</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
              <p className="text-2xl font-bold text-green-500">{subPackMetrics?.signedThisMonth || 0}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Signed This Month</p>
            </div>
          </div>
          {/* Action alert if arranger has docs to sign */}
          {(subPackMetrics?.awaitingArrangerSignature || 0) > 0 && (
            <Alert className={`mt-4 border-purple-500/30 ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
              <FileSignature className="h-4 w-4 text-purple-500" />
              <AlertDescription className={`flex items-center justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>You have {subPackMetrics?.awaitingArrangerSignature} document(s) awaiting your signature.</span>
                <Button variant="link" asChild className="p-0 h-auto text-purple-500">
                  <Link href="/versotech_main/versosign">Sign Now →</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Entity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-pink-500/20">
                <Users className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metrics?.totalPartners || 0}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/20">
                <UserPlus className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metrics?.totalIntroducers || 0}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Introducers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-cyan-500/20">
                <Building2 className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {metrics?.totalCommercialPartners || 0}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Commercial Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mandates */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Recent Mandates</CardTitle>
              <CardDescription>Your managed deals</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech_main/my-mandates">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMandates.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No mandates assigned yet
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  Contact the VERSO team to be assigned mandates
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMandates.map((mandate) => (
                  <Link
                    key={mandate.id}
                    href={`/versotech_main/my-mandates`}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {mandate.name}
                      </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {mandate.target_amount
                          ? `${formatAmountWithCurrency(mandate.target_amount, mandate.currency)} target`
                          : 'No target set'}
                        </p>
                    </div>
                    <Badge className={dealStatusStyles[mandate.status] || 'bg-gray-500/20 text-gray-400'}>
                      {mandate.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Agreements */}
        <Card className={isDark ? 'bg-white/5 border-white/10' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isDark ? 'text-white' : ''}>Pending Agreements</CardTitle>
              <CardDescription>Agreements awaiting action</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/versotech_main/versosign">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingAgreements.length === 0 ? (
              <div className="text-center py-8">
                <FileSignature className={`h-10 w-10 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No pending agreements
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  All agreements are up to date
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAgreements.map((agreement) => (
                  <div
                    key={agreement.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {agreement.entity_name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {agreement.entity_type === 'introducer' ? 'Introducer Agreement' : 'Placement Agreement'}
                      </p>
                    </div>
                    <Badge className={agreementStatusStyles[agreement.status] || 'bg-gray-500/20 text-gray-400'}>
                      {agreementStatusLabels[agreement.status] || agreement.status}
                    </Badge>
                  </div>
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
              <Link href="/versotech_main/my-mandates">
                <Briefcase className="h-5 w-5" />
                <span>View Mandates</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/my-partners">
                <Users className="h-5 w-5" />
                <span>My Partners</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/my-introducers">
                <UserPlus className="h-5 w-5" />
                <span>My Introducers</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/versotech_main/versosign">
                <FileSignature className="h-5 w-5" />
                <span>VERSOSIGN</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
