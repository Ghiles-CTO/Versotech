'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  User,
  FileText,
  DollarSign,
  Shield,
  RefreshCw,
  Pause,
  Play,
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  actor_id: string
  actor_name: string
  action: string
  entity_type: string
  entity_id: string
  before_value: any
  after_value: any
}

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<AuditLog[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isPausedRef = useRef(isPaused)

  // Keep ref in sync with state
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/activity-feed')
      const data = await response.json()

      if (data.success && !isPausedRef.current) {
        setActivities(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()

    // Refresh every 30 seconds if not paused
    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        fetchActivities()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchActivities])

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('insert')) return CheckCircle
    if (action.includes('update')) return User
    if (action.includes('delete')) return AlertCircle
    if (action.includes('upload')) return FileText
    return Activity
  }

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('insert')) return 'text-green-500'
    if (action.includes('update')) return 'text-blue-500'
    if (action.includes('delete')) return 'text-red-500'
    return 'text-muted-foreground'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Real-Time Activity Feed</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActivities()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading activities...</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActionIcon(activity.action)
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className={`mt-1 ${getActionColor(activity.action)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{activity.actor_name || 'System'}</span>
                            <span className="text-muted-foreground mx-1">•</span>
                            <span className="text-muted-foreground">
                              {activity.action.replace(/_/g, ' ')}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.entity_type}: {activity.entity_id}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {activities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">No recent activity</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Activity Summary */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {activities.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {activities.filter(a => a.action.includes('create') || a.action.includes('insert')).length}
            </p>
            <p className="text-xs text-muted-foreground">Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {activities.filter(a => a.action.includes('update')).length}
            </p>
            <p className="text-xs text-muted-foreground">Updated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">
              {activities.filter(a => a.action.includes('delete')).length}
            </p>
            <p className="text-xs text-muted-foreground">Deleted</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Info className="h-3 w-3" />
            Real-time updates {isPaused ? 'paused' : 'active'}. Auto-refreshes every 30 seconds.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
