'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Activity,
  FileText,
  Users,
  Heart,
  Lock,
  CheckCircle,
  Edit,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface DealActivityEvent {
  id: string
  timestamp: string
  type: string
  category: 'conversion' | 'audit' | 'membership' | 'interest' | 'access' | 'subscription'
  actor: {
    name: string
    email: string
    role: string
  } | null
  description: string
  details?: Record<string, any>
}

interface DealActivityTabProps {
  dealId: string
}

const categoryIcons = {
  conversion: RefreshCw,
  audit: Edit,
  membership: Users,
  interest: Heart,
  access: Lock,
  subscription: FileText
}

const categoryColors = {
  conversion: 'text-purple-600',
  audit: 'text-gray-600',
  membership: 'text-blue-600',
  interest: 'text-pink-600',
  access: 'text-orange-600',
  subscription: 'text-green-600'
}

const categoryBgColors = {
  conversion: 'bg-purple-50',
  audit: 'bg-gray-50',
  membership: 'bg-blue-50',
  interest: 'bg-pink-50',
  access: 'bg-orange-50',
  subscription: 'bg-green-50'
}

const categoryLabels = {
  conversion: 'Conversion',
  audit: 'Audit',
  membership: 'Membership',
  interest: 'Interest',
  access: 'Access',
  subscription: 'Subscription'
}

export function DealActivityTab({ dealId }: DealActivityTabProps) {
  const [activities, setActivities] = useState<DealActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 50

  const fetchActivities = async (loadMore = false) => {
    try {
      setLoading(true)
      const currentOffset = loadMore ? offset : 0
      const categoryParam = filter !== 'all' ? `&category=${filter}` : ''
      const response = await fetch(
        `/api/deals/${dealId}/activity?limit=${limit}&offset=${currentOffset}${categoryParam}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch activity timeline')
      }

      const data = await response.json()

      if (loadMore) {
        setActivities(prev => [...prev, ...(data.events || [])])
      } else {
        setActivities(data.events || [])
      }

      setHasMore(data.hasMore || false)
      setOffset(currentOffset + (data.events?.length || 0))
      setError(null)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setError('Failed to load activity timeline')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setOffset(0)
    fetchActivities(false)
  }, [dealId, filter])

  const handleLoadMore = () => {
    fetchActivities(true)
  }

  if (loading && activities.length === 0) {
    return (
      <Card className="border border-white/10 bg-white/5">
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
      <Card className="border border-white/10 bg-white/5">
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
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Complete audit trail of all deal actions
            </CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="conversion">Conversions</SelectItem>
              <SelectItem value="audit">Audit Trail</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
              <SelectItem value="interest">Interest</SelectItem>
              <SelectItem value="access">Access Control</SelectItem>
              <SelectItem value="subscription">Subscriptions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: '600px' }} className="pr-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg font-medium">No activities found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {filter === 'all'
                  ? 'There are no recorded activities for this deal in the last 90 days.'
                  : `No ${categoryLabels[filter as keyof typeof categoryLabels]} activities found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = categoryIcons[activity.category]
                const iconColor = categoryColors[activity.category]
                const bgColor = categoryBgColors[activity.category]
                const isLast = index === activities.length - 1 && !hasMore

                return (
                  <div key={activity.id} className="relative">
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                    )}

                    {/* Activity item */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center relative z-10`}
                      >
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold text-sm text-foreground">
                                {activity.type}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[activity.category]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>

                            {/* Details metadata */}
                            {activity.details && Object.keys(activity.details).length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {Object.entries(activity.details)
                                  .filter(([key]) => !['id', 'userId', 'dealId'].includes(key))
                                  .map(([key, value]) => {
                                    // Format the value nicely
                                    let displayValue = String(value)
                                    if (typeof value === 'boolean') {
                                      displayValue = value ? 'Yes' : 'No'
                                    } else if (value === null || value === undefined) {
                                      return null
                                    }

                                    return (
                                      <div
                                        key={key}
                                        className="text-xs bg-muted px-2 py-1 rounded"
                                      >
                                        <span className="font-medium">
                                          {key.replace(/_/g, ' ')}:
                                        </span>{' '}
                                        <span>{displayValue}</span>
                                      </div>
                                    )
                                  })}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {activity.actor && (
                                <>
                                  <span>
                                    by {activity.actor.name}
                                    {activity.actor.role && ` (${activity.actor.role})`}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              <span
                                title={format(new Date(activity.timestamp), 'PPpp')}
                              >
                                {formatDistanceToNow(new Date(activity.timestamp), {
                                  addSuffix: true
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Success/Error indicator */}
                          {activity.details?.status === 'success' ||
                          activity.details?.status === 'approved' ? (
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : null}
                          {activity.details?.status === 'error' ||
                          activity.details?.status === 'rejected' ? (
                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
