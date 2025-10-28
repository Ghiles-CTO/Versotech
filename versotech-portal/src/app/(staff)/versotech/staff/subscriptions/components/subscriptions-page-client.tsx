'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Plus, Table as TableIcon, List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react'
import { SubscriptionHealthCards } from './subscription-health-cards'
import { SubscriptionsDataTable } from './subscriptions-data-table'
import { subscriptionColumns } from './subscription-columns'
import { SubscriptionListView } from '@/components/subscriptions/subscription-list-view'
import { SubscriptionKanbanView } from '@/components/subscriptions/subscription-kanban-view'
import { SubscriptionFiltersComponent, SubscriptionFilters } from '@/components/subscriptions/subscription-filters'
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

export function SubscriptionsPageClient() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'table' | 'list' | 'kanban'>('table')
  const [filters, setFilters] = useState<SubscriptionFilters>({})
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>([])
  const [investors, setInvestors] = useState<Array<{ id: string; legal_name: string }>>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [showNewSubscriptionDialog, setShowNewSubscriptionDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscriptions')

      if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions (${response.status})`)
      }

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

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Get filtered subscription IDs
      const subscriptionIds = filteredSubscriptions.map(sub => sub.id)

      const response = await fetch('/api/subscriptions/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_ids: subscriptionIds,
          format: 'csv', // Default to CSV
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob from the response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Exported ${filteredSubscriptions.length} subscriptions`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export subscriptions')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
    fetchVehicles()
    fetchInvestors()
  }, [])

  const handleBulkUpdate = async (ids: string[], updates: Record<string, any>) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_ids: ids,
          updates,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Bulk update failed')
      }

      await fetchSubscriptions()
    } catch (error) {
      console.error('Bulk update error:', error)
      throw error
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await handleBulkUpdate([id], { status: newStatus })
  }

  const getFilteredSubscriptions = () => {
    if (!data?.subscriptions) return []

    return data.subscriptions.filter((sub) => {
      if (filters.status && sub.status !== filters.status) return false
      if (filters.vehicle && sub.vehicle_id !== filters.vehicle) return false
      if (filters.investorType && sub.investor?.type !== filters.investorType) return false
      if (filters.minCommitment && sub.commitment < filters.minCommitment) return false
      if (filters.maxCommitment && sub.commitment > filters.maxCommitment) return false
      if (filters.dateFrom && sub.effective_date && sub.effective_date < filters.dateFrom) return false
      if (filters.dateTo && sub.effective_date && sub.effective_date > filters.dateTo) return false
      return true
    })
  }

  const filteredSubscriptions = getFilteredSubscriptions()
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)

  // Get paginated data
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 bg-gray-800" />
            <Skeleton className="h-4 w-96 bg-gray-800" />
          </div>
          <Skeleton className="h-10 w-40 bg-gray-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32 bg-gray-800" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2 bg-gray-800" />
                <Skeleton className="h-4 w-40 bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-gray-800" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full bg-gray-800" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
            <Button onClick={fetchSubscriptions} className="mt-4 bg-white text-black hover:bg-gray-200">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Subscription Management</h1>
          <p className="text-gray-400 mt-2 text-base">
            Manage all subscriptions across vehicles and investors
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || filteredSubscriptions.length === 0}
            className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export All'}
          </Button>
          <Button
            onClick={() => setShowNewSubscriptionDialog(true)}
            className="bg-white text-black hover:bg-gray-100 shadow-lg transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Health Cards */}
      <SubscriptionHealthCards summary={data.summary} />

      {/* View Switcher & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SubscriptionFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            vehicles={vehicles}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
            <div className="flex items-center justify-between mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <TabsList className="bg-gray-900 border border-gray-800 shadow-sm">
                <TabsTrigger value="table" className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 transition-all">
                  <TableIcon className="h-4 w-4 mr-2" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 transition-all">
                  <List className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
                <TabsTrigger value="kanban" className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-400 transition-all">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="text-sm font-medium text-gray-300">
                  {filteredSubscriptions.length} of {data.summary.total} subscriptions
                </div>
              </div>
            </div>

            <TabsContent value="table" className="mt-0">
              <Card className="bg-gray-900/70 border-gray-800 shadow-xl">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white text-lg">All Subscriptions</CardTitle>
                  <CardDescription className="text-gray-400">
                    Complete subscription list with sortable columns and bulk operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SubscriptionsDataTable
                    columns={subscriptionColumns}
                    data={paginatedSubscriptions}
                    onBulkUpdate={handleBulkUpdate}
                  />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
                      <div className="text-sm text-gray-400 font-medium">
                        Showing <span className="text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)}</span> of <span className="text-white">{filteredSubscriptions.length}</span> subscriptions
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 transition-all"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 7) {
                              pageNum = i + 1
                            } else if (currentPage <= 4) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 3) {
                              pageNum = totalPages - 6 + i
                            } else {
                              pageNum = currentPage - 3 + i
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={currentPage === pageNum
                                  ? "bg-white text-black hover:bg-gray-200 shadow-md font-bold"
                                  : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all"}
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
                          className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 transition-all"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <SubscriptionListView subscriptions={paginatedSubscriptions} />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 p-5 bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg">
                  <div className="text-sm text-gray-400 font-medium">
                    Showing <span className="text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)}</span> of <span className="text-white">{filteredSubscriptions.length}</span> subscriptions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 7) {
                          pageNum = i + 1
                        } else if (currentPage <= 4) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 3) {
                          pageNum = totalPages - 6 + i
                        } else {
                          pageNum = currentPage - 3 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum
                              ? "bg-white text-black hover:bg-gray-200 shadow-md font-bold"
                              : "bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all"}
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
                      className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 transition-all"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
              <SubscriptionKanbanView
                subscriptions={filteredSubscriptions}
                onStatusChange={handleStatusChange}
              />
              {/* Kanban shows all filtered subscriptions grouped by status - no pagination */}
              <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-400 text-center flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  Showing all {filteredSubscriptions.length} subscriptions grouped by status
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* New Subscription Dialog */}
      <NewSubscriptionDialog
        open={showNewSubscriptionDialog}
        onOpenChange={setShowNewSubscriptionDialog}
        onSuccess={fetchSubscriptions}
        vehicles={vehicles}
        investors={investors}
      />
    </div>
  )
}
