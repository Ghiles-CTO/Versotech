'use client'

import { useState, useEffect } from 'react'
import { FolderTree, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'

interface MoveDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  documentName?: string
  currentFolderId?: string | null
  onSuccess?: () => void
}

interface Folder {
  id: string
  name: string
  path: string
  folder_type: string
}

export function MoveDocumentDialog({
  open,
  onOpenChange,
  documentId,
  documentName,
  currentFolderId,
  onSuccess
}: MoveDocumentDialogProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    if (open) {
      loadFolders()
    }
  }, [open])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff/documents/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
      } else {
        toast.error('Failed to load folders')
      }
    } catch (error) {
      console.error('Error loading folders:', error)
      toast.error('Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const handleMove = async () => {
    if (!documentId) return

    try {
      setMoving(true)
      // Convert "__root__" placeholder to null for the API
      const folderId = selectedFolderId === '__root__' ? null : selectedFolderId || null
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder_id: folderId
        })
      })

      if (response.ok) {
        toast.success('Document moved successfully')
        onSuccess?.()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to move document')
      }
    } catch (error) {
      console.error('Error moving document:', error)
      toast.error('Failed to move document')
    } finally {
      setMoving(false)
    }
  }

  // Filter out current folder
  const availableFolders = folders.filter(f => f.id !== currentFolderId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Document - {documentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Destination Folder</Label>
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
              </div>
            ) : (
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder..." />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="__root__">
                    Root (No Folder)
                  </SelectItem>
                  {availableFolders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {currentFolderId && (
            <p className="text-sm text-gray-500">
              Current: {folders.find(f => f.id === currentFolderId)?.path || 'Root'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedFolderId || moving}>
            {moving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Moving...
              </>
            ) : (
              <>
                <FolderTree className="h-4 w-4 mr-2" />
                Move
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

