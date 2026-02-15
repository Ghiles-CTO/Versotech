'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Upload,
  FolderPlus,
  RefreshCw,
  Menu,
  ArrowLeft,
  Home,
  Building2,
  Package,
  Loader2,
  Briefcase,
  Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { FolderBreadcrumbs } from './navigation/FolderBreadcrumbs'
import { FolderNavigator } from './navigation/FolderNavigator'
import { FolderTreeDrawer } from './navigation/FolderTreeDrawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Search, X, Folder, FolderOpen, ChevronRight, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { FOLDER_ICON_COLORS } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { UploadDestinationBanner } from './upload/UploadDestinationBanner'
import { DocumentUploadDialog } from './document-upload-dialog'
import { MoveDocumentDialog } from './move-document-dialog'
import { BulkMoveDialog } from './bulk-move-dialog'
import { BulkDeleteDialog } from './bulk-delete-dialog'
import { CreateFolderDialog } from './create-folder-dialog'
import { RenameFolderDialog } from './rename-folder-dialog'
import { RenameDocumentDialog } from './rename-document-dialog'
import { DocumentFolder } from '@/types/documents'
import { parseVehicleHierarchy, VehicleNode } from '@/lib/documents/vehicle-hierarchy'
import { toast } from 'sonner'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from './DocumentViewerFullscreen'
import { VersionHistorySheet } from './version-history-sheet'

interface Vehicle {
  id: string
  name: string
  type: string
}

interface Deal {
  id: string
  name: string
  status: string
  vehicle_id: string | null
}

interface DataRoomDocument {
  id: string
  deal_id: string
  folder: string | null
  file_key: string | null
  file_name: string | null
  visible_to_investors: boolean
  tags: string[] | null
  document_expires_at: string | null
  document_notes: string | null
  version: number
  file_size_bytes: number | null
  mime_type: string | null
  external_link: string | null
  is_featured: boolean | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface StaffDocument {
  id: string
  name: string
  type: string
  status: string
  file_size_bytes: number
  is_published: boolean
  created_at: string
  mime_type?: string
  tags?: string[]
  current_version?: number
  folder?: {
    id: string
    name: string
    path: string
  }
  vehicle?: {
    id: string
    name: string
  }
  created_by_profile?: {
    display_name: string
  }
}

// Search result from /api/staff/documents/search
interface SearchResult {
  id: string
  name: string
  type: string
  file_size: number
  status: string
  created_at: string
  updated_at: string
  tags: string[] | null
  current_version: number | null
  document_expiry_date: string | null
  watermark: unknown
  folder_id: string | null
  folder_name: string | null
  vehicle_id: string | null
  vehicle_name: string | null
}

interface StaffDocumentsClientProps {
  initialVehicles: Vehicle[]
  userProfile: {
    role: string
    display_name: string
    title?: string
  }
}

export function StaffDocumentsClient({ initialVehicles, userProfile }: StaffDocumentsClientProps) {
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [showTreeDrawer, setShowTreeDrawer] = useState(false)

  // Data State
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [documents, setDocuments] = useState<StaffDocument[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false)
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [moveDialogDocId, setMoveDialogDocId] = useState<string | null>(null)
  const [moveDialogDocName, setMoveDialogDocName] = useState<string>('')
  const [moveDialogCurrentFolder, setMoveDialogCurrentFolder] = useState<string | null>(null)
  const [renameFolderDialogOpen, setRenameFolderDialogOpen] = useState(false)
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null)
  const [renameFolderName, setRenameFolderName] = useState<string>('')
  const [renameDocumentDialogOpen, setRenameDocumentDialogOpen] = useState(false)
  const [renameDocumentId, setRenameDocumentId] = useState<string | null>(null)
  const [renameDocumentName, setRenameDocumentName] = useState<string>('')

  // Bulk Move Dialog State
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false)

  // Bulk Delete Dialog State
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

  // Version History Sheet State
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [versionHistoryDocId, setVersionHistoryDocId] = useState<string | null>(null)
  const [versionHistoryDocName, setVersionHistoryDocName] = useState<string>('')
  const [versionHistoryCurrentVersion, setVersionHistoryCurrentVersion] = useState<number>(1)
  const [versionHistoryRefreshKey, setVersionHistoryRefreshKey] = useState(0)

  // Upload New Version State
  const [uploadVersionDocId, setUploadVersionDocId] = useState<string | null>(null)
  const [uploadVersionDocName, setUploadVersionDocName] = useState<string>('')
  const [isUploadingVersion, setIsUploadingVersion] = useState(false)
  const versionFileInputRef = useRef<HTMLInputElement>(null)

  // Drag and Drop Upload State
  const [isDragOver, setIsDragOver] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState<File[]>([])
  const dragCounterRef = useRef(0)

  // Tree folder drag-drop state (for dropping files onto folder nodes in sidebar)
  const [treeDragOverFolderId, setTreeDragOverFolderId] = useState<string | null>(null)
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | null>(null)
  const [uploadTargetFolderName, setUploadTargetFolderName] = useState<string | null>(null)

  // Document drag state (for dragging documents to folders)
  const [draggingDocumentId, setDraggingDocumentId] = useState<string | null>(null)
  const [draggingDocumentName, setDraggingDocumentName] = useState<string | null>(null)

  // URL State for sorting
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedTagFilters, setSelectedTagFilters] = useState<Set<string>>(new Set())

  // Global Document Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchTotal, setSearchTotal] = useState(0)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Document Selection State (for bulk operations)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())

  // Load viewMode from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('staff-docs-view')
    if (saved === 'grid' || saved === 'list') {
      setViewMode(saved)
    }
  }, [])

  // Load sort preferences and tag filters from URL on mount
  useEffect(() => {
    const sortParam = searchParams.get('sort')
    const dirParam = searchParams.get('dir')
    const tagsParam = searchParams.get('tags')

    if (sortParam === 'name' || sortParam === 'date' || sortParam === 'size') {
      setSortBy(sortParam)
    }
    if (dirParam === 'asc' || dirParam === 'desc') {
      setSortDir(dirParam)
    }
    // Load tag filters from URL (format: ?tags=urgent,review)
    if (tagsParam) {
      const tags = tagsParam.split(',').filter(t => t.trim())
      setSelectedTagFilters(new Set(tags))
    }
  }, [searchParams])

  // Update URL when sort changes (debounced to avoid excessive history entries)
  const updateSortUrl = useCallback((newSortBy: 'name' | 'date' | 'size', newSortDir: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSortBy)
    params.set('dir', newSortDir)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  // Handle sort change with smart defaults for direction
  const handleSortChange = useCallback((newSortBy: 'name' | 'date' | 'size') => {
    let newDir: 'asc' | 'desc'

    if (newSortBy === sortBy) {
      // Same column: toggle direction
      newDir = sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      // New column: use smart defaults (date = desc, name/size = asc)
      newDir = newSortBy === 'date' ? 'desc' : 'asc'
    }

    setSortBy(newSortBy)
    setSortDir(newDir)
    updateSortUrl(newSortBy, newDir)
  }, [sortBy, sortDir, updateSortUrl])

  // Handle direct direction change (from dropdown)
  const handleSortDirChange = useCallback((newDir: 'asc' | 'desc') => {
    setSortDir(newDir)
    updateSortUrl(sortBy, newDir)
  }, [sortBy, updateSortUrl])

  // Handle tag filter changes and persist to URL
  const handleTagFiltersChange = useCallback((newTags: Set<string>) => {
    setSelectedTagFilters(newTags)

    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (newTags.size > 0) {
      params.set('tags', Array.from(newTags).join(','))
    } else {
      params.delete('tags')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  // Global document search function (searches all documents globally)
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearchMode(false)
      setSearchTotal(0)
      return
    }

    setIsSearching(true)
    setIsSearchMode(true)

    try {
      const params = new URLSearchParams({ q: query })

      const response = await fetch(`/api/staff/documents/search?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        setSearchTotal(data.total || 0)
      } else {
        toast.error('Search failed')
        setSearchResults([])
        setSearchTotal(0)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
      setSearchResults([])
      setSearchTotal(0)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search handler (300ms)
  const handleGlobalSearchChange = useCallback((query: string) => {
    setGlobalSearchQuery(query)

    // Clear previous timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    // If empty, exit search mode immediately
    if (!query.trim()) {
      setSearchResults([])
      setIsSearchMode(false)
      setSearchTotal(0)
      return
    }

    // Debounce search API call
    searchDebounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)
  }, [performSearch])

  // Clear search and return to folder view
  const clearSearch = useCallback(() => {
    setGlobalSearchQuery('')
    setSearchResults([])
    setIsSearchMode(false)
    setSearchTotal(0)
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
      if (treeSearchDebounceRef.current) {
        clearTimeout(treeSearchDebounceRef.current)
      }
    }
  }, [])

  // Debounced tree search handler (150ms)
  const handleTreeSearchChange = useCallback((query: string) => {
    setTreeSearchQuery(query)

    // Clear previous timeout
    if (treeSearchDebounceRef.current) {
      clearTimeout(treeSearchDebounceRef.current)
    }

    // If empty, clear immediately
    if (!query.trim()) {
      setDebouncedTreeSearch('')
      setSearchExpandedVehicles(new Set())
      setSearchExpandedFolders(new Set())
      return
    }

    // Debounce the actual filter
    treeSearchDebounceRef.current = setTimeout(() => {
      setDebouncedTreeSearch(query)
    }, 150)
  }, [])

  // Clear tree search
  const clearTreeSearch = useCallback(() => {
    setTreeSearchQuery('')
    setDebouncedTreeSearch('')
    setSearchExpandedVehicles(new Set())
    setSearchExpandedFolders(new Set())
    if (treeSearchDebounceRef.current) {
      clearTimeout(treeSearchDebounceRef.current)
    }
  }, [])

  // Document Selection Handlers
  const toggleDocumentSelection = useCallback((documentId: string) => {
    setSelectedDocuments(prev => {
      const next = new Set(prev)
      if (next.has(documentId)) {
        next.delete(documentId)
      } else {
        next.add(documentId)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedDocuments(new Set())
  }, [])

  // Bulk action handlers
  const handleBulkMove = useCallback(() => {
    if (selectedDocuments.size === 0) return
    setBulkMoveDialogOpen(true)
  }, [selectedDocuments])

  const handleBulkDelete = useCallback(() => {
    if (selectedDocuments.size === 0) return
    setBulkDeleteDialogOpen(true)
  }, [selectedDocuments])

  // Drag-Drop Upload Constants and Handlers
  const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'txt', 'jpg', 'jpeg', 'png']
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png'
  ]
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  const validateDroppedFiles = useCallback((files: File[]): { valid: File[], invalid: { file: File, reason: string }[] } => {
    const valid: File[] = []
    const invalid: { file: File, reason: string }[] = []

    files.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const isValidType = ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME_TYPES.includes(file.type)
      const isValidSize = file.size <= MAX_FILE_SIZE

      if (!isValidType) {
        invalid.push({ file, reason: 'type' })
      } else if (!isValidSize) {
        invalid.push({ file, reason: 'size' })
      } else {
        valid.push(file)
      }
    })

    return { valid, invalid }
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    // Check if files are being dragged - items may exist or types may contain 'Files'
    const hasFiles = (e.dataTransfer.items && e.dataTransfer.items.length > 0) ||
                     (e.dataTransfer.types && e.dataTransfer.types.includes('Files'))
    if (hasFiles) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    dragCounterRef.current = 0

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const { valid, invalid } = validateDroppedFiles(files)

    // Show errors for invalid files
    if (invalid.length > 0) {
      const sizeErrors = invalid.filter(i => i.reason === 'size')
      const typeErrors = invalid.filter(i => i.reason === 'type')

      if (sizeErrors.length > 0) {
        toast.error(`${sizeErrors.length} file(s) exceed 50MB limit: ${sizeErrors.map(i => i.file.name).join(', ')}`)
      }

      if (typeErrors.length > 0) {
        toast.error(`Unsupported file type(s): ${typeErrors.map(i => i.file.name).join(', ')}. Allowed: PDF, DOCX, XLSX, TXT, JPG, PNG`)
      }
    }

    // Open dialog with valid files
    if (valid.length > 0) {
      setDroppedFiles(valid)
      setUploadDialogOpen(true)
    }
  }, [validateDroppedFiles])

  // Tree folder drag handlers (for dropping files or documents on tree folder nodes)
  const handleTreeFolderDragEnter = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    // Check if files are being dragged OR if a document is being dragged
    const hasFiles = (e.dataTransfer.items && e.dataTransfer.items.length > 0) ||
                     (e.dataTransfer.types && e.dataTransfer.types.includes('Files'))
    const hasDocument = e.dataTransfer.types && e.dataTransfer.types.includes('application/x-document-id')
    if (hasFiles || hasDocument) {
      setTreeDragOverFolderId(folderId)
    }
  }, [])

  const handleTreeFolderDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only clear if leaving the folder (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setTreeDragOverFolderId(null)
    }
  }, [])

  const handleTreeFolderDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleTreeFolderDrop = useCallback(async (e: React.DragEvent, folderId: string, folderName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setTreeDragOverFolderId(null)

    // Check if this is a document drag (move) vs file drag (upload)
    const documentId = e.dataTransfer.getData('application/x-document-id')
    const documentName = e.dataTransfer.getData('application/x-document-name')

    if (documentId && documentName) {
      // This is a document move operation - inline the move logic
      setDraggingDocumentId(null)
      setDraggingDocumentName(null)

      // Optimistic update: Remove document from view
      setDocuments(prev => prev.filter(d => d.id !== documentId))

      try {
        const response = await fetch(`/api/staff/documents/${documentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder_id: folderId })
        })

        if (response.ok) {
          toast.success(`Moved "${documentName}" to ${folderName}`)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          toast.error(`Failed to move document: ${errorData.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error moving document:', error)
        toast.error('Failed to move document')
      }
      return
    }

    // Otherwise, this is a file upload operation
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const { valid, invalid } = validateDroppedFiles(files)

    // Show errors for invalid files
    if (invalid.length > 0) {
      const sizeErrors = invalid.filter(i => i.reason === 'size')
      const typeErrors = invalid.filter(i => i.reason === 'type')

      if (sizeErrors.length > 0) {
        toast.error(`${sizeErrors.length} file(s) exceed 50MB limit: ${sizeErrors.map(i => i.file.name).join(', ')}`)
      }

      if (typeErrors.length > 0) {
        toast.error(`Unsupported file type(s): ${typeErrors.map(i => i.file.name).join(', ')}. Allowed: PDF, DOCX, XLSX, TXT, JPG, PNG`)
      }
    }

    // Open dialog with valid files and target folder
    if (valid.length > 0) {
      setDroppedFiles(valid)
      setUploadTargetFolderId(folderId)
      setUploadTargetFolderName(folderName)
      toast.info(`Uploading to ${folderName}`)
      setUploadDialogOpen(true)
    }
  }, [validateDroppedFiles])

  // Clear dropped files and target folder when dialog closes
  const handleUploadDialogChange = useCallback((open: boolean) => {
    setUploadDialogOpen(open)
    if (!open) {
      setDroppedFiles([])
      setUploadTargetFolderId(null)
      setUploadTargetFolderName(null)
    }
  }, [])

  // Document drag handlers (for moving documents by dragging to folders)
  const handleDocumentDragStart = useCallback((e: React.DragEvent, documentId: string, documentName: string) => {
    setDraggingDocumentId(documentId)
    setDraggingDocumentName(documentName)
    // Set data transfer with document info (used to detect document drag vs file drag)
    e.dataTransfer.setData('application/x-document-id', documentId)
    e.dataTransfer.setData('application/x-document-name', documentName)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDocumentDragEnd = useCallback(() => {
    setDraggingDocumentId(null)
    setDraggingDocumentName(null)
  }, [])

  const handleBulkDownload = useCallback(async () => {
    if (selectedDocuments.size === 0) return

    const toastId = toast.loading('Preparing download...')

    try {
      const response = await fetch('/api/staff/documents/bulk-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_ids: Array.from(selectedDocuments)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Download failed')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'documents.zip'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/)
        if (match) {
          filename = match[1]
        }
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Get document count from headers
      const docCount = response.headers.get('X-Documents-Count') || selectedDocuments.size.toString()

      toast.dismiss(toastId)
      toast.success(`Downloaded ${docCount} document(s) as ZIP`)

      // Clear selection after successful download
      clearSelection()
    } catch (error) {
      console.error('Bulk download error:', error)
      toast.dismiss(toastId)
      toast.error(error instanceof Error ? error.message : 'Failed to download documents')
    }
  }, [selectedDocuments, clearSelection])

  // Tree Sidebar State
  const [treeSearchQuery, setTreeSearchQuery] = useState('')
  const [debouncedTreeSearch, setDebouncedTreeSearch] = useState('')
  const treeSearchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set())
  const [searchExpandedVehicles, setSearchExpandedVehicles] = useState<Set<string>>(new Set())
  const [searchExpandedFolders, setSearchExpandedFolders] = useState<Set<string>>(new Set())

  // Deals Tree State (for virtual "Deals" nodes under vehicles)
  const [expandedDealsNodes, setExpandedDealsNodes] = useState<Set<string>>(new Set())
  const [vehicleDeals, setVehicleDeals] = useState<Map<string, Deal[]>>(new Map())
  const [loadingDeals, setLoadingDeals] = useState<Set<string>>(new Set())
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)

  // Data Room State (for virtual "Data Room" folder under deals)
  const [isDataRoomMode, setIsDataRoomMode] = useState(false)
  const [dataRoomDealId, setDataRoomDealId] = useState<string | null>(null)
  const [dataRoomDealName, setDataRoomDealName] = useState<string>('')
  const [dataRoomDocuments, setDataRoomDocuments] = useState<DataRoomDocument[]>([])
  const [loadingDataRoom, setLoadingDataRoom] = useState(false)
  const [expandedDealDataRooms, setExpandedDealDataRooms] = useState<Set<string>>(new Set())

  // Vehicle Context State (for breadcrumbs)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  // Document viewer hook
  const {
    isOpen: previewOpen,
    document: previewDocument,
    previewUrl,
    isLoading: isLoadingPreview,
    error: previewError,
    openPreview,
    closePreview,
    downloadDocument: downloadFromPreview,
    watermark: previewWatermark
  } = useDocumentViewer()

  // Get vehicle object from ID
  const getVehicleById = useCallback((vehicleId: string | null): Vehicle | null => {
    if (!vehicleId) return null
    return initialVehicles.find(v => v.id === vehicleId) || null
  }, [initialVehicles])

  // Current vehicle context for breadcrumbs (from folder or explicit selection)
  const currentVehicle = useMemo(() => {
    // If folder selected, use folder's vehicle
    if (currentFolder?.vehicle_id) {
      return getVehicleById(currentFolder.vehicle_id)
    }
    // If vehicle explicitly selected (viewing vehicle root), use that
    if (selectedVehicleId) {
      return getVehicleById(selectedVehicleId)
    }
    return null
  }, [currentFolder?.vehicle_id, selectedVehicleId, getVehicleById])

  // Navigation Functions (NEW)
  const navigateToFolder = (folderId: string | null) => {
    if (currentFolderId !== null && currentFolderId !== folderId) {
      setNavigationHistory(prev => [...prev, currentFolderId])
    }

    setCurrentFolderId(folderId)

    const folder = folders.find(f => f.id === folderId)
    setCurrentFolder(folder || null)

    // Clear selection when navigating to different folder
    setSelectedDocuments(new Set())

    // Clear deal filter when navigating to a folder
    setSelectedDealId(null)

    // Clear data room mode when navigating to a folder
    setIsDataRoomMode(false)
    setDataRoomDealId(null)
    setDataRoomDealName('')
    setDataRoomDocuments([])

    // Update vehicle context based on folder
    if (folder?.vehicle_id) {
      setSelectedVehicleId(folder.vehicle_id)
    } else if (folderId === null) {
      // Going to root, clear vehicle context
      setSelectedVehicleId(null)
    }
  }

  // Navigate to vehicle root (shows vehicle in breadcrumbs, clears folder)
  const navigateToVehicle = (vehicleId: string) => {
    // Add current location to history if needed
    if (currentFolderId !== null) {
      setNavigationHistory(prev => [...prev, currentFolderId])
    }
    setCurrentFolderId(null)
    setCurrentFolder(null)
    setSelectedVehicleId(vehicleId)
    // Clear deal filter when navigating to a vehicle
    setSelectedDealId(null)
    // Clear data room mode when navigating to a vehicle
    setIsDataRoomMode(false)
    setDataRoomDealId(null)
    setDataRoomDealName('')
    setDataRoomDocuments([])
    // Expand the vehicle in sidebar
    setExpandedVehicles(prev => new Set([...prev, vehicleId]))
  }

  // Handler for breadcrumb vehicle click - returns to vehicle root
  const handleBreadcrumbVehicleClick = () => {
    if (selectedVehicleId) {
      setCurrentFolderId(null)
      setCurrentFolder(null)
      // Keep selectedVehicleId so breadcrumbs still show vehicle
    }
  }

  const navigateBack = () => {
    if (navigationHistory.length === 0) return

    const previousId = navigationHistory[navigationHistory.length - 1]
    setNavigationHistory(prev => prev.slice(0, -1))
    setCurrentFolderId(previousId)

    const folder = folders.find(f => f.id === previousId)
    setCurrentFolder(folder || null)
  }

  // Get subfolders of current location (with search filtering)
  const getSubfolders = useMemo((): DocumentFolder[] => {
    let result = folders.filter(f => f.parent_folder_id === (currentFolderId || null))

    // Filter folders by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(folder => {
        const nameMatch = folder.name.toLowerCase().includes(query)
        const pathMatch = folder.path.toLowerCase().includes(query)
        return nameMatch || pathMatch
      })
    }

    return result
  }, [folders, currentFolderId, searchQuery])

  // Get filtered documents
  const filteredDocuments = useMemo(() => {
    let result = documents

    // Search filter - comprehensive search across all relevant fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(doc => {
        const nameMatch = doc.name.toLowerCase().includes(query)
        const vehicleNameMatch = doc.vehicle?.name.toLowerCase().includes(query) || false
        const folderNameMatch = doc.folder?.name.toLowerCase().includes(query) || false
        const folderPathMatch = doc.folder?.path.toLowerCase().includes(query) || false
        const typeMatch = doc.type.toLowerCase().includes(query)
        const createdByMatch = doc.created_by_profile?.display_name.toLowerCase().includes(query) || false

        return nameMatch || vehicleNameMatch || folderNameMatch || folderPathMatch || typeMatch || createdByMatch
      })
    }

    // Tag filter - documents where tags[] contains ANY selected tag
    if (selectedTagFilters.size > 0) {
      result = result.filter(doc => {
        if (!doc.tags || doc.tags.length === 0) return false
        return doc.tags.some(tag => selectedTagFilters.has(tag))
      })
    }

    // Sort with direction support
    result = [...result].sort((a, b) => {
      let comparison = 0

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === 'size') {
        comparison = (a.file_size_bytes || 0) - (b.file_size_bytes || 0)
      }

      // Apply direction
      return sortDir === 'desc' ? -comparison : comparison
    })

    return result
  }, [documents, searchQuery, sortBy, sortDir, selectedTagFilters])

  // Transform data room documents to StaffDocument format for display
  const transformedDataRoomDocuments = useMemo((): StaffDocument[] => {
    if (!isDataRoomMode || dataRoomDocuments.length === 0) return []

    let result = dataRoomDocuments.map((doc): StaffDocument => ({
      id: doc.id,
      name: doc.file_name || 'Untitled',
      type: doc.external_link ? 'link' : (doc.mime_type?.split('/')[1] || 'file'),
      status: doc.visible_to_investors ? 'published' : 'draft',
      file_size_bytes: doc.file_size_bytes || 0,
      is_published: doc.visible_to_investors,
      created_at: doc.created_at,
      mime_type: doc.mime_type || undefined,
      tags: doc.tags || undefined,
      current_version: doc.version || 1,
      folder: doc.folder ? {
        id: doc.folder,
        name: doc.folder,
        path: `/${doc.folder}`
      } : undefined,
      vehicle: undefined,
      created_by_profile: undefined
    }))

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(doc => {
        const nameMatch = doc.name.toLowerCase().includes(query)
        const typeMatch = doc.type.toLowerCase().includes(query)
        const folderMatch = doc.folder?.name.toLowerCase().includes(query) || false
        return nameMatch || typeMatch || folderMatch
      })
    }

    // Apply tag filter
    if (selectedTagFilters.size > 0) {
      result = result.filter(doc => {
        if (!doc.tags || doc.tags.length === 0) return false
        return doc.tags.some(tag => selectedTagFilters.has(tag))
      })
    }

    // Sort with direction support
    result = [...result].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === 'size') {
        comparison = (a.file_size_bytes || 0) - (b.file_size_bytes || 0)
      }
      return sortDir === 'desc' ? -comparison : comparison
    })

    return result
  }, [isDataRoomMode, dataRoomDocuments, searchQuery, sortBy, sortDir, selectedTagFilters])

  // Effective documents: use data room documents when in data room mode, otherwise regular documents
  const effectiveDocuments = useMemo(() => {
    return isDataRoomMode ? transformedDataRoomDocuments : filteredDocuments
  }, [isDataRoomMode, transformedDataRoomDocuments, filteredDocuments])

  // Select all visible/filtered documents (defined after effectiveDocuments)
  const selectAllDocuments = useCallback(() => {
    const allIds = effectiveDocuments.map(doc => doc.id)
    setSelectedDocuments(new Set(allIds))
  }, [effectiveDocuments])

  // Get names of selected documents (for bulk delete dialog)
  const selectedDocumentNames = useMemo(() => {
    return effectiveDocuments
      .filter(doc => selectedDocuments.has(doc.id))
      .map(doc => doc.name)
  }, [effectiveDocuments, selectedDocuments])

  // Build tree structure for sidebar
  interface TreeNode {
    folder: DocumentFolder
    children: TreeNode[]
  }

  const buildFolderTree = useCallback((folders: DocumentFolder[]): TreeNode[] => {
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

  const folderTree = useMemo(() => {
    return buildFolderTree(folders)
  }, [folders, buildFolderTree])

  // Parse vehicle hierarchy for sidebar display
  const vehicleHierarchy = useMemo(() => {
    return parseVehicleHierarchy(initialVehicles)
  }, [initialVehicles])

  // Get folders for a specific vehicle
  const getFoldersForVehicle = useCallback((vehicleId: string): TreeNode[] => {
    const vehicleFolders = folders.filter(f => f.vehicle_id === vehicleId)
    return buildFolderTree(vehicleFolders)
  }, [folders, buildFolderTree])

  // Get document count for a vehicle (sum of all its folders)
  const getVehicleDocumentCount = useCallback((vehicleId: string): number => {
    const vehicleFolders = folders.filter(f => f.vehicle_id === vehicleId)
    return vehicleFolders.reduce((sum, folder) => sum + (folder.document_count || 0), 0)
  }, [folders])

  // Filter tree based on sidebar search
  const filterTreeBySearch = useCallback((tree: TreeNode[], query: string): TreeNode[] => {
    return tree
      .map((node) => {
        const nameMatches = node.folder.name.toLowerCase().includes(query)
        const pathMatches = node.folder.path.toLowerCase().includes(query)
        const filteredChildren = filterTreeBySearch(node.children, query)

        if (nameMatches || pathMatches || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          }
        }
        return null
      })
      .filter((node): node is TreeNode => node !== null)
  }, [])

  const filteredTree = useMemo(() => {
    if (!debouncedTreeSearch.trim()) return folderTree
    return filterTreeBySearch(folderTree, debouncedTreeSearch.toLowerCase())
  }, [folderTree, debouncedTreeSearch, filterTreeBySearch])

  // Filter vehicle hierarchy based on search
  const filterVehicleHierarchy = useCallback((nodes: VehicleNode[], query: string): VehicleNode[] => {
    return nodes
      .map((node) => {
        const nameMatches = node.name.toLowerCase().includes(query)
        const filteredChildren = filterVehicleHierarchy(node.children, query)

        // Also check if any folders under this vehicle match
        const vehicleFolders = folders.filter(f => f.vehicle_id === node.id)
        const folderMatches = vehicleFolders.some(f =>
          f.name.toLowerCase().includes(query) ||
          f.path.toLowerCase().includes(query)
        )

        if (nameMatches || filteredChildren.length > 0 || folderMatches) {
          return {
            ...node,
            children: filteredChildren,
          }
        }
        return null
      })
      .filter((node): node is VehicleNode => node !== null)
  }, [folders])

  const filteredVehicleHierarchy = useMemo(() => {
    if (!debouncedTreeSearch.trim()) return vehicleHierarchy
    return filterVehicleHierarchy(vehicleHierarchy, debouncedTreeSearch.toLowerCase())
  }, [vehicleHierarchy, debouncedTreeSearch, filterVehicleHierarchy])

  // Auto-expand parents when search matches children
  useEffect(() => {
    if (!debouncedTreeSearch.trim()) {
      setSearchExpandedVehicles(new Set())
      setSearchExpandedFolders(new Set())
      return
    }

    const query = debouncedTreeSearch.toLowerCase()
    const vehiclesToExpand = new Set<string>()
    const foldersToExpand = new Set<string>()

    // Helper to check if vehicle or any children match
    const findMatchingVehicles = (nodes: VehicleNode[], parentIds: string[] = []) => {
      nodes.forEach(node => {
        const nameMatches = node.name.toLowerCase().includes(query)
        const vehicleFolders = folders.filter(f => f.vehicle_id === node.id)
        const folderMatches = vehicleFolders.some(f =>
          f.name.toLowerCase().includes(query) ||
          f.path.toLowerCase().includes(query)
        )

        // Check if any children match
        let childMatches = false
        if (node.children.length > 0) {
          node.children.forEach(child => {
            if (child.name.toLowerCase().includes(query)) {
              childMatches = true
            }
            // Check child's folders too
            const childFolders = folders.filter(f => f.vehicle_id === child.id)
            if (childFolders.some(f => f.name.toLowerCase().includes(query))) {
              childMatches = true
            }
          })
        }

        // If name matches, folder matches, or children match, expand this node and all parents
        if (nameMatches || folderMatches || childMatches) {
          vehiclesToExpand.add(node.id)
          parentIds.forEach(pid => vehiclesToExpand.add(pid))
        }

        // Recurse into children
        if (node.children.length > 0) {
          findMatchingVehicles(node.children, [...parentIds, node.id])
        }
      })
    }

    // Helper to check folders and auto-expand ancestors
    const findMatchingFolders = (nodes: TreeNode[], parentIds: string[] = []) => {
      nodes.forEach(node => {
        const nameMatches = node.folder.name.toLowerCase().includes(query)
        const pathMatches = node.folder.path.toLowerCase().includes(query)

        // Check if any children match
        let childMatches = false
        const checkChildren = (children: TreeNode[]): boolean => {
          return children.some(child => {
            if (child.folder.name.toLowerCase().includes(query)) return true
            if (child.folder.path.toLowerCase().includes(query)) return true
            return checkChildren(child.children)
          })
        }
        childMatches = checkChildren(node.children)

        // If name matches or children match, expand this node and all parents
        if (nameMatches || pathMatches || childMatches) {
          foldersToExpand.add(node.folder.id)
          parentIds.forEach(pid => foldersToExpand.add(pid))
        }

        // Recurse into children
        if (node.children.length > 0) {
          findMatchingFolders(node.children, [...parentIds, node.folder.id])
        }
      })
    }

    findMatchingVehicles(vehicleHierarchy)
    findMatchingFolders(folderTree)

    setSearchExpandedVehicles(vehiclesToExpand)
    setSearchExpandedFolders(foldersToExpand)
  }, [debouncedTreeSearch, vehicleHierarchy, folderTree, folders])

  // Combined expansion sets (manual + search-triggered)
  const effectiveExpandedVehicles = useMemo(() => {
    return new Set([...expandedVehicles, ...searchExpandedVehicles])
  }, [expandedVehicles, searchExpandedVehicles])

  const effectiveExpandedFolders = useMemo(() => {
    return new Set([...expandedFolders, ...searchExpandedFolders])
  }, [expandedFolders, searchExpandedFolders])

  // Toggle folder expansion in sidebar
  const toggleSidebarFolder = (folderId: string) => {
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

  // Toggle vehicle expansion in sidebar
  const toggleSidebarVehicle = (vehicleId: string) => {
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

  // Fetch deals for a vehicle (lazy loading)
  const fetchDealsForVehicle = useCallback(async (vehicleId: string) => {
    // Skip if already loaded or currently loading
    if (vehicleDeals.has(vehicleId) || loadingDeals.has(vehicleId)) {
      return
    }

    setLoadingDeals(prev => new Set([...prev, vehicleId]))

    try {
      const response = await fetch(`/api/deals?vehicle_id=${vehicleId}`)
      if (response.ok) {
        const data = await response.json()
        setVehicleDeals(prev => {
          const next = new Map(prev)
          next.set(vehicleId, data.deals || [])
          return next
        })
      } else {
        console.error('Failed to fetch deals for vehicle:', vehicleId)
        setVehicleDeals(prev => {
          const next = new Map(prev)
          next.set(vehicleId, [])
          return next
        })
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
      setVehicleDeals(prev => {
        const next = new Map(prev)
        next.set(vehicleId, [])
        return next
      })
    } finally {
      setLoadingDeals(prev => {
        const next = new Set(prev)
        next.delete(vehicleId)
        return next
      })
    }
  }, [vehicleDeals, loadingDeals])

  // Toggle deals node expansion for a vehicle
  const toggleDealsNode = useCallback((vehicleId: string) => {
    setExpandedDealsNodes(prev => {
      const next = new Set(prev)
      const dealsNodeId = `deals-${vehicleId}`
      if (next.has(dealsNodeId)) {
        next.delete(dealsNodeId)
      } else {
        next.add(dealsNodeId)
        // Fetch deals when expanding (lazy load)
        fetchDealsForVehicle(vehicleId)
      }
      return next
    })
  }, [fetchDealsForVehicle])

  // Navigate to deal (filters documents by deal_id)
  const navigateToDeal = useCallback((dealId: string, dealName: string, vehicleId: string) => {
    setSelectedDealId(dealId)
    setSelectedVehicleId(vehicleId)
    setCurrentFolderId(null)
    setCurrentFolder(null)
    // Ensure vehicle and deals node are expanded
    setExpandedVehicles(prev => new Set([...prev, vehicleId]))
    setExpandedDealsNodes(prev => new Set([...prev, `deals-${vehicleId}`]))
    toast.info(`Viewing documents for deal: ${dealName}`)
  }, [])

  // Clear deal filter
  const clearDealFilter = useCallback(() => {
    setSelectedDealId(null)
  }, [])

  // Load data room documents for a deal
  const loadDataRoomDocuments = useCallback(async (dealId: string) => {
    setLoadingDataRoom(true)
    try {
      const response = await fetch(`/api/staff/documents/data-room/${dealId}`)
      if (response.ok) {
        const data = await response.json()
        setDataRoomDocuments(data.documents || [])
      } else {
        toast.error('Failed to load data room documents')
        setDataRoomDocuments([])
      }
    } catch (error) {
      console.error('Error loading data room documents:', error)
      toast.error('Failed to load data room documents')
      setDataRoomDocuments([])
    } finally {
      setLoadingDataRoom(false)
    }
  }, [])

  // Navigate to a deal's data room
  const navigateToDataRoom = useCallback((dealId: string, dealName: string, vehicleId: string) => {
    setIsDataRoomMode(true)
    setDataRoomDealId(dealId)
    setDataRoomDealName(dealName)
    setSelectedDealId(null) // Clear deal documents mode
    setSelectedVehicleId(vehicleId)
    setCurrentFolderId(null)
    setCurrentFolder(null)
    // Ensure vehicle, deals node, and deal's data room are expanded
    setExpandedVehicles(prev => new Set([...prev, vehicleId]))
    setExpandedDealsNodes(prev => new Set([...prev, `deals-${vehicleId}`]))
    setExpandedDealDataRooms(prev => new Set([...prev, dealId]))
    // Load data room documents
    loadDataRoomDocuments(dealId)
    toast.info(`Viewing Data Room for: ${dealName}`)
  }, [loadDataRoomDocuments])

  // Exit data room mode
  const exitDataRoom = useCallback(() => {
    setIsDataRoomMode(false)
    setDataRoomDealId(null)
    setDataRoomDealName('')
    setDataRoomDocuments([])
  }, [])

  // Toggle data room expansion for a deal in sidebar
  const toggleDealDataRoom = useCallback((dealId: string) => {
    setExpandedDealDataRooms(prev => {
      const next = new Set(prev)
      if (next.has(dealId)) {
        next.delete(dealId)
      } else {
        next.add(dealId)
      }
      return next
    })
  }, [])

  // Auto-expand current folder's ancestors
  useEffect(() => {
    if (currentFolderId && folders.length > 0) {
      const getAncestorIds = (folder: DocumentFolder): string[] => {
        const ancestors: string[] = []
        let currentFolder: DocumentFolder | undefined = folder

        while (currentFolder?.parent_folder_id) {
          ancestors.push(currentFolder.parent_folder_id)
          currentFolder = folders.find((f) => f.id === currentFolder!.parent_folder_id)
        }
        return ancestors
      }

      const currentFolder = folders.find((f) => f.id === currentFolderId)
      if (currentFolder) {
        const ancestorIds = getAncestorIds(currentFolder)
        setExpandedFolders((prev) => new Set([...prev, ...ancestorIds]))
      }
    }
  }, [currentFolderId, folders])

  const loadFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/staff/documents/folders?tree=true')

      if (response.ok) {
        const data = await response.json()
        const foldersList = data.folders || []

        // Flatten tree structure to flat array
        interface FolderTreeNode extends DocumentFolder {
          children?: FolderTreeNode[]
        }

        const flattenFolders = (nodes: FolderTreeNode[]): DocumentFolder[] => {
          const result: DocumentFolder[] = []
          nodes.forEach((node: FolderTreeNode) => {
            result.push({
              id: node.id,
              name: node.name,
              path: node.path,
              parent_folder_id: node.parent_folder_id,
              folder_type: node.folder_type,
              vehicle_id: node.vehicle_id,
              created_by: node.created_by,
              created_at: node.created_at,
              updated_at: node.updated_at,
              subfolder_count: node.children?.length || 0,
              document_count: node.document_count || 0,
            })
            if (node.children && node.children.length > 0) {
              result.push(...flattenFolders(node.children))
            }
          })
          return result
        }

        setFolders(flattenFolders(foldersList))
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        toast.error(`Failed to load folders: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error loading folders:', error)
      toast.error('Failed to load folders')
    }
  }, [])

  const getDescendantFolderIds = useCallback((folderId: string): string[] => {
    const result = [folderId]

    const findChildren = (parentId: string) => {
      const children = folders.filter(f => f.parent_folder_id === parentId)
      children.forEach(child => {
        result.push(child.id)
        findChildren(child.id)
      })
    }

    findChildren(folderId)
    return result
  }, [folders])

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      // When searching, search globally across ALL folders
      // When NOT searching, limit to current folder and descendants
      if (!searchQuery && currentFolderId) {
        // Get all descendant folder IDs for recursive display
        const folderIds = getDescendantFolderIds(currentFolderId)
        folderIds.forEach(id => params.append('folder_ids', id))
        params.append('include_subfolders', 'true')
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      // Filter by deal_id when a deal is selected
      if (selectedDealId) {
        params.append('deal_id', selectedDealId)
      }

      const response = await fetch(`/api/staff/documents?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        toast.error(`Failed to load documents: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [currentFolderId, searchQuery, statusFilter, getDescendantFolderIds, selectedDealId])

  // Load data on mount and when filters change
  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Persist viewMode to localStorage
  useEffect(() => {
    localStorage.setItem('staff-docs-view', viewMode)
  }, [viewMode])

  const oldGetDescendantFolderIds = (folderId: string): string[] => {
    const result = [folderId]

    const findChildren = (parentId: string) => {
      const children = folders.filter(f => f.parent_folder_id === parentId)
      children.forEach(child => {
        result.push(child.id)
        findChildren(child.id)
      })
    }

    findChildren(folderId)
    return result
  }

  const handleCreateFolder = (parentId: string | null = null) => {
    setCreateFolderParentId(parentId || currentFolderId)
    setCreateFolderDialogOpen(true)
  }

  const handleInitVehicleFolders = async (vehicleId: string) => {
    try {
      const vehicle = initialVehicles.find(v => v.id === vehicleId)
      const response = await fetch('/api/staff/documents/init-vehicle-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: vehicleId })
      })

      if (response.ok) {
        toast.success(`Default folders created for ${vehicle?.name || 'vehicle'}`)
        loadFolders()
      } else {
        toast.error('Failed to create vehicle folders')
      }
    } catch (error) {
      console.error('Error initializing folders:', error)
      toast.error('Failed to create vehicle folders')
    }
  }

  const handleMoveDocument = (documentId: string, documentName: string, currentFolderId: string | null) => {
    setMoveDialogDocId(documentId)
    setMoveDialogDocName(documentName)
    setMoveDialogCurrentFolder(currentFolderId)
    setMoveDialogOpen(true)
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Document deleted successfully')
        loadDocuments()
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  // Handle tags updated - optimistically update local state
  const handleTagsUpdated = useCallback((documentId: string, newTags: string[]) => {
    setDocuments(prevDocs => prevDocs.map(doc =>
      doc.id === documentId ? { ...doc, tags: newTags } as StaffDocument : doc
    ))
  }, [])

  // Handle version history - open the version history sheet
  const handleVersionHistory = useCallback((documentId: string, documentName: string, currentVersion: number) => {
    setVersionHistoryDocId(documentId)
    setVersionHistoryDocName(documentName)
    setVersionHistoryCurrentVersion(currentVersion)
    setVersionHistoryOpen(true)
  }, [])

  // Handle upload new version - trigger file input
  const handleUploadNewVersion = useCallback((documentId: string, documentName: string) => {
    setUploadVersionDocId(documentId)
    setUploadVersionDocName(documentName)
    // Trigger file input click
    versionFileInputRef.current?.click()
  }, [])

  // Handle file selected for version upload
  const handleVersionFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadVersionDocId) {
      // Reset file input
      if (versionFileInputRef.current) {
        versionFileInputRef.current.value = ''
      }
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, DOCX, XLSX, TXT, JPEG, PNG')
      if (versionFileInputRef.current) {
        versionFileInputRef.current.value = ''
      }
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size: 50MB')
      if (versionFileInputRef.current) {
        versionFileInputRef.current.value = ''
      }
      return
    }

    setIsUploadingVersion(true)
    const toastId = toast.loading(`Uploading new version of "${uploadVersionDocName}"...`)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/staff/documents/${uploadVersionDocId}/versions`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || 'Failed to upload version')
      }

      const { version } = await response.json()
      const newVersionNumber = version?.version_number || 'new'

      toast.dismiss(toastId)
      toast.success(`Uploaded version ${newVersionNumber}`)

      // Update local document state with new version number
      setDocuments(prevDocs => prevDocs.map(doc =>
        doc.id === uploadVersionDocId
          ? { ...doc, current_version: version?.version_number } as StaffDocument
          : doc
      ))

      // If version history sheet is open for this document, refresh it
      if (versionHistoryOpen && versionHistoryDocId === uploadVersionDocId) {
        setVersionHistoryCurrentVersion(version?.version_number || 1)
        setVersionHistoryRefreshKey(prev => prev + 1)
      }

    } catch (error) {
      console.error('Version upload error:', error)
      toast.dismiss(toastId)
      toast.error(error instanceof Error ? error.message : 'Failed to upload new version')
    } finally {
      setIsUploadingVersion(false)
      setUploadVersionDocId(null)
      setUploadVersionDocName('')
      // Reset file input
      if (versionFileInputRef.current) {
        versionFileInputRef.current.value = ''
      }
    }
  }, [uploadVersionDocId, uploadVersionDocName, versionHistoryOpen, versionHistoryDocId])

  const handlePublishDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/staff/documents/${documentId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediate: true })
      })

      if (response.ok) {
        toast.success('Document published successfully')
        loadDocuments()
      } else {
        toast.error('Failed to publish document')
      }
    } catch (error) {
      console.error('Error publishing document:', error)
      toast.error('Failed to publish document')
    }
  }

  const handlePreview = async (doc: StaffDocument) => {
    const fileName = doc.name || ''
    const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
    const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'odp']

    if (officeExtensions.includes(fileExt)) {
      toast.info('Office documents cannot be previewed. Click Download to view.')
      return
    }

    await openPreview({
      id: doc.id,
      file_name: doc.name,
      name: doc.name,
      file_size_bytes: doc.file_size_bytes,
      type: doc.type,
      mime_type: doc.mime_type,
    })
  }

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const data = await response.json()
        const downloadUrl = data.url || data.download_url
        if (downloadUrl) {
          window.open(downloadUrl, '_blank')
          toast.success('Download started')
        } else {
          toast.error('No download URL in response')
        }
      } else {
        toast.error('Failed to generate download link')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return

    setRenameFolderId(folderId)
    setRenameFolderName(folder.name)
    setRenameFolderDialogOpen(true)
  }

  const handleRenameDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId)
    if (!doc) return

    setRenameDocumentId(documentId)
    setRenameDocumentName(doc.name)
    setRenameDocumentDialogOpen(true)
  }

  const handleDeleteFolder = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return

    if (!confirm(`Are you sure you want to delete "${folder.name}"? This will also delete all documents and subfolders within it.`)) {
      return
    }

    try {
      const response = await fetch(`/api/staff/documents/folders/${folderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Folder deleted successfully')
        loadFolders()
        loadDocuments()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMsg = errorData.details || errorData.error || 'Unknown error'
        toast.error(`Failed to delete folder: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast.error('Failed to delete folder')
    }
  }

  // Check for vehicles without folders
  const vehiclesWithoutFolders = initialVehicles.filter(vehicle => {
    return !folders.some(folder =>
      folder.vehicle_id === vehicle.id &&
      folder.folder_type === 'vehicle_root'
    )
  })

  // Helper to highlight matching text with mark element
  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1) return text

    const before = text.slice(0, index)
    const match = text.slice(index, index + query.length)
    const after = text.slice(index + query.length)

    return (
      <>
        {before}
        <mark className="bg-yellow-300 dark:bg-yellow-500/40 text-foreground rounded-sm px-0.5">{match}</mark>
        {after}
      </>
    )
  }, [])

  // Render the "Deals" virtual node under a vehicle
  const renderDealsNode = (vehicleId: string, level: number) => {
    const dealsNodeId = `deals-${vehicleId}`
    const isExpanded = expandedDealsNodes.has(dealsNodeId)
    const deals = vehicleDeals.get(vehicleId) || []
    const isLoading = loadingDeals.has(vehicleId)

    return (
      <div key={dealsNodeId}>
        <div
          className={cn(
            'flex items-center gap-1 rounded-md transition-colors hover:bg-muted border border-transparent'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <button
            onClick={() => toggleDealsNode(vehicleId)}
            className="p-1 hover:bg-accent rounded transition-colors"
            aria-label={isExpanded ? 'Collapse deals' : 'Expand deals'}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={() => toggleDealsNode(vehicleId)}
            className="flex items-center gap-2 flex-1 py-2 pr-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
          >
            <Briefcase className="w-4 h-4 flex-shrink-0 text-purple-500" />
            <span className="truncate font-medium text-muted-foreground">Deals</span>
            {deals.length > 0 && (
              <span className="text-xs text-muted-foreground ml-auto">({deals.length})</span>
            )}
          </button>
        </div>

        {/* Render deal children when expanded */}
        {isExpanded && !isLoading && (
          <div className="mt-0.5">
            {deals.length === 0 ? (
              <div
                className="text-xs text-muted-foreground py-2"
                style={{ paddingLeft: `${(level + 1) * 16 + 8 + 20}px` }}
              >
                No deals for this vehicle
              </div>
            ) : (
              deals.map((deal) => {
                const isDealExpanded = expandedDealDataRooms.has(deal.id)
                const isDataRoomSelected = isDataRoomMode && dataRoomDealId === deal.id

                return (
                  <div key={deal.id}>
                    {/* Deal row */}
                    <div
                      className={cn(
                        'flex items-center gap-1 rounded-md transition-colors',
                        selectedDealId === deal.id
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-muted border border-transparent'
                      )}
                      style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                    >
                      {/* Expand/collapse button for Data Room */}
                      <button
                        onClick={() => toggleDealDataRoom(deal.id)}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        aria-label={isDealExpanded ? 'Collapse deal' : 'Expand deal'}
                      >
                        {isDealExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => navigateToDeal(deal.id, deal.name, vehicleId)}
                        className={cn(
                          'flex items-center gap-2 flex-1 py-2 pr-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded',
                          selectedDealId === deal.id ? 'text-foreground' : ''
                        )}
                      >
                        <Briefcase
                          className={cn(
                            'w-3.5 h-3.5 flex-shrink-0',
                            selectedDealId === deal.id ? 'text-purple-600' : 'text-purple-400'
                          )}
                        />
                        <span
                          className={cn(
                            'truncate',
                            selectedDealId === deal.id
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          {deal.name}
                        </span>
                        {deal.status && (
                          <span
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0',
                              deal.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              deal.status === 'draft' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                              deal.status === 'closed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            )}
                          >
                            {deal.status}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Data Room virtual folder under each deal */}
                    {isDealExpanded && (
                      <div
                        className={cn(
                          'flex items-center gap-1 rounded-md transition-colors mt-0.5',
                          isDataRoomSelected
                            ? 'bg-primary/20 border border-primary'
                            : 'hover:bg-muted border border-transparent'
                        )}
                        style={{ paddingLeft: `${(level + 2) * 16 + 8}px` }}
                      >
                        <div className="w-5" />
                        <button
                          onClick={() => navigateToDataRoom(deal.id, deal.name, vehicleId)}
                          className={cn(
                            'flex items-center gap-2 flex-1 py-2 pr-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded',
                            isDataRoomSelected ? 'text-foreground' : ''
                          )}
                        >
                          <Database
                            className={cn(
                              'w-3.5 h-3.5 flex-shrink-0',
                              isDataRoomSelected ? 'text-cyan-600' : 'text-cyan-500'
                            )}
                          />
                          <span
                            className={cn(
                              'truncate',
                              isDataRoomSelected
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground'
                            )}
                          >
                            Data Room
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    )
  }

  // Render a vehicle node in the sidebar
  const renderVehicleNode = (vehicle: VehicleNode, level: number = 0) => {
    const isExpanded = effectiveExpandedVehicles.has(vehicle.id)
    const vehicleFolders = getFoldersForVehicle(vehicle.id)
    // A vehicle always has children now because we add the "Deals" virtual node
    const hasChildren = true
    const documentCount = getVehicleDocumentCount(vehicle.id)

    // Filter vehicle folders based on search query
    const filteredVehicleFolders = debouncedTreeSearch
      ? filterTreeBySearch(vehicleFolders, debouncedTreeSearch.toLowerCase())
      : vehicleFolders

    // Determine icon based on vehicle type
    const VehicleIcon = vehicle.isParent ? Building2 : Package

    const isVehicleSelected = selectedVehicleId === vehicle.id && !currentFolderId && !selectedDealId && !isDataRoomMode

    return (
      <div key={vehicle.id}>
        <div
          className={cn(
            'flex items-center gap-1 rounded-md transition-colors',
            isVehicleSelected
              ? 'bg-primary/20 border border-primary'
              : 'hover:bg-muted border border-transparent'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleSidebarVehicle(vehicle.id)}
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
          <button
            onClick={() => navigateToVehicle(vehicle.id)}
            className={cn(
              'flex items-center gap-2 flex-1 py-2 pr-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded',
              isVehicleSelected
                ? 'text-foreground'
                : ''
            )}
          >
            <VehicleIcon
              className={cn(
                'w-4 h-4 flex-shrink-0',
                vehicle.isParent ? 'text-blue-500' : 'text-amber-500'
              )}
            />
            <span className={cn(
              'truncate font-medium',
              isVehicleSelected
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}>
              {debouncedTreeSearch ? highlightText(vehicle.name, debouncedTreeSearch) : vehicle.name}
            </span>
            {documentCount > 0 && (
              <span className="text-xs text-muted-foreground ml-auto">({documentCount})</span>
            )}
          </button>
        </div>

        {/* Render child vehicles, deals, and folders when expanded */}
        {isExpanded && (
          <div className="mt-0.5">
            {/* Render child vehicles (compartments/series) */}
            {vehicle.children.map((child) => renderVehicleNode(child, level + 1))}
            {/* Render "Deals" virtual node */}
            {renderDealsNode(vehicle.id, level + 1)}
            {/* Render folders for this vehicle */}
            {filteredVehicleFolders.map((folderNode) => renderSidebarTreeNode(folderNode, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Recursive tree node renderer for sidebar with context menu
  const renderSidebarTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = effectiveExpandedFolders.has(node.folder.id)
    const hasChildren = node.children.length > 0
    const isCurrent = currentFolderId === node.folder.id
    const isDragTarget = treeDragOverFolderId === node.folder.id

    // Determine if folder can be deleted:
    // - Only custom folders can be deleted (not vehicle_root or category)
    // - Folder must be empty (no documents)
    const isCustomFolder = node.folder.folder_type === 'custom'
    const hasDocuments = (node.folder.document_count || 0) > 0
    const canDelete = isCustomFolder && !hasDocuments

    return (
      <div key={node.folder.id}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-1 rounded-md transition-colors',
                isDragTarget
                  ? 'ring-2 ring-primary bg-primary/10'
                  : isCurrent
                    ? 'bg-primary/20 border border-primary'
                    : 'hover:bg-muted border border-transparent'
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onDragEnter={(e) => handleTreeFolderDragEnter(e, node.folder.id)}
              onDragLeave={handleTreeFolderDragLeave}
              onDragOver={handleTreeFolderDragOver}
              onDrop={(e) => handleTreeFolderDrop(e, node.folder.id, node.folder.name)}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleSidebarFolder(node.folder.id)}
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
              <button
                onClick={() => navigateToFolder(node.folder.id)}
                className="flex items-center gap-2 flex-1 py-2 pr-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded"
              >
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
                <span
                  className={cn(
                    'truncate font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {debouncedTreeSearch ? highlightText(node.folder.name, debouncedTreeSearch) : node.folder.name}
                </span>
                {node.folder.document_count !== undefined && node.folder.document_count > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">({node.folder.document_count})</span>
                )}
              </button>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => handleCreateFolder(node.folder.id)}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Subfolder
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => handleRenameFolder(node.folder.id)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              disabled={!canDelete}
              onClick={() => {
                if (canDelete) {
                  handleDeleteFolder(node.folder.id)
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
              {!isCustomFolder && (
                <span className="ml-auto text-xs opacity-50">(System folder)</span>
              )}
              {isCustomFolder && hasDocuments && (
                <span className="ml-auto text-xs opacity-50">(Has documents)</span>
              )}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isExpanded && hasChildren && (
          <div className="mt-0.5">
            {node.children.map((child) => renderSidebarTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowTreeDrawer(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open folder tree</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
            <p className="text-muted-foreground mt-1 hidden sm:block">
              Manage documents with hierarchical folder structure
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadDocuments()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Grid Layout - Sidebar + Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] overflow-hidden">
        {/* Desktop Sidebar - Always Visible */}
        <aside className="hidden lg:flex flex-col border-r border-border bg-muted/30">
          {/* Sidebar Header */}
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Vehicles & Folders</h2>
          </div>

          {/* Sidebar Search */}
          <div className="px-3 py-3 border-b border-border">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Filter vehicles & folders..."
                value={treeSearchQuery}
                onChange={(e) => handleTreeSearchChange(e.target.value)}
                className="pl-10 pr-10 h-9 text-sm"
              />
              {treeSearchQuery && (
                <button
                  onClick={clearTreeSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Tree */}
          <ScrollArea className="flex-1">
            <div className="px-2 py-2">
              {/* Root Option */}
              <button
                onClick={() => navigateToFolder(null)}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  currentFolderId === null
                    ? 'bg-primary/20 text-primary border border-primary'
                    : 'text-muted-foreground hover:bg-muted border border-transparent'
                )}
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span>All Documents</span>
              </button>

              {/* Vehicle Hierarchy Nodes */}
              <div className="mt-2 space-y-0.5">
                {filteredVehicleHierarchy.map((vehicle) => renderVehicleNode(vehicle, 0))}
              </div>

              {/* Orphan Folders (folders without vehicle) */}
              {filteredTree.filter(node => !node.folder.vehicle_id).length > 0 && (
                <div className="mt-4 pt-2 border-t border-border">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    General Folders
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {filteredTree
                      .filter(node => !node.folder.vehicle_id)
                      .map((node) => renderSidebarTreeNode(node, 0))}
                  </div>
                </div>
              )}

              {/* Empty State - No Matches */}
              {filteredVehicleHierarchy.length === 0 && filteredTree.filter(node => !node.folder.vehicle_id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  {debouncedTreeSearch ? (
                    <>
                      <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground text-center mb-1">
                        No matches for &ldquo;<span className="font-medium text-foreground">{debouncedTreeSearch}</span>&rdquo;
                      </p>
                      <p className="text-xs text-muted-foreground text-center mb-3">
                        Try a different search term
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearTreeSearch}
                        className="text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No vehicles or folders found
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Initialize Vehicle Folders (if needed) */}
          {vehiclesWithoutFolders.length > 0 && (
            <div className="p-3 border-t border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Init Folders ({vehiclesWithoutFolders.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {vehiclesWithoutFolders.map(vehicle => (
                    <DropdownMenuItem
                      key={vehicle.id}
                      onClick={() => handleInitVehicleFolders(vehicle.id)}
                    >
                      {vehicle.name} ({vehicle.type})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </aside>

        {/* Main Content Area - Drop Zone */}
        <main
          className="flex flex-col overflow-hidden relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center backdrop-blur-sm">
              <div className="text-center p-8 bg-background/95 rounded-lg shadow-lg border border-primary/50">
                <Upload className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
                <p className="text-lg font-semibold text-foreground">Drop files to upload</p>
                <p className="text-sm text-muted-foreground mt-2">
                  PDF, DOCX, XLSX, TXT, JPG, PNG (max 50MB each)
                </p>
              </div>
            </div>
          )}
          {/* Breadcrumbs - show when vehicle, folder, or data room is selected */}
          {(currentFolder || currentVehicle || isDataRoomMode) && (
            isDataRoomMode && dataRoomDealId ? (
              // Custom breadcrumb for Data Room mode: Vehicle > Deal > Data Room
              <nav
                className="flex items-center gap-2 px-6 py-3.5 bg-muted/50 border-b border-border transition-colors duration-200"
                aria-label="Data room breadcrumbs"
              >
                {/* Home Button */}
                <button
                  onClick={() => {
                    exitDataRoom()
                    navigateToFolder(null)
                  }}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Navigate to root"
                >
                  <Home className="w-4 h-4" strokeWidth={2} />
                </button>

                {/* Vehicle Segment */}
                {currentVehicle && (
                  <>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                    <button
                      onClick={() => {
                        exitDataRoom()
                        navigateToVehicle(currentVehicle.id)
                      }}
                      className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-md hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 truncate max-w-[160px]"
                      title={currentVehicle.name}
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" strokeWidth={2} />
                      {currentVehicle.name}
                    </button>
                  </>
                )}

                {/* Deal Segment */}
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                <button
                  onClick={() => {
                    // Navigate to deal documents (exit data room but stay on deal)
                    if (currentVehicle) {
                      setIsDataRoomMode(false)
                      setDataRoomDealId(null)
                      setDataRoomDealName('')
                      setDataRoomDocuments([])
                      navigateToDeal(dataRoomDealId, dataRoomDealName, currentVehicle.id)
                    }
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-md hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 truncate max-w-[160px]"
                  title={dataRoomDealName}
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" strokeWidth={2} />
                  {dataRoomDealName}
                </button>

                {/* Data Room Segment (current - not clickable) */}
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" strokeWidth={2} />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-md">
                  <Database className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" strokeWidth={2} />
                  <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    Data Room
                  </span>
                </div>
              </nav>
            ) : (
              <FolderBreadcrumbs
                currentFolder={currentFolder}
                onNavigate={navigateToFolder}
                vehicle={currentVehicle ? { id: currentVehicle.id, name: currentVehicle.name } : undefined}
                onVehicleClick={handleBreadcrumbVehicleClick}
              />
            )
          )}

          {/* Upload Destination Banner */}
          {currentFolder && (
            <UploadDestinationBanner currentFolder={currentFolder} />
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-3">
              {navigationHistory.length > 0 && (
                <Button variant="ghost" onClick={navigateBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {/* Mobile-only: Initialize Vehicle Folders */}
              {vehiclesWithoutFolders.length > 0 && (
                <div className="lg:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Init ({vehiclesWithoutFolders.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {vehiclesWithoutFolders.map(vehicle => (
                        <DropdownMenuItem
                          key={vehicle.id}
                          onClick={() => handleInitVehicleFolders(vehicle.id)}
                        >
                          {vehicle.name} ({vehicle.type})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => {
                setDroppedFiles([]) // Clear any dropped files
                setUploadDialogOpen(true)
              }}>
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
              <Button variant="outline" onClick={() => handleCreateFolder()}>
                <FolderPlus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Folder</span>
              </Button>
            </div>
          </div>

          {/* Main Navigator (Folders + Documents) */}
          <div className="flex-1 overflow-hidden">
            <FolderNavigator
              currentFolderId={currentFolderId}
              currentFolder={currentFolder}
              subfolders={isDataRoomMode ? [] : getSubfolders}
              documents={effectiveDocuments as any}
              isLoading={isDataRoomMode ? loadingDataRoom : loading}
              viewMode={viewMode}
              sortBy={sortBy}
              sortDir={sortDir}
              searchQuery={searchQuery}
              onNavigateToFolder={navigateToFolder}
              onDocumentClick={(docId) => {
                // Handle click from search results or regular documents
                if (isSearchMode) {
                  // For search results, find in search results and open preview
                  const searchResult = searchResults.find(r => r.id === docId)
                  if (searchResult) {
                    // Convert search result to preview format
                    handlePreview({
                      id: searchResult.id,
                      name: searchResult.name,
                      type: searchResult.type,
                      status: searchResult.status,
                      file_size_bytes: searchResult.file_size,
                      is_published: true,
                      created_at: searchResult.created_at,
                    })
                  }
                } else {
                  const doc = documents.find(d => d.id === docId)
                  if (doc) handlePreview(doc)
                }
              }}
              onUploadClick={() => {
                setDroppedFiles([]) // Clear any dropped files
                setUploadDialogOpen(true)
              }}
              onCreateFolderClick={() => handleCreateFolder()}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onCreateSubfolder={handleCreateFolder}
              onRenameDocument={handleRenameDocument}
              onDeleteDocument={handleDeleteDocument}
              onTagsUpdated={handleTagsUpdated}
              onViewModeChange={setViewMode}
              onSortChange={handleSortChange}
              onSortDirChange={handleSortDirChange}
              onSearchChange={setSearchQuery}
              // Global search props
              globalSearchQuery={globalSearchQuery}
              onGlobalSearchChange={handleGlobalSearchChange}
              onClearSearch={clearSearch}
              isSearchMode={isSearchMode}
              isSearching={isSearching}
              searchResults={searchResults}
              searchTotal={searchTotal}
              // Selection props
              selectedDocuments={selectedDocuments}
              onToggleSelection={toggleDocumentSelection}
              onSelectAll={selectAllDocuments}
              onClearSelection={clearSelection}
              // Bulk action props
              onBulkMove={handleBulkMove}
              onBulkDelete={handleBulkDelete}
              onBulkDownload={handleBulkDownload}
              // Document drag props
              draggingDocumentId={draggingDocumentId}
              onDocumentDragStart={handleDocumentDragStart}
              onDocumentDragEnd={handleDocumentDragEnd}
              // Tag filter props
              selectedTagFilters={selectedTagFilters}
              onTagFiltersChange={handleTagFiltersChange}
              // Version history props
              onVersionHistory={handleVersionHistory}
              // Upload new version prop
              onUploadNewVersion={handleUploadNewVersion}
            />
          </div>
        </main>
      </div>

      {/* Mobile Tree Drawer */}
      <FolderTreeDrawer
        open={showTreeDrawer}
        onOpenChange={setShowTreeDrawer}
        folders={folders}
        currentFolderId={currentFolderId}
        onNavigate={navigateToFolder}
      />

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={handleUploadDialogChange}
        folderId={isDataRoomMode ? null : (uploadTargetFolderId || currentFolderId)}
        currentFolder={isDataRoomMode ? null : (uploadTargetFolderId ? folders.find(f => f.id === uploadTargetFolderId) || null : currentFolder)}
        vehicleId={isDataRoomMode ? undefined : (uploadTargetFolderId ? folders.find(f => f.id === uploadTargetFolderId)?.vehicle_id || undefined : currentFolder?.vehicle_id || undefined)}
        onSuccess={() => isDataRoomMode ? loadDataRoomDocuments(dataRoomDealId!) : loadDocuments()}
        initialFiles={droppedFiles.length > 0 ? droppedFiles : undefined}
        dataRoomDealId={isDataRoomMode ? dataRoomDealId : null}
        dataRoomDealName={isDataRoomMode ? dataRoomDealName : null}
      />

      {/* Move Document Dialog */}
      <MoveDocumentDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        documentId={moveDialogDocId}
        documentName={moveDialogDocName}
        currentFolderId={moveDialogCurrentFolder}
        onSuccess={() => loadDocuments()}
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        parentFolderId={createFolderParentId}
        vehicleId={selectedVehicleId}
        onSuccess={() => loadFolders()}
      />

      {/* Rename Folder Dialog */}
      <RenameFolderDialog
        open={renameFolderDialogOpen}
        onOpenChange={setRenameFolderDialogOpen}
        folderId={renameFolderId}
        currentName={renameFolderName}
        onSuccess={() => loadFolders()}
      />

      {/* Rename Document Dialog */}
      <RenameDocumentDialog
        open={renameDocumentDialogOpen}
        onOpenChange={setRenameDocumentDialogOpen}
        documentId={renameDocumentId}
        currentName={renameDocumentName}
        onSuccess={() => loadDocuments()}
      />

      {/* Bulk Move Dialog */}
      <BulkMoveDialog
        open={bulkMoveDialogOpen}
        onOpenChange={setBulkMoveDialogOpen}
        documentIds={Array.from(selectedDocuments)}
        onSuccess={() => loadDocuments()}
        onClearSelection={clearSelection}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        documentIds={Array.from(selectedDocuments)}
        documentNames={selectedDocumentNames}
        onSuccess={() => loadDocuments()}
        onClearSelection={clearSelection}
      />

      {/* Version History Sheet */}
      <VersionHistorySheet
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        documentId={versionHistoryDocId}
        documentName={versionHistoryDocName}
        currentVersion={versionHistoryCurrentVersion}
        refreshKey={versionHistoryRefreshKey}
      />

      {/* Hidden File Input for Version Upload */}
      <input
        ref={versionFileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.xlsx,.txt,.jpg,.jpeg,.png"
        onChange={handleVersionFileSelected}
      />

      {/* Document Preview Modal */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={isLoadingPreview}
        error={previewError}
        onClose={closePreview}
        onDownload={downloadFromPreview}
        watermark={previewWatermark}
      />
    </div>
  )
}
