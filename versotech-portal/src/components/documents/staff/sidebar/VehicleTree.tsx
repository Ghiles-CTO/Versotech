'use client'

/**
 * Vehicle Tree
 *
 * Renders the hierarchical tree of vehicles, folders, and deals.
 * Uses parseVehicleHierarchy to organize vehicles into parent/child relationships.
 */

import React, { useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { TreeNode } from './TreeNode'
import { FolderActions } from './FolderActions'
import { parseVehicleHierarchy, VehicleNode } from '@/lib/documents/vehicle-hierarchy'
import { DocumentFolder } from '@/types/documents'
import type { ParticipantEntityType } from '../context/types'
import { Loader2 } from 'lucide-react'

interface VehicleTreeProps {
  className?: string
}

export function VehicleTree({ className }: VehicleTreeProps) {
  const {
    state,
    dispatch,
    navigateToFolder,
    navigateToVehicle,
    navigateToDataRoom,
    navigateToInvestor,
    fetchDealsForVehicle,
    fetchInvestorsForDeal,
  } = useStaffDocuments()

  const { tree, data, navigation } = state

  // ---------------------------------------------------------------------------
  // Parse Vehicle Hierarchy
  // ---------------------------------------------------------------------------

  const vehicleHierarchy = useMemo(() => {
    return parseVehicleHierarchy(data.vehicles)
  }, [data.vehicles])

  // ---------------------------------------------------------------------------
  // Build Folder Tree for Vehicle
  // ---------------------------------------------------------------------------

  const getFoldersForVehicle = useCallback(
    (vehicleId: string): DocumentFolder[] => {
      return data.folders.filter((f) => f.vehicle_id === vehicleId)
    },
    [data.folders]
  )

  const getChildFolders = useCallback(
    (parentId: string | null, vehicleId: string): DocumentFolder[] => {
      return data.folders.filter(
        (f) => f.parent_folder_id === parentId && f.vehicle_id === vehicleId
      )
    },
    [data.folders]
  )

  // ---------------------------------------------------------------------------
  // Filter Logic
  // ---------------------------------------------------------------------------

  const filterMatches = useCallback(
    (name: string): boolean => {
      if (!tree.debouncedTreeSearch) return true
      return name.toLowerCase().includes(tree.debouncedTreeSearch.toLowerCase())
    },
    [tree.debouncedTreeSearch]
  )

  // ---------------------------------------------------------------------------
  // Expansion State Helpers
  // ---------------------------------------------------------------------------

  const isVehicleExpanded = useCallback(
    (vehicleId: string): boolean => {
      if (tree.debouncedTreeSearch) {
        return true
      }
      return tree.expandedVehicles.has(vehicleId)
    },
    [tree.debouncedTreeSearch, tree.expandedVehicles]
  )

  const isFolderExpanded = useCallback(
    (folderId: string): boolean => {
      if (tree.debouncedTreeSearch) {
        return true
      }
      return tree.expandedFolders.has(folderId)
    },
    [tree.debouncedTreeSearch, tree.expandedFolders]
  )

  const isDealsNodeExpanded = useCallback(
    (vehicleId: string): boolean => {
      return tree.expandedDealsNodes.has(vehicleId)
    },
    [tree.expandedDealsNodes]
  )

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleVehicleToggle = useCallback(
    (vehicleId: string) => {
      dispatch({ type: 'TOGGLE_VEHICLE_EXPANDED', vehicleId })
    },
    [dispatch]
  )

  const handleVehicleClick = useCallback(
    (vehicleId: string, vehicleName: string, isVirtual?: boolean) => {
      if (isVirtual) {
        // Navigate to virtual parent (e.g., SCSP group)
        navigateToVehicle(vehicleId, vehicleName, true)
        return
      }
      navigateToVehicle(vehicleId, vehicleName, false)
    },
    [navigateToVehicle]
  )

  const handleFolderToggle = useCallback(
    (folderId: string) => {
      dispatch({ type: 'TOGGLE_FOLDER_EXPANDED', folderId })
    },
    [dispatch]
  )

  const handleFolderClick = useCallback(
    (folderId: string) => {
      navigateToFolder(folderId)
    },
    [navigateToFolder]
  )

  const handleDealsNodeToggle = useCallback(
    (vehicleId: string) => {
      dispatch({ type: 'TOGGLE_DEALS_NODE_EXPANDED', vehicleId })
      // Fetch deals if not loaded
      if (!tree.expandedDealsNodes.has(vehicleId)) {
        fetchDealsForVehicle(vehicleId)
      }
    },
    [dispatch, tree.expandedDealsNodes, fetchDealsForVehicle]
  )

  const handleDealClick = useCallback(
    (dealId: string, dealName: string, vehicleId: string) => {
      navigateToDataRoom(dealId, dealName, vehicleId)
    },
    [navigateToDataRoom]
  )

  const handleInvestorsNodeToggle = useCallback(
    (dealId: string) => {
      dispatch({ type: 'TOGGLE_DEAL_INVESTORS_EXPANDED', dealId })
      // Fetch investors if not loaded
      if (!tree.expandedDealInvestors.has(dealId)) {
        fetchInvestorsForDeal(dealId)
      }
    },
    [dispatch, tree.expandedDealInvestors, fetchInvestorsForDeal]
  )

  const handleInvestorClick = useCallback(
    (
      investorId: string,
      investorName: string,
      investorType: ParticipantEntityType,
      dealId: string,
      vehicleId: string
    ) => {
      navigateToInvestor(investorId, investorName, investorType, dealId, vehicleId)
    },
    [navigateToInvestor]
  )

  const handleInvestorDocTypeClick = useCallback(
    (docType: string | null) => {
      dispatch({ type: 'SET_INVESTOR_DOC_TYPE', docType })
    },
    [dispatch]
  )

  // ---------------------------------------------------------------------------
  // Recursive Folder Renderer
  // ---------------------------------------------------------------------------

  const renderFolder = useCallback(
    (folder: DocumentFolder, depth: number, vehicleId: string): React.ReactNode => {
      const childFolders = getChildFolders(folder.id, vehicleId)
      const hasChildren = childFolders.length > 0
      const isExpanded = isFolderExpanded(folder.id)
      const isSelected = navigation.currentFolderId === folder.id
      const matchesFilter = filterMatches(folder.name)

      // Skip if doesn't match filter and has no matching children
      if (!matchesFilter && !tree.debouncedTreeSearch) {
        // Show all when not searching
      } else if (!matchesFilter) {
        // Check if any child matches
        const hasMatchingChild = childFolders.some((child) =>
          filterMatches(child.name)
        )
        if (!hasMatchingChild) return null
      }

      return (
        <TreeNode
          key={folder.id}
          type="folder"
          id={folder.id}
          name={folder.name}
          depth={depth}
          isExpanded={isExpanded}
          isSelected={isSelected}
          documentCount={folder.document_count}
          onToggle={hasChildren ? () => handleFolderToggle(folder.id) : undefined}
          onClick={() => handleFolderClick(folder.id)}
          trailing={<FolderActions folder={folder} />}
        >
          {hasChildren && isExpanded && (
            <div className="ml-0">
              {childFolders.map((child) => renderFolder(child, depth + 1, vehicleId))}
            </div>
          )}
        </TreeNode>
      )
    },
    [
      getChildFolders,
      isFolderExpanded,
      navigation.currentFolderId,
      filterMatches,
      tree.debouncedTreeSearch,
      handleFolderToggle,
      handleFolderClick,
    ]
  )

  // ---------------------------------------------------------------------------
  // Render Vehicle Node
  // ---------------------------------------------------------------------------

  const renderVehicleNode = useCallback(
    (node: VehicleNode, depth: number = 0): React.ReactNode => {
      const isExpanded = isVehicleExpanded(node.id)
      const isSelected = navigation.selectedVehicleId === node.id && !navigation.currentFolderId
      const matchesFilter = filterMatches(node.name)

      // For real (non-virtual) vehicles, get their folders
      const rootFolders = node.isVirtual
        ? []
        : getChildFolders(null, node.id)
      const deals = data.vehicleDeals.get(node.id) || []
      const isLoadingDeals = data.loadingDeals.has(node.id)
      const dealsExpanded = isDealsNodeExpanded(node.id)

      const hasChildren =
        node.children.length > 0 || rootFolders.length > 0 || !node.isVirtual

      // Skip if doesn't match filter (for non-parent nodes)
      if (!matchesFilter && tree.debouncedTreeSearch && !node.isParent) {
        return null
      }

      return (
        <TreeNode
          key={node.id}
          type="vehicle"
          id={node.id}
          name={node.name}
          depth={depth}
          isExpanded={isExpanded}
          isSelected={isSelected}
          isVirtual={node.isVirtual}
          onToggle={hasChildren ? () => handleVehicleToggle(node.id) : undefined}
          onClick={() => handleVehicleClick(node.id, node.name, node.isVirtual)}
        >
          {isExpanded && (
            <div className="ml-0">
              {/* Child vehicles (for parent nodes like SCSP groups) */}
              {node.children.map((child) => renderVehicleNode(child, depth + 1))}

              {/* Root folders */}
              {rootFolders.map((folder) =>
                renderFolder(folder, depth + 1, node.id)
              )}

              {/* Deals node (virtual folder) */}
              {!node.isVirtual && (
                <TreeNode
                  key={`deals-${node.id}`}
                  type="deals-group"
                  id={`deals-${node.id}`}
                  name="Deal Rooms"
                  depth={depth + 1}
                  isExpanded={dealsExpanded}
                  onToggle={() => handleDealsNodeToggle(node.id)}
                >
                  {dealsExpanded && (
                    <div className="ml-0">
                      {isLoadingDeals ? (
                        <div className="flex items-center gap-2 py-1.5 px-3 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading...
                        </div>
                      ) : deals.length === 0 ? (
                        <div className="py-1.5 px-3 text-sm text-muted-foreground italic">
                          No deals
                        </div>
                      ) : (
                        deals.map((deal) => {
                          const dealExpanded = tree.expandedDealDataRooms.has(deal.id)
                          const investorsExpanded = tree.expandedDealInvestors.has(deal.id)
                          const investors = data.dealInvestors.get(deal.id) || []
                          const isLoadingDealInvestors = data.loadingInvestors.has(deal.id)

                          return (
                            <TreeNode
                              key={deal.id}
                              type="deal"
                              id={deal.id}
                              name={deal.name}
                              depth={depth + 2}
                              isExpanded={dealExpanded}
                              isSelected={
                                navigation.dataRoomDealId === deal.id &&
                                !navigation.selectedInvestorId
                              }
                              onClick={() => handleDealClick(deal.id, deal.name, node.id)}
                              onToggle={() =>
                                dispatch({
                                  type: 'TOGGLE_DEAL_DATA_ROOM_EXPANDED',
                                  dealId: deal.id,
                                })
                              }
                            >
                              {dealExpanded && (
                                <>
                                  {/* Data Room virtual folder */}
                                  <TreeNode
                                    key={`dataroom-${deal.id}`}
                                    type="data-room"
                                    id={`dataroom-${deal.id}`}
                                    name="Data Room"
                                    depth={depth + 3}
                                    isSelected={
                                      navigation.isDataRoomMode &&
                                      navigation.dataRoomDealId === deal.id
                                    }
                                    onClick={() => handleDealClick(deal.id, deal.name, node.id)}
                                  />

                                  {/* Participants virtual folder */}
                                  <TreeNode
                                    key={`investors-${deal.id}`}
                                    type="investors-group"
                                    id={`investors-${deal.id}`}
                                    name="Participants"
                                    depth={depth + 3}
                                    isExpanded={investorsExpanded}
                                    onToggle={() => handleInvestorsNodeToggle(deal.id)}
                                  >
                                    {investorsExpanded && (
                                      <div className="ml-0">
                                        {isLoadingDealInvestors ? (
                                          <div className="flex items-center gap-2 py-1.5 px-3 text-sm text-muted-foreground">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Loading...
                                          </div>
                                        ) : investors.length === 0 ? (
                                          <div className="py-1.5 px-3 text-sm text-muted-foreground italic">
                                            No participants
                                          </div>
                                        ) : (
                                          investors.map((investor) => {
                                            const investorSelected =
                                              navigation.selectedInvestorId === investor.id &&
                                              navigation.selectedInvestorType === investor.entity_type
                                            const docTypeKey = `${investor.entity_type}:${investor.id}:${deal.id}`
                                            const docTypes =
                                              data.participantDocumentTypes.get(docTypeKey) || []
                                            const docTypesToShow =
                                              docTypes.length > 0 ? docTypes : ['KYC']

                                            return (
                                              <TreeNode
                                                key={`${investor.entity_type}-${investor.id}`}
                                                type="investor"
                                                id={`${investor.entity_type}-${investor.id}`}
                                                name={investor.display_name}
                                                depth={depth + 4}
                                                isSelected={investorSelected}
                                                isExpanded={investorSelected}
                                                onClick={() =>
                                                  handleInvestorClick(
                                                    investor.id,
                                                    investor.display_name,
                                                    investor.entity_type,
                                                    deal.id,
                                                    node.id
                                                  )
                                                }
                                              >
                                                {investorSelected && (
                                                  <div className="ml-0">
                                                    <TreeNode
                                                      key={`all-${investor.entity_type}-${investor.id}`}
                                                      type="doc-type"
                                                      id={`all-${investor.entity_type}-${investor.id}`}
                                                      name="All Documents"
                                                      depth={depth + 5}
                                                      isSelected={!navigation.selectedInvestorDocType}
                                                      onClick={() => handleInvestorDocTypeClick(null)}
                                                    />
                                                    {docTypesToShow.map((docType) => (
                                                      <TreeNode
                                                        key={`${investor.entity_type}-${investor.id}-${docType}`}
                                                        type="doc-type"
                                                        id={`${investor.entity_type}-${investor.id}-${docType}`}
                                                        name={docType}
                                                        depth={depth + 5}
                                                        isSelected={navigation.selectedInvestorDocType === docType}
                                                        onClick={() => handleInvestorDocTypeClick(docType)}
                                                      />
                                                    ))}
                                                  </div>
                                                )}
                                              </TreeNode>
                                            )
                                          })
                                        )}
                                      </div>
                                    )}
                                  </TreeNode>
                                </>
                              )}
                            </TreeNode>
                          )
                        })
                      )}
                    </div>
                  )}
                </TreeNode>
              )}
            </div>
          )}
        </TreeNode>
      )
    },
    [
      isVehicleExpanded,
      navigation.selectedVehicleId,
      navigation.currentFolderId,
      navigation.dataRoomDealId,
      navigation.isDataRoomMode,
      navigation.selectedInvestorId,
      navigation.selectedInvestorType,
      navigation.selectedInvestorDocType,
      filterMatches,
      getChildFolders,
      data.vehicleDeals,
      data.dealInvestors,
      data.participantDocumentTypes,
      data.loadingDeals,
      data.loadingInvestors,
      isDealsNodeExpanded,
      tree.debouncedTreeSearch,
      tree.expandedDealDataRooms,
      tree.expandedDealInvestors,
      handleVehicleToggle,
      handleVehicleClick,
      handleDealsNodeToggle,
      handleDealClick,
      handleInvestorsNodeToggle,
      handleInvestorClick,
      handleInvestorDocTypeClick,
      renderFolder,
    ]
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (data.loading && data.vehicles.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (vehicleHierarchy.length === 0) {
    return (
      <div className={cn('py-4 px-3 text-sm text-muted-foreground italic', className)}>
        No vehicles found
      </div>
    )
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      {vehicleHierarchy.map((node) => renderVehicleNode(node))}
    </div>
  )
}
