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
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const statusColors = {
  draft: 'bg-muted dark:bg-white/10 text-muted-foreground dark:text-foreground border border-border',
  open: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-400/30',
  allocation_pending: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-200 border border-amber-300 dark:border-amber-400/30',
  closed: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 border border-blue-300 dark:border-blue-400/30',
  cancelled: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-400/30'
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
  basePath?: string // Base path for links (defaults to /versotech/staff)
}

const ITEMS_PER_PAGE = 10

export function DealsListClient({ deals, summary, basePath = '/versotech/staff' }: DealsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDeals = filteredDeals.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-6 text-foreground">
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
            <Link href={`${basePath}/deals/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href={`${basePath}/entities`}>
              <Building2 className="h-4 w-4" />
              Manage Entities
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-border bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deals
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 dark:text-emerald-200">{summary.open}</span> open
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-muted/50">
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

        <Card className="border border-border bg-muted/50">
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

        <Card className="border border-border bg-muted/50">
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
      <Card className="border border-border bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals, entities, companies..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => handleFilterChange(setStatusFilter, v)}>
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
            <Select value={typeFilter} onValueChange={(v) => handleFilterChange(setTypeFilter, v)}>
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
            <Select value={sortBy} onValueChange={(v) => handleFilterChange(setSortBy, v)}>
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
      <Card className="border border-border bg-muted/50">
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
                  <Link href={`${basePath}/deals/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Deal
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="border border-border rounded-lg p-4 sm:p-5 bg-muted/50 hover:bg-muted transition-colors"
                >
                  {/* Deal Header Row - stacks on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Link
                        href={`${basePath}/deals/${deal.id}`}
                        className="text-lg font-semibold text-sky-600 dark:text-sky-200 hover:text-sky-700 dark:hover:text-sky-100 truncate"
                      >
                        {deal.name}
                      </Link>
                      <Badge className={statusColors[deal.status as keyof typeof statusColors]}>
                        {deal.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground bg-muted/50">
                        {dealTypeLabels[deal.deal_type as keyof typeof dealTypeLabels]}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-border text-foreground hover:bg-muted whitespace-nowrap flex-shrink-0"
                    >
                      <Link href={`${basePath}/deals/${deal.id}`}>View Details</Link>
                    </Button>
                  </div>

            {/* Entity Info Row */}
            {deal.vehicles && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span>{deal.vehicles.name} ({deal.vehicles.type})</span>
                    </div>
                  )}

                  {/* Metadata Row - Aligned Icons (tighter gaps on mobile) */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{deal.deal_memberships.length} participants</span>
                    </div>

                    {(deal.fee_structure?.price_per_share != null || deal.fee_structure?.price_per_share_text || deal.offer_unit_price) && (
                      <div className="flex items-center gap-1.5">
                        <CircleDollarSign className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {deal.fee_structure?.price_per_share != null
                            ? `${deal.currency || 'USD'} ${deal.fee_structure.price_per_share.toFixed(2)}/unit`
                            : deal.fee_structure?.price_per_share_text
                              ? `${deal.currency || 'USD'} ${deal.fee_structure.price_per_share_text}/unit`
                              : `${deal.currency} ${deal.offer_unit_price.toFixed(2)}/unit`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{new Date(deal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredDeals.length)} of {filteredDeals.length} deals
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'border-border text-foreground hover:bg-muted'}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border bg-muted/50">
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
              className="w-full border-border text-foreground hover:bg-muted"
              asChild
            >
              <Link href={`${basePath}/deals/new`}>Set Up New Deal</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border bg-muted/50">
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
              className="w-full border-border text-foreground hover:bg-muted"
              asChild
            >
              <Link href={`${basePath}/subscriptions`}>View Inventory</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Timer className="h-5 w-5 text-amber-200" />
              Approvals Queue
            </CardTitle>
            <CardDescription>Review pending commitments and allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Process investor commitments and subscriptions
            </p>
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted"
              asChild
            >
              <Link href={`${basePath}/approvals`}>Review Approvals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
