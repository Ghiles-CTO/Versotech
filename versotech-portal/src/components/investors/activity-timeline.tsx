'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText,
  DollarSign,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Upload,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Filter,
  Download
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface ActivityEvent {
  id: string
  type: 'subscription' | 'capital_call' | 'distribution' | 'kyc' | 'document' | 'message' | 'profile' | 'system'
  action: string
  description: string
  metadata?: Record<string, any>
  created_at: string
  created_by?: {
    id: string
    display_name: string
    email: string
  }
}

interface ActivityTimelineProps {
  investorId: string
  compact?: boolean
  maxHeight?: string
}

const activityIcons = {
  subscription: FileText,
  capital_call: DollarSign,
  distribution: TrendingUp,
  kyc: UserCheck,
  document: Upload,
  message: MessageSquare,
  profile: UserCheck,
  system: Info
}

const activityColors = {
  subscription: 'text-blue-600',
  capital_call: 'text-orange-600',
  distribution: 'text-green-600',
  kyc: 'text-purple-600',
  document: 'text-indigo-600',
  message: 'text-pink-600',
  profile: 'text-gray-600',
  system: 'text-gray-500'
}

const activityBgColors = {
  subscription: 'bg-blue-50',
  capital_call: 'bg-orange-50',
  distribution: 'bg-green-50',
  kyc: 'bg-purple-50',
  document: 'bg-indigo-50',
  message: 'bg-pink-50',
  profile: 'bg-gray-50',
  system: 'bg-gray-50'
}

export function ActivityTimeline({ investorId, compact = false, maxHeight = '600px' }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/staff/investors/${investorId}/activity?type=${filter}`)

        if (!response.ok) {
          // If it&apos;s a 404 or table doesn&apos;t exist, show empty state instead of error
          if (response.status === 404 || response.status === 500) {
            const errorData = await response.json().catch(() => ({}))

            // Check if it&apos;s a "table doesn&apos;t exist" error
            if (errorData.error?.includes('relation') || errorData.error?.includes('does not exist')) {
              setActivities([])
              setError(null)
              setLoading(false)
              return
            }
          }
          throw new Error('Failed to fetch activity timeline')
        }

        const data = await response.json()
        setActivities(data.activities || [])
        setError(null)
      } catch (err) {
        console.error('Failed to fetch activities:', err)
        // Show empty state instead of error for better UX
        setActivities([])
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [investorId, filter])

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/staff/investors/${investorId}/activity/export`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `investor-${investorId}-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to export activities:', err)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <CardDescription>
              Chronological history of all investor interactions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="subscription">Subscriptions</SelectItem>
                <SelectItem value="capital_call">Capital Calls</SelectItem>
                <SelectItem value="distribution">Distributions</SelectItem>
                <SelectItem value="kyc">KYC Changes</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }} className="pr-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No activities found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type]
                const iconColor = activityColors[activity.type]
                const bgColor = activityBgColors[activity.type]
                const isLast = index === activities.length - 1

                return (
                  <div key={activity.id} className="relative">
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                    )}

                    {/* Activity item */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center relative z-10`}>
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">{activity.action}</p>
                              <Badge variant="outline" className="text-xs">
                                {activity.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>

                            {/* Metadata */}
                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {Object.entries(activity.metadata).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="text-xs bg-muted px-2 py-1 rounded"
                                  >
                                    <span className="font-medium">{key}:</span>{' '}
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {activity.created_by && (
                                <>
                                  <span>by {activity.created_by.display_name}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span title={format(new Date(activity.created_at), 'PPpp')}>
                                {formatDistanceToNow(new Date(activity.created_at), {
                                  addSuffix: true
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Status indicator */}
                          {activity.metadata?.status === 'success' && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                          {activity.metadata?.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
