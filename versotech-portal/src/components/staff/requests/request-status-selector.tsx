"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { REQUEST_STATUS_CONFIG } from '@/lib/reports/constants'
import type { RequestStatus } from '@/types/reports'
import { toast } from 'sonner'
import { ChevronDown, Loader2, CheckCircle, Play, X, MessageCircle, Clock } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface RequestStatusSelectorProps {
  requestId: string
  currentStatus: RequestStatus
  onUpdate?: () => void
}

const STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  open: ['assigned', 'in_progress', 'cancelled'],
  assigned: ['in_progress', 'open', 'cancelled'],
  in_progress: ['ready', 'awaiting_info', 'cancelled'],
  awaiting_info: ['in_progress'],
  ready: ['closed', 'in_progress'],
  closed: [],
  cancelled: [],
}

const STATUS_ICONS: Record<RequestStatus, React.ComponentType<{ className?: string }>> = {
  open: Clock,
  assigned: Play,
  in_progress: Play,
  awaiting_info: MessageCircle,
  ready: CheckCircle,
  closed: CheckCircle,
  cancelled: X,
}

export function RequestStatusSelector({
  requestId,
  currentStatus,
  onUpdate,
}: RequestStatusSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(null)
  const [completionNote, setCompletionNote] = useState('')

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || []
  const isTerminal = currentStatus === 'closed' || currentStatus === 'cancelled'

  const handleStatusChange = (newStatus: RequestStatus) => {
    if (newStatus === 'closed') {
      setPendingStatus(newStatus)
      setShowDialog(true)
    } else {
      updateStatus(newStatus)
    }
  }

  const updateStatus = async (newStatus: RequestStatus, note?: string) => {
    setIsUpdating(true)
    try {
      const body: any = { status: newStatus }
      if (note) {
        body.completion_note = note
      }

      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(`Status updated to ${REQUEST_STATUS_CONFIG[newStatus].label}`)
      onUpdate?.()
      setShowDialog(false)
      setCompletionNote('')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDialogConfirm = () => {
    if (pendingStatus) {
      updateStatus(pendingStatus, completionNote)
    }
  }

  if (isTerminal) {
    const StatusIcon = STATUS_ICONS[currentStatus]
    return (
      <Badge variant="outline" className="gap-1">
        <StatusIcon className="h-3 w-3" />
        {REQUEST_STATUS_CONFIG[currentStatus].label}
      </Badge>
    )
  }

  const CurrentIcon = STATUS_ICONS[currentStatus]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isUpdating || availableTransitions.length === 0}
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CurrentIcon className="h-3 w-3" />
            )}
            {REQUEST_STATUS_CONFIG[currentStatus].label}
            {availableTransitions.length > 0 && <ChevronDown className="h-3 w-3" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableTransitions.map((status) => {
            const Icon = STATUS_ICONS[status]
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {REQUEST_STATUS_CONFIG[status].label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Request</DialogTitle>
            <DialogDescription>
              Add a completion note before closing this request. This will be visible to the
              investor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="completion-note">Completion Note</Label>
              <Textarea
                id="completion-note"
                placeholder="Describe what was delivered or how the request was resolved..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDialogConfirm}
              disabled={isUpdating || !completionNote.trim()}
            >
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Close Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


