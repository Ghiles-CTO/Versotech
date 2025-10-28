'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Dependencies {
  directors: number
  stakeholders: number
  investors: number
  documents: number
  folders: number
  deals: number
  subscriptions: number
  valuations: number
}

interface DeleteEntityDialogProps {
  open: boolean
  onClose: () => void
  entityId: string
  entityName: string
}

export function DeleteEntityDialog({ open, onClose, entityId, entityName }: DeleteEntityDialogProps) {
  const router = useRouter()
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [dependencies, setDependencies] = useState<Dependencies | null>(null)
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false)

  // Check dependencies when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen) {
      setIsCheckingDependencies(true)
      try {
        // Call DELETE endpoint to check dependencies (it will return 409 if there are dependencies)
        const response = await fetch(`/api/entities/${entityId}`, {
          method: 'DELETE'
        })

        if (response.status === 409) {
          // Has dependencies - show them
          const data = await response.json()
          setDependencies(data.dependencies)
        } else if (response.ok) {
          // No dependencies - but we haven&apos;t confirmed yet, so just show success state
          setDependencies({
            directors: 0,
            stakeholders: 0,
            investors: 0,
            documents: 0,
            folders: 0,
            deals: 0,
            subscriptions: 0,
            valuations: 0
          })
        } else {
          // Error
          const data = await response.json().catch(() => ({}))
          toast.error(data.error || 'Failed to check dependencies')
          onClose()
        }
      } catch (error) {
        console.error('Failed to check dependencies:', error)
        toast.error('Failed to check dependencies')
        onClose()
      } finally {
        setIsCheckingDependencies(false)
      }
    } else {
      setConfirmationText('')
      setDependencies(null)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (confirmationText !== entityName) {
      toast.error('Confirmation text does not match')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/entities/${entityId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 409) {
          toast.error('Cannot delete entity with dependencies. Please remove all dependencies first.')
        } else {
          throw new Error(data.error || 'Failed to delete entity')
        }
        return
      }

      toast.success(`Entity "${entityName}" deleted successfully`)
      router.push('/versotech/staff/entities')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete entity:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete entity')
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

  const hasDependencies =
    dependencies && Object.values(dependencies).some((count) => count > 0)
  const canDelete = !hasDependencies && confirmationText === entityName

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-zinc-950 border-red-500/20 text-white max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Delete Entity: {entityName}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action cannot be undone. This will permanently delete the entity and all
            associated data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isCheckingDependencies ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <span className="ml-3 text-gray-400">Checking dependencies...</span>
          </div>
        ) : dependencies ? (
          <div className="space-y-4">
            {hasDependencies ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-red-300">
                      Cannot Delete: Entity Has Dependencies
                    </p>
                    <p className="text-sm text-gray-300">
                      This entity has the following linked data that must be removed first:
                    </p>
                    <ul className="space-y-1 text-sm">
                      {dependencies.directors > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.directors} Director{dependencies.directors !== 1 ? 's' : ''}
                        </li>
                      )}
                      {dependencies.stakeholders > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.stakeholders} Stakeholder{dependencies.stakeholders !== 1 ? 's' : ''}
                        </li>
                      )}
                      {dependencies.investors > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.investors} Investor Relationship{dependencies.investors !== 1 ? 's' : ''}
                        </li>
                      )}
                      {dependencies.subscriptions > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.subscriptions} Subscription{dependencies.subscriptions !== 1 ? 's' : ''}
                        </li>
                      )}
                      {dependencies.documents > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.documents} Document{dependencies.documents !== 1 ? 's' : ''}
                        </li>
                      )}
                      {dependencies.folders > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.folders} Folder{dependencies.folders !== 1 ? 's' : ''}
                        </li>
                      )}
                      {dependencies.deals > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.deals} Deal{dependencies.deals !== 1 ? 's' : ''}
                        </li>
                      )}
                      {dependencies.valuations > 0 && (
                        <li className="text-gray-300">
                          • {dependencies.valuations} Valuation{dependencies.valuations !== 1 ? 's' : ''}
                        </li>
                      )}
                    </ul>
                    <p className="text-sm text-gray-400 mt-3">
                      Please remove all dependencies before deleting this entity.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-emerald-300">No Dependencies Found</p>
                    <p className="text-sm text-gray-300">
                      This entity has no linked data and can be safely deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!hasDependencies && (
              <div className="space-y-3 pt-2">
                <Label htmlFor="confirmation" className="text-white">
                  Type <span className="font-mono text-emerald-400">{entityName}</span> to confirm
                  deletion:
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={entityName}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  autoComplete="off"
                />
              </div>
            )}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isDeleting}
            className="bg-white/10 border-white/10 text-white hover:bg-white/20"
          >
            Cancel
          </AlertDialogCancel>
          {!hasDependencies && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Entity'
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
