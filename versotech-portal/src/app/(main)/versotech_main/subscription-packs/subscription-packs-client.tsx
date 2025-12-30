'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileText,
  Search,
  Loader2,
  Users,
  Briefcase,
  X,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDate, formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'

// Updated type to support both lawyer and arranger personas
type EntityInfo = {
  id: string
  firm_name: string | null
  display_name: string | null
  specializations: string[] | null
  is_active: boolean
  entity_type: 'lawyer' | 'arranger'
}

type SignedSubscription = {
  id: string
  deal_id: string
  investor_id: string
  status: string
  commitment: number
  currency: string
  funded_amount: number
  committed_at: string | null
  funded_at: string | null
  deal_name: string
  investor_name: string
  document_id: string | null
  document_file_key: string | null
  document_file_name: string | null
  document_mime_type: string | null
  document_file_size: number | null
  document_type: string | null
}

type SubscriptionPacksClientProps = {
  entityInfo: EntityInfo | null
  subscriptions: SignedSubscription[]
}

const STATUS_STYLES: Record<string, string> = {
  committed: 'bg-blue-100 text-blue-800 border-blue-200',
  partially_funded: 'bg-amber-100 text-amber-800 border-amber-200',
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const STATUS_LABELS: Record<string, string> = {
  committed: 'Signed',
  partially_funded: 'Partially Funded',
  active: 'Fully Funded',
}

const STATUS_FILTERS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Signed (Awaiting Funding)', value: 'committed' },
  { label: 'Partially Funded', value: 'partially_funded' },
  { label: 'Fully Funded', value: 'active' },
]

// Pagination constants
const ITEMS_PER_PAGE = 10

// Sortable columns configuration
type SortColumn = 'deal_name' | 'investor_name' | 'commitment' | 'funded_amount' | 'status' | 'committed_at'
type SortDirection = 'asc' | 'desc'

// Using shared formatCurrency utility from @/lib/format
// Note: The shared utility handles null/undefined values and defaults to 'USD'

export function SubscriptionPacksClient({ entityInfo, subscriptions }: SubscriptionPacksClientProps) {
  // Existing filter states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // NEW: Additional filter states for full implementation (User Story Row 69)
  const [investorFilter, setInvestorFilter] = useState('all')
  const [dealFilter, setDealFilter] = useState('all')
  const [dateRange, setDateRange] = useState<{
    startDate: string
    endDate: string
  }>({ startDate: '', endDate: '' })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('committed_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Document preview functionality (same as CEO/staff documents page)
  const {
    isOpen: isPreviewOpen,
    document: previewDocument,
    previewUrl,
    isLoading: isPreviewLoading,
    error: previewError,
    openPreview,
    closePreview,
    downloadDocument: downloadFromPreview,
  } = useDocumentViewer()

  // Compute unique investors and deals for dropdown options
  const filterOptions = useMemo(() => {
    const investors = new Map<string, string>()
    const deals = new Map<string, string>()

    subscriptions.forEach((sub) => {
      if (sub.investor_id && sub.investor_name) {
        investors.set(sub.investor_id, sub.investor_name)
      }
      if (sub.deal_id && sub.deal_name) {
        deals.set(sub.deal_id, sub.deal_name)
      }
    })

    return {
      investors: Array.from(investors.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      deals: Array.from(deals.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [subscriptions])

  // Calculate summary based on ALL subscriptions (not filtered) for context
  const totalSummary = useMemo(() => {
    const committed = subscriptions.filter(s => s.status === 'committed').length
    const partiallyFunded = subscriptions.filter(s => s.status === 'partially_funded').length
    const fullyFunded = subscriptions.filter(s => s.status === 'active').length

    const totalCommitment = subscriptions.reduce((sum, s) => sum + s.commitment, 0)
    const totalFunded = subscriptions.reduce((sum, s) => sum + s.funded_amount, 0)

    return {
      total: subscriptions.length,
      committed,
      partiallyFunded,
      fullyFunded,
      totalCommitment,
      totalFunded,
    }
  }, [subscriptions])

  // Updated filter logic with all filters + sorting
  const filteredSubscriptions = useMemo(() => {
    // First, filter
    const filtered = subscriptions.filter(subscription => {
      // Status filter
      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter

      // Search filter
      const matchesSearch = !search ||
        subscription.deal_name.toLowerCase().includes(search.toLowerCase()) ||
        subscription.investor_name.toLowerCase().includes(search.toLowerCase())

      // NEW: Investor filter
      const matchesInvestor = investorFilter === 'all' || subscription.investor_id === investorFilter

      // NEW: Deal/Opportunity filter
      const matchesDeal = dealFilter === 'all' || subscription.deal_id === dealFilter

      // NEW: Date range filter (using date-only comparison to avoid timezone issues)
      // Convert both to YYYY-MM-DD format for consistent comparison
      let matchesDateRange = true
      if (subscription.committed_at) {
        // Extract just the date portion from the ISO timestamp (YYYY-MM-DD)
        const subDateStr = subscription.committed_at.split('T')[0]

        if (dateRange.startDate) {
          // Compare date strings directly (lexicographic comparison works for YYYY-MM-DD)
          matchesDateRange = matchesDateRange && subDateStr >= dateRange.startDate
        }
        if (dateRange.endDate) {
          matchesDateRange = matchesDateRange && subDateStr <= dateRange.endDate
        }
      }

      return matchesStatus && matchesSearch && matchesInvestor && matchesDeal && matchesDateRange
    })

    // Then, sort
    return [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'deal_name':
          comparison = a.deal_name.localeCompare(b.deal_name)
          break
        case 'investor_name':
          comparison = a.investor_name.localeCompare(b.investor_name)
          break
        case 'commitment':
          comparison = a.commitment - b.commitment
          break
        case 'funded_amount':
          comparison = a.funded_amount - b.funded_amount
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'committed_at':
          const dateA = a.committed_at ? new Date(a.committed_at).getTime() : 0
          const dateB = b.committed_at ? new Date(b.committed_at).getTime() : 0
          comparison = dateA - dateB
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [search, statusFilter, investorFilter, dealFilter, dateRange, subscriptions, sortColumn, sortDirection])

  // Calculate filtered summary for context
  const filteredSummary = useMemo(() => {
    const committed = filteredSubscriptions.filter(s => s.status === 'committed').length
    const partiallyFunded = filteredSubscriptions.filter(s => s.status === 'partially_funded').length
    const fullyFunded = filteredSubscriptions.filter(s => s.status === 'active').length

    return {
      total: filteredSubscriptions.length,
      committed,
      partiallyFunded,
      fullyFunded,
    }
  }, [filteredSubscriptions])

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredSubscriptions.length)
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

  // Check if any advanced filters are active
  const hasActiveFilters = investorFilter !== 'all' || dealFilter !== 'all' || dateRange.startDate || dateRange.endDate || search || statusFilter !== 'all'

  // Reset page to 1 when filters change
  const handleFilterChange = <T,>(setter: (value: T) => void, value: T) => {
    setter(value)
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setInvestorFilter('all')
    setDealFilter('all')
    setDateRange({ startDate: '', endDate: '' })
    setCurrentPage(1)
  }

  // Handle column sort toggle
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to descending for dates/amounts, ascending for text
      setSortColumn(column)
      setSortDirection(['commitment', 'funded_amount', 'committed_at'].includes(column) ? 'desc' : 'asc')
    }
    setCurrentPage(1) // Reset to first page on sort change
  }

  // Get sort indicator for column header
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground/50" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-4 w-4" />
      : <ArrowDown className="ml-1 h-4 w-4" />
  }

  const handleDownloadPdf = async (subscription: SignedSubscription) => {
    if (!subscription.document_file_key || !subscription.document_id) {
      toast.error('No signed document available for download')
      return
    }

    setDownloadingId(subscription.id)
    try {
      // First, get the signed URL from the API
      const response = await fetch(`/api/documents/${subscription.document_id}/download`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get download link')
      }

      // Fetch the actual file from the signed URL
      const fileResponse = await fetch(data.url)
      if (!fileResponse.ok) {
        throw new Error('Failed to download document file')
      }

      const blob = await fileResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = subscription.document_file_name || data.fileName || `subscription-pack-${subscription.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to download document')
    } finally {
      setDownloadingId(null)
    }
  }

  // Handle document preview (same pattern as CEO/staff documents page)
  const handlePreview = (subscription: SignedSubscription) => {
    if (!subscription.document_id) {
      toast.error('No document available for preview')
      return
    }

    // Check if it's an office document (can't be previewed)
    const fileName = subscription.document_file_name || ''
    const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
    const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'odp']

    if (officeExtensions.includes(fileExt)) {
      toast.info('Office documents cannot be previewed. Downloading instead...')
      handleDownloadPdf(subscription)
      return
    }

    // Create DocumentReference for the preview hook
    openPreview({
      id: subscription.document_id,
      file_name: subscription.document_file_name,
      name: subscription.document_file_name,
      mime_type: subscription.document_mime_type,
      file_size_bytes: subscription.document_file_size,
      type: subscription.document_type,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Dynamic header based on entity type */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signed Subscription Packs</h1>
          <p className="text-muted-foreground mt-1">
            {entityInfo?.entity_type === 'arranger'
              ? `Subscription packs for mandates managed by ${entityInfo?.display_name || 'your entity'}`
              : entityInfo
              ? `Subscription packs for deals assigned to ${entityInfo?.display_name || entityInfo?.firm_name || 'your firm'}`
              : 'View signed subscription packs for your deals'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Entity type badge */}
          {entityInfo?.entity_type && (
            <Badge variant="outline" className="capitalize">
              {entityInfo.entity_type}
            </Badge>
          )}
          {/* Specializations for lawyers */}
          {entityInfo?.entity_type === 'lawyer' && entityInfo?.specializations?.length ? (
            entityInfo.specializations.slice(0, 2).map((spec, idx) => (
              <Badge key={idx} variant="outline" className="capitalize">
                {spec}
              </Badge>
            ))
          ) : null}
        </div>
      </div>

      {/* Summary Cards - Show filtered counts with total context when filters are active */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Signed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasActiveFilters ? (
                <span>{filteredSummary.total} <span className="text-base font-normal text-muted-foreground">/ {totalSummary.total}</span></span>
              ) : (
                totalSummary.total
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActiveFilters ? 'Matching filters' : 'Subscription packs signed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Awaiting Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {hasActiveFilters ? (
                <span>{filteredSummary.committed} <span className="text-base font-normal text-muted-foreground">/ {totalSummary.committed}</span></span>
              ) : (
                totalSummary.committed
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Signed, pending escrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Partially Funded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {hasActiveFilters ? (
                <span>{filteredSummary.partiallyFunded} <span className="text-base font-normal text-muted-foreground">/ {totalSummary.partiallyFunded}</span></span>
              ) : (
                totalSummary.partiallyFunded
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Partial escrow received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Fully Funded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {hasActiveFilters ? (
                <span>{filteredSummary.fullyFunded} <span className="text-base font-normal text-muted-foreground">/ {totalSummary.fullyFunded}</span></span>
              ) : (
                totalSummary.fullyFunded
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Complete funding received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          {/* Row 1: Search + Status */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by deal or investor name..."
                  value={search}
                  onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange(setStatusFilter, value)}>
              <SelectTrigger className="w-full md:w-56">
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

          {/* Row 2: Investor + Deal + Date Range (NEW - User Story Row 69) */}
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Investor Filter */}
            <div className="w-full lg:w-48">
              <label className="text-xs text-muted-foreground mb-1.5 block">Investor</label>
              <Select value={investorFilter} onValueChange={(value) => handleFilterChange(setInvestorFilter, value)}>
                <SelectTrigger>
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Investors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Investors</SelectItem>
                  {filterOptions.investors.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deal/Opportunity Filter */}
            <div className="w-full lg:w-48">
              <label className="text-xs text-muted-foreground mb-1.5 block">Opportunity</label>
              <Select value={dealFilter} onValueChange={(value) => handleFilterChange(setDealFilter, value)}>
                <SelectTrigger>
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Opportunities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Opportunities</SelectItem>
                  {filterOptions.deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id}>{deal.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row items-end gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, startDate: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="w-36"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                    setCurrentPage(1)
                  }}
                  className="w-36"
                />
              </div>
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Signed Subscriptions</CardTitle>
          <CardDescription>
            {filteredSubscriptions.length === 0
              ? 'No subscriptions found'
              : totalPages > 1
              ? `Showing ${startIndex + 1}-${endIndex} of ${filteredSubscriptions.length} subscriptions`
              : `${filteredSubscriptions.length} subscription${filteredSubscriptions.length !== 1 ? 's' : ''}`}
            {hasActiveFilters && filteredSubscriptions.length > 0 && ` (filtered from ${subscriptions.length} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="border border-dashed border-muted rounded-lg py-12 flex flex-col items-center justify-center text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'No subscriptions match your filters'
                  : 'No signed subscription packs yet'}
              </p>
              {hasActiveFilters && (
                <Button variant="link" size="sm" onClick={clearFilters}>
                  Clear filters to see all subscriptions
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('deal_name')}
                      >
                        <div className="flex items-center">
                          Deal
                          <SortIndicator column="deal_name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('investor_name')}
                      >
                        <div className="flex items-center">
                          Investor
                          <SortIndicator column="investor_name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('commitment')}
                      >
                        <div className="flex items-center">
                          Commitment
                          <SortIndicator column="commitment" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none min-w-[140px]"
                        onClick={() => handleSort('funded_amount')}
                      >
                        <div className="flex items-center">
                          Funded
                          <SortIndicator column="funded_amount" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIndicator column="status" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort('committed_at')}
                      >
                        <div className="flex items-center">
                          Signed Date
                          <SortIndicator column="committed_at" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubscriptions.map((subscription) => {
                      const fundingPercentage = subscription.commitment > 0
                        ? Math.round((subscription.funded_amount / subscription.commitment) * 100)
                        : 0

                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">{subscription.deal_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{subscription.investor_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(subscription.commitment, subscription.currency)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  {formatCurrency(subscription.funded_amount, subscription.currency)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {fundingPercentage}%
                                </span>
                              </div>
                              <Progress
                                value={fundingPercentage}
                                className="h-1.5"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('capitalize', STATUS_STYLES[subscription.status] || 'bg-gray-100 text-gray-800 border-gray-200')}
                            >
                              {STATUS_LABELS[subscription.status] || subscription.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {subscription.committed_at ? (
                              <div className="text-sm">
                                {formatDate(subscription.committed_at)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {subscription.document_file_key ? (
                              <div className="flex items-center justify-end gap-2">
                                {/* Preview Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreview(subscription)}
                                  title="Preview document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {/* Download Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPdf(subscription)}
                                  disabled={downloadingId === subscription.id}
                                  title="Download PDF"
                                >
                                  {downloadingId === subscription.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4 mr-1" />
                                      PDF
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No document</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{endIndex} of {filteredSubscriptions.length} subscriptions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
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
                            className="w-8 h-8 p-0"
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

      {/* Document Preview Modal */}
      <DocumentViewerFullscreen
        isOpen={isPreviewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={isPreviewLoading}
        error={previewError}
        onClose={closePreview}
        onDownload={downloadFromPreview}
      />
    </div>
  )
}
