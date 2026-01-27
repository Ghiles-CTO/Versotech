'use client'

import { cn } from '@/lib/utils'
import { Check, Circle, SkipForward } from 'lucide-react'
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
  className?: string
  compact?: boolean
}

// Stage definitions with optional flag
const STAGE_DEFINITIONS = [
  { number: 1, name: 'Received', key: 'received', optional: true },
  { number: 2, name: 'Viewed', key: 'viewed', optional: false },
  { number: 3, name: 'Interest', key: 'interest_confirmed', optional: true },
  { number: 4, name: 'NDA', key: 'nda_signed', optional: true },
  { number: 5, name: 'Data Room', key: 'data_room_access', optional: true },
  { number: 6, name: 'Pack Gen', key: 'pack_generated', optional: false },
  { number: 7, name: 'Pack Sent', key: 'pack_sent', optional: false },
  { number: 8, name: 'Signed', key: 'signed', optional: false },
  { number: 9, name: 'Funded', key: 'funded', optional: false },
  { number: 10, name: 'Active', key: 'active', optional: false },
] as const

type StageStatus = 'completed' | 'current' | 'skipped' | 'pending'

/**
 * Detect if investor took Direct Subscribe path
 * Direct Subscribe: pack_generated is set but interest_confirmed is null
 * This means they skipped the Interest and Data Room stages
 */
function isDirectSubscribePath(summary: JourneySummary): boolean {
  return summary.pack_generated !== null && summary.interest_confirmed === null
}

function getStageStatus(
  stageDef: typeof STAGE_DEFINITIONS[number],
  summary: JourneySummary,
  currentStage: number
): StageStatus {
  const completedAt = summary[stageDef.key as keyof JourneySummary]

  if (completedAt) {
    return 'completed'
  }

  if (stageDef.number === currentStage) {
    return 'current'
  }

  // Special handling for Direct Subscribe path
  // Interest (stage 3) and Data Room (stage 5) are explicitly skipped
  const isDirectPath = isDirectSubscribePath(summary)
  if (isDirectPath) {
    // For Direct Subscribe: Interest and Data Room are skipped
    if (stageDef.number === 3 || stageDef.number === 5) {
      // Only mark as skipped if we're past these stages
      if (currentStage > stageDef.number || summary.pack_generated) {
        return 'skipped'
      }
    }
  }

  // Check if this is an optional stage that was skipped
  // A stage is skipped if it's optional and a later stage is completed
  if (stageDef.optional && stageDef.number < currentStage) {
    return 'skipped'
  }

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

  // Calculate effective current stage if not provided
  const effectiveCurrentStage = currentStage || (() => {
    if (effectiveSummary.active) return 10
    if (effectiveSummary.funded) return 9
    if (effectiveSummary.signed) return 8
    if (effectiveSummary.pack_sent) return 7
    if (effectiveSummary.pack_generated) return 6
    if (effectiveSummary.data_room_access) return 5
    if (effectiveSummary.nda_signed) return 4
    if (effectiveSummary.interest_confirmed) return 3
    if (effectiveSummary.viewed) return 2
    if (effectiveSummary.received) return 1
    return 0
  })()

  return (
    <TooltipProvider>
      <div className={cn('w-full', className)}>
        {/* Progress Bar */}
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />

          {/* Progress line */}
          <div
            className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.max(0, (effectiveCurrentStage - 1) / 9) * 100}%` }}
          />

          {/* Stage indicators */}
          <div className="relative flex justify-between">
            {STAGE_DEFINITIONS.map((stageDef) => {
              const status = getStageStatus(stageDef, effectiveSummary, effectiveCurrentStage)
              const completedAt = effectiveSummary[stageDef.key as keyof JourneySummary]

              return (
                <Tooltip key={stageDef.number}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                      {/* Stage circle */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                          status === 'completed' && 'bg-emerald-500 text-white',
                          status === 'current' && 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900',
                          status === 'skipped' && 'bg-muted text-muted-foreground',
                          status === 'pending' && 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {status === 'completed' ? (
                          <Check className="w-4 h-4" />
                        ) : status === 'skipped' ? (
                          <SkipForward className="w-3 h-3" />
                        ) : (
                          <span className="text-xs font-medium">{stageDef.number}</span>
                        )}
                      </div>

                      {/* Stage label */}
                      {!compact && (
                        <span
                          className={cn(
                            'mt-2 text-xs font-medium text-center max-w-[60px] leading-tight',
                            status === 'completed' && 'text-emerald-600 dark:text-emerald-400',
                            status === 'current' && 'text-blue-600 dark:text-blue-400',
                            status === 'skipped' && 'text-muted-foreground',
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
                      {status === 'skipped' && (
                        <div className="text-xs text-muted-foreground mt-1">Skipped (optional)</div>
                      )}
                      {status === 'pending' && (
                        <div className="text-xs text-muted-foreground mt-1">Pending</div>
                      )}
                      {stageDef.optional && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Optional stage
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Stage summary text */}
        {!compact && (
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">
              {effectiveCurrentStage === 0 && 'Not started'}
              {effectiveCurrentStage === 1 && 'Opportunity received'}
              {effectiveCurrentStage === 2 && 'Viewed opportunity'}
              {effectiveCurrentStage === 3 && 'Interest confirmed'}
              {effectiveCurrentStage === 4 && 'NDA signed'}
              {effectiveCurrentStage === 5 && 'Data room access granted'}
              {effectiveCurrentStage === 6 && 'Subscription pack generated'}
              {effectiveCurrentStage === 7 && 'Subscription pack sent for signing'}
              {effectiveCurrentStage === 8 && 'Subscription signed'}
              {effectiveCurrentStage === 9 && 'Investment funded'}
              {effectiveCurrentStage === 10 && 'Investment active'}
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
  const stageName = STAGE_DEFINITIONS[currentStage - 1]?.name || 'Not Started'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5">
        {STAGE_DEFINITIONS.map((stage) => (
          <div
            key={stage.number}
            className={cn(
              'w-2 h-2 rounded-full',
              stage.number <= currentStage
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
