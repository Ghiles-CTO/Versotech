'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComplianceAlert {
  id: string
  type: 'kyc_expiry' | 'accreditation_expiry' | 'unsigned_doc' | 'aml_flag'
  severity: 'critical' | 'high' | 'medium' | 'low'
  investor_id: string
  investor_name: string
  details: string
  due_date?: string
  days_until_due?: number
  created_at: string
}

interface DashboardComplianceAlertsProps {
  days: string
}

interface SeverityGroup {
  id: string
  label: string
  severity: 'critical' | 'warning' | 'clear'
  alerts: ComplianceAlert[]
  colorClass: string
  bgClass: string
  borderClass: string
  badgeVariant: 'destructive' | 'secondary' | 'default'
}

function ComplianceAlertsSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function AlertItem({ alert }: { alert: ComplianceAlert }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-md bg-muted/50 text-sm">
      <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{alert.investor_name}</p>
        <p className="text-muted-foreground text-xs">{alert.details}</p>
        {alert.due_date && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due: {new Date(alert.due_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function SeveritySection({ group, defaultOpen }: { group: SeverityGroup; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen || false)

  if (group.alerts.length === 0 && group.severity !== 'clear') {
    return null
  }

  const IconComponent = group.severity === 'critical'
    ? AlertCircle
    : group.severity === 'warning'
      ? AlertTriangle
      : CheckCircle2

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
            'hover:bg-accent/50',
            group.borderClass,
            group.bgClass
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn('p-1.5 rounded-md', group.bgClass)}>
              <IconComponent className={cn('h-4 w-4', group.colorClass)} />
            </div>
            <span className={cn('font-medium text-sm', group.colorClass)}>
              {group.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={group.badgeVariant}
              className={cn(
                'min-w-[28px] justify-center',
                group.severity === 'warning' && 'bg-yellow-500/90 text-white hover:bg-yellow-500/80',
                group.severity === 'clear' && 'bg-green-500/90 text-white hover:bg-green-500/80'
              )}
            >
              {group.alerts.length}
            </Badge>
            {group.alerts.length > 0 && (
              isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            )}
          </div>
        </button>
      </CollapsibleTrigger>
      {group.alerts.length > 0 && (
        <CollapsibleContent className="pt-2 space-y-1.5 pl-2">
          {group.alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

export function DashboardComplianceAlerts({ days }: DashboardComplianceAlertsProps) {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/compliance/alerts?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch compliance alerts')
        }
        const result = await response.json()
        if (result.success && result.data?.alerts) {
          setAlerts(result.data.alerts)
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [days])

  if (loading) {
    return <ComplianceAlertsSkeleton />
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Compliance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group alerts by severity level
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical')
  const warningAlerts = alerts.filter((a) => a.severity === 'high')
  const lowAlerts = alerts.filter((a) => a.severity === 'medium' || a.severity === 'low')

  const severityGroups: SeverityGroup[] = [
    {
      id: 'critical',
      label: 'Critical',
      severity: 'critical',
      alerts: criticalAlerts,
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-500/10',
      borderClass: 'border-red-500/30',
      badgeVariant: 'destructive',
    },
    {
      id: 'warning',
      label: 'Warning',
      severity: 'warning',
      alerts: warningAlerts,
      colorClass: 'text-yellow-600 dark:text-yellow-400',
      bgClass: 'bg-yellow-500/10',
      borderClass: 'border-yellow-500/30',
      badgeVariant: 'secondary',
    },
    {
      id: 'low',
      label: 'Low Priority',
      severity: 'clear',
      alerts: lowAlerts,
      colorClass: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-500/10',
      borderClass: 'border-green-500/30',
      badgeVariant: 'default',
    },
  ]

  const totalAlerts = alerts.length
  const hasNoAlerts = totalAlerts === 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Compliance Alerts
          </CardTitle>
          {totalAlerts > 0 && (
            <Badge
              variant={criticalAlerts.length > 0 ? 'destructive' : 'secondary'}
              className="font-medium"
            >
              {totalAlerts} total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasNoAlerts ? (
          // All clear state
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-3 rounded-full bg-green-500/10 mb-3">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-medium text-green-600 dark:text-green-400">All Clear</p>
            <p className="text-sm text-muted-foreground mt-1">
              No compliance issues requiring attention
            </p>
          </div>
        ) : (
          // Show severity groups
          severityGroups.map((group) => (
            <SeveritySection
              key={group.id}
              group={group}
              defaultOpen={group.severity === 'critical' && group.alerts.length > 0}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
