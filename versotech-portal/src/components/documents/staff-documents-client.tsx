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
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { FolderBreadcrumbs } from './navigation/FolderBreadcrumbs'
import { FolderNavigator } from './navigation/FolderNavigator'
import { FolderTreeDrawer } from './navigation/FolderTreeDrawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Search, X, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { FOLDER_ICON_COLORS } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { UploadDestinationBanner } from './upload/UploadDestinationBanner'
import { DocumentUploadDialog } from './document-upload-dialog'
import { MoveDocumentDialog } from './move-document-dialog'
import { CreateFolderDialog } from './create-folder-dialog'
import { RenameFolderDialog } from './rename-folder-dialog'
import { RenameDocumentDialog } from './rename-document-dialog'
import { DocumentFolder } from '@/types/documents'
import { parseVehicleHierarchy, VehicleNode } from '@/lib/documents/vehicle-hierarchy'
import { toast } from 'sonner'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from './DocumentViewerFullscreen'

interface Vehicle {
  id: string
  name: string
  type: string
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

  // Load sort preferences from URL on mount
  useEffect(() => {
    const sortParam = searchParams.get('sort')
    const dirParam = searchParams.get('dir')

    if (sortParam === 'name' || sortParam === 'date' || sortParam === 'size') {
      setSortBy(sortParam)
    }
    if (dirParam === 'asc' || dirParam === 'desc') {
      setSortDir(dirParam)
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

  // Tree Sidebar State
  const [treeSearchQuery, setTreeSearchQuery] = useState('')
  const [debouncedTreeSearch, setDebouncedTreeSearch] = useState('')
  const treeSearchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set())
  const [searchExpandedVehicles, setSearchExpandedVehicles] = useState<Set<string>>(new Set())
  const [searchExpandedFolders, setSearchExpandedFolders] = useState<Set<string>>(new Set())

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
    downloadDocument: downloadFromPreview
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
  }, [documents, searchQuery, sortBy, sortDir])

  // Select all visible/filtered documents (defined after filteredDocuments)
  const selectAllDocuments = useCallback(() => {
    const allIds = filteredDocuments.map(doc => doc.id)
    setSelectedDocuments(new Set(allIds))
  }, [filteredDocuments])

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
  }, [currentFolderId, searchQuery, statusFilter, getDescendantFolderIds])

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
      toast.info('Office documents cannot be previewed. Use Download to view.')
      handleDownload(doc.id)
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

  // Render a vehicle node in the sidebar
  const renderVehicleNode = (vehicle: VehicleNode, level: number = 0) => {
    const isExpanded = effectiveExpandedVehicles.has(vehicle.id)
    const vehicleFolders = getFoldersForVehicle(vehicle.id)
    const hasChildren = vehicle.children.length > 0 || vehicleFolders.length > 0
    const documentCount = getVehicleDocumentCount(vehicle.id)

    // Filter vehicle folders based on search query
    const filteredVehicleFolders = debouncedTreeSearch
      ? filterTreeBySearch(vehicleFolders, debouncedTreeSearch.toLowerCase())
      : vehicleFolders

    // Determine icon based on vehicle type
    const VehicleIcon = vehicle.isParent ? Building2 : Package

    const isVehicleSelected = selectedVehicleId === vehicle.id && !currentFolderId

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
              selectedVehicleId === vehicle.id && !currentFolderId
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
              selectedVehicleId === vehicle.id && !currentFolderId
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

        {/* Render child vehicles and folders when expanded */}
        {isExpanded && hasChildren && (
          <div className="mt-0.5">
            {/* Render child vehicles (compartments/series) */}
            {vehicle.children.map((child) => renderVehicleNode(child, level + 1))}
            {/* Render folders for this vehicle */}
            {filteredVehicleFolders.map((folderNode) => renderSidebarTreeNode(folderNode, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Recursive tree node renderer for sidebar
  const renderSidebarTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = effectiveExpandedFolders.has(node.folder.id)
    const hasChildren = node.children.length > 0
    const isCurrent = currentFolderId === node.folder.id

    return (
      <div key={node.folder.id}>
        <div
          className={cn(
            'flex items-center gap-1 rounded-md transition-colors',
            isCurrent ? 'bg-primary/20 border border-primary' : 'hover:bg-muted border border-transparent'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
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

        {/* Main Content Area */}
        <main className="flex flex-col overflow-hidden">
          {/* Breadcrumbs - show when vehicle or folder is selected */}
          {(currentFolder || currentVehicle) && (
            <FolderBreadcrumbs
              currentFolder={currentFolder}
              onNavigate={navigateToFolder}
              vehicle={currentVehicle ? { id: currentVehicle.id, name: currentVehicle.name } : undefined}
              onVehicleClick={handleBreadcrumbVehicleClick}
            />
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
              <Button onClick={() => setUploadDialogOpen(true)}>
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
              subfolders={getSubfolders}
              documents={filteredDocuments as any}
              isLoading={loading}
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
              onUploadClick={() => setUploadDialogOpen(true)}
              onCreateFolderClick={() => handleCreateFolder()}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onCreateSubfolder={handleCreateFolder}
              onRenameDocument={handleRenameDocument}
              onDeleteDocument={handleDeleteDocument}
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
        onOpenChange={setUploadDialogOpen}
        folderId={currentFolderId}
        currentFolder={currentFolder}
        vehicleId={currentFolder?.vehicle_id || undefined}
        onSuccess={() => loadDocuments()}
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

      {/* Document Preview Modal */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={isLoadingPreview}
        error={previewError}
        onClose={closePreview}
        onDownload={downloadFromPreview}
      />
    </div>
  )
}
