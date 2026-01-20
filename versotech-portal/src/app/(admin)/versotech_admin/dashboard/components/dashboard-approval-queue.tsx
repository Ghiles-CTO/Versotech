'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ClipboardCheck,
  FileText,
  UserCheck,
  ChevronRight,
  AlertCircle,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingItems {
  approvals: number
  tasks: number
  kyc: number
}

interface ApprovalQueueItem {
  id: string
  label: string
  count: number
  href: string
  icon: LucideIcon
  description: string
}

interface DashboardApprovalQueueProps {
  days: string
}

function ApprovalQueueSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function DashboardApprovalQueue({ days }: DashboardApprovalQueueProps) {
  const [pendingItems, setPendingItems] = useState<PendingItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPendingItems() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/metrics/dashboard?days=${days}`)
        if (!response.ok) {
          throw new Error('Failed to fetch approval queue data')
        }
        const result = await response.json()
        if (result.success && result.data?.kpis?.pending) {
          setPendingItems(result.data.kpis.pending)
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchPendingItems()
  }, [days])

  if (loading) {
    return <ApprovalQueueSkeleton />
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Approval Queue
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

  if (!pendingItems) {
    return null
  }

  // Map pending items to approval queue items
  const queueItems: ApprovalQueueItem[] = [
    {
      id: 'kyc-review',
      label: 'KYC Review',
      count: pendingItems.kyc,
      href: '/versotech_admin/users?filter=kyc_pending',
      icon: UserCheck,
      description: 'Investor verification pending',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      count: pendingItems.approvals,
      href: '/versotech_admin/approvals',
      icon: FileText,
      description: 'Subscription approvals waiting',
    },
    {
      id: 'documents',
      label: 'Documents',
      count: pendingItems.tasks,
      href: '/versotech_admin/tasks',
      icon: ClipboardCheck,
      description: 'Document tasks to review',
    },
  ]

  const totalPending = queueItems.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Approval Queue
          </CardTitle>
          {totalPending > 0 && (
            <Badge variant="secondary" className="font-medium">
              {totalPending} total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {queueItems.map((item) => {
          const Icon = item.icon
          const hasItems = item.count > 0

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-colors',
                'hover:bg-accent/50 hover:border-accent',
                hasItems && 'border-primary/20 bg-primary/5'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-md',
                  hasItems
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    hasItems ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={hasItems ? 'default' : 'secondary'}
                  className={cn(
                    'min-w-[28px] justify-center',
                    hasItems && 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {item.count}
                </Badge>
                <ChevronRight className={cn(
                  'h-4 w-4',
                  hasItems ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
            </Link>
          )
        })}

        {/* Empty state */}
        {totalPending === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No pending items — you&apos;re all caught up!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
