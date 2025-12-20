'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Download,
  Plus,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-react'
import { SubscriptionsDataTablePaginated } from './subscriptions-data-table-paginated'
import { subscriptionColumns } from './subscription-columns'
import { FilterPopup, SimpleFilters } from './filter-popup'
import { NewSubscriptionDialog } from '@/components/subscriptions/new-subscription-dialog'
import { toast } from 'sonner'

interface StyledSubscriptionsPageProps {
  basePath?: string
}

export function StyledSubscriptionsPage({ basePath = '/versotech/staff' }: StyledSubscriptionsPageProps) {
  const router = useRouter()

  // Core data
  const [rawData, setRawData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // UI state
  const [quickSearch, setQuickSearch] = useState('')
  const [filters, setFilters] = useState<SimpleFilters>({})
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Reference data
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>([])
  const [investors, setInvestors] = useState<Array<{ id: string; legal_name: string }>>([])

  // Dialogs
  const [showNewDialog, setShowNewDialog] = useState(false)

  // Load data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)

      const [subsResponse, vehiclesResponse, investorsResponse] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/vehicles'),
        fetch('/api/investors')
      ])

      if (!subsResponse.ok) throw new Error('Failed to load subscriptions')

      const subsData = await subsResponse.json()
      setRawData(subsData.subscriptions || [])

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json()
        setVehicles(vehiclesData.vehicles || [])
      }

      if (investorsResponse.ok) {
        const investorsData = await investorsResponse.json()
        setInvestors(investorsData.investors || [])
      }

    } catch (err) {
      console.error('Load error:', err)
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/subscriptions')
      if (!response.ok) throw new Error('Failed to refresh')
      const data = await response.json()
      setRawData(data.subscriptions || [])
      setSelectedIds([])
      toast.success('Data refreshed')
    } catch (err) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  // Apply filters
  const filteredSubscriptions = useMemo(() => {
    if (!rawData || rawData.length === 0) return []

    let result = rawData

    // Quick search
    if (quickSearch) {
      const search = quickSearch.toLowerCase()
      result = result.filter(sub => {
        const searchable = [
          sub.subscription_number?.toString(),
          sub.investor?.legal_name,
          sub.vehicle?.name,
        ].filter(Boolean).join(' ').toLowerCase()
        return searchable.includes(search)
      })
    }

    // Apply popup filters
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(sub => {
        const searchable = [
          sub.subscription_number?.toString(),
          sub.investor?.legal_name,
          sub.vehicle?.name,
          sub.opportunity_name,
        ].filter(Boolean).join(' ').toLowerCase()
        return searchable.includes(search)
      })
    }

    if (filters.statuses?.length) {
      result = result.filter(sub => filters.statuses!.includes(sub.status))
    }

    if (filters.commitmentMin) {
      result = result.filter(sub => sub.commitment >= filters.commitmentMin!)
    }

    if (filters.commitmentMax) {
      result = result.filter(sub => sub.commitment <= filters.commitmentMax!)
    }

    return result
  }, [rawData, quickSearch, filters])

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredSubscriptions.length
    const totalCommitment = filteredSubscriptions.reduce((sum, sub) => sum + (sub.commitment || 0), 0)
    const totalFunded = filteredSubscriptions.reduce((sum, sub) => sum + (sub.funded_amount || 0), 0)
    const activeCount = filteredSubscriptions.filter(s => s.status === 'active').length

    return { total, totalCommitment, totalFunded, activeCount }
  }, [filteredSubscriptions])

  const handleExport = async () => {
    try {
      const ids = selectedIds.length > 0 ? selectedIds : filteredSubscriptions.map(s => s.id)
      toast.info(`Exporting ${ids.length} subscriptions...`)
    } catch (error) {
      toast.error('Failed to export')
    }
  }

  const activeFilterCount = [
    filters.search,
    filters.statuses?.length,
    filters.commitmentMin,
    filters.commitmentMax,
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header - Matches Investors Page Exactly */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all investment subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-transparent text-white border-white hover:bg-white hover:text-black"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`${basePath}/subscriptions/vehicle-summary`)}
            className="bg-transparent text-white border-white hover:bg-white hover:text-black"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Summary
          </Button>
          <Button onClick={() => setShowNewDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Stats Cards - Exact Same Layout as Investors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">All subscriptions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.activeCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">Currently active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">${(stats.totalCommitment / 1e6).toFixed(1)}M</div>
            <div className="text-sm text-muted-foreground mt-1">Committed capital</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Funded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">${(stats.totalFunded / 1e6).toFixed(1)}M</div>
            <div className="text-sm text-muted-foreground mt-1">Capital deployed</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar - Same Style as Investors */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by number, investor, or vehicle..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilterPopup(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table - Same Card Style as Investors */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>
            Comprehensive subscription list with sortable columns and bulk actions
            {selectedIds.length > 0 && (
              <span className="text-muted-foreground text-sm ml-2">
                ({selectedIds.length} selected)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsDataTablePaginated
            data={filteredSubscriptions}
            columns={subscriptionColumns}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            pageSize={50}
          />
        </CardContent>
      </Card>

      {/* Filter Popup */}
      <FilterPopup
        open={showFilterPopup}
        onOpenChange={setShowFilterPopup}
        filters={filters}
        onApply={setFilters}
        vehicles={vehicles}
      />

      {/* New Subscription Dialog */}
      <NewSubscriptionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        investors={investors}
        vehicles={vehicles}
        onSuccess={handleRefresh}
      />
    </div>
  )
}