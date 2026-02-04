'use client'

/**
 * Deal Tree
 *
 * Renders a deal-first navigation tree.
 */

import React, { useEffect, useMemo, useCallback } from 'react'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import type { ParticipantEntityType } from '../context/types'
import { TreeNode } from './TreeNode'
import { FolderActions } from './FolderActions'
import { DocumentFolder } from '@/types/documents'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface DealTreeProps {
  className?: string
}

const getDefaultParticipantDocTypes = (
  entityType: ParticipantEntityType
): string[] => {
  if (entityType === 'introducer') {
    return ['KYC', 'Introducer Agreement']
  }
  if (entityType === 'investor') {
    return ['KYC', 'NDA', 'Subscription Pack', 'Certificate']
  }
  return ['KYC']
}

const isDealsFolderName = (name: string): boolean => {
  const normalized = name.trim().toLowerCase()
  return normalized === 'deals' || normalized === 'deal rooms'
}

export function DealTree({ className }: DealTreeProps) {
  const {
    state,
    dispatch,
    fetchAllDeals,
    fetchInvestorsForDeal,
    navigateToDataRoom,
    navigateToFolder,
    navigateToInvestor,
  } = useStaffDocuments()

  const { data, tree, navigation } = state

  useEffect(() => {
    if (data.allDeals.length === 0 && !data.loadingAllDeals) {
      fetchAllDeals()
    }
  }, [data.allDeals.length, data.loadingAllDeals, fetchAllDeals])

  const filterMatches = useCallback(
    (name: string): boolean => {
      if (!tree.debouncedTreeSearch) return true
      return name.toLowerCase().includes(tree.debouncedTreeSearch.toLowerCase())
    },
    [tree.debouncedTreeSearch]
  )

  const getChildFolders = useCallback(
    (parentId: string | null, vehicleId: string): DocumentFolder[] => {
      return data.folders.filter(
        (f) => f.parent_folder_id === parentId && f.vehicle_id === vehicleId
      )
    },
    [data.folders]
  )

  const getVehicleRootFolderId = useCallback(
    (vehicleId: string | null): string | null => {
      if (!vehicleId) return null
      const rootFolder = data.folders.find(
        (folder) =>
          folder.vehicle_id === vehicleId &&
          folder.folder_type === 'vehicle_root' &&
          folder.parent_folder_id === null
      )
      return rootFolder?.id || null
    },
    [data.folders]
  )

  const getDealDocumentsFolder = useCallback(
    (dealName: string, vehicleId: string | null): DocumentFolder | null => {
      if (!vehicleId) return null
      const rootFolderId = getVehicleRootFolderId(vehicleId)
      const dealsFolder =
        data.folders.find(
          (folder) =>
            folder.vehicle_id === vehicleId &&
            folder.parent_folder_id === rootFolderId &&
            isDealsFolderName(folder.name)
        ) ||
        data.folders.find(
          (folder) =>
            folder.vehicle_id === vehicleId && isDealsFolderName(folder.name)
        )

      if (!dealsFolder) return null

      const dealFolder =
        data.folders.find(
          (folder) =>
            folder.vehicle_id === vehicleId &&
            folder.parent_folder_id === dealsFolder.id &&
            folder.name === dealName
        ) ||
        data.folders.find(
          (folder) =>
            folder.vehicle_id === vehicleId &&
            folder.name === dealName &&
            folder.path.includes('/Deals/')
        )

      return dealFolder || null
    },
    [data.folders, getVehicleRootFolderId]
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

  const deals = useMemo(() => {
    if (!tree.debouncedTreeSearch) return data.allDeals
    const query = tree.debouncedTreeSearch.toLowerCase()
    return data.allDeals.filter((deal) => {
      return (
        deal.name.toLowerCase().includes(query) ||
        (deal.vehicle_name || '').toLowerCase().includes(query)
      )
    })
  }, [data.allDeals, tree.debouncedTreeSearch])

  const handleDealToggle = useCallback(
    (dealId: string) => {
      dispatch({ type: 'TOGGLE_DEAL_DATA_ROOM_EXPANDED', dealId })
    },
    [dispatch]
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

  const handleInvestorsNodeToggle = useCallback(
    (dealId: string) => {
      dispatch({ type: 'TOGGLE_DEAL_INVESTORS_EXPANDED', dealId })
      if (!tree.expandedDealInvestors.has(dealId)) {
        fetchInvestorsForDeal(dealId)
      }
    },
    [dispatch, tree.expandedDealInvestors, fetchInvestorsForDeal]
  )

  const handleIntroducersNodeToggle = useCallback(
    (dealId: string) => {
      dispatch({ type: 'TOGGLE_DEAL_INTRODUCERS_EXPANDED', dealId })
      if (!tree.expandedDealIntroducers.has(dealId)) {
        fetchInvestorsForDeal(dealId)
      }
    },
    [dispatch, tree.expandedDealIntroducers, fetchInvestorsForDeal]
  )

  const handleInvestorClick = useCallback(
    (
      investorId: string,
      investorName: string,
      investorType: ParticipantEntityType,
      dealId: string,
      vehicleId: string | null
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

  const renderFolder = useCallback(
    (folder: DocumentFolder, depth: number, vehicleId: string): React.ReactNode => {
      const childFolders = getChildFolders(folder.id, vehicleId)
      const hasChildren = childFolders.length > 0
      const isExpanded = isFolderExpanded(folder.id)
      const isSelected = navigation.currentFolderId === folder.id
      const matchesFilter = filterMatches(folder.name)

      if (!matchesFilter && !tree.debouncedTreeSearch) {
        // Show all when not searching
      } else if (!matchesFilter) {
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

  if (data.loadingAllDeals && deals.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className={cn('py-4 px-3 text-sm text-muted-foreground italic', className)}>
        No deals found
      </div>
    )
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      {deals.map((deal) => {
        const dealExpanded = tree.expandedDealDataRooms.has(deal.id)
        const investorsExpanded = tree.expandedDealInvestors.has(deal.id)
        const introducersExpanded = tree.expandedDealIntroducers.has(deal.id)
        const participants = data.dealInvestors.get(deal.id) || []
        const investors = participants.filter((p) => p.entity_type === 'investor')
        const introducers = participants.filter((p) => p.entity_type === 'introducer')
        const isLoadingDealInvestors = data.loadingInvestors.has(deal.id)
        const dealDocumentsFolder = getDealDocumentsFolder(deal.name, deal.vehicle_id || null)
        const dealLabel = deal.vehicle_name
          ? `${deal.name} · ${deal.vehicle_name}`
          : deal.name

        return (
          <TreeNode
            key={deal.id}
            type="deal"
            id={deal.id}
            name={dealLabel}
            depth={0}
            isExpanded={dealExpanded}
            isSelected={
              navigation.dataRoomDealId === deal.id &&
              !navigation.selectedInvestorId
            }
            onToggle={() => handleDealToggle(deal.id)}
            onClick={() => navigateToDataRoom(deal.id, deal.name, deal.vehicle_id || null)}
          >
            {dealExpanded && (
              <>
                <TreeNode
                  key={`dataroom-${deal.id}`}
                  type="data-room"
                  id={`dataroom-${deal.id}`}
                  name="Data Room"
                  depth={1}
                  isSelected={
                    navigation.isDataRoomMode &&
                    navigation.dataRoomDealId === deal.id
                  }
                  onClick={() => navigateToDataRoom(deal.id, deal.name, deal.vehicle_id || null)}
                />

                {dealDocumentsFolder &&
                  renderFolder(
                    { ...dealDocumentsFolder, name: 'Documents' },
                    1,
                    deal.vehicle_id || ''
                  )}

                <TreeNode
                  key={`investors-${deal.id}`}
                  type="investors-group"
                  id={`investors-${deal.id}`}
                  name="INVESTORS"
                  depth={1}
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
                          No investors
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
                            docTypes.length > 0
                              ? docTypes
                              : getDefaultParticipantDocTypes(investor.entity_type)

                          return (
                            <TreeNode
                              key={`${investor.entity_type}-${investor.id}`}
                              type="investor"
                              id={`${investor.entity_type}-${investor.id}`}
                              name={investor.display_name}
                              depth={2}
                              isSelected={investorSelected}
                              isExpanded={investorSelected}
                              onClick={() =>
                                handleInvestorClick(
                                  investor.id,
                                  investor.display_name,
                                  investor.entity_type,
                                  deal.id,
                                  deal.vehicle_id || null
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
                                    depth={3}
                                    isSelected={!navigation.selectedInvestorDocType}
                                    onClick={() => handleInvestorDocTypeClick(null)}
                                  />
                                  {docTypesToShow.map((docType) => (
                                    <TreeNode
                                      key={`${investor.entity_type}-${investor.id}-${docType}`}
                                      type="doc-type"
                                      id={`${investor.entity_type}-${investor.id}-${docType}`}
                                      name={docType}
                                      depth={3}
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

                <TreeNode
                  key={`introducers-${deal.id}`}
                  type="investors-group"
                  id={`introducers-${deal.id}`}
                  name="INTRODUCERS"
                  depth={1}
                  isExpanded={introducersExpanded}
                  onToggle={() => handleIntroducersNodeToggle(deal.id)}
                >
                  {introducersExpanded && (
                    <div className="ml-0">
                      {isLoadingDealInvestors ? (
                        <div className="flex items-center gap-2 py-1.5 px-3 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading...
                        </div>
                      ) : introducers.length === 0 ? (
                        <div className="py-1.5 px-3 text-sm text-muted-foreground italic">
                          No introducers
                        </div>
                      ) : (
                        introducers.map((introducer) => {
                          const introducerSelected =
                            navigation.selectedInvestorId === introducer.id &&
                            navigation.selectedInvestorType === introducer.entity_type
                          const docTypeKey = `${introducer.entity_type}:${introducer.id}:${deal.id}`
                          const docTypes =
                            data.participantDocumentTypes.get(docTypeKey) || []
                          const docTypesToShow =
                            docTypes.length > 0
                              ? docTypes
                              : getDefaultParticipantDocTypes(introducer.entity_type)

                          return (
                            <TreeNode
                              key={`${introducer.entity_type}-${introducer.id}`}
                              type="investor"
                              id={`${introducer.entity_type}-${introducer.id}`}
                              name={introducer.display_name}
                              depth={2}
                              isSelected={introducerSelected}
                              isExpanded={introducerSelected}
                              onClick={() =>
                                handleInvestorClick(
                                  introducer.id,
                                  introducer.display_name,
                                  introducer.entity_type,
                                  deal.id,
                                  deal.vehicle_id || null
                                )
                              }
                            >
                              {introducerSelected && (
                                <div className="ml-0">
                                  <TreeNode
                                    key={`all-${introducer.entity_type}-${introducer.id}`}
                                    type="doc-type"
                                    id={`all-${introducer.entity_type}-${introducer.id}`}
                                    name="All Documents"
                                    depth={3}
                                    isSelected={!navigation.selectedInvestorDocType}
                                    onClick={() => handleInvestorDocTypeClick(null)}
                                  />
                                  {docTypesToShow.map((docType) => (
                                    <TreeNode
                                      key={`${introducer.entity_type}-${introducer.id}-${docType}`}
                                      type="doc-type"
                                      id={`${introducer.entity_type}-${introducer.id}-${docType}`}
                                      name={docType}
                                      depth={3}
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
      })}
    </div>
  )
}
