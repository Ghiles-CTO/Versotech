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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentEditorProps {
  dealId: string
  documentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
  initialData?: {
    file_name?: string
    folder?: string
    visible_to_investors?: boolean
    tags?: string[]
    document_notes?: string
    document_expires_at?: string | null
  }
}

const FOLDERS = [
  'Legal',
  'KYC',
  'Reports',
  'Presentations',
  'Financial Models',
  'Misc'
]

export function DataRoomDocumentEditor({
  dealId,
  documentId,
  open,
  onOpenChange,
  onSaved,
  initialData
}: DocumentEditorProps) {
  const [fileName, setFileName] = useState(initialData?.file_name || '')
  const [folder, setFolder] = useState(initialData?.folder || 'Legal')
  const [visibleToInvestors, setVisibleToInvestors] = useState(initialData?.visible_to_investors || false)
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState(initialData?.document_notes || '')
  const [expiresAt, setExpiresAt] = useState(
    initialData?.document_expires_at 
      ? new Date(initialData.document_expires_at).toISOString().slice(0, 16)
      : ''
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFileName(initialData.file_name || '')
      setFolder(initialData.folder || 'Legal')
      setVisibleToInvestors(initialData.visible_to_investors || false)
      setTags(initialData.tags || [])
      setNotes(initialData.document_notes || '')
      setExpiresAt(
        initialData.document_expires_at
          ? new Date(initialData.document_expires_at).toISOString().slice(0, 16)
          : ''
      )
    }
  }, [initialData, open])

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch(`/api/deals/${dealId}/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: fileName,
          folder,
          visible_to_investors: visibleToInvestors,
          tags,
          document_notes: notes || null,
          document_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update document')
      }

      toast.success('Document metadata updated successfully')
      onOpenChange(false)

      if (onSaved) {
        onSaved()
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document Metadata</DialogTitle>
          <DialogDescription>
            Update document details, visibility, tags, and expiry settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              placeholder="document.pdf"
            />
          </div>

          {/* Folder */}
          <div className="space-y-2">
            <Label>Folder</Label>
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLDERS.map(f => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="visible"
              checked={visibleToInvestors}
              onCheckedChange={(checked) => setVisibleToInvestors(checked as boolean)}
            />
            <label
              htmlFor="visible"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Visible to investors
            </label>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag and press Enter"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Document Expiry (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for no expiry. Expired documents will be hidden from investors.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes about this document (not visible to investors)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

