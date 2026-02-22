import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OverviewFieldGridProps {
  children: ReactNode
  className?: string
  columns?: 2 | 3
}

export function OverviewFieldGrid({ children, className, columns = 2 }: OverviewFieldGridProps) {
  const columnsClass =
    columns === 3 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'

  return <div className={cn('grid gap-4', columnsClass, className)}>{children}</div>
}

export interface OverviewFieldProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  className?: string
  valueClassName?: string
  emptyText?: string
}

export function OverviewField({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
  emptyText = '-',
}: OverviewFieldProps) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    !(typeof value === 'string' && value.trim().length === 0)

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={cn('text-sm font-medium break-words', valueClassName)}>
        <span className="inline-flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
          {hasValue ? value : emptyText}
        </span>
      </div>
    </div>
  )
}
