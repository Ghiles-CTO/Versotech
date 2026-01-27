'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FolderTree,
  Loader2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Home,
  Building2,
  Package
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { parseVehicleHierarchy, VehicleNode } from '@/lib/documents/vehicle-hierarchy'

interface BulkMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentIds: string[]
  documentNames?: string[]
  onSuccess?: () => void
  onClearSelection?: () => void
}

interface Folder {
  id: string
  name: string
  path: string
  folder_type: string
  parent_folder_id: string | null
  vehicle_id: string | null
  document_count?: number
}

interface Vehicle {
  id: string
  name: string
  type: string
}

interface TreeNode {
  folder: Folder
  children: TreeNode[]
}

export function BulkMoveDialog({
  open,
  onOpenChange,
  documentIds,
  documentNames = [],
  onSuccess,
  onClearSelection
}: BulkMoveDialogProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [moving, setMoving] = useState(false)
  const [moveProgress, setMoveProgress] = useState({ current: 0, total: 0 })
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      loadFolders()
      loadVehicles()
      setSelectedFolderId(null)
      setMoveProgress({ current: 0, total: 0 })
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

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles/dropdown-options')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
    }
  }

  // Build folder tree structure
  const buildFolderTree = useCallback((folders: Folder[]): TreeNode[] => {
    const folderMap = new Map<string | null, TreeNode[]>()

    folders.forEach((folder) => {
      if (!folderMap.has(folder.parent_folder_id)) {
        folderMap.set(folder.parent_folder_id, [])
      }
      folderMap.get(folder.parent_folder_id)!.push({
        folder,
        children: [],
      })
    })

    function buildChildren(parentId: string | null): TreeNode[] {
      const children = folderMap.get(parentId) || []
      return children.map((node) => ({
        ...node,
        children: buildChildren(node.folder.id),
      }))
    }

    return buildChildren(null)
  }, [])

  const folderTree = useMemo(() => buildFolderTree(folders), [folders, buildFolderTree])

  // Parse vehicle hierarchy
  const vehicleHierarchy = useMemo(() => parseVehicleHierarchy(vehicles), [vehicles])

  // Get folders for a specific vehicle
  const getFoldersForVehicle = useCallback((vehicleId: string): TreeNode[] => {
    const vehicleFolders = folders.filter(f => f.vehicle_id === vehicleId)
    return buildFolderTree(vehicleFolders)
  }, [folders, buildFolderTree])

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  // Toggle vehicle expansion
  const toggleVehicle = (vehicleId: string) => {
    setExpandedVehicles((prev) => {
      const next = new Set(prev)
      if (next.has(vehicleId)) {
        next.delete(vehicleId)
      } else {
        next.add(vehicleId)
      }
      return next
    })
  }

  // Get selected folder details
  const selectedFolder = useMemo(() => {
    if (selectedFolderId === null) return null
    return folders.find(f => f.id === selectedFolderId) || null
  }, [selectedFolderId, folders])

  const handleMove = async () => {
    if (documentIds.length === 0) return

    try {
      setMoving(true)
      setMoveProgress({ current: 0, total: documentIds.length })

      let successCount = 0
      let failCount = 0

      // Move documents sequentially to show progress
      for (let i = 0; i < documentIds.length; i++) {
        const docId = documentIds[i]
        setMoveProgress({ current: i + 1, total: documentIds.length })

        try {
          const response = await fetch(`/api/staff/documents/${docId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              folder_id: selectedFolderId
            })
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
      const folderName = selectedFolder?.name || 'Root'
      if (failCount === 0) {
        toast.success(`Moved ${successCount} document${successCount !== 1 ? 's' : ''} to ${folderName}`)
      } else if (successCount === 0) {
        toast.error(`Failed to move all documents`)
      } else {
        toast.warning(`Moved ${successCount} document${successCount !== 1 ? 's' : ''}, ${failCount} failed`)
      }

      onSuccess?.()
      onClearSelection?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error moving documents:', error)
      toast.error('Failed to move documents')
    } finally {
      setMoving(false)
      setMoveProgress({ current: 0, total: 0 })
    }
  }

  // Render a vehicle node in the tree
  const renderVehicleNode = (vehicle: VehicleNode, level: number = 0) => {
    const isExpanded = expandedVehicles.has(vehicle.id)
    const vehicleFolders = getFoldersForVehicle(vehicle.id)
    const hasChildren = vehicle.children.length > 0 || vehicleFolders.length > 0

    const VehicleIcon = vehicle.isParent ? Building2 : Package

    return (
      <div key={vehicle.id}>
        <div
          className="flex items-center gap-1 rounded-md hover:bg-muted border border-transparent"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleVehicle(vehicle.id)}
              className="p-1 hover:bg-accent rounded transition-colors"
              aria-label={isExpanded ? 'Collapse vehicle' : 'Expand vehicle'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          <div className="flex items-center gap-2 flex-1 py-2 pr-3 text-sm">
            <VehicleIcon
              className={cn(
                'w-4 h-4 flex-shrink-0',
                vehicle.isParent ? 'text-blue-500' : 'text-amber-500'
              )}
            />
            <span className="truncate font-medium text-muted-foreground">
              {vehicle.name}
            </span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-0.5">
            {vehicle.children.map((child) => renderVehicleNode(child, level + 1))}
            {vehicleFolders.map((folderNode) => renderFolderNode(folderNode, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Render a folder node in the tree
  const renderFolderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.folder.id)
    const hasChildren = node.children.length > 0
    const isSelected = selectedFolderId === node.folder.id

    return (
      <div key={node.folder.id}>
        <div
          className={cn(
            'flex items-center gap-1 rounded-md cursor-pointer transition-colors',
            isSelected
              ? 'bg-primary/20 border border-primary'
              : 'hover:bg-muted border border-transparent'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setSelectedFolderId(node.folder.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(node.folder.id)
              }}
              className="p-1 hover:bg-accent rounded transition-colors"
              aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          <div className="flex items-center gap-2 flex-1 py-2 pr-3 text-sm">
            {isExpanded ? (
              <FolderOpen
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  node.folder.folder_type === 'vehicle_root' ? 'text-blue-500' :
                  node.folder.folder_type === 'category' ? 'text-green-500' :
                  'text-muted-foreground'
                )}
              />
            ) : (
              <Folder
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  node.folder.folder_type === 'vehicle_root' ? 'text-blue-500' :
                  node.folder.folder_type === 'category' ? 'text-green-500' :
                  'text-muted-foreground'
                )}
              />
            )}
            <span className={cn(
              'truncate font-medium',
              isSelected ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {node.folder.name}
            </span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-0.5">
            {node.children.map((child) => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const documentCount = documentIds.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Move {documentCount} Document{documentCount !== 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            Select a destination folder for the selected document{documentCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Folder Tree */}
              <div className="border rounded-md">
                <ScrollArea className="h-[300px]">
                  <div className="p-2 space-y-0.5">
                    {/* Root Option */}
                    <div
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors',
                        selectedFolderId === null
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-muted border border-transparent'
                      )}
                      onClick={() => setSelectedFolderId(null)}
                    >
                      <Home className="w-4 h-4 flex-shrink-0" />
                      <span className={cn(
                        'font-medium',
                        selectedFolderId === null ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        Root (No Folder)
                      </span>
                    </div>

                    {/* Vehicle Hierarchy */}
                    <div className="mt-2 space-y-0.5">
                      {vehicleHierarchy.map((vehicle) => renderVehicleNode(vehicle, 0))}
                    </div>

                    {/* Orphan Folders */}
                    {folderTree.filter(node => !node.folder.vehicle_id).length > 0 && (
                      <div className="mt-4 pt-2 border-t border-border">
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          General Folders
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {folderTree
                            .filter(node => !node.folder.vehicle_id)
                            .map((node) => renderFolderNode(node, 0))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Selected Destination */}
              {selectedFolderId !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Destination: <span className="font-medium text-foreground">{selectedFolder?.path || 'Root (No Folder)'}</span>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={moving}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={loading || moving}>
            {moving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Moving {moveProgress.current}/{moveProgress.total}...
              </>
            ) : (
              <>
                <FolderTree className="h-4 w-4 mr-2" />
                Move {documentCount} Document{documentCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
