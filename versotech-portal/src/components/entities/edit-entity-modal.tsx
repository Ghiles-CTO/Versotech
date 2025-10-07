'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface EditEntityModalProps {
  entity: {
    id: string
    name: string
    legal_jurisdiction: string | null
    registration_number: string | null
    notes: string | null
  }
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditEntityModal({ entity, open, onClose, onSuccess }: EditEntityModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    legal_jurisdiction: entity.legal_jurisdiction || '',
    registration_number: entity.registration_number || '',
    notes: entity.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/entities/${entity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update entity')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Entity Metadata</DialogTitle>
            <DialogDescription>
              Update jurisdiction, registration, and notes for {entity.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="legal_jurisdiction">Legal Jurisdiction</Label>
              <Input
                id="legal_jurisdiction"
                value={formData.legal_jurisdiction}
                onChange={(e) => setFormData(prev => ({ ...prev, legal_jurisdiction: e.target.value }))}
                placeholder="e.g., Luxembourg, Delaware, Cayman Islands"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
                placeholder="e.g., B123456, 12-3456789"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this entity..."
                rows={4}
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
