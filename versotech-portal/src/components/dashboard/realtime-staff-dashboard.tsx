'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Activity,
  RefreshCw,
  WifiOff,
  Wifi,
  Bell,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface RealtimeUpdate {
  table: string
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  record: any
  old_record?: any
  timestamp: string
}

interface DashboardMetrics {
  activeLps: number
  pendingKyc: number
  workflowRuns: number
  complianceRate: number
  kycPipeline: number
  ndaInProgress: number
  subscriptionReview: number
  activeDeals: number
  activeRequests: number
  lastUpdated: string
}

export function RealtimeStaffDashboard({
  initialData,
  onMetricsUpdate,
  className
}: {
  initialData: DashboardMetrics
  onMetricsUpdate?: (metrics: DashboardMetrics) => void
  className?: string
}) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = createClient()

  // Tables to subscribe to for real-time updates
  const subscribedTables = useMemo(() => [
    'investors',           // For active LPs and KYC status
    'tasks',              // For KYC/NDA/subscription pipeline
    'workflow_runs',      // For workflow execution counts
    'deals',              // For active deals
    'request_tickets',    // For active requests
    'activity_feed'       // For recent activity
  ], [])

  // Fetch updated metrics from database
  const fetchMetrics = useCallback(async () => {
    setIsRefreshing(true)

    try {
      // Parallel fetch all metrics
      const [
        activeLpsResult,
        pendingKycResult,
        workflowRunsResult,
        complianceResult,
        kycPipelineResult,
        ndaResult,
        subscriptionResult,
        dealsResult,
        requestsResult
      ] = await Promise.all([
        supabase.from('investors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('investors').select('id', { count: 'exact', head: true }).in('kyc_status', ['pending', 'review']),
        supabase.from('workflow_runs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('investors').select('kyc_status'),
        supabase.from('tasks')
          .select('id', { count: 'exact', head: true })
          .in('kind', ['kyc_individual', 'kyc_entity', 'kyc_aml_check'])
          .in('status', ['pending', 'in_progress']),
        supabase.from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'compliance_nda')
          .eq('status', 'in_progress'),
        supabase.from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'compliance_subscription_agreement')
          .eq('status', 'review'),
        supabase.from('deals')
          .select('id', { count: 'exact', head: true })
          .in('status', ['open', 'allocation_pending']),
        supabase.from('request_tickets')
          .select('id', { count: 'exact', head: true })
          .in('status', ['open', 'assigned', 'in_progress'])
      ])

      // Calculate compliance rate
      const totalInvestors = complianceResult.data?.length || 0
      const approvedInvestors = complianceResult.data?.filter((i: any) => i.kyc_status === 'approved').length || 0
      const complianceRate = totalInvestors > 0 ? (approvedInvestors / totalInvestors) * 100 : 0

      const newMetrics: DashboardMetrics = {
        activeLps: activeLpsResult.count || 0,
        pendingKyc: pendingKycResult.count || 0,
        workflowRuns: workflowRunsResult.count || 0,
        complianceRate: Math.round(complianceRate * 10) / 10,
        kycPipeline: kycPipelineResult.count || 0,
        ndaInProgress: ndaResult.count || 0,
        subscriptionReview: subscriptionResult.count || 0,
        activeDeals: dealsResult.count || 0,
        activeRequests: requestsResult.count || 0,
        lastUpdated: new Date().toISOString()
      }

      setMetrics(newMetrics)
      onMetricsUpdate?.(newMetrics)

      // Show update notification
      toast.success('Dashboard refreshed', {
        description: 'All metrics updated successfully',
        duration: 2000
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
      toast.error('Failed to refresh metrics', {
        description: 'Some metrics may be outdated'
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [supabase, onMetricsUpdate])

  // Set up real-time subscriptions
  useEffect(() => {
    const channels: any[] = []

    const setupSubscriptions = async () => {
      // Create a single channel for all table subscriptions
      const channel = supabase
        .channel('dashboard-updates')
        .on('postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            // Check if this is from a subscribed table
            if (subscribedTables.includes(payload.table)) {
              const update: RealtimeUpdate = {
                table: payload.table,
                type: payload.eventType as any,
                record: payload.new,
                old_record: payload.old,
                timestamp: new Date().toISOString()
              }

              // Add to recent updates
              setRealtimeUpdates(prev => [update, ...prev].slice(0, 10))

              // Determine if we need to refresh metrics
              const shouldRefresh = determineIfRefreshNeeded(update)
              if (shouldRefresh) {
                fetchMetrics()
              }

              // Show notification for important changes
              showUpdateNotification(update)
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED')
          if (status === 'SUBSCRIBED') {
            toast.success('Real-time updates connected', {
              description: 'Dashboard will update automatically',
              duration: 2000
            })
          }
        })

      channels.push(channel)
    }

    setupSubscriptions()

    // Cleanup on unmount
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [supabase, fetchMetrics, subscribedTables])

  // Determine if metrics need refreshing based on update type
  const determineIfRefreshNeeded = (update: RealtimeUpdate): boolean => {
    // Always refresh for these critical tables
    const criticalTables = ['investors', 'tasks', 'deals', 'request_tickets']
    if (criticalTables.includes(update.table)) {
      return true
    }

    // For workflow_runs, only refresh if status changed to completed/failed
    if (update.table === 'workflow_runs') {
      return update.record?.status === 'completed' || update.record?.status === 'failed'
    }

    return false
  }

  // Show notification for important updates
  const showUpdateNotification = (update: RealtimeUpdate) => {
    const notifications: Record<string, { title: string; description: string; icon?: any }> = {
      investors: {
        title: 'Investor Update',
        description: update.type === 'INSERT' ? 'New investor added' : 'Investor profile updated',
        icon: AlertCircle
      },
      tasks: {
        title: 'Task Update',
        description: update.type === 'INSERT' ? 'New task created' : 'Task status changed',
        icon: Bell
      },
      deals: {
        title: 'Deal Update',
        description: update.type === 'INSERT' ? 'New deal created' : 'Deal status updated',
        icon: AlertCircle
      },
      workflow_runs: {
        title: 'Workflow Update',
        description: update.record?.status === 'completed' ? 'Workflow completed' : 'Workflow status changed',
        icon: Activity
      }
    }

    const notification = notifications[update.table]
    if (notification && update.type !== 'DELETE') {
      toast(notification.title, {
        description: notification.description,
        icon: notification.icon ? <notification.icon className="h-4 w-4" /> : undefined,
        duration: 3000
      })
    }
  }

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchMetrics()
  }

  // Auto-refresh every 5 minutes as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMetrics()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchMetrics])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Connection Status Bar */}
      <Card className="bg-black/95 border-white/10">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-200">Real-time connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-amber-200">Connecting...</span>
                  </>
                )}
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400">
                Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs border-white/10 text-slate-200 hover:bg-white/10"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active LPs', value: metrics.activeLps, color: 'text-sky-400' },
          { label: 'Pending KYC', value: metrics.pendingKyc, color: 'text-amber-400' },
          { label: 'Active Deals', value: metrics.activeDeals, color: 'text-purple-400' },
          { label: 'Compliance', value: `${metrics.complianceRate}%`, color: 'text-emerald-400' }
        ].map((metric) => (
          <div
            key={metric.label}
            className="p-3 rounded-lg border border-white/10 bg-black/50 backdrop-blur"
          >
            <div className="text-xs text-slate-500 mb-1">{metric.label}</div>
            <div className={cn("text-2xl font-bold", metric.color)}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Real-time Updates */}
      {realtimeUpdates.length > 0 && (
        <Card className="bg-black/95 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400 animate-pulse" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {realtimeUpdates.slice(0, 5).map((update, idx) => (
              <div
                key={`${update.table}-${update.timestamp}-${idx}`}
                className="flex items-center gap-3 p-2 rounded-md bg-white/5 text-xs"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="flex-1">
                  <span className="text-slate-300 capitalize">{update.table}</span>
                  <span className="text-slate-500 mx-1">•</span>
                  <span className="text-slate-400">{update.type}</span>
                </div>
                <span className="text-slate-600 text-[10px]">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}