'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Plus, Table as TableIcon, List, LayoutGrid, Settings } from 'lucide-react'
import { SubscriptionsDataTable } from './subscriptions-data-table'
import { subscriptionColumns } from './subscription-columns'
import { AdvancedSubscriptionFilters, AdvancedSubscriptionFilters as FilterType } from '@/components/subscriptions/advanced-subscription-filters'
import { SubscriptionQuickStats } from '@/components/subscriptions/subscription-quick-stats'
import { SubscriptionBulkActions } from '@/components/subscriptions/subscription-bulk-actions'
import { SubscriptionColumnToggle, ColumnConfig } from '@/components/subscriptions/subscription-column-toggle'
import { SubscriptionListView } from '@/components/subscriptions/subscription-list-view'
import { SubscriptionKanbanView } from '@/components/subscriptions/subscription-kanban-view'
import { NewSubscriptionDialog } from '@/components/subscriptions/new-subscription-dialog'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

type SubscriptionData = {
  subscriptions: any[]
  summary: {
    total: number
    by_status: Record<string, number>
    by_currency: Record<string, number>
    total_commitment: number
    overdue_count: number
    overdue_amount: number
  }
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'select', label: 'Select', visible: true, required: true },
  { id: 'subscription_number', label: 'Sub #', visible: true, required: true },
  { id: 'investor', label: 'Investor', visible: true },
  { id: 'vehicle', label: 'Vehicle', visible: true },
  { id: 'commitment', label: 'Commitment', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'committed_at', label: 'Committed Date', visible: true },
  { id: 'created_at', label: 'Created Date', visible: false },
  { id: 'share_structure', label: 'Shares', visible: false },
  { id: 'fees', label: 'Fees', visible: true },
  { id: 'funded_amount', label: 'Funded', visible: true },
  { id: 'outstanding_amount', label: 'Outstanding', visible: true },
  { id: 'current_nav', label: 'NAV', visible: true },
  { id: 'opportunity_name', label: 'Opportunity', visible: false },
  { id: 'contract_date', label: 'Contract Date', visible: false },
  { id: 'performance_fees', label: 'Performance Fees', visible: false },
  { id: 'actions', label: 'Actions', visible: true, required: true },
]

export function EnhancedSubscriptionsPage() {
  // State management
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'table' | 'list' | 'kanban'>('table')
  const [filters, setFilters] = useState<FilterType>({})
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>([])
  const [investors, setInvestors] = useState<Array<{ id: string; legal_name: string }>>([])
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch data
  useEffect(() => {
    fetchSubscriptions()
    fetchVehicles()
    fetchInvestors()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscriptions')
      if (!response.ok) throw new Error(`Failed to fetch subscriptions (${response.status})`)

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions')
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const result = await response.json()
        setVehicles(result.vehicles || [])
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
    }
  }

  const fetchInvestors = async () => {
    try {
      const response = await fetch('/api/investors')
      if (response.ok) {
        const result = await response.json()
        setInvestors(result.investors || [])
      }
    } catch (err) {
      console.error('Failed to fetch investors:', err)
    }
  }

  // Apply advanced filters
  const applyFilters = (subscriptions: any[]) => {
    return subscriptions.filter(sub => {
      // Global search
      if (filters.globalSearch) {
        const search = filters.globalSearch.toLowerCase()
        const matches = [
          sub.investor?.legal_name,
          sub.vehicle?.name,
          sub.opportunity_name,
          sub.subscription_number?.toString(),
        ].some(field => field?.toLowerCase().includes(search))
        if (!matches) return false
      }

      // Status (multi-select)
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(sub.status)) return false
      }

      // Vehicles (multi-select)
      if (filters.vehicleIds && filters.vehicleIds.length > 0) {
        if (!filters.vehicleIds.includes(sub.vehicle_id)) return false
      }

      // Investor Types (multi-select)
      if (filters.investorTypes && filters.investorTypes.length > 0) {
        if (!filters.investorTypes.includes(sub.investor?.type)) return false
      }

      // Currencies (multi-select)
      if (filters.currencies && filters.currencies.length > 0) {
        if (!filters.currencies.includes(sub.currency)) return false
      }

      // Commitment range
      if (filters.commitmentMin && sub.commitment < filters.commitmentMin) return false
      if (filters.commitmentMax && sub.commitment > filters.commitmentMax) return false

      // Funded range
      if (filters.fundedMin && sub.funded_amount < filters.fundedMin) return false
      if (filters.fundedMax && sub.funded_amount > filters.fundedMax) return false

      // NAV range
      if (filters.navMin && (sub.current_nav == null || sub.current_nav < filters.navMin)) return false
      if (filters.navMax && (sub.current_nav == null || sub.current_nav > filters.navMax)) return false

      // Date ranges
      if (filters.effectiveDateFrom && (!sub.effective_date || sub.effective_date < filters.effectiveDateFrom)) return false
      if (filters.effectiveDateTo && (!sub.effective_date || sub.effective_date > filters.effectiveDateTo)) return false

      if (filters.committedDateFrom && (!sub.committed_at || sub.committed_at < filters.committedDateFrom)) return false
      if (filters.committedDateTo && (!sub.committed_at || sub.committed_at > filters.committedDateTo)) return false

      if (filters.fundingDueFrom && (!sub.funding_due_at || sub.funding_due_at < filters.fundingDueFrom)) return false
      if (filters.fundingDueTo && (!sub.funding_due_at || sub.funding_due_at > filters.fundingDueTo)) return false

      // Boolean filters
      if (filters.hasPerformanceFees) {
        if (!sub.performance_fee_tier1_percent && !sub.performance_fee_tier2_percent) return false
      }

      if (filters.hasIntroducer) {
        if (!sub.introducer_id) return false
      }

      if (filters.hasOutstanding) {
        if (!sub.outstanding_amount || sub.outstanding_amount <= 0) return false
      }

      if (filters.isOverdue) {
        if (!sub.funding_due_at || new Date(sub.funding_due_at) >= new Date() || sub.status === 'closed') return false
      }

      return true
    })
  }

  const filteredSubscriptions = data?.subscriptions ? applyFilters(data.subscriptions) : []
  const selectedSubscriptions = filteredSubscriptions.filter(sub => selectedIds.includes(sub.id))

  // Bulk operations
  const handleBulkUpdate = async (ids: string[], updates: Record<string, any>) => {
    try {
      const response = await fetch('/api/subscriptions/bulk-update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_ids: ids, updates }),
      })

      if (!response.ok) throw new Error('Failed to update subscriptions')

      toast.success(`Updated ${ids.length} subscription(s)`)
      await fetchSubscriptions()
    } catch (error) {
      console.error('Bulk update error:', error)
      throw error
    }
  }

  // Kanban status change handler
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      await fetchSubscriptions()
    } catch (error) {
      console.error('Status change error:', error)
      throw error
    }
  }

  const handleExport = async (ids?: string[]) => {
    try {
      setIsExporting(true)
      const exportIds = ids || filteredSubscriptions.map(sub => sub.id)

      const response = await fetch('/api/subscriptions/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_ids: exportIds,
          format: 'csv',
        }),
      })

      if (!response.ok) throw new Error('Failed to export')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Exported ${exportIds.length} subscription(s)`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export subscriptions')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="pt-6">
            <p className="text-red-300">{error}</p>
            <Button onClick={fetchSubscriptions} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
            <p className="text-gray-400 mt-1">
              Manage and track all investment subscriptions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport()}
              disabled={isExporting || filteredSubscriptions.length === 0}
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button
              onClick={() => setShowNewDialog(true)}
              className="bg-white text-black hover:bg-gray-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Subscription
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <SubscriptionQuickStats
          subscriptions={filteredSubscriptions}
          selectedCount={selectedIds.length}
        />

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <SubscriptionBulkActions
            selectedIds={selectedIds}
            selectedSubscriptions={selectedSubscriptions}
            onClearSelection={() => setSelectedIds([])}
            onBulkUpdate={handleBulkUpdate}
          />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AdvancedSubscriptionFilters
              filters={filters}
              onFiltersChange={setFilters}
              vehicles={vehicles}
              investors={investors}
            />
          </div>

          {/* Table & Views */}
          <div className="lg:col-span-3 space-y-4">
            {/* View Controls */}
            <div className="flex items-center justify-between">
              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList className="bg-gray-900">
                  <TabsTrigger value="table" className="data-[state=active]:bg-gray-800">
                    <TableIcon className="h-4 w-4 mr-2" />
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="list" className="data-[state=active]:bg-gray-800">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="data-[state=active]:bg-gray-800">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Kanban
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {filteredSubscriptions.length} of {data?.subscriptions.length || 0} subscriptions
                </span>
                <SubscriptionColumnToggle
                  columns={columns}
                  onColumnsChange={setColumns}
                />
              </div>
            </div>

            {/* Table View */}
            {view === 'table' && (
              <Card className="bg-gray-900/70 border-gray-800">
                <CardContent className="p-0">
                  <SubscriptionsDataTable
                    data={filteredSubscriptions}
                    columns={subscriptionColumns}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                  />
                </CardContent>
              </Card>
            )}

            {/* List View */}
            {view === 'list' && (
              <SubscriptionListView subscriptions={filteredSubscriptions} />
            )}

            {/* Kanban View */}
            {view === 'kanban' && (
              <SubscriptionKanbanView
                subscriptions={filteredSubscriptions}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* New Subscription Dialog */}
      <NewSubscriptionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        investors={investors}
        vehicles={vehicles}
        onSuccess={fetchSubscriptions}
      />
    </div>
  )
}
