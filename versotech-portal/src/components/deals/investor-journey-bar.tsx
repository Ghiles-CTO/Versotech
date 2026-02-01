'use client'

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

const DATA_ROOM_STAGES: StageDefinition[] = [
  { name: 'Received', key: 'received', index: 1 },
  { name: 'Viewed', key: 'viewed', index: 2 },
  { name: 'Access Request', key: 'interest_confirmed', index: 3 },
  { name: 'NDA Signed', key: 'nda_signed', index: 4 },
  { name: 'Data Room', key: 'data_room_access', index: 5 },
  { name: 'Pack Gen', key: 'pack_generated', index: 6 },
  { name: 'Pack Sent', key: 'pack_sent', index: 7 },
  { name: 'Signed', key: 'signed', index: 8 },
  { name: 'Funded', key: 'funded', index: 9 },
  { name: 'Active', key: 'active', index: 10 }
]

const DIRECT_SUBSCRIBE_STAGES: StageDefinition[] = [
  { name: 'Received', key: 'received', index: 1 },
  { name: 'Viewed', key: 'viewed', index: 2 },
  { name: 'Subscribe Request', key: 'subscription_requested', index: 3 },
  { name: 'Pack Gen', key: 'pack_generated', index: 6 },
  { name: 'Pack Sent', key: 'pack_sent', index: 7 },
  { name: 'Signed', key: 'signed', index: 8 },
  { name: 'Funded', key: 'funded', index: 9 },
  { name: 'Active', key: 'active', index: 10 }
]

const CHOOSE_STAGES: StageDefinition[] = [
  { name: 'Received', key: 'received', index: 1 },
  { name: 'Viewed', key: 'viewed', index: 2 },
  { name: 'Choose Path', key: 'subscription_requested', index: 3 },
  { name: 'Pack Gen', key: 'pack_generated', index: 6 },
  { name: 'Pack Sent', key: 'pack_sent', index: 7 },
  { name: 'Signed', key: 'signed', index: 8 },
  { name: 'Funded', key: 'funded', index: 9 },
  { name: 'Active', key: 'active', index: 10 }
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
  if (route === 'direct_subscribe') return 'Direct Subscription (No NDA)'
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

  const extendedSummary: ExtendedSummary = {
    ...effectiveSummary,
    subscription_requested: subscriptionSubmittedAt || null
  }

  const route = detectRoute(effectiveSummary, subscriptionSubmittedAt)
  const stagesForRoute =
    route === 'direct_subscribe'
      ? DIRECT_SUBSCRIBE_STAGES
      : route === 'choose'
        ? CHOOSE_STAGES
        : DATA_ROOM_STAGES
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

  const dataRoomStatuses = buildStatusMap(DATA_ROOM_STAGES)
  const directStatuses = buildStatusMap(DIRECT_SUBSCRIBE_STAGES)
  const chooseStatuses = buildStatusMap(CHOOSE_STAGES)
  const sharedStatuses = route === 'data_room'
    ? dataRoomStatuses
    : route === 'direct_subscribe'
      ? directStatuses
      : chooseStatuses

  const renderNode = (
    stageDef: StageDefinition,
    status: StageStatus,
    column: number,
    muted = false
  ) => {
    const completedAt = extendedSummary[stageDef.key]
    return (
      <Tooltip key={`node-${stageDef.key}-${column}`}>
        <TooltipTrigger asChild>
          <div
            className={cn('flex flex-col items-center', muted && 'opacity-40')}
            style={{ gridColumn: column }}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                status === 'completed' && 'bg-emerald-500 text-white',
                status === 'current' && 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900',
                status === 'pending' && 'bg-muted/50 text-muted-foreground'
              )}
            >
              {status === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs font-medium">{stageDef.index}</span>
              )}
            </div>

            {showRouteLabels && (
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-[70px] leading-tight',
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

  const renderSplitBar = (label: string) => {
    const columns = 10
    const rowHeight = 32
    const rowGap = 20
    const layoutHeight = rowHeight * 3 + rowGap * 2
    const row1Y = rowHeight / 2
    const row2Y = rowHeight + rowGap + rowHeight / 2
    const row3Y = rowHeight * 2 + rowGap * 2 + rowHeight / 2

    const colX = (col: number) => ((col - 1) / (columns - 1)) * 100

    const sharedStage = (key: SummaryKey) =>
      DATA_ROOM_STAGES.find(stage => stage.key === key) || CHOOSE_STAGES.find(stage => stage.key === key)

    const ndaStage = (key: SummaryKey) =>
      DATA_ROOM_STAGES.find(stage => stage.key === key)

    const directStage = (key: SummaryKey) =>
      DIRECT_SUBSCRIBE_STAGES.find(stage => stage.key === key) || CHOOSE_STAGES.find(stage => stage.key === key)

    const receivedStage = sharedStage('received')
    const viewedStage = sharedStage('viewed')
    const packGenStage = sharedStage('pack_generated')
    const packSentStage = sharedStage('pack_sent')
    const signedStage = sharedStage('signed')
    const fundedStage = sharedStage('funded')
    const activeStage = sharedStage('active')

    const accessStage = ndaStage('interest_confirmed')
    const ndaSignedStage = ndaStage('nda_signed')
    const dataRoomStage = ndaStage('data_room_access')

    const subscribeStage = directStage('subscription_requested')

    const muteDirect = route === 'data_room'
    const muteNda = route === 'direct_subscribe'

    return (
      <div className="space-y-3">
        {showRouteLabels && (
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        )}
        <div className="relative" style={{ height: layoutHeight }}>
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 100 ${layoutHeight}`}
            preserveAspectRatio="none"
          >
            <line x1={colX(1)} y1={row1Y} x2={colX(2)} y2={row1Y} stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1={colX(6)} y1={row1Y} x2={colX(10)} y2={row1Y} stroke="hsl(var(--border))" strokeWidth="2" />

            <line x1={colX(2)} y1={row1Y} x2={colX(2)} y2={row3Y} stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1={colX(6)} y1={row1Y} x2={colX(6)} y2={row3Y} stroke="hsl(var(--border))" strokeWidth="2" />

            <line x1={colX(2)} y1={row2Y} x2={colX(6)} y2={row2Y} stroke="hsl(var(--border))" strokeWidth="2" />
            <line x1={colX(2)} y1={row3Y} x2={colX(6)} y2={row3Y} stroke="hsl(var(--border))" strokeWidth="2" />
          </svg>

          <div className="relative grid gap-5" style={{ gridTemplateRows: `repeat(3, ${rowHeight}px)` }}>
            <div className="grid items-center" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {receivedStage && renderNode(receivedStage, sharedStatuses.received, 1)}
              {viewedStage && renderNode(viewedStage, sharedStatuses.viewed, 2)}
              {packGenStage && renderNode(packGenStage, sharedStatuses.pack_generated, 6)}
              {packSentStage && renderNode(packSentStage, sharedStatuses.pack_sent, 7)}
              {signedStage && renderNode(signedStage, sharedStatuses.signed, 8)}
              {fundedStage && renderNode(fundedStage, sharedStatuses.funded, 9)}
              {activeStage && renderNode(activeStage, sharedStatuses.active, 10)}
            </div>

            <div className="grid items-center" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {!compact && (
                <div className="text-[10px] text-muted-foreground uppercase" style={{ gridColumn: '1 / 3' }}>
                  NDA path
                </div>
              )}
              {accessStage && renderNode(accessStage, dataRoomStatuses.interest_confirmed, 3, muteNda)}
              {ndaSignedStage && renderNode(ndaSignedStage, dataRoomStatuses.nda_signed, 4, muteNda)}
              {dataRoomStage && renderNode(dataRoomStage, dataRoomStatuses.data_room_access, 5, muteNda)}
            </div>

            <div className="grid items-center" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {!compact && (
                <div className="text-[10px] text-muted-foreground uppercase" style={{ gridColumn: '1 / 3' }}>
                  Direct subscribe
                </div>
              )}
              {subscribeStage && renderNode(subscribeStage, directStatuses.subscription_requested, 4, muteDirect)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentRouteStages = stagesForRoute
  const currentRouteIndex = getCurrentIndex(currentRouteStages)
  const currentStageName = currentRouteStages[currentRouteIndex]?.name || 'Not started'
  const splitKey = route === 'data_room' ? 'interest_confirmed' : 'subscription_requested'
  const splitIndex = Math.max(0, currentRouteStages.findIndex(stage => stage.key === splitKey))
  const splitColumnStart = splitIndex + 1
  const splitColumnEnd = Math.min(currentRouteStages.length + 1, splitColumnStart + 3)

  return (
    <TooltipProvider>
      <div className={cn('w-full space-y-4', className)}>
        {renderSplitBar(getRouteLabel(route))}

        {!compact && (
          <div
            className="grid gap-2 text-[10px] text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${currentRouteStages.length}, minmax(0, 1fr))` }}
          >
            {(route === 'direct_subscribe' || route === 'choose') && (
              <div
                className="flex items-center justify-center gap-1"
                style={{ gridColumn: `${splitColumnStart} / ${splitColumnEnd}`, gridRow: 1 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                <span>NDA path: Access → NDA → Data Room</span>
              </div>
            )}
            {(route === 'data_room' || route === 'choose') && (
              <div
                className="flex items-center justify-center gap-1"
                style={{ gridColumn: `${splitColumnStart} / ${splitColumnStart + 1}`, gridRow: 2 }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                <span>Direct subscribe (no NDA)</span>
              </div>
            )}
          </div>
        )}

        {!compact && route !== 'choose' && (
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              {getRouteLabel(route)} • Current stage: {currentStageName}
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
  const stageName = DATA_ROOM_STAGES[currentStage - 1]?.name || 'Not Started'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5">
        {DATA_ROOM_STAGES.map((stage, index) => (
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
