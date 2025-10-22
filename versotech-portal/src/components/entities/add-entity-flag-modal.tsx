'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { EntityFlagSummary } from './types'

const severityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' }
]

const flagTypeOptions = [
  { value: 'compliance', label: 'Compliance' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'tasks', label: 'Operational Task' },
  { value: 'other', label: 'Other' }
]

interface AddEntityFlagModalProps {
  entityId: string
  open: boolean
  onClose: () => void
  onSuccess: (flag: EntityFlagSummary) => void
}

export function AddEntityFlagModal({ entityId, open, onClose, onSuccess }: AddEntityFlagModalProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('warning')
  const [flagType, setFlagType] = useState('documentation')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  const resetForm = () => {
    setTitle('')
    setSeverity('warning')
    setFlagType('documentation')
    setDueDate('')
    setDescription('')
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('A title is required for the flag.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/entities/${entityId}/flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          flag_type: flagType,
          severity,
          description: description.trim() || null,
          due_date: dueDate || null
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create flag')
      }

      const data = await response.json()
      toast.success('Flag created for this entity.')
      onSuccess(data.flag)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Failed to create flag:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to create flag.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise Entity Flag</DialogTitle>
          <DialogDescription>
            Highlight a compliance issue, missing documentation, or follow-up item for this vehicle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flag-title">Title *</Label>
            <Input
              id="flag-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g., KYC documents outstanding"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flag-severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger id="flag-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flag-type">Category</Label>
              <Select value={flagType} onValueChange={setFlagType}>
                <SelectTrigger id="flag-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {flagTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flag-due-date">Due Date</Label>
            <Input
              id="flag-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flag-description">Details</Label>
            <Textarea
              id="flag-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional context or remediation steps."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Flag
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
