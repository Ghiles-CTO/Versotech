'use client'

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
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400 opacity-50" />
        <p className="text-sm font-medium text-gray-700">No requests yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Submit a custom request to get started.
        </p>
      </div>
    )
  }

  const renderRequest = (request: RequestTicketWithRelations) => {
    const categoryConfig = REQUEST_CATEGORIES[request.category]
    const overdueStatus = isOverdue(request.due_date)
    const canDownload = request.result_doc_id && (request.status === 'ready' || request.status === 'closed')

    return (
      <div
        key={request.id}
        className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
      >
        {/* Icon */}
        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{request.subject}</h3>
              <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                {request.details || 'No additional details provided'}
              </p>
            </div>
            <ReportStatusBadge status={request.status} type="request" />
          </div>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <Badge variant="outline" className="border-gray-300 text-xs">
              {categoryConfig?.label || request.category}
            </Badge>
            <span>•</span>
            <span>{request.created_at ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true }) : 'Unknown'}</span>

            {/* Due date / Overdue warning */}
            {request.status !== 'closed' && request.status !== 'ready' && (
              <>
                <span>•</span>
                <div className={`flex items-center gap-1 ${overdueStatus ? 'text-red-600 font-medium' : ''}`}>
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
                className="gap-2 border-gray-300"
              >
                <Download className="h-4 w-4" />
                Download Result
              </Button>
            </div>
          )}

          {/* Completion note */}
          {request.completion_note && request.status === 'closed' && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs">
              <p className="mb-1 font-medium text-gray-900">Team Response:</p>
              <p className="text-gray-600">{request.completion_note}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
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
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
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
  )
}
