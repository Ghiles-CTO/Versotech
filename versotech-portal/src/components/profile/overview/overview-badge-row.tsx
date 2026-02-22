import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface OverviewBadgeRowProps {
  children: ReactNode
  className?: string
}

export function OverviewBadgeRow({ children, className }: OverviewBadgeRowProps) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
}
