/**
 * Staff Documents Context Types
 *
 * Comprehensive type definitions for the staff documents module.
 * Uses discriminated unions for actions and organized state slices.
 */

import { DocumentFolder } from '@/types/documents'

// =============================================================================
// Core Data Types
// =============================================================================

export interface Vehicle {
  id: string
  name: string
  type: string
}

export interface Deal {
  id: string
  name: string
  status: string
  vehicle_id: string | null
  vehicle_name?: string | null
}

export interface StaffDocument {
  id: string
  name: string
  type: string
  status: string
  file_size_bytes: number
  deal_id?: string | null
  file_key?: string | null
  file_name?: string | null
  original_file_name?: string | null
  display_name?: string | null
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

export interface DataRoomDocument {
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

export interface SearchResult {
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

// =============================================================================
// Navigation History Entry (Discriminated Union)
// =============================================================================

/**
 * Navigation history entries track the full navigation state at each step,
 * enabling proper back button behavior across all navigation types.
 */
export type NavigationHistoryEntry =
  | { type: 'root' }
  | { type: 'vehicle'; vehicleId: string; vehicleName: string }
  | { type: 'virtual-parent'; virtualParentId: string; virtualParentName: string }
  | { type: 'folder'; folderId: string; folderName: string; vehicleId: string | null }
  | { type: 'data-room'; dealId: string; dealName: string; vehicleId: string | null }
  | {
      type: 'investor'
      investorId: string
      investorName: string
      investorType: ParticipantEntityType
      dealId: string | null
      vehicleId: string | null
    }

// =============================================================================
// State Types
// =============================================================================

export type ParticipantEntityType = 'investor' | 'partner' | 'introducer' | 'commercial_partner'

export type BrowseMode = 'vehicles' | 'deals' | 'accounts'

export interface Investor {
  id: string
  display_name: string
  email: string
  entity_type: ParticipantEntityType
}

export interface NavigationState {
  currentFolderId: string | null
  currentFolder: DocumentFolder | null
  navigationHistory: NavigationHistoryEntry[]
  selectedVehicleId: string | null
  selectedVirtualParentId: string | null // For virtual SCSP/LLC parents
  selectedDealId: string | null
  selectedInvestorId: string | null
  selectedInvestorType: ParticipantEntityType | null
  selectedInvestorDocType: string | null
  isDataRoomMode: boolean
  dataRoomDealId: string | null
  dataRoomDealName: string
}

export interface TreeState {
  expandedVehicles: Set<string>
  expandedFolders: Set<string>
  expandedDealsNodes: Set<string>
  expandedDealDataRooms: Set<string>
  expandedDealInvestors: Set<string>
  expandedDealIntroducers: Set<string>
  expandedAccountGroups: Set<ParticipantEntityType>
  expandedAccounts: Set<string>
  treeSearchQuery: string
  debouncedTreeSearch: string
  searchExpandedVehicles: Set<string>
  searchExpandedFolders: Set<string>
}

export interface UIState {
  viewMode: 'grid' | 'list'
  sortBy: 'name' | 'date' | 'size'
  sortDir: 'asc' | 'desc'
  sidebarCollapsed: boolean
  showTreeDrawer: boolean
  browseMode: BrowseMode
}

export interface SearchState {
  globalSearchQuery: string
  searchResults: SearchResult[]
  isSearchMode: boolean
  isSearching: boolean
  searchTotal: number
}

export interface SelectionState {
  selectedDocuments: Set<string>
}

export interface DataState {
  folders: DocumentFolder[]
  documents: StaffDocument[]
  vehicles: Vehicle[]
  allDeals: Deal[]
  vehicleDeals: Map<string, Deal[]>
  dealInvestors: Map<string, Investor[]>
  participantDocumentTypes: Map<string, string[]>
  accountsByType: Map<ParticipantEntityType, Investor[]>
  dataRoomDocuments: DataRoomDocument[]
  loading: boolean
  loadingAllDeals: boolean
  loadingDeals: Set<string>
  loadingInvestors: Set<string>
  loadingAccounts: Set<ParticipantEntityType>
  loadingDataRoom: boolean
}

export interface DialogState {
  uploadDialogOpen: boolean
  createFolderDialogOpen: boolean
  createFolderParentId: string | null
  moveDialogOpen: boolean
  moveDialogDocId: string | null
  moveDialogDocName: string
  moveDialogCurrentFolder: string | null
  bulkMoveDialogOpen: boolean
  bulkDeleteDialogOpen: boolean
  renameFolderDialogOpen: boolean
  renameFolderId: string | null
  renameFolderName: string
  renameDocumentDialogOpen: boolean
  renameDocumentId: string | null
  renameDocumentName: string
  versionHistoryOpen: boolean
  versionHistoryDocId: string | null
  versionHistoryDocName: string
  versionHistoryCurrentVersion: number
}

export interface DragDropState {
  isDragOver: boolean
  droppedFiles: File[]
  treeDragOverFolderId: string | null
  uploadTargetFolderId: string | null
  uploadTargetFolderName: string | null
  draggingDocumentId: string | null
  draggingDocumentName: string | null
}

export interface StaffDocumentsState {
  navigation: NavigationState
  tree: TreeState
  ui: UIState
  search: SearchState
  selection: SelectionState
  data: DataState
  dialogs: DialogState
  dragDrop: DragDropState
}

// =============================================================================
// Action Types (Discriminated Union)
// =============================================================================

// Navigation Actions
export type NavigationAction =
  | { type: 'NAVIGATE_TO_FOLDER'; folderId: string | null; folderName?: string }
  | { type: 'NAVIGATE_TO_VEHICLE'; vehicleId: string; vehicleName: string; isVirtual?: boolean }
  | { type: 'NAVIGATE_TO_DATA_ROOM'; dealId: string; dealName: string; vehicleId: string | null }
  | {
      type: 'NAVIGATE_TO_INVESTOR'
      investorId: string
      investorName: string
      investorType: ParticipantEntityType
      dealId: string | null
      vehicleId: string | null
    }
  | { type: 'SET_INVESTOR_DOC_TYPE'; docType: string | null }
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NAVIGATE_TO_ROOT' }
  | { type: 'SET_CURRENT_FOLDER'; folder: DocumentFolder | null }
  | { type: 'SET_SELECTED_DEAL'; dealId: string | null }
  | { type: 'EXIT_DATA_ROOM_MODE' }

// Tree Actions
export type TreeAction =
  | { type: 'TOGGLE_VEHICLE_EXPANDED'; vehicleId: string }
  | { type: 'TOGGLE_FOLDER_EXPANDED'; folderId: string }
  | { type: 'TOGGLE_DEALS_NODE_EXPANDED'; vehicleId: string }
  | { type: 'TOGGLE_DEAL_DATA_ROOM_EXPANDED'; dealId: string }
  | { type: 'TOGGLE_DEAL_INVESTORS_EXPANDED'; dealId: string }
  | { type: 'TOGGLE_DEAL_INTRODUCERS_EXPANDED'; dealId: string }
  | { type: 'TOGGLE_ACCOUNT_GROUP_EXPANDED'; entityType: ParticipantEntityType }
  | { type: 'TOGGLE_ACCOUNT_EXPANDED'; key: string }
  | { type: 'SET_EXPANDED_VEHICLES'; vehicleIds: Set<string> }
  | { type: 'SET_EXPANDED_FOLDERS'; folderIds: Set<string> }
  | { type: 'SET_TREE_SEARCH_QUERY'; query: string }
  | { type: 'SET_DEBOUNCED_TREE_SEARCH'; query: string }
  | { type: 'SET_SEARCH_EXPANDED'; vehicles: Set<string>; folders: Set<string> }
  | { type: 'CLEAR_TREE_SEARCH' }

// UI Actions
export type UIAction =
  | { type: 'SET_VIEW_MODE'; mode: 'grid' | 'list' }
  | { type: 'SET_SORT_BY'; sortBy: 'name' | 'date' | 'size' }
  | { type: 'SET_SORT_DIR'; dir: 'asc' | 'desc' }
  | { type: 'SET_SORT'; sortBy: 'name' | 'date' | 'size'; dir: 'asc' | 'desc' }
  | { type: 'TOGGLE_SIDEBAR_COLLAPSED' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; collapsed: boolean }
  | { type: 'SET_SHOW_TREE_DRAWER'; show: boolean }
  | { type: 'SET_BROWSE_MODE'; mode: BrowseMode }

// Search Actions
export type SearchAction =
  | { type: 'SET_GLOBAL_SEARCH_QUERY'; query: string }
  | { type: 'SET_SEARCH_RESULTS'; results: SearchResult[]; total: number }
  | { type: 'SET_IS_SEARCHING'; isSearching: boolean }
  | { type: 'ENTER_SEARCH_MODE' }
  | { type: 'EXIT_SEARCH_MODE' }
  | { type: 'CLEAR_SEARCH' }

// Selection Actions
export type SelectionAction =
  | { type: 'TOGGLE_DOCUMENT_SELECTED'; documentId: string }
  | { type: 'SELECT_DOCUMENTS'; documentIds: string[] }
  | { type: 'DESELECT_DOCUMENTS'; documentIds: string[] }
  | { type: 'SELECT_ALL_DOCUMENTS' }
  | { type: 'CLEAR_SELECTION' }

// Data Actions
export type DataAction =
  | { type: 'SET_FOLDERS'; folders: DocumentFolder[] }
  | { type: 'SET_DOCUMENTS'; documents: StaffDocument[] }
  | { type: 'SET_VEHICLES'; vehicles: Vehicle[] }
  | { type: 'SET_ALL_DEALS'; deals: Deal[] }
  | { type: 'ADD_DOCUMENT'; document: StaffDocument }
  | { type: 'UPDATE_DOCUMENT'; documentId: string; updates: Partial<StaffDocument> }
  | { type: 'REMOVE_DOCUMENT'; documentId: string }
  | { type: 'SET_VEHICLE_DEALS'; vehicleId: string; deals: Deal[] }
  | { type: 'SET_DEAL_INVESTORS'; dealId: string; investors: Investor[] }
  | { type: 'SET_PARTICIPANT_DOC_TYPES'; key: string; docTypes: string[] }
  | { type: 'SET_ACCOUNTS_BY_TYPE'; entityType: ParticipantEntityType; accounts: Investor[] }
  | { type: 'SET_DATA_ROOM_DOCUMENTS'; documents: DataRoomDocument[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_LOADING_ALL_DEALS'; loading: boolean }
  | { type: 'SET_LOADING_DEALS'; vehicleId: string; loading: boolean }
  | { type: 'SET_LOADING_INVESTORS'; dealId: string; loading: boolean }
  | { type: 'SET_LOADING_ACCOUNTS'; entityType: ParticipantEntityType; loading: boolean }
  | { type: 'SET_LOADING_DATA_ROOM'; loading: boolean }

// Dialog Actions
export type DialogAction =
  | { type: 'OPEN_UPLOAD_DIALOG' }
  | { type: 'CLOSE_UPLOAD_DIALOG' }
  | { type: 'OPEN_CREATE_FOLDER_DIALOG'; parentId: string | null }
  | { type: 'CLOSE_CREATE_FOLDER_DIALOG' }
  | { type: 'OPEN_MOVE_DIALOG'; documentId: string; documentName: string; currentFolderId: string | null }
  | { type: 'CLOSE_MOVE_DIALOG' }
  | { type: 'OPEN_BULK_MOVE_DIALOG' }
  | { type: 'CLOSE_BULK_MOVE_DIALOG' }
  | { type: 'OPEN_BULK_DELETE_DIALOG' }
  | { type: 'CLOSE_BULK_DELETE_DIALOG' }
  | { type: 'OPEN_RENAME_FOLDER_DIALOG'; folderId: string; folderName: string }
  | { type: 'CLOSE_RENAME_FOLDER_DIALOG' }
  | { type: 'OPEN_RENAME_DOCUMENT_DIALOG'; documentId: string; documentName: string }
  | { type: 'CLOSE_RENAME_DOCUMENT_DIALOG' }
  | { type: 'OPEN_VERSION_HISTORY'; documentId: string; documentName: string; currentVersion: number }
  | { type: 'CLOSE_VERSION_HISTORY' }

// Drag Drop Actions
export type DragDropAction =
  | { type: 'SET_IS_DRAG_OVER'; isDragOver: boolean }
  | { type: 'SET_DROPPED_FILES'; files: File[] }
  | { type: 'SET_TREE_DRAG_OVER_FOLDER'; folderId: string | null }
  | { type: 'SET_UPLOAD_TARGET'; folderId: string | null; folderName: string | null }
  | { type: 'SET_DRAGGING_DOCUMENT'; documentId: string | null; documentName: string | null }
  | { type: 'CLEAR_DRAG_STATE' }

// Combined Action Type
export type StaffDocumentsAction =
  | NavigationAction
  | TreeAction
  | UIAction
  | SearchAction
  | SelectionAction
  | DataAction
  | DialogAction
  | DragDropAction

// =============================================================================
// Context Types
// =============================================================================

export interface StaffDocumentsContextValue {
  state: StaffDocumentsState
  dispatch: React.Dispatch<StaffDocumentsAction>

  // Navigation helpers
  navigateToFolder: (folderId: string | null, folderName?: string) => void
  navigateToVehicle: (vehicleId: string, vehicleName?: string, isVirtual?: boolean) => void
  navigateToDataRoom: (dealId: string, dealName: string, vehicleId?: string | null) => void
  navigateToInvestor: (
    investorId: string,
    investorName: string,
    investorType: ParticipantEntityType,
    dealId: string | null,
    vehicleId: string | null
  ) => void
  navigateBack: () => void

  // Data fetching
  fetchFolders: () => Promise<void>
  fetchDocuments: (folderId: string | null, vehicleId?: string | null) => Promise<void>
  fetchDealsForVehicle: (vehicleId: string) => Promise<void>
  fetchAllDeals: () => Promise<void>
  fetchInvestorsForDeal: (dealId: string) => Promise<void>
  fetchAccountsByType: (entityType: ParticipantEntityType, searchQuery?: string) => Promise<void>
  fetchDataRoomDocuments: (dealId: string) => Promise<void>
  fetchInvestorDocuments: (
    investorId: string,
    dealId: string | null,
    investorType?: ParticipantEntityType
  ) => Promise<void>
  performSearch: (query: string) => Promise<void>

  // Document operations
  moveDocument: (documentId: string, folderId: string, folderName: string) => Promise<boolean>
  deleteDocument: (documentId: string) => Promise<boolean>
  renameDocument: (documentId: string, newName: string) => Promise<boolean>

  // Folder operations
  createFolder: (name: string, parentId: string | null) => Promise<boolean>
  renameFolder: (folderId: string, newName: string) => Promise<boolean>
  deleteFolder: (folderId: string) => Promise<boolean>

  // Bulk operations
  bulkDownload: (documentIds: string[]) => Promise<void>

  // Utilities
  getVehicleById: (vehicleId: string | null) => Vehicle | null
  getSubfolders: () => DocumentFolder[]
  getFilteredDocuments: (searchQuery?: string, tagFilters?: Set<string>) => StaffDocument[]
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface StaffDocumentsProviderProps {
  children: React.ReactNode
  initialVehicles: Vehicle[]
  userProfile: {
    role: string
    display_name: string
    title?: string
  }
}

export interface DocumentsSidebarProps {
  className?: string
}

export interface VehicleTreeProps {
  className?: string
}

export interface TreeNodeProps {
  type:
    | 'vehicle'
    | 'folder'
    | 'deal'
    | 'deals-group'
    | 'data-room'
    | 'investors-group'
    | 'investor'
    | 'account-group'
    | 'account'
    | 'doc-type'
  id: string
  name: string
  isExpanded?: boolean
  isSelected?: boolean
  isVirtual?: boolean
  depth: number
  documentCount?: number
  children?: React.ReactNode
  trailing?: React.ReactNode
  onToggle?: () => void
  onClick?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export interface ContentHeaderProps {
  className?: string
}

export interface ContentToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  className?: string
}

export interface ContentGridProps {
  className?: string
}

export interface DocumentCardProps {
  document: StaffDocument
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  className?: string
}

export interface BulkActionBarProps {
  selectedCount: number
  onMove: () => void
  onDelete: () => void
  onDownload: () => void
  onClear: () => void
  className?: string
}
