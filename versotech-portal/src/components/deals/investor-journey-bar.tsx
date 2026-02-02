'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface JourneyStage {
  stage_number: number
  stage_name: string
  completed_at: string | null
  is_current: boolean
}

export interface JourneySummary {
  received: string | null
  viewed: string | null
  interest_confirmed: string | null
  nda_signed: string | null
  data_room_access: string | null
  pack_generated: string | null
  pack_sent: string | null
  signed: string | null
  funded: string | null
  active: string | null
}

interface InvestorJourneyBarProps {
  stages?: JourneyStage[]
  summary?: JourneySummary
  currentStage?: number
  subscriptionSubmittedAt?: string | null
  className?: string
  compact?: boolean
}

type JourneyRoute = 'data_room' | 'direct_subscribe' | 'choose'

type SummaryKey = keyof JourneySummary | 'subscription_requested'

type StageStatus = 'completed' | 'current' | 'pending'

interface StageDefinition {
  name: string
  key: SummaryKey
  index: number
}

const COMMON_STAGES: StageDefinition[] = [
  { name: 'Received', key: 'received', index: 1 },
  { name: 'Viewed', key: 'viewed', index: 2 }
]

const NDA_BRANCH_STAGES: StageDefinition[] = [
  { name: 'Data Room Access Requested', key: 'interest_confirmed', index: 3 },
  { name: 'NDA Signed', key: 'nda_signed', index: 4 },
  { name: 'Data Room Access Granted', key: 'data_room_access', index: 5 }
]

const MERGE_STAGE: StageDefinition = {
  name: 'Confirm Interest',
  key: 'subscription_requested',
  index: 3
}

const POST_MERGE_STAGES: StageDefinition[] = [
  { name: 'Subscription Pack', key: 'pack_generated', index: 6 },
  { name: 'Pack Sent', key: 'pack_sent', index: 7 },
  { name: 'Signed', key: 'signed', index: 8 },
  { name: 'Funded', key: 'funded', index: 9 },
  { name: 'Active', key: 'active', index: 10 }
]

const DATA_ROOM_STAGE_ORDER: StageDefinition[] = [
  ...COMMON_STAGES,
  ...NDA_BRANCH_STAGES,
  ...POST_MERGE_STAGES
]

const DATA_ROOM_ROUTE_STAGES: StageDefinition[] = [
  ...COMMON_STAGES,
  ...NDA_BRANCH_STAGES,
  MERGE_STAGE,
  ...POST_MERGE_STAGES
]

const DIRECT_ROUTE_STAGES: StageDefinition[] = [
  ...COMMON_STAGES,
  MERGE_STAGE,
  ...POST_MERGE_STAGES
]

const CHOOSE_ROUTE_STAGES: StageDefinition[] = [
  ...COMMON_STAGES,
  MERGE_STAGE,
  ...POST_MERGE_STAGES
]

interface ExtendedSummary extends JourneySummary {
  subscription_requested: string | null
}

function detectRoute(summary: JourneySummary, subscriptionSubmittedAt?: string | null): JourneyRoute {
  if (summary.interest_confirmed || summary.nda_signed || summary.data_room_access) {
    return 'data_room'
  }

  if (subscriptionSubmittedAt || summary.pack_generated || summary.pack_sent || summary.signed || summary.funded || summary.active) {
    return 'direct_subscribe'
  }

  return 'choose'
}

function getRouteLabel(route: JourneyRoute): string {
  if (route === 'data_room') return 'NDA → Data Room → Subscription Pack'
  if (route === 'direct_subscribe') return 'Direct Subscription'
  return 'Choose Your Path'
}

function getStageStatus(
  stageDef: StageDefinition,
  summary: ExtendedSummary,
  currentIndex: number,
  index: number
): StageStatus {
  const completedAt = summary[stageDef.key] as string | null
  if (completedAt) return 'completed'
  if (index === currentIndex) return 'current'
  return 'pending'
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function InvestorJourneyBar({
  stages,
  summary,
  currentStage = 0,
  subscriptionSubmittedAt,
  className,
  compact = false
}: InvestorJourneyBarProps) {
  // Build summary from stages if provided
  const effectiveSummary: JourneySummary = summary || (stages ? {
    received: stages.find(s => s.stage_number === 1)?.completed_at || null,
    viewed: stages.find(s => s.stage_number === 2)?.completed_at || null,
    interest_confirmed: stages.find(s => s.stage_number === 3)?.completed_at || null,
    nda_signed: stages.find(s => s.stage_number === 4)?.completed_at || null,
    data_room_access: stages.find(s => s.stage_number === 5)?.completed_at || null,
    pack_generated: stages.find(s => s.stage_number === 6)?.completed_at || null,
    pack_sent: stages.find(s => s.stage_number === 7)?.completed_at || null,
    signed: stages.find(s => s.stage_number === 8)?.completed_at || null,
    funded: stages.find(s => s.stage_number === 9)?.completed_at || null,
    active: stages.find(s => s.stage_number === 10)?.completed_at || null,
  } : {
    received: null,
    viewed: null,
    interest_confirmed: null,
    nda_signed: null,
    data_room_access: null,
    pack_generated: null,
    pack_sent: null,
    signed: null,
    funded: null,
    active: null,
  })

  const derivedDirectRequest =
    subscriptionSubmittedAt ||
    effectiveSummary.pack_generated ||
    effectiveSummary.pack_sent ||
    effectiveSummary.signed ||
    effectiveSummary.funded ||
    effectiveSummary.active ||
    null

  const extendedSummary: ExtendedSummary = {
    ...effectiveSummary,
    subscription_requested: derivedDirectRequest
  }

  const route = detectRoute(effectiveSummary, subscriptionSubmittedAt)
  const stagesForRoute =
    route === 'direct_subscribe'
      ? DIRECT_ROUTE_STAGES
      : route === 'choose'
        ? CHOOSE_ROUTE_STAGES
        : DATA_ROOM_ROUTE_STAGES
  const showRouteLabels = !compact

  const getCurrentIndex = (stageList: StageDefinition[]) => {
    let lastCompleted = -1
    stageList.forEach((stage, idx) => {
      if (extendedSummary[stage.key]) {
        lastCompleted = idx
      }
    })
    if (lastCompleted === -1) return 0
    if (lastCompleted >= stageList.length - 1) return stageList.length - 1
    return lastCompleted + 1
  }

  const buildStatusMap = (stageList: StageDefinition[]) => {
    const currentIndex = getCurrentIndex(stageList)
    const statusMap: Record<SummaryKey, StageStatus> = {
      received: 'pending',
      viewed: 'pending',
      interest_confirmed: 'pending',
      nda_signed: 'pending',
      data_room_access: 'pending',
      pack_generated: 'pending',
      pack_sent: 'pending',
      signed: 'pending',
      funded: 'pending',
      active: 'pending',
      subscription_requested: 'pending'
    }

    stageList.forEach((stageDef, index) => {
      statusMap[stageDef.key] = getStageStatus(stageDef, extendedSummary, currentIndex, index)
    })

    return statusMap
  }

  const dataRoomStatuses = buildStatusMap(DATA_ROOM_ROUTE_STAGES)
  const directStatuses = buildStatusMap(DIRECT_ROUTE_STAGES)
  const chooseStatuses = buildStatusMap(CHOOSE_ROUTE_STAGES)
  const sharedStatuses = route === 'data_room'
    ? dataRoomStatuses
    : route === 'direct_subscribe'
      ? directStatuses
      : chooseStatuses
  const showNdaBranch = route !== 'direct_subscribe'
  const showDirectBranch = route !== 'data_room'
  const muteDirect = route === 'data_room'
  const muteNda = route === 'direct_subscribe'

  const containerRef = useRef<HTMLDivElement>(null)
  const forkRef = useRef<HTMLDivElement>(null)
  const mergeBubbleRef = useRef<HTMLDivElement>(null)
  const ndaRowRef = useRef<HTMLDivElement>(null)
  const directRowRef = useRef<HTMLDivElement>(null)
  const [connectorPositions, setConnectorPositions] = useState<{
    forkX: number
    forkY: number
    mergeX: number
    mergeY: number
    ndaY?: number
    directY?: number
  } | null>(null)

  useLayoutEffect(() => {
    const update = () => {
      const container = containerRef.current
      const fork = forkRef.current
      const merge = mergeBubbleRef.current
      if (!container || !fork || !merge) {
        setConnectorPositions(null)
        return
      }

      const containerRect = container.getBoundingClientRect()
      const center = (rect: DOMRect) => ({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2
      })

      const forkRect = fork.getBoundingClientRect()
      const mergeRect = merge.getBoundingClientRect()

      const ndaRect = ndaRowRef.current?.getBoundingClientRect()
      const directRect = directRowRef.current?.getBoundingClientRect()

      setConnectorPositions({
        forkX: center(forkRect).x,
        forkY: center(forkRect).y,
        mergeX: center(mergeRect).x,
        mergeY: center(mergeRect).y,
        // Connect to the bottom edge of the NDA row and the top edge of the Direct row
        ndaY: ndaRect ? (ndaRect.bottom - containerRect.top) : undefined,
        directY: directRect ? (directRect.top - containerRect.top) : undefined
      })
    }

    update()
    const observer = new ResizeObserver(update)
    const elements = [containerRef.current, forkRef.current, mergeBubbleRef.current, ndaRowRef.current, directRowRef.current]
    elements.forEach(el => {
      if (el) observer.observe(el)
    })
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [route, showNdaBranch, showDirectBranch])

  // Pure CSS node renderer for flexbox layout
  const renderFlexNode = (
    stageDef: StageDefinition,
    status: StageStatus,
    muted = false,
    showIndex = true,
    bubbleRef?: React.Ref<HTMLDivElement>
  ) => {
    const completedAt = extendedSummary[stageDef.key]
    return (
      <Tooltip key={`flex-node-${stageDef.key}`}>
        <TooltipTrigger asChild>
          <div className={cn('flex flex-col items-center', muted && 'opacity-40')}>
            <div
              ref={bubbleRef}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0',
                status === 'completed' && 'bg-emerald-500 text-white',
                status === 'current' && 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900',
                status === 'pending' && 'bg-muted/50 text-muted-foreground'
              )}
            >
              {status === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                showIndex ? <span className="text-xs font-medium">{stageDef.index}</span> : null
              )}
            </div>
            {showRouteLabels && (
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-[96px] leading-tight whitespace-normal break-words',
                  status === 'completed' && 'text-emerald-600 dark:text-emerald-400',
                  status === 'current' && 'text-blue-600 dark:text-blue-400',
                  status === 'pending' && 'text-muted-foreground'
                )}
              >
                {stageDef.name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="text-sm">
            <div className="font-medium">{stageDef.name}</div>
            {status === 'completed' && completedAt && (
              <div className="text-xs text-muted-foreground mt-1">
                Completed: {formatDate(completedAt)}
              </div>
            )}
            {status === 'current' && (
              <div className="text-xs text-blue-600 mt-1">In Progress</div>
            )}
            {status === 'pending' && (
              <div className="text-xs text-muted-foreground mt-1">Pending</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Horizontal connecting line component (fixed width)
  const HLine = ({ muted = false }: { muted?: boolean }) => (
    <div className={cn('h-0.5 w-6 bg-border shrink-0', muted && 'opacity-40')} />
  )

  // Flexible spacer line between fork and merge
  const FlexLine = ({ muted = false }: { muted?: boolean }) => (
    <div className={cn('h-0.5 bg-border flex-1 min-w-[16px]', muted && 'opacity-40')} />
  )

  const renderSplitBar = (label: string) => {
    const receivedStage = COMMON_STAGES[0]
    const viewedStage = COMMON_STAGES[1]

    const accessStage = NDA_BRANCH_STAGES[0]
    const ndaSignedStage = NDA_BRANCH_STAGES[1]
    const dataRoomStage = NDA_BRANCH_STAGES[2]

    const mergeStage = MERGE_STAGE

    const packGenStage = POST_MERGE_STAGES[0]
    const packSentStage = POST_MERGE_STAGES[1]
    const signedStage = POST_MERGE_STAGES[2]
    const fundedStage = POST_MERGE_STAGES[3]
    const activeStage = POST_MERGE_STAGES[4]

    const nodeCol = 'minmax(96px, 1fr)'
    const lineCol = '16px'
    const dotCol = '16px'
    const branchCol = 'minmax(220px, 2fr)'
    const gridTemplateColumns = [
      nodeCol,
      lineCol,
      nodeCol,
      lineCol,
      dotCol,
      branchCol,
      nodeCol,
      lineCol,
      nodeCol,
      lineCol,
      nodeCol,
      lineCol,
      nodeCol,
      lineCol,
      nodeCol,
      lineCol,
      nodeCol
    ].join(' ')

    return (
      <div className="space-y-3">
        {showRouteLabels && route === 'choose' && (
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        )}

        {/* Branching layout */}
        <div className="relative overflow-x-auto">
          <div ref={containerRef} className="relative min-w-[1100px] space-y-2">
            {connectorPositions && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {(() => {
                  const forkRadius = 5
                  const mergeRadius = 16
                  const forkUpY = connectorPositions.forkY - forkRadius
                  const forkDownY = connectorPositions.forkY + forkRadius
                  const mergeUpY = connectorPositions.mergeY - mergeRadius
                  const mergeDownY = connectorPositions.mergeY + mergeRadius

                  return (
                    <>
                      {showNdaBranch && connectorPositions.ndaY !== undefined && (
                        <>
                          <line
                            x1={connectorPositions.forkX}
                            y1={forkUpY}
                            x2={connectorPositions.forkX}
                            y2={connectorPositions.ndaY}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={cn('text-border', muteNda && 'opacity-40')}
                          />
                          <line
                            x1={connectorPositions.mergeX}
                            y1={mergeUpY}
                            x2={connectorPositions.mergeX}
                            y2={connectorPositions.ndaY}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={cn('text-border', muteNda && 'opacity-40')}
                          />
                        </>
                      )}
                      {showDirectBranch && connectorPositions.directY !== undefined && (
                        <>
                          <line
                            x1={connectorPositions.forkX}
                            y1={forkDownY}
                            x2={connectorPositions.forkX}
                            y2={connectorPositions.directY}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={cn('text-border', muteDirect && 'opacity-40')}
                          />
                          <line
                            x1={connectorPositions.mergeX}
                            y1={mergeDownY}
                            x2={connectorPositions.mergeX}
                            y2={connectorPositions.directY}
                            stroke="currentColor"
                            strokeWidth="2"
                            className={cn('text-border', muteDirect && 'opacity-40')}
                          />
                        </>
                      )}
                    </>
                  )
                })()}
              </svg>
            )}
            {/* NDA Path (top row) */}
            {showNdaBranch && (
              <div
                className={cn('grid items-center', muteNda && 'opacity-40')}
                style={{ gridTemplateColumns }}
              >
                <div className="relative flex items-center justify-center" style={{ gridColumn: '5 / 8' }}>
                  <div ref={ndaRowRef} className="relative z-10 flex items-center bg-violet-50 dark:bg-violet-950/30 rounded-lg px-3 py-2 border border-violet-200 dark:border-violet-800">
                    <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 mr-3 uppercase tracking-wide shrink-0">NDA</span>
                    {renderFlexNode(accessStage, dataRoomStatuses.interest_confirmed, muteNda, false)}
                    <HLine muted={muteNda} />
                    {renderFlexNode(ndaSignedStage, dataRoomStatuses.nda_signed, muteNda, false)}
                    <HLine muted={muteNda} />
                    {renderFlexNode(dataRoomStage, dataRoomStatuses.data_room_access, muteNda, false)}
                  </div>
                </div>
              </div>
            )}

            {/* Main row with shared stages and fork/merge points */}
            <div
              className="grid items-center"
              style={{ gridTemplateColumns }}
            >
              <div style={{ gridColumn: 1 }}>{renderFlexNode(receivedStage, sharedStatuses.received)}</div>
              <div style={{ gridColumn: 2 }}><HLine /></div>
              <div style={{ gridColumn: 3 }}>{renderFlexNode(viewedStage, sharedStatuses.viewed)}</div>
              <div style={{ gridColumn: 4 }}><HLine /></div>

              {/* Fork point with vertical connectors */}
              <div className="relative flex items-center justify-center w-4 h-8" style={{ gridColumn: 5 }}>
                <div ref={forkRef} className="w-2.5 h-2.5 rounded-full bg-border z-10" />
              </div>

              <div style={{ gridColumn: 6 }}><FlexLine /></div>

              {/* Merge stage with vertical connectors */}
              <div className="justify-self-center" style={{ gridColumn: 7 }}>
                {renderFlexNode(mergeStage, sharedStatuses.subscription_requested, false, true, mergeBubbleRef)}
              </div>

              <div style={{ gridColumn: 8 }}><HLine /></div>

              {/* Post-merge shared stages */}
              <div style={{ gridColumn: 9 }}>{renderFlexNode(packGenStage, sharedStatuses.pack_generated)}</div>
              <div style={{ gridColumn: 10 }}><HLine /></div>
              <div style={{ gridColumn: 11 }}>{renderFlexNode(packSentStage, sharedStatuses.pack_sent)}</div>
              <div style={{ gridColumn: 12 }}><HLine /></div>
              <div style={{ gridColumn: 13 }}>{renderFlexNode(signedStage, sharedStatuses.signed)}</div>
              <div style={{ gridColumn: 14 }}><HLine /></div>
              <div style={{ gridColumn: 15 }}>{renderFlexNode(fundedStage, sharedStatuses.funded)}</div>
              <div style={{ gridColumn: 16 }}><HLine /></div>
              <div style={{ gridColumn: 17 }}>{renderFlexNode(activeStage, sharedStatuses.active)}</div>
            </div>

            {/* Direct Path (bottom row) */}
            {showDirectBranch && (
              <div
                className={cn('grid items-center', muteDirect && 'opacity-40')}
                style={{ gridTemplateColumns }}
              >
                <div className="relative flex items-center justify-center" style={{ gridColumn: '5 / 8' }}>
                  <div ref={directRowRef} className="relative z-10 flex items-center bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mr-3 uppercase tracking-wide shrink-0">Direct</span>
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Direct Subscribe</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const currentRouteStages = stagesForRoute
  const currentRouteIndex = getCurrentIndex(currentRouteStages)
  const currentStageName = currentRouteStages[currentRouteIndex]?.name || 'Not started'

  return (
    <TooltipProvider>
      <div className={cn('w-full space-y-4', className)}>
        {renderSplitBar(getRouteLabel(route))}

        {!compact && route !== 'choose' && (
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Current stage: {currentStageName}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

// Compact version for list cards
export function JourneyProgressBadge({
  currentStage,
  className
}: {
  currentStage: number
  className?: string
}) {
  const stageName = DATA_ROOM_STAGE_ORDER[currentStage - 1]?.name || 'Not Started'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5">
        {DATA_ROOM_STAGE_ORDER.map((stage, index) => (
          <div
            key={stage.key}
            className={cn(
              'w-2 h-2 rounded-full',
              index + 1 <= currentStage
                ? 'bg-emerald-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{stageName}</span>
    </div>
  )
}
