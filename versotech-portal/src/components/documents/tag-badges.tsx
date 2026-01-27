'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagBadgesProps {
  /** Array of tag strings to display */
  tags: string[] | null | undefined
  /** Maximum number of visible tags before showing overflow (default: 2) */
  maxVisible?: number
  /** Additional className for the container */
  className?: string
  /** Size variant for badges */
  size?: 'default' | 'sm'
}

/**
 * TagBadges - Display document tags with overflow handling
 *
 * Features:
 * - Shows up to maxVisible tags as badges
 * - Shows "+N" badge for overflow with tooltip listing all hidden tags
 * - Returns null for empty/null tags (no visual output)
 *
 * Design: Subtle, professional tag badges with consistent colors
 */
export function TagBadges({
  tags,
  maxVisible = 2,
  className,
  size = 'default',
}: TagBadgesProps) {
  // Return null for empty tags - acceptance criteria: "Empty tags = show nothing"
  if (!tags || tags.length === 0) {
    return null
  }

  const visibleTags = tags.slice(0, maxVisible)
  const overflowTags = tags.slice(maxVisible)
  const hasOverflow = overflowTags.length > 0

  const badgeClasses = cn(
    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
    size === 'sm' ? 'text-[10px] py-0 px-1.5' : 'text-xs'
  )

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {visibleTags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="outline"
          className={badgeClasses}
        >
          <Tag className={cn('mr-1', size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} strokeWidth={2} />
          {tag}
        </Badge>
      ))}

      {hasOverflow && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  badgeClasses,
                  'cursor-default hover:bg-slate-100 dark:hover:bg-slate-700/50'
                )}
              >
                +{overflowTags.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs"
            >
              <p className="text-xs font-medium mb-1">All tags:</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span
                    key={`tooltip-${tag}-${index}`}
                    className="inline-flex items-center gap-1 text-xs bg-background/50 px-1.5 py-0.5 rounded"
                  >
                    <Tag className="w-2.5 h-2.5" strokeWidth={2} />
                    {tag}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
