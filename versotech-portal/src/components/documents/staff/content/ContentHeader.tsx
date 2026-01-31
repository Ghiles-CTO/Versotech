'use client'

/**
 * Content Header
 *
 * Shows current location title and breadcrumbs.
 * Features:
 * - Back button for navigation history
 * - Vehicle/folder path display
 * - Data room indicator
 */

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { StaffDocumentsBreadcrumb } from '@/components/documents/navigation/StaffDocumentsBreadcrumb'
import { Button } from '@/components/ui/button'
import { getVirtualParentDisplayName } from '@/lib/documents/vehicle-hierarchy'
import {
  ArrowLeft,
  Home,
  Building2,
  Database,
  Upload,
  FolderPlus,
  RefreshCw,
  User,
} from 'lucide-react'

interface ContentHeaderProps {
  className?: string
}

export function ContentHeader({ className }: ContentHeaderProps) {
  const {
    state,
    dispatch,
    navigateToFolder,
    navigateBack,
    getVehicleById,
    fetchFolders,
    fetchDocuments,
    fetchInvestorDocuments,
    fetchDataRoomDocuments,
  } = useStaffDocuments()

  const { navigation } = state
  const canGoBack = navigation.navigationHistory.length > 0

  // Current vehicle context
  const currentVehicle = navigation.currentFolder?.vehicle_id
    ? getVehicleById(navigation.currentFolder.vehicle_id)
    : navigation.selectedVehicleId
    ? getVehicleById(navigation.selectedVehicleId)
    : null

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleRefresh = useCallback(() => {
    fetchFolders()
    if (navigation.isDataRoomMode && navigation.dataRoomDealId) {
      fetchDataRoomDocuments(navigation.dataRoomDealId)
      return
    }
    if (navigation.selectedInvestorId && navigation.selectedInvestorType) {
      fetchInvestorDocuments(
        navigation.selectedInvestorId,
        navigation.selectedDealId,
        navigation.selectedInvestorType
      )
      return
    }
    fetchDocuments(navigation.currentFolderId, navigation.selectedVehicleId)
  }, [
    fetchFolders,
    fetchDocuments,
    fetchInvestorDocuments,
    fetchDataRoomDocuments,
    navigation.currentFolderId,
    navigation.selectedVehicleId,
    navigation.selectedInvestorId,
    navigation.selectedInvestorType,
    navigation.selectedDealId,
    navigation.isDataRoomMode,
    navigation.dataRoomDealId,
  ])

  const handleUpload = useCallback(() => {
    dispatch({ type: 'OPEN_UPLOAD_DIALOG' })
  }, [dispatch])

  const handleCreateFolder = useCallback(() => {
    dispatch({
      type: 'OPEN_CREATE_FOLDER_DIALOG',
      parentId: navigation.currentFolderId,
    })
  }, [dispatch, navigation.currentFolderId])

  // ---------------------------------------------------------------------------
  // Title Generation
  // ---------------------------------------------------------------------------

  // Convert virtual parent ID to display name
  // e.g., "virtual-verso-capital-1-scsp" → "VERSO Capital 1 SCSP"
  const getVirtualParentName = (virtualId: string) => {
    return getVirtualParentDisplayName(virtualId)
  }

  const getTitle = () => {
    // Investor docs view
    if (navigation.selectedInvestorId) {
      const dealInvestors = state.data.dealInvestors.get(navigation.selectedDealId || '') || []
      const accountInvestors = Array.from(state.data.accountsByType.values()).flat()
      const investor =
        dealInvestors.find(
          i =>
            i.id === navigation.selectedInvestorId &&
            i.entity_type === navigation.selectedInvestorType
        ) ||
        accountInvestors.find(
          i =>
            i.id === navigation.selectedInvestorId &&
            i.entity_type === navigation.selectedInvestorType
        )
      const typeLabel =
        navigation.selectedInvestorType === 'partner'
          ? 'Partner'
          : navigation.selectedInvestorType === 'introducer'
          ? 'Introducer'
          : navigation.selectedInvestorType === 'commercial_partner'
          ? 'Commercial Partner'
          : 'Investor'
      const docLabel = navigation.selectedInvestorDocType || 'Documents'
      return (
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-orange-400" />
          <span>{investor?.display_name || typeLabel}</span>
          <span className="text-muted-foreground text-sm">– {docLabel}</span>
        </div>
      )
    }

    if (navigation.isDataRoomMode) {
      return (
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-500" />
          <span>Data Room</span>
          <span className="text-muted-foreground">–</span>
          <span className="text-muted-foreground">{navigation.dataRoomDealName}</span>
        </div>
      )
    }

    if (navigation.currentFolder) {
      return navigation.currentFolder.name
    }

    // Handle virtual parent (e.g., VERSO Capital 1 SCSP)
    if (navigation.selectedVirtualParentId) {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          <span>{getVirtualParentName(navigation.selectedVirtualParentId)}</span>
        </div>
      )
    }

    if (navigation.selectedVehicleId && currentVehicle) {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          <span>{currentVehicle.name}</span>
        </div>
      )
    }

    return 'Select a location'
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn('border-b border-border bg-card/50', className)}>
      {/* Title Row */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              !canGoBack && 'opacity-50 cursor-not-allowed'
            )}
            onClick={navigateBack}
            disabled={!canGoBack}
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => dispatch({ type: 'NAVIGATE_TO_ROOT' })}
            title="Go to root"
          >
            <Home className="h-4 w-4" />
          </Button>

          {/* Title */}
          <h1 className="text-lg md:text-xl font-semibold text-foreground">
            {getTitle()}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {state.ui.browseMode === 'vehicles' &&
            (navigation.selectedVehicleId || navigation.currentFolderId) && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={handleCreateFolder}
              >
                <FolderPlus className="h-4 w-4" />
                <span>New Folder</span>
              </Button>
            )}
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={handleUpload}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </div>
      </div>

      {/* Breadcrumbs - Show for any navigation beyond root */}
      {(navigation.currentFolder || currentVehicle || navigation.selectedVirtualParentId || navigation.isDataRoomMode || navigation.selectedInvestorId) && (
        <StaffDocumentsBreadcrumb className="border-t border-border" />
      )}
    </div>
  )
}
