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
}

const DATA_ROOM_STAGES: StageDefinition[] = [
  { name: 'Received', key: 'received' },
  { name: 'Viewed', key: 'viewed' },
  { name: 'Access Request', key: 'interest_confirmed' },
  { name: 'NDA Signed', key: 'nda_signed' },
  { name: 'Data Room', key: 'data_room_access' },
  { name: 'Pack Gen', key: 'pack_generated' },
  { name: 'Pack Sent', key: 'pack_sent' },
  { name: 'Signed', key: 'signed' },
  { name: 'Funded', key: 'funded' },
  { name: 'Active', key: 'active' }
]

const DIRECT_SUBSCRIBE_STAGES: StageDefinition[] = [
  { name: 'Received', key: 'received' },
  { name: 'Viewed', key: 'viewed' },
  { name: 'Subscribe Request', key: 'subscription_requested' },
  { name: 'Pack Gen', key: 'pack_generated' },
  { name: 'Pack Sent', key: 'pack_sent' },
  { name: 'Signed', key: 'signed' },
  { name: 'Funded', key: 'funded' },
  { name: 'Active', key: 'active' }
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
  if (route === 'data_room') return 'Data Room Route'
  if (route === 'direct_subscribe') return 'Direct Subscribe Route (No NDA)'
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
  const stagesForRoute = route === 'direct_subscribe' ? DIRECT_SUBSCRIBE_STAGES : DATA_ROOM_STAGES

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

  const renderRouteBar = (stageList: StageDefinition[], label: string) => {
    const currentIndex = getCurrentIndex(stageList)
    const lastCompletedIndex = Math.max(currentIndex - 1, 0)
    const progressWidth = stageList.length > 1
      ? (lastCompletedIndex / (stageList.length - 1)) * 100
      : 0

    return (
      <div className="space-y-3">
        {!compact && (
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        )}
        <div className="relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(progressWidth, 100))}%` }}
          />
          <div className="relative flex justify-between">
            {stageList.map((stageDef, index) => {
              const status = getStageStatus(stageDef, extendedSummary, currentIndex, index)
              const completedAt = extendedSummary[stageDef.key]

              return (
                <Tooltip key={`${label}-${stageDef.key}`}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
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
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>

                      {!compact && (
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
            })}
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
        {route === 'choose' ? (
          <div className="space-y-4">
            {renderRouteBar(DATA_ROOM_STAGES, 'Data Room Access')}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {renderRouteBar(DIRECT_SUBSCRIBE_STAGES, 'Direct Subscribe')}
          </div>
        ) : (
          renderRouteBar(currentRouteStages, getRouteLabel(route))
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
