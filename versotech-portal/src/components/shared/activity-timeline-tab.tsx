'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity,
  FileText,
  UserCheck,
  UserPlus,
  Edit,
  Shield,
  Mail,
  Building2,
  Clock,
  RefreshCw,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

export type EntityType = 'investor' | 'introducer' | 'arranger' | 'lawyer' | 'partner' | 'commercial_partner'

interface ActivityTimelineTabProps {
  entityType: EntityType
  entityId: string
  entityName?: string
}

interface ActivityLog {
  id: string
  timestamp: string
  event_type: string
  action: string
  actor_name: string | null
  actor_email: string | null
  action_details: Record<string, unknown> | null
}

// Map actions to icons
const actionIcons: Record<string, React.ReactNode> = {
  created: <UserPlus className="h-4 w-4" />,
  updated: <Edit className="h-4 w-4" />,
  kyc_submitted: <Shield className="h-4 w-4" />,
  kyc_approved: <UserCheck className="h-4 w-4" />,
  kyc_rejected: <AlertCircle className="h-4 w-4" />,
  document_uploaded: <FileText className="h-4 w-4" />,
  document_deleted: <FileText className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  status_changed: <Activity className="h-4 w-4" />,
  bank_details_added: <Building2 className="h-4 w-4" />,
  bank_details_updated: <Building2 className="h-4 w-4" />,
}

// Map entity types to their database-stored names
const entityTypeMap: Record<EntityType, string[]> = {
  investor: ['investor', 'investors'],
  introducer: ['introducer', 'introducers'],
  arranger: ['arranger', 'arrangers'],
  lawyer: ['lawyer', 'lawyers'],
  partner: ['partner', 'partners'],
  commercial_partner: ['commercial_partner', 'commercial_partners', 'commercial-partner'],
}

// Format action to human-readable text
function formatAction(action: string | null | undefined): string {
  if (!action) return ''
  return action
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get badge color for event type
function getEventBadgeStyle(eventType: string): string {
  switch (eventType) {
    case 'entity_management':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'kyc_workflow':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'document_management':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'communication':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'financial':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export function ActivityTimelineTab({ entityType, entityId, entityName }: ActivityTimelineTabProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const fetchActivities = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const entityTypes = entityTypeMap[entityType].join(',')
      const response = await fetch(
        `/api/admin/activity-logs?entityId=${entityId}&entityTypes=${entityTypes}&page=${pageNum}&pageSize=${pageSize}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch activity logs')
      }

      const data = await response.json()

      if (append) {
        setActivities(prev => [...prev, ...data.logs])
      } else {
        setActivities(data.logs)
      }

      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  useEffect(() => {
    fetchActivities(1)
  }, [fetchActivities])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }

  const refresh = () => {
    setPage(1)
    fetchActivities(1)
  }

  if (loading && activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Recent activity and changes for this {entityType.replace('_', ' ')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
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
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Recent activity and changes for this {entityType.replace('_', ' ')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Recent activity and changes{entityName ? ` for ${entityName}` : ''}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Timeline */}
            <div className="relative">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative pl-8 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
                  )}

                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    {actionIcons[activity.action] || <Activity className="h-3 w-3" />}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">
                        {formatAction(activity.action)}
                      </span>
                      <Badge className={getEventBadgeStyle(activity.event_type)}>
                        {activity.event_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    {/* Actor info */}
                    <div className="text-sm text-muted-foreground">
                      {activity.actor_name || activity.actor_email || 'System'}
                    </div>

                    {/* Details */}
                    {activity.action_details && Object.keys(activity.action_details).length > 0 && (
                      <div className="text-sm text-muted-foreground mt-1 p-2 rounded bg-muted/50">
                        {Object.entries(activity.action_details).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span title={format(new Date(activity.timestamp), 'PPpp')}>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
