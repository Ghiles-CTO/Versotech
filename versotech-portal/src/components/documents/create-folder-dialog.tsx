'use client'

import { useState } from 'react'
import { FolderPlus, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentFolderId?: string | null
  onSuccess?: () => void
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentFolderId,
  onSuccess
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }

    try {
      setCreating(true)
      const payload = {
        name: folderName.trim(),
        folder_type: 'custom' as const,
        ...(parentFolderId && { parent_folder_id: parentFolderId })
      }
      
      console.log('[CreateFolder] Sending payload:', payload)
      
      const response = await fetch('/api/staff/documents/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('[CreateFolder] Response status:', response.status)
      const responseText = await response.text()
      console.log('[CreateFolder] Response body:', responseText)
      
      if (response.ok) {
        toast.success('Folder created successfully')
        setFolderName('')
        onSuccess?.()
        onOpenChange(false)
      } else {
        let error: any = {}
        try {
          error = JSON.parse(responseText)
        } catch (e) {
          error = { error: responseText || 'Unknown error' }
        }
        console.error('[CreateFolder] Error response:', error)
        const errorMsg = error.details 
          ? `${error.error}: ${JSON.stringify(error.details)}` 
          : error.error || 'Failed to create folder'
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Failed to create folder')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    if (!creating) {
      setFolderName('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentFolderId ? 'Create Subfolder' : 'Create Folder'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !creating) {
                  handleCreate()
                }
              }}
              disabled={creating}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!folderName.trim() || creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

