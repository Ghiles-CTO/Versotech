'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function WorkflowMonitoring() {
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
        return 'text-zinc-400'
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
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Overall Health</span>
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
                className="h-2 flex-1 bg-zinc-700"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Active Workflows</span>
            </div>
            <span className="text-2xl font-bold text-white">
              {workflows.filter((w) => w.enabled).length}/{workflows.length}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-zinc-400">Recent Success</span>
            </div>
            <span className="text-2xl font-bold text-emerald-400">{totalSuccess}</span>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-zinc-400">Recent Failed</span>
            </div>
            <span className="text-2xl font-bold text-red-400">{totalFailed}</span>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card className="border-zinc-700 overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-zinc-700 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-white font-medium text-base">Workflow Status</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="border-zinc-700 text-zinc-400"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700 hover:bg-transparent">
                <TableHead className="text-zinc-400">Workflow</TableHead>
                <TableHead className="text-zinc-400">Category</TableHead>
                <TableHead className="text-zinc-400">Success Rate</TableHead>
                <TableHead className="text-zinc-400">Total Runs</TableHead>
                <TableHead className="text-zinc-400">Last Run</TableHead>
                <TableHead className="text-zinc-400">Avg Duration</TableHead>
                <TableHead className="text-zinc-400 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-700">
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-5 bg-zinc-800 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : workflows.length === 0 ? (
                <TableRow className="border-zinc-700">
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-400">
                    No workflows configured
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => (
                  <TableRow key={workflow.key} className="border-zinc-700 hover:bg-zinc-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-zinc-400" />
                        <span className="text-white font-medium">{workflow.title}</span>
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
                          className="h-2 w-16 bg-zinc-700"
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
                    <TableCell className="text-zinc-300">{workflow.total_runs}</TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {workflow.last_run_at
                        ? new Date(workflow.last_run_at).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {formatDuration(workflow.avg_duration_ms)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          workflow.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                        }
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
      <Card className="border-zinc-700 overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-zinc-700">
          <CardTitle className="text-white font-medium text-base">Recent Executions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700 hover:bg-transparent">
                <TableHead className="text-zinc-400">Workflow</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Started</TableHead>
                <TableHead className="text-zinc-400">Duration</TableHead>
                <TableHead className="text-zinc-400">Trigger</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRuns.length === 0 ? (
                <TableRow className="border-zinc-700">
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-400">
                    No recent workflow runs
                  </TableCell>
                </TableRow>
              ) : (
                recentRuns.map((run) => (
                  <TableRow key={run.id} className="border-zinc-700 hover:bg-zinc-800/50">
                    <TableCell className="text-white">{run.workflow_key}</TableCell>
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
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(run.started_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {formatDuration(run.duration_ms)}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">{run.trigger_type}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRun(run)
                          setDetailsDialogOpen(true)
                        }}
                        className="text-zinc-400 hover:text-white"
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
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Workflow Run Details</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedRun?.workflow_key} - {selectedRun?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRun && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-zinc-800">
                  <p className="text-xs text-zinc-400 mb-1">Status</p>
                  <p
                    className={`text-white font-medium ${selectedRun.status === 'completed'
                      ? 'text-emerald-400'
                      : selectedRun.status === 'failed'
                        ? 'text-red-400'
                        : 'text-amber-400'
                      }`}
                  >
                    {selectedRun.status}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800">
                  <p className="text-xs text-zinc-400 mb-1">Duration</p>
                  <p className="text-white font-medium">
                    {formatDuration(selectedRun.duration_ms)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800">
                  <p className="text-xs text-zinc-400 mb-1">Started At</p>
                  <p className="text-white text-sm">
                    {new Date(selectedRun.started_at).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800">
                  <p className="text-xs text-zinc-400 mb-1">Trigger Type</p>
                  <p className="text-white font-medium">{selectedRun.trigger_type}</p>
                </div>
              </div>

              {selectedRun.error_message && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
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
              className="border-zinc-700 text-zinc-400"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
