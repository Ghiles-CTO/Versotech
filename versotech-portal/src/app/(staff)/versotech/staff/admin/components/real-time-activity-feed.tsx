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
import { cn } from '@/lib/utils'

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

interface RealTimeActivityFeedProps {
  isDark?: boolean
}

export function RealTimeActivityFeed({ isDark = true }: RealTimeActivityFeedProps) {
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
    return isDark ? 'text-zinc-400' : 'text-gray-500'
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
    <Card className={cn(
      isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={isDark ? 'text-white' : 'text-gray-900'}>Real-Time Activity Feed</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className={cn(
                isDark
                  ? 'border-zinc-700 text-zinc-400 hover:text-white'
                  : 'border-gray-300 text-gray-600 hover:text-gray-900'
              )}
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
              className={cn(
                isDark
                  ? 'border-zinc-700 text-zinc-400 hover:text-white'
                  : 'border-gray-300 text-gray-600 hover:text-gray-900'
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className={cn(
              'h-8 w-8 animate-spin mx-auto',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )} />
            <p className={cn(
              'text-sm mt-2',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Loading activities...</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActionIcon(activity.action)
                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      isDark
                        ? 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    <div className={`mt-1 ${getActionColor(activity.action)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm">
                            <span className={cn(
                              'font-medium',
                              isDark ? 'text-white' : 'text-gray-900'
                            )}>{activity.actor_name || 'System'}</span>
                            <span className={cn(
                              'mx-1',
                              isDark ? 'text-zinc-400' : 'text-gray-500'
                            )}>•</span>
                            <span className={isDark ? 'text-zinc-400' : 'text-gray-500'}>
                              {activity.action.replace(/_/g, ' ')}
                            </span>
                          </p>
                          <p className={cn(
                            'text-xs',
                            isDark ? 'text-zinc-400' : 'text-gray-500'
                          )}>
                            {activity.entity_type}: {activity.entity_id}
                          </p>
                        </div>
                        <span className={cn(
                          'text-xs',
                          isDark ? 'text-zinc-400' : 'text-gray-500'
                        )}>
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {activities.length === 0 && (
                <div className="text-center py-8">
                  <Activity className={cn(
                    'h-8 w-8 mx-auto',
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  )} />
                  <p className={cn(
                    'text-sm mt-2',
                    isDark ? 'text-zinc-400' : 'text-gray-500'
                  )}>No recent activity</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Activity Summary */}
        <div className={cn(
          'grid grid-cols-4 gap-4 mt-6 pt-6 border-t',
          isDark ? 'border-zinc-700' : 'border-gray-200'
        )}>
          <div className="text-center">
            <p className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {activities.length}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {activities.filter(a => a.action.includes('create') || a.action.includes('insert')).length}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {activities.filter(a => a.action.includes('update')).length}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Updated</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">
              {activities.filter(a => a.action.includes('delete')).length}
            </p>
            <p className={cn(
              'text-xs',
              isDark ? 'text-zinc-400' : 'text-gray-500'
            )}>Deleted</p>
          </div>
        </div>

        <div className={cn(
          'mt-4 p-3 rounded-lg',
          isDark ? 'bg-zinc-800' : 'bg-gray-100'
        )}>
          <p className={cn(
            'text-xs flex items-center gap-2',
            isDark ? 'text-zinc-400' : 'text-gray-500'
          )}>
            <Info className="h-3 w-3" />
            Real-time updates {isPaused ? 'paused' : 'active'}. Auto-refreshes every 30 seconds.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
