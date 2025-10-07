'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import {
  Plus,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Building2,
  Handshake,
  AlertCircle,
  CheckCircle2,
  Timer,
  CircleDollarSign,
  Search,
  Filter
} from 'lucide-react'

const statusColors = {
  draft: 'bg-white/10 text-foreground border border-white/20',
  open: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  allocation_pending: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  closed: 'bg-blue-500/20 text-blue-200 border border-blue-400/30',
  cancelled: 'bg-red-500/20 text-red-200 border border-red-400/30'
}

const dealTypeLabels = {
  equity_secondary: 'Secondary',
  equity_primary: 'Primary',
  credit_trade_finance: 'Credit/Trade',
  other: 'Other'
}

interface DealsListClientProps {
  deals: any[]
  summary: {
    total: number
    open: number
    draft: number
    closed: number
    totalValue: number
  }
}

export function DealsListClient({ deals, summary }: DealsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let filtered = [...deals]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (deal) =>
          deal.name?.toLowerCase().includes(query) ||
          deal.company_name?.toLowerCase().includes(query) ||
          deal.vehicles?.name?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((deal) => deal.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((deal) => deal.deal_type === typeFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'target_amount':
          return (b.target_amount || 0) - (a.target_amount || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [deals, searchQuery, statusFilter, typeFilter, sortBy])

  return (
    <div className="p-6 space-y-6 text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deal Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage deal-scoped opportunities, inventory, and investor access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/versotech/staff/deals/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/versotech/staff/entities">
              <Building2 className="h-4 w-4" />
              Manage Entities
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deals
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-200">{summary.open}</span> open
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft Deals
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.draft}</div>
            <p className="text-xs text-muted-foreground">Pending setup</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Pipeline
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.open}</div>
            <p className="text-xs text-muted-foreground">Accepting investors</p>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-sky-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.closed}</div>
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals, entities, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="allocation_pending">Allocation Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="equity_secondary">Secondary</SelectItem>
                <SelectItem value="equity_primary">Primary</SelectItem>
                <SelectItem value="credit_trade_finance">Credit/Trade</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="target_amount">Target Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deals List */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground">
            Deals ({filteredDeals.length})
          </CardTitle>
          <CardDescription>
            Manage opportunities with deal-scoped collaboration and inventory tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDeals.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {deals.length === 0 ? 'No deals yet' : 'No deals match your filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {deals.length === 0
                  ? 'Get started by creating your first deal opportunity'
                  : 'Try adjusting your filters or search query'}
              </p>
              {deals.length === 0 && (
                <Button asChild>
                  <Link href="/versotech/staff/deals/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Deal
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="border border-white/10 rounded-lg p-5 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {/* Deal Header Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Link
                        href={`/versotech/staff/deals/${deal.id}`}
                        className="text-lg font-semibold text-sky-200 hover:text-sky-100 truncate"
                      >
                        {deal.name}
                      </Link>
                      <Badge className={statusColors[deal.status as keyof typeof statusColors]}>
                        {deal.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-muted-foreground bg-white/5">
                        {dealTypeLabels[deal.deal_type as keyof typeof dealTypeLabels]}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-white/20 text-foreground hover:bg-white/10 whitespace-nowrap flex-shrink-0"
                    >
                      <Link href={`/versotech/staff/deals/${deal.id}`}>View Details</Link>
                    </Button>
                  </div>

            {/* Entity Info Row */}
            {deal.vehicles && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span>{deal.vehicles.name} ({deal.vehicles.type})</span>
                    </div>
                  )}

                  {/* Metadata Row - Aligned Icons */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{deal.deal_memberships.length} participants</span>
                    </div>

                    {deal.offer_unit_price && (
                      <div className="flex items-center gap-1.5">
                        <CircleDollarSign className="h-4 w-4 flex-shrink-0" />
                        <span>{deal.currency} {deal.offer_unit_price.toFixed(2)}/unit</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Handshake className="h-5 w-5 text-emerald-200" />
              Deal Setup
            </CardTitle>
            <CardDescription>Create and configure new investment opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-white/20 text-foreground hover:bg-white/10"
              asChild
            >
              <Link href="/versotech/staff/deals/new">Set Up New Deal</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <BarChart3 className="h-5 w-5 text-sky-200" />
              Inventory Management
            </CardTitle>
            <CardDescription>Manage share lots and allocation tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Track available units across all active deals
            </p>
            <Button
              variant="outline"
              className="w-full border-white/20 text-foreground hover:bg-white/10"
            >
              View Inventory
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Timer className="h-5 w-5 text-amber-200" />
              Approvals Queue
            </CardTitle>
            <CardDescription>Review pending commitments and allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Process investor commitments and reservations
            </p>
            <Button
              variant="outline"
              className="w-full border-white/20 text-foreground hover:bg-white/10"
              asChild
            >
              <Link href="/versotech/staff/approvals">Review Approvals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
