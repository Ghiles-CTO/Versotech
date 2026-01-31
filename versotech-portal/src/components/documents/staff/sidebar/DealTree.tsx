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
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface DealTreeProps {
  className?: string
}

export function DealTree({ className }: DealTreeProps) {
  const {
    state,
    dispatch,
    fetchAllDeals,
    fetchInvestorsForDeal,
    navigateToDataRoom,
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

  const handleInvestorsNodeToggle = useCallback(
    (dealId: string) => {
      dispatch({ type: 'TOGGLE_DEAL_INVESTORS_EXPANDED', dealId })
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
        const investors = data.dealInvestors.get(deal.id) || []
        const isLoadingDealInvestors = data.loadingInvestors.has(deal.id)
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

                <TreeNode
                  key={`investors-${deal.id}`}
                  type="investors-group"
                  id={`investors-${deal.id}`}
                  name="Participants"
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
              </>
            )}
          </TreeNode>
        )
      })}
    </div>
  )
}
