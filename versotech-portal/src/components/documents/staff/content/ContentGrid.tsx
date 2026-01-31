'use client'

/**
 * Content Grid
 *
 * Displays ONLY documents in grid or list view.
 * Navigation (folders, vehicles) happens exclusively via the sidebar tree.
 *
 * Content area shows:
 * - Welcome state when nothing selected (root)
 * - Documents at the selected location (vehicle, folder, deal, investor)
 * - Empty state if no documents at current location
 */

import React, { useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { DocumentCard } from '../cards/DocumentCard'
import { useDocumentViewer } from '@/hooks/useDocumentViewer'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import { getDocumentDisplayName } from '@/lib/documents/document-name'
import { FileText, FolderTree, MousePointerClick } from 'lucide-react'

interface ContentGridProps {
  searchQuery?: string
  className?: string
}

export function ContentGrid({ searchQuery = '', className }: ContentGridProps) {
  const {
    state,
    dispatch,
    getFilteredDocuments,
  } = useStaffDocuments()

  const { ui, navigation, data } = state

  // Check if we're at root level (nothing selected)
  const isAtRoot = !navigation.selectedVehicleId &&
                   !navigation.currentFolderId &&
                   !navigation.isDataRoomMode &&
                   !navigation.selectedVirtualParentId &&
                   !navigation.selectedInvestorId

  const isVirtualGroupOnly = !!navigation.selectedVirtualParentId &&
                             !navigation.selectedVehicleId &&
                             !navigation.currentFolderId &&
                             !navigation.isDataRoomMode &&
                             !navigation.selectedInvestorId

  // Document viewer
  const {
    isOpen: previewOpen,
    document: previewDocument,
    previewUrl,
    isLoading: isLoadingPreview,
    error: previewError,
    openPreview,
    closePreview,
    downloadDocument: downloadFromPreview,
  } = useDocumentViewer()

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  // Get documents for current location (with filtering and sorting)
  const documents = useMemo(() => {
    return getFilteredDocuments(searchQuery)
  }, [getFilteredDocuments, searchQuery])

  // Data room documents (if in data room mode)
  const dataRoomDocuments = useMemo(() => {
    if (!navigation.isDataRoomMode) return []

    // Convert DataRoomDocument to StaffDocument format for display
    return data.dataRoomDocuments.map((doc) => ({
      id: doc.id,
      name: getDocumentDisplayName({
        file_name: doc.file_name,
        file_key: doc.file_key,
      }),
      type: 'Other',
      status: 'published',
      file_size_bytes: doc.file_size_bytes || 0,
      is_published: doc.visible_to_investors,
      created_at: doc.created_at,
      mime_type: doc.mime_type || undefined,
      file_key: doc.file_key || undefined,
      file_name: doc.file_name || undefined,
      tags: doc.tags || undefined,
      current_version: doc.version,
    }))
  }, [navigation.isDataRoomMode, data.dataRoomDocuments])

  const displayDocuments = navigation.isDataRoomMode ? dataRoomDocuments : documents

  const normalizedDocuments = useMemo(() => {
    return displayDocuments.map((doc) => ({
      ...doc,
      name: getDocumentDisplayName(doc),
    }))
  }, [displayDocuments])

  const filteredDocuments = navigation.selectedInvestorDocType
    ? normalizedDocuments.filter(
        (doc) =>
          doc.type &&
          doc.type.toLowerCase() === navigation.selectedInvestorDocType?.toLowerCase()
      )
    : normalizedDocuments

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleDocumentClick = useCallback(
    (doc: { id: string; name: string; mime_type?: string; file_size_bytes?: number }) => {
      openPreview({
        id: doc.id,
        file_name: doc.name,
        mime_type: doc.mime_type,
        file_size_bytes: doc.file_size_bytes,
      })
    },
    [openPreview]
  )

  const handleDocumentSelect = useCallback(
    (documentId: string) => {
      dispatch({ type: 'TOGGLE_DOCUMENT_SELECTED', documentId })
    },
    [dispatch]
  )

  const handleDocumentDragStart = useCallback(
    (e: React.DragEvent, documentId: string, documentName: string) => {
      dispatch({
        type: 'SET_DRAGGING_DOCUMENT',
        documentId,
        documentName,
      })
      e.dataTransfer.setData('application/x-document-id', documentId)
      e.dataTransfer.setData('application/x-document-name', documentName)
      e.dataTransfer.effectAllowed = 'move'
    },
    [dispatch]
  )

  const handleDocumentDragEnd = useCallback(() => {
    dispatch({ type: 'SET_DRAGGING_DOCUMENT', documentId: null, documentName: null })
  }, [dispatch])

  // ---------------------------------------------------------------------------
  // Welcome State (Root Level - Nothing Selected)
  // ---------------------------------------------------------------------------

  if (isAtRoot || isVirtualGroupOnly) {
    const rootTitle =
      ui.browseMode === 'deals'
        ? 'Select a deal'
        : ui.browseMode === 'accounts'
        ? 'Select an account'
        : isVirtualGroupOnly
        ? 'Select a vehicle'
        : 'Select a location'

    const rootMessage =
      ui.browseMode === 'deals'
        ? 'Choose a deal to view its data room and participant documents.'
        : ui.browseMode === 'accounts'
        ? 'Choose an account to view its documents across the platform.'
        : isVirtualGroupOnly
        ? 'Choose a vehicle in this group to view its folders, deals, and participant documents.'
        : 'Use the navigation tree on the left to browse vehicles, folders, deals, and participant documents.'

    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
          <FolderTree className="h-10 w-10 text-primary/60" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {rootTitle}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {rootMessage}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
          <MousePointerClick className="h-3.5 w-3.5" />
          <span>Click any item in the sidebar to view its documents</span>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Empty State (location selected but no documents)
  // ---------------------------------------------------------------------------

  if (filteredDocuments.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16', className)}>
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          {searchQuery ? 'No results found' : 'No documents yet'}
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {searchQuery
            ? `No documents match "${searchQuery}"`
            : navigation.isDataRoomMode
            ? 'This data room is empty. Upload documents to get started.'
            : 'Upload documents to this location to get started.'}
        </p>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Grid View (documents only)
  // ---------------------------------------------------------------------------

  if (ui.viewMode === 'grid') {
    return (
      <>
        <div className={cn('space-y-6', className)}>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              Documents ({filteredDocuments.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isSelected={state.selection.selectedDocuments.has(doc.id)}
                  onSelect={() => handleDocumentSelect(doc.id)}
                  onClick={() =>
                    handleDocumentClick({
                      id: doc.id,
                      name: doc.name,
                      mime_type: doc.mime_type,
                      file_size_bytes: doc.file_size_bytes,
                    })
                  }
                  onDragStart={(e) => handleDocumentDragStart(e, doc.id, doc.name)}
                  onDragEnd={handleDocumentDragEnd}
                />
              ))}
            </div>
          </div>
        </div>

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
      </>
    )
  }

  // ---------------------------------------------------------------------------
  // List View (documents only)
  // ---------------------------------------------------------------------------

  return (
    <>
      <div className={cn('space-y-1', className)}>
        {filteredDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            isSelected={state.selection.selectedDocuments.has(doc.id)}
            onSelect={() => handleDocumentSelect(doc.id)}
            onClick={() =>
              handleDocumentClick({
                id: doc.id,
                name: doc.name,
                mime_type: doc.mime_type,
                file_size_bytes: doc.file_size_bytes,
              })
            }
            onDragStart={(e) => handleDocumentDragStart(e, doc.id, doc.name)}
            onDragEnd={handleDocumentDragEnd}
            className="!flex-row !p-3"
          />
        ))}
      </div>

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
    </>
  )
}
