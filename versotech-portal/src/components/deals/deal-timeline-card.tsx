'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealTimelineCardProps {
  openAt: string | null
  closeAt: string | null
  interestDeadline?: string | null
  settlementDate?: string | null
}

interface TimelineMilestone {
  label: string
  date: string | null
  status: 'past' | 'current' | 'future'
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getDaysRemaining(dateString: string | null): number | null {
  if (!dateString) return null
  const target = new Date(dateString)
  const now = new Date()
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getMilestoneStatus(dateString: string | null): 'past' | 'current' | 'future' {
  if (!dateString) return 'future'
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDay < today) return 'past'
  if (targetDay.getTime() === today.getTime()) return 'current'
  return 'future'
}

function MilestoneMarker({ status }: { status: 'past' | 'current' | 'future' }) {
  if (status === 'past') {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      </div>
    )
  }
  if (status === 'current') {
    return (
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center ring-2 ring-blue-500 ring-offset-2">
        <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <Circle className="w-5 h-5 text-gray-400" />
    </div>
  )
}

function TimelineConnector({ status }: { status: 'past' | 'current' | 'future' }) {
  return (
    <div
      className={cn(
        "flex-1 h-1 rounded-full mx-2",
        status === 'past' && "bg-emerald-400",
        status === 'current' && "bg-gradient-to-r from-emerald-400 to-gray-300",
        status === 'future' && "bg-gray-200 dark:bg-gray-700"
      )}
    />
  )
}

export function DealTimelineCard({
  openAt,
  closeAt,
  interestDeadline,
  settlementDate
}: DealTimelineCardProps) {
  const milestones: TimelineMilestone[] = [
    { label: 'Deal Open', date: openAt, status: getMilestoneStatus(openAt) },
    ...(interestDeadline ? [{ label: 'Interest Deadline', date: interestDeadline, status: getMilestoneStatus(interestDeadline) }] : []),
    { label: 'Deal Close', date: closeAt, status: getMilestoneStatus(closeAt) },
    ...(settlementDate ? [{ label: 'Settlement', date: settlementDate, status: getMilestoneStatus(settlementDate) }] : [])
  ]

  const daysToClose = getDaysRemaining(closeAt)
  const isClosingSoon = daysToClose !== null && daysToClose > 0 && daysToClose <= 7
  const isClosed = daysToClose !== null && daysToClose <= 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Deal Timeline
          </CardTitle>
          {daysToClose !== null && !isClosed && (
            <Badge variant={isClosingSoon ? "destructive" : "secondary"} className="flex items-center gap-1">
              {isClosingSoon && <AlertTriangle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              {daysToClose} day{daysToClose !== 1 ? 's' : ''} remaining
            </Badge>
          )}
          {isClosed && (
            <Badge variant="secondary" className="bg-gray-100">
              Closed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Timeline */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between">
            {milestones.map((milestone, index) => (
              <div key={milestone.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <MilestoneMarker status={milestone.status} />
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      milestone.status === 'past' && "text-emerald-600",
                      milestone.status === 'current' && "text-blue-600",
                      milestone.status === 'future' && "text-gray-500"
                    )}>
                      {milestone.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(milestone.date)}
                    </p>
                  </div>
                </div>
                {index < milestones.length - 1 && (
                  <TimelineConnector
                    status={milestone.status === 'past' && milestones[index + 1]?.status === 'past'
                      ? 'past'
                      : milestone.status === 'past' && milestones[index + 1]?.status !== 'past'
                        ? 'current'
                        : 'future'
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="sm:hidden space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <MilestoneMarker status={milestone.status} />
                {index < milestones.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-8 mt-2",
                    milestone.status === 'past' ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700"
                  )} />
                )}
              </div>
              <div className="pt-1">
                <p className={cn(
                  "text-sm font-medium",
                  milestone.status === 'past' && "text-emerald-600",
                  milestone.status === 'current' && "text-blue-600",
                  milestone.status === 'future' && "text-gray-500"
                )}>
                  {milestone.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(milestone.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
