'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  AlertCircle,
  User,
  Building2,
  Briefcase,
  TrendingUp,
  Mail,
  FileText,
  FolderOpen,
  Percent,
  ExternalLink,
  ArrowRight,
  Columns3,
  List,
  Eye,
  PenTool,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

type ClientTransaction = {
  id: string
  client_name: string
  client_email: string | null
  client_type: string | null
  is_active: boolean
  created_at: string
  deal_id: string | null
  deal_name: string | null
  deal_status: string | null
  investor_id: string | null
  subscription_id: string | null
  subscription_amount: number | null
  subscription_status: string | null
  subscription_date: string | null
  // Journey stage for bucket view
  journey_stage: 'new_lead' | 'interested' | 'subscribing' | 'funded' | 'passed'
  // New fields for enhanced view
  has_termsheet: boolean
  has_dataroom_access: boolean
  estimated_commission: number | null
  commission_rate_bps: number | null
}

type CommercialPartnerInfo = {
  id: string
  name: string
  legal_name: string | null
  type: string | null
  status: string
  logo_url: string | null
}

type PlacementAgreement = {
  id: string
  default_commission_bps: number
  status: string
}

type Summary = {
  totalClients: number
  activeClients: number
  totalTransactions: number
  totalValue: number
  estimatedCommission: number
}

// Journey stage definitions for bucket view
const JOURNEY_STAGES = [
  { key: 'new_lead', label: 'New Lead', color: 'bg-slate-500', icon: User },
  { key: 'interested', label: 'Interested', color: 'bg-blue-500', icon: Eye },
  { key: 'subscribing', label: 'Subscribing', color: 'bg-purple-500', icon: PenTool },
  { key: 'funded', label: 'Funded', color: 'bg-green-500', icon: Wallet },
  { key: 'passed', label: 'Passed', color: 'bg-gray-400', icon: AlertCircle },
] as const

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  funded: 'bg-blue-100 text-blue-800 border-blue-200',
  signed: 'bg-purple-100 text-purple-800 border-purple-200',
  committed: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_FILTERS = [
  { label: 'All Clients', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const CLIENT_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  company: 'Company',
  trust: 'Trust',
  fund: 'Fund',
}

// Map subscription status to journey stage
function getJourneyStage(
  subscriptionStatus: string | null,
  hasSubscription: boolean,
  interestLevel?: string
): ClientTransaction['journey_stage'] {
  if (!hasSubscription) {
    if (interestLevel === 'passed' || interestLevel === 'rejected') {
      return 'passed'
    }
    return interestLevel === 'interested' ? 'interested' : 'new_lead'
  }

  switch (subscriptionStatus) {
    case 'funded':
    case 'active':
      return 'funded'
    case 'signed':
    case 'committed':
    case 'pending':
    case 'approved':
      return 'subscribing'
    case 'cancelled':
    case 'rejected':
    case 'withdrawn':
      return 'passed'
    default:
      return 'interested'
  }
}

export default function ClientTransactionsPage() {
  const [partnerInfo, setPartnerInfo] = useState<CommercialPartnerInfo | null>(null)
  const [placementAgreement, setPlacementAgreement] = useState<PlacementAgreement | null>(null)
  const [clients, setClients] = useState<ClientTransaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalClients: 0,
    activeClients: 0,
    totalTransactions: 0,
    totalValue: 0,
    estimatedCommission: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'buckets'>('table')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Not authenticated')
          return
        }

        // Check if user is a commercial partner
        const { data: cpUser, error: cpUserError } = await supabase
          .from('commercial_partner_users')
          .select('commercial_partner_id')
          .eq('user_id', user.id)
          .single()

        if (cpUserError || !cpUser) {
          // Maybe they're staff - show all clients as placeholder
          await fetchAllClients(supabase)
          return
        }

        // Fetch commercial partner info
        const { data: partner, error: partnerError } = await supabase
          .from('commercial_partners')
          .select('id, name, legal_name, type, status, logo_url')
          .eq('id', cpUser.commercial_partner_id)
          .single()

        if (partnerError) throw partnerError
        setPartnerInfo(partner)

        // Fetch active placement agreement for commission rate
        const { data: agreement } = await supabase
          .from('placement_agreements')
          .select('id, default_commission_bps, status')
          .eq('commercial_partner_id', cpUser.commercial_partner_id)
          .eq('status', 'active')
          .maybeSingle()

        setPlacementAgreement(agreement)

        // Fetch clients for this commercial partner
        const { data: clientsData, error: clientsError } = await supabase
          .from('commercial_partner_clients')
          .select(`
            id,
            client_name,
            client_email,
            client_type,
            is_active,
            created_at,
            created_for_deal_id,
            client_investor_id,
            deal:created_for_deal_id (
              id,
              name,
              status
            )
          `)
          .eq('commercial_partner_id', cpUser.commercial_partner_id)
          .order('created_at', { ascending: false })

        if (clientsError) throw clientsError

        // Get subscriptions for these clients if they have investor IDs
        const investorIds = (clientsData || [])
          .filter((c: any) => c.client_investor_id)
          .map((c: any) => c.client_investor_id)

        let subscriptionsMap: Record<string, any> = {}
        if (investorIds.length > 0) {
          const { data: subs } = await supabase
            .from('subscriptions')
            .select(`
              id,
              investor_id,
              deal_id,
              commitment,
              status,
              subscription_date,
              deals (
                id,
                name,
                status
              )
            `)
            .in('investor_id', investorIds)
            .order('created_at', { ascending: false })

          if (subs) {
            // Group by investor_id, keeping all subscriptions
            subs.forEach((s: any) => {
              if (!subscriptionsMap[s.investor_id]) {
                subscriptionsMap[s.investor_id] = []
              }
              subscriptionsMap[s.investor_id].push(s)
            })
          }
        }

        // Check for dataroom access (deal memberships)
        const dealIds = (clientsData || [])
          .filter((c: any) => c.created_for_deal_id)
          .map((c: any) => c.created_for_deal_id)

        let dataroomAccessMap: Record<string, boolean> = {}
        if (dealIds.length > 0 && investorIds.length > 0) {
          const { data: memberships } = await supabase
            .from('deal_memberships')
            .select('deal_id, user_id')
            .in('deal_id', dealIds)

          // For simplicity, assume clients with deal_id have potential dataroom access
          dealIds.forEach((dealId: string) => {
            dataroomAccessMap[dealId] = true
          })
        }

        processClients(
          clientsData || [],
          subscriptionsMap,
          dataroomAccessMap,
          agreement?.default_commission_bps || 0
        )
        setError(null)
      } catch (err) {
        console.error('[ClientTransactionsPage] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load client transactions')
      } finally {
        setLoading(false)
      }
    }

    async function fetchAllClients(supabase: any) {
      // Staff view - show all clients with partner info
      const { data: clientsData, error: clientsError } = await supabase
        .from('commercial_partner_clients')
        .select(`
          id,
          client_name,
          client_email,
          client_type,
          is_active,
          created_at,
          created_for_deal_id,
          client_investor_id,
          deal:created_for_deal_id (
            id,
            name,
            status
          ),
          commercial_partner:commercial_partner_id (
            id,
            name,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (clientsError) throw clientsError
      processClients(clientsData || [], {}, {}, 0)
    }

    function processClients(
      data: any[],
      subscriptionsMap: Record<string, any[]>,
      dataroomAccessMap: Record<string, boolean>,
      commissionBps: number
    ) {
      const processed: ClientTransaction[] = []

      data.forEach((client) => {
        const subscriptions = client.client_investor_id
          ? subscriptionsMap[client.client_investor_id] || []
          : []

        if (subscriptions.length === 0) {
          // Client without subscription - single entry
          processed.push({
            id: client.id,
            client_name: client.client_name || 'Unknown Client',
            client_email: client.client_email,
            client_type: client.client_type,
            is_active: client.is_active ?? true,
            created_at: client.created_at,
            deal_id: client.created_for_deal_id,
            deal_name: client.deal?.name || null,
            deal_status: client.deal?.status || null,
            investor_id: client.client_investor_id,
            subscription_id: null,
            subscription_amount: null,
            subscription_status: null,
            subscription_date: null,
            journey_stage: getJourneyStage(null, false),
            has_termsheet: !!client.created_for_deal_id,
            has_dataroom_access: !!dataroomAccessMap[client.created_for_deal_id],
            estimated_commission: null,
            commission_rate_bps: commissionBps,
          })
        } else {
          // Create entry for each subscription
          subscriptions.forEach((sub: any) => {
            const commitment = sub.commitment || 0
            const estimatedComm = commissionBps > 0 ? (commitment * commissionBps) / 10000 : null

            processed.push({
              id: `${client.id}-${sub.id}`,
              client_name: client.client_name || 'Unknown Client',
              client_email: client.client_email,
              client_type: client.client_type,
              is_active: client.is_active ?? true,
              created_at: sub.subscription_date || client.created_at,
              deal_id: sub.deal_id,
              deal_name: sub.deals?.name || client.deal?.name || null,
              deal_status: sub.deals?.status || client.deal?.status || null,
              investor_id: client.client_investor_id,
              subscription_id: sub.id,
              subscription_amount: commitment,
              subscription_status: sub.status,
              subscription_date: sub.subscription_date,
              journey_stage: getJourneyStage(sub.status, true),
              has_termsheet: true,
              has_dataroom_access: true,
              estimated_commission: estimatedComm,
              commission_rate_bps: commissionBps,
            })
          })
        }
      })

      setClients(processed)

      // Calculate summary
      const uniqueClients = new Set(data.map((c: any) => c.id))
      const activeClients = data.filter((c: any) => c.is_active).length
      const withSubscription = processed.filter(c => c.subscription_amount)
      const totalValue = withSubscription.reduce((sum, c) => sum + (c.subscription_amount || 0), 0)
      const estimatedCommission = withSubscription.reduce(
        (sum, c) => sum + (c.estimated_commission || 0),
        0
      )

      setSummary({
        totalClients: uniqueClients.size,
        activeClients,
        totalTransactions: withSubscription.length,
        totalValue,
        estimatedCommission,
      })
    }

    fetchData()
  }, [])

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && client.is_active) ||
      (statusFilter === 'inactive' && !client.is_active)
    const matchesSearch = !search ||
      client.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      client.client_email?.toLowerCase().includes(search.toLowerCase()) ||
      client.deal_name?.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Group clients by journey stage for bucket view
  const clientsByStage = JOURNEY_STAGES.reduce((acc, stage) => {
    acc[stage.key] = filteredClients.filter(c => c.journey_stage === stage.key)
    return acc
  }, {} as Record<string, ClientTransaction[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading client transactions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Clients</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Transactions</h1>
          <p className="text-muted-foreground mt-1">
            {partnerInfo
              ? `Manage clients you've introduced as ${partnerInfo.name}`
              : 'View and manage all client transactions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {placementAgreement && (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <Percent className="h-3 w-3 mr-1" />
              {(placementAgreement.default_commission_bps / 100).toFixed(2)}% Commission
            </Badge>
          )}
          {partnerInfo && (
            <div className="flex items-center gap-2">
              {partnerInfo.logo_url ? (
                <img
                  src={partnerInfo.logo_url}
                  alt={partnerInfo.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients introduced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalValue, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total commitment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Est. Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summary.estimatedCommission, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              On funded deals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by client name, email, or deal..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button
                variant={viewMode === 'buckets' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('buckets')}
              >
                <Columns3 className="h-4 w-4 mr-1" />
                Buckets
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle>Client Transactions</CardTitle>
            <CardDescription>
              {filteredClients.length} transaction{filteredClients.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {search || statusFilter !== 'all'
                    ? 'No clients match your filters'
                    : partnerInfo
                      ? 'No clients introduced yet'
                      : 'No client transactions found'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Deal</TableHead>
                      <TableHead>Investment</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Est. Commission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{client.client_name}</div>
                              {client.client_email && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {client.client_email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.deal_name ? (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{client.deal_name}</span>
                              {client.deal_status && (
                                <Badge variant="outline" className="text-xs ml-1">
                                  {client.deal_status}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">No deal</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.subscription_amount ? (
                            <div>
                              <div className="font-medium">
                                {formatCurrency(client.subscription_amount, 'USD')}
                              </div>
                              {client.subscription_status && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs capitalize mt-1',
                                    STATUS_STYLES[client.subscription_status] || ''
                                  )}
                                >
                                  {client.subscription_status}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">No subscription</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {JOURNEY_STAGES.find(s => s.key === client.journey_stage) && (
                            <Badge
                              className={cn(
                                'text-white',
                                JOURNEY_STAGES.find(s => s.key === client.journey_stage)?.color
                              )}
                            >
                              {JOURNEY_STAGES.find(s => s.key === client.journey_stage)?.label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.estimated_commission ? (
                            <div className="text-sm font-medium text-purple-600">
                              {formatCurrency(client.estimated_commission, 'USD')}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({(client.commission_rate_bps || 0) / 100}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {client.deal_id && client.has_termsheet && (
                              <Button variant="ghost" size="icon" asChild title="View Termsheet">
                                <Link href={`/versotech_main/opportunities/${client.deal_id}`}>
                                  <FileText className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {client.deal_id && client.has_dataroom_access && (
                              <Button variant="ghost" size="icon" asChild title="Access Dataroom">
                                <Link href={`/versotech_main/opportunities/${client.deal_id}?tab=dataroom${client.investor_id ? `&client_investor_id=${client.investor_id}` : ''}`}>
                                  <FolderOpen className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bucket View */}
      {viewMode === 'buckets' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {JOURNEY_STAGES.map((stage) => {
            const StageIcon = stage.icon
            const stageClients = clientsByStage[stage.key] || []
            const stageValue = stageClients.reduce((sum, c) => sum + (c.subscription_amount || 0), 0)

            return (
              <Card key={stage.key} className="flex flex-col">
                <CardHeader className={cn('pb-2', stage.color, 'text-white rounded-t-lg')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StageIcon className="h-4 w-4" />
                      <CardTitle className="text-sm">{stage.label}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {stageClients.length}
                    </Badge>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-xs text-white/80 mt-1">
                      {formatCurrency(stageValue, 'USD')}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 pt-4 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
                  {stageClients.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No clients in this stage
                    </p>
                  ) : (
                    stageClients.map((client) => (
                      <div
                        key={client.id}
                        className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">{client.client_name}</span>
                        </div>
                        {client.deal_name && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {client.deal_name}
                          </p>
                        )}
                        {client.subscription_amount ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">
                              {formatCurrency(client.subscription_amount, 'USD')}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                STATUS_STYLES[client.subscription_status || ''] || ''
                              )}
                            >
                              {client.subscription_status}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No subscription</span>
                        )}
                        {client.deal_id && (
                          <div className="flex gap-1 mt-2">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                              <Link href={`/versotech_main/opportunities/${client.deal_id}`}>
                                <FileText className="h-3 w-3 mr-1" />
                                Deal
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                              <Link href={`/versotech_main/opportunities/${client.deal_id}?tab=dataroom${client.investor_id ? `&client_investor_id=${client.investor_id}` : ''}`}>
                                <FolderOpen className="h-3 w-3 mr-1" />
                                Files
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
