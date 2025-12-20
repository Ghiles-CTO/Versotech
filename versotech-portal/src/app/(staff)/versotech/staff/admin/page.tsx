'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Users, Zap, Activity, Settings, Download, Shield } from 'lucide-react'

// Import components
import { CollapsibleSection } from './components/collapsible-section'
import { FinancialOverview } from './components/financial-overview'
import { StaffManagementPanel } from './components/staff-management-panel'
import { RealTimeActivityFeed } from './components/real-time-activity-feed'
import { UserAccountManagement } from './components/user-account-management'
import { DataExportPanel } from './components/data-export-panel'
import { WorkflowMonitoring } from './components/workflow-monitoring'
import { ComplianceAlertsPanel } from './components/compliance-alerts-panel'
// Admin-only chart components
import { AdminKpiCards } from './components/admin-kpi-cards'
import { StaffActivityChart } from './components/staff-activity-chart'
import { ApprovalQueueChart } from './components/approval-queue-chart'
import { WorkflowTrendChart } from './components/workflow-trend-chart'
import { ComplianceForecastChart } from './components/compliance-forecast-chart'

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [financialMetrics, setFinancialMetrics] = useState<any>(null)
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [adminMetrics, setAdminMetrics] = useState<any>(null)

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
        setStaffMembers(data.data?.staff_members || [])
      }
    } catch (error) {
      console.error('Failed to fetch staff members:', error)
    }
  }

  const fetchAdminMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics/dashboard')
      if (response.ok) {
        const data = await response.json()
        setAdminMetrics(data.data?.adminMetrics || null)
      }
    } catch (error) {
      console.error('Failed to fetch admin metrics:', error)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchFinancialMetrics(),
        fetchStaffMembers(),
        fetchAdminMetrics(),
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchFinancialMetrics()
      fetchStaffMembers()
      fetchAdminMetrics()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAllData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="container mx-auto py-8 space-y-6">
          <div className="h-12 w-64 bg-zinc-800 rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
            <p className="text-zinc-400">Complete operational visibility and control</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Admin KPI Cards */}
        {adminMetrics && (
          <AdminKpiCards
            security={adminMetrics.security}
            complianceForecast={adminMetrics.complianceForecast}
          />
        )}

        {/* Admin-Only Charts Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StaffActivityChart data={adminMetrics?.staffActivity || []} />
          <ApprovalQueueChart data={adminMetrics?.approvalQueue || { under_1_day: 0, days_1_to_3: 0, days_3_to_7: 0, over_7_days: 0, total: 0 }} />
          <WorkflowTrendChart data={adminMetrics?.workflowTrend || []} />
          <ComplianceForecastChart data={adminMetrics?.complianceForecast || { next_7_days: 0, next_30_days: 0, next_90_days: 0, total: 0 }} />
        </div>

        {/* Financial Overview */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-1">
          <FinancialOverview metrics={financialMetrics} />
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {/* Compliance Alerts */}
          <CollapsibleSection
            title="Compliance & KYC Alerts"
            icon={<Shield className="h-5 w-5" />}
            defaultOpen={false}
          >
            <ComplianceAlertsPanel />
          </CollapsibleSection>

          {/* Staff Management */}
          <CollapsibleSection
            title="Staff Management"
            icon={<Users className="h-5 w-5" />}
            defaultOpen={false}
            badge={
              <Badge variant="outline" className="border-zinc-600 text-zinc-400 text-xs">
                {staffMembers.length} Members
              </Badge>
            }
          >
            <StaffManagementPanel staffMembers={staffMembers} onStaffUpdate={fetchStaffMembers} />
          </CollapsibleSection>

          {/* Activity Feed */}
          <CollapsibleSection
            title="Real-Time Activity Feed"
            icon={<Activity className="h-5 w-5" />}
            defaultOpen={false}
          >
            <RealTimeActivityFeed />
          </CollapsibleSection>

          {/* Workflow Monitoring */}
          <CollapsibleSection
            title="Workflow Monitoring"
            icon={<Zap className="h-5 w-5" />}
            defaultOpen={false}
          >
            <WorkflowMonitoring />
          </CollapsibleSection>

          {/* User Account Management */}
          <CollapsibleSection
            title="User Account Management"
            icon={<Settings className="h-5 w-5" />}
            defaultOpen={false}
          >
            <UserAccountManagement />
          </CollapsibleSection>

          {/* Data Export */}
          <CollapsibleSection
            title="Data Export"
            icon={<Download className="h-5 w-5" />}
            defaultOpen={false}
          >
            <DataExportPanel />
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-zinc-800">
          <p className="text-sm text-zinc-500">
            VERSO Holdings Super Admin Dashboard • Last updated:{' '}
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
