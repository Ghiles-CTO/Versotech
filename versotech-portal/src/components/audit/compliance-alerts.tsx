'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ComplianceAlert {
  id: string
  audit_log_id: string | null
  alert_type: string
  severity: string
  description: string | null
  status: string
  assigned_to: string | null
  created_at: string
}

export function ComplianceAlerts({ alerts }: { alerts: ComplianceAlert[] }) {
  const router = useRouter()

  const handleReview = async (alertId: string) => {
    const response = await fetch(`/api/audit/compliance-alerts/${alertId}/review`, {
      method: 'POST'
    })
    if (response.ok) {
      router.refresh()
    }
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
          <CardDescription>Events requiring compliance review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground text-sm">
            No open compliance alerts
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Alerts</CardTitle>
        <CardDescription>
          {alerts.length} events requiring compliance review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                alert.severity === 'high' || alert.severity === 'critical'
                  ? 'bg-red-950/20 border-red-800'
                  : 'bg-yellow-950/20 border-yellow-800'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <AlertTriangle
                  className={`h-4 w-4 ${
                    alert.severity === 'high' || alert.severity === 'critical'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {alert.alert_type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {alert.description || 'No description'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReview(alert.id)}
              >
                Review
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
