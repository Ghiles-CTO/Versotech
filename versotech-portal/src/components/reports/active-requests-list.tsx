'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock, Download, AlertTriangle } from 'lucide-react'
import { ReportStatusBadge } from './report-status-badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import type { RequestTicketWithRelations } from '@/types/reports'
import { REQUEST_CATEGORIES, isOverdue, formatTimeRemaining } from '@/lib/reports/constants'

interface ActiveRequestsListProps {
  requests: RequestTicketWithRelations[]
  onDownload?: (requestId: string, documentId: string) => Promise<void>
}

export function ActiveRequestsList({ requests, onDownload }: ActiveRequestsListProps) {
  const activeRequests = requests?.filter(r => r.status !== 'closed') || []
  const closedRequests = requests?.filter(r => r.status === 'closed')?.slice(0, 3) || []

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>Custom requests you've submitted to the team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No requests yet. Submit a custom request to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderRequest = (request: RequestTicketWithRelations) => {
    const categoryConfig = REQUEST_CATEGORIES[request.category]
    const overdueStatus = isOverdue(request.due_date)
    const canDownload = request.result_doc_id && request.documents

    return (
      <div
        key={request.id}
        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        {/* Icon */}
        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{request.subject}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {request.details || 'No additional details provided'}
              </p>
            </div>
            <ReportStatusBadge status={request.status} type="request" />
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
            <Badge variant="outline" className="text-xs">
              {categoryConfig?.label || request.category}
            </Badge>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>

            {/* Due date / Overdue warning */}
            {request.status !== 'closed' && request.status !== 'ready' && (
              <>
                <span>•</span>
                <div className={`flex items-center gap-1 ${overdueStatus ? 'text-destructive font-medium' : ''}`}>
                  {overdueStatus && <AlertTriangle className="h-3 w-3" />}
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeRemaining(request.due_date)}</span>
                </div>
              </>
            )}

            {/* Assigned to */}
            {request.assigned_to_profile && (
              <>
                <span>•</span>
                <span>Assigned to {request.assigned_to_profile.display_name}</span>
              </>
            )}
          </div>

          {/* Actions */}
          {canDownload && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload?.(request.id, request.result_doc_id!)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Result
              </Button>
            </div>
          )}

          {/* Completion note */}
          {request.completion_note && request.status === 'closed' && (
            <div className="mt-3 p-3 bg-muted rounded-lg text-xs">
              <p className="font-medium mb-1">Team Response:</p>
              <p className="text-muted-foreground">{request.completion_note}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>
              Track your custom requests and their status
            </CardDescription>
          </div>
          {activeRequests.length > 0 && (
            <Badge variant="outline" className="text-sm">
              {activeRequests.length} Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <div className="space-y-3">
              {activeRequests.map(renderRequest)}
            </div>
          )}

          {/* Recently Closed */}
          {closedRequests.length > 0 && (
            <>
              {activeRequests.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Recently Completed
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-3 opacity-75">
                {closedRequests.map(renderRequest)}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
