'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Activity,
  AlertCircle,
  User,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  timestamp: string
  actor_id: string
  actor_name: string | null
  action: string
  entity_type: string
  entity_id: string
  before_value: unknown
  after_value: unknown
}

interface DashboardActivityFeedProps {
  days?: string
}

// Transform action names into human-readable descriptions
function getActionDescription(action: string, entityType: string): string {
  // Action mapping for common audit actions
  const actionMap: Record<string, string> = {
    // User actions
    'LOGIN': 'Signed in',
    'LOGOUT': 'Signed out',
    'CREATE': 'Created',
    'UPDATE': 'Updated',
    'DELETE': 'Deleted',
    'VIEW': 'Viewed',
    'DOWNLOAD': 'Downloaded',
    // KYC actions
    'KYC_SUBMIT': 'Submitted KYC',
    'KYC_APPROVE': 'Approved KYC',
    'KYC_REJECT': 'Rejected KYC',
    // Subscription actions
    'SUBSCRIPTION_CREATE': 'Created subscription',
    'SUBSCRIPTION_APPROVE': 'Approved subscription',
    'SUBSCRIPTION_REJECT': 'Rejected subscription',
    // Deal actions
    'DEAL_CREATE': 'Created deal',
    'DEAL_UPDATE': 'Updated deal',
    'DEAL_PUBLISH': 'Published deal',
    // Document actions
    'DOCUMENT_UPLOAD': 'Uploaded document',
    'DOCUMENT_SIGN': 'Signed document',
    // Investment actions
    'INVESTMENT_COMMIT': 'Committed investment',
    'ALLOCATION_CREATE': 'Created allocation',
  }

  // Try exact match first
  if (actionMap[action]) {
    return actionMap[action]
  }

  // Try to construct a readable description from the action and entity type
  const actionParts = action.toLowerCase().split('_')
  const verb = actionParts[0]

  const verbMap: Record<string, string> = {
    'create': 'Created',
    'update': 'Updated',
    'delete': 'Deleted',
    'view': 'Viewed',
    'download': 'Downloaded',
    'upload': 'Uploaded',
    'approve': 'Approved',
    'reject': 'Rejected',
    'sign': 'Signed',
    'submit': 'Submitted',
    'publish': 'Published',
    'archive': 'Archived',
    'restore': 'Restored',
    'lock': 'Locked',
    'unlock': 'Unlocked',
  }

  // Build description from verb and entity type
  const readableVerb = verbMap[verb] || verb.charAt(0).toUpperCase() + verb.slice(1)
  const readableEntity = entityType.toLowerCase().replace(/_/g, ' ')

  return `${readableVerb} ${readableEntity}`
}

function ActivityFeedSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function DashboardActivityFeed({ days }: DashboardActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivityFeed() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/activity-feed')
        if (!response.ok) {
          throw new Error('Failed to fetch activity feed')
        }
        const result = await response.json()
        if (result.success && result.data) {
          // Only show last 10 activities
          setActivities(result.data.slice(0, 10))
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity')
      } finally {
        setLoading(false)
      }
    }

    fetchActivityFeed()
  }, [days])

  if (loading) {
    return <ActivityFeedSkeleton />
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Scrollable activity list with max height */}
        <div className="flex-1 max-h-[280px] overflow-y-auto pr-1 -mr-1 space-y-1">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 p-2 rounded-md transition-colors',
                  'hover:bg-accent/50'
                )}
              >
                {/* Actor avatar placeholder */}
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Activity details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">
                      {activity.actor_name || 'Unknown user'}
                    </span>{' '}
                    <span className="text-muted-foreground">
                      {getActionDescription(activity.action, activity.entity_type)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All link at bottom */}
        {activities.length > 0 && (
          <div className="pt-3 mt-3 border-t">
            <Link href="/versotech_admin/activity" className="w-full">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                View All Activity
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
