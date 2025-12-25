'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Activity,
  Eye,
} from 'lucide-react'

interface Workflow {
  id: string
  key: string
  title: string
  category: string
  enabled: boolean
  success_rate: number
  total_runs: number
  successful_runs: number
  failed_runs: number
  last_run_at: string | null
  avg_duration_ms: number
}

interface WorkflowRun {
  id: string
  workflow_key: string
  status: string
  started_at: string
  completed_at: string | null
  error_message: string | null
  duration_ms: number | null
  trigger_type: string
}

interface WorkflowMonitoringProps {
  isDark?: boolean
}

export function WorkflowMonitoring({ isDark = true }: WorkflowMonitoringProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [recentRuns, setRecentRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [workflowsRes, runsRes] = await Promise.all([
        fetch('/api/admin/workflows'),
        fetch('/api/admin/workflows/runs?limit=20'),
      ])

      if (workflowsRes.ok) {
        const data = await workflowsRes.json()
        setWorkflows(data.data?.workflows || [])
      }
      if (runsRes.ok) {
        const data = await runsRes.json()
        setRecentRuns(data.data?.runs || [])
      }
    } catch (error) {
      console.error('Failed to fetch workflow data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'documents':
        return 'text-blue-400'
      case 'compliance':
        return 'text-purple-400'
      case 'communications':
        return 'text-amber-400'
      case 'data_processing':
        return 'text-emerald-400'
      case 'multi_step':
        return 'text-red-400'
      default:
        return isDark ? 'text-zinc-400' : 'text-gray-500'
    }
  }

  const overallHealth = workflows.length > 0
    ? workflows.reduce((sum, w) => sum + w.success_rate, 0) / workflows.length
    : 100

  const totalFailed = recentRuns.filter((r) => r.status === 'failed').length
  const totalSuccess = recentRuns.filter((r) => r.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={cn(
          isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className={cn('h-4 w-4', isDark ? 'text-zinc-400' : 'text-gray-500')} />
              <span className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>Overall Health</span>
            </div>
            <div className="flex items-end gap-2">
              <span
                className={`text-2xl font-bold ${overallHealth >= 90
                  ? 'text-emerald-400'
                  : overallHealth >= 70
                    ? 'text-amber-400'
                    : 'text-red-400'
                  }`}
              >
                {overallHealth.toFixed(0)}%
              </span>
              <Progress
                value={overallHealth}
                className={cn('h-2 flex-1', isDark ? 'bg-zinc-700' : 'bg-gray-200')}
              />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className={cn('h-4 w-4', isDark ? 'text-zinc-400' : 'text-gray-500')} />
              <span className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>Active Workflows</span>
            </div>
            <span className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
              {workflows.filter((w) => w.enabled).length}/{workflows.length}
            </span>
          </CardContent>
        </Card>
        <Card className={cn(
          isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>Recent Success</span>
            </div>
            <span className="text-2xl font-bold text-emerald-400">{totalSuccess}</span>
          </CardContent>
        </Card>
        <Card className={cn(
          isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-gray-200 shadow-sm'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>Recent Failed</span>
            </div>
            <span className="text-2xl font-bold text-red-400">{totalFailed}</span>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card className={cn(
        'overflow-hidden',
        isDark ? 'border-zinc-700' : 'border-gray-200 shadow-sm'
      )}>
        <CardHeader className={cn(
          'px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b',
          isDark ? 'border-zinc-700' : 'border-gray-200'
        )}>
          <CardTitle className={cn('font-medium text-base', isDark ? 'text-white' : 'text-gray-900')}>Workflow Status</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className={cn(
              isDark ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-600'
            )}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className={cn(
                isDark ? 'border-zinc-700 hover:bg-transparent' : 'border-gray-200 hover:bg-transparent'
              )}>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Workflow</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Category</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Success Rate</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Total Runs</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Last Run</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Avg Duration</TableHead>
                <TableHead className={cn('text-right', isDark ? 'text-zinc-400' : 'text-gray-500')}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className={isDark ? 'border-zinc-700' : 'border-gray-200'}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <div className={cn('h-5 rounded animate-pulse', isDark ? 'bg-zinc-800' : 'bg-gray-200')} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : workflows.length === 0 ? (
                <TableRow className={isDark ? 'border-zinc-700' : 'border-gray-200'}>
                  <TableCell colSpan={7} className={cn('text-center py-8', isDark ? 'text-zinc-400' : 'text-gray-500')}>
                    No workflows configured
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => (
                  <TableRow key={workflow.key} className={cn(
                    isDark ? 'border-zinc-700 hover:bg-zinc-800/50' : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Zap className={cn('h-4 w-4', isDark ? 'text-zinc-400' : 'text-gray-500')} />
                        <span className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>{workflow.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${getCategoryColor(workflow.category)}`}>
                        {workflow.category.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={workflow.success_rate}
                          className={cn('h-2 w-16', isDark ? 'bg-zinc-700' : 'bg-gray-200')}
                        />
                        <span
                          className={`text-sm ${workflow.success_rate >= 90
                            ? 'text-emerald-400'
                            : workflow.success_rate >= 70
                              ? 'text-amber-400'
                              : 'text-red-400'
                            }`}
                        >
                          {workflow.success_rate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={isDark ? 'text-zinc-300' : 'text-gray-700'}>{workflow.total_runs}</TableCell>
                    <TableCell className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>
                      {workflow.last_run_at
                        ? new Date(workflow.last_run_at).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>
                      {formatDuration(workflow.avg_duration_ms)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={cn(
                          workflow.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : (isDark
                              ? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                              : 'bg-gray-100 text-gray-500 border-gray-300')
                        )}
                      >
                        {workflow.enabled ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card className={cn(
        'overflow-hidden',
        isDark ? 'border-zinc-700' : 'border-gray-200 shadow-sm'
      )}>
        <CardHeader className={cn(
          'px-4 py-3 border-b',
          isDark ? 'border-zinc-700' : 'border-gray-200'
        )}>
          <CardTitle className={cn('font-medium text-base', isDark ? 'text-white' : 'text-gray-900')}>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className={cn(
                isDark ? 'border-zinc-700 hover:bg-transparent' : 'border-gray-200 hover:bg-transparent'
              )}>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Workflow</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Status</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Started</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Duration</TableHead>
                <TableHead className={isDark ? 'text-zinc-400' : 'text-gray-500'}>Trigger</TableHead>
                <TableHead className={cn('text-right', isDark ? 'text-zinc-400' : 'text-gray-500')}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRuns.length === 0 ? (
                <TableRow className={isDark ? 'border-zinc-700' : 'border-gray-200'}>
                  <TableCell colSpan={6} className={cn('text-center py-8', isDark ? 'text-zinc-400' : 'text-gray-500')}>
                    No recent workflow runs
                  </TableCell>
                </TableRow>
              ) : (
                recentRuns.map((run) => (
                  <TableRow key={run.id} className={cn(
                    isDark ? 'border-zinc-700 hover:bg-zinc-800/50' : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <TableCell className={isDark ? 'text-white' : 'text-gray-900'}>{run.workflow_key}</TableCell>
                    <TableCell>
                      {run.status === 'completed' ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : run.status === 'failed' ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <Clock className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>
                      {new Date(run.started_at).toLocaleString()}
                    </TableCell>
                    <TableCell className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>
                      {formatDuration(run.duration_ms)}
                    </TableCell>
                    <TableCell className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-gray-500')}>{run.trigger_type}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRun(run)
                          setDetailsDialogOpen(true)
                        }}
                        className={cn(isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Run Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className={cn(
          'max-w-2xl',
          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Workflow Run Details</DialogTitle>
            <DialogDescription className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
              {selectedRun?.workflow_key} - {selectedRun?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRun && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={cn('p-3 rounded-lg', isDark ? 'bg-zinc-800' : 'bg-gray-100')}>
                  <p className={cn('text-xs mb-1', isDark ? 'text-zinc-400' : 'text-gray-500')}>Status</p>
                  <p
                    className={`font-medium ${selectedRun.status === 'completed'
                      ? 'text-emerald-400'
                      : selectedRun.status === 'failed'
                        ? 'text-red-400'
                        : 'text-amber-400'
                      }`}
                  >
                    {selectedRun.status}
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg', isDark ? 'bg-zinc-800' : 'bg-gray-100')}>
                  <p className={cn('text-xs mb-1', isDark ? 'text-zinc-400' : 'text-gray-500')}>Duration</p>
                  <p className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>
                    {formatDuration(selectedRun.duration_ms)}
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg', isDark ? 'bg-zinc-800' : 'bg-gray-100')}>
                  <p className={cn('text-xs mb-1', isDark ? 'text-zinc-400' : 'text-gray-500')}>Started At</p>
                  <p className={cn('text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                    {new Date(selectedRun.started_at).toLocaleString()}
                  </p>
                </div>
                <div className={cn('p-3 rounded-lg', isDark ? 'bg-zinc-800' : 'bg-gray-100')}>
                  <p className={cn('text-xs mb-1', isDark ? 'text-zinc-400' : 'text-gray-500')}>Trigger Type</p>
                  <p className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>{selectedRun.trigger_type}</p>
                </div>
              </div>

              {selectedRun.error_message && (
                <div className={cn(
                  'p-4 rounded-lg border',
                  isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-medium">Error Message</span>
                  </div>
                  <pre className="text-sm text-red-300 whitespace-pre-wrap overflow-auto max-h-[200px]">
                    {selectedRun.error_message}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className={cn(
                isDark ? 'border-zinc-700 text-zinc-400' : 'border-gray-300 text-gray-600'
              )}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
