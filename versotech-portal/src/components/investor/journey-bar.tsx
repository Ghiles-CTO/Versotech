'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Mail,
  Eye,
  Heart,
  FileSignature,
  FolderOpen,
  FileText,
  Send,
  PenTool,
  DollarSign,
  CheckCircle2,
  Loader2,
  type LucideIcon
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface JourneyStage {
  stage_number: number
  stage_name: string
  completed_at: string | null
  is_current: boolean
}

interface JourneyBarProps {
  dealId: string
  investorId: string
  className?: string
  compact?: boolean
}

const STAGE_ICONS: Record<number, LucideIcon> = {
  1: Mail,           // Received
  2: Eye,            // Viewed
  3: Heart,          // Interest Confirmed
  4: FileSignature,  // NDA Signed
  5: FolderOpen,     // Data Room Access
  6: FileText,       // Pack Generated
  7: Send,           // Pack Sent
  8: PenTool,        // Signed
  9: DollarSign,     // Funded
  10: CheckCircle2,  // Active
}

const STAGE_COLORS = {
  completed: 'bg-green-500 text-white border-green-500',
  current: 'bg-blue-500 text-white border-blue-500 ring-2 ring-blue-300 ring-offset-2',
  pending: 'bg-muted text-muted-foreground border-muted-foreground/30',
  skipped: 'bg-muted/50 text-muted-foreground/50 border-dashed border-muted-foreground/30',
}

const LINE_COLORS = {
  completed: 'bg-green-500',
  pending: 'bg-muted-foreground/30',
}

export function JourneyBar({ dealId, investorId, className, compact = false }: JourneyBarProps) {
  const [stages, setStages] = useState<JourneyStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJourneyStages() {
      try {
        setLoading(true)
        const response = await fetch(`/api/investors/me/journey?dealId=${dealId}&investorId=${investorId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch journey stages')
        }

        const data = await response.json()
        setStages(data.stages || [])
        setError(null)
      } catch (err) {
        console.error('Failed to fetch journey stages:', err)
        setError(err instanceof Error ? err.message : 'Failed to load journey')
      } finally {
        setLoading(false)
      }
    }

    if (dealId && investorId) {
      fetchJourneyStages()
    }
  }, [dealId, investorId])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading journey...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('text-sm text-destructive py-4', className)}>
        {error}
      </div>
    )
  }

  if (stages.length === 0) {
    return null
  }

  // Determine current stage index for rendering
  const currentStageIndex = stages.findIndex(s => s.is_current)

  // Check if investor has progressed past early stages (for skip logic)
  const hasLaterStageCompleted = (stageNumber: number) => {
    return stages.some(s => s.stage_number > stageNumber && s.completed_at !== null)
  }

  const getStageStatus = (stage: JourneyStage, index: number) => {
    if (stage.completed_at) return 'completed'
    if (stage.is_current) return 'current'

    // Check if this stage was skipped (earlier stages with later stages completed)
    if (hasLaterStageCompleted(stage.stage_number)) {
      return 'skipped'
    }

    return 'pending'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (compact) {
    // Compact version - just icons in a row
    return (
      <TooltipProvider>
        <div className={cn('flex items-center gap-1', className)}>
          {stages.map((stage, index) => {
            const Icon: LucideIcon = STAGE_ICONS[stage.stage_number] || CheckCircle2
            const status = getStageStatus(stage, index)

            return (
              <Tooltip key={stage.stage_number}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center border transition-all',
                      status === 'completed' && 'bg-green-500 text-white border-green-500',
                      status === 'current' && 'bg-blue-500 text-white border-blue-500',
                      status === 'pending' && 'bg-muted text-muted-foreground border-muted-foreground/30',
                      status === 'skipped' && 'bg-muted/50 text-muted-foreground/50 border-dashed'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-medium">{stage.stage_name}</p>
                    {stage.completed_at && (
                      <p className="text-muted-foreground">{formatDate(stage.completed_at)}</p>
                    )}
                    {status === 'skipped' && (
                      <p className="text-muted-foreground italic">Skipped</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
    )
  }

  // Full version - with labels and connecting lines
  return (
    <TooltipProvider>
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between relative">
          {stages.map((stage, index) => {
            const Icon: LucideIcon = STAGE_ICONS[stage.stage_number] || CheckCircle2
            const status = getStageStatus(stage, index)
            const isFirst = index === 0
            const isLast = index === stages.length - 1

            return (
              <div key={stage.stage_number} className="flex flex-col items-center relative flex-1">
                {/* Connecting line before */}
                {!isFirst && (
                  <div
                    className={cn(
                      'absolute top-5 right-1/2 w-full h-0.5 -z-10',
                      stage.completed_at || status === 'skipped' ? LINE_COLORS.completed : LINE_COLORS.pending
                    )}
                  />
                )}

                {/* Connecting line after */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute top-5 left-1/2 w-full h-0.5 -z-10',
                      stages[index + 1]?.completed_at || getStageStatus(stages[index + 1], index + 1) === 'skipped'
                        ? LINE_COLORS.completed
                        : LINE_COLORS.pending
                    )}
                  />
                )}

                {/* Stage circle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer z-10 bg-background',
                        STAGE_COLORS[status]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">Stage {stage.stage_number}: {stage.stage_name}</p>
                      {stage.completed_at && (
                        <p className="text-muted-foreground">{formatDate(stage.completed_at)}</p>
                      )}
                      {status === 'current' && !stage.completed_at && (
                        <p className="text-blue-400">In Progress</p>
                      )}
                      {status === 'skipped' && (
                        <p className="text-muted-foreground italic">Skipped</p>
                      )}
                      {status === 'pending' && (
                        <p className="text-muted-foreground">Pending</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Stage label */}
                <span
                  className={cn(
                    'text-xs mt-2 text-center max-w-[60px] leading-tight',
                    status === 'completed' && 'text-green-600 dark:text-green-400 font-medium',
                    status === 'current' && 'text-blue-600 dark:text-blue-400 font-medium',
                    status === 'pending' && 'text-muted-foreground',
                    status === 'skipped' && 'text-muted-foreground/50 line-through'
                  )}
                >
                  {stage.stage_name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

/**
 * Simplified journey bar that receives stages directly (no API call)
 */
interface JourneyBarStaticProps {
  stages: JourneyStage[]
  className?: string
  compact?: boolean
}

export function JourneyBarStatic({ stages, className, compact = false }: JourneyBarStaticProps) {
  if (stages.length === 0) {
    return null
  }

  // Check if investor has progressed past early stages (for skip logic)
  const hasLaterStageCompleted = (stageNumber: number) => {
    return stages.some(s => s.stage_number > stageNumber && s.completed_at !== null)
  }

  const getStageStatus = (stage: JourneyStage) => {
    if (stage.completed_at) return 'completed'
    if (stage.is_current) return 'current'
    if (hasLaterStageCompleted(stage.stage_number)) return 'skipped'
    return 'pending'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn('flex items-center gap-1', className)}>
          {stages.map((stage) => {
            const Icon: LucideIcon = STAGE_ICONS[stage.stage_number] || CheckCircle2
            const status = getStageStatus(stage)

            return (
              <Tooltip key={stage.stage_number}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center border transition-all',
                      status === 'completed' && 'bg-green-500 text-white border-green-500',
                      status === 'current' && 'bg-blue-500 text-white border-blue-500',
                      status === 'pending' && 'bg-muted text-muted-foreground border-muted-foreground/30',
                      status === 'skipped' && 'bg-muted/50 text-muted-foreground/50 border-dashed'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-medium">{stage.stage_name}</p>
                    {stage.completed_at && (
                      <p className="text-muted-foreground">{formatDate(stage.completed_at)}</p>
                    )}
                    {status === 'skipped' && (
                      <p className="text-muted-foreground italic">Skipped</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
    )
  }

  // Full version
  return (
    <TooltipProvider>
      <div className={cn('w-full', className)}>
        <div className="flex items-center justify-between relative">
          {stages.map((stage, index) => {
            const Icon: LucideIcon = STAGE_ICONS[stage.stage_number] || CheckCircle2
            const status = getStageStatus(stage)
            const isFirst = index === 0
            const isLast = index === stages.length - 1

            return (
              <div key={stage.stage_number} className="flex flex-col items-center relative flex-1">
                {!isFirst && (
                  <div
                    className={cn(
                      'absolute top-5 right-1/2 w-full h-0.5 -z-10',
                      stage.completed_at || status === 'skipped' ? LINE_COLORS.completed : LINE_COLORS.pending
                    )}
                  />
                )}

                {!isLast && (
                  <div
                    className={cn(
                      'absolute top-5 left-1/2 w-full h-0.5 -z-10',
                      stages[index + 1]?.completed_at || getStageStatus(stages[index + 1]) === 'skipped'
                        ? LINE_COLORS.completed
                        : LINE_COLORS.pending
                    )}
                  />
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer z-10 bg-background',
                        STAGE_COLORS[status]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">Stage {stage.stage_number}: {stage.stage_name}</p>
                      {stage.completed_at && (
                        <p className="text-muted-foreground">{formatDate(stage.completed_at)}</p>
                      )}
                      {status === 'current' && !stage.completed_at && (
                        <p className="text-blue-400">In Progress</p>
                      )}
                      {status === 'skipped' && (
                        <p className="text-muted-foreground italic">Skipped</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>

                <span
                  className={cn(
                    'text-xs mt-2 text-center max-w-[60px] leading-tight',
                    status === 'completed' && 'text-green-600 dark:text-green-400 font-medium',
                    status === 'current' && 'text-blue-600 dark:text-blue-400 font-medium',
                    status === 'pending' && 'text-muted-foreground',
                    status === 'skipped' && 'text-muted-foreground/50 line-through'
                  )}
                >
                  {stage.stage_name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
