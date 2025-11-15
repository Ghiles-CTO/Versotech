import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { AuditLogFilters } from '@/components/audit/audit-log-filters'
import { AuditLogTable } from '@/components/audit/audit-log-table'
import { ComplianceAlerts } from '@/components/audit/compliance-alerts'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuditPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Get filter parameters
  const search = params.search as string | undefined
  const riskLevel = params.risk as string | undefined
  const dateFrom = params.from as string | undefined
  const dateTo = params.to as string | undefined
  const action = params.action as string | undefined

  // Build query for audit logs
  let auditQuery = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .limit(100)

  // Apply filters
  if (search) {
    auditQuery = auditQuery.or(`actor_email.ilike.%${search}%,action.ilike.%${search}%,entity_type.ilike.%${search}%`)
  }

  if (riskLevel && riskLevel !== 'all') {
    auditQuery = auditQuery.eq('risk_level', riskLevel)
  }

  if (action && action !== 'all') {
    auditQuery = auditQuery.eq('action', action)
  }

  if (dateFrom) {
    auditQuery = auditQuery.gte('timestamp', new Date(dateFrom).toISOString())
  }

  if (dateTo) {
    auditQuery = auditQuery.lte('timestamp', new Date(dateTo).toISOString())
  }

  const { data: auditLogs, count, error } = await auditQuery

  if (error) {
    console.error('Error fetching audit logs:', error)
  }

  // Get compliance alerts
  const { data: complianceAlerts } = await supabase
    .from('compliance_alerts')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', today.toISOString())

  const { count: complianceFlagCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('compliance_flag', true)
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { count: highRiskCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('risk_level', 'high')
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { data: uniqueActors } = await supabase
    .from('audit_logs')
    .select('actor_email')
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const uniqueUserCount = uniqueActors ? new Set(uniqueActors.map(a => a.actor_email)).size : 0

  const stats = {
    totalEvents: count || 0,
    todayEvents: todayCount || 0,
    complianceFlags: complianceFlagCount || 0,
    highRiskEvents: highRiskCount || 0,
    uniqueUsers: uniqueUserCount
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit & Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Monitor system activity and maintain compliance records
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <div className="text-sm text-muted-foreground mt-1">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todayEvents}</div>
            <div className="text-sm text-muted-foreground mt-1">Current activity</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.complianceFlags}</div>
            <div className="text-sm text-muted-foreground mt-1">Last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRiskEvents}</div>
            <div className="text-sm text-muted-foreground mt-1">Last 30 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</div>
            <div className="text-sm text-muted-foreground mt-1">Last 30 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <AuditLogFilters />

      {/* Audit Log Table */}
      <AuditLogTable logs={auditLogs || []} />

      {/* Compliance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceAlerts alerts={complianceAlerts || []} />

        <Card>
          <CardHeader>
            <CardTitle>Security Summary</CardTitle>
            <CardDescription>
              System security and access patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All admin actions logged</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Document access tracking</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Monitoring compliance alerts</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Data encryption active</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
