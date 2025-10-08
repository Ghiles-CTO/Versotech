"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PRIORITY_CONFIG } from '@/lib/reports/constants'
import type { RequestPriority } from '@/types/reports'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface RequestPrioritySelectorProps {
  requestId: string
  currentPriority: RequestPriority
  onUpdate?: () => void
  variant?: 'inline' | 'dialog'
}

export function RequestPrioritySelector({
  requestId,
  currentPriority,
  onUpdate,
  variant = 'inline',
}: RequestPrioritySelectorProps) {
  const [priority, setPriority] = useState<RequestPriority>(currentPriority)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [pendingPriority, setPendingPriority] = useState<RequestPriority | null>(null)

  const priorityOptions: RequestPriority[] = ['urgent', 'high', 'normal', 'low']

  const handlePriorityChange = async (newPriority: RequestPriority) => {
    if (variant === 'dialog') {
      setPendingPriority(newPriority)
      setShowDialog(true)
      return
    }

    await updatePriority(newPriority)
  }

  const updatePriority = async (newPriority: RequestPriority) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priority: newPriority }),
      })

      if (!response.ok) {
        throw new Error('Failed to update priority')
      }

      setPriority(newPriority)
      toast.success(`Priority updated to ${PRIORITY_CONFIG[newPriority].label}`)
      onUpdate?.()
      setShowDialog(false)
    } catch (error) {
      console.error('Failed to update priority:', error)
      toast.error('Failed to update priority')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDialogConfirm = () => {
    if (pendingPriority) {
      updatePriority(pendingPriority)
    }
  }

  return (
    <>
      <Select
        value={priority}
        onValueChange={handlePriorityChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-auto gap-2 border-none bg-transparent hover:bg-white/10">
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Badge variant={PRIORITY_CONFIG[priority].badge}>
              {PRIORITY_CONFIG[priority].label}
            </Badge>
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Change Priority</SelectLabel>
            {priorityOptions.map((p) => (
              <SelectItem key={p} value={p}>
                <div className="flex items-center gap-2">
                  <Badge variant={PRIORITY_CONFIG[p].badge}>
                    {PRIORITY_CONFIG[p].label}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {variant === 'dialog' && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Request Priority</DialogTitle>
              <DialogDescription>
                Are you sure you want to change the priority from{' '}
                <Badge variant={PRIORITY_CONFIG[priority].badge}>
                  {PRIORITY_CONFIG[priority].label}
                </Badge>{' '}
                to{' '}
                {pendingPriority && (
                  <Badge variant={PRIORITY_CONFIG[pendingPriority].badge}>
                    {PRIORITY_CONFIG[pendingPriority].label}
                  </Badge>
                )}
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleDialogConfirm} disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}


