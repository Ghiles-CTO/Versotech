'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Building2 } from 'lucide-react'

interface EntityInfoEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: {
    display_name?: string | null
    legal_name?: string | null
    country_of_incorporation?: string | null
  }
  onSuccess?: () => void
}

export function EntityInfoEditDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess
}: EntityInfoEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    display_name: initialData.display_name || '',
    legal_name: initialData.legal_name || '',
    country_of_incorporation: initialData.country_of_incorporation || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/investors/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update entity info')
      }

      toast.success('Entity information updated')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error('Failed to update', { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Entity Information
          </DialogTitle>
          <DialogDescription>
            Update your organization&apos;s name and incorporation details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name <span className="text-destructive">*</span></Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Short name for display"
            />
            <p className="text-xs text-muted-foreground">
              The name shown in the portal (e.g., &quot;Acme Corp&quot;)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_name">Legal Name <span className="text-destructive">*</span></Label>
            <Input
              id="legal_name"
              value={formData.legal_name}
              onChange={(e) => setFormData(prev => ({ ...prev, legal_name: e.target.value }))}
              placeholder="Full legal entity name"
            />
            <p className="text-xs text-muted-foreground">
              Official registered name (e.g., &quot;Acme Corporation Ltd.&quot;)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country_of_incorporation">Country of Incorporation <span className="text-destructive">*</span></Label>
            <Input
              id="country_of_incorporation"
              value={formData.country_of_incorporation}
              onChange={(e) => setFormData(prev => ({ ...prev, country_of_incorporation: e.target.value }))}
              placeholder="e.g., Germany, United States"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
