'use client'

/**
 * Staff Documents Context
 *
 * Centralized state management for the staff documents module.
 * Uses useReducer for predictable state transitions and React Context
 * for efficient prop drilling elimination.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react'
import { toast } from 'sonner'
import { DocumentFolder } from '@/types/documents'
import { getDocumentDisplayName } from '@/lib/documents/document-name'
import { getVirtualParentDisplayName } from '@/lib/documents/vehicle-hierarchy'
import {
  StaffDocumentsState,
  StaffDocumentsAction,
  StaffDocumentsContextValue,
  StaffDocumentsProviderProps,
  Vehicle,
  Deal,
  Investor,
  ParticipantEntityType,
  StaffDocument,
  DataRoomDocument,
  SearchResult,
  NavigationHistoryEntry,
} from './types'

// =============================================================================
// Initial State
// =============================================================================

const initialState: StaffDocumentsState = {
  navigation: {
    currentFolderId: null,
    currentFolder: null,
    navigationHistory: [],
    selectedVehicleId: null,
    selectedVirtualParentId: null,
    selectedDealId: null,
    selectedInvestorId: null,
    selectedInvestorType: null,
    selectedInvestorDocType: null,
    isDataRoomMode: false,
    dataRoomDealId: null,
    dataRoomDealName: '',
  },
  tree: {
    expandedVehicles: new Set(),
    expandedFolders: new Set(),
    expandedDealsNodes: new Set(),
    expandedDealDataRooms: new Set(),
    expandedDealInvestors: new Set(),
    expandedAccountGroups: new Set(['investor']),
    expandedAccounts: new Set(),
    treeSearchQuery: '',
    debouncedTreeSearch: '',
    searchExpandedVehicles: new Set(),
    searchExpandedFolders: new Set(),
  },
  ui: {
    viewMode: 'grid',
    sortBy: 'date',
    sortDir: 'desc',
    sidebarCollapsed: false,
    showTreeDrawer: false,
    browseMode: 'vehicles',
  },
  search: {
    globalSearchQuery: '',
    searchResults: [],
    isSearchMode: false,
    isSearching: false,
    searchTotal: 0,
  },
  selection: {
    selectedDocuments: new Set(),
  },
  data: {
    folders: [],
    documents: [],
    vehicles: [],
    allDeals: [],
    vehicleDeals: new Map(),
    dealInvestors: new Map(),
    participantDocumentTypes: new Map(),
    accountsByType: new Map(),
    dataRoomDocuments: [],
    loading: true,
    loadingAllDeals: false,
    loadingDeals: new Set(),
    loadingInvestors: new Set(),
    loadingAccounts: new Set(),
    loadingDataRoom: false,
  },
  dialogs: {
    uploadDialogOpen: false,
    createFolderDialogOpen: false,
    createFolderParentId: null,
    moveDialogOpen: false,
    moveDialogDocId: null,
    moveDialogDocName: '',
    moveDialogCurrentFolder: null,
    bulkMoveDialogOpen: false,
    bulkDeleteDialogOpen: false,
    renameFolderDialogOpen: false,
    renameFolderId: null,
    renameFolderName: '',
    renameDocumentDialogOpen: false,
    renameDocumentId: null,
    renameDocumentName: '',
    versionHistoryOpen: false,
    versionHistoryDocId: null,
    versionHistoryDocName: '',
    versionHistoryCurrentVersion: 1,
  },
  dragDrop: {
    isDragOver: false,
    droppedFiles: [],
    treeDragOverFolderId: null,
    uploadTargetFolderId: null,
    uploadTargetFolderName: null,
    draggingDocumentId: null,
    draggingDocumentName: null,
  },
}

// =============================================================================
// Reducer
// =============================================================================

function staffDocumentsReducer(
  state: StaffDocumentsState,
  action: StaffDocumentsAction
): StaffDocumentsState {
  switch (action.type) {
    // -------------------------------------------------------------------------
    // Navigation Actions
    // -------------------------------------------------------------------------
    case 'NAVIGATE_TO_FOLDER': {
      // Build current location entry before navigating
      let currentEntry: NavigationHistoryEntry | null = null
      const nav = state.navigation

      if (nav.isDataRoomMode && nav.dataRoomDealId && nav.selectedVehicleId) {
        currentEntry = {
          type: 'data-room',
          dealId: nav.dataRoomDealId,
          dealName: nav.dataRoomDealName,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedInvestorId && nav.selectedDealId && nav.selectedVehicleId) {
        const participants = state.data.dealInvestors.get(nav.selectedDealId) || []
        const participant = participants.find(
          p => p.id === nav.selectedInvestorId && p.entity_type === nav.selectedInvestorType
        )
        currentEntry = {
          type: 'investor',
          investorId: nav.selectedInvestorId,
          investorName: participant?.display_name || 'Participant',
          investorType: nav.selectedInvestorType || 'investor',
          dealId: nav.selectedDealId,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.currentFolderId && nav.currentFolder) {
        currentEntry = {
          type: 'folder',
          folderId: nav.currentFolderId,
          folderName: nav.currentFolder.name,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedVirtualParentId) {
        currentEntry = {
          type: 'virtual-parent',
          virtualParentId: nav.selectedVirtualParentId,
          virtualParentName: getVirtualParentDisplayName(nav.selectedVirtualParentId),
        }
      } else if (nav.selectedVehicleId) {
        const vehicle = state.data.vehicles.find(v => v.id === nav.selectedVehicleId)
        currentEntry = {
          type: 'vehicle',
          vehicleId: nav.selectedVehicleId,
          vehicleName: vehicle?.name || 'Unknown Vehicle',
        }
      } else {
        currentEntry = { type: 'root' }
      }

      // Only add to history if we're actually navigating somewhere different
      const shouldAddToHistory = action.folderId !== nav.currentFolderId
      const history = shouldAddToHistory && currentEntry
        ? [...nav.navigationHistory, currentEntry]
        : nav.navigationHistory

      const folder = state.data.folders.find(f => f.id === action.folderId) || null

      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentFolderId: action.folderId,
          currentFolder: folder,
          navigationHistory: history,
          selectedDealId: null,
          selectedInvestorId: null,
          selectedInvestorType: null,
          selectedInvestorDocType: null,
          isDataRoomMode: false,
          dataRoomDealId: null,
          dataRoomDealName: '',
          // Clear virtual parent when entering a real folder
          selectedVirtualParentId: null,
          selectedVehicleId: folder?.vehicle_id || state.navigation.selectedVehicleId,
        },
        selection: {
          ...state.selection,
          selectedDocuments: new Set(),
        },
        data: {
          ...state.data,
          dataRoomDocuments: [],
        },
      }
    }

    case 'NAVIGATE_TO_VEHICLE': {
      // Build current location entry before navigating
      let currentEntry: NavigationHistoryEntry | null = null
      const nav = state.navigation

      if (nav.isDataRoomMode && nav.dataRoomDealId && nav.selectedVehicleId) {
        currentEntry = {
          type: 'data-room',
          dealId: nav.dataRoomDealId,
          dealName: nav.dataRoomDealName,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedInvestorId && nav.selectedDealId && nav.selectedVehicleId) {
        const participants = state.data.dealInvestors.get(nav.selectedDealId) || []
        const participant = participants.find(
          p => p.id === nav.selectedInvestorId && p.entity_type === nav.selectedInvestorType
        )
        currentEntry = {
          type: 'investor',
          investorId: nav.selectedInvestorId,
          investorName: participant?.display_name || 'Participant',
          investorType: nav.selectedInvestorType || 'investor',
          dealId: nav.selectedDealId,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.currentFolderId && nav.currentFolder) {
        currentEntry = {
          type: 'folder',
          folderId: nav.currentFolderId,
          folderName: nav.currentFolder.name,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedVirtualParentId) {
        currentEntry = {
          type: 'virtual-parent',
          virtualParentId: nav.selectedVirtualParentId,
          virtualParentName: getVirtualParentDisplayName(nav.selectedVirtualParentId),
        }
      } else if (nav.selectedVehicleId) {
        const vehicle = state.data.vehicles.find(v => v.id === nav.selectedVehicleId)
        currentEntry = {
          type: 'vehicle',
          vehicleId: nav.selectedVehicleId,
          vehicleName: vehicle?.name || 'Unknown Vehicle',
        }
      } else {
        currentEntry = { type: 'root' }
      }

      // Check if this is a virtual parent (from action or ID prefix)
      const isVirtualParent = action.isVirtual || action.vehicleId.startsWith('virtual-')

      // Only add to history if we're navigating to a different location
      const isDifferentLocation = isVirtualParent
        ? action.vehicleId !== nav.selectedVirtualParentId
        : action.vehicleId !== nav.selectedVehicleId
      const history = isDifferentLocation && currentEntry
        ? [...nav.navigationHistory, currentEntry]
        : nav.navigationHistory

      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentFolderId: null,
          currentFolder: null,
          navigationHistory: history,
          // For virtual parents, don't set selectedVehicleId (it's not a real vehicle)
          selectedVehicleId: isVirtualParent ? null : action.vehicleId,
          // Track virtual parent separately
          selectedVirtualParentId: isVirtualParent ? action.vehicleId : null,
          selectedDealId: null,
          selectedInvestorId: null,
          selectedInvestorType: null,
          selectedInvestorDocType: null,
          isDataRoomMode: false,
          dataRoomDealId: null,
          dataRoomDealName: '',
        },
        tree: {
          ...state.tree,
          expandedVehicles: new Set([...state.tree.expandedVehicles, action.vehicleId]),
        },
        selection: {
          ...state.selection,
          selectedDocuments: new Set(),
        },
        data: {
          ...state.data,
          dataRoomDocuments: [],
        },
      }
    }

    case 'NAVIGATE_TO_DATA_ROOM': {
      // Build current location entry before navigating
      let currentEntry: NavigationHistoryEntry | null = null
      const nav = state.navigation

      if (nav.currentFolderId && nav.currentFolder) {
        currentEntry = {
          type: 'folder',
          folderId: nav.currentFolderId,
          folderName: nav.currentFolder.name,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedInvestorId && nav.selectedDealId && nav.selectedVehicleId) {
        const participants = state.data.dealInvestors.get(nav.selectedDealId) || []
        const participant = participants.find(
          p => p.id === nav.selectedInvestorId && p.entity_type === nav.selectedInvestorType
        )
        currentEntry = {
          type: 'investor',
          investorId: nav.selectedInvestorId,
          investorName: participant?.display_name || 'Participant',
          investorType: nav.selectedInvestorType || 'investor',
          dealId: nav.selectedDealId,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedVehicleId) {
        const vehicle = state.data.vehicles.find(v => v.id === nav.selectedVehicleId)
        currentEntry = {
          type: 'vehicle',
          vehicleId: nav.selectedVehicleId,
          vehicleName: vehicle?.name || 'Unknown Vehicle',
        }
      } else {
        currentEntry = { type: 'root' }
      }

      const history = currentEntry
        ? [...nav.navigationHistory, currentEntry]
        : nav.navigationHistory

      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentFolderId: null,
          currentFolder: null,
          navigationHistory: history,
          selectedVehicleId: action.vehicleId,
          selectedVirtualParentId: null,
          selectedDealId: action.dealId,
          selectedInvestorId: null,
          selectedInvestorType: null,
          selectedInvestorDocType: null,
          isDataRoomMode: true,
          dataRoomDealId: action.dealId,
          dataRoomDealName: action.dealName,
        },
        selection: {
          ...state.selection,
          selectedDocuments: new Set(),
        },
      }
    }

    case 'NAVIGATE_TO_INVESTOR': {
      // Build current location entry before navigating
      const nav = state.navigation
      let currentEntry: NavigationHistoryEntry

      if (nav.isDataRoomMode && nav.dataRoomDealId && nav.selectedVehicleId) {
        currentEntry = {
          type: 'data-room',
          dealId: nav.dataRoomDealId,
          dealName: nav.dataRoomDealName,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedInvestorId) {
        const dealParticipants =
          (nav.selectedDealId && state.data.dealInvestors.get(nav.selectedDealId)) || []
        const accountParticipants = Array.from(state.data.accountsByType.values()).flat()
        const participant =
          dealParticipants.find(
            p => p.id === nav.selectedInvestorId && p.entity_type === nav.selectedInvestorType
          ) ||
          accountParticipants.find(
            p => p.id === nav.selectedInvestorId && p.entity_type === nav.selectedInvestorType
          )
        currentEntry = {
          type: 'investor',
          investorId: nav.selectedInvestorId,
          investorName: participant?.display_name || 'Participant',
          investorType: nav.selectedInvestorType || 'investor',
          dealId: nav.selectedDealId,
          vehicleId: nav.selectedVehicleId,
        }
      } else if (nav.selectedDealId && nav.selectedVehicleId) {
        currentEntry = {
          type: 'data-room',
          dealId: nav.selectedDealId,
          dealName: nav.dataRoomDealName,
          vehicleId: nav.selectedVehicleId,
        }
      } else {
        currentEntry = { type: 'root' }
      }

      const history = [...nav.navigationHistory, currentEntry]

      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentFolderId: null,
          currentFolder: null,
          navigationHistory: history,
          selectedVehicleId: action.vehicleId || null,
          selectedVirtualParentId: null,
          selectedDealId: action.dealId,
          selectedInvestorId: action.investorId,
          selectedInvestorType: action.investorType,
          selectedInvestorDocType: null,
          isDataRoomMode: false,
          dataRoomDealId: null,
          dataRoomDealName: '',
        },
        selection: {
          ...state.selection,
          selectedDocuments: new Set(),
        },
        data: {
          ...state.data,
          dataRoomDocuments: [],
        },
      }
    }

    case 'SET_INVESTOR_DOC_TYPE': {
      return {
        ...state,
        navigation: {
          ...state.navigation,
          selectedInvestorDocType: action.docType,
        },
      }
    }

    case 'NAVIGATE_BACK': {
      if (state.navigation.selectedInvestorDocType) {
        return {
          ...state,
          navigation: {
            ...state.navigation,
            selectedInvestorDocType: null,
          },
        }
      }
      if (state.navigation.navigationHistory.length === 0) return state

      const previousEntry = state.navigation.navigationHistory[state.navigation.navigationHistory.length - 1]
      const newHistory = state.navigation.navigationHistory.slice(0, -1)

      // Restore state based on the entry type
      switch (previousEntry.type) {
        case 'root':
          return {
            ...state,
            navigation: {
              ...state.navigation,
              currentFolderId: null,
              currentFolder: null,
              navigationHistory: newHistory,
              selectedVehicleId: null,
              selectedVirtualParentId: null,
              selectedDealId: null,
              selectedInvestorId: null,
              selectedInvestorType: null,
              selectedInvestorDocType: null,
              isDataRoomMode: false,
              dataRoomDealId: null,
              dataRoomDealName: '',
            },
            selection: { ...state.selection, selectedDocuments: new Set() },
            data: { ...state.data, dataRoomDocuments: [] },
          }

        case 'vehicle':
          return {
            ...state,
            navigation: {
              ...state.navigation,
              currentFolderId: null,
              currentFolder: null,
              navigationHistory: newHistory,
              selectedVehicleId: previousEntry.vehicleId,
              selectedVirtualParentId: null,
              selectedDealId: null,
              selectedInvestorId: null,
              selectedInvestorType: null,
              selectedInvestorDocType: null,
              isDataRoomMode: false,
              dataRoomDealId: null,
              dataRoomDealName: '',
            },
            selection: { ...state.selection, selectedDocuments: new Set() },
            data: { ...state.data, dataRoomDocuments: [] },
          }

        case 'virtual-parent':
          return {
            ...state,
            navigation: {
              ...state.navigation,
              currentFolderId: null,
              currentFolder: null,
              navigationHistory: newHistory,
              selectedVehicleId: null,
              selectedVirtualParentId: previousEntry.virtualParentId,
              selectedDealId: null,
              selectedInvestorId: null,
              selectedInvestorType: null,
              selectedInvestorDocType: null,
              isDataRoomMode: false,
              dataRoomDealId: null,
              dataRoomDealName: '',
            },
            selection: { ...state.selection, selectedDocuments: new Set() },
            data: { ...state.data, dataRoomDocuments: [] },
          }

        case 'folder': {
          const folder = state.data.folders.find(f => f.id === previousEntry.folderId) || null
          return {
            ...state,
            navigation: {
              ...state.navigation,
              currentFolderId: previousEntry.folderId,
              currentFolder: folder,
              navigationHistory: newHistory,
              selectedVehicleId: previousEntry.vehicleId,
              selectedVirtualParentId: null,
              selectedDealId: null,
              selectedInvestorId: null,
              selectedInvestorType: null,
              selectedInvestorDocType: null,
              isDataRoomMode: false,
              dataRoomDealId: null,
              dataRoomDealName: '',
            },
            selection: { ...state.selection, selectedDocuments: new Set() },
            data: { ...state.data, dataRoomDocuments: [] },
          }
        }

        case 'data-room':
          return {
            ...state,
            navigation: {
              ...state.navigation,
              currentFolderId: null,
              currentFolder: null,
              navigationHistory: newHistory,
              selectedVehicleId: previousEntry.vehicleId,
              selectedVirtualParentId: null,
              selectedDealId: previousEntry.dealId,
              selectedInvestorId: null,
              selectedInvestorType: null,
              selectedInvestorDocType: null,
              isDataRoomMode: true,
              dataRoomDealId: previousEntry.dealId,
              dataRoomDealName: previousEntry.dealName,
            },
            selection: { ...state.selection, selectedDocuments: new Set() },
          }

        case 'investor':
          return {
            ...state,
            navigation: {
              ...state.navigation,
              currentFolderId: null,
              currentFolder: null,
              navigationHistory: newHistory,
              selectedVehicleId: previousEntry.vehicleId,
              selectedVirtualParentId: null,
              selectedDealId: previousEntry.dealId,
              selectedInvestorId: previousEntry.investorId,
              selectedInvestorType: previousEntry.investorType,
              selectedInvestorDocType: null,
              isDataRoomMode: false,
              dataRoomDealId: null,
              dataRoomDealName: '',
            },
            selection: { ...state.selection, selectedDocuments: new Set() },
            data: { ...state.data, dataRoomDocuments: [] },
          }

        default:
          return state
      }
    }

    case 'NAVIGATE_TO_ROOT':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentFolderId: null,
          currentFolder: null,
          navigationHistory: [], // Clear all history
          selectedVehicleId: null,
          selectedVirtualParentId: null,
          selectedDealId: null,
          selectedInvestorId: null,
          selectedInvestorType: null,
          selectedInvestorDocType: null,
          isDataRoomMode: false,
          dataRoomDealId: null,
          dataRoomDealName: '',
        },
        selection: {
          ...state.selection,
          selectedDocuments: new Set(),
        },
        data: {
          ...state.data,
          dataRoomDocuments: [],
        },
      }

    case 'SET_CURRENT_FOLDER':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentFolder: action.folder,
        },
      }

    case 'SET_SELECTED_DEAL':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          selectedDealId: action.dealId,
        },
      }

    case 'EXIT_DATA_ROOM_MODE':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          isDataRoomMode: false,
          dataRoomDealId: null,
          dataRoomDealName: '',
        },
        data: {
          ...state.data,
          dataRoomDocuments: [],
        },
      }

    // -------------------------------------------------------------------------
    // Tree Actions
    // -------------------------------------------------------------------------
    case 'TOGGLE_VEHICLE_EXPANDED': {
      const newExpanded = new Set(state.tree.expandedVehicles)
      if (newExpanded.has(action.vehicleId)) {
        newExpanded.delete(action.vehicleId)
      } else {
        newExpanded.add(action.vehicleId)
      }
      return {
        ...state,
        tree: { ...state.tree, expandedVehicles: newExpanded },
      }
    }

    case 'TOGGLE_FOLDER_EXPANDED': {
      const newExpanded = new Set(state.tree.expandedFolders)
      if (newExpanded.has(action.folderId)) {
        newExpanded.delete(action.folderId)
      } else {
        newExpanded.add(action.folderId)
      }
      return {
        ...state,
        tree: { ...state.tree, expandedFolders: newExpanded },
      }
    }

    case 'TOGGLE_DEALS_NODE_EXPANDED': {
      const newExpanded = new Set(state.tree.expandedDealsNodes)
      if (newExpanded.has(action.vehicleId)) {
        newExpanded.delete(action.vehicleId)
      } else {
        newExpanded.add(action.vehicleId)
      }
      return {
        ...state,
        tree: { ...state.tree, expandedDealsNodes: newExpanded },
      }
    }

    case 'TOGGLE_DEAL_DATA_ROOM_EXPANDED': {
      const newExpanded = new Set(state.tree.expandedDealDataRooms)
      if (newExpanded.has(action.dealId)) {
        newExpanded.delete(action.dealId)
      } else {
        newExpanded.add(action.dealId)
      }
      return {
        ...state,
        tree: { ...state.tree, expandedDealDataRooms: newExpanded },
      }
    }

    case 'TOGGLE_DEAL_INVESTORS_EXPANDED': {
      const newExpanded = new Set(state.tree.expandedDealInvestors)
      if (newExpanded.has(action.dealId)) {
        newExpanded.delete(action.dealId)
      } else {
        newExpanded.add(action.dealId)
      }
      return {
        ...state,
        tree: { ...state.tree, expandedDealInvestors: newExpanded },
      }
    }

    case 'TOGGLE_ACCOUNT_GROUP_EXPANDED': {
      const newExpanded = new Set(state.tree.expandedAccountGroups)
      if (newExpanded.has(action.entityType)) {
        newExpanded.delete(action.entityType)
      } else {
        newExpanded.add(action.entityType)
      }
      return {
        ...state,
        tree: { ...state.tree, expandedAccountGroups: newExpanded },
      }
    }

    case 'TOGGLE_ACCOUNT_EXPANDED': {
      const newExpanded = new Set(state.tree.expandedAccounts)
      if (newExpanded.has(action.key)) {
        newExpanded.delete(action.key)
      } else {
        newExpanded.add(action.key)
      }
      return {
        ...state,
        tree: { ...state.tree, expandedAccounts: newExpanded },
      }
    }

    case 'SET_EXPANDED_VEHICLES':
      return {
        ...state,
        tree: { ...state.tree, expandedVehicles: action.vehicleIds },
      }

    case 'SET_EXPANDED_FOLDERS':
      return {
        ...state,
        tree: { ...state.tree, expandedFolders: action.folderIds },
      }

    case 'SET_TREE_SEARCH_QUERY':
      return {
        ...state,
        tree: { ...state.tree, treeSearchQuery: action.query },
      }

    case 'SET_DEBOUNCED_TREE_SEARCH':
      return {
        ...state,
        tree: { ...state.tree, debouncedTreeSearch: action.query },
      }

    case 'SET_SEARCH_EXPANDED':
      return {
        ...state,
        tree: {
          ...state.tree,
          searchExpandedVehicles: action.vehicles,
          searchExpandedFolders: action.folders,
        },
      }

    case 'CLEAR_TREE_SEARCH':
      return {
        ...state,
        tree: {
          ...state.tree,
          treeSearchQuery: '',
          debouncedTreeSearch: '',
          searchExpandedVehicles: new Set(),
          searchExpandedFolders: new Set(),
        },
      }

    // -------------------------------------------------------------------------
    // UI Actions
    // -------------------------------------------------------------------------
    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.mode },
      }

    case 'SET_SORT_BY':
      return {
        ...state,
        ui: { ...state.ui, sortBy: action.sortBy },
      }

    case 'SET_SORT_DIR':
      return {
        ...state,
        ui: { ...state.ui, sortDir: action.dir },
      }

    case 'SET_SORT':
      return {
        ...state,
        ui: { ...state.ui, sortBy: action.sortBy, sortDir: action.dir },
      }

    case 'TOGGLE_SIDEBAR_COLLAPSED':
      return {
        ...state,
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
      }

    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        ui: { ...state.ui, sidebarCollapsed: action.collapsed },
      }

    case 'SET_SHOW_TREE_DRAWER':
      return {
        ...state,
        ui: { ...state.ui, showTreeDrawer: action.show },
      }

    case 'SET_BROWSE_MODE':
      return {
        ...state,
        ui: { ...state.ui, browseMode: action.mode },
        tree: {
          ...state.tree,
          treeSearchQuery: '',
          debouncedTreeSearch: '',
        },
        navigation: {
          ...state.navigation,
          currentFolderId: null,
          currentFolder: null,
          navigationHistory: [],
          selectedVehicleId: null,
          selectedVirtualParentId: null,
          selectedDealId: null,
          selectedInvestorId: null,
          selectedInvestorType: null,
          selectedInvestorDocType: null,
          isDataRoomMode: false,
          dataRoomDealId: null,
          dataRoomDealName: '',
        },
        selection: { ...state.selection, selectedDocuments: new Set() },
        data: { ...state.data, dataRoomDocuments: [] },
      }

    // -------------------------------------------------------------------------
    // Search Actions
    // -------------------------------------------------------------------------
    case 'SET_GLOBAL_SEARCH_QUERY':
      return {
        ...state,
        search: { ...state.search, globalSearchQuery: action.query },
      }

    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        search: {
          ...state.search,
          searchResults: action.results,
          searchTotal: action.total,
          isSearching: false,
        },
      }

    case 'SET_IS_SEARCHING':
      return {
        ...state,
        search: { ...state.search, isSearching: action.isSearching },
      }

    case 'ENTER_SEARCH_MODE':
      return {
        ...state,
        search: { ...state.search, isSearchMode: true },
      }

    case 'EXIT_SEARCH_MODE':
      return {
        ...state,
        search: { ...state.search, isSearchMode: false },
      }

    case 'CLEAR_SEARCH':
      return {
        ...state,
        search: {
          ...state.search,
          globalSearchQuery: '',
          searchResults: [],
          isSearchMode: false,
          isSearching: false,
          searchTotal: 0,
        },
      }

    // -------------------------------------------------------------------------
    // Selection Actions
    // -------------------------------------------------------------------------
    case 'TOGGLE_DOCUMENT_SELECTED': {
      const newSelected = new Set(state.selection.selectedDocuments)
      if (newSelected.has(action.documentId)) {
        newSelected.delete(action.documentId)
      } else {
        newSelected.add(action.documentId)
      }
      return {
        ...state,
        selection: { ...state.selection, selectedDocuments: newSelected },
      }
    }

    case 'SELECT_DOCUMENTS':
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedDocuments: new Set([
            ...state.selection.selectedDocuments,
            ...action.documentIds,
          ]),
        },
      }

    case 'DESELECT_DOCUMENTS': {
      const newSelected = new Set(state.selection.selectedDocuments)
      action.documentIds.forEach(id => newSelected.delete(id))
      return {
        ...state,
        selection: { ...state.selection, selectedDocuments: newSelected },
      }
    }

    case 'SELECT_ALL_DOCUMENTS':
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedDocuments: new Set(state.data.documents.map(d => d.id)),
        },
      }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selection: { ...state.selection, selectedDocuments: new Set() },
      }

    // -------------------------------------------------------------------------
    // Data Actions
    // -------------------------------------------------------------------------
    case 'SET_FOLDERS':
      return {
        ...state,
        data: { ...state.data, folders: action.folders },
      }

    case 'SET_DOCUMENTS':
      return {
        ...state,
        data: { ...state.data, documents: action.documents },
      }

    case 'SET_VEHICLES':
      return {
        ...state,
        data: { ...state.data, vehicles: action.vehicles },
      }

    case 'SET_ALL_DEALS':
      return {
        ...state,
        data: { ...state.data, allDeals: action.deals },
      }

    case 'ADD_DOCUMENT':
      return {
        ...state,
        data: {
          ...state.data,
          documents: [...state.data.documents, action.document],
        },
      }

    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        data: {
          ...state.data,
          documents: state.data.documents.map(doc =>
            doc.id === action.documentId ? { ...doc, ...action.updates } : doc
          ),
        },
      }

    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        data: {
          ...state.data,
          documents: state.data.documents.filter(doc => doc.id !== action.documentId),
        },
        selection: {
          ...state.selection,
          selectedDocuments: (() => {
            const newSelected = new Set(state.selection.selectedDocuments)
            newSelected.delete(action.documentId)
            return newSelected
          })(),
        },
      }

    case 'SET_VEHICLE_DEALS': {
      const newDeals = new Map(state.data.vehicleDeals)
      newDeals.set(action.vehicleId, action.deals)
      return {
        ...state,
        data: { ...state.data, vehicleDeals: newDeals },
      }
    }

    case 'SET_DEAL_INVESTORS': {
      const newInvestors = new Map(state.data.dealInvestors)
      newInvestors.set(action.dealId, action.investors)
      return {
        ...state,
        data: { ...state.data, dealInvestors: newInvestors },
      }
    }

    case 'SET_PARTICIPANT_DOC_TYPES': {
      const newTypes = new Map(state.data.participantDocumentTypes)
      newTypes.set(action.key, action.docTypes)
      return {
        ...state,
        data: { ...state.data, participantDocumentTypes: newTypes },
      }
    }

    case 'SET_ACCOUNTS_BY_TYPE': {
      const newMap = new Map(state.data.accountsByType)
      newMap.set(action.entityType, action.accounts)
      return {
        ...state,
        data: { ...state.data, accountsByType: newMap },
      }
    }

    case 'SET_DATA_ROOM_DOCUMENTS':
      return {
        ...state,
        data: { ...state.data, dataRoomDocuments: action.documents },
      }

    case 'SET_LOADING':
      return {
        ...state,
        data: { ...state.data, loading: action.loading },
      }

    case 'SET_LOADING_ALL_DEALS':
      return {
        ...state,
        data: { ...state.data, loadingAllDeals: action.loading },
      }

    case 'SET_LOADING_DEALS': {
      const newLoading = new Set(state.data.loadingDeals)
      if (action.loading) {
        newLoading.add(action.vehicleId)
      } else {
        newLoading.delete(action.vehicleId)
      }
      return {
        ...state,
        data: { ...state.data, loadingDeals: newLoading },
      }
    }

    case 'SET_LOADING_INVESTORS': {
      const newLoading = new Set(state.data.loadingInvestors)
      if (action.loading) {
        newLoading.add(action.dealId)
      } else {
        newLoading.delete(action.dealId)
      }
      return {
        ...state,
        data: { ...state.data, loadingInvestors: newLoading },
      }
    }

    case 'SET_LOADING_ACCOUNTS': {
      const newLoading = new Set(state.data.loadingAccounts)
      if (action.loading) {
        newLoading.add(action.entityType)
      } else {
        newLoading.delete(action.entityType)
      }
      return {
        ...state,
        data: { ...state.data, loadingAccounts: newLoading },
      }
    }

    case 'SET_LOADING_DATA_ROOM':
      return {
        ...state,
        data: { ...state.data, loadingDataRoom: action.loading },
      }

    // -------------------------------------------------------------------------
    // Dialog Actions
    // -------------------------------------------------------------------------
    case 'OPEN_UPLOAD_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, uploadDialogOpen: true },
      }

    case 'CLOSE_UPLOAD_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, uploadDialogOpen: false },
        dragDrop: {
          ...state.dragDrop,
          droppedFiles: [],
          uploadTargetFolderId: null,
          uploadTargetFolderName: null,
        },
      }

    case 'OPEN_CREATE_FOLDER_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          createFolderDialogOpen: true,
          createFolderParentId: action.parentId,
        },
      }

    case 'CLOSE_CREATE_FOLDER_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          createFolderDialogOpen: false,
          createFolderParentId: null,
        },
      }

    case 'OPEN_MOVE_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          moveDialogOpen: true,
          moveDialogDocId: action.documentId,
          moveDialogDocName: action.documentName,
          moveDialogCurrentFolder: action.currentFolderId,
        },
      }

    case 'CLOSE_MOVE_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          moveDialogOpen: false,
          moveDialogDocId: null,
          moveDialogDocName: '',
          moveDialogCurrentFolder: null,
        },
      }

    case 'OPEN_BULK_MOVE_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, bulkMoveDialogOpen: true },
      }

    case 'CLOSE_BULK_MOVE_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, bulkMoveDialogOpen: false },
      }

    case 'OPEN_BULK_DELETE_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, bulkDeleteDialogOpen: true },
      }

    case 'CLOSE_BULK_DELETE_DIALOG':
      return {
        ...state,
        dialogs: { ...state.dialogs, bulkDeleteDialogOpen: false },
      }

    case 'OPEN_RENAME_FOLDER_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          renameFolderDialogOpen: true,
          renameFolderId: action.folderId,
          renameFolderName: action.folderName,
        },
      }

    case 'CLOSE_RENAME_FOLDER_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          renameFolderDialogOpen: false,
          renameFolderId: null,
          renameFolderName: '',
        },
      }

    case 'OPEN_RENAME_DOCUMENT_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          renameDocumentDialogOpen: true,
          renameDocumentId: action.documentId,
          renameDocumentName: action.documentName,
        },
      }

    case 'CLOSE_RENAME_DOCUMENT_DIALOG':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          renameDocumentDialogOpen: false,
          renameDocumentId: null,
          renameDocumentName: '',
        },
      }

    case 'OPEN_VERSION_HISTORY':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          versionHistoryOpen: true,
          versionHistoryDocId: action.documentId,
          versionHistoryDocName: action.documentName,
          versionHistoryCurrentVersion: action.currentVersion,
        },
      }

    case 'CLOSE_VERSION_HISTORY':
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          versionHistoryOpen: false,
          versionHistoryDocId: null,
          versionHistoryDocName: '',
          versionHistoryCurrentVersion: 1,
        },
      }

    // -------------------------------------------------------------------------
    // Drag Drop Actions
    // -------------------------------------------------------------------------
    case 'SET_IS_DRAG_OVER':
      return {
        ...state,
        dragDrop: { ...state.dragDrop, isDragOver: action.isDragOver },
      }

    case 'SET_DROPPED_FILES':
      return {
        ...state,
        dragDrop: { ...state.dragDrop, droppedFiles: action.files },
      }

    case 'SET_TREE_DRAG_OVER_FOLDER':
      return {
        ...state,
        dragDrop: { ...state.dragDrop, treeDragOverFolderId: action.folderId },
      }

    case 'SET_UPLOAD_TARGET':
      return {
        ...state,
        dragDrop: {
          ...state.dragDrop,
          uploadTargetFolderId: action.folderId,
          uploadTargetFolderName: action.folderName,
        },
      }

    case 'SET_DRAGGING_DOCUMENT':
      return {
        ...state,
        dragDrop: {
          ...state.dragDrop,
          draggingDocumentId: action.documentId,
          draggingDocumentName: action.documentName,
        },
      }

    case 'CLEAR_DRAG_STATE':
      return {
        ...state,
        dragDrop: {
          ...state.dragDrop,
          isDragOver: false,
          droppedFiles: [],
          treeDragOverFolderId: null,
          uploadTargetFolderId: null,
          uploadTargetFolderName: null,
          draggingDocumentId: null,
          draggingDocumentName: null,
        },
      }

    default:
      return state
  }
}

// =============================================================================
// Context
// =============================================================================

const StaffDocumentsContext = createContext<StaffDocumentsContextValue | null>(null)

// =============================================================================
// Provider
// =============================================================================

export function StaffDocumentsProvider({
  children,
  initialVehicles,
  userProfile,
}: StaffDocumentsProviderProps) {
  const [state, dispatch] = useReducer(staffDocumentsReducer, {
    ...initialState,
    data: {
      ...initialState.data,
      vehicles: initialVehicles,
    },
  })

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const accountsByTypeRef = useRef(state.data.accountsByType)
  const accountsSearchRef = useRef(new Map<ParticipantEntityType, string>())
  const accountsLoadingRef = useRef(new Set<ParticipantEntityType>())

  useEffect(() => {
    accountsByTypeRef.current = state.data.accountsByType
  }, [state.data.accountsByType])

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/staff/documents/folders')
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'SET_FOLDERS', folders: data.folders || [] })
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
      toast.error('Failed to load folders')
    }
  }, [])

  const fetchDocuments = useCallback(async (
    folderId: string | null,
    vehicleId?: string | null
  ) => {
    // If nothing is selected, do not load the full document library
    if (!folderId && !vehicleId) {
      dispatch({ type: 'SET_DOCUMENTS', documents: [] })
      dispatch({ type: 'SET_LOADING', loading: false })
      return
    }

    dispatch({ type: 'SET_LOADING', loading: true })

    try {
      const params = new URLSearchParams()
      if (folderId) params.set('folder_id', folderId)
      if (vehicleId) params.set('vehicle_id', vehicleId)

      const response = await fetch(`/api/staff/documents?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'SET_DOCUMENTS', documents: data.documents || [] })
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }, [])

  const fetchDealsForVehicle = useCallback(async (vehicleId: string) => {
    // Check if already cached
    if (state.data.vehicleDeals.has(vehicleId)) return

    dispatch({ type: 'SET_LOADING_DEALS', vehicleId, loading: true })

    try {
      const response = await fetch(`/api/deals?vehicle_id=${vehicleId}`)
      if (response.ok) {
        const data = await response.json()
        dispatch({
          type: 'SET_VEHICLE_DEALS',
          vehicleId,
          deals: data.deals || [],
        })
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      dispatch({ type: 'SET_LOADING_DEALS', vehicleId, loading: false })
    }
  }, [state.data.vehicleDeals])

  const fetchAllDeals = useCallback(async () => {
    if (state.data.allDeals.length > 0) return

    dispatch({ type: 'SET_LOADING_ALL_DEALS', loading: true })

    try {
      const response = await fetch('/api/deals')
      if (response.ok) {
        const data = await response.json()
        const deals = (data.deals || []).map((deal: any) => ({
          id: deal.id,
          name: deal.name,
          status: deal.status,
          vehicle_id: deal.vehicle_id || null,
          vehicle_name: deal.vehicles?.name || deal.vehicle?.name || null,
        }))
        dispatch({ type: 'SET_ALL_DEALS', deals })
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      dispatch({ type: 'SET_LOADING_ALL_DEALS', loading: false })
    }
  }, [state.data.allDeals.length])

  const fetchInvestorsForDeal = useCallback(async (dealId: string) => {
    // Check if already cached
    if (state.data.dealInvestors.has(dealId)) return

    dispatch({ type: 'SET_LOADING_INVESTORS', dealId, loading: true })

    try {
      const response = await fetch(`/api/deals/${dealId}/investors`)
      if (response.ok) {
        const data = await response.json()
        dispatch({
          type: 'SET_DEAL_INVESTORS',
          dealId,
          investors: data.investors || [],
        })
      }
    } catch (error) {
      console.error('Error fetching investors:', error)
    } finally {
      dispatch({ type: 'SET_LOADING_INVESTORS', dealId, loading: false })
    }
  }, [state.data.dealInvestors])

  const fetchAccountsByType = useCallback(async (
    entityType: ParticipantEntityType,
    searchQuery?: string
  ) => {
    const normalizedSearch = searchQuery?.trim() || ''

    if (!normalizedSearch) {
      const hadSearch = accountsSearchRef.current.has(entityType)
      accountsSearchRef.current.delete(entityType)
      if (!hadSearch && accountsByTypeRef.current.has(entityType)) return
    } else {
      const lastSearch = accountsSearchRef.current.get(entityType)
      if (lastSearch === normalizedSearch) return
    }

    if (accountsLoadingRef.current.has(entityType)) return
    accountsLoadingRef.current.add(entityType)

    dispatch({ type: 'SET_LOADING_ACCOUNTS', entityType, loading: true })

    try {
      let endpoint = ''
      switch (entityType) {
        case 'investor':
          endpoint = '/api/staff/investors'
          break
        case 'partner':
          endpoint = '/api/staff/partners'
          break
        case 'introducer':
          endpoint = '/api/staff/introducers'
          break
        case 'commercial_partner':
          endpoint = '/api/staff/commercial-partners'
          break
        default:
          endpoint = '/api/staff/investors'
      }

      const params = new URLSearchParams()
      params.set('limit', '2000')
      if (normalizedSearch) {
        params.set('search', normalizedSearch)
      }

      const response = await fetch(`${endpoint}?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const rawList =
          data.investors ||
          data.partners ||
          data.introducers ||
          data.commercial_partners ||
          []

        const accounts = rawList.map((entity: any) => {
          const name =
            entity.display_name ||
            entity.name ||
            entity.legal_name ||
            entity.contact_name ||
            entity.email ||
            'Account'
          return {
            id: entity.id,
            display_name: name,
            email: entity.email || entity.contact_email || '',
            entity_type: entityType,
          }
        })

        accounts.sort((a: any, b: any) =>
          a.display_name.localeCompare(b.display_name)
        )

        dispatch({ type: 'SET_ACCOUNTS_BY_TYPE', entityType, accounts })
        if (normalizedSearch) {
          accountsSearchRef.current.set(entityType, normalizedSearch)
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      accountsLoadingRef.current.delete(entityType)
      dispatch({ type: 'SET_LOADING_ACCOUNTS', entityType, loading: false })
    }
  }, [dispatch])

  const fetchInvestorDocuments = useCallback(async (
    investorId: string,
    dealId: string | null,
    investorType: ParticipantEntityType = 'investor'
  ) => {
    dispatch({ type: 'SET_LOADING', loading: true })

    try {
      const params = new URLSearchParams({
        participant_id: investorId,
        participant_type: investorType,
      })
      if (dealId) params.set('deal_id', dealId)
      const response = await fetch(`/api/staff/documents?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'SET_DOCUMENTS', documents: data.documents || [] })

        const docTypes = Array.from(
          new Set(
            (data.documents || [])
              .map((doc: StaffDocument) => doc.type)
              .filter((type: string) => type && type.trim())
          )
        )
        if (!docTypes.includes('KYC')) {
          docTypes.unshift('KYC')
        }

        const key = `${investorType}:${investorId}:${dealId || 'all'}`
        dispatch({ type: 'SET_PARTICIPANT_DOC_TYPES', key, docTypes })
      }
    } catch (error) {
      console.error('Error fetching investor documents:', error)
      toast.error('Failed to load investor documents')
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }, [])

  const fetchDataRoomDocuments = useCallback(async (dealId: string) => {
    dispatch({ type: 'SET_LOADING_DATA_ROOM', loading: true })

    try {
      const response = await fetch(`/api/staff/documents/data-room/${dealId}`)
      if (response.ok) {
        const data = await response.json()
        dispatch({
          type: 'SET_DATA_ROOM_DOCUMENTS',
          documents: data.documents || [],
        })
      }
    } catch (error) {
      console.error('Error fetching data room documents:', error)
      toast.error('Failed to load data room documents')
    } finally {
      dispatch({ type: 'SET_LOADING_DATA_ROOM', loading: false })
    }
  }, [])

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      dispatch({ type: 'CLEAR_SEARCH' })
      return
    }

    dispatch({ type: 'SET_IS_SEARCHING', isSearching: true })
    dispatch({ type: 'ENTER_SEARCH_MODE' })

    try {
      const params = new URLSearchParams({ q: query })
      const response = await fetch(`/api/staff/documents/search?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        dispatch({
          type: 'SET_SEARCH_RESULTS',
          results: data.results || [],
          total: data.total || 0,
        })
      } else {
        toast.error('Search failed')
        dispatch({ type: 'SET_SEARCH_RESULTS', results: [], total: 0 })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
      dispatch({ type: 'SET_SEARCH_RESULTS', results: [], total: 0 })
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Navigation Helpers
  // ---------------------------------------------------------------------------

  const navigateToFolder = useCallback((folderId: string | null, folderName?: string) => {
    dispatch({ type: 'NAVIGATE_TO_FOLDER', folderId, folderName })
  }, [])

  const navigateToVehicle = useCallback((vehicleId: string, vehicleName?: string, isVirtual?: boolean) => {
    // If no name provided, try to find it from vehicles
    const name = vehicleName || state.data.vehicles.find(v => v.id === vehicleId)?.name || 'Unknown Vehicle'
    dispatch({ type: 'NAVIGATE_TO_VEHICLE', vehicleId, vehicleName: name, isVirtual })
  }, [state.data.vehicles])

  const navigateToDataRoom = useCallback((dealId: string, dealName: string, vehicleId?: string | null) => {
    // Get vehicleId from current state if not provided
    const vId = vehicleId ?? state.navigation.selectedVehicleId ?? null
    dispatch({ type: 'NAVIGATE_TO_DATA_ROOM', dealId, dealName, vehicleId: vId })
    fetchDataRoomDocuments(dealId)
  }, [fetchDataRoomDocuments, state.navigation.selectedVehicleId])

  const navigateToInvestor = useCallback((
    investorId: string,
    investorName: string,
    investorType: ParticipantEntityType,
    dealId: string | null,
    vehicleId: string | null,
  ) => {
    dispatch({ type: 'NAVIGATE_TO_INVESTOR', investorId, investorName, investorType, dealId, vehicleId })
  }, [])

  const navigateBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE_BACK' })
  }, [])

  // ---------------------------------------------------------------------------
  // Document Operations
  // ---------------------------------------------------------------------------

  const moveDocument = useCallback(async (
    documentId: string,
    folderId: string,
    folderName: string
  ): Promise<boolean> => {
    // Optimistic update
    dispatch({ type: 'REMOVE_DOCUMENT', documentId })

    try {
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId }),
      })

      if (response.ok) {
        toast.success(`Document moved to ${folderName}`)
        return true
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast.error(`Failed to move document: ${errorData.error}`)
        // Revert - would need to refetch
        fetchDocuments(state.navigation.currentFolderId, state.navigation.selectedVehicleId)
        return false
      }
    } catch (error) {
      console.error('Error moving document:', error)
      toast.error('Failed to move document')
      fetchDocuments(state.navigation.currentFolderId, state.navigation.selectedVehicleId)
      return false
    }
  }, [fetchDocuments, state.navigation.currentFolderId, state.navigation.selectedVehicleId])

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        dispatch({ type: 'REMOVE_DOCUMENT', documentId })
        toast.success('Document deleted')
        return true
      } else {
        toast.error('Failed to delete document')
        return false
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
      return false
    }
  }, [])

  const renameDocument = useCallback(async (
    documentId: string,
    newName: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/staff/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        dispatch({ type: 'UPDATE_DOCUMENT', documentId, updates: { name: newName } })
        toast.success('Document renamed')
        return true
      } else {
        toast.error('Failed to rename document')
        return false
      }
    } catch (error) {
      console.error('Error renaming document:', error)
      toast.error('Failed to rename document')
      return false
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Folder Operations
  // ---------------------------------------------------------------------------

  const createFolder = useCallback(async (
    name: string,
    parentId: string | null
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/staff/documents/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parent_folder_id: parentId }),
      })

      if (response.ok) {
        await fetchFolders()
        toast.success('Folder created')
        return true
      } else {
        toast.error('Failed to create folder')
        return false
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Failed to create folder')
      return false
    }
  }, [fetchFolders])

  const renameFolder = useCallback(async (
    folderId: string,
    newName: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/staff/documents/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        await fetchFolders()
        toast.success('Folder renamed')
        return true
      } else {
        toast.error('Failed to rename folder')
        return false
      }
    } catch (error) {
      console.error('Error renaming folder:', error)
      toast.error('Failed to rename folder')
      return false
    }
  }, [fetchFolders])

  const deleteFolder = useCallback(async (folderId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/staff/documents/folders/${folderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchFolders()
        toast.success('Folder deleted')
        return true
      } else {
        toast.error('Failed to delete folder')
        return false
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast.error('Failed to delete folder')
      return false
    }
  }, [fetchFolders])

  // ---------------------------------------------------------------------------
  // Bulk Operations
  // ---------------------------------------------------------------------------

  const bulkDownload = useCallback(async (documentIds: string[]) => {
    if (documentIds.length === 0) return

    const toastId = toast.loading('Preparing download...')

    try {
      const response = await fetch('/api/staff/documents/bulk-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_ids: documentIds }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Download failed')
      }

      const blob = await response.blob()

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'documents.zip'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/)
        if (match) filename = match[1]
      }

      // Trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.dismiss(toastId)
      toast.success(`Downloaded ${documentIds.length} document(s) as ZIP`)
      dispatch({ type: 'CLEAR_SELECTION' })
    } catch (error) {
      console.error('Bulk download error:', error)
      toast.dismiss(toastId)
      toast.error(error instanceof Error ? error.message : 'Failed to download documents')
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  const getVehicleById = useCallback((vehicleId: string | null): Vehicle | null => {
    if (!vehicleId) return null
    return state.data.vehicles.find(v => v.id === vehicleId) || null
  }, [state.data.vehicles])

  const getSubfolders = useCallback((): DocumentFolder[] => {
    // If a vehicle is selected, only show folders for that vehicle
    const vehicleId = state.navigation.selectedVehicleId

    // If we're at root with no vehicle selected, return empty (show vehicle picker instead)
    if (!state.navigation.currentFolderId && !vehicleId) {
      return []
    }

    return state.data.folders.filter(f => {
      // Must match parent folder
      const matchesParent = f.parent_folder_id === (state.navigation.currentFolderId || null)

      // If vehicle is selected, filter by vehicle
      if (vehicleId) {
        return matchesParent && f.vehicle_id === vehicleId
      }

      return matchesParent
    })
  }, [state.data.folders, state.navigation.currentFolderId, state.navigation.selectedVehicleId])

  const getFilteredDocuments = useCallback((
    searchQuery?: string,
    tagFilters?: Set<string>
  ): StaffDocument[] => {
    let result = state.data.documents

    const getDocName = (doc: StaffDocument) =>
      getDocumentDisplayName(doc).toString()

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(doc => {
        const nameMatch = getDocName(doc).toLowerCase().includes(query)
        const vehicleNameMatch = doc.vehicle?.name.toLowerCase().includes(query) || false
        const folderNameMatch = doc.folder?.name.toLowerCase().includes(query) || false
        const typeMatch = doc.type.toLowerCase().includes(query)
        return nameMatch || vehicleNameMatch || folderNameMatch || typeMatch
      })
    }

    // Tag filter
    if (tagFilters && tagFilters.size > 0) {
      result = result.filter(doc => {
        if (!doc.tags || doc.tags.length === 0) return false
        return doc.tags.some(tag => tagFilters.has(tag))
      })
    }

    // Sort
    const { sortBy, sortDir } = state.ui
    result = [...result].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = getDocName(a).localeCompare(getDocName(b))
      } else if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === 'size') {
        comparison = (a.file_size_bytes || 0) - (b.file_size_bytes || 0)
      }
      return sortDir === 'desc' ? -comparison : comparison
    })

    return result
  }, [state.data.documents, state.ui.sortBy, state.ui.sortDir])

  // ---------------------------------------------------------------------------
  // Initial Data Fetch
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetchFolders()
    fetchDocuments(null)
  }, [fetchFolders, fetchDocuments])

  // Fetch documents when navigation changes
  useEffect(() => {
    if (state.navigation.isDataRoomMode) {
      // Data room mode fetches its own documents via navigateToDataRoom
      return
    }

    if (state.navigation.selectedInvestorId && state.navigation.selectedInvestorType) {
      fetchInvestorDocuments(
        state.navigation.selectedInvestorId,
        state.navigation.selectedDealId,
        state.navigation.selectedInvestorType
      )
      return
    }

    fetchDocuments(
      state.navigation.currentFolderId,
      state.navigation.selectedVehicleId
    )
  }, [
    state.navigation.currentFolderId,
    state.navigation.selectedVehicleId,
    state.navigation.isDataRoomMode,
    state.navigation.selectedInvestorId,
    state.navigation.selectedInvestorType,
    state.navigation.selectedDealId,
    fetchInvestorDocuments,
    fetchDocuments,
  ])

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('staff-docs-view')
    if (saved === 'grid' || saved === 'list') {
      dispatch({ type: 'SET_VIEW_MODE', mode: saved })
    }
  }, [])

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('staff-docs-view', state.ui.viewMode)
  }, [state.ui.viewMode])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------------

  const contextValue = useMemo<StaffDocumentsContextValue>(() => ({
    state,
    dispatch,
    navigateToFolder,
    navigateToVehicle,
    navigateToDataRoom,
    navigateToInvestor,
    navigateBack,
    fetchFolders,
    fetchDocuments,
    fetchDealsForVehicle,
    fetchAllDeals,
    fetchInvestorsForDeal,
    fetchAccountsByType,
    fetchDataRoomDocuments,
    fetchInvestorDocuments,
    performSearch,
    moveDocument,
    deleteDocument,
    renameDocument,
    createFolder,
    renameFolder,
    deleteFolder,
    bulkDownload,
    getVehicleById,
    getSubfolders,
    getFilteredDocuments,
  }), [
    state,
    navigateToFolder,
    navigateToVehicle,
    navigateToDataRoom,
    navigateToInvestor,
    navigateBack,
    fetchFolders,
    fetchDocuments,
    fetchDealsForVehicle,
    fetchAllDeals,
    fetchInvestorsForDeal,
    fetchAccountsByType,
    fetchDataRoomDocuments,
    fetchInvestorDocuments,
    performSearch,
    moveDocument,
    deleteDocument,
    renameDocument,
    createFolder,
    renameFolder,
    deleteFolder,
    bulkDownload,
    getVehicleById,
    getSubfolders,
    getFilteredDocuments,
  ])

  return (
    <StaffDocumentsContext.Provider value={contextValue}>
      {children}
    </StaffDocumentsContext.Provider>
  )
}

// =============================================================================
// Hook
// =============================================================================

export function useStaffDocuments(): StaffDocumentsContextValue {
  const context = useContext(StaffDocumentsContext)
  if (!context) {
    throw new Error('useStaffDocuments must be used within a StaffDocumentsProvider')
  }
  return context
}
