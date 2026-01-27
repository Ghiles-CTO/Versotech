'use client'

import { useState } from 'react'
import { Trash2, Loader2, FileText, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentIds: string[]
  documentNames: string[]
  onSuccess?: () => void
  onClearSelection?: () => void
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  documentIds,
  documentNames,
  onSuccess,
  onClearSelection
}: BulkDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 })

  const handleDelete = async () => {
    if (documentIds.length === 0) return

    try {
      setDeleting(true)
      setDeleteProgress({ current: 0, total: documentIds.length })

      let successCount = 0
      let failCount = 0

      // Delete documents sequentially to show progress
      for (let i = 0; i < documentIds.length; i++) {
        const docId = documentIds[i]
        setDeleteProgress({ current: i + 1, total: documentIds.length })

        try {
          const response = await fetch(`/api/staff/documents/${docId}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            successCount++
          } else {
            failCount++
          }
        } catch {
          failCount++
        }
      }

      // Show result
      if (failCount === 0) {
        toast.success(`Deleted ${successCount} document${successCount !== 1 ? 's' : ''}`)
      } else if (successCount === 0) {
        toast.error('Failed to delete documents')
      } else {
        toast.warning(`Deleted ${successCount} document${successCount !== 1 ? 's' : ''}, ${failCount} failed`)
      }

      onSuccess?.()
      onClearSelection?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting documents:', error)
      toast.error('Failed to delete documents')
    } finally {
      setDeleting(false)
      setDeleteProgress({ current: 0, total: 0 })
    }
  }

  const documentCount = documentIds.length

  // Show first 5 document names
  const visibleNames = documentNames.slice(0, 5)
  const remainingCount = documentNames.length - 5

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete {documentCount} Document{documentCount !== 1 ? 's' : ''}?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>This action cannot be undone. The following documents will be permanently deleted:</p>

              {/* Document list */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                {visibleNames.map((name, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{name}</span>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="text-sm text-muted-foreground pl-6 italic">
                    ...and {remainingCount} more
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting {deleteProgress.current}/{deleteProgress.total}...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {documentCount} Document{documentCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
