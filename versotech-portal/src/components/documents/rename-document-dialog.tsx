'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface RenameDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  currentName: string
  onSuccess: () => void
}

export function RenameDocumentDialog({
  open,
  onOpenChange,
  documentId,
  currentName,
  onSuccess,
}: RenameDocumentDialogProps) {
  const [newName, setNewName] = useState(currentName)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documentId || !newName.trim()) {
      toast.error('Document name is required')
      return
    }

    if (newName.trim() === currentName) {
      toast.info('Name unchanged')
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })

      if (response.ok) {
        toast.success('Document renamed successfully')
        onSuccess()
        onOpenChange(false)
        setNewName('')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        toast.error(`Failed to rename document: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error renaming document:', error)
      toast.error('Failed to rename document')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset name when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setNewName(currentName)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Rename Document</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a new name for this document
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="document-name" className="text-white">
              Document Name
            </Label>
            <Input
              id="document-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter document name"
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
