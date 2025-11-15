'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Database,
  Server,
  Users,
  Zap,
} from 'lucide-react'

interface SystemHealthMetricsProps {
  metrics: any
  detailed?: boolean
}

export function SystemHealthMetrics({ metrics, detailed = false }: SystemHealthMetricsProps) {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading metrics...</p>
        </CardContent>
      </Card>
    )
  }

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>
      case 'degraded':
        return <Badge variant="destructive" className="bg-yellow-500">Degraded</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Health Metrics</CardTitle>
          {getHealthBadge(metrics.health_score?.status || 'unknown')}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health Score</span>
            <span className="text-2xl font-bold text-green-500">
              {metrics.health_score?.value || 0}%
            </span>
          </div>
          <Progress value={metrics.health_score?.value || 0} className="h-2" />
        </div>

        {/* API Performance */}
        {metrics.api_response_time?.current > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">API Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <p className="text-xs text-muted-foreground">Response Time</p>
                <p className="text-lg font-semibold">
                  {metrics.api_response_time?.current || 0}ms
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg 1h: {metrics.api_response_time?.avg_1h || 0}ms
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Database Connections */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Database Health</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Connections</p>
              <p className="text-lg font-semibold">
                {metrics.database_connections?.active || 0}/
                {metrics.database_connections?.max_connections || 100}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilization</p>
              <Progress
                value={metrics.database_connections?.utilization || 0}
                className="h-2 mt-2"
              />
              <p className="text-xs text-muted-foreground">
                {metrics.database_connections?.utilization || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Active Sessions</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-lg font-semibold">
                {metrics.active_sessions?.current || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Avg 24h: {Math.round(metrics.active_sessions?.avg_24h || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak (24h)</p>
              <p className="text-lg font-semibold">
                {metrics.active_sessions?.peak_24h || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Executions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Workflow Automation</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <p className="text-xs text-muted-foreground">Executions (24h)</p>
              <p className="text-lg font-semibold">
                {metrics.workflow_executions?.total_24h || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                Running: {metrics.workflow_executions?.running || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className={`text-lg font-semibold ${
                Number(metrics.workflow_executions?.success_rate) < 90 ? 'text-yellow-500' : ''
              }`}>
                {metrics.workflow_executions?.success_rate || 0}%
              </p>
              <p className="text-xs text-muted-foreground">
                Failed: {metrics.workflow_executions?.failed || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(metrics.health_score?.last_updated || Date.now()).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}