import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ProfileOverviewShellProps {
  children: ReactNode
  className?: string
}

export function ProfileOverviewShell({ children, className }: ProfileOverviewShellProps) {
  return <div className={cn('space-y-6', className)}>{children}</div>
}
