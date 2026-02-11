'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Loader2, X, FolderOpen, Check, ChevronsUpDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { DATA_ROOM_DEFAULT_FOLDERS, validateFolderName } from '@/lib/data-room/constants'
import { cn } from '@/lib/utils'

interface DocumentEditorProps {
  dealId: string
  documentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
  existingFolders?: string[]
  initialData?: {
    file_name?: string
    folder?: string
    visible_to_investors?: boolean
    is_featured?: boolean
    tags?: string[]
    document_notes?: string
    document_expires_at?: string | null
  }
}

export function DataRoomDocumentEditor({
  dealId,
  documentId,
  open,
  onOpenChange,
  onSaved,
  existingFolders = [],
  initialData
}: DocumentEditorProps) {
  const [fileName, setFileName] = useState(initialData?.file_name || '')
  const [folder, setFolder] = useState(initialData?.folder || 'Data Room')
  const [visibleToInvestors, setVisibleToInvestors] = useState(initialData?.visible_to_investors || false)
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false)
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState(initialData?.document_notes || '')
  const [expiresAt, setExpiresAt] = useState(
    initialData?.document_expires_at
      ? new Date(initialData.document_expires_at).toISOString().slice(0, 16)
      : ''
  )
  const [saving, setSaving] = useState(false)
  const [folderComboOpen, setFolderComboOpen] = useState(false)
  const [folderSearch, setFolderSearch] = useState('')

  const allFolderOptions = useMemo(() => {
    const set = new Set<string>([...DATA_ROOM_DEFAULT_FOLDERS])
    existingFolders.forEach(f => set.add(f))
    return Array.from(set)
  }, [existingFolders])

  useEffect(() => {
    if (initialData) {
      setFileName(initialData.file_name || '')
      setFolder(initialData.folder || 'Data Room')
      setVisibleToInvestors(initialData.visible_to_investors || false)
      setIsFeatured(initialData.is_featured || false)
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

  const handleCreateFolder = (name: string) => {
    const result = validateFolderName(name)
    if (!result.valid) {
      toast.error(result.error)
      return
    }
    setFolder(name.trim())
    setFolderComboOpen(false)
    setFolderSearch('')
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
          is_featured: isFeatured,
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

          {/* Folder - Combobox */}
          <div className="space-y-2">
            <Label>Folder</Label>
            <Popover open={folderComboOpen} onOpenChange={setFolderComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={folderComboOpen}
                  className="w-full justify-between font-normal"
                  disabled={saving}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                    {folder || 'Select folder...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search or create folder..."
                    value={folderSearch}
                    onValueChange={setFolderSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {folderSearch.trim() && (
                        <button
                          className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                          onClick={() => handleCreateFolder(folderSearch.trim())}
                        >
                          <Plus className="h-4 w-4" />
                          Create folder: &quot;{folderSearch.trim()}&quot;
                        </button>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {allFolderOptions.map((f) => (
                        <CommandItem
                          key={f}
                          value={f}
                          onSelect={() => {
                            setFolder(f)
                            setFolderComboOpen(false)
                            setFolderSearch('')
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              folder === f ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <FolderOpen className="mr-2 h-3.5 w-3.5" />
                          {f}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Visibility & Featured */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Featured document
              </label>
            </div>
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
