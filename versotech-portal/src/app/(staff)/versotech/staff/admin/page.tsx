'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity,
  Users,
  DollarSign,
  Server,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  UserPlus,
  UserX,
  RefreshCw,
  Settings,
  Key,
  Mail,
} from 'lucide-react'

// Import components
import { SystemHealthMetrics } from './components/system-health-metrics'
import { FinancialOverview } from './components/financial-overview'
import { StaffManagementPanel } from './components/staff-management-panel'
import { RealTimeActivityFeed } from './components/real-time-activity-feed'

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [systemMetrics, setSystemMetrics] = useState<any>(null)
  const [financialMetrics, setFinancialMetrics] = useState<any>(null)
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData()
    // Set up polling for real-time updates
    const interval = setInterval(fetchSystemMetrics, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSystemMetrics(),
        fetchFinancialMetrics(),
        fetchStaffMembers(),
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics/system')
      if (response.ok) {
        const data = await response.json()
        setSystemMetrics(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error)
    }
  }

  const fetchFinancialMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics/financial')
      if (response.ok) {
        const data = await response.json()
        setFinancialMetrics(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch financial metrics:', error)
    }
  }

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('/api/admin/staff')
      if (response.ok) {
        const data = await response.json()
        setStaffMembers(data.data.staff_members)
      }
    } catch (error) {
      console.error('Failed to fetch staff members:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete operational visibility and control</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Alert */}
      {systemMetrics?.health_score?.value < 90 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            System health is degraded ({systemMetrics.health_score.value}%). Check error logs and performance metrics.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* AUM Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((financialMetrics?.aum?.total || 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Assets Under Management
            </p>
          </CardContent>
        </Card>

        {/* Active Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.active_sessions?.current || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Peak: {systemMetrics?.active_sessions?.peak_24h || 0}
            </p>
          </CardContent>
        </Card>

        {/* Staff Members Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffMembers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {staffMembers.filter(s => s.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        {/* Workflow Executions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows (24h)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemMetrics?.workflow_executions?.total_24h || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics?.workflow_executions?.success_rate || 0}% success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SystemHealthMetrics metrics={systemMetrics} />
            <FinancialOverview metrics={financialMetrics} />
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Staff Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Staff:</span>
                  <span className="font-semibold">{staffMembers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active:</span>
                  <span className="font-semibold">
                    {staffMembers.filter(s => s.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Super Admins:</span>
                  <span className="font-semibold">
                    {staffMembers.filter(s => s.is_super_admin).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Executions (24h):</span>
                  <span className="font-semibold">
                    {systemMetrics?.workflow_executions?.total_24h || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate:</span>
                  <Badge variant={
                    Number(systemMetrics?.workflow_executions?.success_rate) > 90
                      ? 'default'
                      : 'destructive'
                  }>
                    {systemMetrics?.workflow_executions?.success_rate || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Failed:</span>
                  <span className="font-semibold text-red-500">
                    {systemMetrics?.workflow_executions?.failed || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Connections:</span>
                  <span className="font-semibold">
                    {systemMetrics?.database_connections?.active || 0}/
                    {systemMetrics?.database_connections?.max_connections || 100}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Utilization:</span>
                  <Badge variant={
                    Number(systemMetrics?.database_connections?.utilization) < 50
                      ? 'default'
                      : 'destructive'
                  }>
                    {systemMetrics?.database_connections?.utilization || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Response Time:</span>
                  <span className="font-semibold">
                    {systemMetrics?.api_response_time?.current || 0}ms
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Management Tab */}
        <TabsContent value="staff">
          <StaffManagementPanel
            staffMembers={staffMembers}
            onStaffUpdate={fetchStaffMembers}
          />
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <SystemHealthMetrics metrics={systemMetrics} detailed={true} />
        </TabsContent>

        {/* Activity Feed Tab */}
        <TabsContent value="activity">
          <RealTimeActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  )
}