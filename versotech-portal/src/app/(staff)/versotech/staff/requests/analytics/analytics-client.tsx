"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AnalyticsData {
  summary: {
    total: number
    closed: number
    open: number
    in_progress: number
    overdue: number
    avg_completion_hours: number | null
  }
  byStatus: Array<{ status: string; count: number }>
  byPriority: Array<{ priority: string; count: number }>
  byCategory: Array<{ category: string; count: number }>
  byAssignee: Array<{ name: string; count: number }>
  topRequesters: Array<{ name: string; count: number }>
  timeSeries: Array<{ date: string; count: number }>
}

const statusLabels: Record<string, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  awaiting_info: 'Awaiting Info',
  ready: 'Ready',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

const priorityLabels: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  normal: 'Normal',
  low: 'Low',
}

const categoryLabels: Record<string, string> = {
  tax_doc: 'Tax Documents',
  analysis: 'Analysis',
  data_export: 'Data Export',
  presentation: 'Presentation',
  communication: 'Communication',
  cashflow: 'Cashflow',
  valuation: 'Valuation',
  other: 'Other',
}

export function RequestAnalyticsClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    loadAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/staff/requests/stats?days=${timeRange}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load analytics')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/versotech/staff/requests')}
                className="gap-2 text-white hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Requests
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-white">Request Analytics</h1>
            <p className="text-gray-400 mt-1">
              Performance metrics and insights for request management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAnalytics} disabled={isLoading} className="text-white border-white/20 hover:bg-white/10">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="border border-white/10 bg-white/5">
            <CardContent className="p-12 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Loading analytics...</p>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-white">{data.summary.total}</div>
                  <p className="text-xs text-gray-400 mt-1">In selected period</p>
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Closed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-green-400">{data.summary.closed}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {data.summary.total > 0
                      ? `${Math.round((data.summary.closed / data.summary.total) * 100)}%`
                      : '0%'}{' '}
                    completion rate
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Open</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-white">{data.summary.open}</div>
                  <p className="text-xs text-gray-400 mt-1">Awaiting assignment</p>
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-white">{data.summary.in_progress}</div>
                  <p className="text-xs text-gray-400 mt-1">Being worked on</p>
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-red-400">{data.summary.overdue}</div>
                  <p className="text-xs text-gray-400 mt-1">Past SLA deadline</p>
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-400">Avg. Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-white">
                    {data.summary.avg_completion_hours
                      ? `${Math.round(data.summary.avg_completion_hours)}h`
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">To complete</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="border border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Requests by Status</CardTitle>
                  <CardDescription className="text-gray-400">Distribution across workflow stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{statusLabels[item.status] || item.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(item.count / data.summary.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card className="border border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Requests by Priority</CardTitle>
                  <CardDescription className="text-gray-400">Urgency breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.byPriority.map((item) => (
                      <div key={item.priority} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              item.priority === 'urgent'
                                ? 'destructive'
                                : item.priority === 'high'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {priorityLabels[item.priority] || item.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.priority === 'urgent'
                                  ? 'bg-red-500'
                                  : item.priority === 'high'
                                  ? 'bg-orange-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${(item.count / data.summary.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card className="border border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Requests by Category</CardTitle>
                  <CardDescription className="text-gray-400">Request types breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.byCategory.slice(0, 8).map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{categoryLabels[item.category] || item.category}</span>
                        </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${(item.count / data.summary.total) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right text-white">{item.count}</span>
                          </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Workload */}
              <Card className="border border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Staff Workload</CardTitle>
                  <CardDescription className="text-gray-400">Requests assigned per staff member</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.byAssignee.length > 0 ? (
                    <div className="space-y-3">
                      {data.byAssignee.slice(0, 8).map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate max-w-[200px] text-white">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{
                                  width: `${
                                    (item.count / Math.max(...data.byAssignee.map((a) => a.count))) * 100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right text-white">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No assigned requests</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Requesters */}
            <Card className="border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Top Requesters</CardTitle>
                <CardDescription className="text-gray-400">Investors with most requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.topRequesters.slice(0, 9).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm truncate max-w-[150px] text-white">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Series */}
            <Card className="border border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Request Volume Over Time</CardTitle>
                <CardDescription className="text-gray-400">Daily request creation trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.timeSeries.slice(-14).map((item) => (
                    <div key={item.date} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${
                              (item.count / Math.max(...data.timeSeries.map((t) => t.count))) * 100
                            }%`,
                            minWidth: item.count > 0 ? '32px' : '0',
                          }}
                        >
                          {item.count > 0 && (
                            <span className="text-xs font-medium text-white">{item.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border border-white/10 bg-white/5">
            <CardContent className="p-12 text-center text-gray-400">
              No analytics data available
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
