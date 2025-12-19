'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  deal_name: string | null
  deal_id: string | null
  investor_id: string | null
  subscription_amount: number | null
  subscription_status: string | null
  subscription_date: string | null
}

type CommercialPartnerInfo = {
  id: string
  name: string
  legal_name: string | null
  type: string | null
  status: string
  logo_url: string | null
}

type Summary = {
  totalClients: number
  activeClients: number
  totalTransactions: number
  totalValue: number
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  funded: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
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

export default function ClientTransactionsPage() {
  const [partnerInfo, setPartnerInfo] = useState<CommercialPartnerInfo | null>(null)
  const [clients, setClients] = useState<ClientTransaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalClients: 0,
    activeClients: 0,
    totalTransactions: 0,
    totalValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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
              name
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
            .select('investor_id, commitment_amount, status, subscription_date')
            .in('investor_id', investorIds)

          if (subs) {
            subs.forEach((s: any) => {
              if (!subscriptionsMap[s.investor_id]) {
                subscriptionsMap[s.investor_id] = s
              }
            })
          }
        }

        processClients(clientsData || [], subscriptionsMap)
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
            name
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
      processClients(clientsData || [], {})
    }

    function processClients(data: any[], subscriptionsMap: Record<string, any>) {
      const processed: ClientTransaction[] = data.map((client) => {
        const subscription = client.client_investor_id
          ? subscriptionsMap[client.client_investor_id]
          : null

        return {
          id: client.id,
          client_name: client.client_name || 'Unknown Client',
          client_email: client.client_email,
          client_type: client.client_type,
          is_active: client.is_active ?? true,
          created_at: client.created_at,
          deal_name: client.deal?.name || null,
          deal_id: client.created_for_deal_id,
          investor_id: client.client_investor_id,
          subscription_amount: subscription?.commitment_amount || null,
          subscription_status: subscription?.status || null,
          subscription_date: subscription?.subscription_date || null,
        }
      })

      setClients(processed)

      const active = processed.filter(c => c.is_active).length
      const withSubscription = processed.filter(c => c.subscription_amount).length
      const totalValue = processed.reduce((sum, c) => sum + (c.subscription_amount || 0), 0)

      setSummary({
        totalClients: processed.length,
        activeClients: active,
        totalTransactions: withSubscription,
        totalValue,
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Clients with investments
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} found
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
              {partnerInfo && clients.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Start introducing clients to see them here
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Status</TableHead>
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
                        <Badge variant="secondary" className="capitalize">
                          {CLIENT_TYPE_LABELS[client.client_type || ''] || client.client_type || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.deal_name ? (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{client.deal_name}</span>
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
                        <div className="text-sm">
                          {formatDate(client.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            client.is_active
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          )}
                        >
                          {client.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
