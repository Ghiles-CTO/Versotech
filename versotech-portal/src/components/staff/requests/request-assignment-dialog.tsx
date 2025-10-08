"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, User, UserCheck } from 'lucide-react'

interface StaffProfile {
  id: string
  display_name: string
  email: string
  role: string
  title?: string
}

interface RequestAssignmentDialogProps {
  requestId: string
  currentAssignee?: {
    id: string
    display_name: string
  } | null
  onUpdate?: () => void
  trigger?: React.ReactNode
  currentUserId?: string
}

export function RequestAssignmentDialog({
  requestId,
  currentAssignee,
  onUpdate,
  trigger,
  currentUserId,
}: RequestAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [staffList, setStaffList] = useState<StaffProfile[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    if (open) {
      loadStaffList()
    }
  }, [open])

  const loadStaffList = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profiles?role=staff_admin%2Cstaff_ops%2Cstaff_rm', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load staff list')
      }

      const data = await response.json()
      setStaffList(data.profiles || [])
    } catch (error) {
      console.error('Failed to load staff list:', error)
      toast.error('Failed to load staff members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/staff/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assigned_to: selectedStaff,
          note: note || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign request')
      }

      const assignedStaff = staffList.find((s) => s.id === selectedStaff)
      toast.success(`Request assigned to ${assignedStaff?.display_name || 'staff member'}`)
      onUpdate?.()
      setOpen(false)
      setSelectedStaff('')
      setNote('')
    } catch (error) {
      console.error('Failed to assign request:', error)
      toast.error('Failed to assign request')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleAssignToMe = async () => {
    if (!currentUserId) {
      toast.error('User ID not available')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/staff/requests/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assigned_to: currentUserId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign request')
      }

      toast.success('Request assigned to you')
      onUpdate?.()
    } catch (error) {
      console.error('Failed to assign request:', error)
      toast.error('Failed to assign request')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            {currentAssignee ? 'Reassign' : 'Assign'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentAssignee ? 'Reassign Request' : 'Assign Request'}
          </DialogTitle>
          <DialogDescription>
            {currentAssignee ? (
              <>
                Currently assigned to <strong>{currentAssignee.display_name}</strong>. Select a
                new staff member to reassign.
              </>
            ) : (
              'Select a staff member to assign this request to.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentUserId && currentAssignee?.id !== currentUserId && (
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={handleAssignToMe}
              disabled={isAssigning}
            >
              {isAssigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              Assign to Me
            </Button>
          )}

          <div className="space-y-2">
            <Label htmlFor="staff-select">Staff Member</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger id="staff-select">
                  <SelectValue placeholder="Select staff member..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Staff Members</SelectLabel>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        <div className="flex flex-col">
                          <span>{staff.display_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {staff.title || staff.role} • {staff.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-note">Assignment Note (Optional)</Label>
            <Textarea
              id="assignment-note"
              placeholder="Add context or instructions for the assignee..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isAssigning || !selectedStaff}>
            {isAssigning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {currentAssignee ? 'Reassign' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

