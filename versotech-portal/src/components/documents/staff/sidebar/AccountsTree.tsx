'use client'

/**
 * Accounts Tree
 *
 * Renders a participant-first navigation tree (investors, partners, introducers, commercial partners).
 */

import React, { useMemo, useCallback, useEffect } from 'react'
import { useStaffDocuments } from '../context/StaffDocumentsContext'
import { ParticipantEntityType } from '../context/types'
import { TreeNode } from './TreeNode'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface AccountsTreeProps {
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

const accountGroups: { type: ParticipantEntityType; label: string }[] = [
  { type: 'investor', label: 'Investors' },
  { type: 'partner', label: 'Partners' },
  { type: 'introducer', label: 'Introducers' },
  { type: 'commercial_partner', label: 'Commercial Partners' },
]

export function AccountsTree({ className }: AccountsTreeProps) {
  const {
    state,
    dispatch,
    fetchAccountsByType,
    navigateToInvestor,
  } = useStaffDocuments()

  const { data, tree, navigation } = state

  useEffect(() => {
    if (!tree.debouncedTreeSearch) return
    accountGroups.forEach((group) => {
      fetchAccountsByType(group.type, tree.debouncedTreeSearch)
    })
  }, [tree.debouncedTreeSearch, fetchAccountsByType])

  useEffect(() => {
    if (tree.debouncedTreeSearch) return
    accountGroups.forEach((group) => {
      if (tree.expandedAccountGroups.has(group.type)) {
        fetchAccountsByType(group.type)
      }
    })
  }, [tree.debouncedTreeSearch, tree.expandedAccountGroups, fetchAccountsByType])

  const filterMatches = useCallback(
    (name: string): boolean => {
      if (!tree.debouncedTreeSearch) return true
      return name.toLowerCase().includes(tree.debouncedTreeSearch.toLowerCase())
    },
    [tree.debouncedTreeSearch]
  )

  const handleGroupToggle = useCallback(
    (entityType: ParticipantEntityType) => {
      dispatch({ type: 'TOGGLE_ACCOUNT_GROUP_EXPANDED', entityType })
      if (!data.accountsByType.has(entityType)) {
        const query = tree.debouncedTreeSearch || undefined
        fetchAccountsByType(entityType, query)
      }
    },
    [dispatch, data.accountsByType, fetchAccountsByType, tree.debouncedTreeSearch]
  )

  const handleAccountToggle = useCallback(
    (key: string) => {
      dispatch({ type: 'TOGGLE_ACCOUNT_EXPANDED', key })
    },
    [dispatch]
  )

  const handleAccountClick = useCallback(
    (accountId: string, accountName: string, accountType: ParticipantEntityType) => {
      navigateToInvestor(accountId, accountName, accountType, null, null)
    },
    [navigateToInvestor]
  )

  const handleDocTypeClick = useCallback(
    (docType: string | null) => {
      dispatch({ type: 'SET_INVESTOR_DOC_TYPE', docType })
    },
    [dispatch]
  )

  const groupNodes = useMemo(() => {
    return accountGroups.map((group) => {
      const accounts = data.accountsByType.get(group.type) || []
      const isLoading = data.loadingAccounts.has(group.type)
      const groupExpanded = tree.debouncedTreeSearch
        ? true
        : tree.expandedAccountGroups.has(group.type)

      const filteredAccounts = tree.debouncedTreeSearch
        ? accounts.filter((a) => filterMatches(a.display_name))
        : accounts

      const showGroup =
        tree.debouncedTreeSearch.length === 0 ||
        filterMatches(group.label) ||
        filteredAccounts.length > 0

      return {
        ...group,
        accounts: filteredAccounts,
        isLoading,
        isExpanded: groupExpanded,
        show: showGroup,
      }
    })
  }, [
    data.accountsByType,
    data.loadingAccounts,
    tree.debouncedTreeSearch,
    tree.expandedAccountGroups,
    filterMatches,
  ])

  return (
    <div className={cn('space-y-0.5', className)}>
      {groupNodes.map((group) => {
        if (!group.show) return null

        return (
          <TreeNode
            key={group.type}
            type="account-group"
            id={`account-group-${group.type}`}
            name={group.label}
            depth={0}
            isExpanded={group.isExpanded}
            onToggle={() => handleGroupToggle(group.type)}
          >
            {group.isExpanded && (
              <div className="ml-0">
                {group.isLoading ? (
                  <div className="flex items-center gap-2 py-1.5 px-3 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </div>
                ) : group.accounts.length === 0 ? (
                  <div className="py-1.5 px-3 text-sm text-muted-foreground italic">
                    No accounts
                  </div>
                ) : (
                  group.accounts.map((account) => {
                    const accountKey = `${account.entity_type}:${account.id}`
                    const accountSelected =
                      navigation.selectedInvestorId === account.id &&
                      navigation.selectedInvestorType === account.entity_type
                    const accountExpanded =
                      tree.expandedAccounts.has(accountKey) || accountSelected
                    const docTypeKey = `${account.entity_type}:${account.id}:all`
                    const docTypes =
                      data.participantDocumentTypes.get(docTypeKey) || []
                    const docTypesToShow =
                      docTypes.length > 0
                        ? docTypes
                        : getDefaultParticipantDocTypes(account.entity_type)

                    return (
                      <TreeNode
                        key={accountKey}
                        type="account"
                        id={accountKey}
                        name={account.display_name}
                        depth={1}
                        isSelected={accountSelected}
                        isExpanded={accountExpanded}
                        onToggle={() => handleAccountToggle(accountKey)}
                        onClick={() =>
                          handleAccountClick(
                            account.id,
                            account.display_name,
                            account.entity_type
                          )
                        }
                      >
                        {accountExpanded && (
                          <div className="ml-0">
                            <TreeNode
                              key={`all-${accountKey}`}
                              type="doc-type"
                              id={`all-${accountKey}`}
                              name="All Documents"
                              depth={2}
                              isSelected={!navigation.selectedInvestorDocType}
                              onClick={() => handleDocTypeClick(null)}
                            />
                            {docTypesToShow.map((docType) => (
                              <TreeNode
                                key={`${accountKey}-${docType}`}
                                type="doc-type"
                                id={`${accountKey}-${docType}`}
                                name={docType}
                                depth={2}
                                isSelected={navigation.selectedInvestorDocType === docType}
                                onClick={() => handleDocTypeClick(docType)}
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
        )
      })}
    </div>
  )
}
