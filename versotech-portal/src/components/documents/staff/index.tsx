'use client'

/**
 * Staff Documents Module
 *
 * Premium document management interface for Versotech staff.
 * "Google Drive for Investment Banking" with institutional-grade aesthetics.
 *
 * Architecture:
 * - Context + useReducer for centralized state management
 * - Modular component composition for maintainability
 * - Premium glass effects and smooth transitions
 */

import React from 'react'
import {
  StaffDocumentsProvider,
  useStaffDocuments,
} from './context/StaffDocumentsContext'
import { StaffDocumentsLayout } from './layout/StaffDocumentsLayout'
import { DocumentUploadDialog } from '@/components/documents/document-upload-dialog'
import { CreateFolderDialog } from '@/components/documents/create-folder-dialog'
import { MoveDocumentDialog } from '@/components/documents/move-document-dialog'
import { BulkMoveDialog } from '@/components/documents/bulk-move-dialog'
import { BulkDeleteDialog } from '@/components/documents/bulk-delete-dialog'
import { RenameFolderDialog } from '@/components/documents/rename-folder-dialog'
import { RenameDocumentDialog } from '@/components/documents/rename-document-dialog'
import { VersionHistorySheet } from '@/components/documents/version-history-sheet'
import { getDocumentDisplayName } from '@/lib/documents/document-name'

// =============================================================================
// Types
// =============================================================================

export interface StaffDocumentsProps {
  initialVehicles: {
    id: string
    name: string
    type: string
  }[]
  userProfile: {
    role: string
    display_name: string
    title?: string
  }
}

// =============================================================================
// Dialog Integration Component
// =============================================================================

function StaffDocumentsDialogs() {
  const { state, dispatch, fetchFolders, fetchDocuments } = useStaffDocuments()
  const { dialogs, navigation, selection, data, dragDrop } = state

  // ---------------------------------------------------------------------------
  // Dialog Handlers
  // ---------------------------------------------------------------------------

  const handleUploadSuccess = () => {
    dispatch({ type: 'CLOSE_UPLOAD_DIALOG' })
    fetchDocuments(navigation.currentFolderId, navigation.selectedVehicleId)
  }

  const handleCreateFolderSuccess = () => {
    dispatch({ type: 'CLOSE_CREATE_FOLDER_DIALOG' })
    fetchFolders()
  }

  const handleMoveSuccess = () => {
    dispatch({ type: 'CLOSE_MOVE_DIALOG' })
    fetchDocuments(navigation.currentFolderId, navigation.selectedVehicleId)
  }

  const handleBulkMoveSuccess = () => {
    dispatch({ type: 'CLOSE_BULK_MOVE_DIALOG' })
    dispatch({ type: 'CLEAR_SELECTION' })
    fetchDocuments(navigation.currentFolderId, navigation.selectedVehicleId)
  }

  const handleBulkDeleteSuccess = () => {
    dispatch({ type: 'CLOSE_BULK_DELETE_DIALOG' })
    dispatch({ type: 'CLEAR_SELECTION' })
    fetchDocuments(navigation.currentFolderId, navigation.selectedVehicleId)
  }

  const handleRenameFolderSuccess = () => {
    dispatch({ type: 'CLOSE_RENAME_FOLDER_DIALOG' })
    fetchFolders()
  }

  const handleRenameDocumentSuccess = () => {
    dispatch({ type: 'CLOSE_RENAME_DOCUMENT_DIALOG' })
    fetchDocuments(navigation.currentFolderId, navigation.selectedVehicleId)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={dialogs.uploadDialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_UPLOAD_DIALOG' })
        }}
        folderId={dragDrop.uploadTargetFolderId || navigation.currentFolderId}
        initialFiles={dragDrop.droppedFiles}
        onSuccess={handleUploadSuccess}
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={dialogs.createFolderDialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_CREATE_FOLDER_DIALOG' })
        }}
        parentFolderId={dialogs.createFolderParentId}
        vehicleId={navigation.selectedVehicleId}
        onSuccess={handleCreateFolderSuccess}
      />

      {/* Move Document Dialog */}
      <MoveDocumentDialog
        open={dialogs.moveDialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_MOVE_DIALOG' })
        }}
        documentId={dialogs.moveDialogDocId}
        documentName={dialogs.moveDialogDocName}
        currentFolderId={dialogs.moveDialogCurrentFolder}
        onSuccess={handleMoveSuccess}
      />

      {/* Bulk Move Dialog */}
      <BulkMoveDialog
        open={dialogs.bulkMoveDialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_BULK_MOVE_DIALOG' })
        }}
        documentIds={Array.from(selection.selectedDocuments)}
        onSuccess={handleBulkMoveSuccess}
        onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={dialogs.bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_BULK_DELETE_DIALOG' })
        }}
        documentIds={Array.from(selection.selectedDocuments)}
        documentNames={data.documents
          .filter(d => selection.selectedDocuments.has(d.id))
          .map(d => getDocumentDisplayName(d))}
        onSuccess={handleBulkDeleteSuccess}
        onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
      />

      {/* Rename Folder Dialog */}
      <RenameFolderDialog
        open={dialogs.renameFolderDialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_RENAME_FOLDER_DIALOG' })
        }}
        folderId={dialogs.renameFolderId}
        currentName={dialogs.renameFolderName}
        onSuccess={handleRenameFolderSuccess}
      />

      {/* Rename Document Dialog */}
      <RenameDocumentDialog
        open={dialogs.renameDocumentDialogOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_RENAME_DOCUMENT_DIALOG' })
        }}
        documentId={dialogs.renameDocumentId}
        currentName={dialogs.renameDocumentName}
        onSuccess={handleRenameDocumentSuccess}
      />

      {/* Version History Sheet */}
      <VersionHistorySheet
        open={dialogs.versionHistoryOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'CLOSE_VERSION_HISTORY' })
        }}
        documentId={dialogs.versionHistoryDocId || ''}
        documentName={dialogs.versionHistoryDocName}
        currentVersion={dialogs.versionHistoryCurrentVersion}
      />
    </>
  )
}

// =============================================================================
// Main Component
// =============================================================================

function StaffDocumentsContent() {
  return (
    <>
      <StaffDocumentsLayout />
      <StaffDocumentsDialogs />
    </>
  )
}

// =============================================================================
// Export
// =============================================================================

export function StaffDocuments({ initialVehicles, userProfile }: StaffDocumentsProps) {
  return (
    <StaffDocumentsProvider initialVehicles={initialVehicles} userProfile={userProfile}>
      <StaffDocumentsContent />
    </StaffDocumentsProvider>
  )
}

// Re-export context hook for external use
export { useStaffDocuments } from './context/StaffDocumentsContext'
export type { StaffDocumentsState, StaffDocumentsAction } from './context/types'
