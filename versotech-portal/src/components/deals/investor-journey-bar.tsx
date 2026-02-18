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

type SummaryKey = keyof JourneySummary | 'subscription_requested'
type StageStatus = 'completed' | 'current' | 'pending'

interface StageDefinition {
  name: string
  key: SummaryKey
  index: number
}

interface ExtendedSummary extends JourneySummary {
  subscription_requested: string | null
}

const LINEAR_STAGES: StageDefinition[] = [
  { name: 'Viewed',                    key: 'viewed',                 index: 1 },
  { name: 'Confirm Interest',          key: 'subscription_requested', index: 2 },
  { name: 'Subscription Pack Signed',  key: 'signed',                 index: 3 },
  { name: 'Funded',                    key: 'funded',                 index: 4 },
  { name: 'Completed',                 key: 'active',                 index: 5 },
]

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function InvestorJourneyBar({
  stages,
  summary,
  subscriptionSubmittedAt,
  className,
  compact = false,
}: InvestorJourneyBarProps) {
  const effectiveSummary: JourneySummary = summary || (stages ? {
    received:           stages.find(s => s.stage_number === 1)?.completed_at  || null,
    viewed:             stages.find(s => s.stage_number === 2)?.completed_at  || null,
    interest_confirmed: stages.find(s => s.stage_number === 3)?.completed_at  || null,
    nda_signed:         stages.find(s => s.stage_number === 4)?.completed_at  || null,
    data_room_access:   stages.find(s => s.stage_number === 5)?.completed_at  || null,
    pack_generated:     stages.find(s => s.stage_number === 6)?.completed_at  || null,
    pack_sent:          stages.find(s => s.stage_number === 7)?.completed_at  || null,
    signed:             stages.find(s => s.stage_number === 8)?.completed_at  || null,
    funded:             stages.find(s => s.stage_number === 9)?.completed_at  || null,
    active:             stages.find(s => s.stage_number === 10)?.completed_at || null,
  } : {
    received: null, viewed: null, interest_confirmed: null, nda_signed: null,
    data_room_access: null, pack_generated: null, pack_sent: null,
    signed: null, funded: null, active: null,
  })

  const extendedSummary: ExtendedSummary = {
    ...effectiveSummary,
    subscription_requested:
      subscriptionSubmittedAt ||
      effectiveSummary.pack_generated ||
      effectiveSummary.pack_sent ||
      effectiveSummary.signed ||
      effectiveSummary.funded ||
      effectiveSummary.active ||
      null,
  }

  // Determine which step is "current" (first not-yet-completed step)
  let lastCompleted = -1
  LINEAR_STAGES.forEach((stage, idx) => {
    if (extendedSummary[stage.key]) lastCompleted = idx
  })
  const currentIndex =
    lastCompleted === -1 ? 0
    : lastCompleted >= LINEAR_STAGES.length - 1 ? LINEAR_STAGES.length - 1
    : lastCompleted + 1

  const getStatus = (stage: StageDefinition, idx: number): StageStatus => {
    if (extendedSummary[stage.key]) return 'completed'
    if (lastCompleted > idx) return 'completed' // a later step is done, so treat this as done too
    if (idx === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <TooltipProvider>
      <div className={cn('w-full', className)}>
        <div className="flex items-start">
          {LINEAR_STAGES.map((stage, idx) => {
            const isLast = idx === LINEAR_STAGES.length - 1
            const status = getStatus(stage, idx)
            const completedAt = extendedSummary[stage.key]
            const prevCompleted = idx > 0 && !!extendedSummary[LINEAR_STAGES[idx - 1].key]

            return (
              <div key={stage.key} className={cn('flex items-start', !isLast && 'flex-1')}>
                {/* Node */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                          status === 'completed' && 'bg-emerald-500 text-white',
                          status === 'current'   && 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900',
                          status === 'pending'   && 'bg-muted/60 text-muted-foreground border border-border'
                        )}
                      >
                        {status === 'completed' ? (
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          <span className="text-xs font-semibold">{stage.index}</span>
                        )}
                      </div>
                      {!compact && (
                        <span
                          className={cn(
                            'mt-2 text-[11px] font-medium text-center leading-snug whitespace-normal break-words max-w-[72px]',
                            status === 'completed' && 'text-emerald-600 dark:text-emerald-400',
                            status === 'current'   && 'text-blue-600 dark:text-blue-400',
                            status === 'pending'   && 'text-muted-foreground'
                          )}
                        >
                          {stage.name}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[180px]">
                    <div className="text-sm">
                      <div className="font-medium">{stage.name}</div>
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

                {/* Connector line to next node — sits at bubble centre height */}
                {!isLast && (
                  <div className="flex-1 mt-4 h-0.5">
                    <div className={cn(
                      'h-full w-full transition-colors duration-300',
                      prevCompleted ? 'bg-emerald-400' : 'bg-border'
                    )} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

// Compact dot-strip badge for list cards
export function JourneyProgressBadge({
  currentStage,
  className,
}: {
  currentStage: number
  className?: string
}) {
  const stageName = LINEAR_STAGES[currentStage - 1]?.name || 'Not Started'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5">
        {LINEAR_STAGES.map((stage, index) => (
          <div
            key={stage.key}
            className={cn(
              'w-2 h-2 rounded-full',
              index + 1 <= currentStage ? 'bg-emerald-500' : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{stageName}</span>
    </div>
  )
}
