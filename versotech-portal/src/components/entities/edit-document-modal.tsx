'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, FileText } from 'lucide-react'

interface EntityDocument {
  id: string
  name: string | null
  type: string | null
  description?: string | null
  file_key?: string | null
  external_url?: string | null
  link_type?: string | null
  created_at: string
  created_by?: string | null
  folder_id?: string | null
}

interface EditDocumentModalProps {
  open: boolean
  onClose: () => void
  document: EntityDocument
  onSuccess: () => void
}

export function EditDocumentModal({ open, onClose, document, onSuccess }: EditDocumentModalProps) {
  const [name, setName] = useState(document.name || '')
  const [description, setDescription] = useState(document.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when document changes
  useEffect(() => {
    setName(document.name || '')
    setDescription(document.description || '')
  }, [document])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Document name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/staff/documents/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update document')
      }

      toast.success('Document updated successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update document')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setName(document.name || '')
      setDescription(document.description || '')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Edit Document
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update document name and description
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Document Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              className="bg-white/5 border-white/10 text-white"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add document description (optional)"
              rows={3}
              className="bg-white/5 border-white/10 text-white"
              disabled={isSubmitting}
            />
          </div>

          {document.file_key && (
            <div className="text-xs text-gray-400 pt-2 border-t border-white/10">
              File: {document.file_key.split('/').pop()}
            </div>
          )}

          <DialogFooter className="border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
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
