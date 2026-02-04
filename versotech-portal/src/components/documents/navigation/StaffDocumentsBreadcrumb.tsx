'use client'

/**
 * StaffDocumentsBreadcrumb - Unified Navigation Breadcrumb
 *
 * A comprehensive breadcrumb component for the staff documents module.
 * Features:
 * - Full folder hierarchy traversal via parent_folder_id
 * - Vehicle context always visible when inside vehicle folders
 * - Data room mode support
 * - Virtual parent (SCSP/LLC) support
 * - Responsive collapse with dropdown for deep hierarchies
 *
 * Uses shadcn/ui Breadcrumb components for consistent styling.
 */

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useStaffDocuments } from '../staff/context/StaffDocumentsContext'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Home, Building2, Database, Folder, User, Users } from 'lucide-react'
import { DocumentFolder } from '@/types/documents'
import { getVirtualParentDisplayName } from '@/lib/documents/vehicle-hierarchy'

interface BreadcrumbSegment {
  id: string
  type: 'home' | 'vehicle' | 'virtual-parent' | 'folder' | 'data-room' | 'investor' | 'doc-type'
  name: string
  icon?: React.ReactNode
  onClick?: () => void
}

interface StaffDocumentsBreadcrumbProps {
  className?: string
  /** Maximum number of visible breadcrumbs before collapsing (default: 4) */
  maxVisible?: number
}

export function StaffDocumentsBreadcrumb({
  className,
  maxVisible = 4,
}: StaffDocumentsBreadcrumbProps) {
  const {
    state,
    dispatch,
    navigateToFolder,
    navigateToVehicle,
    getVehicleById,
  } = useStaffDocuments()

  const { navigation, data } = state

  /**
   * Build the complete folder path by traversing parent_folder_id
   */
  const buildFolderPath = useMemo((): DocumentFolder[] => {
    if (!navigation.currentFolderId) return []

    const path: DocumentFolder[] = []
    let currentId: string | null = navigation.currentFolderId

    // Build path from current folder to root (max 20 levels for safety)
    let iterations = 0
    while (currentId && iterations < 20) {
      const folder = data.folders.find(f => f.id === currentId)
      if (!folder) break

      path.unshift(folder) // Add to beginning
      currentId = folder.parent_folder_id
      iterations++
    }

    return path.filter((folder) => folder.folder_type !== 'vehicle_root')
  }, [navigation.currentFolderId, data.folders])

  /**
   * Convert virtual parent ID to display name
   */
  const getVirtualParentName = (virtualId: string): string => {
    return getVirtualParentDisplayName(virtualId)
  }

  /**
   * Build the complete breadcrumb segments
   */
  const segments = useMemo((): BreadcrumbSegment[] => {
    const result: BreadcrumbSegment[] = []

    // 1. Home (always first)
    result.push({
      id: 'home',
      type: 'home',
      name: 'Documents',
      icon: <Home className="h-4 w-4" />,
      onClick: () => dispatch({ type: 'NAVIGATE_TO_ROOT' }),
    })

    // 2. Virtual Parent (if in a virtual parent context)
    if (navigation.selectedVirtualParentId && !navigation.selectedVehicleId) {
      result.push({
        id: navigation.selectedVirtualParentId,
        type: 'virtual-parent',
        name: getVirtualParentName(navigation.selectedVirtualParentId),
        icon: <Building2 className="h-4 w-4 text-blue-500" />,
        onClick: () => navigateToVehicle(
          navigation.selectedVirtualParentId!,
          getVirtualParentName(navigation.selectedVirtualParentId!),
          true
        ),
      })
    }

    // 3. Vehicle (if in vehicle context)
    if (navigation.selectedVehicleId) {
      const vehicle = getVehicleById(navigation.selectedVehicleId)
      if (vehicle) {
        result.push({
          id: vehicle.id,
          type: 'vehicle',
          name: vehicle.name,
          icon: <Building2 className="h-4 w-4 text-blue-500" />,
          onClick: () => {
            // Clear folder but keep vehicle
            navigateToFolder(null)
          },
        })
      }
    }

    // 4. Deal (if in deal context and not data room)
    if (navigation.selectedDealId && !navigation.isDataRoomMode) {
      const deal = Array.from(data.vehicleDeals.values())
        .flat()
        .find(d => d.id === navigation.selectedDealId) ||
        data.allDeals.find(d => d.id === navigation.selectedDealId)
      if (deal) {
        result.push({
          id: `deal-${deal.id}`,
          type: 'folder',
          name: deal.name,
          icon: <Folder className="h-4 w-4 text-muted-foreground" />,
        })
      }
    }

    // 5. Data Room (if in data room mode)
    if (navigation.isDataRoomMode && navigation.dataRoomDealName) {
      result.push({
        id: `data-room-${navigation.dataRoomDealId}`,
        type: 'data-room',
        name: `Data Room: ${navigation.dataRoomDealName}`,
        icon: <Database className="h-4 w-4 text-cyan-500" />,
        // Data room is always the current location, no click
      })
    }

    // 6. Investor/Participant
    if (navigation.selectedInvestorId) {
      const participants = navigation.selectedDealId
        ? data.dealInvestors.get(navigation.selectedDealId) || []
        : Array.from(data.accountsByType.values()).flat()
      const participant = participants.find(
        p =>
          p.id === navigation.selectedInvestorId &&
          p.entity_type === navigation.selectedInvestorType
      )
      const label =
        navigation.selectedInvestorType === 'partner'
          ? 'Partner'
          : navigation.selectedInvestorType === 'introducer'
          ? 'Introducer'
          : navigation.selectedInvestorType === 'commercial_partner'
          ? 'Commercial Partner'
          : 'Investor'

      if (!navigation.selectedDealId) {
        result.push({
          id: 'accounts-root',
          type: 'folder',
          name: 'Accounts',
          icon: <Users className="h-4 w-4 text-sky-500" />,
        })
      }

      result.push({
        id: `participant-${navigation.selectedInvestorId}`,
        type: 'investor',
        name: participant?.display_name || label,
        icon: <User className="h-4 w-4 text-orange-400" />,
        onClick: navigation.selectedInvestorDocType
          ? () => dispatch({ type: 'SET_INVESTOR_DOC_TYPE', docType: null })
          : undefined,
      })

      if (navigation.selectedInvestorDocType) {
        result.push({
          id: `participant-doc-${navigation.selectedInvestorDocType}`,
          type: 'doc-type',
          name: navigation.selectedInvestorDocType,
          icon: <Folder className="h-4 w-4 text-amber-500" />,
        })
      }
    }

    // 7. Folder hierarchy
    if (!navigation.isDataRoomMode && buildFolderPath.length > 0) {
      buildFolderPath.forEach((folder, index) => {
        const isLast = index === buildFolderPath.length - 1
        result.push({
          id: folder.id,
          type: 'folder',
          name: folder.name,
          icon: <Folder className="h-4 w-4 text-primary" />,
          onClick: isLast ? undefined : () => navigateToFolder(folder.id, folder.name),
        })
      })
    }

    return result
  }, [
    navigation,
    buildFolderPath,
    dispatch,
    navigateToFolder,
    navigateToVehicle,
    getVehicleById,
    data.vehicleDeals,
    data.dealInvestors,
    data.allDeals,
    data.accountsByType,
  ])

  // Determine which segments to show and which to collapse
  const { visible, collapsed } = useMemo(() => {
    if (segments.length <= maxVisible) {
      return { visible: segments, collapsed: [] }
    }

    // Keep first (home) and last few segments, collapse the middle
    const firstSegment = segments[0]
    const lastSegments = segments.slice(-(maxVisible - 2))
    const middleSegments = segments.slice(1, segments.length - (maxVisible - 2))

    return {
      visible: [firstSegment, ...lastSegments],
      collapsed: middleSegments,
    }
  }, [segments, maxVisible])

  // If only home, don't show breadcrumbs
  if (segments.length <= 1) {
    return null
  }

  return (
    <div className={cn('px-4 md:px-6 py-3 bg-muted/50', className)}>
      <Breadcrumb>
        <BreadcrumbList>
          {visible.map((segment, index) => {
            const isLast = index === visible.length - 1 && collapsed.length === 0
            const isAfterEllipsis = collapsed.length > 0 && index === 1

            return (
              <React.Fragment key={segment.id}>
                {/* Show ellipsis dropdown after first item if there are collapsed segments */}
                {isAfterEllipsis && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="flex items-center gap-1 hover:bg-accent rounded-md p-1 transition-colors"
                          aria-label="Show hidden navigation items"
                        >
                          <BreadcrumbEllipsis className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {collapsed.map((collapsedSegment) => (
                            <DropdownMenuItem
                              key={collapsedSegment.id}
                              onClick={collapsedSegment.onClick}
                              className="gap-2"
                            >
                              {collapsedSegment.icon}
                              <span>{collapsedSegment.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                  </>
                )}

                {/* Separator (except before first item) */}
                {index > 0 && !isAfterEllipsis && <BreadcrumbSeparator />}

                {/* Breadcrumb item */}
                <BreadcrumbItem>
                  {segment.onClick && !isLast ? (
                    <BreadcrumbLink
                      asChild
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <button
                        onClick={segment.onClick}
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                      >
                        {segment.icon}
                        <span className="truncate max-w-[150px]">{segment.name}</span>
                      </button>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
                      {segment.icon}
                      <span className="truncate max-w-[200px]">{segment.name}</span>
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
