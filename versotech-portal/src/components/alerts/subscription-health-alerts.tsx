'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  FileX,
  Mail,
  CheckCircle2,
  Bell,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'

interface HealthAlert {
  id: string
  type: 'overdue_funding' | 'missing_documents' | 'pending_review' | 'kyc_expiring' | 'contract_expiring'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  entity_type: 'subscription' | 'investor' | 'document'
  entity_id: string
  entity_name: string
  action_url?: string
  action_label?: string
  created_at: string
  dismissed_at?: string | null
}

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Clock
}

const severityColors = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-orange-600 bg-orange-50 border-orange-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200'
}

const typeIcons = {
  overdue_funding: Clock,
  missing_documents: FileX,
  pending_review: AlertTriangle,
  kyc_expiring: AlertCircle,
  contract_expiring: AlertCircle
}

export function SubscriptionHealthAlerts() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showDismissed, setShowDismissed] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [showDismissed])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/staff/health-alerts?dismissed=${showDismissed}`)

      if (!response.ok) {
        throw new Error('Failed to fetch health alerts')
      }

      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (err) {
      console.error('Failed to fetch health alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (alertId: string) => {
    try {
      const response = await fetch(`/api/staff/health-alerts/${alertId}/dismiss`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to dismiss alert')
      }

      setAlerts(prev => prev.filter(a => a.id !== alertId))
      toast.success('Alert dismissed')
    } catch (err) {
      console.error('Failed to dismiss alert:', err)
      toast.error('Failed to dismiss alert')
    }
  }

  const handleSendReminder = async (alert: HealthAlert) => {
    try {
      const response = await fetch('/api/staff/health-alerts/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alert.id,
          entity_id: alert.entity_id,
          entity_type: alert.entity_type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send reminder')
      }

      toast.success('Reminder sent successfully')
    } catch (err) {
      console.error('Failed to send reminder:', err)
      toast.error('Failed to send reminder')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const criticalAlerts = alerts.filter(a => a.severity === 'critical')
  const warningAlerts = alerts.filter(a => a.severity === 'warning')
  const infoAlerts = alerts.filter(a => a.severity === 'info')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Health Alerts
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive">{criticalAlerts.length} Critical</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Automated alerts for issues requiring attention
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDismissed(!showDismissed)}
          >
            {showDismissed ? 'Hide Dismissed' : 'Show Dismissed'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">All Clear!</p>
            <p className="text-sm text-muted-foreground">
              No health alerts at this time
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Critical ({criticalAlerts.length})
                </div>
                {criticalAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismiss}
                    onSendReminder={handleSendReminder}
                  />
                ))}
              </>
            )}

            {/* Warning Alerts */}
            {warningAlerts.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings ({warningAlerts.length})
                </div>
                {warningAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismiss}
                    onSendReminder={handleSendReminder}
                  />
                ))}
              </>
            )}

            {/* Info Alerts */}
            {infoAlerts.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 mt-4">
                  <Clock className="h-4 w-4" />
                  Info ({infoAlerts.length})
                </div>
                {infoAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismiss}
                    onSendReminder={handleSendReminder}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AlertCard({
  alert,
  onDismiss,
  onSendReminder
}: {
  alert: HealthAlert
  onDismiss: (id: string) => void
  onSendReminder: (alert: HealthAlert) => void
}) {
  const SeverityIcon = severityIcons[alert.severity]
  const TypeIcon = typeIcons[alert.type]

  return (
    <Alert className={severityColors[alert.severity]}>
      <div className="flex items-start gap-3">
        <SeverityIcon className="h-5 w-5 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4" />
            {alert.title}
            {alert.dismissed_at && (
              <Badge variant="outline" className="ml-auto">
                Dismissed
              </Badge>
            )}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <p>{alert.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium">{alert.entity_name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </AlertDescription>
          {!alert.dismissed_at && (
            <div className="flex items-center gap-2 mt-3">
              {alert.action_url && (
                <Link href={alert.action_url}>
                  <Button size="sm" variant="default">
                    {alert.action_label || 'View'}
                  </Button>
                </Link>
              )}
              {alert.entity_type === 'subscription' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendReminder(alert)}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Send Reminder
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(alert.id)}
                className="ml-auto"
              >
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}
